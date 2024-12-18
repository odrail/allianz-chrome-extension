import { getHistoricalData, InvestmentData } from 'investing-com-api'
import { Linea } from './getDettaglioContributi'

export type HistoricalData = Partial<Record<Linea, InvestmentData[]>>

const mapPairIdLinea: Record<Linea, string> = {
  [Linea.LINEA_AZIONARIA]: '1078584',
  [Linea.LINEA_OBBLIGAZIONARIA]: '1078595',
  [Linea.LINEA_OBBLIGAZIONARIA_BREVE_TERMINE]: '1078140',
  [Linea.LINEA_OBBLIGAZIONARIA_LUNGO_TERMINE]: '1077906',
  [Linea.LINEA_FLESSIBILE_CON_GARANZIA_RESTITUZIONE_CAPITALE]: '1078533',
  [Linea.LINEA_BILANCIATA]: '1078534',
  [Linea.LINEA_MULTIASSET]: '1077905',
}

const callApi = (pairId: string, from: Date, to: Date): Promise<InvestmentData[]> =>
  getHistoricalData({
    input: pairId,
    resolution: 'D',
    from,
    to
  })

export default async (from: Date, to: Date, linee: Linea[]): Promise<HistoricalData> => {
  return Object
    .values(linee)
    .filter(linea => mapPairIdLinea[linea])// TODO verificare se dovesse arrivare una linea non mappata
    .reduce(async (acc, linea) => (
      {
        ...acc,
        [linea]: await callApi(mapPairIdLinea[linea], from, to)
      }), {})
}