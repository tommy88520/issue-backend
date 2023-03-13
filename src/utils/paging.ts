export function paginatedResults(
  pageParams: number,
  limitParams: number,
  model,
  order,
) {
  const page = pageParams || 1;
  const limit = limitParams || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  let newModel;
  if (order === 'desc') {
    newModel = model.sort(function (a, b) {
      return a.number < b.number ? 1 : -1;
    });
  } else {
    newModel = model.sort(function (a, b) {
      return a.number > b.number ? 1 : -1;
    });
  }

  const paginated = newModel.slice(startIndex, endIndex);

  return paginated;
}
