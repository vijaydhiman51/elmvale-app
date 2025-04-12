const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/', authCtrl.login);
router.post('/changepassword', verifyToken, authCtrl.changePassword);
router.post('/forgotpassword', authCtrl.forgotPassword);
router.post('/resetpassword', authCtrl.resetPassword);


router.post('/register', verifyToken, requireAdmin, userCtrl.registerUser);
router.get('/profileById', verifyToken, requireAdmin, userCtrl.profileById);
router.get('/profile', verifyToken, userCtrl.profile);
router.get('/users', verifyToken, requireAdmin, userCtrl.users);

module.exports = router;
