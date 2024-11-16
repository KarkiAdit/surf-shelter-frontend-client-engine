import React,  { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const LoadingSpinner: React.FC = () => {
    const textOptions = [
        "Predicting",
        "Surf Shelter's Now Analyzing"
      ];
    const [text, setText] = useState(textOptions[0]);
    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
          currentIndex = (currentIndex + 1) % textOptions.length;
          setText(textOptions[currentIndex]);
        }, 2000); // Toggle text every 2 seconds
        return () => clearInterval(interval);
      }, []);
    return (
        <div className="flex flex-col justify-center items-center h-full">
            <ClipLoader color="#4A90E2" size={60} />
            <p className="text-gray-300 text-lg mt-4">{text}, please wait...</p>
        </div>
    );
};

export default LoadingSpinner;
