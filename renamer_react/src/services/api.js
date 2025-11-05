// ===== services/api.js =====
import axios from 'axios';
import { supabase } from '../lib/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, sign out
      await supabase.auth.signOut();
    }
    return Promise.reject(error);
  }
);

// ===== User Settings API =====
export const userSettingsAPI = {
  // Get user settings
  async get(userId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  // Create or update user settings
  async upsert(userId, settings) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        theme: settings.theme,
        selected_model: settings.selectedModel,
        selected_api_key: settings.selectedApiKey,
        selected_prompt: settings.selectedPrompt,
        custom_prompt: settings.customPrompt,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ===== API Keys API =====
export const apiKeysAPI = {
  // Get all user API keys
  async getAll(userId) {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new API key
  async create(userId, name, value) {
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        key_name: name,
        key_value: value, // In production, encrypt this!
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update API key
  async update(keyId, name, value) {
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        key_name: name,
        key_value: value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', keyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete API key
  async delete(keyId) {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);
    
    if (error) throw error;
  },
};

// ===== Prompts API =====
export const promptsAPI = {
  // Get all user prompts
  async getAll(userId) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new prompt
  async create(userId, name, value) {
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        prompt_name: name,
        prompt_text: value,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update prompt
  async update(promptId, name, value) {
    const { data, error } = await supabase
      .from('prompts')
      .update({
        prompt_name: name,
        prompt_text: value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', promptId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete prompt
  async delete(promptId) {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId);
    
    if (error) throw error;
  },
};

export default api;