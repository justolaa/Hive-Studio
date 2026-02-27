import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CONFIG
const DAILY_LIMIT = 7; 
const MODEL_PRIORITY = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

async function runAIWithFallback(genAI: any, prompt: string, inputData: string) {
  let lastError = null;
  for (const modelName of MODEL_PRIORITY) {
    try {
      console.log(`Attempting with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, inputData]);
      const response = await result.response;
      return response.text(); 
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
    }
  }
  throw lastError || new Error("All AI models failed.");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { action, text, rawInput, templateId, templateName } = await req.json()
    
    // --- RATE LIMITING ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

    const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey || supabaseKey!)
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Check Usage
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count } = await supabaseAdmin
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gt('created_at', yesterday.toISOString());

    if (count !== null && count >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ 
        error: `Daily Limit Reached. You have used ${count}/${DAILY_LIMIT} free AI credits today.` 
      }), {
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    supabaseAdmin.from('ai_usage_logs').insert({
      ip_address: clientIp,
      action_type: action
    }).then(); 

    // --- AI SETUP ---
    const supabase = createClient(supabaseUrl!, supabaseKey!)
    const genAI = new GoogleGenerativeAI(apiKey)

    let prompt = ""
    let inputData = ""

    if (action === 'polish') {
      inputData = text;
      
      const { data: dividers } = await supabase.from('dividers').select('url, tags')
      const { data: templates } = await supabase.from('templates').select('id, name, category, description, ai_prompt')
      
      // 1. TRY FINDING BY ID FIRST (More Robust)
      let activeTemplate = templates?.find(t => t.id === templateId);
      
      // 2. FALLBACK TO NAME IF ID NOT FOUND
      if (!activeTemplate && templateName) {
        activeTemplate = templates?.find(t => t.name === templateName);
      }
      
      // Default name for display/context
      const displayTemplateName = activeTemplate ? activeTemplate.name : (templateName || "Standard");

      let formattingRules = `
        1. CONTENT: Keep text exactly as provided.
        2. HEADINGS: <h2>Title</h2>.
        3. IMAGES: <center><img src="URL" /></center>
      `;

      // 3. APPLY CUSTOM RULES FROM DB (This is the Brain Implant!)
      if (activeTemplate && activeTemplate.ai_prompt) {
        console.log(`Applying Custom Rules for: ${activeTemplate.name}`);
        formattingRules = `
        !!! IMPORTANT: IGNORE DEFAULT RULES. FOLLOW THESE CUSTOM RULES: !!!
        ${activeTemplate.ai_prompt}
        `;
      }

      const dividerContext = dividers ? JSON.stringify(dividers) : "[]"
      const templateContext = templates ? JSON.stringify(templates.map(t => ({id: t.id, name: t.name, category: t.category, description: t.description}))) : "[]"

      prompt = `
        You are an API that outputs ONLY raw JSON. 
        The user is currently using the "${displayTemplateName}" template.


          --- 🛡️ CONTENT INTEGRITY PROTOCOL (SUPREME LAW) ---
        1. DO NOT FIX GRAMMAR. If user writes "I goin store", keep it exactly as is.
        2. DO NOT SUMMARIZE. Never shorten paragraphs.
        3. DO NOT ADD FLUFF. Do not add intro/outro sentences.
        4. PERMITTED EXTRACTION: 
           - You MAY copy headers to build a Table of Contents.
           - You MAY move text items into tables.
           - You MAY move text inside HTML tags.
           - BUT you must NOT change the words themselves.
        
        --- BILINGUAL RULES (STRICT) ---
        If text is bilingual (e.g. English / Spanish):
        1. FIRST PART: English text.
        2. SEPARATOR: "---" on new line.
        3. SECOND PART: Translated text.
        4. WRAPPER: [dual] ... [/dual].
        5. DO NOT use <strong>/ <br> inside paragraphs.
        
        CORRECT:
        [dual]
        English text...
        ---
        Spanish text...
        [/dual]
        <hr />

        --- FORMATTING RULES ---
        ${formattingRules}

        --- DIVIDER IMAGE RULES (AGGRESSIVE MATCHING) ---
        Library: ${dividerContext}
        
        1. KEYWORD MATCHING: 
           - Scan the user's text for keywords.
           - Compare them against the 'tags' arrays in the Library.
           - Example: If text mentions "trees", "hiking", or "sun", MATCH the divider with tags ["nature", "travel"].
           - Example: If text mentions "price", "market", "coins", MATCH the divider with tags ["finance", "crypto"].
        
        2. PRIORITIZE IMAGES: 
           - You MUST prefer an image divider over a standard <hr />.
           - If a specific match is found, use it.
           - If NO specific match is found, look for a divider tagged "general", "standard", or "simple" and use that.
        
        3. PLACEMENT:
           - Insert the divider BEFORE every <h2> Header (except the very first title).
           - Insert the divider AFTER a [dual] block.
        
        4. HTML FORMAT:
           - <center><img src="MATCHED_URL_FROM_LIBRARY" /></center>Insert <center><img src="SELECTED_URL" /></center> between major topics 
           - DO NOT invent URLs. Use the exact URL from the JSON list.(UNLESS Custom Rules say otherwise).

           

        --- SUGGESTION ---
        Templates: ${templateContext}
        Task: Suggest best template ID.

        --- DATA & TABLES --- 
           - If you detect structured data (e.g. lists of prices, scores, comparisons), format it as a Markdown Table.
           - Format: 
             <table>
<thead>
<tr><th>column1</th><th>column2</th><th>column3</th></tr>
</thead>
<tbody>
<tr><td>Data 1</td><td>Data 2</td><td>Data 3</td></tr>
</tbody>
</table>

        OUTPUT JSON ONLY:
        {
          "formatted_text": "HTML_STRING",
          "suggested_template_id": "UUID_OR_NULL",
          "suggested_template_name": "NAME_OR_NULL",
          "topic_detected": "STRING"
        }
      `
    } else if (action === 'generate') {
       inputData = rawInput;
       prompt = `
         You are a Senior Frontend Architect.
         Your goal is to convert raw HTML into a reusable Hive Template JSON.

         INPUT: Raw HTML snippet (often containing inline styles or Hive-specific classes).

         TASK 1: CSS EXTRACTION
         - Look for inline 'style="..."' attributes. Extract them into a CSS class.
         - Look for generic Bootstrap classes.
         - Create a unique container class name (e.g. '.retro-gaming-mode').
         - Write a CLEAN CSS string that targets that class.

         TASK 2: SKELETON CREATION
         - Remove specific content. Replace "My Trip to Paris" with "[Title Here]".
         - Replace specific paragraphs with "[Insert text here...]".
         - Keep the structure (divs, imgs, hrs) intact.
         - If you see an image, replace the src with a placeholder or keep it if it looks like a divider.

         TASK 3: AI RULES GENERATION
         - Analyze the layout. Does it use 'pull-left'? Does it use 'text-center'?
         - Write specific instructions for the AI on how to use this template (e.g., "Alternate images left and right").

          --- CRITICAL RULE FOR "ai_prompt" GENERATION ---
         When writing the 'ai_prompt' field:
         1. You must write instructions for a Layout Engine, NOT a Copywriter.
         2. FORBIDDEN phrases: "Write a summary", "Create a description", "Fill in details".
         3. REQUIRED phrases: "Wrap existing text", "Format headers as", "If user provides data, wrap in...".
         4. If the template has a 'Content Map' or 'Index', instruct the AI to "Extract headers from the user's text to build the index". Do not tell it to invent headers.

         OUTPUT JSON ONLY:
         {
           "name": "Creative Name",
           "category": "Gaming | Crypto | Life",
           "container_class": "unique-class-name",
           "css_code": "CSS string...",
           "skeleton": "HTML string...",
           "ai_prompt": "Instructions for the AI..."
         }
       `
    }

    let outputText = await runAIWithFallback(genAI, prompt, inputData);

    // CLEANUP
    outputText = outputText.replace(/```json/g, '').replace(/```/g, '');
    const firstBrace = outputText.indexOf('{');
    const lastBrace = outputText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      outputText = outputText.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("AI did not return valid JSON.");
    }

    return new Response(JSON.stringify({ result: outputText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const status = error.message?.includes('Limit Reached') ? 429 : 500;
    return new Response(JSON.stringify({ error: error.message || "Server Error" }), {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})