import React from 'react';
import { PredictionInfo } from '../types/common';

interface DashboardProps {
  prediction: PredictionInfo;
}

// Helper to properly format the Feature titles
const formatFeatureTitle = (key: string): string => {
  return key
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ') // Split by spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join them back with spaces
};

const SummaryDashboard: React.FC<DashboardProps> = ({ prediction }) => {
  const { prediction_details } = prediction;

  return (
    <>
    <div className="bg-black bg-opacity-40 border border-gray-700 backdrop-filter backdrop-blur-lg shadow-xl rounded-lg p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-100">SUMMARY</h3>
      <div className="flex flex-col space-y-4 mt-4">
        <div className="flex justify-between">
          <p className="text-lg text-gray-400">Is Malicious</p>
          <p className={`text-lg font-semibold ${prediction_details?.prediction.predicted_label ? 'text-red-500' : 'text-green-500'}`}>
            {prediction_details?.prediction.predicted_label ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg text-gray-400">Accuracy</p>
          <p className="text-lg font-semibold text-gray-100">
              {prediction_details?.prediction.accuracy?.toFixed(2)}%
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg text-gray-400">Precision</p>
          <p className="text-lg font-semibold text-gray-100">
            {prediction_details?.prediction.precision?.toFixed(2)}%
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg text-gray-400">Loss</p>
          <p className="text-lg font-semibold text-gray-100">{prediction_details?.prediction.loss?.toFixed(2)}</p>
        </div>
      </div>
    </div>
    <div className="bg-black bg-opacity-40 border border-gray-700 backdrop-filter backdrop-blur-lg shadow-xl rounded-lg p-6 mt-6">
        {/* Displaying Feature Details */}
        <h3 className="text-xl font-bold text-gray-100">Feature Details</h3>
        <div className="flex flex-col space-y-2 mt-4">
          {prediction_details?.features && Object.entries(prediction_details.features).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <p className="text-lg text-gray-400">{formatFeatureTitle(key)}</p>
              <p className="text-lg font-semibold text-gray-100">{value}</p>
            </div>
          ))}
        </div>
    </div>
    </>
  );
};

export default SummaryDashboard;