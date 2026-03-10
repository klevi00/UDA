const express = require("express");
const router = express.Router();

const autistiController = require("../controllers/autisti");
const verifyToken = require("../middleware/token");
const rbacMiddleware = require("../middleware/rbacMiddleware");
const upload = require("../config/upload");

router.get("/",     verifyToken, rbacMiddleware.checkPermission("read_all_users"),    autistiController.getAutisti);
router.get("/me",   verifyToken, rbacMiddleware.checkPermission("read_current_user"), autistiController.getCurrentAutista);
router.get("/:id",  verifyToken, rbacMiddleware.checkPermission("read_user_by_id"),   autistiController.getAutistaById);
router.post("/",    upload.single("fotografia"),                                       autistiController.createAutista);
router.put("/me",   verifyToken, rbacMiddleware.checkPermission("update_own_profile"), upload.single("fotografia"), autistiController.updateAutista);
router.delete("/:id", verifyToken, rbacMiddleware.checkPermission("delete_user"),     autistiController.deleteAutista);

module.exports = router;
