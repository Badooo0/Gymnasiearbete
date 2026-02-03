function Header(){
    return(
        <div>
            <h2>Cat website</h2>
            <a href="/home">Home</a>
            <a href="/katter">katter</a>
            <a href="/upload">upload</a>
        </div>
    );
};




function Katter(){
    return(
        <div>
            
        </div>
    );
    
};

function App(){
    return(
        <div>
            <Header />
        </div>
    );
};



ReactDOM.createRoot(document.querySelector("#root")).render(App());