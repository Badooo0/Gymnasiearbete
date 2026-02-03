const express = require("express")
const app = express();
app.listen(3400, () => {
    console.log("Server running on http://localhost:3400");
});


app.use(express.static("client"))
app.use(express.json)

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/client/app")
})

app.get("/api/katter", async (req, res)=>{
    const katter = await require("fs").readFile("katter.json")
    res.json(katter)
})
