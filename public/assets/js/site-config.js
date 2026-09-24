/* =============================================================================
   MyChromebook.pk — SITE SETTINGS
   -----------------------------------------------------------------------------
   Everything the business may need to change without touching any code.
   Edit the values between the quotes, save, and push.
   ============================================================================= */

const SITE_CONFIG = {

  /* ---- WhatsApp -----------------------------------------------------------
     International format, digits only, no + or spaces.  Example: "923302007440"
     While this is empty, WhatsApp buttons still work — they open WhatsApp and
     let the customer choose the chat — so nothing looks broken in the demo. */
  whatsapp: "",
  whatsappDisplay: "+92 3XX XXXXXXX",          // how the number is shown on screen

  /* ---- Bank transfer details shown at checkout and on the order page ------ */
  bank: {
    bankName:     "Bank name — to be confirmed",
    accountTitle: "Tech Valley (MyChromebook.pk)",
    accountNo:    "0000 0000 0000 0000",
    iban:         "PK00 XXXX 0000 0000 0000 0000"
  },

  /* ---- Store --------------------------------------------------------------- */
  storeName:    "MyChromebook.pk",
  email:        "info@mychromebook.pk",
  phoneDisplay: "+92 330 2007440",
  currency:     "₨",                        // ₨
  deliveryFee:  0,                               // 0 = free delivery
  orderPrefix:  "MCB",

  /* ---- Admin panel (DEMO) --------------------------------------------------
     This password only protects the demo admin screen in the browser.
     It is NOT real security — anyone who reads this file can see it.
     A proper login arrives in Phase 2 with the server. */
  adminPassword: "admin123"
};
