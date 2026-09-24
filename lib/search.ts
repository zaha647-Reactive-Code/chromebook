/* Product search — every typed word must match somewhere; name matches rank first. */
const CAT_WORDS: Record<string, string> = {
  new: 'new chromebook laptop',
  refurb: 'refurbished refurb chromebook laptop used',
  accessories: 'accessory accessories',
};

type Searchable = { id: string; name: string; short: string; specs: string[]; subcategory: string; category: string; stockQty: number; details?: Record<string, any> };

export function searchProducts<T extends Searchable>(list: T[], term: string, limit = 50): T[] {
  const t = String(term || '').trim().toLowerCase();
  if (!t) return [];
  const words = t.split(/\s+/);
  return list
    .map((p) => {
      const name = p.name.toLowerCase();
      const hay = [name, p.short, (p.specs || []).join(' '), p.subcategory, CAT_WORDS[p.category] || '',
        p.details ? Object.values(p.details).join(' ') : ''].join(' ').toLowerCase();
      let score = 0;
      for (const w of words) {
        if (!hay.includes(w)) return null;
        if (name.startsWith(w)) score += 6;
        else if (name.includes(' ' + w)) score += 4;
        else if (name.includes(w)) score += 3;
        else score += 1;
      }
      if (p.stockQty <= 0) score -= 1;
      return { p, score };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, limit)
    .map((x) => x!.p);
}
