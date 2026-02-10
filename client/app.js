function Header(){
    return(
        <div>
            <h2>Cat website</h2>
            <a href="#home">Home</a>
            <a href="#katt">katter</a>
            <a href="#upload">upload</a>
        </div>
    );
};


function Upload(){

    async function getkatter(){
        const res = await fetch("/api/katter")
        const katter = await res.json()
    }

    return(
        <div id="upload" className="content">
            <form action="/api/katter" method="post">
                <input type="text" name="name" id="" />
                <input type="submit" value="Submit" />
            </form>
        </div>
    )

}

function Katter(){

    React.useEffect(()=>{
        getKatter();
    }, [])

    const [katter, setKatter] = React.useState([])

    async function getKatter(){
        const res = await fetch("/api/katter")
        const katter = await res.json()
        setKatter(katter)
        console.log(katter);
    }

    return(
        <div id="katt" className="content">
            {katter.map(k=> <div className="katter"><h3 key={k.id}>{k.name}</h3></div>)}
        </div>
    );
    
};

function App(){
    return(
        <div>
            <Header />
            <Katter />
            <Upload />
        </div>
    );
};



ReactDOM.createRoot(document.querySelector("#root")).render(<App />);