/**
 * 分页工具
 */
export const paginationUtil = {
  /**
   * 解析分页参数
   * @param {Object} query - 请求查询参数
   * @param {number} defaultPage - 默认页码
   * @param {number} defaultPageSize - 默认每页大小
   * @param {number} maxPageSize - 最大每页大小
   * @returns {Object} 分页参数对象
   */
  parsePagination(query, defaultPage = 1, defaultPageSize = 10, maxPageSize = 100) {
    // 解析页码，确保是正整数
    let page = parseInt(query.page) || defaultPage;
    page = Math.max(1, page);

    // 解析每页大小，确保在合理范围内
    let pageSize = parseInt(query.pageSize) || defaultPageSize;
    pageSize = Math.max(1, Math.min(pageSize, maxPageSize));

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    return {
      page,
      pageSize,
      offset
    };
  },

  /**
   * 生成TypeORM分页选项
   * @param {Object} query - 请求查询参数
   * @param {Object} options - 分页选项
   * @returns {Object} TypeORM查询选项
   */
  createPaginationOptions(query, options = {}) {
    const {
      defaultPage = 1,
      defaultPageSize = 10,
      maxPageSize = 100,
      orderBy = 'created_at',
      orderDirection = 'DESC'
    } = options;

    const { page, pageSize, offset } = this.parsePagination(
      query,
      defaultPage,
      defaultPageSize,
      maxPageSize
    );

    return {
      skip: offset,
      take: pageSize,
      order: {
        [orderBy]: orderDirection
      }
    };
  },

  /**
   * 计算总页数
   * @param {number} total - 总记录数
   * @param {number} pageSize - 每页大小
   * @returns {number} 总页数
   */
  calculateTotalPages(total, pageSize) {
    return Math.ceil(total / pageSize);
  },

  /**
   * 生成分页元数据
   * @param {number} page - 当前页码
   * @param {number} pageSize - 每页大小
   * @param {number} total - 总记录数
   * @returns {Object} 分页元数据
   */
  createPaginationMeta(page, pageSize, total) {
    const totalPages = this.calculateTotalPages(total, pageSize);
    
    return {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };
  },

  /**
   * 应用分页到结果集
   * @param {Array} items - 数据项数组
   * @param {number} page - 当前页码
   * @param {number} pageSize - 每页大小
   * @returns {Object} 分页后的结果
   */
  paginateArray(items, page = 1, pageSize = 10) {
    const total = items.length;
    const offset = (page - 1) * pageSize;
    const paginatedItems = items.slice(offset, offset + pageSize);
    
    return {
      items: paginatedItems,
      meta: this.createPaginationMeta(page, pageSize, total)
    };
  }
};

/**
 * 排序工具
 */
export const sortUtil = {
  /**
   * 解析排序参数
   * @param {string} sortBy - 排序字段
   * @param {string} sortOrder - 排序方向
   * @param {Array} allowedFields - 允许的排序字段
   * @param {string} defaultField - 默认排序字段
   * @param {string} defaultOrder - 默认排序方向
   * @returns {Object} 排序选项
   */
  parseSorting(sortBy, sortOrder, allowedFields = [], defaultField = 'created_at', defaultOrder = 'DESC') {
    // 验证排序字段
    let field = defaultField;
    if (sortBy && allowedFields.includes(sortBy)) {
      field = sortBy;
    }

    // 验证排序方向
    let order = defaultOrder.toUpperCase();
    if (sortOrder && ['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
      order = sortOrder.toUpperCase();
    }

    return {
      field,
      order
    };
  },

  /**
   * 生成排序对象
   * @param {string} sortBy - 排序字段
   * @param {string} sortOrder - 排序方向
   * @param {Array} allowedFields - 允许的排序字段
   * @returns {Object} TypeORM排序对象
   */
  createSortObject(sortBy, sortOrder, allowedFields = []) {
    const { field, order } = this.parseSorting(sortBy, sortOrder, allowedFields);
    return {
      [field]: order
    };
  }
};