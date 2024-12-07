import { useEffect, useMemo, useState } from "react"
import LineChart, { DataChart } from "./components/LineChart"
import getDettaglioContributi, { DettaglioContributo } from "./services/getDettaglioContributi"
import { lineaAzionaria } from "./services/getHistoricalData"
import { InvestmentData } from "investing-com-api"
import { groupByDataValuta } from "./utils/dettaglioContributiUtils"
import { formatDate } from "./utils/dateUtils"
import SelectPeriod, { Period } from "./components/SelectPeriod"

const mapToDataChart = (dettaglioContributi: DettaglioContributo[], historicalData: InvestmentData[], from: Date | undefined): DataChart => {
  const grouped = groupByDataValuta(dettaglioContributi)

  const dates = [
    ...grouped
      .map(g => g.dataValuta)
      .filter(hd => from ? hd.getTime() >= from.getTime() : true),
    ... historicalData
      .map(h => new Date(h.date))
      .filter(hd => from ? hd.getTime() >= from.getTime() : true)
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
          .map<number>(date => grouped
            .filter(g => g.dataValuta.getTime() <= date.getTime())
            .reduce((acc, g) => acc+= g.importo, 0))
          .slice(-dates.length)
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
          .slice(-dates.length)
      }
    ]
  }
}

const App = () => {
  const [dettaglioContributi, setDettaglioContributi] = useState<DettaglioContributo[]>([])  
  const [historicalData, setHistoricalData] = useState<InvestmentData[]>([])
  const [from, setFrom] = useState<Date>()
  const data: DataChart = useMemo(() => mapToDataChart(dettaglioContributi, historicalData, from), [dettaglioContributi, historicalData, from])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDettaglioContributi(await getDettaglioContributi())
      } catch {
        setDettaglioContributi([])
      }
    }
    fetchData()
  }, [])

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

  const handleSelectPeriodClick = (period: Period) => {
    setFrom(period.from)
  }
    
  return (
    <>
      <div style={{display: 'flex', justifyContent: 'flex-end', margin: '10px 0px 10px 0px'}}>
        <SelectPeriod onClick={handleSelectPeriodClick}/>
      </div>
      <LineChart data={data} />
    </>
  )
}

export default App