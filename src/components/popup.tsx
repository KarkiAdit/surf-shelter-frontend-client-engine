import React, { useEffect, useState } from 'react';
import { PredictionInfo, PredictionResponseMessage, StateUpdateMessage } from '../types/common';
import GaugeChart from './gaugeChart';
import SummaryDashboard from './summaryDashboard';
import LoadingSpinner from './loadingSpinner';

const Popup: React.FC = () => {
   const [prediction, setPrediction] = useState<PredictionInfo | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
        chrome.storage.local.get(['prediction', 'isLoading', 'error'], (result) => {
            const { prediction: storedPrediction, isLoading: loadingStatus, error: errorMessage } = result;
            setPrediction(storedPrediction || null);
            setIsLoading(loadingStatus);
            setError(errorMessage)
        });
    
       const handlePredictionMessage = (message: PredictionResponseMessage) => {
            if (message.type === 'UPDATE_POPUP') {
                if (message.predictionInfo) {
                    console.log("Setting prediction and clearing error/loading.");
                    setPrediction({...message.predictionInfo});
                    setIsLoading(false);
                    setError(null);
                } else {
                    console.log("Setting error");
                    setPrediction(null)
                    setIsLoading(false);
                    setError(message.error);
                }
            }
        };
        const handleStateChangeMessage = (message: StateUpdateMessage) => {
            if (message.type === 'STATE_UPDATE') {
                setError(null)
                setPrediction(null)
                setIsLoading(true)
            }
        };
       chrome.runtime.onMessage.addListener(handlePredictionMessage);
       chrome.runtime.onMessage.addListener(handleStateChangeMessage);
       return () => {
           chrome.runtime.onMessage.removeListener(handlePredictionMessage);
           chrome.runtime.onMessage.removeListener(handleStateChangeMessage);
       };
   }, []);

   const renderPrediction = () => {
       if (!prediction) {
           return <p className="text-red-400 mt-6 text-2xl">No prediction data available.</p>;
       }
       return (
           <div className='mt-6'>
               <div className={`p-4 mb-6 rounded-lg text-center ${prediction.prediction_details?.prediction.predicted_label ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
                   <h2 className="text-3xl font-bold uppercase">
                       {prediction.prediction_details?.prediction.predicted_label ? 'Malicious Website' : 'Safe Website'}
                   </h2>
                   {prediction.prediction_details?.prediction.predicted_label ? (
                       <p className="text-lg mt-2">Proceed with caution! This site may pose risks.</p>
                   ) : (
                       <p className="text-lg mt-2">This website appears to be safe to use.</p>
                   )}
               </div>
               <GaugeChart accuracy={prediction.prediction_details?.prediction.accuracy || 1.0} />
           </div>
       );
   };

   return (
       <div className="w-[500px] h-[600px] p-8 bg-black bg-opacity-90 backdrop-filter backdrop-blur-xl text-gray-100 shadow-2xl overflow-auto" style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 500, fontStyle: 'normal' }}>
           <h1 className="text-4xl font-bold uppercase text-center">Surf Shelter's Prediction</h1>
           {error ? (<p className="text-red-400 mt-6 text-2xl">{error}</p>) : isLoading ? 
           (<LoadingSpinner />) : (
                <>
                    {prediction &&  (
                        <>
                            {renderPrediction()}
                            <SummaryDashboard prediction={prediction} />
                        </>
                    )}
                </>
            )}
       </div>
   );
};

export default Popup;
