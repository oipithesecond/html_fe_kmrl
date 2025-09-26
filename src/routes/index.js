const router = require('express').Router();

const adminRoutes = require('./adminRoutes');
const depotRoutes = require('./depotRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const marketingRoutes = require('./marketingRoutes');
const trainsetRoutes = require('./trainsetRoutes');

router.use('/admin', adminRoutes);
router.use('/depot', depotRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/marketing', marketingRoutes);
router.use('/trainset', trainsetRoutes);

module.exports = router;