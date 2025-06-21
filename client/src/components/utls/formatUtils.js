export const formatCredits = (credits) => {
  if (typeof credits !== "number") return "";
  return `${Number.isInteger(credits) ? credits : credits.toFixed(1)} נק״ז`;
};
