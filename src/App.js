import React, { useState, useEffect } from 'react';
// Pages
import Golf from './pages/Golf';
// Styles
import './App.css';
import "./global.css"

function App() {
  return (
    <div className="body color026647">
      {/* <article>
        <section className="background026647 zIndexNegative" />
      </article> */}
      <Golf/>
    </div>
  );
}

export default App;
