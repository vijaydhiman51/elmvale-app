const express = require('express');
const router = express.Router();
const galleryCtrl = require('../controllers/galleryController');
const newsCtrl = require('../controllers/newsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/gallery/UploadImage', verifyToken, requireAdmin, galleryCtrl.UploadImage);
router.get('/gallery/GetAllImages', verifyToken, galleryCtrl.GetAllImages);
router.delete('/gallery/delete', verifyToken, requireAdmin, galleryCtrl.DeleteImage);

router.post('/news/add', verifyToken, requireAdmin, newsCtrl.AddNews);
router.get('/news/GetAll', verifyToken, newsCtrl.getAllNews);
router.delete('/news/delete', verifyToken, requireAdmin, newsCtrl.DeleteNews);
module.exports = router;
