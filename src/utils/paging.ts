export function paginatedResults(
  pageParams: number,
  limitParams: number,
  model,
) {
  const page = pageParams || 1;
  const limit = limitParams || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedResults = model.slice(startIndex, endIndex);
  return paginatedResults;
}
