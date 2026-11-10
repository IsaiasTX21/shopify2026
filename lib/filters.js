
export function parseFilters(sp) {
  const raw = [].concat(sp?.f ?? []).slice(0, 25);
  const parsed = [];
  for (const r of raw) {
    try {
      const o = JSON.parse(r);
      if (o && typeof o === "object" && !Array.isArray(o)) parsed.push(o);
    } catch {}
  }
  return { raw, parsed };
}
