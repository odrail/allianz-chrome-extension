import { useEffect, useMemo, useState } from "react"
import LineChart, { DataChart } from "./components/LineChart"
import getDettaglioContributi, { DettaglioContributo } from "./services/getDettaglioContributi"
import useCookie from "./hooks/useCookie"
import { lineaAzionaria } from "./services/getHistoricalData"
import { InvestmentData } from "investing-com-api"
import { groupByDataValuta } from "./utils/dettaglioContributiUtils"
import { formatDate } from "./utils/dateUtils"

const mapToDataChart = (dettaglioContributi: DettaglioContributo[], historicalData: InvestmentData[]): DataChart => {
  const grouped = groupByDataValuta(dettaglioContributi)
  const dates = [
    ...grouped
      .map(g => g.dataValuta),
    ... historicalData.map(h => new Date(h.date))
    ]
    .sort((a, b) => a.getTime() > b.getTime() ? 1 : -1)
  return {
    labels: dates
      .map(d => formatDate(d)),
    datasets: [
      {
        label: 'Contributi',
        color: '#0C479D',
        values: dates
          .reduce<number[]>((acc, date, index) => {
            const importoPrecedente = index === 0 ? 0 : acc[index - 1]
            const dcFound = grouped.find(g => g.dataValuta.getTime() === date.getTime())
            const value = (dcFound?.importo || 0) + importoPrecedente
            acc.push(value)
            return acc
          }, [])
      },
      {
        label: 'Controvalore',
        color: '#6FA515',
        values: dates
          .reduce<number[]>((acc, date) => {
            if (!historicalData || historicalData.length === 0) {
              acc.push(0)
            } else {
              const dettaglioContributiFiltered: DettaglioContributo[] = grouped.filter(g => g.dataValuta.getTime() <= date.getTime())
              const totQuote: number = dettaglioContributiFiltered.reduce((acc, g) => acc+= g.numeroQuote, 0)
              const historicalDataFiltered = historicalData.filter(historical => historical.date <= date.getTime())
              if (historicalDataFiltered.length === 0) {
                const totImporto: number = dettaglioContributiFiltered.reduce((acc, g) => acc+= g.importo, 0)
                acc.push(totImporto)
              } else {
                const lastHistoricalData = historicalDataFiltered.slice(-1)
                const price = lastHistoricalData[0].price_close
                acc.push(totQuote * price)
              }
            }
            return acc
          }, [])
      }
    ]
  }
}

const App = () => {
  const [dettaglioContributi, setDettaglioContributi] = useState<DettaglioContributo[]>([])  
  const [historicalData, setHistoricalData] = useState<InvestmentData[]>([])
  const cookie = useCookie()
  const data: DataChart = useMemo(() => mapToDataChart(dettaglioContributi, historicalData), [dettaglioContributi, historicalData])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDettaglioContributi(await getDettaglioContributi(cookie))
      } catch {
        setDettaglioContributi([])
      }
    }
    fetchData()
  }, [cookie])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await lineaAzionaria(dettaglioContributi[0].dataValuta, new Date())
        setHistoricalData(response)
      } catch {
        setHistoricalData([])
      }
    }
    fetchData()
  }, [dettaglioContributi])
    
  return (
    <LineChart data={data} />
  )
}

export default App