
const SUPABASE_URL = "https://abnlikhuuqlirbmvvaof.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_QCHCOKkgxLnAIuh2IC8jpw_ueNrW83A";

window.supabaseClient =
  window.supabase && !SUPABASE_URL.includes("TU-PROYECTO")
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!window.supabaseClient) {
  console.warn("[Electro Mundo] Supabase no configurado: se usan los productos locales.");
}
