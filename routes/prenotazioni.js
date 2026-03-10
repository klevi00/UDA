const express = require("express");
const router = express.Router();

const prenotazioniController = require("../controllers/prenotazioni");
const verifyToken = require("../middleware/token");
const rbacMiddleware = require("../middleware/rbacMiddleware");

router.get("/mine",                                          verifyToken, rbacMiddleware.checkPermission("read_own_prenotazioni"),    prenotazioniController.getMyPrenotazioni);
router.get("/viaggio/:idViaggio",                            verifyToken, rbacMiddleware.checkPermission("read_prenotazioni_viaggio"), prenotazioniController.getPrenotazioniViaggio);
router.post("/",                                             verifyToken, rbacMiddleware.checkPermission("create_prenotazione"),       prenotazioniController.createPrenotazione);
router.patch("/viaggio/:idViaggio/passeggero/:idPasseggero", verifyToken, rbacMiddleware.checkPermission("update_stato_prenotazione"), prenotazioniController.updateStatoPrenotazione);
router.delete("/:idViaggio",                                 verifyToken, rbacMiddleware.checkPermission("delete_own_prenotazione"),   prenotazioniController.deletePrenotazione);

module.exports = router;
