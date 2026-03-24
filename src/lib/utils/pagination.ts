// Fonction qui calcule les numéros de pages à afficher dans la pagination, en fonction de la page courante, du nombre total de
// pages et du nombre maximum de boutons à afficher
export function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxButtons: number,
): number[] {
  if (totalPages <= 0) return [];

  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const halfWindow = Math.floor(maxButtons / 2);
  let start = Math.max(1, currentPage - halfWindow);
  let end = Math.min(totalPages, start + maxButtons - 1);

  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages === 0) return 1;
  return Math.max(1, Math.min(page, totalPages));
}
