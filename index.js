const express = require("express");
const app = express();
const PORT = process.env.PORT || 3400;
const session = require("express-session");
const bcrypt = require("bcryptjs");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + file.originalname
    cb(null, uniqueSuffix)
  }
})
const upload = multer({ storage: storage })

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

app.use(guest)

app.use(express.static("client"));
app.use(express.static("uploads"));
app.use(express.json());

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.get("/api/katter", async (req, res) => {
    const katter = await getData("katter.json");
    res.json(katter);
})

app.patch("/api/katter/:id", dingus, dingdeldi, async (req, res) => {
    const id = req.params.id;
    const updateradKatt = req.body;

    const katter = await getData("katter.json");
    const updatedKatter = katter.map(k => k.id == id ? {...k, ...updateradKatt}: k) /* får egenskaper från k men skriver över med uppdateradKatts egenskaper */

    await saveData("katter.json", updatedKatter);

    const katt = updatedKatter.find(k => k.id == id);
    res.json(katt)
})

app.delete("/api/katter/:id", dingus, dingdeldi,  async (req, res) => {
    const id = req.params.id;
    const katter = await getData("katter.json");
    const filterKatter = katter.filter(k=> k.id != id);

    await saveData("katter.json", filterKatter);
    res.json(filterKatter);
})

app.post("/api/katter", dingus, upload.single("image"), async (req, res) => {
    try {

        console.log("BODY RECEIVED:", req.body, req.file);

        const katter = await getData("katter.json");
        const user = req.session.user;
        const body = req.body
        const file = req.file

        const allowedExt = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/jfif"]

        !allowedExt.includes(file.mimetype) 
            ? res.json({error: "bild är inte tillåten"})
            : console.log("bild format är tillåten")

        const katt = {
            id: "id_" + Date.now(),
            name: body.name,
            race: body.race,
            creator: user.username,
            creatorE: user.email,
            image: file ? file.filename : null
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
    const konton = await getData("konton.json");

    const konto = konton.find(k => k.email == user.email);

    if(!konto){
        return res.status(401).json({error:"hittade inte kontot"})
    }

    const match = await bcrypt.compare(user.password, konto.password)

    if(!match){
        return res.status(401).json({error:"fel lösenord"})
    }
    req.session.user = {
        username: konto.username,
        email: konto.email,
        role: konto.role,
        profilePic: konto.picture || null
    }

    res.json({
        user: req.session.user
    })
})

app.post("/api/register", async (req, res) => {

    const konton = await getData("konton.json");

    const konto = {
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 12),
        role: "normal_bum",
        picture: null
    }
    
    const kontodup = konton.find(k=> k.email == konto.email)

    const kontoUser = konton.find(p=> p.username == konto.username)

    if(kontodup){return res.status(400).json({error: "email finns redan"})}
    if(kontoUser){return res.status(400).json({error: "username finns redan"})}

    konton.push(konto)
    await saveData("konton.json", konton)
    console.log(konto)

    res.json(konto)
})

app.post("/api/logout", (req, res) => {
    req.session.destroy()

    res.json({user: null})
})

app.get("/api/status", (req, res) => {
    if(!req.session.user || req.session.user.role == "guest") {
        console.log(req.session.user.role || null)
        return res.status(401).json({user: null})
    }
        
    res.json({
        user: req.session.user
    })
})
