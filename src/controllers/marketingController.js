const db = require('../database');

const addBrandingSla = (req, res) => {
    const { sla_id, trainset_id, target_exposure_hours, current_exposure_hours, penalty_per_hour } = req.body;
    const sql = `INSERT INTO branding_slas (sla_id, trainset_id, target_exposure_hours, current_exposure_hours, penalty_per_hour) VALUES (?,?,?,?,?)`;
    db.run(sql, [sla_id, trainset_id, target_exposure_hours, current_exposure_hours, penalty_per_hour], function(err) {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.status(201).json({ message: 'Branding SLA added successfully!', "id": this.lastID });
    });
};

const getBrandingSlas = (req, res) => {
    db.all("SELECT * FROM branding_slas", [], (err, rows) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.status(200).json({ data: rows });
    });
};

const deleteSla = (req, res) => {
    const sql = "DELETE FROM branding_slas WHERE sla_id = ?";
    db.run(sql, req.params.id, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: "SLA deleted successfully" });
    });
};

const updateSla = (req, res) => {
    const { trainset_id, target_exposure_hours, current_exposure_hours, penalty_per_hour } = req.body;
    const sql = `UPDATE branding_slas set 
                    trainset_id = ?, 
                    target_exposure_hours = ?, 
                    current_exposure_hours = ?, 
                    penalty_per_hour = ? 
                 WHERE sla_id = ?`;
    const params = [trainset_id, target_exposure_hours, current_exposure_hours, penalty_per_hour, req.params.id];
    db.run(sql, params, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "SLA updated successfully" });
    });
};

module.exports = { addBrandingSla, getBrandingSlas, deleteSla, updateSla };