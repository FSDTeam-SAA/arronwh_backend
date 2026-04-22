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
 *  21  total-price                — Your price + summary (with sticky sidebar)
 *  22  survey-date                — Calendar — when should we survey
 *  23  install-date               — Calendar — when should we install
 *  24  address-lookup             — Confirm address + rental toggle
 *  25  pay-method                 — Pay by card / monthly (inline forms)
 *  26  confirmation               — Booking confirmed (line-item summary)
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
    surveyDate: null,
    installDate: null,
    installAddress: null,
    isRental: false,
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

  // questions + postcode + boiler-select + boiler-details + controls + extras
  // + total + survey-date + install-date + address + pay + confirmation
  const TOTAL_STEPS = questions.length + 11;

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

  /* ---------- LATE-STAGE LAYOUT HELPERS ----------
     The Figma replaces the thin top progress bar with a 4-stage pill header
     and adds a sticky right-hand sidebar showing price + order summary.
     These helpers render those shared chrome pieces. */

  // Late-stage screens always sit in stage 3 (Customer Details) or 4 (Booking)
  function renderStages(activeIdx) {
    const stages = ["Property Overview", "System Selection", "Customer Details", "Installation Booking"];
    return `
      <div class="stages">
        ${stages.map((s, i) => `
          <div class="stage ${i === activeIdx ? "active" : i < activeIdx ? "done" : ""}">
            <span class="num">${i + 1}</span><span>${s}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function calcMonthly(price) {
    return Math.round((price / 120) * 100) / 100;
  }

  function renderSidebar() {
    const b = state.boilers.find(x => x._id === state.productId);
    const c = state.controllers.find(x => x._id === state.controller);
    const e = state.extras.find(x => x._id === state.extra);
    const boilerPrice = (b && (b.discountPrice || b.price)) || 0;
    const ctrlPrice   = (c && c.price) || 0;
    const extraPrice  = (e && e.price) || 0;
    const total       = boilerPrice + ctrlPrice + extraPrice;
    const wasTotal    = ((b && b.price) || 0) + ctrlPrice + extraPrice;
    const monthly     = calcMonthly(total);
    const monthlyWas  = calcMonthly(wasTotal);
    const discount    = Math.max(0, wasTotal - total);

    state.price = total;

    const installDateStr = state.installDate
      ? new Date(state.installDate).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric"})
      : null;

    return `
      <div class="sb-card">
        <h6>Total fixed price including VAT</h6>
        <div class="sb-pay-row">
          <div class="sb-pay">
            <div class="lb">Pay today</div>
            <div class="pr">£${total.toLocaleString()}</div>
            ${discount ? `<div class="was">was £${wasTotal.toLocaleString()}</div>` : ""}
          </div>
          <div class="sb-pay">
            <div class="lb">Monthly Cost</div>
            <div class="pr">£${monthly.toFixed(2)}*</div>
            ${discount ? `<div class="was">was £${monthlyWas.toFixed(2)}</div>` : ""}
          </div>
        </div>
        ${discount ? `
          <div class="sb-discount">
            <span>£ ${escapeHtml(b?.title || "Boiler")} Discount</span>
            <span class="vl">-£${discount.toLocaleString()}</span>
          </div>` : ""}
      </div>
      <div class="sb-card">
        <h6>Order Summary</h6>
        <div class="sb-order">
          <div class="thumb">${b?.images?.[0] ? `<img src="${b.images[0]}" alt="" />` : "🔧"}</div>
          <div class="info">
            <h6>${escapeHtml(b?.title || "Your boiler")}</h6>
            <p>with 10 year warranty</p>
          </div>
        </div>
        ${(installDateStr || state.installAddress) ? `
          <dl class="sb-meta">
            ${installDateStr ? `<dt>Install date</dt><dd>${installDateStr}</dd>` : ""}
            ${state.installAddress ? `<dt>Install at</dt><dd>${escapeHtml(state.installAddress)}</dd>` : ""}
          </dl>` : ""}
      </div>
    `;
  }

  // Shell used by all post-quiz screens that show stages + sidebar
  function renderSidebarShell(mainHtml, activeStage) {
    app.innerHTML = `
      <div class="quote-wrap">
        <div class="container">
          ${renderStages(activeStage)}
          <div class="layout-with-sidebar">
            <div class="layout-main">${mainHtml}</div>
            <aside class="layout-sidebar">${renderSidebar()}</aside>
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

  /* ---------- LATE-STAGE: COMMON BUILDING BLOCKS ----------
     Figma shows an accordion-style page where the current section is open and
     other sections collapse to single rows. The `accItem` helper renders a
     collapsed row; `priceStrip` renders the always-visible price summary. */

  function priceStrip() {
    return `
      <div class="price-strip">
        <div>
          🛡️ Your total price is <strong>£${state.price.toLocaleString()}</strong>
          <span class="sub">Installation available from next working day — choose your install date below</span>
        </div>
        <div class="right"><a>View</a></div>
      </div>
    `;
  }

  function accItem(icon, label) {
    return `<div class="acc-item"><span class="ic">${icon}</span><span>${label}</span></div>`;
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

    const main = `
      ${priceStrip()}
      <div class="summary-card" style="margin-top:12px">
        <div class="summary-row">
          <span><strong>${escapeHtml(b?.title || "Boiler")}</strong><br><small style="color:var(--muted)">with 10 year warranty</small></span>
          <span>£${boilerPrice}</span>
        </div>
        ${c ? `<div class="summary-row"><span>${escapeHtml(c.title)}</span><span>£${ctrlPrice}</span></div>` : ""}
        ${e ? `<div class="summary-row"><span>${escapeHtml(e.title)}</span><span>£${extraPrice}</span></div>` : ""}
        <div class="summary-row"><span>Gas safe installation at ${escapeHtml(state.postcode || "your address")}</span><span class="">Included</span></div>
        <div class="summary-row"><span>Disposal of your old boiler</span><span>Included</span></div>
        <div class="summary-row"><span>Removal of existing combi boiler &amp; replace with a new combi boiler</span><span>Included</span></div>
        <div class="summary-row total"><span>Total</span><span>£${total.toLocaleString()}</span></div>
      </div>
      <div class="q-actions" style="margin-top:18px">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-primary" data-act="next">Next</button>
      </div>
      ${accItem("📅", "When should we Survey?")}
      ${accItem("📅", "When should we install?")}
      ${accItem("📍", "Where are we visiting?")}
      ${accItem("💳", "How would you like to pay?")}
    `;
    renderSidebarShell(main, 3);
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = nextStep;
  }

  /* ---------- CALENDAR (shared by survey + install) ---------- */
  // Returns { calHtml, monthLabel } for the next available month.
  function buildCalendar(selectedISO) {
    const today = new Date();
    const monthLabel = today.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    let cal = "";
    // Figma uses Sun-first; weeks start Sunday.
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(h => cal += `<div class="hdr">${h}</div>`);
    for (let i = 0; i < firstDay; i++) cal += `<div class="day other-month"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const slot = state.slots.find(s => s.date === iso);
      const avail = slot ? slot.available : false;
      const dow = new Date(today.getFullYear(), today.getMonth(), d).getDay();
      // Saturdays in the second half of the month show a quieter-day +£100 discount.
      const discount = avail && dow === 6 && d > 5;
      // Mid-week days in the third week marked "busy" to mimic Figma's red cells.
      const busy = avail && d >= 22 && d <= 24;
      const sel = selectedISO === iso ? "selected" : "";
      const cls = ["day", sel, avail ? "" : "unavailable", busy ? "busy" : ""].filter(Boolean).join(" ");
      cal += `<div class="${cls}" ${avail && !busy ? `data-date="${iso}"` : ""}>
        <span>${d}</span>${discount ? `<span class="disc">+£100</span>` : ""}
      </div>`;
    }
    return { calHtml: cal, monthLabel };
  }

  function renderCalendarShell(opts) {
    // opts: { title, sub, selectedISO, onPick, abovePanels, belowPanels, stage }
    const { calHtml, monthLabel } = buildCalendar(opts.selectedISO);
    const main = `
      ${priceStrip()}
      ${(opts.abovePanels || []).join("")}
      <div class="summary-card" style="margin-top:12px">
        <h2 class="q-title" style="margin:0;font-size:16px;text-align:center">📅 ${opts.title}</h2>
        <p class="q-sub" style="text-align:center;margin:6px 0 12px">${opts.sub}</p>
        <div class="calendar-header"><button type="button">‹</button><strong>${monthLabel}</strong><button type="button">›</button></div>
        <div class="calendar">${calHtml}</div>
        <p style="font-size:12px;color:var(--muted);text-align:center;margin:6px 0 0">Times when we're less busy have a discount shown in green.</p>
      </div>
      <div class="q-actions" style="margin-top:14px">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-primary" data-act="next">Next</button>
      </div>
      ${(opts.belowPanels || []).join("")}
    `;
    renderSidebarShell(main, opts.stage);

    app.querySelectorAll(".day[data-date]").forEach(d => {
      d.addEventListener("click", () => {
        opts.onPick(d.getAttribute("data-date"));
        app.querySelectorAll(".day").forEach(x => x.classList.remove("selected"));
        d.classList.add("selected");
      });
    });
    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = opts.onNext;
  }

  /* ---------- SURVEY DATE ---------- */
  async function renderSurveyDate() {
    renderSidebarShell(`<div style="text-align:center;padding:40px">Loading available dates… <span class="spinner"></span></div>`, 3);
    const res = await api.getInstallSlots();
    state.slots = res.slots || [];

    renderCalendarShell({
      title: "When should we Survey?",
      sub: "Your Survey will take 1 day and your engineer will arrive between 7.30am–9.30am.",
      selectedISO: state.surveyDate,
      onPick: (iso) => { state.surveyDate = iso; },
      onNext: () => {
        if (!state.surveyDate) return flash("Please pick a survey date.");
        nextStep();
      },
      belowPanels: [
        accItem("📅", "When should we install?"),
        accItem("📍", "Where are we visiting?"),
        accItem("💳", "How would you like to pay?"),
      ],
      stage: 2,
    });
  }

  /* ---------- INSTALL DATE ---------- */
  async function renderInstallDate() {
    renderSidebarShell(`<div style="text-align:center;padding:40px">Loading available dates… <span class="spinner"></span></div>`, 3);
    const res = await api.getInstallSlots();
    state.slots = res.slots || [];

    renderCalendarShell({
      title: "When should we install?",
      sub: "Your installation will take 1 day and your engineer will arrive between 7.30am–9.30am.",
      selectedISO: state.installDate,
      onPick: (iso) => { state.installDate = iso; },
      onNext: () => {
        if (!state.installDate) return flash("Please pick an install date.");
        nextStep();
      },
      abovePanels: [accItem("📅", "When should we Survey?")],
      belowPanels: [
        accItem("📍", "Where are we visiting?"),
        accItem("💳", "How would you like to pay?"),
      ],
      stage: 2,
    });
  }

  /* ---------- ADDRESS ---------- */
  function renderAddress() {
    const hasConfirmed = !!state.installAddress;

    const main = `
      ${priceStrip()}
      ${accItem("📅", "When should we Survey?")}
      ${accItem("📅", "When should we install?")}
      <div class="summary-card" style="margin-top:12px">
        <h2 class="q-title" style="margin:0;font-size:16px;text-align:center">📍 Where are we visiting?</h2>
        <p class="q-sub" style="text-align:center;margin:6px 0 16px">All fields are required unless marked optional.</p>

        <div class="input-row">
          <label>Installation address</label>
          ${hasConfirmed ? `
            <div class="address-confirmed">
              <span>${escapeHtml(state.installAddress)}</span>
              <a id="addr-edit">Edit Address</a>
            </div>
          ` : `
            <textarea id="f-addr" rows="3" placeholder="eg : 1205 Washington dc">${state.installAddress || ""}</textarea>
          `}
        </div>

        <div style="font-weight:700;margin:14px 0 8px">Is this a rental Property</div>
        <div class="rental-toggle">
          <div class="rt-opt ${state.isRental ? "selected" : ""}" data-rent="yes">
            <span class="dot"></span><span>Yes this is a rental property</span>
          </div>
          <div class="rt-opt ${!state.isRental ? "selected" : ""}" data-rent="no">
            <span class="dot"></span><span>No I am the homeowner</span>
          </div>
        </div>

        <div style="font-weight:700;margin:14px 0 8px">Your details</div>
        <div class="form-grid-2">
          <div class="input-row">
            <label>Title</label>
            <select id="f-title">
              <option value="">—</option>
              ${["Mr","Mrs","Miss","Ms","Dr"].map(t => `<option ${state.personalInfo.title === t ? "selected" : ""}>${t}</option>`).join("")}
            </select>
          </div>
          <div class="input-row"><label>First Name</label><input id="f-first" value="${escapeHtml(state.personalInfo.fastName)}" placeholder="Jhon" /></div>
        </div>
        <div class="form-grid-2" style="margin-top:6px">
          <div class="input-row"><label>Sure Name</label><input id="f-last" value="${escapeHtml(state.personalInfo.sureName)}" placeholder="Doe" /></div>
          <div class="input-row"><label>Email</label><input id="f-email" type="email" value="${escapeHtml(state.personalInfo.email)}" placeholder="jondoe@example.com" /></div>
        </div>
        <div class="input-row" style="margin-top:6px"><label>Postcode</label><input id="f-postcode" value="${escapeHtml(state.personalInfo.postcode || state.postcode)}" /></div>
        <div class="input-row"><label>Mobile Number</label><input id="f-mobile" value="${escapeHtml(state.personalInfo.mobleNumber)}" placeholder="07900 284 408 42" /></div>

        <p style="font-size:12px;color:var(--muted);margin:14px 0 6px">Your personal data will processed in accordance with our <a style="color:var(--green)">Privacy policy</a></p>
      </div>
      <div class="q-actions" style="margin-top:14px">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <button class="btn btn-primary" data-act="next">Next</button>
      </div>
      ${accItem("💳", "How would you like to pay?")}
    `;
    renderSidebarShell(main, 3);

    app.querySelectorAll("[data-rent]").forEach(el => {
      el.addEventListener("click", () => {
        state.isRental = el.getAttribute("data-rent") === "yes";
        app.querySelectorAll("[data-rent]").forEach(x => x.classList.toggle("selected", x === el));
      });
    });
    const editBtn = app.querySelector("#addr-edit");
    if (editBtn) editBtn.onclick = () => { state.installAddress = ""; renderAddress(); };

    app.querySelector("[data-act=back]").onclick = prevStep;
    app.querySelector("[data-act=next]").onclick = () => {
      state.personalInfo.title       = app.querySelector("#f-title").value;
      state.personalInfo.fastName    = app.querySelector("#f-first").value.trim();
      state.personalInfo.sureName    = app.querySelector("#f-last").value.trim();
      state.personalInfo.email       = app.querySelector("#f-email").value.trim();
      state.personalInfo.mobleNumber = app.querySelector("#f-mobile").value.trim();
      state.personalInfo.postcode    = app.querySelector("#f-postcode").value.trim();
      const addrEl = app.querySelector("#f-addr");
      if (addrEl) state.installAddress = addrEl.value.trim();

      if (!state.installAddress)            return flash("Please enter your install address.");
      if (!state.personalInfo.fastName || !state.personalInfo.sureName)
        return flash("Please enter your name.");
      if (!/@/.test(state.personalInfo.email)) return flash("Please enter a valid email.");
      if (!state.personalInfo.mobleNumber)  return flash("Please enter your mobile number.");
      nextStep();
    };
  }

  /* ---------- PAY METHOD ---------- */
  function renderPayMethod() {
    const cardForm = `
      <div class="card-form">
        <h4>Enter your card details below</h4>
        <div class="input-row"><label>Card number</label><input id="cc-num" placeholder="1234 1234 1234 1234" /></div>
        <div class="form-grid-2">
          <div class="input-row"><label>Expiry date</label><input id="cc-exp" placeholder="MM/YY" /></div>
          <div class="input-row"><label>Security Code</label><input id="cc-cvc" placeholder="CVC" /></div>
        </div>
        <div class="input-row"><label>Zip Code</label><input id="cc-zip" placeholder="12345" /></div>
        <button class="btn btn-outline btn-block" type="button" style="margin-top:8px">Start finance application</button>
        <button class="btn btn-primary btn-block" data-act="pay" style="margin-top:10px">🛡️ Book Installation</button>
        <p style="font-size:12px;color:var(--muted);text-align:center;margin:10px 0 0">We do not charge a fee for our retail finance services.</p>
      </div>
    `;

    const planRow = (months, apr) => {
      const amt = Math.max(1, Math.round(((state.price - 50) / months) * 100) / 100);
      return `
        <div class="plan-opt ${state.payMounthlyData?.mounthNumber === months ? "selected" : ""}" data-months="${months}" data-apr="${apr}">
          <div class="top">
            <span><strong>${months} months</strong> – ${apr}%APR</span>
            <span class="mo">£${amt.toFixed(2)}/mo</span>
          </div>
          <div class="grid">
            <div class="lb">Total price</div><div class="vl">£${(amt * months).toFixed(2)}</div>
            <div class="lb">Advanced payments</div><div class="vl">£0</div>
            <div class="lb">Payment term</div><div class="vl">${months} months</div>
            <div class="lb">Monthly payments</div><div class="vl">£${amt.toFixed(2)}</div>
            <div class="lb">Total repayable</div><div class="vl">£${(amt * months).toFixed(2)}</div>
            <div class="lb">Representative</div><div class="vl">${apr}% p.a Fixed</div>
          </div>
        </div>
      `;
    };

    const monthlyForm = `
      <div class="finance-block">
        <div class="f-step"><span>1. Deposit amount</span><span class="pill" id="dep-pill">£50</span></div>
        <div class="deposit-row">
          <input id="dep-range" type="range" min="0" max="${Math.round(state.price * 0.5)}" step="10" value="50" />
        </div>
        <p style="font-size:12px;color:var(--muted);margin:0 0 14px">Slide to adjust your deposit or input your preferred amount.</p>
        <div class="f-step"><span>2. Choose your plan</span><span class="pill" id="plan-pill">£50</span></div>
        <div class="plan-list" id="plans">
          ${planRow(120, 9.9)}
          ${planRow(60, 9.9)}
          ${planRow(36, 9.9)}
          ${planRow(12, 0.3)}
        </div>
        <div class="finance-checks">
          <label><input type="checkbox" id="agree-tc" /> I agree to <a>terms &amp; condition</a></label>
          <label><input type="checkbox" id="agree-mkt" /> I am happy to receive useful reminders &amp; ways to improve my home from , as explained in the <a>Privacy policy</a></label>
        </div>
        <button class="btn btn-primary btn-block" data-act="pay" style="margin-top:12px">Pay via Stripe</button>
        <p style="font-size:12px;color:var(--muted);text-align:center;margin:10px 0 0">We do not charge a fee for our retail finance services.</p>
      </div>
    `;

    const main = `
      ${priceStrip()}
      ${accItem("📅", "When should we Survey?")}
      ${accItem("📅", "When should we install?")}
      ${accItem("📍", "Where are we visiting?")}
      <div class="summary-card" style="margin-top:12px">
        <h2 class="q-title" style="margin:0;font-size:16px;text-align:center">💳 How would you like to pay?</h2>
        <p class="q-sub" style="text-align:center;margin:6px 0 14px">Make one payment by card or pay in monthly installments with our finance options</p>
        <div class="pay-rows">
          <div class="pr-opt ${state.payByCard ? "selected" : ""}" data-pay="card">
            <span class="dot"></span>
            <span class="lbl">Pay by card</span>
            <span class="icons"><span>VISA</span><span>AMEX</span><span>MC</span><span>G Pay</span></span>
          </div>
          <div class="pr-opt ${state.payMounthly ? "selected" : ""}" data-pay="monthly">
            <span class="dot"></span>
            <span class="lbl">Pay monthly</span>
          </div>
        </div>
        <div class="pay-secured">🔒 Secure payments powered by stripe.</div>
        <div id="pay-detail">${state.payByCard ? cardForm : state.payMounthly ? monthlyForm : ""}</div>
      </div>
      <div class="q-actions" style="margin-top:14px">
        <button class="btn btn-outline" data-act="back">← Back</button>
        <div></div>
      </div>
    `;
    renderSidebarShell(main, 3) /* Installation Booking */;

    function rebindPay() {
      app.querySelector("[data-act=pay]")?.addEventListener("click", submitQuote);
      // Plan selection (monthly only)
      app.querySelectorAll(".plan-opt").forEach(p => {
        p.addEventListener("click", () => {
          const months = parseInt(p.getAttribute("data-months"), 10);
          const deposit = parseFloat(app.querySelector("#dep-range")?.value || "50");
          const amount = Math.max(1, Math.round(((state.price - deposit) / months) * 100) / 100);
          state.payMounthlyData = { deposit, mounthNumber: months, amount };
          app.querySelectorAll(".plan-opt").forEach(x => x.classList.toggle("selected", x === p));
          const pp = app.querySelector("#plan-pill"); if (pp) pp.textContent = `£${amount.toFixed(2)}`;
        });
      });
      const dep = app.querySelector("#dep-range");
      if (dep) dep.addEventListener("input", () => {
        const v = parseFloat(dep.value);
        const pill = app.querySelector("#dep-pill"); if (pill) pill.textContent = `£${v}`;
      });
    }

    app.querySelectorAll("[data-pay]").forEach(el => {
      el.addEventListener("click", () => {
        const kind = el.getAttribute("data-pay");
        state.payByCard   = kind === "card";
        state.payMounthly = kind === "monthly";
        app.querySelectorAll("[data-pay]").forEach(x => x.classList.toggle("selected", x === el));
        app.querySelector("#pay-detail").innerHTML = state.payByCard ? cardForm : monthlyForm;
        rebindPay();
      });
    });
    app.querySelector("[data-act=back]").onclick = prevStep;
    rebindPay();
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
        surveyDate: state.surveyDate || undefined,
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
    const b = state.boilers.find(x => x._id === state.productId);
    const c = state.controllers.find(x => x._id === state.controller);
    const e = state.extras.find(x => x._id === state.extra);

    // Extras shown as included/optional rows. Real values come from the picked
    // controller/extra; the rest are static "what's bundled in every install"
    // line items so the confirmation matches the Figma layout.
    const lineItems = [];
    if (c) lineItems.push({ nm: c.title, vl: `£${c.price || 0}` });
    if (e) lineItems.push({ nm: e.title, vl: `£${e.price || 0}` });
    [
      "Disposal of your old boiler",
      "Shock Arrestor Boiler Protection Pack",
      "Worcester Bosch Vertical Flue installation",
      "Worcester Bosch 100mm Standard Flue Extension",
      "In-line scale reducer",
      "Carbon Monoxide Alarm",
      "Condensate pipework",
      "Pipework installation, alterations and upgrades",
      "Electrical work",
      "Boiler Aftercare 10 years warranty (on-site parts & labour)",
      "BOXT to register the warranty & Building Control Certificate",
      "Sentinel Water Treatment",
      "Worcester Bosch Magnetic Filter",
      "Worcester Bosch Keyless Filling Link",
    ].forEach(nm => lineItems.push({ nm, vl: "Included", inc: true }));

    app.innerHTML = `
      <div class="quote-wrap">
        <div class="container">
          ${renderStages(3)}
          <div class="quote-card" style="text-align:left">
            <div class="confirmation">
              <div class="check">✓</div>
              <h2>Booking Confirmed!</h2>
              <p>Thanks ${escapeHtml(state.personalInfo.fastName || "")}! We've emailed your confirmation to <strong>${escapeHtml(state.personalInfo.email || "")}</strong>. Booking ref <code>${state.bookingId || "—"}</code>.</p>
            </div>
            <div class="booking-detail">
              <h3>Booking Details</h3>
              <div class="lead-row">
                <div class="nm">${escapeHtml(b?.title || "Boiler")}<small>View details</small></div>
                <div class="vl">£${(b?.discountPrice || b?.price || 0).toLocaleString()}</div>
              </div>
              ${lineItems.map(li => `
                <div class="bd-row">
                  <span class="nm">${escapeHtml(li.nm)}</span>
                  <span class="vl ${li.inc ? "inc" : ""}">${escapeHtml(li.vl)}</span>
                </div>
              `).join("")}
              <div class="bd-row" style="border-top:1.5px solid var(--border);margin-top:6px;padding-top:14px">
                <span class="nm" style="font-weight:800">Total</span>
                <span class="vl" style="font-size:18px">£${state.price.toLocaleString()}</span>
              </div>
            </div>
            ${paymentInfo ? `
              <div class="flash info" style="margin-top:14px">
                Stripe payment intent created. Complete the payment using the client secret
                <code>${escapeHtml(paymentInfo.clientSecret || paymentInfo.client_secret || "")}</code> with Stripe.js.
              </div>` : ""}
            <div class="q-actions" style="margin-top:18px">
              <button class="btn btn-outline btn-block" onclick="window.print()">📧 Email My quote</button>
              <a href="./index.html" class="btn btn-outline btn-block">Back to home</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- UTIL ---------- */
  function flash(msg) {
    // Inject the alert above the action row of the active screen, regardless of
    // whether we're on the legacy `.quote-card` shell or the late-stage
    // `.layout-main` (sidebar) shell.
    const host = app.querySelector(".layout-main") || app.querySelector(".quote-card");
    if (!host) return;
    host.querySelectorAll(".flash.error").forEach(n => n.remove());
    const el = document.createElement("div");
    el.className = "flash error";
    el.textContent = msg;
    const actions = host.querySelector(".q-actions");
    if (actions) host.insertBefore(el, actions); else host.appendChild(el);
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
      case 6: return renderSurveyDate();
      case 7: return renderInstallDate();
      case 8: return renderAddress();
      case 9: return renderPayMethod();
      default: return; // submission handled in-line
    }
  }

  // boot
  document.addEventListener("DOMContentLoaded", render);
})();
