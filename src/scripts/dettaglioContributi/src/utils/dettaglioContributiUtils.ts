import { DettaglioContributoCumulato } from "../services/getDettaglioContributi"

const mergeDettaglioContributi = (dc1: DettaglioContributoCumulato, dc2: DettaglioContributoCumulato): DettaglioContributoCumulato => {
    const { linea: lineaDc1 } = dc1
    const { linea: lineaDc2 } = dc2
    return {
        codiceAzienda: dc1.codiceAzienda,
        commissioni: (dc1.commissioni || 0) + (dc2.commissioni || 0),
        dataCompetenza: dc1.dataCompetenza,
        dataValuta: dc1.dataValuta,
        importo: (dc1.importo || 0) + (dc2.importo || 0),
        linea: dc1.linea,
        numeroQuote: (dc1.numeroQuote || 0) + (dc2.numeroQuote || 0),
        ragioneSociale: dc1.ragioneSociale + dc2.ragioneSociale,
        tipologia: dc1.tipologia,
        valoreQuota: dc1.valoreQuota,
        [lineaDc1]: {
            importoCumulato: (dc1[lineaDc1]?.importoCumulato || 0) > (dc2[lineaDc1]?.importoCumulato || 0) ? (dc1[lineaDc1]?.importoCumulato || 0) : (dc2[lineaDc1]?.importoCumulato || 0),
            numeroQuoteCumulate: (dc1[lineaDc1]?.numeroQuoteCumulate || 0) > (dc2[lineaDc1]?.numeroQuoteCumulate || 0) ? (dc1[lineaDc1]?.numeroQuoteCumulate || 0) : (dc2[lineaDc1]?.numeroQuoteCumulate || 0),
            commissioniCumulate: (dc1[lineaDc1]?.commissioniCumulate || 0) > (dc2[lineaDc1]?.commissioniCumulate || 0) ? (dc1[lineaDc1]?.commissioniCumulate || 0) : (dc2[lineaDc1]?.commissioniCumulate || 0),
        },
        [lineaDc2]: {
            importoCumulato: (dc1[lineaDc2]?.importoCumulato || 0) > (dc2[lineaDc2]?.importoCumulato || 0) ? (dc1[lineaDc2]?.importoCumulato || 0) : (dc2[lineaDc2]?.importoCumulato || 0),
            numeroQuoteCumulate: (dc1[lineaDc2]?.numeroQuoteCumulate || 0) > (dc2[lineaDc2]?.numeroQuoteCumulate || 0) ? (dc1[lineaDc2]?.numeroQuoteCumulate || 0) : (dc2[lineaDc2]?.numeroQuoteCumulate || 0),
            commissioniCumulate: (dc1[lineaDc2]?.commissioniCumulate || 0) > (dc2[lineaDc2]?.commissioniCumulate || 0) ? (dc1[lineaDc2]?.commissioniCumulate || 0) : (dc2[lineaDc2]?.commissioniCumulate || 0),
        }
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