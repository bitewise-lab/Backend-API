const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { createPost, getAllPosts, getPostById, updatePost, deletePost } = require('../controllers/postController');

const router = express.Router();


router.post('/post', authMiddleware, createPost);  

router.get('/post', getAllPosts);
router.get('/post/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

module.exports = router;
