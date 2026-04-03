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

    if(!auth || auth.role == "guest"){
        console.log(auth.role+" inte tillåten")
        return res.status(401).json({error: "inte en dingus burrr"})
        
    }
    console.log(auth.role + " tillåten")
    
    next()
}

async function dingdeldi(req, res, next){
    
    const katter = await getData("katter.json");
    const objectID = req.params.id;

    const katt = katter.find(k => objectID == k.id)

    if(req.session.user.role == "admin"){

        return next()
    }

    if(!katt){
        return res.status(404).json({error: "katt finns inte"})
    }

    if(katt.creatorE !== req.session.user.email){
        return res.status(403).json({error: "inte ägaren"})
    }

    next();

}

module.exports = {getData, saveData, guest, dingus, dingdeldi}