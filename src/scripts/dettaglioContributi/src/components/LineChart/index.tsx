import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataset,
  ChartData,
  Point,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/numberUtils';

export type Dataset = {
  label: string
  color: string  
  yAxisID: string
  values:  number[]
}

export type DataChart = {
  labels: string[],
  datasets: Dataset[]
}

type LineChartProps = {
  data: DataChart
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false
    },
    tooltip: {
      callbacks: {
          label: context => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
      }
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    y1: {
      ticks: {
        callback: value => formatCurrency(parseFloat(value.toString()))
      },
      position: 'left'
    },
    y2: {
      position: 'right'
    }
  }
};

const getDataset = ({label, data}: {label: string, data: Dataset}): ChartDataset<"line"> => {
  return {
    label,
    data: data.values,
    borderColor: data.color,
    backgroundColor: data.color,
    tension: 0.4,
    pointRadius: 0,
    yAxisID: data.yAxisID
  }
}

const buildChartData = (dataChart: DataChart): ChartData<"line", (number | Point | null)[], unknown> => {
  const datasets = dataChart.datasets.map(dataChart => 
    getDataset({
      label: dataChart.label, 
      data: dataChart
    })
  )
  return {
    labels: dataChart.labels,
    datasets: datasets
  }
};

const LineChart = ({ data }: LineChartProps): React.ReactElement => {
    const chartData = useMemo(() => buildChartData(data), [data])
    return (
        <Line
            options={options}
            data={chartData}
        />
    )
}

export default LineChart