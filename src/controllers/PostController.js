const PostService = require('../services/PostService');
const { STATUS_CODES, MESSAGES } = require('../constants/appConstants');

class PostController {
  // 获取文章列表
  static async getPosts(req, res, next) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const data = await PostService.getPosts(parseInt(page), parseInt(pageSize));
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: {
          count: data.total,
          list: data.list
        },
        page: {
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // 获取文章详情
  static async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await PostService.getPostById(id);
      
      if (!data) {
        return res.json({
          code: STATUS_CODES.NOT_FOUND,
          message: MESSAGES.NOT_FOUND,
          data: null,
          page: {}
        });
      }
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: data,
        page: {}
      });
    } catch (error) {
      next(error);
    }
  }
  
  // 创建文章
  static async createPost(req, res, next) {
    try {
      const data = await PostService.createPost(req.body);
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: data,
        page: {}
      });
    } catch (error) {
      next(error);
    }
  }
  
  // 更新文章
  static async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const data = await PostService.updatePost(id, req.body);
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: data,
        page: {}
      });
    } catch (error) {
      next(error);
    }
  }
  
  // 删除文章
  static async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PostService.deletePost(id);
      
      if (!result) {
        return res.json({
          code: STATUS_CODES.NOT_FOUND,
          message: MESSAGES.NOT_FOUND,
          data: null,
          page: {}
        });
      }
      
      res.json({
        code: STATUS_CODES.SUCCESS,
        message: MESSAGES.SUCCESS,
        data: { deleted: true },
        page: {}
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PostController;