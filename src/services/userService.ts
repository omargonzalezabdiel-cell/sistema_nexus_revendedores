import { supabase } from '../lib/supabase';

export interface UserRow {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  level: string;
  xp: number;
  sales_count: number;
  company_name: string;
  address: string;
  province: string;
  approved: boolean;
  blocked: boolean;
  created_at: string;
  updated_at: string;
}

export const userService = {
  async getAllResellers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'reseller')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as UserRow[];
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as UserRow[];
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as UserRow | null;
  },

  async approveUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ approved: true, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as UserRow;
  },

  async blockUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ blocked: true, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as UserRow;
  },

  async unblockUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ blocked: false, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as UserRow;
  },

  async changeRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as UserRow;
  },

  async changeLevel(userId: string, level: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ level, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as UserRow;
  },

  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw new Error(error.message);
  },

  async createAdmin(email: string, password: string, firstName: string, lastName: string) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/create-admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create admin');
    }

    return data.user as UserRow;
  },

  async createReseller(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    companyName?: string,
    phone?: string,
    autoApprove: boolean = false
  ) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/create-reseller`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        phone,
        auto_approve: autoApprove,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create reseller');
    }

    return data.user as UserRow;
  },
};
