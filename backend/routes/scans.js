const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const scanController = require('../controllers/scanController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/scan-all', auth, scanController.scanAll);
router.post('/', auth, upload.single('resume'), scanController.uploadScan);
router.get('/', auth, scanController.getUserScans);
router.get('/admin/all', auth, scanController.getAllScans);
router.get('/:id', auth, scanController.getScanById);
router.delete('/:id', auth, scanController.deleteScan);

module.exports = router;
