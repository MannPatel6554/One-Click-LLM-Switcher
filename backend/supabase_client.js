const SUPABASE_URL = 'YOUR_URL_HERE';
const SUPABASE_KEY = 'YOUR_ANON_KEY_HERE';

async function trackSwitch(fromAI, toAI, charCount) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/switch_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ from_ai: fromAI, to_ai: toAI, chars: charCount })
    });
  } catch (e) {
    // Fail silently — tracking optional hai
  }
}

async function checkDailyLimit(userId) {
  // Free user: 10 switches/day
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=plan,switches_today,last_reset`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const [user] = await res.json();
    if (!user) return { allowed: true }; 
    if (user.plan === 'pro') return { allowed: true, limit: Infinity };
    const isToday = user.last_reset === new Date().toISOString().split('T')[0];
    const used = isToday ? user.switches_today : 0;
    return { allowed: used < 10, used, limit: 10 };
  } catch {
    return { allowed: true }; // Supabase down ho to allow karo
  }
}
