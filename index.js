const express = require("express")
const app = express();
const PORT = process.env.PORT || 3400;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const fs = require("fs").promises;

app.use(express.static("client"));
app.use(express.json());

/* app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/client/index")
}) */

app.get("/api/katter", async (req, res) => {
    const katter = await fs.readFile("katter.json");
    res.json(katter);
})
