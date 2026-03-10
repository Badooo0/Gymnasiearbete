const fs = require("fs");

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

module.exports = {getData, saveData, guest}