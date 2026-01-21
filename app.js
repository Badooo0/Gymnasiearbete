
function Header(){
    return(
        <div>
            <h2>Cat website</h2>
            <a href="/home">Home</a>
        </div>
    )
}

function Main(){

    return(
        <div>

            
        </div>
    )
    
}

function App(){
    return(
        <div>
            <Header />
        </div>
    )
}


//unc





ReactDOM.createRoot(document.querySelector("#root")).render(App());