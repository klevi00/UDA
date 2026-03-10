const pool = require("../db");
const ResponseClass = require("../response");
const Viaggio = require('../models/viaggio');

exports.searchViaggi = async (req, res) => {
    const response = new ResponseClass();
    const { citta_partenza, citta_destinazione, data } = req.query;
    try {
        let query = `
            SELECT v.*, 
                   a.nome AS autista_nome, a.cognome AS autista_cognome,
                   a.fotografia,
                   COALESCE(AVG(fa.valutazione), 0) AS media_valutazione
            FROM blablacar.viaggi v
            JOIN blablacar.autisti a ON v.id_autista = a.id
            LEFT JOIN blablacar.feedback_autista fa ON fa.id_autista = a.id
            WHERE v.pieno = false AND v.data_ora_partenza > NOW()
        `;
        const params = [];
        let idx = 1;

        if (citta_partenza)      { query += ` AND v.citta_partenza = $${idx++}`;      params.push(citta_partenza); }
        if (citta_destinazione)  { query += ` AND v.citta_destinazione = $${idx++}`;  params.push(citta_destinazione); }
        if (data)                { query += ` AND DATE(v.data_ora_partenza) = $${idx++}`; params.push(data); }

        query += ' GROUP BY v.id, a.nome, a.cognome, a.fotografia ORDER BY v.data_ora_partenza ASC';

        const result = await pool.query(query, params);
        const viaggi = result.rows.map(row => Viaggio.fromDatabaseRow(row).toJSON());

        response.status = true;
        response.code = 200;
        response.message = `Found ${result.rowCount} viaggi`;
        response.data = viaggi;
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getViaggioById = async (req, res) => {
    const response = new ResponseClass();
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query(
            `SELECT v.*,
                    a.nome AS autista_nome, a.cognome AS autista_cognome,
                    a.fotografia, a.numero_telefono,
                    a.casa_automobilistica, a.modello, a.targa,
                    COALESCE(AVG(fa.valutazione), 0) AS media_valutazione,
                    COUNT(DISTINCT fa.id) AS numero_recensioni
             FROM blablacar.viaggi v
             JOIN blablacar.autisti a ON v.id_autista = a.id
             LEFT JOIN blablacar.feedback_autista fa ON fa.id_autista = a.id
             WHERE v.id = $1
             GROUP BY v.id, a.nome, a.cognome, a.fotografia, a.numero_telefono, a.casa_automobilistica, a.modello, a.targa`,
            [id]
        );
        if (result.rowCount === 0) {
            response.code = 404;
            response.message = "Viaggio not found";
        } else {
            response.status = true;
            response.code = 200;
            response.message = "Success";
            response.data = Viaggio.fromDatabaseRow(result.rows[0]).toJSON();
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getMyViaggi = async (req, res) => {
    const response = new ResponseClass();
    const idAutista = req.authData.id;
    try {
        const result = await pool.query(
            `SELECT v.*, COUNT(p.id_passeggero) AS passeggeri_accettati
             FROM blablacar.viaggi v
             LEFT JOIN blablacar.prenotazioni p ON p.id_viaggio = v.id AND p.stato = 'accettata'
             WHERE v.id_autista = $1
             GROUP BY v.id
             ORDER BY v.data_ora_partenza DESC`,
            [idAutista]
        );
        const viaggi = result.rows.map(row => Viaggio.fromDatabaseRow(row).toJSON());
        response.status = true;
        response.code = 200;
        response.message = `Found ${result.rowCount} viaggi`;
        response.data = viaggi;
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.createViaggio = async (req, res) => {
    const response = new ResponseClass();
    const idAutista = req.authData.id;
    const { citta_partenza, citta_destinazione, data_ora_partenza, costo, tempo } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO blablacar.viaggi (citta_partenza, citta_destinazione, data_ora_partenza, costo, tempo, id_autista) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
            [citta_partenza, citta_destinazione, data_ora_partenza, costo, tempo, idAutista]
        );
        response.code = 201;
        response.status = true;
        response.message = "Viaggio created";
        response.data = { id: result.rows[0].id };
        res.status(201).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.updateViaggio = async (req, res) => {
    const response = new ResponseClass();
    const id = parseInt(req.params.id);
    const idAutista = req.authData.id;
    const { citta_partenza, citta_destinazione, data_ora_partenza, costo, tempo, pieno } = req.body;
    try {
        // Ownership check
        const check = await pool.query("SELECT id_autista FROM blablacar.viaggi WHERE id = $1", [id]);
        if (check.rowCount === 0) {
            response.code = 404; response.message = "Viaggio not found";
            return res.status(404).json(response);
        }
        if (check.rows[0].id_autista !== idAutista) {
            response.code = 403; response.message = "Access denied";
            return res.status(403).json(response);
        }
        const result = await pool.query(
            "UPDATE blablacar.viaggi SET citta_partenza=$1, citta_destinazione=$2, data_ora_partenza=$3, costo=$4, tempo=$5, pieno=$6 WHERE id=$7",
            [citta_partenza, citta_destinazione, data_ora_partenza, costo, tempo, pieno ?? false, id]
        );
        response.code = 200; response.status = true; response.message = "Viaggio updated";
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.deleteViaggio = async (req, res) => {
    const response = new ResponseClass();
    const id = parseInt(req.params.id);
    const idAutista = req.authData.id;
    const role = req.authData.role;
    try {
        const check = await pool.query("SELECT id_autista FROM blablacar.viaggi WHERE id = $1", [id]);
        if (check.rowCount === 0) {
            response.code = 404; response.message = "Viaggio not found";
            return res.status(404).json(response);
        }
        if (role !== 'Admin' && check.rows[0].id_autista !== idAutista) {
            response.code = 403; response.message = "Access denied";
            return res.status(403).json(response);
        }
        await pool.query("DELETE FROM blablacar.prenotazioni WHERE id_viaggio = $1", [id]);
        await pool.query("DELETE FROM blablacar.viaggi WHERE id = $1", [id]);
        response.code = 200; response.status = true; response.message = "Viaggio deleted";
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};
