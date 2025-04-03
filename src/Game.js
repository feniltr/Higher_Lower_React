import "./styles.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const url = "https://higher-lower-react.onrender.com";

const animateNumber = (start, end, duration, callback) => {
  if (start === null || end === null) return;
  
  const startTime = performance.now();

  const step = (currentTime) => {
    const progress = (currentTime - startTime) / duration;
    if (progress < 1) {
      const currentNumber = Math.floor(start + (end - start) * progress);
      callback(currentNumber);
      requestAnimationFrame(step);
    } else {
      callback(end);
    }
  };

  requestAnimationFrame(step);
};

export default function Game() {
  const [leftItem, setLeftItem] = useState(null);
  const [rightItem, setRightItem] = useState(null);
  const [leftNumSearches, setLeftNumSearches] = useState(null);
  const [rightNumSearches, setRightNumSearches] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [correct, setCorrect] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [nextItem, setNextItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedHighScore = localStorage.getItem("highScore");
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }

    fetchRandomGames();
  }, []);

  const fetchRandomGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${url}/api/random-games/`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      const { leftItem, rightItem } = response.data;
      
      if (!leftItem || !rightItem) {
        throw new Error("Missing item data in response");
      }

      if (leftItem.num_searches !== null && leftItem.num_searches !== undefined) {
        animateNumber(0, leftItem.num_searches, 1000, (value) =>
          setLeftNumSearches(value)
        );
      }
      
      if (rightItem.num_searches !== null && rightItem.num_searches !== undefined) {
        animateNumber(0, rightItem.num_searches, 1000, (value) =>
          setRightNumSearches(value)
        );
      }

      setLeftItem(leftItem);
      setRightItem(rightItem);
      setCorrect(null); 
      setButtonsDisabled(false);
      setAnimating(false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching random games:", error);
      setError("Failed to load game data. Please try again.");
      setLoading(false);
    }
  };

  const fetchNextRightItem = async () => {
    try {
      setButtonsDisabled(true);
      
      // Fetch the next item while current animation is happening
      const response = await axios.get(
        `${url}/api/random-games/single/`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      const newItem = response.data;

      // Preload the image
      if (newItem && newItem.image) {
        const img = new Image();
        img.src = `${url}${newItem.image}`;
      }

      // Store the next item
      setNextItem(newItem);
      
      // Start the animation
      setAnimating(true);
      
      // After animation completes (800ms), update the state
      setTimeout(() => {
        try {
          // Move right item to left position
          if (rightItem) {
            setLeftItem(rightItem);
            setLeftNumSearches(rightNumSearches);
          }
          
          // Set new right item
          setRightItem(newItem);
          
          if (newItem && newItem.num_searches !== null && newItem.num_searches !== undefined) {
            animateNumber(0, newItem.num_searches, 1000, (value) =>
              setRightNumSearches(value)
            );
          }
          
          // Reset animation state
          setAnimating(false);
          setCorrect(null);
          setButtonsDisabled(false);
        } catch (err) {
          console.error("Error during state update:", err);
          setAnimating(false);
          setButtonsDisabled(false);
        }
      }, 800);
    } catch (error) {
      console.error("Error fetching next right item:", error);
      setAnimating(false);
      setButtonsDisabled(false);
      setError("Failed to load next item. Please try again.");
    }
  };

  const handleChoice = (choice) => {
    if (!leftItem || !rightItem || buttonsDisabled || animating || loading) return;

    try {
      setButtonsDisabled(true);
      
      if (leftItem.num_searches === rightItem.num_searches) {
        // Start the number animation for the right item
        if (rightItem.num_searches !== null && rightItem.num_searches !== undefined) {
          animateNumber(0, rightItem.num_searches, 1000, (value) =>
            setRightNumSearches(value)
          );
        }
        
        setCorrect(true); 

        setScore((prevScore) => {
          const newScore = prevScore + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("highScore", newScore);
          }
          return newScore;
        });

        // Animation will handle moving right item to left
        setTimeout(() => {
          fetchNextRightItem();
        }, 2000); // Give time for number animation to complete
        return;
      }

      const correctAnswer =
        choice === "higher"
          ? rightItem.num_searches > leftItem.num_searches
          : rightItem.num_searches < leftItem.num_searches;

      // Start the number animation for the right item
      if (rightItem.num_searches !== null && rightItem.num_searches !== undefined) {
        animateNumber(0, rightItem.num_searches, 1000, (value) =>
          setRightNumSearches(value)
        );
      }

      // Delay setting correct/incorrect to allow animation to run
      setTimeout(() => {
        if (correctAnswer) {
          setCorrect(true); 
          setScore((prevScore) => {
            const newScore = prevScore + 1;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem("highScore", newScore);
            }
            return newScore;
          });

          // Animation will handle moving right item to left
          setTimeout(() => {
            fetchNextRightItem();
          }, 1000);
        } else {
          setCorrect(false);
          setTimeout(() => {
            navigate("/gameover", { state: { finalScore: score } });
          }, 2000);
        }
      }, 1200); // Wait for number animation to complete before showing correct/incorrect
    } catch (err) {
      console.error("Error in handleChoice:", err);
      setButtonsDisabled(false);
    }
  };

  // Safely get image URLs with fallbacks
  const getImageUrl = (item) => {
    if (!item) return "";
    if (!item.image) return "";
    return `${url}${item.image}`;
  };

  const leftItemImageUrl = getImageUrl(leftItem);
  const rightItemImageUrl = getImageUrl(rightItem);
  const nextItemImageUrl = getImageUrl(nextItem);

  // Safe formatter for numbers
  const formatNumber = (number) => {
    if (number === null || number === undefined) return "N/A";
    try {
      return number.toLocaleString();
    } catch (err) {
      return "N/A";
    }
  };

  // If loading, show a loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Loading Game...</h2>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // If error, show error screen
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center p-8">
          <h2 className="text-3xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchRandomGames();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-300 min-h-screen">
      <div className="absolute inset-0 flex flex-col md:flex-row h-full w-full bg-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 flex justify-between px-4 py-2 text-white text-xl md:hidden z-40">
          <p>
            High Score: <span className="font-bold text-2xl">{highScore}</span>
          </p>
          <p>
            Score: <span className="font-bold text-2xl">{score}</span>
          </p>
        </div>

        <div className="flex flex-col md:flex-row w-full h-full relative overflow-hidden bg-black">
          {/* Left Item */}
          {leftItem && (
            <div
              className={`game-item flex-1 flex flex-col justify-center items-center bg-cover bg-center relative ${
                animating ? "slide-to-left" : ""
              }`}
              style={{ backgroundImage: `url(${leftItemImageUrl})` }}
            >
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <div className="relative z-10 text-center text-white p-4">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-2">
                  {leftItem.tag_name || "Unknown"}
                </h2>
                <p className="text-xl md:text-2xl">has</p>
                <p className="text-4xl md:text-5xl font-extrabold text-yellow-400 my-2">
                  {leftNumSearches !== null
                    ? formatNumber(leftNumSearches)
                    : "N/A"}
                </p>
                <p className="text-base md:text-lg">average monthly searches</p>
              </div>
            </div>
          )}

          {/* Right Item */}
          {rightItem && (
            <div
              className={`game-item flex-1 flex flex-col justify-center items-center bg-cover bg-center relative ${
                animating ? "slide-to-left" : ""
              }`}
              style={{ backgroundImage: `url(${rightItemImageUrl})` }}
            >
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <div className="relative z-10 text-center text-white p-4">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-2">
                  {rightItem.tag_name || "Unknown"}
                </h2>
                <p className="text-xl md:text-2xl">has</p>
                <div className="flex flex-col my-2">
                  {buttonsDisabled ? (
                    <div className="text-white text-lg md:text-xl">
                      <p className="text-4xl md:text-5xl font-extrabold text-yellow-400 my-2">
                        {rightNumSearches !== null
                          ? formatNumber(rightNumSearches)
                          : "N/A"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center space-y-4">
                        <button
                          onClick={() => handleChoice("higher")}
                          className="w-[90%] max-w-[220px] border border-white text-white hover:bg-yellow-400 hover:text-black text-base md:text-xl p-4 rounded-lg font-medium bg-transparent transition-colors duration-300 flex items-center justify-center"
                          disabled={buttonsDisabled || animating}
                        >
                          Higher
                        </button>
                        <button
                          onClick={() => handleChoice("lower")}
                          className="w-[90%] max-w-[220px] border border-white text-white hover:bg-yellow-400 hover:text-black text-base md:text-xl p-4 rounded-lg font-medium bg-transparent transition-colors duration-300 flex items-center justify-center"
                          disabled={buttonsDisabled || animating}
                        >
                          Lower
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-base md:text-lg mt-2">
                  searches than {leftItem?.tag_name || "previous item"}
                </p>
              </div>
            </div>
          )}

          {/* Next Item (hidden but ready to slide in) */}
          {animating && nextItem && (
            <div
              className="game-item flex-1 flex flex-col justify-center items-center bg-cover bg-center absolute right-0 top-0 bottom-0 new-from-right"
              style={{ 
                backgroundImage: `url(${nextItemImageUrl})`,
                width: '50%',
                zIndex: 5 // Ensure this is above other elements
              }}
            >
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <div className="relative z-10 text-center text-white p-4">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-2">
                  {nextItem.tag_name || "Loading..."}
                </h2>
                <p className="text-xl md:text-2xl">has</p>
                <div className="flex flex-col my-2">
                  <div className="text-white text-lg md:text-xl">
                    <p className="text-4xl md:text-5xl font-extrabold text-yellow-400 my-2">?</p>
                  </div>
                </div>
                <p className="text-base md:text-lg mt-2">
                  searches than {rightItem?.tag_name || "previous item"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          className={`vs-logo absolute z-20 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-extrabold text-black top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out transform ${
            correct === true
              ? "bg-green-500 text-white scale-110 opacity-100" 
              : correct === false
              ? "bg-red-500 text-white scale-110 opacity-100" 
              : "bg-white text-black scale-100 opacity-100" 
          } ${animating ? "fade-out" : "fade-in"}`}
          style={{
            transition: "all 0.5s ease-in-out", 
          }}
        >
          <span
            className={`transition-all duration-500 transform ${
              correct !== null
                ? "scale-150 opacity-100"
                : "scale-100 opacity-100"
            }`}
          >
            {correct === true ? "✔" : correct === false ? "✘" : "VS"}
          </span>
        </div>
      </div>

      {/* Bottom Scores for Desktop */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 justify-between px-10 py-4 text-white text-xl z-40">
        <p>
          High Score: <span className="font-bold text-2xl">{highScore}</span>
        </p>
        <p>
          Score: <span className="font-bold text-2xl">{score}</span>
        </p>
      </div>
    </div>
  );
}
