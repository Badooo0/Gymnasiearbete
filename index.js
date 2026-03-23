const express = require("express");
const app = express();
const PORT = process.env.PORT || 3400;
const session = require("express-session");
const bcrypt = require("bcryptjs");
const {getData, saveData, guest, dingus, dingdeldi} = require("./indexFunctions")
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))

app.use(express.static("client"));
app.use(express.json());

app.use(guest)

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.get("/api/katter", dingus, async (req, res) => {
    const katter = await getData("katter.json");
    res.json(katter);
})

app.patch("/api/katter/:id", dingus, async (req, res) => {
    const id = req.params.id;
    const updateradKatt = req.body;

    const katter = await getData("katter.json");
    const updatedKatter = katter.map(k => k.id == id ? {...k, ...updateradKatt}: k) /* får egenskaper från k men skriver över med uppdateradKatts egenskaper */

    await saveData("katter.json", updatedKatter);

    const katt = updatedKatter.find(k => k.id == id);
    res.json(katt)
})

app.delete("/api/katter/:id", dingus,  async (req, res) => {
    const id = req.params.id;
    const katter = await getData("katter.json");
    const filterKatter = katter.filter(k=> k.id != id);

    await saveData("katter.json", filterKatter);
    res.json(filterKatter);
})

app.post("/api/katter", dingus, async (req, res) => {
    try {

        console.log("BODY RECEIVED:", req.body);

        const katter = await getData("katter.json");

        const katt = {
            id: "id_" + Date.now(),
            name: req.body.name,
            race: req.body.race
        };
    
        katter.push(katt)
        await saveData("katter.json", katter)
        res.json(katt)
    } catch (error) {
        console.error("Error adding cat:", error);
        res.status(500).json({error: "Failed to add cat"})
    }
   
})

app.post("/api/login", async (req, res) => {

    const user = req.body
    const konton = await getData("konto.json");

    const konto = konton.find(k => k.email == user.email);

    if(!konto){
        return res.status(401).json({error:"hittade inte kontot"})
    }

    req.session.user = {
        email: konto.email,
        role: konto.role
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    })
})

app.post("/api/register", async (req, res) => {

    const konton = await getData("konto.json");

    const konto = {
        email: req.body.email,
        password: await bcrypt.hash(12, req.body.password),
        role: "normal_bum"
    }
    
    const kontodup = konton.find(k=> k.email == konto.email)

    if(kontodup){return res.status(400).json({error: "kontot finns redan"})}
    res.json(konto)
    konton.push(konto)
    await saveData("konto.json", konton)
    console.log(konto)
})

app.post("/api/logout", (req, res) => {
    req.session.destroy()

    res.json({loggedIn: false})
})

app.get("/api/status", (req, res) => {
    if(req.session.user.role == "guest") {
        console.log(req.session.user.role)
        return res.status(401).json({loggedIn: false})
    }
        
    console.log(req.session.user)
    res.json({
        loggedIn: true,
        user: req.session.user
    })
})

app.get("/test", (req, res) => {
    res.json(req.session)
})