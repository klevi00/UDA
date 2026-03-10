require('dotenv').config({ path: "./db.env" });

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const loginRoutes        = require("./routes/login");
const autistiRoutes      = require("./routes/autisti");
const passeggeriRoutes   = require("./routes/passeggeri");
const viaggiRoutes       = require("./routes/viaggi");
const prenotazioniRoutes = require("./routes/prenotazioni");
const feedbackRoutes     = require("./routes/feedback");

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/login",        loginRoutes);
app.use("/autisti",      autistiRoutes);
app.use("/passeggeri",   passeggeriRoutes);
app.use("/viaggi",       viaggiRoutes);
app.use("/prenotazioni", prenotazioniRoutes);
app.use("/feedback",     feedbackRoutes);

app.get("/", (req, res) => {
    res.send("BlaBlaCar Urban - Server Express attivo!");
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
