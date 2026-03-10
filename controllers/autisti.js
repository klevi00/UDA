const pool = require("../db");
const ResponseClass = require("../response");
const bcrypt = require('bcryptjs');
const Autista = require('../models/autista');

exports.getAutisti = async (req, res) => {
    const response = new ResponseClass();
    try {
        const result = await pool.query("SELECT id, nome, cognome, casa_automobilistica, modello, targa, numero_telefono, email, fotografia, role FROM blablacar.autisti ORDER BY id");
        const autisti = result.rows.map(row => Autista.fromDatabaseRow(row).toJSON());
        response.status = true;
        response.code = 200;
        response.message = "Success";
        response.data = autisti;
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getAutistaById = async (req, res) => {
    const response = new ResponseClass();
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query(
            "SELECT id, nome, cognome, casa_automobilistica, modello, targa, anno_immatricolazione, numero_telefono, email, fotografia, role FROM blablacar.autisti WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Autista not found";
        } else {
            response.status = true;
            response.code = 200;
            response.message = "Success";
            response.data = Autista.fromDatabaseRow(result.rows[0]).toJSON();
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getCurrentAutista = async (req, res) => {
    const response = new ResponseClass();
    const id = req.authData.id;
    try {
        const result = await pool.query(
            "SELECT id, nome, cognome, numero_patente, scadenza_patente, casa_automobilistica, modello, targa, anno_immatricolazione, numero_telefono, email, fotografia, role FROM blablacar.autisti WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Autista not found";
            return res.status(404).json(response);
        }
        response.status = true;
        response.code = 200;
        response.message = "Success";
        response.data = Autista.fromDatabaseRow(result.rows[0]).toJSON();
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.createAutista = async (req, res) => {
    const response = new ResponseClass();
    const { nome, cognome, data_nascita, numero_patente, scadenza_patente, casa_automobilistica, modello, targa, anno_immatricolazione, numero_telefono, email, password } = req.body;
    const fotografia = req.file ? req.file.filename : '';
    try {
        const existing = await pool.query("SELECT id FROM blablacar.autisti WHERE email = $1", [email]);
        if (existing.rowCount > 0) {
            response.code = 409;
            response.message = "Email già registrata";
            return res.status(409).json(response);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO blablacar.autisti (nome, cognome, data_nascita, numero_patente, scadenza_patente, casa_automobilistica, modello, targa, anno_immatricolazione, numero_telefono, email, password, fotografia)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
            [nome, cognome, data_nascita, numero_patente, scadenza_patente, casa_automobilistica, modello, targa, anno_immatricolazione, numero_telefono, email, hashedPassword, fotografia]
        );
        response.code = 201;
        response.status = true;
        response.message = "Autista created";
        res.status(201).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.updateAutista = async (req, res) => {
    const response = new ResponseClass();
    const id = req.authData.id;
    const { casa_automobilistica, modello, targa, anno_immatricolazione, numero_telefono } = req.body;
    const fotografia = req.file ? req.file.filename : null;

    const fields = [];
    const values = [];
    let idx = 1;

    if (casa_automobilistica) { fields.push(`casa_automobilistica = $${idx++}`); values.push(casa_automobilistica); }
    if (modello)              { fields.push(`modello = $${idx++}`);              values.push(modello); }
    if (targa)                { fields.push(`targa = $${idx++}`);                values.push(targa); }
    if (anno_immatricolazione){ fields.push(`anno_immatricolazione = $${idx++}`);values.push(anno_immatricolazione); }
    if (numero_telefono)      { fields.push(`numero_telefono = $${idx++}`);      values.push(numero_telefono); }
    if (fotografia)           { fields.push(`fotografia = $${idx++}`);           values.push(fotografia); }

    if (fields.length === 0) {
        response.code = 400;
        response.message = "Nessun campo da aggiornare";
        return res.status(400).json(response);
    }

    values.push(id);
    try {
        const result = await pool.query(`UPDATE blablacar.autisti SET ${fields.join(', ')} WHERE id = $${idx}`, values);
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Autista not found";
        } else {
            response.code = 200;
            response.status = true;
            response.message = "Autista updated";
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.deleteAutista = async (req, res) => {
    const response = new ResponseClass();
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query("DELETE FROM blablacar.autisti WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Autista not found";
        } else {
            response.code = 200;
            response.status = true;
            response.message = "Autista deleted";
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};
