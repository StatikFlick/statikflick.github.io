(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const config = window.STATIKFLICK_SUPABASE_CONFIG;
  let client = null;
  const status = (id, message, kind = "") => { const el = $(id); el.textContent = message; el.className = "status" + (kind ? " " + kind : ""); };
  const showSession = (signedIn) => { $("loginPanel").classList.toggle("hidden", signedIn); $("adminPanel").classList.toggle("hidden", !signedIn); };
  const invokeAdmin = async (action, extra = {}) => {
    const { data, error } = await client.functions.invoke("admin-api", { body: { action, ...extra } });
    if (error) throw error;
    if (!data || data.ok !== true) throw new Error(data?.error || "Request failed");
    return data;
  };
  const renderSettings = (items) => {
    const root = $("settingsList"); root.replaceChildren();
    if (!items.length) { const p = document.createElement("p"); p.textContent = "No settings saved yet."; root.appendChild(p); return; }
    for (const item of items) {
      const wrap = document.createElement("div"); wrap.className = "setting";
      const title = document.createElement("strong"); title.textContent = item.key;
      const pre = document.createElement("pre"); pre.textContent = JSON.stringify(item.value, null, 2);
      wrap.append(title, pre); root.appendChild(wrap);
    }
  };
  const refreshSettings = async () => {
    status("adminStatus", "Loading settings…");
    try { const data = await invokeAdmin("list_settings"); renderSettings(data.settings || []); status("adminStatus", "Settings loaded.", "ok"); }
    catch (error) { status("adminStatus", error.message || "Could not load settings.", "error"); }
  };
  const start = async () => {
    if (!window.supabase || !config || !config.SUPABASE_URL || !config.SUPABASE_PUBLISHABLE_KEY || config.SUPABASE_URL.includes("YOUR_PROJECT_REF") || config.SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_")) {
      status("loginStatus", "Configure admin-config.js with your Supabase URL and publishable key first.", "error"); return;
    }
    client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data: { session } } = await client.auth.getSession(); showSession(Boolean(session));
    if (session) { try { await invokeAdmin("whoami"); await refreshSettings(); } catch (error) { await client.auth.signOut(); showSession(false); status("loginStatus", error.message || "This account is not the owner.", "error"); } }
    client.auth.onAuthStateChange((_event, nextSession) => showSession(Boolean(nextSession)));
  };
  $("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault(); if (!client) return; $("loginBtn").disabled = true; status("loginStatus", "Signing in…");
    try {
      const { error } = await client.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
      if (error) throw error; await invokeAdmin("whoami"); showSession(true); status("loginStatus", ""); await refreshSettings();
    } catch (error) { await client.auth.signOut(); showSession(false); status("loginStatus", error.message || "Sign-in failed.", "error"); }
    finally { $("loginBtn").disabled = false; }
  });
  $("logoutBtn").addEventListener("click", async () => { if (!client) return; await client.auth.signOut(); showSession(false); status("loginStatus", "Signed out."); });
  $("refreshBtn").addEventListener("click", refreshSettings);
  $("settingForm").addEventListener("submit", async (event) => {
    event.preventDefault(); if (!client) return; $("saveBtn").disabled = true;
    try {
      const key = $("settingKey").value.trim(); const value = JSON.parse($("settingValue").value);
      await invokeAdmin("upsert_setting", { key, value }); status("adminStatus", "Setting saved.", "ok"); await refreshSettings();
    } catch (error) { status("adminStatus", error.message || "Could not save setting.", "error"); }
    finally { $("saveBtn").disabled = false; }
  });
  window.addEventListener("DOMContentLoaded", start);
})();
