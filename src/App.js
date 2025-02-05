import React, { useState } from 'react';
// Pages
import Golf from './pages/Golf';
import Pool from './pages/Pool'
// Styles
import './App.css';
import "./global.css"

function App() {
  const [flow, setFlow] = useState("Pool");

  return (
    <div className="body color026647">
      {/* <div className="textDecoration" style={{ position: "absolute", bottom: "0", right: "calc(50% - 200px"}} onClick={() => setFlow(flow === "Pool" ? "Golf" : "Pool")}>
        Created by Jack Gilson
      </div> */}
      {flow === "Golf" && <Golf/>}
      {flow === "Pool" && <Pool/>}
    </div>
  );
}

export default App;
