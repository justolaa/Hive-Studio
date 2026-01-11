import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CONFIG
const DAILY_LIMIT = 7; // Your requested limit
const MODEL_PRIORITY = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

// HELPER: Defined outside the main handler for better scope management
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
    const { action, text, rawInput, templateName } = await req.json()
    
    // --- RATE LIMITING ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

    const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey || supabaseKey!)
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // 1. Check Usage
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count } = await supabaseAdmin
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gt('created_at', yesterday.toISOString());

    // 2. Block if limit exceeded
    if (count !== null && count >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ 
        error: `Daily Limit Reached. You have used ${count}/${DAILY_LIMIT} free AI credits today.` 
      }), {
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Log Request (Async)
    supabaseAdmin.from('ai_usage_logs').insert({
      ip_address: clientIp,
      action_type: action
    }).then(); // Fire and forget

    // --- AI LOGIC ---
    const supabase = createClient(supabaseUrl!, supabaseKey!)
    const genAI = new GoogleGenerativeAI(apiKey)

    let prompt = ""
    let inputData = ""

    if (action === 'polish') {
      inputData = text;
      const { data: dividers } = await supabase.from('dividers').select('url, tags')
      const { data: templates } = await supabase.from('templates').select('id, name, category')
      const dividerContext = dividers ? JSON.stringify(dividers) : "[]"
      const templateContext = templates ? JSON.stringify(templates) : "[]"

      prompt = `
        You are an API that outputs ONLY raw JSON. 
        The user is using the "${templateName}" template.
        
        --- BILINGUAL RULES (STRICT) ---
        If the text is in two languages (e.g. English / Spanish):
        1. FIRST PART: Put the English/Primary text. (This will render on the LEFT).
        2. SEPARATOR: Put "---" on a new line.
        3. SECOND PART: Put the Translated/Secondary text. (This will render on the RIGHT).
        4. WRAPPER: Wrap the whole block in [dual] tags.
        5. Be smart to know texts that need quote or heading h1, h2, h3 or paragraph.
        6. A divider should not be put next to another divider.
        
        CORRECT FORMAT (do not use <strong> inside the dual block paragraphs):
        [dual]
        English text paragraph 1... 
        
        English text paragraph 2...
        ---
        Spanish text paragraph 1...
        
        Spanish text paragraph 2...
        [/dual]
        <hr />

        --- DIVIDER IMAGE RULES (VERY STRICT) ---
        You have a specific library of allowed images: ${dividerContext}
        
        1. You MUST select a 'url' strictly from this provided list.
        2. DO NOT invent, guess, or create placeholder URLs (like 'divider.png' or 'image.jpg').
        3. If you detect a specific topic (e.g., Crypto), pick a URL with that tag.
        4. If no specific topic match is found, pick a URL with the 'general' or 'standard' tag.
        5. If the list is empty or you cannot find a match, DO NOT insert an <img> tag. Just use <hr />.

        --- FORMATTING RULES ---
        1. CONTENT: Keep text exactly as provided.
        2. HEADINGS: <h2>Title</h2> (If "Cinephile": <center><h2>Title</h2></center>).
        3. IMAGES: <center><img src="URL" /></center>
        4. INSERTING DIVIDERS: Insert <center><img src="SELECTED_URL_FROM_LIST" /></center> between major topics.
        5. SUGGESTION: Pick best template ID from: ${templateContext}.

        --- REQUIRED OUTPUT FORMAT (JSON ONLY) ---
        {
          "formatted_text": "HTML_STRING",
          "suggested_template_id": "UUID_OR_NULL",
          "suggested_template_name": "NAME_OR_NULL",
          "topic_detected": "STRING"
        }
      `
    } else if (action === 'generate') {
       inputData = rawInput;
       prompt = `Analyze HTML. Output JSON ONLY: { "name": "", "category": "", "container_class": "", "css_code": "", "skeleton": "" }`
    }

    // Call the helper function (Passing genAI instance)
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