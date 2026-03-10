const pool = require("../db");
const ResponseClass = require("../response");
const Prenotazione = require('../models/prenotazione');

exports.createPrenotazione = async (req, res) => {
    const response = new ResponseClass();
    const idPasseggero = req.authData.id;
    const { id_viaggio } = req.body;
    try {
        const viaggi = await pool.query(
            "SELECT * FROM blablacar.viaggi WHERE id = $1 AND pieno = false AND data_ora_partenza > NOW()",
            [id_viaggio]
        );
        if (viaggi.rowCount === 0) {
            response.code = 400;
            response.message = "Viaggio non disponibile o già pieno";
            return res.status(400).json(response);
        }
        const existing = await pool.query(
            "SELECT id_passeggero FROM blablacar.prenotazioni WHERE id_passeggero = $1 AND id_viaggio = $2",
            [idPasseggero, id_viaggio]
        );
        if (existing.rowCount > 0) {
            response.code = 409;
            response.message = "Hai già prenotato questo viaggio";
            return res.status(409).json(response);
        }
        await pool.query(
            "INSERT INTO blablacar.prenotazioni (id_passeggero, id_viaggio, data_ora_prenotazione, stato) VALUES ($1,$2,NOW(),'inElaborazione')",
            [idPasseggero, id_viaggio]
        );
        response.code = 201;
        response.status = true;
        response.message = "Prenotazione inviata, in attesa di conferma";
        res.status(201).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getMyPrenotazioni = async (req, res) => {
    const response = new ResponseClass();
    const idPasseggero = req.authData.id;
    try {
        const result = await pool.query(
            `SELECT p.*, v.citta_partenza, v.citta_destinazione, v.data_ora_partenza,
                    v.costo, a.nome AS autista_nome, a.cognome AS autista_cognome
             FROM blablacar.prenotazioni p
             JOIN blablacar.viaggi v ON p.id_viaggio = v.id
             JOIN blablacar.autisti a ON v.id_autista = a.id
             WHERE p.id_passeggero = $1
             ORDER BY p.data_ora_prenotazione DESC`,
            [idPasseggero]
        );
        const prenotazioni = result.rows.map(row => Prenotazione.fromDatabaseRow(row).toJSON());
        response.status = true;
        response.code = 200;
        response.message = `Found ${result.rowCount} prenotazioni`;
        response.data = prenotazioni;
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getPrenotazioniViaggio = async (req, res) => {
    const response = new ResponseClass();
    const idAutista = req.authData.id;
    const idViaggio = parseInt(req.params.idViaggio);
    try {
        const check = await pool.query("SELECT id_autista FROM blablacar.viaggi WHERE id = $1", [idViaggio]);
        if (check.rowCount === 0) {
            response.code = 404; response.message = "Viaggio not found";
            return res.status(404).json(response);
        }
        if (check.rows[0].id_autista !== idAutista) {
            response.code = 403; response.message = "Access denied";
            return res.status(403).json(response);
        }
        const result = await pool.query(
            `SELECT p.*, pas.nome, pas.cognome, pas.numero_telefono, pas.email
             FROM blablacar.prenotazioni p
             JOIN blablacar.passeggeri pas ON p.id_passeggero = pas.id
             WHERE p.id_viaggio = $1
             ORDER BY p.data_ora_prenotazione ASC`,
            [idViaggio]
        );
        const prenotazioni = result.rows.map(row => Prenotazione.fromDatabaseRow(row).toJSON());
        response.status = true;
        response.code = 200;
        response.message = `Found ${result.rowCount} prenotazioni`;
        response.data = prenotazioni;
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.updateStatoPrenotazione = async (req, res) => {
    const response = new ResponseClass();
    const idAutista = req.authData.id;
    const { idViaggio, idPasseggero } = req.params;
    const { stato } = req.body;

    if (!['accettata', 'rifiutata'].includes(stato)) {
        response.code = 400;
        response.message = 'Stato non valido. Usa "accettata" o "rifiutata"';
        return res.status(400).json(response);
    }
    try {
        const check = await pool.query("SELECT id_autista FROM blablacar.viaggi WHERE id = $1", [idViaggio]);
        if (check.rowCount === 0) {
            response.code = 404; response.message = "Viaggio not found";
            return res.status(404).json(response);
        }
        if (check.rows[0].id_autista !== idAutista) {
            response.code = 403; response.message = "Access denied";
            return res.status(403).json(response);
        }
        const result = await pool.query(
            "UPDATE blablacar.prenotazioni SET stato = $1 WHERE id_passeggero = $2 AND id_viaggio = $3",
            [stato, idPasseggero, idViaggio]
        );
        if (result.rowCount === 0) {
            response.code = 404; response.message = "Prenotazione not found";
        } else {
            response.code = 200; response.status = true; response.message = `Prenotazione ${stato}`;
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.deletePrenotazione = async (req, res) => {
    const response = new ResponseClass();
    const idPasseggero = req.authData.id;
    const { idViaggio } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM blablacar.prenotazioni WHERE id_passeggero = $1 AND id_viaggio = $2 AND stato = 'inElaborazione'",
            [idPasseggero, idViaggio]
        );
        if (result.rowCount === 0) {
            response.code = 400;
            response.message = "Impossibile cancellare: prenotazione non trovata o già processata";
        } else {
            response.code = 200;
            response.status = true;
            response.message = "Prenotazione cancellata";
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};
