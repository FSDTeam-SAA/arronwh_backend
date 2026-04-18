/**
 * quote-flow.js
 * Orchestrates the multi-step boiler quote flow shown in the Figma design.
 *
 * Screens (in order):
 *   1  how-describe-home          — Flat / House / Bungalow
 *   2  boiler-age                 — Less than 5 yrs / 5–10 / 10+ / Don't know
 *   3  boiler-mount               — Wall / Floor
 *   4  plan-stay                  — How long will you stay (years)
 *   5  new-boiler-location        — Same / Different / Not sure
 *   6  best-desc                  — House type (Detached / Semi / Terrace / Flat / Bungalow)
 *   7  bedrooms                   — 1..6+
 *   8  bathrooms                  — 1 / 2 / 3+
 *   9  showers                    — 1 / 2+
 *  10  radiators                  — 1-5 / 6-9 / 10-13 / 14-16 / 17+
 *  11  thermostat                 — Yes / No
 *  12  water-meter                — Yes / No
 *  13  flue-comes-out             — Wall / Roof
 *  14  flue-in-sloped-roof        — Yes / No
 *  15  roof-position              — Front / Side / Rear
 *  16  postcode                   — Postcode entry
 *  17  boiler-select              — Product list
 *  18  boiler-details             — Single product detail page
 *  19  controls-select            — Pick smart control
 *  20  extras                     — Choose extras
 *  21  total-price                — Your price + summary
 *  22  install-date               — Calendar
 *  23  address-lookup             — Confirm address
 *  24  pay-method                 — Pay by card / monthly
 *  25  confirmation               — Booking confirmed
 */

