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


/* const katter = fetch("fs").JSON.parse("/katter.json"); */

/* function Main(){
    return(
        <div>
            {katter}
        </div>
    );
    
};
 */
function App(){
    return(
        <div>
            <Header />
            <Main />
        </div>
    );
};



ReactDOM.createRoot(document.querySelector("#root")).render(App());