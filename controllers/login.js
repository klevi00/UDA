const pool = require("../db");
const ResponseClass = require("../response");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const response = new ResponseClass();
    const { email, password, role } = req.body;

    if (!['Autista', 'Passeggero', 'Admin'].includes(role)) {
        response.status = false;
        response.code = 400;
        response.message = "Role non valido. Usa: Autista, Passeggero, Admin";
        return res.status(400).json(response);
    }

    const table = role === 'Autista' ? 'autisti' : role === 'Passeggero' ? 'passeggeri' : 'admins';

    pool.query(`SELECT * FROM blablacar.${table} WHERE email = $1`, [email], async (error, results) => {
        if (error) {
            response.status = false;
            response.code = 500;
            response.message = error.message;
            return res.status(500).json(response);
        }
        if (results.rows.length === 0) {
            response.status = false;
            response.code = 404;
            response.message = "User not found";
            return res.status(404).json(response);
        }

        const user = results.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            response.status = false;
            response.code = 401;
            response.message = "Invalid credentials";
            return res.status(401).json(response);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, nome: user.nome, cognome: user.cognome, role: role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({ code: 200, status: true, message: "Success", token: token });
    });
};
