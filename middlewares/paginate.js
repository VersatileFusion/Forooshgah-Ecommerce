/**
 * Pagination middleware for API endpoints
 * Adds pagination functionality to request object
 */
module.exports = (req, res, next) => {
  // Default values
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 10;
  const MAX_LIMIT = 100;
  
  // Get page and limit from query parameters
  let page = parseInt(req.query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(req.query.limit, 10) || DEFAULT_LIMIT;
  
  // Ensure page is at least 1
  if (page < 1) {
    page = DEFAULT_PAGE;
  }
  
  // Ensure limit doesn't exceed maximum
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  } else if (limit < 1) {
    limit = DEFAULT_LIMIT;
  }
  
  // Calculate skip value for MongoDB
  const skip = (page - 1) * limit;
  
  // Add pagination object to request
  req.pagination = {
    page,
    limit,
    skip
  };
  
  // Add pagination helper function
  req.getPaginationData = (totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    
    // Build pagination metadata
    return {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      firstPage: 1,
      lastPage: totalPages
    };
  };
  
  // Add pagination links helper function
  req.getPaginationLinks = (baseUrl, totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    const url = new URL(baseUrl);
    
    // Remove existing pagination parameters
    url.searchParams.delete('page');
    url.searchParams.delete('limit');
    
    // Create URL for each pagination link
    const createUrl = (pageNum) => {
      const newUrl = new URL(url);
      newUrl.searchParams.set('page', pageNum);
      newUrl.searchParams.set('limit', limit);
      return newUrl.toString();
    };
    
    // Build links object
    return {
      first: createUrl(1),
      last: totalPages > 0 ? createUrl(totalPages) : null,
      prev: page > 1 ? createUrl(page - 1) : null,
      next: page < totalPages ? createUrl(page + 1) : null,
      self: createUrl(page)
    };
  };
  
  next();
}; 