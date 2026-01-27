const express = require("express")
const app = express();
app.listen(3400, () => {
    console.log("Server running on http://localhost:3400");
});


app.use(express.static("client"))

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/client/app")
})
