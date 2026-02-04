function Header(){
    return(
        <div>
            <h2>Cat website</h2>
            <a href="/home">Home</a>
            <a href="/api/katter">katter</a>
            <a href="/upload">upload</a>
        </div>
    );
};




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
        <div>
            {katter.map(k=>  <h2 key={k.id}>{k.name}</h2>)}
        </div>
    );
    
};

function App(){
    return(
        <div>
            <Header />
            <Katter />
        </div>
    );
};



ReactDOM.createRoot(document.querySelector("#root")).render(<App />);