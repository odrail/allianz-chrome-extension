import { getHistoricalData, InvestmentData } from 'investing-com-api'

const PAIR_ID_LINEA_AZIONARIA = '1078584'

const callApi = (pairId: string, from: Date, to: Date): Promise<InvestmentData[]> => {
  return getHistoricalData({
    input: pairId,
    resolution: 'D',
    from,
    to
  })
}

export const lineaAzionaria = async (from: Date, to: Date): Promise<InvestmentData[]> =>
  callApi(PAIR_ID_LINEA_AZIONARIA, from, to)