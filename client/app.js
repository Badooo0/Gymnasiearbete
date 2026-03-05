function Header(){
    return(
        <div>
            <h2>Cat website</h2>
            <a href="#">Home</a>
            <a href="#katt">Katter</a>
            <a href="#upload">Upload</a>
            <a href="#login">Login</a>
            <a href="#register">Register</a>
            <a href="#logout">Logout</a>
        </div>
    );
};


function Upload({setKatter, raser}){

    async function skickaIn(event){
        event.preventDefault();

        const katt = {
            name: event.target.name.value,
            race: event.target.race.value
        }

        const res = await fetch("/api/katter", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(katt)
        })
        
        const nyKatt = await res.json()

        if(!res.ok) {
            console.log(nyKatt);
            return;
        } 
        console.log(katt)

        setKatter(prev=>[...prev, nyKatt])
        event.target.reset();
    }





    return(
        <div id="upload" className="content">
            <form onSubmit={skickaIn}>
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
                <input type="submit" value="Submit" />
            </form>
        </div>
    )

}

function Katter({setKatter, katter, raser}){

    React.useEffect(()=>{
        getKatter();
    }, [])

    async function getKatter(){
        const res = await fetch("/api/katter")
        const katter = await res.json()
        setKatter(katter)
        console.log(katter);
    }

    return(
        <div id="katt" className="content">
            {katter.map(k=> 
                <Katt katt = {k} setKatter={setKatter} raser={raser} key={k.id}/>
            )}
        </div>
    )
    
};

function Katt({katt, setKatter, raser}){
    const [edit, setEdit] = React.useState(false);

    async function delKatt(){
        const res = await fetch("/api/katter/" + katt.id, {
            method:"DELETE"
        });

        res.status.ok ? (
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
            body: JSON.stringify(updatedKatt)
        })

        const nyaKatter = await res.json();
        setKatter(prev => prev.map(k => k.id == katt.id ? nyaKatter : k));
        setEdit(false);
    }

    function showEdit(){
        setEdit(e=> !e)
    }

    return(
        <div className="katter" key={katt.id}>
            <h3>{katt.name}</h3>
            <h5>{katt.race.replace(/_/g, " ")}</h5>
            <button onClick={delKatt}>Delete</button>
            <button onClick={showEdit}>{edit ? "Avbryt" : "Edit"}</button>
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

function Login({loggedIn, setLoggedIN}){

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

        res.ok 
            ? setLoggedIN(true)
            : console.log("login failed") 
        
    }




    return(
        !loggedIn ?
        <div id="login" className="content">
            <form onSubmit={login} method="post">
                <input type="text" name="email" placeholder="Email" required/>
                <input type="password" name="password" placeholder="Password" required/>
                <input type="submit" value="Login" />
            </form>
        </div>
        : "lil broooo"
    )
}

function App(){

    const [katter, setKatter] = React.useState([])
    const [loggedIn, setLoggedIN] = React.useState(false)

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

    return(
        <div>
            <Header />
            <Katter setKatter={setKatter} katter={katter} raser={raser}/>
            <Upload setKatter={setKatter} raser={raser}/>
            <Login loggedIn={loggedIn} setLoggedIN={setLoggedIN}/>
        </div>
    );
};



ReactDOM.createRoot(document.querySelector("#root")).render(<App />);