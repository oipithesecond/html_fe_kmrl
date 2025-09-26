const router = require('express').Router();
const depotController = require('../controllers/depotController');

router.post('/layout', depotController.addLayoutCost);
router.get('/layouts', depotController.getLayoutCosts);
router.delete('/layout/:id', depotController.deleteLayoutCost);
router.put('/layout/:id', depotController.updateLayoutCost);

router.post('/resource', depotController.addResource);
router.get('/resources', depotController.getResources);
router.delete('/resource/:id', depotController.deleteResource);
router.put('/resource/:id', depotController.updateResource);

module.exports = router;