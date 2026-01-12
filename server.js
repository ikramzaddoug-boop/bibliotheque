const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve everything inside /public
app.use(express.static(path.join(__dirname, "public")));

// API route for your JSON
app.get("/api/livres", (req, res) => {
  res.sendFile(path.join(__dirname, "public/data/livres.json"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
