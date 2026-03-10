const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedback");
const verifyToken = require("../middleware/token");
const rbacMiddleware = require("../middleware/rbacMiddleware");

router.get("/autista/:idAutista",     rbacMiddleware.checkPermission("read_feedback"),              feedbackController.getFeedbackAutista);
router.get("/passeggero/:idPasseggero", rbacMiddleware.checkPermission("read_feedback"),            feedbackController.getFeedbackPasseggero);
router.post("/autista",               verifyToken, rbacMiddleware.checkPermission("create_feedback_autista"),   feedbackController.createFeedbackAutista);
router.post("/passeggero",            verifyToken, rbacMiddleware.checkPermission("create_feedback_passeggero"),feedbackController.createFeedbackPasseggero);
router.delete("/:tipo/:id",           verifyToken, rbacMiddleware.checkPermission("delete_feedback"),           feedbackController.deleteFeedback);

module.exports = router;
