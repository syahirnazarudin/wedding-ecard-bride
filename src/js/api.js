const SUPABASE_URL = "https://afyszapqadjlwukinqyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Wk-1IBaJ4T61Kb_H2DPB-w_cjCWFmiy";
const WISHES_TABLE = "wishes";

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function getSupabaseHeaders(extraHeaders = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extraHeaders,
  };
}

export function hasSupabaseConfig() {
  return isSupabaseConfigured();
}

export async function fetchWishes() {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const endpoint = new URL(`${SUPABASE_URL}/rest/v1/${WISHES_TABLE}`);
  endpoint.searchParams.set("select", "name,message,created_at");
  endpoint.searchParams.set("order", "created_at.desc");

  const response = await fetch(endpoint, {
    headers: getSupabaseHeaders(),
  });

  if (!response.ok) {
    throw new Error("Unable to load wishes");
  }

  return response.json();
}

export async function submitWish(wish) {
  if (!isSupabaseConfigured()) {
    return { ok: true, demo: true };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${WISHES_TABLE}`, {
    method: "POST",
    headers: getSupabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    }),
    body: JSON.stringify({
      name: wish.name,
      message: wish.message,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to submit wish");
  }

  return { ok: true };
}
