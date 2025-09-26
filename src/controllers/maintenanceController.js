const db = require('../database');

const addFitnessCertificate = (req, res) => {
    const { certificate_id, trainset_id, certificate_type, expiry_date } = req.body;
    const sql = `INSERT INTO fitness_certificates (certificate_id, trainset_id, certificate_type, expiry_date) VALUES (?,?,?,?)`;
    db.run(sql, [certificate_id, trainset_id, certificate_type, expiry_date], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(201).json({ message: 'Fitness certificate added successfully!' });
    });
};

const getFitnessCertificates = (req, res) => {
    db.all("SELECT * FROM fitness_certificates", [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(200).json({ data: rows });
    });
};

const deleteFitnessCertificate = (req, res) => {
    const sql = "DELETE FROM fitness_certificates WHERE certificate_id = ?";
    db.run(sql, req.params.id, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Certificate not found' });
        res.json({ message: "Fitness certificate deleted successfully" });
    });
};

const updateFitnessCertificate = (req, res) => {
    const { trainset_id, certificate_type, expiry_date } = req.body;
    const sql = `UPDATE fitness_certificates SET trainset_id = ?, certificate_type = ?, expiry_date = ? WHERE certificate_id = ?`;
    db.run(sql, [trainset_id, certificate_type, expiry_date, req.params.id], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "Certificate updated successfully" });
    });
};

const addJobCard = (req, res) => {
    const { job_card_id, trainset_id, status, is_critical, description, required_man_hours } = req.body;
    const sql = `INSERT INTO job_cards (job_card_id, trainset_id, status, is_critical, description, required_man_hours) VALUES (?,?,?,?,?,?)`;
    db.run(sql, [job_card_id, trainset_id, status, is_critical, description, required_man_hours], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(201).json({ message: 'Job card added successfully!' });
    });
};

const getJobCards = (req, res) => {
    db.all("SELECT * FROM job_cards", [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(200).json({ data: rows });
    });
};

const deleteJobCard = (req, res) => {
    const sql = "DELETE FROM job_cards WHERE job_card_id = ?";
    db.run(sql, req.params.id, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Job card not found' });
        res.json({ message: "Job card deleted successfully" });
    });
};

const updateJobCard = (req, res) => {
    const { trainset_id, status, is_critical, description, required_man_hours } = req.body;
    const sql = `UPDATE job_cards SET trainset_id = ?, status = ?, is_critical = ?, description = ?, required_man_hours = ? WHERE job_card_id = ?`;
    db.run(sql, [trainset_id, status, is_critical, description, required_man_hours, req.params.id], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "Job card updated successfully" });
    });
};

module.exports = { addFitnessCertificate, getFitnessCertificates, deleteFitnessCertificate, updateFitnessCertificate, addJobCard, getJobCards, deleteJobCard, updateJobCard };