import { supabase } from './supabase';

export async function polishText(rawText, templateId) { // Changed name to Id
  console.log("Magic Brush: Calling Edge Function...");

  const { data, error } = await supabase.functions.invoke('magic-brush', {
    body: { 
      action: 'polish', 
      text: rawText, 
      templateId: templateId // Send ID now
    }
  });

  // FIX: Supabase SDK wraps the real response error. 
  // We need to check if 'data' contains an error message passed from our backend catch block.
  if (error) {
    // This handles network errors (500/504)
    // We try to read the body if it exists to see the real cause
    let message = "Server Connection Failed";
    try {
        // Sometimes the error body is hidden in context
        if (error.context && error.context.json) {
            const body = await error.context.json();
            message = body.error || message;
        } else {
            message = error.message;
        }
    } catch(e) { message = error.message; }
    
    throw new Error(message);
  }

  // Handle the case where we returned status 400 from backend manually
  if (data && data.error) {
    throw new Error(data.error);
  }

  try {
    return JSON.parse(data.result);
  } catch (e) {
    throw new Error("AI response was not valid JSON. Please try again.");
  }
}

export async function generateTemplateFromInput(rawInput) {
  const { data, error } = await supabase.functions.invoke('magic-brush', {
    body: { action: 'generate', rawInput: rawInput }
  });

  if (error) throw new Error(error.message);
  if (data && data.error) throw new Error(data.error);

  return JSON.parse(data.result);
}