const pool = require("../db");
const ResponseClass = require("../response");
const bcrypt = require('bcryptjs');
const Passeggero = require('../models/passeggero');

exports.getPasseggeri = async (req, res) => {
    const response = new ResponseClass();
    try {
        const result = await pool.query("SELECT id, nome, cognome, numero_telefono, email, role FROM blablacar.passeggeri ORDER BY id");
        const passeggeri = result.rows.map(row => Passeggero.fromDatabaseRow(row).toJSON());
        response.status = true;
        response.code = 200;
        response.message = "Success";
        response.data = passeggeri;
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getPasseggeroById = async (req, res) => {
    const response = new ResponseClass();
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query(
            "SELECT id, nome, cognome, numero_telefono, email, role FROM blablacar.passeggeri WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Passeggero not found";
        } else {
            response.status = true;
            response.code = 200;
            response.message = "Success";
            response.data = Passeggero.fromDatabaseRow(result.rows[0]).toJSON();
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getCurrentPasseggero = async (req, res) => {
    const response = new ResponseClass();
    const id = req.authData.id;
    try {
        const result = await pool.query(
            "SELECT id, nome, cognome, numero_serie_carta_identita, numero_telefono, email, role FROM blablacar.passeggeri WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Passeggero not found";
            return res.status(404).json(response);
        }
        response.status = true;
        response.code = 200;
        response.message = "Success";
        response.data = Passeggero.fromDatabaseRow(result.rows[0]).toJSON();
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.createPasseggero = async (req, res) => {
    const response = new ResponseClass();
    const { nome, cognome, numero_serie_carta_identita, numero_telefono, email, password } = req.body;
    try {
        const existing = await pool.query("SELECT id FROM blablacar.passeggeri WHERE email = $1", [email]);
        if (existing.rowCount > 0) {
            response.code = 409;
            response.message = "Email già registrata";
            return res.status(409).json(response);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO blablacar.passeggeri (nome, cognome, numero_serie_carta_identita, numero_telefono, email, password) VALUES ($1,$2,$3,$4,$5,$6)",
            [nome, cognome, numero_serie_carta_identita, numero_telefono, email, hashedPassword]
        );
        response.code = 201;
        response.status = true;
        response.message = "Passeggero created";
        res.status(201).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.updatePasseggero = async (req, res) => {
    const response = new ResponseClass();
    const id = req.authData.id;
    const { numero_telefono } = req.body;
    if (!numero_telefono) {
        response.code = 400;
        response.message = "Nessun campo da aggiornare";
        return res.status(400).json(response);
    }
    try {
        const result = await pool.query(
            "UPDATE blablacar.passeggeri SET numero_telefono = $1 WHERE id = $2",
            [numero_telefono, id]
        );
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Passeggero not found";
        } else {
            response.code = 200;
            response.status = true;
            response.message = "Passeggero updated";
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.deletePasseggero = async (req, res) => {
    const response = new ResponseClass();
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query("DELETE FROM blablacar.passeggeri WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Passeggero not found";
        } else {
            response.code = 200;
            response.status = true;
            response.message = "Passeggero deleted";
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};
