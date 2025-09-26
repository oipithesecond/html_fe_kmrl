const router = require('express').Router();
const trainsetController = require('../controllers/trainsetController');

router.post('/master', trainsetController.addTrainset);
router.get('/master', trainsetController.getTrainsets);
router.delete('/master/:id', trainsetController.deleteTrainset);
router.put('/master/:id', trainsetController.updateTrainset);

module.exports = router;