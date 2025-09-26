const router = require('express').Router();
const maintenanceController = require('../controllers/maintenanceController');

router.post('/fitness', maintenanceController.addFitnessCertificate);
router.get('/fitness', maintenanceController.getFitnessCertificates);
router.delete('/fitness/:id', maintenanceController.deleteFitnessCertificate);
router.put('/fitness/:id', maintenanceController.updateFitnessCertificate);

router.post('/jobcard', maintenanceController.addJobCard);
router.get('/jobcards', maintenanceController.getJobCards);
router.delete('/jobcard/:id', maintenanceController.deleteJobCard);
router.put('/jobcard/:id', maintenanceController.updateJobCard);

module.exports = router;