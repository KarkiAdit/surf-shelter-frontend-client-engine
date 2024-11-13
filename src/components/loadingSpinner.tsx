import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col justify-center items-center h-full">
            <ClipLoader color="#4A90E2" size={60} />
            <p className="text-gray-300 text-lg mt-4">Predicting, please wait...</p>
        </div>
    );
};

export default LoadingSpinner;
