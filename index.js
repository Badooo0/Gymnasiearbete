const express = require("express");
const app = express();
const PORT = process.env.PORT || 3400;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const fs = require("fs/promises")

app.use(express.static("client"));
app.use(express.json());

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.get("/api/katter", async (req, res) => {
    const katter = await fs.readFile("katter.json");
    res.json(JSON.parse(katter));
})

app.patch("/api/katter/:id", async (req, res) => {
    const id = req.params.id;
    const updateradKatt = req.body;

    const katter = JSON.parse(await fs.readFile("katter.json"));
    const updatedKatter = katter.map(k => k.id == id ? {...k, ...updateradKatt}: k) /* får egenskaper från k men skriver över med uppdateradKatts egenskaper */

    await fs.writeFile("katter.json", JSON.stringify(updatedKatter, null, 2));

    const katt = updatedKatter.find(k => k.id == id);
    res.json(katt)
})

app.delete("/api/katter/:id", async (req, res) => {
    const id = req.params.id;
    const katter = JSON.parse(await fs.readFile("katter.json"));
    const filterKatter = katter.filter(k=> k.id != id);

    await fs.writeFile("katter.json", JSON.stringify(filterKatter, null, 2));
    res.json(filterKatter);
})

app.post("/api/katter", async (req, res) => {
    try {

        console.log("BODY RECEIVED:", req.body);

        const data = await fs.readFile("katter.json");
        const katter = JSON.parse(data);

        const katt = {
            id: "id_" + (katter.length + 1),
            name: req.body.name,
            race: req.body.race
        };
    
        katter.push(katt)
        await fs.writeFile("katter.json", JSON.stringify(katter, null, 2))
        res.json(katt)
    } catch (error) {
        console.error("Error adding cat:", error);
        res.status(500).json({error: "Failed to add cat"})
    }
   
})

