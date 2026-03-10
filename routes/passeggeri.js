const express = require("express");
const router = express.Router();

const passeggeriController = require("../controllers/passeggeri");
const verifyToken = require("../middleware/token");
const rbacMiddleware = require("../middleware/rbacMiddleware");

router.get("/",     verifyToken, rbacMiddleware.checkPermission("read_all_users"),     passeggeriController.getPasseggeri);
router.get("/me",   verifyToken, rbacMiddleware.checkPermission("read_current_user"),  passeggeriController.getCurrentPasseggero);
router.get("/:id",  verifyToken, rbacMiddleware.checkPermission("read_user_by_id"),    passeggeriController.getPasseggeroById);
router.post("/",    passeggeriController.createPasseggero);
router.put("/me",   verifyToken, rbacMiddleware.checkPermission("update_own_profile"), passeggeriController.updatePasseggero);
router.delete("/:id", verifyToken, rbacMiddleware.checkPermission("delete_user"),      passeggeriController.deletePasseggero);

module.exports = router;
