/**
 * api-client.js
 * Thin wrapper around the ArronWH NestJS backend API.
 * Reads every route directly from the existing controllers in src/app/module/*
 *
 * Base: window.API_BASE (set in HTML) — defaults to http://localhost:3000/api/v1
 *
 * NOTE ON ENDPOINT GAPS:
 *   The design includes steps that are not currently covered by the backend:
 *     - Postcode-to-address lookup (e.g. /postcode/:code)  -> NOT IMPLEMENTED backend-side
 *     - Available install-date calendar (e.g. /booking/slots) -> NOT IMPLEMENTED backend-side
 *   For these, the client falls back to a local mock so the UI still works.
 *   Add real endpoints server-side and this file will already be wired.
 */

(function () {
  const BASE = window.API_BASE || "http://localhost:5000/api/v1";

  async function request(path, opts = {}) {
    const url = `${BASE}${path}`;
    const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    const res = await fetch(url, { ...opts, headers });

    let body = null;
    try { body = await res.json(); } catch { /* empty body */ }

    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return body;
  }

  const api = {
    /* ---------------- PRODUCTS (boilers) ---------------- */
    // GET /products?page=&limit=&searchTerm=&boilerAbility=...
    listBoilers(params = {}) {
      const qs = new URLSearchParams(params).toString();
      return request(`/products${qs ? "?" + qs : ""}`);
    },
    // GET /products/:id
    getBoiler(id) { return request(`/products/${id}`); },

    /* ---------------- CONTROLLERS (smart thermostats) ---------------- */
    // GET /controller?page=&limit=&searchTerm=
    listControllers(params = {}) {
      const qs = new URLSearchParams(params).toString();
      return request(`/controller${qs ? "?" + qs : ""}`);
    },
    getController(id) { return request(`/controller/${id}`); },

    /* ---------------- EXTRAS (filters, add-ons) ---------------- */
    listExtras(params = {}) {
      const qs = new URLSearchParams(params).toString();
      return request(`/extra${qs ? "?" + qs : ""}`);
    },
    getExtra(id) { return request(`/extra/${id}`); },

    /* ---------------- QUOTE (the full customer journey) ----------------
       POST /quote
       Body (see src/app/module/quote/dto/create-quote.dto.ts):
       {
         personalInfo: { title?, fastName, sureName, email, mobleNumber, postcode },
         quizAnswers: [{ question, answer }],
         productId?, controller?, extra?,
         surveyDate?, installDate?, installAddress?,
         payByCard?, payMounthly?,
         payMounthlyData?: { deposit, mounthNumber, amount }
       }
    */
    createQuote(payload) {
      return request("/quote", { method: "POST", body: JSON.stringify(payload) });
    },
    updateQuote(id, payload) {
      return request(`/quote/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    },
    getQuote(id) { return request(`/quote/${id}`); },

    /* ---------------- BOOKING (paid / confirmed) ----------------
       POST /booking    body: { quote: quoteId, price: number }
       PATCH /booking/booking-for/:id   body: { bookingFor: 'survey' | 'installation' }
    */
    createBooking(quoteId, price) {
      return request("/booking", {
        method: "POST",
        body: JSON.stringify({ quote: quoteId, price }),
      });
    },
    setBookingFor(bookingId, bookingFor) {
      return request(`/booking/booking-for/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ bookingFor }),
      });
    },

    /* ---------------- PAYMENT (Stripe) ----------------
       POST /payment/:bookingId   ->  creates a Stripe payment intent.
       Response includes the clientSecret your front-end passes to Stripe.js.
    */
    createPaymentIntent(bookingId) {
      return request(`/payment/${bookingId}`, { method: "POST" });
    },

    /* ---------------- AUTH (optional for customer flow) ---------------- */
    register(payload) {
      return request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
    },
    login(payload) {
      return request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
    },

    /* ====================================================================
       CLIENT-SIDE FALLBACKS FOR MISSING BACKEND ENDPOINTS
       ====================================================================
       These should eventually be replaced by real server endpoints.       */

    // Postcode lookup — fallback: return empty address list so the UI falls
    // back to the "Enter address manually" screen.
    async lookupPostcode(postcode) {
      // TODO: wire to real /postcode/:code endpoint once implemented server-side.
      // For now, returning an empty list triggers manual entry fallback in UI.
      return {
        postcode,
        addresses: [
          // Stubs so the UI can render something. Remove / replace with real data.
          { line1: "1 Example Street", town: "Example Town", postcode },
          { line1: "2 Example Street", town: "Example Town", postcode },
        ],
      };
    },

    // Available install-date slots — fallback: generate next 21 weekdays.
    async getInstallSlots(_fromDate) {
      // TODO: wire to real /booking/slots endpoint once implemented server-side.
      const slots = [];
      const d = new Date();
      d.setDate(d.getDate() + 3); // earliest 3 days out
      while (slots.length < 28) {
        d.setDate(d.getDate() + 1);
        // Mark weekends as unavailable to mimic real calendar
        const available = d.getDay() !== 0 && d.getDay() !== 6;
        slots.push({
          date: d.toISOString().slice(0, 10),
          available,
        });
      }
      return { slots };
    },
  };

  window.ArronAPI = api;
})();
