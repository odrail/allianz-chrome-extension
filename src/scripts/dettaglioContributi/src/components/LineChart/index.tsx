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
import formatCurrency from '../../utils/formatCurrency';

export type Dataset = {
  label: string
  color: string
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
  scales: {
    y: {
      ticks: {
        callback: value => formatCurrency(parseFloat(value.toString()))
      }
    }
  }
};

const getDataset = ({label, data}: {label: string, data: Dataset}): ChartDataset<"line"> => {
  return {
    label,
    data: data.values,
    borderColor: data.color,
    backgroundColor: data.color,
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