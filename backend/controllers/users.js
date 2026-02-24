const pool = require("../db")
const ResponseClass = require("../response")
const bcrypt = require('bcryptjs');
const userModel = require('../models/users')

exports.getUsers = async (req, res) =>{
    const response = new ResponseClass()
    try{
        const result = await pool.query("SELECT * FROM stage.users ORDER BY id")
        const user = result.rows.map(row => userModel.fromDatabaseRow(row).toJSON())
        response.status = true
        response.code = 200
        response.message = "Success"
        response.data = user
        res.status(200).json(response)

    }
    catch(err){
        response.message = err.message
        res.status(500).json(response)
    }
}

exports.getCurrentUser = async (req, res) =>{
    const response = new ResponseClass()
    const userId = req.authData.id
    try{
        const result = await pool.query("SELECT id, email, role, name, department FROM stage.users WHERE id = $1", [userId])

        if(result.rowCount === 0){
            response.message = "User not found"
            response.status = false
            response.code = 404
        }
        response.status = true
        response.code = 200
        response.message = "Success"
        response.data = result.rows
        res.status(response.code).json(response)

    }
    catch(err){
        response.message = err.message
        res.status(500).json(response)
    }
}

exports.getUserById = async(req, res) =>{
    const response = new ResponseClass()
    const id = parseInt(req.params.id)
    try{
        const result = await pool.query("SELECT name, email, role, department FROM stage.users WHERE id = $1", [id])
        if(result.rowCount === 0){
            response.code = 404
            response.message = "User not found"
        }
        else{
            response.status = true
            response.code = 200
            response.message = "Success"
            response.data = result.rows[0]
        }
        res.status(response.code).json(response)
    }
    catch(err){
        response.message = err.message
        res.status(500).json(response)
    }
}

exports.getApprovers = async (req, res) => {
    const response = new ResponseClass()
    const {department}= req.body
    try {
        const result = await pool.query(
            "SELECT name FROM stage.users WHERE LOWER(role) in (LOWER($1), LOWER($2)) AND department =$3 ORDER BY name", 
            ['Area Manager', 'Admin', department]
        )

        const names = result.rows.map(row => row.name)
        
        response.status = true
        response.code = 200
        response.message = `Found ${result.rowCount} approvers`
        response.data = names
        
        res.status(200).json(response)
        
    } catch (err) {
        response.message = err.message
        res.status(500).json(response)
    }
}



exports.getDepartments = async (req, res) => {
    const response = new ResponseClass()
    try {
        const result = await pool.query("SELECT DISTINCT department FROM stage.users WHERE department IS NOT NULL AND role IN ($1, $2)", ['Area Manager', 'Admin'] )
        
        response.status = true
        response.code = 200
        response.message = `Found ${result.rowCount} departments`
        response.data = result.rows
        
        res.status(200).json(response)
        
    } catch (err) {
        response.message = err.message
        res.status(500).json(response)
    }
}



exports.createUser = async (req, res) => {
    const response = new ResponseClass()
    const {name, email, password, role, department} = req.body
    const hashedPassword = await bcrypt.hash(password, 10);    
    try{
        await pool.query("INSERT INTO stage.users (name, email, password, role, department) VALUES($1, $2, $3, $4, $5)", [name, email, hashedPassword, role, department])
        response.code = 201
        response.status = true
        response.message = "User created"
        res.status(201).json(response)
    }
    catch(err){
        response.message = err.message
        res.status(500).json(response)
    }

}

exports.updateUser = async (req, res) => {
    const response = new ResponseClass()
    const id = parseInt(req.params.id)
    const {name, email, password, role, department} = req.body 
    const hashedPassword = await bcrypt.hash(password, 10);
    try{
        const result = await pool.query("UPDATE stage.users SET name=$1, email=$2, password=$3, role=$4, department=$5 WHERE id=$6", [name, email, hashedPassword, role, department, id])
        if(result.rowCount === 0){
            response.code = 404
            response.message = "User not found"
        }
        else{
            response.code = 200
            response.status = true
            response.message = "User updated"
        }
        res.status(response.code).json(response)
    }
    catch(err){
        response.message = err.message
        res.status(500).json(response)
    }
}

exports.deleteUser = async (req, res) => {
    const response = new ResponseClass()
    const id = parseInt(req.params.id)
    try{
        const result = await pool.query("DELETE FROM stage.users WHERE id = $1", [id])
        if(result.rowCount === 0){
            response.code = 404
            response.message = "User not found"
        }
        else{
            response.code = 200
            response.status = true
            response.message = "User deleted"
        }
        res.status(response.code).json(response)
    }
    catch(err){
        response.message = err.message
        res.status(500).json(response)
    }
}