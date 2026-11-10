// Receives the homepage enquiry form and forwards it.
// Configure in Vercel → Project → Settings → Environment Variables (either or both):
//   WEB3FORMS_KEY     free access key from https://web3forms.com (emails each lead to you)
//   LEAD_WEBHOOK_URL  any JSON webhook (Make, Zapier, Slack, a CRM, Google Apps Script)
// Until one is set, the endpoint answers 503 and the form tells the visitor to use WhatsApp,
// so no enquiry is silently lost.

const MAX = 300;
const clean = (v) => String(v == null ? "" : v).trim().slice(0, MAX);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};

  // Spam trap: bots fill the hidden field, people never see it
  if (clean(body.company_website)) return res.status(200).json({ ok: true });

  const lead = {
    need: clean(body.need),
    budget: clean(body.budget) || "not given",
    timeline: clean(body.timeline),
    contact: clean(body.contact),
    lang: clean(body.lang) || "en",
    page: clean(body.page),
    received_at: new Date().toISOString(),
  };
  if (!lead.need || !lead.timeline || lead.contact.length < 5) {
    return res.status(400).json({ ok: false, error: "missing_fields" });
  }

  const key = process.env.WEB3FORMS_KEY;
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (!key && !hook) return res.status(503).json({ ok: false, error: "not_configured" });

  try {
    if (key) {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({ access_key: key, subject: "New website enquiry: " + lead.need, from_name: "Open Growth website" }, lead)),
      });
      if (!r.ok) throw new Error("web3forms " + r.status);
    }
    if (hook) {
      const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
      if (!r.ok) throw new Error("webhook " + r.status);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("lead delivery failed:", err.message);
    return res.status(502).json({ ok: false, error: "delivery_failed" });
  }
};

function safeJson(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
