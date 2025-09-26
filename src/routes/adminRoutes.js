const router = require('express').Router();
const adminController = require('../controllers/adminController');

router.get('/data', adminController.getAllData);
router.post('/run-model', adminController.runModel);
router.get('/train-overview', adminController.getTrainOverview);

module.exports = router;