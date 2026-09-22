/* =============================================================================
   MyChromebook.pk — shop grid renderer
   -----------------------------------------------------------------------------
   Builds the product cards on the Shop page from assets/js/products.js.
   The card markup, classes and animation delays are exactly the same as before,
   so the design, colours, fonts and reveal animations are unchanged.

   You should not need to edit this file. To change products, edit products.js.
   ============================================================================= */
(function () {
  if (typeof PRODUCTS === 'undefined') return;

  var HEART =
    '<span class="b-heart" title="Add to wishlist">' +
    '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
    '</span>';

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var SPARK = '<svg viewBox="0 0 24 24"><path d="M12 2l1.9 5.6L19.5 9l-4.6 3.4L16.3 18 12 14.9 7.7 18l1.4-5.6L4.5 9l5.6-1.4z"/></svg>';

  /* Only stock warnings and the hand-picked "tag" appear on the photo.
     The brand name is not repeated here — it is already in the title below. */
  var photoPill = function (p) {
    if (p.stock === 'out') return '<span class="b-tagpill">SOLD OUT</span>';
    if (p.stock === 'low') return '<span class="b-tagpill">LOW STOCK</span>';
    if (p.tag)             return '<span class="b-newpill">' + SPARK + esc(p.tag) + '</span>';
    return '';
  };

  var card = function (p, i) {
    var delay = ['', 'd1', 'd2', 'd3'][i % 4];
    var specs = (p.specs || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
    var sold = p.stock === 'out';
    var link = 'product-v18.html?id=' + encodeURIComponent(p.id);
    var btn = sold
      ? '<span class="btn btn-metal btn-sm">Sold out</span>'
      : '<a class="btn btn-rose btn-sm" href="' + link + '">View details</a>';

    return '' +
      '<article class="b-item rv ' + delay + '" data-cat="' + esc(p.category) + '" data-sub="' + esc(p.subcategory) + '" data-id="' + esc(p.id) + '">' +
        '<div class="b-img">' + photoPill(p) + HEART +
          '<a href="' + link + '"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></a>' +
        '</div>' +
        '<div class="b-body">' +
          '<h3><a href="' + link + '" style="color:inherit">' + esc(p.name) + '</a></h3>' +
          '<p class="desc">' + esc(p.short) + '</p>' +
          '<div class="b-spec">' + specs + '</div>' +
          '<div class="b-row">' +
            '<span class="price-pill">' + esc(p.priceText) + '</span>' + btn +
          '</div>' +
        '</div>' +
      '</article>';
  };

  var fill = function (grid, list) {
    grid.innerHTML = list.map(card).join('');
  };

  /* ---- Chromebook sections: one grid each ---- */
  ['new', 'refurb'].forEach(function (catKey) {
    var sec = document.querySelector('.sh-sec[data-sec="' + catKey + '"]');
    if (!sec) return;
    var list = PRODUCTS.filter(function (p) { return p.category === catKey; });
    var grid = sec.querySelector('.grid4');
    if (grid) fill(grid, list);
    var count = sec.querySelector('.count');
    if (count) count.textContent = list.length + (list.length === 1 ? ' model' : ' models');
  });

  /* ---- Accessories: a grid after each sub-heading ---- */
  var accSec = document.querySelector('.sh-sec[data-sec="accessories"]');
  if (accSec) {
    var total = 0;
    accSec.querySelectorAll('.sh-sub').forEach(function (head) {
      var sub = head.dataset.subhead;
      var grid = head.nextElementSibling;
      while (grid && !grid.classList.contains('grid4')) grid = grid.nextElementSibling;
      if (!grid) return;
      var list = PRODUCTS.filter(function (p) {
        return p.category === 'accessories' && p.subcategory === sub;
      });
      fill(grid, list);
      total += list.length;
    });
    var accCount = accSec.querySelector('.count');
    if (accCount) accCount.textContent = total + (total === 1 ? ' item' : ' items');
  }
})();
