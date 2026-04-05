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
```
Här sätts en port som localhosten ska lyssna på. Express startas och session, bcrypt och multer definieras. Jag gjorde valet att använda multer för att hantera file upload effektivt och jag gillar hur dynamisk multer kan vara. storage är en konstant för att först visa att vart filen ska sparas och sen vad filen ska heta. upload används för att multer ska senare kunna användas för att ta emot filen. Jag har en annan js fil för funktioner som jag hämtar i ett objekt. 

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

Dingus är en auth middleware och den kopplas till guest genom att dingus tillåter inte att guests att upload, delete, edit

dingdeldi kollar att antingen om en användare är admin får den tillåtelse att ändra på alla katter. Middlewaret gör kollar också så att bara adminen och användaren som skapade katten kan ändra den.

Jag initierar session och använder min guest middleware direkt efter vi kan sätta på en roll till cookien.
Efter det defienerar vi en katalog "client" som index kan nå. 
Express.json() tillåter servern att skicka json.

***

### Hjälp funktioner
```js
async function getData(fileDir){
    const data = JSON.parse(await fs.readFile(fileDir));
    return(data);
}

async function saveData(fileDir, data){
    await fs.writeFile(fileDir, JSON.stringify(data, null, 2));
}
```

Getdata är till för att man ska snabbare hämta data från en json fil och savedata skriver data till en json fil.

***

### Routes
```js
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

        console.log("BODY RECEIVED:", req.body);

        const katter = await getData("katter.json");
        const user = req.session.user;
        const body = req.body
        const file = req.file

        const katt = {
            id: "id_" + Date.now(),
            name: body.name,
            race: body.race,
            creator: user.username,
            creatorE: user.email,
            image: file 
                ? `data:${file.mimetype};base64,${file.buffer.toString("base64")}` 
                : null
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
        console.log(req.session.user.role)
        return res.status(401).json({user: null})
    }
        
    res.json({
        user: req.session.user
    })
})
```
När man just har kommit in på webbsidan skickas filen med index.html. Efter det kommer inte servern behöva ladda något innehåll, utan klienten kommer hantera det med hjälp av fetch. 

Resten av routerna är till för att ge eller ändra data med hjälp av klienten. Jag utgår från att vi kollar efter /api och då på /katter hämtar servern alla katter i databasen och skickar det till klienten. 

Patch api routen /katter/:id används när en användare ska ändra i katter datan som den sedan skickar tillbaka till klienten för att den ska kunna ändra innehållet som visas. 

Delete api routen /katter/:id filtrerar bort den katten som klienten skickar till servern och där filtrerar servern bort katten som den sparar till databasen och skickar tillbaka katten som togs bort till klienten så den ska kunna ändra så katten inte syns.

I api post routen /katter hämtas alla katter, användarens session, bodyn från form och filen som skickas. Upload.single("image") används för att ta emot en fil som har namnet "image" från fil input från klienten. Jag skapar även en lista av vilka mimetype som är tillåtna. Om en fil har en mimetype som inte är tillåten kommer servern skicka tillbaka ett fel meddelande. Därefter skapas ett objekt "katt" som har med allt som behövs innan den sparas i katter.json. Den nya katten läggs till i katter listan och sparas sedan i json filen. 

Post routen /login tar den emot bodyn som skickas av klienten. Den läser av konton filen för att hitta kontot som användaren försöker nå. Lösenordet behöver bli compared för att lösenordet är hashat. Om login fungerar så läggs det till en roller, username, email och en profil bild som inte än är helt klar. Servern skickar sen till klienten hela session så att klienten också ser att användaren är inloggad. 

I /register routen skapas ett objekt till det nya kontot som registreras. Objektet lägger till bodyn som klienten skickar och en roll för de normala användare. Picture är en placeholder för en profilbild som användaren ska senare kunna ändra. Om det här kontot redan finns så avbryts processen men annars sparas det nya kontot och skickas till klienten.

I /logout förstörs session och skickar till klienten att usern inte längre är inloggad. 

/status routen används för kolla om användaren är logged in. Servern skickar då antingen user session eller att user är null. 
***


### App klient
```jsx
function App(){

    const [katter, setKatter] = React.useState([])
    const [user, setUser] = React.useState(null)

    const raser = [
    "abyssinian", 
    "american_bobtail", 
    "american_curl", 
    "american_shorthair", 
    "american_wirehair",
    "Balinese",
    "Bengal_Cats",
    "Birman",
    "Bombay",
    "British_Shorthair",
    "Burmese",
    "Burmilla",
    "Chartreux",
    "Chinese_Li_Hua",
    "Colorpoint_Shorthair",
    "Cornish_Rex",
    "Cymric",
    "Devon_Rex",
    "Egyptian_Mau",
    "European_Burmese",
    "Exotic",
    "Havana_Brown",
    "Himalayan",
    "Japanese_Bobtail",
    "Javanese",
    "Korat",
    "LaPerm",
    "Maine_Coon",
    "Manx",
    "Nebelung",
    "Norwegian_Forest",
    "Ocicat",
    "Oriental",
    "Persian",
    "Pixie-Bob",
    "Ragamuffin",
    "Ragdoll_Cats",
    "Russian_Blue",
    "Savannah",
    "Scottish_Fold",
    "Selkirk_Rex",
    "Siamese_Cat",
    "Siberian",
    "Singapura",
    "Snowshoe",
    "Somali",
    "Sphynx",
    "Tonkinese",
    "Turkish_Angora",
    "Turkish_Van"
    ]

    React.useEffect(() => {
        checkLogin();
    }, [user]);

    async function checkLogin(){
        const res = await fetch("/api/status", {
            credentials: "include"
        })

        const cookie = await res.json()

        res.ok 
            ? setUser(cookie.user) 
            : console.log("det blev något fel med inloggningen")
    }

    async function logout(){
        await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
        })

        setUser(null)
        console.log("logged out")
    }


    return(
        <div>
            <Header user={user}/>
            {user && <Profile katter={katter} setKatter={setKatter} user={user} logout={logout} raser={raser}/>}
            <Katter user={user} setKatter={setKatter} katter={katter} raser={raser}/>
            <Upload setKatter={setKatter} raser={raser}/>
            <Login setUser={setUser} user={user}/>
            <Register />
        </div>
    );
};

