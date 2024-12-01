import { DettaglioContributo } from "../services/getDettaglioContributi"

const mergeDettaglioContributi = (dc1: DettaglioContributo, dc2: DettaglioContributo): DettaglioContributo => {
    return {
        codiceAzienda: dc1.codiceAzienda,
        commissioni: dc1.commissioni + dc2.commissioni,
        dataCompetenza: dc1.dataCompetenza,
        dataValuta: dc1.dataValuta,
        importo: dc1.importo + dc2.importo,
        linea: dc1.linea,
        numeroQuote: dc1.numeroQuote + dc2.numeroQuote,
        ragioneSociale: dc1.ragioneSociale + dc2.ragioneSociale,
        tipologia: dc1.tipologia,
        valoreQuota: dc1.valoreQuota
    }
}

//TODO parametrizzare chiave di raggruppamento
export const groupByDataValuta = (dettaglioContributi: DettaglioContributo[]): DettaglioContributo[] => {
    return Object.values(dettaglioContributi
        .reduce<Record<string, DettaglioContributo>>((acc, dc) => {
            const key = dc.dataValuta.toISOString()
            if (acc[key]) {
                acc[key] = mergeDettaglioContributi(acc[key], dc)
            } else {
                acc[key] = dc
            }
            return acc
        }, {}))
}