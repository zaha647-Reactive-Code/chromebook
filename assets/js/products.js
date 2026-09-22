/* =============================================================================
   MyChromebook.pk — product catalogue
   -----------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE PRODUCTS.
   Do not edit prices or product text inside the HTML pages any more.

   To change a price ....... edit  "price"      (numbers only, no commas)
   To mark sold out ........ set   "stock"      to  "out"
   To mark low stock ....... set   "stock"      to  "low"
   To change a photo ....... edit  "image"      (path inside assets/)
   To add more photos ...... add   "gallery"    entries
   To add a product ........ copy a whole { ... } block and edit it

   Fields:
     id ........... short web name, used in the product page link (no spaces)
     name ......... product title shown to the customer
     category ..... "new" | "refurb" | "accessories"
     subcategory .. "" | "audio" | "mice" | "stylus" | "sleeves"
     badge ........ small pill on the photo, e.g. "ALLIED · NEW"
     image ........ main photo
     gallery ...... list of photos for the product page
     short ........ one-line description
     specs ........ short spec chips shown on the card
     price ........ number only, e.g. 105000
     priceText .... how it is displayed, e.g. "₨ 105,000"
     stock ........ "in" | "low" | "out"
     condition .... "new" | "refurbished" | ""
     warranty ..... e.g. "1 year official warranty"  (optional)
   ============================================================================= */