ReactDOM.createRoot(document.querySelector("#root")).render(<App />);
```
React kopplas på #root diven i index och renderar app funktionen. I app skapas usestate för user och katter som användas för att ändra deras tillstånd. I app returnas alla andra funktioner som skapas i react. Med varje funktion utom register så skickas det också med variabler som skapas i app men kan senare bli ändrade eller använda av funktionerna som tar emot variablerna. checklogin kollar session varje gång något ändras med user. Logout skickar till servern /logout och då förstörs cookien. Dessutom sätts user till inget på klient sidan så både klienten och servern är utloggade.

***


### html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gymnasiearbete</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel" src="app.js" defer></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="root"></div>
</body>
</html>
```
Html kopplar några react bibliotek som babel för att reacten ska vara kompatibel. Vi kopplar även app.js där jag har all react kod. Diven med id root är den vi renderar på i react och som man lyssnar på från klienten. 

***

### Login och register klient
```jsx
function Login({setUser, user}){

    async function login(event){
        event.preventDefault();

        const konto = {
            email: event.target.email.value,
            password: event.target.password.value
        }

        const res = await fetch("/api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include", //skickas cookies
            body: JSON.stringify(konto)
        })

        const cookie = await res.json()
        res.ok
            ? setUser(cookie.user)
            : console.log("login failed") 
        
    }

    return(
        !user ?
        <div id="login" className="content">
            <form onSubmit={login} method="post">
                <input type="email" name="email" placeholder="Email" required/>
                <input type="password" name="password" placeholder="Password" required/>
                <input type="submit" value="Login" />
            </form>
        </div>
        : <div id="login" className="content">
            
        </div>
    )
}


function Register(){
    async function register(event){
        event.preventDefault(); 

        const konto = {
            username: event.target.username.value,
            email: event.target.email.value,
            password: event.target.password.value
        }

        const res = await fetch("/api/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(konto), 
            credentials: "include"
        })

    }

    return(
        <div id="register" className="content">
            <form onSubmit={register} method="post">
                <input type="text" name="username" placeholder="Username" required/>
                <input type="email" name="email" placeholder="Email" required/>
                <input type="password" name="password" placeholder="Password" required/>
                <input type="submit" value="Register" />
            </form>
        </div>
    )
}
```

