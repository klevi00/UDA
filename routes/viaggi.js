const express = require("express");
const router = express.Router();

const viaggiController = require("../controllers/viaggi");
const verifyToken = require("../middleware/token");
const rbacMiddleware = require("../middleware/rbacMiddleware");

router.get("/search",  rbacMiddleware.checkPermission("search_viaggi"),                             viaggiController.searchViaggi);
router.get("/mine",    verifyToken, rbacMiddleware.checkPermission("read_own_viaggi"),              viaggiController.getMyViaggi);
router.get("/:id",     rbacMiddleware.checkPermission("read_viaggio"),                              viaggiController.getViaggioById);
router.post("/",       verifyToken, rbacMiddleware.checkPermission("create_viaggio"),               viaggiController.createViaggio);
router.put("/:id",     verifyToken, rbacMiddleware.checkPermission("update_own_viaggio"),           viaggiController.updateViaggio);
router.delete("/:id",  verifyToken, rbacMiddleware.checkPermission("delete_own_viaggio"),           viaggiController.deleteViaggio);

module.exports = router;
