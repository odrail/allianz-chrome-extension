import { useEffect, useMemo, useState } from "react"
import LineChart, { DataChart } from "./components/LineChart"
import getDettaglioContributi, { DettaglioContributoCumulato, Linea } from "./services/getDettaglioContributi"
import getHistoricalData, { HistoricalData } from "./services/getHistoricalData"
import { groupByDataValuta } from "./utils/dettaglioContributiUtils"
import { formatDate } from "./utils/dateUtils"
import SelectPeriod, { Period } from "./components/SelectPeriod"
import SummaryPosition from "./components/SummaryPosition"
import { COLOR_AMOUNT, COLOR_CONTRIBUTION, MAX_FROM } from "./utils/constants"
import { addDays, differenceInCalendarDays } from "date-fns";

const mapToDataChart = (dettaglioContributi: DettaglioContributoCumulato[], historicalData: HistoricalData | undefined, from: Date | undefined): DataChart => {
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
            const montanteDelGiorno = Object
              .values(Linea)
              .reduce<number>((acc, linea) => {
                if (!historicalData || historicalData[linea]?.length === 0) {
                  return 0
                } else {
                  const dettaglioContributiFiltered: DettaglioContributoCumulato[] = grouped.filter(g => g.dataValuta.getTime() <= date.getTime())
                  const totQuote: number = (dettaglioContributiFiltered.length > 0 ? dettaglioContributiFiltered[dettaglioContributiFiltered.length - 1][linea]?.numeroQuoteCumulate : 0) || 0
                  const historicalDataFiltered = historicalData[linea]?.filter(historical => historical.date <= date.getTime())
                  if (historicalDataFiltered?.length === 0) {
                    const totImporto: number = (dettaglioContributiFiltered.length > 0 ? dettaglioContributiFiltered[dettaglioContributiFiltered.length - 1][linea]?.importoCumulato : 0) || 0
                    return totImporto
                  } else {
                    const lastHistoricalData = historicalDataFiltered?.slice(-1)
                    const price = Array.isArray(lastHistoricalData) && lastHistoricalData[0].price_close || 0
                    return totQuote * price
                  }
                }
                return acc
              }, 0)
            acc.push(montanteDelGiorno)
            return acc
          }, [])
      },
      {
        label: 'Contributi',
        color: COLOR_CONTRIBUTION,
        values: dates
          .map<number>(date => grouped
            .filter(g => g.dataValuta.getTime() <= date.getTime())
            .reduce((acc, g) => {
              return acc > (g[Linea.LINEA_AZIONARIA]?.importoCumulato || 0) ? acc : (g[Linea.LINEA_AZIONARIA]?.importoCumulato || 0)
            }, 0))
      },
    ]
  }
}

const App = () => {
  const [dettaglioContributi, setDettaglioContributi] = useState<DettaglioContributoCumulato[]>([])  
  const [historicalData, setHistoricalData] = useState<HistoricalData>()
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
        const elencoLinee: Linea[] = dettaglioContributi.reduce<Linea[]>((acc, contributo) => {
          if (!acc.includes(contributo.linea)) {
            acc.push(contributo.linea)
          }
          return acc
        }, [])
        const response = await getHistoricalData(dettaglioContributi[0].dataValuta, new Date(), elencoLinee)
        setHistoricalData(response)
      } catch {
        setHistoricalData(undefined)
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