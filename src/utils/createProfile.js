import supabase from '../supabaseClient';

/**
 * Ensures a user record exists in the profiles table
 * @param {string} userId - The user's ID
 * @param {object} userData - Optional user data
 * @returns {Promise<object>} - The user profile
 */
export async function ensureUserProfile(userId, userData = {}) {
  if (!userId) {
    console.error('Cannot create profile: No user ID provided');
    return null;
  }
  
  // First check if the profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (existingProfile) {
    // Profile exists, return it
    return existingProfile;
  }
  
  // Profile doesn't exist, create it with minimal data
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        phone: userData.phone || null,
        user_type: userData.user_type || 'student',
        fcm_token: userData.fcm_token || null
      }
    ])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
  
  return newProfile;
}

/**
 * Get user display name from auth.users
 * @param {string} userId - The user's ID 
 * @returns {Promise<string>} - The user's display name
 */
export async function getUserDisplayName(userId) {
  if (!userId) return 'Unknown User';
  
  // Get user data from auth.users via RPC (if available)
  try {
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    
    if (user) {
      // Try to get the name from metadata
      const fullName = user.user_metadata?.full_name;
      if (fullName) return fullName;
      
      // Fall back to email
      return user.email.split('@')[0];
    }
  } catch (error) {
    console.log('Auth admin not available, falling back to session user');
  }
  
  // If we can't get it directly, it might be the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.id === userId) {
    return user.user_metadata?.full_name || user.email.split('@')[0];
  }
  
  return 'User';
}

export default ensureUserProfile; 