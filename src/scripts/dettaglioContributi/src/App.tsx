import { useState } from "react"
import LineChart, { DataChart, Value } from "./components/LineChart"
import getDettaglioContributi, { DettaglioContributo } from "./services/getDettaglioContributi"

const mapToDataChart = (dettaglioContributi: DettaglioContributo[]): DataChart[] => {
    return [
      {
        label: 'Contributi',
        values: dettaglioContributi
          .reduce<Value[]>((acc, dc) => {
            const totalNetContributions = acc.length > 0 ? acc[acc.length - 1].netContribution : 0
            const value: Value = {
              date: dc.dataCompetenza,
              netContribution: totalNetContributions + dc.importo
            }
            return [
              ...acc,
              value
            ]
          }, [])
          
      }
    ]
  }

const App = () => {
  const [data, setData] = useState<DataChart[]>([])

  chrome.runtime.onMessage.addListener(
      async function(request: Record<string, string>) {
        const cookieStr: string = Object.entries(request)
          .reduce<string>((acc, [key, value])=> {
            return `${acc}; ${key}=${value}`
          }, '')
        const dettaglioContributi = await getDettaglioContributi(cookieStr)
        setData(mapToDataChart(dettaglioContributi))
      }
    );
    
  return (
    <LineChart data={data}/>
  )
}

export default App