function isBlank(value) {
  return value === undefined || value === null || value === "";
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function calculateProgressScore(uomType, target, achievement, deadline) {
  if (isBlank(achievement)) return null;
  let score = null;
  if (uomType === "min") {
    const t = Number(target);
    const a = Number(achievement);
    if (!t) return null;
    score = (a / t) * 100;
  }
  if (uomType === "max") {
    const t = Number(target);
    const a = Number(achievement);
    if (!a) return null;
    score = (t / a) * 100;
  }
  if (uomType === "timeline") {
    const completed = new Date(achievement);
    const due = new Date(deadline || target);
    if (Number.isNaN(completed.getTime()) || Number.isNaN(due.getTime())) return null;
    if (completed <= due) score = 100;
    else {
      const lateDays = Math.ceil((completed - due) / 86400000);
      score = Math.max(0, 100 - lateDays * 2);
    }
  }
  if (uomType === "zero") score = Number(achievement) === 0 ? 100 : 0;
  if (score === null) return null;
  return round(Math.min(score, 150));
}

export { calculateProgressScore, calculateProgressScore as calculateScore };
