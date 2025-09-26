const db = require('../database');

const addTrainset = (req, res) => {
    const { trainset_id, cumulative_mileage_km, in_service_date, has_branding_wrap } = req.body;
    const sql = `INSERT INTO trainsets (trainset_id, cumulative_mileage_km, in_service_date, has_branding_wrap) VALUES (?,?,?,?)`;
    db.run(sql, [trainset_id, cumulative_mileage_km, in_service_date, has_branding_wrap], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(201).json({ message: 'Trainset master data added successfully!' });
    });
};

const getTrainsets = (req, res) => {
    db.all("SELECT * FROM trainsets", [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(200).json({ data: rows });
    });
};

const deleteTrainset = (req, res) => {
    const sql = "DELETE FROM trainsets WHERE trainset_id = ?";
    db.run(sql, req.params.id, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Trainset not found' });
        res.json({ message: "Trainset deleted successfully" });
    });
};

const updateTrainset = (req, res) => {
    const { cumulative_mileage_km, in_service_date, has_branding_wrap } = req.body;
    const sql = `UPDATE trainsets SET cumulative_mileage_km = ?, in_service_date = ?, has_branding_wrap = ? WHERE trainset_id = ?`;
    db.run(sql, [cumulative_mileage_km, in_service_date, has_branding_wrap, req.params.id], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "Trainset updated successfully" });
    });
};

module.exports = { addTrainset, getTrainsets, deleteTrainset, updateTrainset };