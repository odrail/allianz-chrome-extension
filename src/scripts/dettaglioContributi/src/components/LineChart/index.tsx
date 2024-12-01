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

export type DataChart = {
  label: string;
  values:  Value[];
}

export type Value = {
  date: Date;
  netContribution: number;
}


type LineChartProps = {
  data: DataChart[]
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

const formatDate = (date: Date): string => `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}` 

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

const getLabels = (dataCharts: DataChart[]): string[] => {
  return dataCharts.reduce<string[]>((acc, dataChart) => {
    return [
      ...acc,
      ...dataChart.values.map(v => formatDate(v.date))
    ]
  }, [])
}

const getDataset = ({label, data}: {label: string, data: DataChart}): ChartDataset<"line"> => {
  return {
    label,
    data: data.values.map(v => v.netContribution),
    borderColor: '#0C479D',
    backgroundColor: '#0C479D',
  }
}

const buildChartData = (dataCharts: DataChart[]): ChartData<"line", (number | Point | null)[], unknown> => {
  const datasets = dataCharts.map(dataChart => 
    getDataset({
      label: dataChart.label, 
      data: dataChart
    })
  )
  return {
    labels: getLabels(dataCharts),
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