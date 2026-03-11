const fs = require("fs/promises");

async function getData(fileDir){
    const data = JSON.parse(await fs.readFile(fileDir));
    return(data);
}

async function saveData(fileDir, data){
    await fs.writeFile(fileDir, JSON.stringify(data, null, 2));
}

function guest(req, res, next){
    if(!req.session.role) req.session.role = "guest";
    next()
}

async function dingus(req, res, next){

    const konton = await getData("konto.json");

    const auth = konton.find(k=> k.email == req.session.user.email)

    if(!auth) {
        console.log("bingus")
        return next()
    }
    console.log(auth)

    next()
}

module.exports = {getData, saveData, guest, dingus}