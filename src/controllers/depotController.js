const db = require('../database');

const addLayoutCost = (req, res) => {
    const { from_location, to_location, shunting_cost } = req.body;
    const sql = `INSERT INTO depot_layout_costs (from_location, to_location, shunting_cost) VALUES (?,?,?)`;
    db.run(sql, [from_location, to_location, shunting_cost], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(201).json({ message: 'Layout cost added!' });
    });
};

const getLayoutCosts = (req, res) => {
    db.all("SELECT * FROM depot_layout_costs", [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(200).json({ data: rows });
    });
};

const deleteLayoutCost = (req, res) => {
    db.run(`DELETE FROM depot_layout_costs WHERE id = ?`, req.params.id, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "Layout cost deleted" });
    });
};

const updateLayoutCost = (req, res) => {
    const { from_location, to_location, shunting_cost } = req.body;
    const sql = `UPDATE depot_layout_costs set from_location = ?, to_location = ?, shunting_cost = ? WHERE id = ?`;
    db.run(sql, [from_location, to_location, shunting_cost, req.params.id], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "Layout cost updated" });
    });
};

const addResource = (req, res) => {
    const { resource_id, available_capacity } = req.body;
    const sql = `INSERT INTO depot_resources (resource_id, available_capacity) VALUES (?,?)`;
    db.run(sql, [resource_id, available_capacity], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(201).json({ message: 'Resource added!' });
    });
};

const getResources = (req, res) => {
    db.all("SELECT * FROM depot_resources", [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.status(200).json({ data: rows });
    });
};

const deleteResource = (req, res) => {
    db.run(`DELETE FROM depot_resources WHERE resource_id = ?`, req.params.id, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "Resource deleted" });
    });
};

const updateResource = (req, res) => {
    const { available_capacity } = req.body;
    const sql = `UPDATE depot_resources set available_capacity = ? WHERE resource_id = ?`;
    db.run(sql, [available_capacity, req.params.id], function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ message: "Resource updated" });
    });
};

module.exports = { addLayoutCost, getLayoutCosts, deleteLayoutCost, updateLayoutCost, addResource, getResources, deleteResource, updateResource };