Ett objekt skapas med de värdena som satts in i formen på login för email och password av kontot. det här objektet skickas sedan vidare till servern för att bli hanterad och sedan skicka tillbaka session om login gick bra. Det som visas i formen är om man inte är inloggad så det visar en ruta för email och password och submit. Jag är inte helt klar för de ska vara en annan grej som visas om man är logged in. 

I register skapas också ett objekt med samma uppdrag fast att då skapa en ny konto på servern. event.preventdefault() är för att vi ska stanna kvar på samma plats i webbsidan och inte följa dit formen vill skicka användaren. I register begärs en extra username för att visa vem som skapat en katt senare i upload. 

***
### Header och profil klient
```jsx
function Header({user}){
    return(
        <nav>
            <h2>Cat website</h2>
            <a href="#">Home</a>
            <a href="#katt">Katter</a>
            <a href="#upload">Upload</a>
            
            {!user
                ? (
                    <div>
                        <a href="#login">Login</a>
                        <a href="#register">Register</a>
                    </div>
                ) : (   
                    <div>
                        <a href="#profile">
                            {user.profilePic 
                                ? (<img src={user.profilePic}></img>)
                                : (<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ0AAACUCAMAAAC+99ssAAAAMFBMVEXk5ueutLfn6eqrsbTh4+TIzM68wcPLz9HV2NqorrLc3+C1ur3Fycuyt7rZ3N24vb+gAap/AAAELUlEQVR4nO2b25arIAyGJSAHAXn/t91ox2611iIk4IX/1ay56bdCDmCSrnv06NGjR48ePXrUVACtCY4UoYQYtYrSgxDzP24igEG54I3hk4wxLDg13AMQRB8852ytCOmtEq35oNNyR/Yf0Ujd0oAAOnxjm/mY1M3wYAwnaH+AYWjEp87s9t9+fYs0M9gEtkbmA53INpuvsvdBnw438amqeO4SXMRz9fDgKlzE62vhZcDVsx6oDLhavnclWreqEblDJluUoKf7Xb2+iUtq411MdDu8nhiu4Fyj/ECLJwtMR3622fG64I2EeODL4BiThHB5eXhjPE2HJ0vhKD2v1OsmGaqUnFX9P4xHdRsABDjGLI3x8sv/VjSXASiPiUncUcB1ojjZveRJ6EYcOJqoRUjFL5FcklHyyUxHklMsDlx0PAo6LDjmCRxPGDQ8gjvoiEdHkI+RKgUNHVpCIUkpRY+xHR3+N5WH7qH7TUcQFXgxywiuAfrW2RixVhB8ELh3nUW8oxDAFX5+WilQ3O9ufTdGSymG5EE7IL0YOQFbh/Ww4DSf8JAeZVyR0HUDSsbzIw1d+XfZSZYGbmq1l8PRtcswopYoYjuUuKDs05bfBCi7PcXGo+0hi1LbEbIVvy4McX8b8tuzZEVsRVd0gScqEyvlp+Qqcwu5d2T6xvusvIrBQ4WhhS63oPlag5ZZkUHZ1d4ILjdWOKs5g3cRj/tqlpslUicXZ7hQe7hXuGTniyWi+uQnKJZmPspBhRM8kZKXuWw0sg2d9j/4jG9iuAVQhe/ny5lVbVcaQGhpDuOD87Zj7gtgp4Of1gL4ghX/8pLoyX9d8fhG5WSw3ntrg3RqFPfaUplhxKTuZgs0cKTWUN0f17TQ0zu5klNaD11DxvjDYojeZqdFHsO3ywyv9R7jpdOjELUhAQbtpGX8x4bFFL42xCCpBTjZTDvPf4FtsjJnQQ2CPPvF1NFLbnLm3I11mjTPgOin07yOttjQS6oXbXS1kGO0rQzrR/wThsHtV9qyLSg16gHHUm/LzbYC5ArtETRVeUS0Fx/rUS6lCVfMPD6OwAcarbX4wcf6wvgQMvFpk8dnCxp6IBRmLBzJyNzwgAE9GD7Fcwcs8AZQzvky1hzTHqs4eP6y99GkkW98F7sYCm+8IwlPXvguCtVO9Y3nk52vnsut+VKdr0IiOVISHtaw/WWltDME2kg2BV4ry814vw63kc8tOsWrn0r2Osl70NdNwgf6vpMEujXbWVErbqtj6Fvgtne6lw5rGubIbpEO2/PNasReR2eLtlSEoI+4hfE+cActepw1QCTtx5EQ92LKtTceXGm30mu3TIgzNImmbcVAWj7F02YQ7ja5btHmpneXMvEWX8/C36TCrrSOi9vBrcoZIC7FoOl9tHcqsW+911ih3SPxREvU3i6fTJod7x97Tzo/INpCAAAAAABJRU5ErkJggg=="></img>)
                            }
                        </a>
                    </div>
                )
            }
        </nav>
    );
};

function Profile({user, katter, setKatter, logout, raser}){

    const minaKatter = katter.filter(k=> k.creatorE === user.email)

    return(
        <div id="profile" className="content">

            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>

            <h3>Mina katter</h3>

            
            {minaKatter.length == 0
                ? <p>du har inga katter</p>
                : minaKatter.map(k=>(<div className="katter" key={k.id}><Katt user={user} katt = {k} setKatter={setKatter} raser={raser} key={k.id} editable={true}/></div>))
            }

            <button onClick={logout}>Log out</button>
        </div>
    )
}
```

