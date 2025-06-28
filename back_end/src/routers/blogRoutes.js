// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blogController');

// GET /api/blog - Lấy danh sách bài viết
router.get('/', ctrl.getAll);

// GET /api/blog/categories - Lấy danh sách categories
router.get('/categories', ctrl.getCategories);

// GET /api/blog/popular - Lấy bài viết phổ biến
router.get('/popular', ctrl.getPopular);

// GET /api/blog/recent - Lấy bài viết gần đây
router.get('/recent', ctrl.getRecent);

// GET /api/blog/featured - Lấy bài viết nổi bật
router.get('/featured', ctrl.getFeatured);

// GET /api/blog/search - Tìm kiếm bài viết
router.get('/search', ctrl.search);

// GET /api/blog/:id - Lấy chi tiết bài viết
router.get('/:id', ctrl.getById);

module.exports = router; 