import { supabase } from './supabase';

export const logEvent = async (eventName, details = {}) => {
  try {
    // We don't await this. We let it run in the background.
    supabase.from('analytics').insert({
      event_name: eventName,
      template_used: details.template || 'unknown',
      hive_username: details.username || null,
      extra_data: details.meta || {}
    }).then(() => {
      // Silent success
    });
  } catch (e) {
    // Silent fail - never break the app because of analytics
    console.warn("Analytics failed:", e);
  }
};