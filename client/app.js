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