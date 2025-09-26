const router = require('express').Router();
const marketingController = require('../controllers/marketingController');

router.post('/sla', marketingController.addBrandingSla);
router.get('/slas', marketingController.getBrandingSlas);
router.delete('/sla/:id', marketingController.deleteSla);
router.put('/sla/:id', marketingController.updateSla);

module.exports = router;