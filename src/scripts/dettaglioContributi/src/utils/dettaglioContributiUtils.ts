import { DettaglioContributo } from "../services/getDettaglioContributi"

const mergeDettaglioContributi = (dc1: DettaglioContributo, dc2: DettaglioContributo): DettaglioContributo => {
    const { linea: lineaDc1 } = dc1
    const { linea: lineaDc2 } = dc2
    const importoCumulatoDc1 = (dc1[lineaDc1]?.importoCumulato || 0) > (dc2[lineaDc1]?.importoCumulato || 0) ? (dc1[lineaDc1]?.importoCumulato || 0) : (dc2[lineaDc1]?.importoCumulato || 0)
    const numeroQuoteCumulateDc1 = (dc1[lineaDc1]?.numeroQuoteCumulate || 0) > (dc2[lineaDc1]?.numeroQuoteCumulate || 0) ? (dc1[lineaDc1]?.numeroQuoteCumulate || 0) : (dc2[lineaDc1]?.numeroQuoteCumulate || 0)
    const commissioniCumulateDc1 = (dc1[lineaDc1]?.commissioniCumulate || 0) > (dc2[lineaDc1]?.commissioniCumulate || 0) ? (dc1[lineaDc1]?.commissioniCumulate || 0) : (dc2[lineaDc1]?.commissioniCumulate || 0)
    const importoNettoCumulatoDc1 = importoCumulatoDc1 - commissioniCumulateDc1

    const importoCumulatoDc2 = (dc1[lineaDc2]?.importoCumulato || 0) > (dc2[lineaDc2]?.importoCumulato || 0) ? (dc1[lineaDc2]?.importoCumulato || 0) : (dc2[lineaDc2]?.importoCumulato || 0)
    const numeroQuoteCumulateDc2 = (dc1[lineaDc2]?.numeroQuoteCumulate || 0) > (dc2[lineaDc2]?.numeroQuoteCumulate || 0) ? (dc1[lineaDc2]?.numeroQuoteCumulate || 0) : (dc2[lineaDc2]?.numeroQuoteCumulate || 0)
    const commissioniCumulateDc2 = (dc1[lineaDc2]?.commissioniCumulate || 0) > (dc2[lineaDc2]?.commissioniCumulate || 0) ? (dc1[lineaDc2]?.commissioniCumulate || 0) : (dc2[lineaDc2]?.commissioniCumulate || 0)
    const importoNettoCumulatoDc2 = importoCumulatoDc2 - commissioniCumulateDc2
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
            importoCumulato: importoCumulatoDc1,
            importoNettoCumulato: importoNettoCumulatoDc1,
            numeroQuoteCumulate: numeroQuoteCumulateDc1,
            commissioniCumulate: commissioniCumulateDc1,
        },
        [lineaDc2]: {            
            importoCumulato: importoCumulatoDc2,
            importoNettoCumulato: importoNettoCumulatoDc2,
            numeroQuoteCumulate: numeroQuoteCumulateDc2,
            commissioniCumulate: commissioniCumulateDc2,
        }
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