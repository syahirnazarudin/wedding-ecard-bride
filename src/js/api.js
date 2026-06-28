const SUPABASE_URL = "https://afyszapqadjlwukinqyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Wk-1IBaJ4T61Kb_H2DPB-w_cjCWFmiy";
const WISHES_TABLE = "wishesbride";
const RSVPS_TABLE = "rsvps";

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

async function getSupabaseError(response, fallbackMessage) {
  let detail = "";

  try {
    const errorBody = await response.json();
    detail = errorBody.message || errorBody.details || errorBody.hint || "";
  } catch {
    detail = await response.text();
  }

  return new Error(
    detail
      ? `${fallbackMessage}: ${response.status} ${detail}`
      : `${fallbackMessage}: ${response.status}`,
  );
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
    throw await getSupabaseError(response, "Unable to load wishes");
  }

  return response.json();
}

export async function submitWish(wish) {
  if (
    !wish.name ||
    !wish.message ||
    wish.name.length > 50 ||
    wish.message.length > 300
  ) {
    throw new Error("Invalid wish payload");
  }

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
    throw await getSupabaseError(response, "Unable to submit wish");
  }

  return { ok: true };
}

export async function submitRsvp(rsvp) {
  if (
    !rsvp.name ||
    rsvp.name.length > 50 ||
    !/^\d{1,12}$/.test(rsvp.phone) ||
    !Number.isInteger(rsvp.pax) ||
    rsvp.pax < 1 ||
    rsvp.pax > 99
  ) {
    throw new Error("Invalid RSVP payload");
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, demo: true };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${RSVPS_TABLE}`, {
    method: "POST",
    headers: getSupabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    }),
    body: JSON.stringify({
      name: rsvp.name,
      phone: rsvp.phone,
      pax: rsvp.pax,
    }),
  });

  if (!response.ok) {
    throw await getSupabaseError(response, "Unable to submit RSVP");
  }

  return { ok: true };
}
