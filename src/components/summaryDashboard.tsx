import React from 'react';
import { PredictionInfo } from '../types/common';

interface DashboardProps {
  prediction: PredictionInfo;
}

const SummaryDashboard: React.FC<DashboardProps> = ({ prediction }) => {
  return (
    <div className="bg-black bg-opacity-40 border border-gray-700 backdrop-filter backdrop-blur-lg shadow-xl rounded-lg p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-100">SUMMARY</h3>
      <div className="flex flex-col space-y-4 mt-4">
        <div className="flex justify-between">
          <p className="text-lg text-gray-400">Is Malicious</p>
          <p className={`text-lg font-semibold ${prediction.isMalicious ? 'text-red-500' : 'text-green-500'}`}>
            {prediction.isMalicious ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg text-gray-400">Loss</p>
          <p className="text-lg font-semibold text-gray-100">{prediction.loss.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg text-gray-400">Accuracy</p>
          <p className="text-lg font-semibold text-gray-100">{prediction.accuracy.toFixed(2)}%</p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg text-gray-400">P-Value Accuracy</p>
          <p className="text-lg font-semibold text-gray-100">{prediction.pValueAccuracy.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;
