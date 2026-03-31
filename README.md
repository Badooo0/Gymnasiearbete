# Gymnasiearbete---Slutprojekt
## Gymnasiearbete - Benjamin





### Server start
```js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3400;
const session = require("express-session");
const bcrypt = require("bcryptjs");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({storage})

```
Här skriver du din förklaring till koden ovanför

***


### Middleware & Session
```js
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(guest)

app.use(express.static("client"));
app.use(express.json());

function guest(req, res, next){
    if(!req.session.user) req.session.user = {role:"guest"};
    next()
}

function dingus(req, res, next){

    const auth = req.session.user

    if(!auth || auth.role == "guest"){
        console.log("user inte tillåten")
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
```
Guest är ett middleware som sätter på rollen guest på användare som inte har loggat in än. Den finns för att vissa användare inte ska få till exempel använda upload. 

Dingus är en auth middleware och den kopplas till guest genom att dingus tillåter inte 

***