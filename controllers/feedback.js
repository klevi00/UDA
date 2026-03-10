const pool = require("../db");
const ResponseClass = require("../response");
const Feedback = require('../models/feedback');

exports.createFeedbackAutista = async (req, res) => {
    const response = new ResponseClass();
    const idPasseggero = req.authData.id;
    const { id_autista, valutazione, giudizio } = req.body;
    try {
        if (valutazione < 1 || valutazione > 5) {
            response.code = 400;
            response.message = "La valutazione deve essere tra 1 e 5";
            return res.status(400).json(response);
        }
        const viaggi = await pool.query(
            `SELECT 1 FROM blablacar.prenotazioni p
             JOIN blablacar.viaggi v ON p.id_viaggio = v.id
             WHERE p.id_passeggero = $1 AND v.id_autista = $2
               AND p.stato = 'accettata' AND v.data_ora_partenza < NOW()
             LIMIT 1`,
            [idPasseggero, id_autista]
        );
        if (viaggi.rowCount === 0) {
            response.code = 403;
            response.message = "Puoi lasciare feedback solo dopo aver viaggiato con questo autista";
            return res.status(403).json(response);
        }
        const dup = await pool.query(
            "SELECT 1 FROM blablacar.feedback_autista WHERE id_passeggero = $1 AND id_autista = $2",
            [idPasseggero, id_autista]
        );
        if (dup.rowCount > 0) {
            response.code = 409;
            response.message = "Hai già lasciato un feedback per questo autista";
            return res.status(409).json(response);
        }
        await pool.query(
            "INSERT INTO blablacar.feedback_autista (id_autista, id_passeggero, valutazione, giudizio) VALUES ($1,$2,$3,$4)",
            [id_autista, idPasseggero, valutazione, giudizio]
        );
        response.code = 201;
        response.status = true;
        response.message = "Feedback autista saved";
        res.status(201).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.createFeedbackPasseggero = async (req, res) => {
    const response = new ResponseClass();
    const idAutista = req.authData.id;
    const { id_passeggero, valutazione, giudizio } = req.body;
    try {
        if (valutazione < 1 || valutazione > 5) {
            response.code = 400;
            response.message = "La valutazione deve essere tra 1 e 5";
            return res.status(400).json(response);
        }
        const viaggi = await pool.query(
            `SELECT 1 FROM blablacar.prenotazioni p
             JOIN blablacar.viaggi v ON p.id_viaggio = v.id
             WHERE p.id_passeggero = $1 AND v.id_autista = $2
               AND p.stato = 'accettata' AND v.data_ora_partenza < NOW()
             LIMIT 1`,
            [id_passeggero, idAutista]
        );
        if (viaggi.rowCount === 0) {
            response.code = 403;
            response.message = "Puoi lasciare feedback solo per passeggeri che hanno viaggiato con te";
            return res.status(403).json(response);
        }
        const dup = await pool.query(
            "SELECT 1 FROM blablacar.feedback_passeggero WHERE id_autista = $1 AND id_passeggero = $2",
            [idAutista, id_passeggero]
        );
        if (dup.rowCount > 0) {
            response.code = 409;
            response.message = "Hai già lasciato un feedback per questo passeggero";
            return res.status(409).json(response);
        }
        await pool.query(
            "INSERT INTO blablacar.feedback_passeggero (id_autista, id_passeggero, valutazione, giudizio) VALUES ($1,$2,$3,$4)",
            [idAutista, id_passeggero, valutazione, giudizio]
        );
        response.code = 201;
        response.status = true;
        response.message = "Feedback passeggero saved";
        res.status(201).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getFeedbackAutista = async (req, res) => {
    const response = new ResponseClass();
    const idAutista = parseInt(req.params.idAutista);
    try {
        const result = await pool.query(
            `SELECT fa.id, fa.valutazione, fa.giudizio,
                    p.nome AS passeggero_nome, p.cognome AS passeggero_cognome
             FROM blablacar.feedback_autista fa
             JOIN blablacar.passeggeri p ON fa.id_passeggero = p.id
             WHERE fa.id_autista = $1
             ORDER BY fa.id DESC`,
            [idAutista]
        );
        const avg = await pool.query(
            "SELECT COALESCE(AVG(valutazione), 0) AS media, COUNT(*) AS totale FROM blablacar.feedback_autista WHERE id_autista = $1",
            [idAutista]
        );
        response.status = true;
        response.code = 200;
        response.message = "Success";
        response.data = {
            media: parseFloat(avg.rows[0].media).toFixed(1),
            totale: parseInt(avg.rows[0].totale),
            feedback: result.rows.map(row => Feedback.fromDatabaseRow(row).toJSON())
        };
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.getFeedbackPasseggero = async (req, res) => {
    const response = new ResponseClass();
    const idPasseggero = parseInt(req.params.idPasseggero);
    try {
        const result = await pool.query(
            `SELECT fp.id, fp.valutazione, fp.giudizio,
                    a.nome AS autista_nome, a.cognome AS autista_cognome
             FROM blablacar.feedback_passeggero fp
             JOIN blablacar.autisti a ON fp.id_autista = a.id
             WHERE fp.id_passeggero = $1
             ORDER BY fp.id DESC`,
            [idPasseggero]
        );
        const avg = await pool.query(
            "SELECT COALESCE(AVG(valutazione), 0) AS media, COUNT(*) AS totale FROM blablacar.feedback_passeggero WHERE id_passeggero = $1",
            [idPasseggero]
        );
        response.status = true;
        response.code = 200;
        response.message = "Success";
        response.data = {
            media: parseFloat(avg.rows[0].media).toFixed(1),
            totale: parseInt(avg.rows[0].totale),
            feedback: result.rows.map(row => Feedback.fromDatabaseRow(row).toJSON())
        };
        res.status(200).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};

exports.deleteFeedback = async (req, res) => {
    const response = new ResponseClass();
    const id = parseInt(req.params.id);
    const { tipo } = req.params; // 'autista' o 'passeggero'
    const table = tipo === 'autista' ? 'feedback_autista' : 'feedback_passeggero';
    try {
        const result = await pool.query(`DELETE FROM blablacar.${table} WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            response.code = 404; response.message = "Feedback not found";
        } else {
            response.code = 200; response.status = true; response.message = "Feedback deleted";
        }
        res.status(response.code).json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500).json(response);
    }
};
