const fs = require("fs/promises");

async function getData(fileDir){
    const data = JSON.parse(await fs.readFile(fileDir));
    return(data);
}

async function saveData(fileDir, data){
    await fs.writeFile(fileDir, JSON.stringify(data, null, 2));
}

function guest(req, res, next){
    if(!req.session.user) req.session.user = {role: "guest"};
    next()
}

function dingus(req, res, next){

    const auth = req.session.user

    if(auth.role == "guest"){
        console.log("user inte tillåten")
        return res.status(401).json({error: "inte en dingus burrr"})
        
    }
    console.log("user tillåten " + auth.role)
    
    next()
}

async function dingdeldi(req, res, next){
    
    const konton = await getData("konto.json");
    const objectID = req.params.id;


    if(req.session.user == "admin")

    next();

}

module.exports = {getData, saveData, guest, dingus, dingdeldi}