const PRODUCTS = [
  {
    "id": "allied-chromebook-11",
    "name": "Allied Chromebook 11",
    "category": "new",
    "subcategory": "",
    "badge": "ALLIED · NEW",
    "image": "assets/shop/new-allied-11.jpg",
    "gallery": [
      "assets/shop/new-allied-11.jpg"
    ],
    "short": "A dependable everyday partner for students and teachers — starts in seconds, smooth all day.",
    "specs": [
      "Intel N5100",
      "4 GB",
      "32 GB",
      "Till 2031"
    ],
    "price": 105000,
    "priceText": "₨ 105,000",
    "stock": "in",
    "condition": "new",
    "warranty": ""
  },
  {
    "id": "centerm-mars-m610",
    "name": "Centerm Mars M610",
    "category": "new",
    "subcategory": "",
    "badge": "CENTERM · NEW",
    "image": "assets/shop/new-centerm-m610.jpg",
    "gallery": [
      "assets/shop/new-centerm-m610.jpg"
    ],
    "short": "Lightweight, affordable, and easy to use — with stylus support for notes and sketches.",
    "specs": [
      "ChromeOS",
      "Stylus",
      "Lightweight"
    ],
    "price": 95000,
    "priceText": "₨ 95,000",
    "stock": "in",
    "condition": "new",
    "warranty": ""
  },
  {
    "id": "centerm-flip-2-in-1",
    "name": "Centerm Flip 2-in-1",
    "category": "new",
    "subcategory": "",
    "badge": "CENTERM · NEW",
    "image": "assets/shop/new-centerm-flip.jpg",
    "gallery": [
      "assets/shop/new-centerm-flip.jpg"
    ],
    "short": "Convertible Chromebook that folds into a tablet — laptop for work, tablet for reading.",
    "specs": [
      "2-in-1",
      "Touch",
      "ChromeOS"
    ],
    "price": 120000,
    "priceText": "₨ 120,000",
    "stock": "in",
    "condition": "new",
    "warranty": ""
  },
  {
    "id": "ctl-chromebook-px11eg",
    "name": "CTL Chromebook PX11EG",
    "category": "new",
    "subcategory": "",
    "badge": "CTL · NEW",
    "image": "assets/shop/new-ctl-px11eg.jpg",
    "gallery": [
      "assets/shop/new-ctl-px11eg.jpg"
    ],
    "short": "Steady, reliable performance for daily learning, with built-in security and silent updates.",
    "specs": [
      "Intel N5100",
      "4 GB",
      "32 GB",
      "Till 2031"
    ],
    "price": 90000,
    "priceText": "₨ 90,000",
    "stock": "in",
    "condition": "new",
    "warranty": ""
  },
  {
    "id": "ctl-chromebook-nl71",
    "name": "CTL Chromebook NL71",
    "category": "refurb",
    "subcategory": "",
    "badge": "CTL · REFURBISHED",
    "image": "assets/shop/refurb-ctl-nl71.jpg",
    "gallery": [
      "assets/shop/refurb-ctl-nl71.jpg"
    ],
    "short": "Certified refurbished with a 180° rotating camera — fully tested, verified, budget-friendly.",
    "specs": [
      "Certified refurb",
      "180° camera",
      "Rugged"
    ],
    "price": 30000,
    "priceText": "₨ 30,000",
    "stock": "in",
    "condition": "refurbished",
    "warranty": ""
  },
  {
    "id": "ctl-chromebook-nl7t-flip",
    "name": "CTL Chromebook NL7T Flip",
    "category": "refurb",
    "subcategory": "",
    "badge": "CTL · REFURBISHED",
    "image": "assets/shop/refurb-ctl-nl7t.jpg",
    "gallery": [
      "assets/shop/refurb-ctl-nl7t.jpg"
    ],
    "short": "Refurbished 2-in-1 touchscreen — laptop, tent, and tablet modes.",
    "specs": [
      "Certified refurb",
      "Touch",
      "2-in-1"
    ],
    "price": 35000,
    "priceText": "₨ 35,000",
    "stock": "in",
    "condition": "refurbished",
    "warranty": ""
  },
  {
    "id": "ctl-chromebook-nl72t",
    "name": "CTL Chromebook NL72T",
    "category": "refurb",
    "subcategory": "",
    "badge": "CTL · REFURBISHED",
    "image": "assets/shop/refurb-ctl-nl72t.jpg",
    "gallery": [
      "assets/shop/refurb-ctl-nl72t.jpg"
    ],
    "short": "Refurbished convertible with a bright touch display and long battery life.",
    "specs": [
      "Certified refurb",
      "Touch",
      "Convertible"
    ],
    "price": 42000,
    "priceText": "₨ 42,000",
    "stock": "in",
    "condition": "refurbished",
    "warranty": ""
  },
  {
    "id": "over-ear-wireless-headphones-graphite",
    "name": "Over-Ear Wireless Headphones — Graphite",
    "category": "accessories",
    "subcategory": "audio",
    "badge": "AUDIO",
    "image": "assets/shop/acc-headphones-black.jpg",
    "gallery": [
      "assets/shop/acc-headphones-black.jpg"
    ],
    "short": "Rich sound, soft cushions, and long battery life for classes and calls.",
    "specs": [
      "Bluetooth 5.3",
      "30h battery"
    ],
    "price": 12000,
    "priceText": "₨ 12,000",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "over-ear-wireless-headphones-silver",
    "name": "Over-Ear Wireless Headphones — Silver",
    "category": "accessories",
    "subcategory": "audio",
    "badge": "AUDIO",
    "image": "assets/shop/acc-headphones-silver.jpg",
    "gallery": [
      "assets/shop/acc-headphones-silver.jpg"
    ],
    "short": "Same comfort and sound in a clean silver finish.",
    "specs": [
      "Bluetooth 5.3",
      "30h battery"
    ],
    "price": 12000,
    "priceText": "₨ 12,000",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "wireless-earbuds-pro",
    "name": "Wireless Earbuds Pro",
    "category": "accessories",
    "subcategory": "audio",
    "badge": "AUDIO",
    "image": "assets/shop/acc-earbuds.jpg",
    "gallery": [
      "assets/shop/acc-earbuds.jpg"
    ],
    "short": "Noise-cancelling earbuds with charging case — perfect for online lessons.",
    "specs": [
      "ANC",
      "24h with case"
    ],
    "price": 9500,
    "priceText": "₨ 9,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "wired-earphones-with-mic",
    "name": "Wired Earphones with Mic",
    "category": "accessories",
    "subcategory": "audio",
    "badge": "AUDIO",
    "image": "assets/shop/acc-earphones-wired.jpg",
    "gallery": [
      "assets/shop/acc-earphones-wired.jpg"
    ],
    "short": "Simple 3.5 mm earphones with in-line mic — no charging needed.",
    "specs": [
      "3.5 mm",
      "In-line mic"
    ],
    "price": 1200,
    "priceText": "₨ 1,200",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "wireless-mouse-blush",
    "name": "Wireless Mouse — Blush",
    "category": "accessories",
    "subcategory": "mice",
    "badge": "MOUSE",
    "image": "assets/shop/acc-mouse-blush.jpg",
    "gallery": [
      "assets/shop/acc-mouse-blush.jpg"
    ],
    "short": "Silent-click wireless mouse in a soft blush finish.",
    "specs": [
      "2.4G",
      "Silent click"
    ],
    "price": 1800,
    "priceText": "₨ 1,800",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "wireless-mouse-sky-blue",
    "name": "Wireless Mouse — Sky Blue",
    "category": "accessories",
    "subcategory": "mice",
    "badge": "MOUSE",
    "image": "assets/shop/acc-mouse-blue.jpg",
    "gallery": [
      "assets/shop/acc-mouse-blue.jpg"
    ],
    "short": "Noiseless portable mouse with USB receiver.",
    "specs": [
      "2.4G",
      "USB receiver"
    ],
    "price": 1800,
    "priceText": "₨ 1,800",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "slim-rechargeable-mouse-rgb",
    "name": "Slim Rechargeable Mouse — RGB",
    "category": "accessories",
    "subcategory": "mice",
    "badge": "MOUSE",
    "image": "assets/shop/acc-mouse-slim-rgb.jpg",
    "gallery": [
      "assets/shop/acc-mouse-slim-rgb.jpg"
    ],
    "short": "Ultra-thin Bluetooth mouse with soft RGB edge lighting.",
    "specs": [
      "Bluetooth",
      "Rechargeable"
    ],
    "price": 2800,
    "priceText": "₨ 2,800",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "ergonomic-wireless-mouse-black",
    "name": "Ergonomic Wireless Mouse — Black",
    "category": "accessories",
    "subcategory": "mice",
    "badge": "MOUSE",
    "image": "assets/shop/acc-mouse-ergo.jpg",
    "gallery": [
      "assets/shop/acc-mouse-ergo.jpg"
    ],
    "short": "Comfortable full-size wireless mouse for long work sessions.",
    "specs": [
      "2.4G",
      "Ergonomic"
    ],
    "price": 2200,
    "priceText": "₨ 2,200",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "wireless-keyboard-silver",
    "name": "Wireless Keyboard — Silver",
    "category": "accessories",
    "subcategory": "mice",
    "badge": "KEYBOARD",
    "image": "assets/shop/acc-keyboard.jpg",
    "gallery": [
      "assets/shop/acc-keyboard.jpg"
    ],
    "short": "Slim, quiet wireless keyboard that pairs with any Chromebook.",
    "specs": [
      "Bluetooth",
      "Rechargeable"
    ],
    "price": 7500,
    "priceText": "₨ 7,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "active-stylus-pen-white",
    "name": "Active Stylus Pen — White",
    "category": "accessories",
    "subcategory": "stylus",
    "badge": "STYLUS",
    "image": "assets/shop/acc-stylus-white.jpg",
    "gallery": [
      "assets/shop/acc-stylus-white.jpg"
    ],
    "short": "Precise stylus for touchscreen Chromebooks — notes, sketches, annotations.",
    "specs": [
      "Palm rejection",
      "USB-C charge"
    ],
    "price": 3500,
    "priceText": "₨ 3,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "active-stylus-pen-sky-blue-2-pack",
    "name": "Active Stylus Pen — Sky Blue (2 pack)",
    "category": "accessories",
    "subcategory": "stylus",
    "badge": "STYLUS",
    "image": "assets/shop/acc-stylus-blue.jpg",
    "gallery": [
      "assets/shop/acc-stylus-blue.jpg"
    ],
    "short": "Two stylus pens with spare tips — great for classrooms.",
    "specs": [
      "2 pack",
      "Spare tips"
    ],
    "price": 4200,
    "priceText": "₨ 4,200",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "silicone-watch-band-sky-blue",
    "name": "Silicone Watch Band — Sky Blue",
    "category": "accessories",
    "subcategory": "stylus",
    "badge": "WEARABLE",
    "image": "assets/shop/acc-band-blue.jpg",
    "gallery": [
      "assets/shop/acc-band-blue.jpg"
    ],
    "short": "Soft silicone sports band, fits most smartwatch sizes.",
    "specs": [
      "38–45 mm",
      "Waterproof"
    ],
    "price": 1500,
    "priceText": "₨ 1,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "silicone-watch-band-white",
    "name": "Silicone Watch Band — White",
    "category": "accessories",
    "subcategory": "stylus",
    "badge": "WEARABLE",
    "image": "assets/shop/acc-band-white.jpg",
    "gallery": [
      "assets/shop/acc-band-white.jpg"
    ],
    "short": "Soft silicone sports band, fits most smartwatch sizes.",
    "specs": [
      "38–45 mm",
      "Waterproof"
    ],
    "price": 1500,
    "priceText": "₨ 1,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "leather-laptop-sleeve-tan",
    "name": "Leather Laptop Sleeve — Tan",
    "category": "accessories",
    "subcategory": "sleeves",
    "badge": "SLEEVE",
    "image": "assets/shop/acc-sleeve-tan.webp",
    "gallery": [
      "assets/shop/acc-sleeve-tan.webp"
    ],
    "short": "Slim envelope sleeve in vegan leather with magnetic flap. Fits 11–13\" Chromebooks.",
    "specs": [
      "11–13\"",
      "Vegan leather"
    ],
    "price": 4500,
    "priceText": "₨ 4,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "2-in-1-reversible-sleeve",
    "name": "2-in-1 Reversible Sleeve",
    "category": "accessories",
    "subcategory": "sleeves",
    "badge": "SLEEVE",
    "image": "assets/shop/acc-sleeve-reversible.jpg",
    "gallery": [
      "assets/shop/acc-sleeve-reversible.jpg"
    ],
    "short": "Soft neoprene sleeve, black outside, red inside — flip it to change the look.",
    "specs": [
      "11–14\"",
      "Water-resistant"
    ],
    "price": 2500,
    "priceText": "₨ 2,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "45w-usb-c-charger",
    "name": "45W USB-C Charger",
    "category": "accessories",
    "subcategory": "sleeves",
    "badge": "CHARGER",
    "image": "assets/shop/acc-charger-45w.webp",
    "gallery": [
      "assets/shop/acc-charger-45w.webp"
    ],
    "short": "Fast, compact USB-C PD charger for Chromebooks — a spare for school or the office.",
    "specs": [
      "45W USB-C",
      "Foldable plug"
    ],
    "price": 6500,
    "priceText": "₨ 6,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  },
  {
    "id": "65w-usb-c-charger-grey",
    "name": "65W USB-C Charger — Grey",
    "category": "accessories",
    "subcategory": "sleeves",
    "badge": "CHARGER",
    "image": "assets/shop/acc-charger-usbc.jpg",
    "gallery": [
      "assets/shop/acc-charger-usbc.jpg"
    ],
    "short": "Compact wall charger with braided USB-C cable; works with all USB-C Chromebooks.",
    "specs": [
      "65W USB-C",
      "1.8 m cable"
    ],
    "price": 7500,
    "priceText": "₨ 7,500",
    "stock": "in",
    "condition": "",
    "warranty": ""
  }
];

/* ---- small helpers used by the shop, search and product pages ---- */
const ProductStore = {
  all()            { return PRODUCTS; },
  byId(id)         { return PRODUCTS.find(p => p.id === id) || null; },
  byCategory(c)    { return c === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === c); },
  inStock()        { return PRODUCTS.filter(p => p.stock !== 'out'); },
  search(term) {
    const t = (term || '').trim().toLowerCase();
    if (!t) return [];
    return PRODUCTS.filter(p =>
      (p.name + ' ' + p.short + ' ' + p.specs.join(' ') + ' ' + p.badge).toLowerCase().includes(t)
    );
  },
  related(id, limit) {
    const p = ProductStore.byId(id);
    if (!p) return [];
    return PRODUCTS
      .filter(x => x.id !== id && x.category === p.category)
      .slice(0, limit || 4);
  }
};

if (typeof module !== 'undefined') { module.exports = { PRODUCTS, ProductStore }; }
