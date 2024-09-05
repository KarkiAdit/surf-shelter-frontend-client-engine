import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Title, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Title, Legend);

interface GaugeChartProps {
  accuracy: number;
}

// Custom center text plugin
const centerTextPlugin = {
  id: 'centerTextPlugin',
  beforeDraw: (chart: any) => {
    const { width, height, ctx } = chart;
    ctx.restore();
    const fontSize = (height / 114).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = 'middle';

    const text = `${chart.config.data.datasets[0].data[0].toFixed(2)}%`;
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 1.7;

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, textX, textY);
    ctx.save();
  },
};

const GaugeChart: React.FC<GaugeChartProps> = ({ accuracy }) => {
  const chartData = {
    datasets: [
      {
        data: [accuracy, 100 - accuracy],
        backgroundColor: ['#4f46e5', '#e5e7eb'],
        borderWidth: 0,
        cutout: '80%',
      },
    ],
  };

  const gaugeOptions = {
    circumference: 180,
    rotation: -90,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="mt-8 h-48 w-full flex flex-col items-center bg-black bg-opacity-40 border border-gray-700 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-6">
      <h3 className="text-xl font-semibold text-gray-200">ACCURACY</h3>
      <div className="relative w-40 h-40">
        <Doughnut
          data={chartData}
          options={gaugeOptions}
          plugins={[centerTextPlugin]}
        />
      </div>
    </div>
  );
};

export default GaugeChart;
