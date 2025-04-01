import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home"; 
import Game from "./Game";
import GameOver from "./GameOver";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/gameover" element={<GameOver />} />
      </Routes>
    </Router>
  );
}

export default App;
