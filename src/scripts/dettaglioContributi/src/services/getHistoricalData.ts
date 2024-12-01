import { getHistoricalData } from 'investing-com-api'

// TODO linea azionaria da passare come parametro
export const lineaAzionaria = async (from: Date, to: Date) => {
    return getHistoricalData({
        input: '1078584',
        resolution: 'D',
        from,
        to
      })
}