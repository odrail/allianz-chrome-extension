import { useEffect, useState } from "react"
import LineChart, { DataChart, Value } from "./components/LineChart"
import getDettaglioContributi, { DettaglioContributo } from "./services/getDettaglioContributi"
import useCookie from "./hooks/useCookie"

const mapToDataChart = (dettaglioContributi: DettaglioContributo[]): DataChart[] => {
    return [
      {
        label: 'Contributi',
        values: dettaglioContributi
          .reduce<Value[]>((acc, dc, i) => {
            const totalNetContributions = acc.length > 0 ? acc[acc.length - 1].netContribution : 0
            const value: Value = {
              date: dc.dataCompetenza,
              netContribution: totalNetContributions + dc.importo
            }
            if ( i === 0 || acc[acc.length -1] && acc[acc.length -1].date.getTime() !== dc.dataCompetenza.getTime()) {
              acc = [
                ...acc,
                value
              ]
            } else {
              acc[acc.length -1] = value
            }
            return acc
          }, [])
      }
    ]
  }

const App = () => {
  const [data, setData] = useState<DataChart[]>([])
  const cookie = useCookie()

  useEffect(() => {
    const fetchData = async () => {
      const dettaglioContributi = await getDettaglioContributi(cookie)
      setData(mapToDataChart(dettaglioContributi))
    }
    fetchData()
  })
    
  return (
    <LineChart data={data}/>
  )
}

export default App