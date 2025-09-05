export function getLocalizedField(q, lang) {
  if (!q) return "";
  switch (lang) {
    case "en":
      return q.titleEn || q.title;   // fallback a español
    case "fr":
      return q.titleFr || q.title;
    default:
      return q.title;
  }
}

export function getLocalizedOption(opt, lang) {
  if (!opt) return "";
  switch (lang) {
    case "en":
      return opt.labelEn || opt.label;
    case "fr":
      return opt.labelFr || opt.label;
    default:
      return opt.label;
  }
}
