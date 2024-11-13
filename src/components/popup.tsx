import React, { useEffect, useState } from 'react';
import { PredictionInfo, PredictionResponseMessage } from '../types/common';
import GaugeChart from './gaugeChart';
import SummaryDashboard from './summaryDashboard';
import LoadingSpinner from './loadingSpinner';

const Popup: React.FC = () => {
   const [prediction, setPrediction] = useState<PredictionInfo | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
       chrome.storage.local.get(['prediction', 'isLoading'], (result) => {
           const { prediction: storedPrediction, isLoading: loadingStatus } = result;
           setPrediction(storedPrediction || null);
           setIsLoading(loadingStatus !== false);
       });

       const handleMessage = (message: PredictionResponseMessage) => {
           if (message.type === 'UPDATE_POPUP' && message.predictionInfo) {
               setPrediction(message.predictionInfo);
               setIsLoading(false);
               setError(null);
           }
       };

       chrome.runtime.onMessage.addListener(handleMessage);
       return () => {
           chrome.runtime.onMessage.removeListener(handleMessage);
       };
   }, []);

   const renderPrediction = () => {
       if (isLoading) {
           return <p className="text-gray-400 mt-6 text-2xl">Surf Shelter is analyzing this website...</p>;
       }
       if (error) {
        return <p className="text-red-400 mt-6 text-2xl">{error}</p>;
       }
       if (!prediction) {
           return <p className="text-red-400 mt-6 text-2xl">No prediction data available.</p>;
       }
       return (
           <div className='mt-6'>
               <div className={`p-4 mb-6 rounded-lg text-center ${prediction.isMalicious ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
                   <h2 className="text-3xl font-bold uppercase">
                       {prediction.isMalicious ? 'Malicious Website' : 'Safe Website'}
                   </h2>
                   {prediction.isMalicious ? (
                       <p className="text-lg mt-2">Proceed with caution! This site may pose risks.</p>
                   ) : (
                       <p className="text-lg mt-2">This website appears to be safe to use.</p>
                   )}
               </div>
               <GaugeChart accuracy={prediction.accuracy} />
           </div>
       );
   };

   return (
       <div className="w-[500px] h-[600px] p-8 bg-black bg-opacity-90 backdrop-filter backdrop-blur-xl text-gray-100 shadow-2xl overflow-auto" style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 500, fontStyle: 'normal' }}>
           <h1 className="text-4xl font-bold uppercase text-center">Surf Shelter's Prediction</h1>
           {isLoading ? (<LoadingSpinner />) 
           : <>
                {renderPrediction()}
                {prediction && !error && <SummaryDashboard prediction={prediction} />}
           </>}
       </div>
   );
};

export default Popup;
