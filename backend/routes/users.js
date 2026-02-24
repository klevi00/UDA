const express = require("express")
const router = express.Router()

const usersController = require("../controllers/users")
const verifyTkn = require("../middleware/token")
const rbacMiddleware = require('../middleware/rbacMiddleware')


//router.get("/", usersController.getUsers)
router.get("/", verifyTkn, rbacMiddleware.checkPermission("read_all_users"), usersController.getUsers)
router.get("/me", verifyTkn, rbacMiddleware.checkPermission("read_current_user"), usersController.getCurrentUser)
router.post("/approvers", verifyTkn, rbacMiddleware.checkPermission("read_approvers"), usersController.getApprovers)
router.get("/departments", verifyTkn, rbacMiddleware.checkPermission("read_departments"), usersController.getDepartments)
router.get("/:id", verifyTkn, rbacMiddleware.checkPermission("read_user_by_id"), usersController.getUserById)
router.post("/", usersController.createUser)
router.put("/:id",verifyTkn,  rbacMiddleware.checkPermission("update_user"), usersController.updateUser)
router.delete("/:id", verifyTkn, rbacMiddleware.checkPermission("delete_user"), usersController.deleteUser)

module.exports = router