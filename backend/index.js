const express = require("express");
const cors = require("cors")
const app = express();
const usersRoutes = require("./routes/users");
const requestsRoutes = require("./routes/rda_requests")
const itemsRoutes = require("./routes/rda_items")
const actionsRoutes = require("./routes/procurement_actions")
const attachmentsRoutes = require("./routes/attachments")
const approvalsRoutes = require("./routes/approvals")
const loginRoutes = require("./routes/login")
const reportsRoutes = require("./routes/reports")
app.use(express.json());

app.use("/users", usersRoutes);
app.use("/rda", requestsRoutes)
app.use("/rda_items", itemsRoutes)
app.use("/procurement_actions", actionsRoutes)
app.use("/attachments", attachmentsRoutes)
app.use("/approvals", approvalsRoutes)
app.use("/login", loginRoutes)
app.use("/reports", reportsRoutes)

app.get("/", (req, res) => {
  res.send("Server Express attivo!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

// test commit bla