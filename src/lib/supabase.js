import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || 'https://vmcnrepbmhcxnonylbtw.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_K92wdH9R8eKNLfwnQeqEiQ_ZX7nWWFI';

// Public browser client (Anon)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// SECURITY: a service-role key must never ship in browser code. The previous build embedded
// one here — it must be rotated in the Supabase dashboard. Admin operations now use the public
// client and are governed by Row Level Security until they move to a server-side endpoint.
export const supabaseAdmin = supabase;

/* ─────────────────────────────────────────────────────────────
   DATA ACCESS HELPERS
───────────────────────────────────────────────────────────── */

// 1. Companies
export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

// 2. Team Members
export async function getTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

// 3. Public Projects
export async function getPublicProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('visibility', 'public')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

// 4. Elite Projects (Members Only)
export async function getEliteProjects() {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*, project_media(*)')
    .eq('visibility', 'elite')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

// 5. All Projects (for Admin Dashboard)
export async function getAllProjectsAdmin() {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getAllProjectsAdmin error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('getAllProjectsAdmin catch:', err);
    return [];
  }
}

// 6. Access Logs
export async function getAccessLogs() {
  const { data, error } = await supabaseAdmin
    .from('access_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}

export async function recordAccessLog(eventType, metadata = {}) {
  try {
    await supabaseAdmin.from('access_logs').insert([
      {
        event_type: eventType,
        ip_address: '127.0.0.1',
        user_agent: navigator?.userAgent || 'Browser',
        metadata,
      },
    ]);
  } catch (err) {
    console.warn('Failed to record access log:', err);
  }
}

// 7. Signed URL Generator for Private Elite Assets
export async function getSignedEliteUrl(path, expirySeconds = 3600) {
  if (!path) return null;
  // If it's already a full HTTP url, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const cleanPath = path.replace(/^elite-assets\//, '');
  const { data, error } = await supabaseAdmin.storage
    .from('elite-assets')
    .createSignedUrl(cleanPath, expirySeconds);
    
  if (error) {
    console.warn('Error creating signed URL:', error.message);
    return null;
  }
  return data?.signedUrl;
}

// 8. Public Asset URL
export function getPublicAssetUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.replace(/^public-assets\//, '');
  const { data } = supabase.storage.from('public-assets').getPublicUrl(cleanPath);
  return data?.publicUrl;
}

// 9. Allowlist Verification & Profile Check
export async function verifyMemberAccess(email) {
  if (!email) return { allowed: false, role: null };
  const normalized = email.trim().toLowerCase();
  
  // Access comes only from the elite_allowlist table. No hardcoded accounts:
  // this file ships to every browser, so any address listed here would be a
  // public key to the admin portal.

  try {
    const { data, error } = await supabaseAdmin
      .from('elite_allowlist')
      .select('*')
      .eq('email', normalized)
      .maybeSingle();
      
    if (error || !data) {
      return { allowed: false, role: null };
    }
    return { allowed: true, role: data.role, note: data.note };
  } catch (err) {
    console.warn('verifyMemberAccess network fallback:', err);
    return { allowed: false, role: null };
  }
}

// 10. Self-Registration for Elite Membership
export async function registerEliteMember(email, name = '', role = 'elite') {
  if (!email) throw new Error('Email address is required.');
  const normalized = email.trim().toLowerCase();

  // Self-registration can only ever create a member, never an admin.
  // Admins are granted from the Studio Ledger by an existing admin.
  role = 'elite';

  try {
    const { data, error } = await supabaseAdmin
      .from('elite_allowlist')
      .upsert(
        {
          email: normalized,
          role: role,
          note: name ? name.trim() : 'Registered Member',
        },
        { onConflict: 'email' }
      )
      .select();

    if (error) {
      console.warn('Supabase upsert note:', error.message);
    }

    try {
      await recordAccessLog('member_registered', { email: normalized, role, name });
    } catch (e) {
      // non-fatal
    }

    return data?.[0] || { email: normalized, role, note: name };
  } catch (err) {
    console.warn('Network issue during registration, granting local session:', err);
    return { email: normalized, role, note: name };
  }
}

