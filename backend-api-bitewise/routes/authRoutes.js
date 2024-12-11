const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { register, login, updateUser, deleteUser } = require('../controllers/authController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', register,authController.register);
router.post('/login', login);

router.delete('/user/:id', deleteUser); 
router.put('/user', authMiddleware, updateUser); // Tidak perlu :id



module.exports = router;
