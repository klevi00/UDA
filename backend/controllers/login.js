const pool = require("../db")
const ResponseClass = require("../response")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (request, res) => {
    response = new ResponseClass()
    const { email, password } = request.body;
    pool.query('SELECT * FROM stage.users WHERE email = $1', [email], async (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length === 0) {
            response.status = false
            response.code = 404
            response.message = "User not found"
            return res.status(404).json(response);
        }
        const user = results.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            response.status = true
            response.code = 401
            response.message = "Invalide credential"
            return res.status(401).json(response);
        }
        const token = jwt.sign({ id: user.id, email: user.email, name:user.name, role: user.role, department: user.department }, 'your_jwt_secret', { expiresIn: '24h' });
        response.code = 200
        response.status = true
        response.message = "Success"
        res.status(200).json({code: 200, status:true, message:"Success", token: token});
    });
}