(function () {
  const api = window.ArronAPI;

  // --------- STATE ---------
  const state = {
    currentStep: 0,
    quizAnswers: [],      // [{ question, answer }]
    productId: null,
    controller: null,
    extra: null,
    installDate: null,
    installAddress: null,
    postcode: "",
    personalInfo: {
      title: "",
      fastName: "",
      sureName: "",
      email: "",
      mobleNumber: "",
      postcode: "",
    },
    payByCard: true,
    payMounthly: false,
    payMounthlyData: null,
    price: 0,
    quoteId: null,
    bookingId: null,
    // cached server data
    boilers: [],
    controllers: [],
    extras: [],
    slots: [],
  };

  // --------- QUESTION DEFINITIONS ---------
  const questions = [
    { id: "describe-home",  title: "How would you describe your home?", highlight: "home",
      options: ["Flat", "House", "Bungalow"] },
    { id: "boiler-age",     title: "Roughly how old is your boiler?", highlight: "boiler",
      options: ["Less than 5 years", "5–10 years", "More than 10 years", "I don't know"] },
    { id: "boiler-mount",   title: "Is your boiler mounted on…?", highlight: "mounted",
      options: ["A wall", "The floor"] },
    { id: "plan-stay",      title: "How long do you see yourself in your home?", highlight: "home",
      options: ["Less than 2 years", "2–5 years", "More than 5 years"] },
    { id: "new-location",   title: "Do you want your new boiler in a…?", highlight: "new boiler",
      options: ["Same location", "Different location"] },
    { id: "best-desc",      title: "Which of these best describes your home?", highlight: "home",
      options: ["Detached", "Semi-detached", "Terrace", "Flat", "Bungalow"] },
    { id: "bedrooms",       title: "How many bedrooms do you have?", highlight: "bedrooms",
      options: ["1", "2", "3", "4", "5", "6+"] },
    { id: "bathrooms",      title: "How many bathtubs do you have?", highlight: "bathtubs",
      options: ["0", "1", "2", "3+"] },
    { id: "showers",        title: "How many separate showers do you have?", highlight: "showers",
      options: ["0", "1", "2+"] },
    { id: "radiators",      title: "How many radiators do you have?", highlight: "radiators",
      options: ["1–5", "6–9", "10–13", "14–16", "17+"] },
    { id: "thermostat",     title: "Do you have a thermostatic radiator valve?", highlight: "thermostatic",
      options: ["Yes", "No"] },
    { id: "water-meter",    title: "Do you have a water meter?", highlight: "water meter",
      options: ["Yes", "No"] },
    { id: "flue-out",       title: "Where does your flue come out?", highlight: "flue",
      options: ["Wall", "Roof"] },
    { id: "flue-sloped",    title: "Is your flue in a sloped roof?", highlight: "sloped",
      options: ["Yes", "No"] },
    { id: "roof-pos",       title: "Where on the roof is it positioned?", highlight: "positioned",
      options: ["Front", "Side", "Rear"] },
  ];

  const TOTAL_STEPS = questions.length + 10; // questions + postcode + select + detail + controls + extras + price + date + address + pay + confirm

  // --------- DOM HOOKS ---------
  const app = document.getElementById("quote-app");

  function progressPct() {
    return Math.min(100, Math.round((state.currentStep / (TOTAL_STEPS - 1)) * 100));
  }

  // --------- STEP RENDERERS ---------
  function renderShell(inner) {
    app.innerHTML = `
      <div class="quote-wrap">
        <div class="container">
          <div class="quote-card">
            <div class="quote-header">
              <span class="step-badge">Step ${Math.min(state.currentStep + 1, TOTAL_STEPS)} of ${TOTAL_STEPS}</span>
              <div class="progress-track"><div class="progress-fill" style="width:${progressPct()}%"></div></div>
            </div>
            ${inner}
          </div>
        </div>
      </div>
    `;
  }

  function renderQuestion(q) {
    const selected = state.quizAnswers.find((a) => a.question === q.title)?.answer;
    const title = q.title.replace(q.highlight, `<span class="hl">${q.highlight}</span>`);

    const opts = q.options.map(opt => `
      <div class="option ${selected === opt ? "selected" : ""}" data-opt="${opt}">
        <div class="icon">${optIcon(q.id, opt)}</div>
        <div class="label">${opt}</div>
      </div>
    `).join("");

    renderShell(`
      <h2 class="q-title">${title}</h2>
      <p class="q-sub">This helps us size the right boiler for you.</p>
      <div class="option-grid cols-${Math.min(q.options.length, 4)}">${opts}</div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-yellow" data-act="next">Continue</button>
      </div>
    `);

    app.querySelectorAll(".option").forEach(el => {
      el.addEventListener("click", () => {
        const ans = el.getAttribute("data-opt");
        setAnswer(q.title, ans);
        app.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
        el.classList.add("selected");
      });
    });
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = () => {
      const has = state.quizAnswers.find(a => a.question === q.title);
      if (!has) return flash("Please select an option to continue.");
      nextStep();
    };
  }

  function optIcon(qid, opt) {
    // Simple emoji-driven icon set — easy to swap for SVGs later.
    const map = {
      "Flat": "🏢", "House": "🏠", "Bungalow": "🏡",
      "Less than 5 years": "🆕", "5–10 years": "🕐", "More than 10 years": "⏳", "I don't know": "❓",
      "A wall": "🧱", "The floor": "🟫",
      "Yes": "✓", "No": "✕",
      "Wall": "🧱", "Roof": "🏠",
      "Detached": "🏘️", "Semi-detached": "🏘️", "Terrace": "🏚️",
      "Front": "⬆️", "Side": "➡️", "Rear": "⬇️",
      "Same location": "📍", "Different location": "📌",
    };
    return map[opt] || "○";
  }

  function setAnswer(question, answer) {
    const existing = state.quizAnswers.find(a => a.question === question);
    if (existing) existing.answer = answer;
    else state.quizAnswers.push({ question, answer });
  }

  /* ---------- POSTCODE ---------- */
  function renderPostcode() {
    renderShell(`
      <h2 class="q-title">Finally, please enter the <span class="hl">postcode</span> of your property</h2>
      <p class="q-sub">We'll use it to show you available install dates and fixed prices.</p>
      <div class="input-row" style="max-width:360px;margin:0 auto">
        <label>Postcode</label>
        <input id="pc-input" placeholder="e.g. SW1A 1AA" value="${state.postcode}" />
      </div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-yellow" data-act="next">Continue</button>
      </div>
    `);
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = () => {
      const v = app.querySelector("#pc-input").value.trim();
      if (!v) return flash("Please enter a postcode.");
      state.postcode = v.toUpperCase();
      state.personalInfo.postcode = state.postcode;
      nextStep();
    };
  }

  /* ---------- BOILER SELECT ---------- */
  async function renderBoilerSelect() {
    renderShell(`<div style="text-align:center;padding:40px">Loading boilers… <span class="spinner"></span></div>`);
    try {
      const res = await api.listBoilers({ limit: 20 });
      state.boilers = (res && res.data) || [];
    } catch (e) {
      state.boilers = [];
    }

    const list = state.boilers.length
      ? state.boilers.map(b => `
          <div class="boiler-card ${state.productId === b._id ? "selected" : ""}" data-id="${b._id}">
            <div class="thumb">${b.images?.[0] ? `<img src="${b.images[0]}" alt="${escapeHtml(b.title)}" style="width:100%;height:100%;object-fit:contain;border-radius:8px" />` : "🔧"}</div>
            <div>
              <div class="badges">
                ${(b.badges || []).map(x => `<span class="badge popular">${escapeHtml(x)}</span>`).join("")}
                <span class="badge warranty">10 yr Warranty</span>
              </div>
              <h4>${escapeHtml(b.title || "Boiler")}</h4>
              <p style="color:var(--muted);margin:0 0 8px;font-size:13px">${escapeHtml(b.shortDescription || "")}</p>
              <ul class="feat-list">
                <li>Suitable for ${escapeHtml(b.boilerAbility || "your home")}</li>
                <li>Gas-Safe certified install</li>
                <li>Free 2-year service</li>
              </ul>
            </div>
            <div class="price">
              ${b.discountPrice ? `<div class="was">£${b.price}</div>` : ""}
              <div class="now">£${b.discountPrice || b.price || 0}</div>
              ${b.monthlyPrice ? `<div style="font-size:13px;color:var(--muted)">or £${b.monthlyPrice}/mo</div>` : ""}
              <button class="btn btn-primary btn-block" style="margin-top:8px" data-pick="${b._id}">Choose</button>
            </div>
          </div>
        `).join("")
      : noBoilersFallback();

    renderShell(`
      <h2 class="q-title">The ${state.boilers.length} boilers we'd recommend</h2>
      <p class="q-sub">Pick the one that fits your budget. All include free installation, 10-year warranty and a free 2-year service.</p>
      ${list}
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-yellow" data-act="next">Continue with selected</button>
      </div>
    `);

    app.querySelectorAll(".boiler-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-pick]")) return;
        selectBoiler(card.getAttribute("data-id"));
      });
    });
    app.querySelectorAll("[data-pick]").forEach(btn => {
      btn.addEventListener("click", () => { selectBoiler(btn.getAttribute("data-pick")); nextStep(); });
    });
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = () => {
      if (!state.productId) return flash("Please choose a boiler to continue.");
      nextStep();
    };
  }

  // Stubs used when the backend has no products yet. These are selectable so the
  // flow can still be demoed end-to-end.
  const FALLBACK_BOILERS = [
    { _id: "__demo_1", title: "Sample Boiler 25kW", shortDescription: "Great for 1–3 bedroom homes.", boilerAbility: "1–3 bed homes", badges: ["Most popular"], price: 1799, discountPrice: 1499, monthlyPrice: 32, images: [] },
    { _id: "__demo_2", title: "Sample Combi Pro 30kW", shortDescription: "Perfect for 3–4 bedroom family homes.", boilerAbility: "3–4 bed homes", badges: ["Best value"], price: 2199, discountPrice: 1899, monthlyPrice: 41, images: [] },
    { _id: "__demo_3", title: "Sample System Boiler 35kW", shortDescription: "For larger 4+ bedroom homes with high hot-water demand.", boilerAbility: "4+ bed homes", badges: ["Premium"], price: 2799, discountPrice: 2499, monthlyPrice: 54, images: [] },
  ];

  function noBoilersFallback() {
    // Inject the demo boilers into state so Continue works even without a DB.
    state.boilers = FALLBACK_BOILERS;
    return `
      <div class="flash info">
        Demo mode — no boilers in your database yet. Add real ones via
        <code>POST /products</code> (Swagger: <code>/api/docs</code>) and they'll replace these.
      </div>
      ${FALLBACK_BOILERS.map(b => `
        <div class="boiler-card ${state.productId === b._id ? "selected" : ""}" data-id="${b._id}">
          <div class="thumb">🔧</div>
          <div>
            <div class="badges">
              ${(b.badges || []).map(x => `<span class="badge popular">${escapeHtml(x)}</span>`).join("")}
              <span class="badge warranty">10 yr Warranty</span>
            </div>
            <h4>${escapeHtml(b.title)}</h4>
            <p style="color:var(--muted);margin:0 0 8px;font-size:13px">${escapeHtml(b.shortDescription)}</p>
            <ul class="feat-list">
              <li>Suitable for ${escapeHtml(b.boilerAbility)}</li>
              <li>Gas-Safe certified install</li>
              <li>Free 2-year service</li>
            </ul>
          </div>
          <div class="price">
            <div class="was">£${b.price}</div>
            <div class="now">£${b.discountPrice}</div>
            <div style="font-size:13px;color:var(--muted)">or £${b.monthlyPrice}/mo</div>
            <button class="btn btn-primary btn-block" style="margin-top:8px" data-pick="${b._id}">Choose</button>
          </div>
        </div>
      `).join("")}
    `;
  }

  function selectBoiler(id) {
    state.productId = id;
    const b = state.boilers.find(x => x._id === id);
    state.price = (b && (b.discountPrice || b.price)) || 1499;
    app.querySelectorAll(".boiler-card").forEach(c => c.classList.toggle("selected", c.getAttribute("data-id") === id));
  }

  /* ---------- BOILER DETAILS ---------- */
  async function renderBoilerDetails() {
    const b = state.boilers.find(x => x._id === state.productId);
    if (!b) return nextStep();
    renderShell(`
      <h2 class="q-title">${escapeHtml(b.title)}</h2>
      <p class="q-sub">${escapeHtml(b.shortDescription || "")}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">
        <div class="thumb" style="height:300px;background:#F7F8FA;border-radius:12px;display:grid;place-items:center">
          ${b.images?.[0] ? `<img src="${b.images[0]}" style="max-width:90%;max-height:90%;object-fit:contain" />` : "🔧"}
        </div>
        <div>
          <h4 style="margin:0 0 8px">What's included</h4>
          <ul class="feat-list" style="margin-bottom:14px">
            ${(b.boilerFeatures || []).map(f => `<li><strong>${escapeHtml(f.title || "")}</strong> — ${escapeHtml(f.value || "")}</li>`).join("") || "<li>Standard installation</li><li>10-year warranty</li><li>Gas-Safe registered engineer</li>"}
          </ul>
          <div class="price" style="margin-top:20px;text-align:left">
            <div class="now" style="font-size:32px">£${b.discountPrice || b.price}</div>
            ${b.monthlyPrice ? `<div style="color:var(--muted)">or £${b.monthlyPrice}/mo over 120 months</div>` : ""}
          </div>
        </div>
      </div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back to list</button>
        <button class="btn btn-yellow" data-act="next">Continue</button>
      </div>
    `);
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = nextStep;
  }

  /* ---------- CONTROLS ---------- */
  async function renderControls() {
    renderShell(`<div style="text-align:center;padding:40px">Loading controls… <span class="spinner"></span></div>`);
    try {
      const res = await api.listControllers({ limit: 20 });
      state.controllers = (res && res.data) || [];
    } catch (e) { state.controllers = []; }

    const cards = state.controllers.length
      ? state.controllers.map(c => `
        <div class="addon-card ${state.controller === c._id ? "selected" : ""}" data-id="${c._id}">
          <div class="thumb">${c.images?.[0] ? `<img src="${c.images[0]}" style="width:100%;height:100%;object-fit:contain;border-radius:8px" />` : "🌡️"}</div>
          <div style="flex:1">
            <div class="badges">${(c.badges || []).map(x => `<span class="badge popular">${escapeHtml(x)}</span>`).join("")}</div>
            <h5>${escapeHtml(c.title || "Controller")}</h5>
            <p>${escapeHtml(c.description || "").slice(0, 120)}</p>
            <div class="price">+£${c.price || 0}</div>
          </div>
        </div>`).join("")
      : `<div class="flash info">No controllers configured yet. Add via <code>POST /controller</code>.</div>`;

    renderShell(`
      <h2 class="q-title">Choose your smart control</h2>
      <p class="q-sub">Control your heating from your phone. Skip if not needed.</p>
      <div class="addon-grid">${cards}</div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <div style="display:flex;gap:10px">
          <button class="btn btn-outline" data-act="skip">Skip</button>
          <button class="btn btn-yellow" data-act="next">Continue</button>
        </div>
      </div>
    `);

    app.querySelectorAll(".addon-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        state.controller = state.controller === id ? null : id;
        app.querySelectorAll(".addon-card").forEach(c => c.classList.toggle("selected", c.getAttribute("data-id") === state.controller));
      });
    });
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=skip]").onclick = () => { state.controller = null; nextStep(); };
    app.querySelector("[data-act=next]").onclick = nextStep;
  }

  /* ---------- EXTRAS ---------- */
  async function renderExtras() {
    renderShell(`<div style="text-align:center;padding:40px">Loading extras… <span class="spinner"></span></div>`);
    try {
      const res = await api.listExtras({ limit: 20 });
      state.extras = (res && res.data) || [];
    } catch (e) { state.extras = []; }

    const cards = state.extras.length
      ? state.extras.map(c => `
        <div class="addon-card ${state.extra === c._id ? "selected" : ""}" data-id="${c._id}">
          <div class="thumb">${c.images?.[0] ? `<img src="${c.images[0]}" style="width:100%;height:100%;object-fit:contain;border-radius:8px" />` : "🧰"}</div>
          <div style="flex:1">
            <div class="badges">${(c.badges || []).map(x => `<span class="badge popular">${escapeHtml(x)}</span>`).join("")}</div>
            <h5>${escapeHtml(c.title || "Extra")}</h5>
            <p>${escapeHtml(c.description || "").slice(0, 120)}</p>
            <div class="price">+£${c.price || 0}</div>
          </div>
        </div>`).join("")
      : `<div class="flash info">No extras configured yet. Add via <code>POST /extra</code>.</div>`;

    renderShell(`
      <h2 class="q-title">Add extras to your order</h2>
      <p class="q-sub">Optional add-ons. You can skip this step.</p>
      <div class="addon-grid">${cards}</div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <div style="display:flex;gap:10px">
          <button class="btn btn-outline" data-act="skip">Skip</button>
          <button class="btn btn-yellow" data-act="next">Continue</button>
        </div>
      </div>
    `);

    app.querySelectorAll(".addon-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        state.extra = state.extra === id ? null : id;
        app.querySelectorAll(".addon-card").forEach(c => c.classList.toggle("selected", c.getAttribute("data-id") === state.extra));
      });
    });
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=skip]").onclick = () => { state.extra = null; nextStep(); };
    app.querySelector("[data-act=next]").onclick = nextStep;
  }

  /* ---------- TOTAL PRICE ---------- */
  function renderTotal() {
    const b = state.boilers.find(x => x._id === state.productId);
    const c = state.controllers.find(x => x._id === state.controller);
    const e = state.extras.find(x => x._id === state.extra);
    const boilerPrice = (b && (b.discountPrice || b.price)) || 0;
    const ctrlPrice = (c && c.price) || 0;
    const extraPrice = (e && e.price) || 0;
    const total = boilerPrice + ctrlPrice + extraPrice;
    state.price = total;

    renderShell(`
      <h2 class="q-title">Your total price is <span class="hl">£${total.toLocaleString()}</span></h2>
      <p class="q-sub">Fully-fitted, VAT inclusive, no hidden charges.</p>
      <div class="summary-card">
        <div class="summary-row"><span>${escapeHtml(b?.title || "Boiler")}</span><span>£${boilerPrice}</span></div>
        ${c ? `<div class="summary-row"><span>${escapeHtml(c.title)}</span><span>£${ctrlPrice}</span></div>` : ""}
        ${e ? `<div class="summary-row"><span>${escapeHtml(e.title)}</span><span>£${extraPrice}</span></div>` : ""}
        <div class="summary-row"><span>Standard installation</span><span>Included</span></div>
        <div class="summary-row"><span>10-year warranty</span><span>Included</span></div>
        <div class="summary-row"><span>Free 2-year service</span><span>Included</span></div>
        <div class="summary-row total"><span>Total</span><span>£${total.toLocaleString()}</span></div>
      </div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-yellow" data-act="next">Book installation →</button>
      </div>
    `);
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = nextStep;
  }

  /* ---------- INSTALL DATE ---------- */
  async function renderInstallDate() {
    renderShell(`<div style="text-align:center;padding:40px">Loading available dates… <span class="spinner"></span></div>`);
    const res = await api.getInstallSlots();
    state.slots = res.slots || [];

    const today = new Date();
    const month = today.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    let cal = "";
    ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].forEach(h => cal += `<div class="hdr">${h}</div>`);
    const startOffset = (firstDay + 6) % 7;
    for (let i = 0; i < startOffset; i++) cal += `<div class="day other-month"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const slot = state.slots.find(s => s.date === iso);
      const avail = slot ? slot.available : false;
      const sel = state.installDate === iso ? "selected" : "";
      cal += `<div class="day ${avail ? "" : "unavailable"} ${sel}" ${avail ? `data-date="${iso}"` : ""}>${d}</div>`;
    }

    renderShell(`
      <h2 class="q-title">When should we install?</h2>
      <p class="q-sub">Pick a date that works. Crossed-out days aren't available.</p>
      <div class="calendar-header">
        <button>‹</button>
        <strong>${month}</strong>
        <button>›</button>
      </div>
      <div class="calendar">${cal}</div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-yellow" data-act="next">Continue</button>
      </div>
    `);

    app.querySelectorAll(".day[data-date]").forEach(d => {
      d.addEventListener("click", () => {
        state.installDate = d.getAttribute("data-date");
        app.querySelectorAll(".day").forEach(x => x.classList.remove("selected"));
        d.classList.add("selected");
      });
    });
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = () => {
      if (!state.installDate) return flash("Please pick an install date.");
      nextStep();
    };
  }

  /* ---------- ADDRESS ---------- */
  function renderAddress() {
    renderShell(`
      <h2 class="q-title">Where are we visiting?</h2>
      <p class="q-sub">We'll use this to send your engineer on the day.</p>
      <div class="form-grid-2">
        <div class="input-row">
          <label>Title (optional)</label>
          <select id="f-title">
            <option value="">—</option><option>Mr</option><option>Mrs</option><option>Miss</option><option>Ms</option>
          </select>
        </div>
        <div class="input-row">
          <label>First name *</label>
          <input id="f-first" value="${state.personalInfo.fastName}" />
        </div>
        <div class="input-row">
          <label>Last name *</label>
          <input id="f-last" value="${state.personalInfo.sureName}" />
        </div>
        <div class="input-row">
          <label>Email *</label>
          <input id="f-email" type="email" value="${state.personalInfo.email}" />
        </div>
        <div class="input-row">
          <label>Mobile *</label>
          <input id="f-mobile" value="${state.personalInfo.mobleNumber}" />
        </div>
        <div class="input-row">
          <label>Postcode *</label>
          <input id="f-postcode" value="${state.personalInfo.postcode || state.postcode}" />
        </div>
      </div>
      <div class="input-row">
        <label>Full install address *</label>
        <textarea id="f-addr" rows="3">${state.installAddress || ""}</textarea>
      </div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-yellow" data-act="next">Continue</button>
      </div>
    `);
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = () => {
      state.personalInfo.title   = app.querySelector("#f-title").value;
      state.personalInfo.fastName= app.querySelector("#f-first").value.trim();
      state.personalInfo.sureName= app.querySelector("#f-last").value.trim();
      state.personalInfo.email   = app.querySelector("#f-email").value.trim();
      state.personalInfo.mobleNumber = app.querySelector("#f-mobile").value.trim();
      state.personalInfo.postcode = app.querySelector("#f-postcode").value.trim();
      state.installAddress = app.querySelector("#f-addr").value.trim();

      if (!state.personalInfo.fastName || !state.personalInfo.sureName)
        return flash("Please enter your name.");
      if (!/@/.test(state.personalInfo.email)) return flash("Please enter a valid email.");
      if (!state.personalInfo.mobleNumber) return flash("Please enter your mobile number.");
      if (!state.installAddress) return flash("Please enter your install address.");
      nextStep();
    };
  }

  /* ---------- PAY METHOD ---------- */
  function renderPayMethod() {
    const monthly = Math.round((state.price / 120) * 100) / 100;
    renderShell(`
      <h2 class="q-title">How would you like to pay?</h2>
      <p class="q-sub">Pay in full today, or spread it with 0% finance.</p>
      <div class="pay-toggle">
        <div class="option ${state.payByCard ? "selected" : ""}" data-pay="card">
          <div class="label">Pay by card</div>
          <div class="sub">£${state.price.toLocaleString()} today</div>
        </div>
        <div class="option ${state.payMounthly ? "selected" : ""}" data-pay="monthly">
          <div class="label">Pay monthly</div>
          <div class="sub">from £${monthly}/mo over 120 months</div>
        </div>
      </div>
      <div id="monthly-detail" style="display:${state.payMounthly ? "block" : "none"}">
        <div class="form-grid-2">
          <div class="input-row"><label>Deposit £</label><input id="pm-deposit" type="number" value="100" min="0" /></div>
          <div class="input-row"><label>Months</label>
            <select id="pm-months"><option>24</option><option>48</option><option>60</option><option selected>120</option></select>
          </div>
        </div>
      </div>
      <div class="q-actions">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-primary" data-act="pay">Confirm &amp; pay →</button>
      </div>
    `);

    app.querySelectorAll("[data-pay]").forEach(el => {
      el.addEventListener("click", () => {
        const kind = el.getAttribute("data-pay");
        state.payByCard = kind === "card";
        state.payMounthly = kind === "monthly";
        app.querySelectorAll("[data-pay]").forEach(x => x.classList.remove("selected"));
        el.classList.add("selected");
        app.querySelector("#monthly-detail").style.display = state.payMounthly ? "block" : "none";
      });
    });
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=pay]").onclick = submitQuote;
  }

  async function submitQuote() {
    if (state.payMounthly) {
      const deposit = parseFloat(app.querySelector("#pm-deposit").value || "0");
      const months = parseInt(app.querySelector("#pm-months").value || "120", 10);
      const amount = Math.max(1, Math.round(((state.price - deposit) / months) * 100) / 100);
      state.payMounthlyData = { deposit, mounthNumber: months, amount };
    }

    renderShell(`<div style="text-align:center;padding:60px"><span class="spinner" style="width:36px;height:36px;border-color:rgba(0,0,0,.1);border-top-color:var(--green)"></span><p style="margin-top:16px;font-weight:700">Creating your quote…</p></div>`);

    try {
      // Demo IDs (start with __demo_) are NOT real Mongo ObjectIds, so strip
      // them before sending — the @IsMongoId() validator on the backend would
      // otherwise reject the whole request.
      const realId = (id) => (id && !String(id).startsWith("__demo_")) ? id : undefined;

      const payload = {
        personalInfo: state.personalInfo,
        quizAnswers: state.quizAnswers,
        productId:  realId(state.productId),
        controller: realId(state.controller),
        extra:      realId(state.extra),
        installDate: state.installDate || undefined,
        installAddress: state.installAddress || undefined,
        payByCard: state.payByCard,
        payMounthly: state.payMounthly,
        payMounthlyData: state.payMounthlyData || undefined,
      };
      const quoteRes = await api.createQuote(payload);
      state.quoteId = quoteRes?.data?._id;
      if (!state.quoteId) throw new Error("Quote creation returned no ID");

      const bookingRes = await api.createBooking(state.quoteId, state.price);
      state.bookingId = bookingRes?.data?._id;
      if (!state.bookingId) throw new Error("Booking creation returned no ID");

      // Mark this booking as an 'installation' booking (vs a 'survey' booking)
      try { await api.setBookingFor(state.bookingId, "installation"); } catch (_) { /* non-fatal */ }

      // Create the Stripe payment intent
      let paymentInfo = null;
      if (state.payByCard) {
        try {
          const p = await api.createPaymentIntent(state.bookingId);
          paymentInfo = p?.data || null;
        } catch (e) {
          // Payment intent failed — still show confirmation but flag it.
          console.warn("Payment intent failed", e);
        }
      }

      renderConfirmation(paymentInfo);
    } catch (e) {
      renderShell(`
        <div class="flash error">Something went wrong: ${escapeHtml(e.message)}</div>
        <div class="q-actions">
          <button class="btn btn-outline" data-act="back">← Back</button>
          <button class="btn btn-yellow" data-act="retry">Try again</button>
        </div>
      `);
      app.querySelector("[data-act=back]").onclick = prevStep;
      app.querySelector("[data-act=retry]").onclick = submitQuote;
    }
  }

  /* ---------- CONFIRMATION ---------- */
  function renderConfirmation(paymentInfo) {
    const dateStr = state.installDate
      ? new Date(state.installDate).toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric"})
      : "—";
    renderShell(`
      <div class="confirmation">
        <div class="check">✓</div>
        <h2>Booking confirmed!</h2>
        <p>Thanks ${escapeHtml(state.personalInfo.fastName)}! We've emailed your confirmation to
          <strong>${escapeHtml(state.personalInfo.email)}</strong>. Booking reference
          <code>${state.bookingId || "—"}</code>.</p>
      </div>
      <div class="summary-card">
        <div class="summary-row"><span>Install date</span><span>${dateStr}</span></div>
        <div class="summary-row"><span>Address</span><span>${escapeHtml(state.installAddress || "")}</span></div>
        <div class="summary-row"><span>Payment</span><span>${state.payByCard ? "Card" : `Monthly (${state.payMounthlyData?.mounthNumber} mo)`}</span></div>
        <div class="summary-row total"><span>Total</span><span>£${state.price.toLocaleString()}</span></div>
      </div>
      ${paymentInfo ? `
        <div class="flash info">
          Stripe payment intent created. Complete the payment with the client secret
          <code>${escapeHtml(paymentInfo.clientSecret || paymentInfo.client_secret || "")}</code>
          using Stripe.js.
        </div>` : ""}
      <div class="q-actions">
        <a href="./index.html" class="btn btn-outline">← Back to home</a>
        <button class="btn btn-yellow" onclick="window.print()">Print confirmation</button>
      </div>
    `);
  }

  /* ---------- UTIL ---------- */
  function flash(msg) {
    const card = app.querySelector(".quote-card");
    if (!card) return;
    const existing = card.querySelector(".flash.error");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.className = "flash error";
    el.textContent = msg;
    card.insertBefore(el, card.querySelector(".q-actions"));
    setTimeout(() => el.remove(), 4000);
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[c]);
  }

  function nextStep() { state.currentStep++; render(); window.scrollTo(0,0); }
  function prevStep() { if (state.currentStep > 0) state.currentStep--; render(); window.scrollTo(0,0); }

  // Step dispatcher
  function render() {
    const i = state.currentStep;
    if (i < questions.length) return renderQuestion(questions[i]);
    const after = i - questions.length;
    switch (after) {
      case 0: return renderPostcode();
      case 1: return renderBoilerSelect();
      case 2: return renderBoilerDetails();
      case 3: return renderControls();
      case 4: return renderExtras();
      case 5: return renderTotal();
      case 6: return renderInstallDate();
      case 7: return renderAddress();
      case 8: return renderPayMethod();
      default: return; // submission handled in-line
    }
  }

  // boot
  document.addEventListener("DOMContentLoaded", render);
})();
