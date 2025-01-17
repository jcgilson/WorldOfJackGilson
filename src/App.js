import React, { useState, useEffect } from 'react';
// Pages
import Golf from './pages/Golf';
import Pool from './pages/Pool'
// Styles
import './App.css';
import "./global.css"

function App() {
  return (
    <div className="body color026647">
      {/* <article>
        <section className="background026647 zIndexNegative" />
      </article> */}
      {/* <Golf/> */}
      <Pool/>
    </div>
  );
}

export default App;
