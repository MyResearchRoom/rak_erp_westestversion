exports.validateQueryParams = (query = {}) => {
  let { searchTerm, page, limit, sortBy, sortOrder } = query;

  searchTerm = typeof searchTerm === "string" ? searchTerm.trim() : "";

  page = parseInt(page);
  if (isNaN(page) || page < 1) page = 1;

  if (limit === "all" || limit==="All") {
    return {
      searchTerm,
      page: 1,
      limit: null,
      offset: null,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
    };
  }

  limit = parseInt(limit);
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  return {
    searchTerm,
    page,
    limit,
    offset: (page - 1) * limit,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
  };
};