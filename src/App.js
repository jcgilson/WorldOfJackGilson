import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Pool from './pages/Pool';
import SiteHeader from './components/SiteHeader';
import './App.css';
import "./global.css"

function App() {
  return (
    <BrowserRouter>
      <div className="body color026647">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/gilsonGolfPools" element={<><SiteHeader/><Pool/></>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
