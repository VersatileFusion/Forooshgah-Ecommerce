/**
 * Utility function for paginating results
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query filters
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - Paginated results
 */
async function paginateResults(model, query = {}, options = {}) {
    const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate = null,
        select = null
    } = options;

    const skip = (page - 1) * limit;
    
    // Build the query
    let queryBuilder = model.find(query);
    
    // Apply select fields
    if (select) {
        queryBuilder = queryBuilder.select(select);
    }
    
    // Apply sort order
    queryBuilder = queryBuilder.sort(sort);
    
    // Apply pagination
    queryBuilder = queryBuilder.skip(skip).limit(limit);
    
    // Apply populate if provided
    if (populate) {
        if (Array.isArray(populate)) {
            populate.forEach(field => {
                queryBuilder = queryBuilder.populate(field);
            });
        } else {
            queryBuilder = queryBuilder.populate(populate);
        }
    }
    
    // Execute the query
    const docs = await queryBuilder.exec();
    
    // Get total count
    const totalDocs = await model.countDocuments(query);
    
    // Calculate pagination details
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
        docs,
        totalDocs,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
}

module.exports = {
    paginateResults
}; 