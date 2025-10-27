import { config } from '../core/config.js';

/**
 * 解析分页参数
 * @param {import('express').Request} req - Express请求对象
 * @returns {Object} - 分页参数
 */
export function parsePagination(req) {
  // 从查询参数中获取分页信息
  const { page, pageSize, limit, offset } = req.query;
  
  // 默认页码为1
  const pageNum = parseInt(page) || parseInt(req.query.current) || 1;
  
  // 默认每页条数为配置中的默认值
  const size = parseInt(pageSize) || parseInt(limit) || config.pagination.defaultPageSize;
  
  // 计算偏移量
  const skip = parseInt(offset) || (pageNum - 1) * size;
  
  // 确保页码至少为1
  const validPage = Math.max(1, pageNum);
  
  // 确保每页条数在合理范围内
  const validPageSize = Math.min(
    Math.max(1, size),
    config.pagination.maxPageSize
  );
  
  return {
    page: validPage,
    pageSize: validPageSize,
    skip,
    take: validPageSize
  };
}

/**
 * 应用分页到查询
 * @param {Object} queryBuilder - TypeORM查询构建器
 * @param {Object} pagination - 分页参数
 * @returns {Object} - 应用了分页的查询构建器
 */
export function applyPagination(queryBuilder, pagination) {
  const { skip, take } = pagination;
  
  // 应用分页
  return queryBuilder.skip(skip).take(take);
}

/**
 * 构建分页响应
 * @param {Array} data - 数据列表
 * @param {number} total - 总数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页条数
 * @returns {Object} - 分页响应对象
 */
export function buildPaginationResponse(data, total, page, pageSize) {
  // 计算总页数
  const totalPage = Math.ceil(total / pageSize);
  
  return {
    list: data,
    pagination: {
      total,
      page,
      pageSize,
      totalPage
    }
  };
}

/**
 * 解析排序参数
 * @param {import('express').Request} req - Express请求对象
 * @param {Array} allowedFields - 允许排序的字段
 * @returns {Array} - 排序规则
 */
export function parseSorting(req, allowedFields = []) {
  const { sort, order } = req.query;
  
  // 如果没有指定排序字段，返回空数组
  if (!sort) {
    return [];
  }
  
  // 处理多个排序字段
  const sortFields = sort.split(',').map(field => field.trim());
  const orderDirections = order ? order.split(',').map(dir => dir.trim().toUpperCase()) : [];
  
  const sortingRules = [];
  
  sortFields.forEach((field, index) => {
    // 检查是否允许排序该字段
    if (allowedFields.length > 0 && !allowedFields.includes(field)) {
      return;
    }
    
    // 获取排序方向
    const direction = orderDirections[index] || 'ASC';
    
    // 验证排序方向
    const validDirection = direction === 'DESC' ? 'DESC' : 'ASC';
    
    // 添加排序规则
    sortingRules.push({ field, direction: validDirection });
  });
  
  return sortingRules;
}

/**
 * 应用排序到查询
 * @param {Object} queryBuilder - TypeORM查询构建器
 * @param {Array} sortingRules - 排序规则
 * @returns {Object} - 应用了排序的查询构建器
 */
export function applySorting(queryBuilder, sortingRules) {
  sortingRules.forEach(({ field, direction }) => {
    queryBuilder.addOrderBy(field, direction);
  });
  
  return queryBuilder;
}

/**
 * 解析过滤参数
 * @param {import('express').Request} req - Express请求对象
 * @param {Array} allowedFilters - 允许过滤的字段
 * @returns {Object} - 过滤条件
 */
export function parseFilters(req, allowedFilters = []) {
  const filters = {};
  
  // 遍历查询参数
  Object.keys(req.query).forEach(key => {
    // 跳过分页和排序参数
    if (['page', 'pageSize', 'limit', 'offset', 'sort', 'order'].includes(key)) {
      return;
    }
    
    // 检查是否允许过滤该字段
    if (allowedFilters.length > 0 && !allowedFilters.includes(key)) {
      return;
    }
    
    // 获取过滤值
    const value = req.query[key];
    
    // 处理特殊过滤规则
    if (key.endsWith('_min')) {
      const field = key.slice(0, -4);
      filters[field] = filters[field] || {};
      filters[field].min = value;
    } else if (key.endsWith('_max')) {
      const field = key.slice(0, -4);
      filters[field] = filters[field] || {};
      filters[field].max = value;
    } else if (key.endsWith('_like')) {
      const field = key.slice(0, -5);
      filters[field] = filters[field] || {};
      filters[field].like = value;
    } else {
      filters[key] = value;
    }
  });
  
  return filters;
}

/**
 * 应用过滤到查询
 * @param {Object} queryBuilder - TypeORM查询构建器
 * @param {Object} filters - 过滤条件
 * @returns {Object} - 应用了过滤的查询构建器
 */
export function applyFilters(queryBuilder, filters) {
  Object.entries(filters).forEach(([field, value]) => {
    if (typeof value === 'object') {
      // 处理范围过滤
      if (value.min !== undefined) {
        queryBuilder.andWhere(`${field} >= :${field}_min`, { [`${field}_min`]: value.min });
      }
      if (value.max !== undefined) {
        queryBuilder.andWhere(`${field} <= :${field}_max`, { [`${field}_max`]: value.max });
      }
      // 处理模糊查询
      if (value.like !== undefined) {
        queryBuilder.andWhere(`${field} LIKE :${field}_like`, { [`${field}_like`]: `%${value.like}%` });
      }
    } else if (Array.isArray(value)) {
      // 处理数组查询
      queryBuilder.andWhere(`${field} IN (:...${field})`, { [field]: value });
    } else if (value !== null && value !== undefined && value !== '') {
      // 处理普通等值查询
      queryBuilder.andWhere(`${field} = :${field}`, { [field]: value });
    }
  });
  
  return queryBuilder;
}