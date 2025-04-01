import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url('https://storage.needpix.com/rsynced_images/animals-4312837_1280.png')`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>

      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-6">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
          THE INDIAN <span className="text-green-500">HIGHER</span>{" "}
          <span className="text-red-500">LOWER</span> GAME
        </h1>

        <p className="text-lg md:text-xl mb-8 font-medium drop-shadow-md">
          Guess higher or lower ?
        </p>
        <p className="text-md md:text-lg mb-12 drop-shadow-md">
          An addictive game of comparing search popularity, based solely on
          Google search data.
          <br /> This is a fun, unofficial Indian version inspired by the
          original game.
          <br />
          Data based on 2024.
        </p>

        <div className="flex space-x-4">
          <Link to="/game">
            <button className="px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-all duration-300">
              Play
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
