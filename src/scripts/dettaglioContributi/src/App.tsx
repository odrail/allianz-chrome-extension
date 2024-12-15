import { useEffect, useMemo, useState } from "react"
import LineChart, { DataChart } from "./components/LineChart"
import getDettaglioContributi, { DettaglioContributoCumulato } from "./services/getDettaglioContributi"
import { lineaAzionaria } from "./services/getHistoricalData"
import { InvestmentData } from "investing-com-api"
import { groupByDataValuta } from "./utils/dettaglioContributiUtils"
import { formatDate } from "./utils/dateUtils"
import SelectPeriod, { Period } from "./components/SelectPeriod"
import SummaryPosition from "./components/SummaryPosition"
import { COLOR_AMOUNT, COLOR_CONTRIBUTION, MAX_FROM } from "./utils/constants"
import { addDays, differenceInCalendarDays } from "date-fns";

const mapToDataChart = (dettaglioContributi: DettaglioContributoCumulato[], historicalData: InvestmentData[], from: Date | undefined): DataChart => {
  const grouped = groupByDataValuta(dettaglioContributi)
  const to = new Date()
  const fromNormalized = from && from.getTime() === MAX_FROM.getTime()
    ? dettaglioContributi[0]?.dataValuta || to
    : from
  const dates: Date[] = fromNormalized 
    ? new Array(differenceInCalendarDays(to, fromNormalized) + 1)
        .fill(null)
        .map((_, i) => addDays(fromNormalized, i))
    : []

  return {
    labels: dates
      .map(d => formatDate(d)),
    datasets: [
      {
        label: 'Montante',
        color: COLOR_AMOUNT,
        values: dates
          .reduce<number[]>((acc, date) => {
            if (!historicalData || historicalData.length === 0) {
              acc.push(0)
            } else {
              const dettaglioContributiFiltered: DettaglioContributoCumulato[] = grouped.filter(g => g.dataValuta.getTime() <= date.getTime())
              const totQuote: number = dettaglioContributiFiltered.length > 0 ? dettaglioContributiFiltered[dettaglioContributiFiltered.length - 1].numeroQuoteCumulate : 0
              const historicalDataFiltered = historicalData.filter(historical => historical.date <= date.getTime())
              if (historicalDataFiltered.length === 0) {
                const totImporto: number = dettaglioContributiFiltered.length > 0 ? dettaglioContributiFiltered[dettaglioContributiFiltered.length - 1].importoCumulato : 0
                acc.push(totImporto)
              } else {
                const lastHistoricalData = historicalDataFiltered.slice(-1)
                const price = lastHistoricalData[0].price_close
                acc.push(totQuote * price)
              }
            }
            return acc
          }, [])
      },
      {
        label: 'Contributi',
        color: COLOR_CONTRIBUTION,
        values: dates
          .map<number>(date => grouped
            .filter(g => g.dataValuta.getTime() <= date.getTime())
            .reduce((acc, g) => acc > g.importoCumulato ? acc : g.importoCumulato, 0)
            )
      },
    ]
  }
}

const App = () => {
  const [dettaglioContributi, setDettaglioContributi] = useState<DettaglioContributoCumulato[]>([])  
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
      <SummaryPosition from={from} dettaglioContributi={dettaglioContributi} historicalData={historicalData}/>
      <LineChart data={data} />
    </>
  )
}

export default App