I header vill klienten visa alla länkar som kan klickas på och den hjälp av user som definieras i app. med hjälp av user kan vi sätta upp en conditional render för att bara visa login och register länkarna när user inte är definierad. Alltså när användaren inte är inloggad visas login register annars om användaren är inloggad så visas en länk till profilen med en bild på profilbilden. Profilbilder är inte helt klara så det finns inget sätt att ändra dom just nu. 

I profilen skickas många saker med som user, katter, setKatter, logout, raser. Detta är för att i profilen ska användaren visas och de katter som användaren skapat. När minakatter renderas läggs det då till editable = true i katt som gör att vi kan ändra på kattens innehåll. Dessutom kan vi logga ut från kontot inne på profilen. 


***
### katter och upload klient
```jsx
function Upload({setKatter, raser}){

    async function skickaIn(event){
        event.preventDefault();

        const katt = new FormData(event.target);
        
        const res = await fetch("/api/katter", {
            method: "POST",
            body: katt,
            credentials: "include"
        })

        const nyKatt = await res.json()

        if(!res.ok) {
            console.log(nyKatt);
            return;
        } 

        setKatter(prev=>[...prev, nyKatt])
        event.target.reset();
    }


    return(
        <div id="upload" className="content">
            <form onSubmit={skickaIn} encType="multipart/form-data">
                <input type="text" name="name" placeholder="Name" required/>
                <select name="race" defaultValue="" required>
                    <option value="" disabled>Välj en ras...</option>
                    {raser.map(r=> (
                        <option key={r} value={r}>
                            {r.replace(/_/g, " ").replace(/\b\w/g, bokstav => bokstav.toUpperCase())}  
                            {/* \b = ordgräns, \w = första tecknet i ordet */}
                        </option>
                    ))}
                </select>
                <input type="file" name="image" accept="image/*" />
                <input type="submit" value="Submit" />
            </form>
        </div>
    )
}
function Katter({setKatter, katter, raser, user}){

    React.useEffect(()=>{
        getKatter();
    }, [])

    async function getKatter(){
        const res = await fetch("/api/katter", {
            credentials: "include"
        })
        const katter = await res.json()
        setKatter(katter)
        console.log(katter);
    }

    return(
        <div id="katt" className="content">
            {katter.map(k=> 
                <Katt user={user} katt = {k} setKatter={setKatter} raser={raser} key={k.id} editable={false}/>
            )}
        </div>
    )
    
};

function Katt({katt, setKatter, raser, user, editable}){
    const [edit, setEdit] = React.useState(false);

    async function delKatt(){
        const res = await fetch("/api/katter/" + katt.id, {
            method:"DELETE",
            credentials: "include"
        });

        res.ok ? (
            setKatter(prev=> prev.filter(k=> katt.id != k.id))
        ) : (
            console.log("there was a problem deleting")
        )
    }
    
    async function updateKatt(event){
        event.preventDefault();

        const updatedKatt = {
            name: event.target.name.value,
            race: event.target.race.value
        }

        const res = await fetch("/api/katter/" + katt.id, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updatedKatt),
            credentials: "include"
        })

        const nyaKatter = await res.json();
        setKatter(prev => prev.map(k => k.id == katt.id ? nyaKatter : k));
        setEdit(false); 
    }

    function showEdit(){
        setEdit(e=> !e)
    }

    return(
        <div className="katter">
            <h3>{katt.name || ""}</h3>
            <h5>{katt.race ? katt.race.replace(/_/g, " ") : "ingen ras"}</h5>
            
            <img src={katt.image} alt="placeholder" loading="lazy" />

            {katt.creator
                ? <p>Skapad av: {katt.creator}</p>
                : <p>Ingen ägare</p>
            }

            {editable && user && (user.email === katt.creatorE || user.role === "admin") && (
                <>
                    <button onClick={delKatt}>Delete</button>
                    <button onClick={showEdit}>{edit ? "Avbryt" : "Edit"}</button>
                </>
            )}
            {edit && (
                <div>
                    <form onSubmit={updateKatt}>
                        <input type="text" name="name" placeholder="Name" defaultValue={katt.name} required/>
                        <select name="race" defaultValue={katt.race} required>
                            <option value="" disabled>Välj en ras...</option>
                            {raser.map(r=> (
                                <option key={r} value={r}>
                                    {r.replace(/_/g, " ").replace(/\b\w/g, bokstav => bokstav.toUpperCase())}  
                                </option>
                            ))}
                        </select>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
            )}    
        </div>
    );
}
```

I upload händer det lite mer grejer än i register och login. Här skickar vi med multipart/form-data så att filer kan skickas med till servern. Då för att skapa ett objekt som vi kan skicka till servern används FormData(event.target) och då stoppas alla värden som skickas i formen in i formdata. Vi väntar på att servern skickar tillbaka en fullständig katt med id och allt annat som vi senare kan lägga till i katter med setkatter. Vi lägger då den nya katten i slutet av listan. 

I katter används getkatter när sidan laddas för att kolla de katter som finns. i katter renderar vi en div med katterna men de är mappade och skickas senare vidare in i nästa funktion katt.

Här börjar vi med att säga att edit är false för vi ska inte börja med att visa edit. Katt visar hela kattens card med andra ord de gräjerna vi vill visa om en katt på webbsidan. Den kollar också om delete och edit ska visas för de kan bara hända om editable, user, och user email och kattens skapare matchar. I katter funktionen är editable false så då kommer inte dessa visas. När edit blir true kommer en form visas för de grejer man kan vilja ändra på katten. I katt finns även funktionerna för att uppdatera katten och ta bort katten.

***