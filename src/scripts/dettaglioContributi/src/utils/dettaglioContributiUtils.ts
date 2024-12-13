import { DettaglioContributoCumulato } from "../services/getDettaglioContributi"

const mergeDettaglioContributi = (dc1: DettaglioContributoCumulato, dc2: DettaglioContributoCumulato): DettaglioContributoCumulato => {
    return {
        codiceAzienda: dc1.codiceAzienda,
        commissioni: dc1.commissioni + dc2.commissioni,
        commissioniCumulate: dc1.commissioniCumulate + dc2.commissioniCumulate,
        dataCompetenza: dc1.dataCompetenza,
        dataValuta: dc1.dataValuta,
        importo: dc1.importo + dc2.importo,
        importoCumulato: dc1.importoCumulato + dc2.importoCumulato,
        linea: dc1.linea,
        numeroQuote: dc1.numeroQuote + dc2.numeroQuote,
        numeroQuoteCumulate: dc1.numeroQuoteCumulate + dc2.numeroQuoteCumulate,
        ragioneSociale: dc1.ragioneSociale + dc2.ragioneSociale,
        tipologia: dc1.tipologia,
        valoreQuota: dc1.valoreQuota
    }
}

//TODO parametrizzare chiave di raggruppamento
export const groupByDataValuta = (dettaglioContributi: DettaglioContributoCumulato[]): DettaglioContributoCumulato[] => {
    return Object.values(dettaglioContributi
        .reduce<Record<string, DettaglioContributoCumulato>>((acc, dc) => {
            const key = dc.dataValuta.toISOString()
            if (acc[key]) {
                acc[key] = mergeDettaglioContributi(acc[key], dc)
            } else {
                acc[key] = dc
            }
            return acc
        }, {}))
}