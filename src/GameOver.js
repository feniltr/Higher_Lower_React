// GameOver.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

function GameOver() {
  const location = useLocation();
  const finalScore = location.state?.finalScore || 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/arvindkjmeme.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-8 text-center text-white bg-black bg-opacity-60 backdrop-blur-sm">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Game Over
        </h1>
        <p className="text-2xl md:text-3xl mb-6 drop-shadow-md">
          Your final score is:{" "}
          <span className="font-bold text-yellow-400">{finalScore}</span>
        </p>
        <Link to="/game">
          <button className="relative px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105">
            Play Again
          </button>
        </Link>
      </div>
    </div>
  );
}

export default GameOver;
