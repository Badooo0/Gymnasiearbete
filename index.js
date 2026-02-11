const express = require("express")
const app = express();
const PORT = process.env.PORT || 3400;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const fs = require("fs").promises;

app.use(express.static("client"));
app.use(express.json());

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.get("/api/katter", async (req, res) => {
    const katter = await fs.readFile("katter.json");
    res.json(JSON.parse(katter));
})

app.post("/api/upload", async (req, res) => {
    const katter = await fs.readFile("katter.json");
    const katterna = JSON.parse(katter);
    const katt = req.body;

    katt.id = "id_" + (katterna.length + 1);

    katterna.push(katt);
    await fs.writeFile("katter.json", JSON.stringify(katterna, null, 2));
    res.json(katt);
})
