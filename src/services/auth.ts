import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  auth_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'reseller' | 'admin' | 'super_admin';
  level: string;
  xp: number;
  sales_count: number;
  company_name: string;
  phone: string;
  province: string;
  address: string;
  avatar_url: string;
  approved: boolean;
  blocked: boolean;
}

export const authService = {
  async login(email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('No user returned');

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) throw new Error('User profile not found');
    if (profile.blocked) throw new Error('Tu cuenta ha sido bloqueada');

    return { user: profile as AuthUser, session: authData.session };
  },

  async register(email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    company_name?: string;
    phone?: string;
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Registration failed');

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        auth_id: authData.user.id,
        email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        company_name: userData.company_name || '',
        phone: userData.phone || '',
        role: 'reseller',
        level: 'basic',
        approved: false,
        blocked: false,
      }])
      .select()
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);

    return { user: profile as AuthUser };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return session;
  },

  async getProfile(authId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as AuthUser | null;
  },

  async updateProfile(userId: string, updates: Partial<AuthUser>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as AuthUser;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
