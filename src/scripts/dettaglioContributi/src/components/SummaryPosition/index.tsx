import React, { useMemo } from "react"
import { DettaglioContributoCumulato, Linea } from "../../services/getDettaglioContributi"
import { formatCurrency, formatPercentage } from "../../utils/numberUtils"
import { COLOR_AMOUNT, COLOR_CONTRIBUTION } from "../../utils/constants"
import { closestIndexTo } from "date-fns"
import Circle from "../Circle"
import { HistoricalData } from "../../services/getHistoricalData"

type SummaryProps = {
    from: Date | undefined
    dettaglioContributi: DettaglioContributoCumulato[]
    historicalData: HistoricalData | undefined
}

const getGainStyle = (gain: number): React.CSSProperties => ({
    color: gain >= 0 ? COLOR_AMOUNT : 'rgb(217, 54, 87)', 
    background: gain >= 0 ? 'rgba(111, 165,21, 0.2)' : 'rgba(217, 54, 87, 0.2)',
    padding: '5px', 
    borderRadius: '5px'
})

const style: Record<string, React.CSSProperties> = {
    container: {
        display: "flex",
        justifyContent: 'space-around'
    },
    title: {
        fontWeight: 'bold',
        display: 'flex',
        gap: '5px',
    }
}

const SummaryPosition = ({ from, dettaglioContributi, historicalData }: SummaryProps): React.ReactNode => {
    const totaleContributi: number = useMemo(() => {
        if (dettaglioContributi.length === 0) return 0
        return Object
            .values(Linea)
            .reduce((acc, linea) =>  acc + (dettaglioContributi[dettaglioContributi.length - 1][linea]?.importoCumulato || 0), 0)

    }, [dettaglioContributi])

    const montante: number = useMemo(() => {
        return Object
            .values(Linea)
            .reduce<number>((acc, linea) => {
                if (dettaglioContributi.length === 0) return 0
                const totQuote = dettaglioContributi[dettaglioContributi.length - 1][linea]?.numeroQuoteCumulate || 0
                const investmentData =  historicalData && historicalData[linea]
                const quotazione = investmentData && investmentData.length > 0 ? investmentData[investmentData.length - 1].price_close : 0
                return acc + totQuote * quotazione
            }, 0)
    }, [dettaglioContributi, historicalData])

    const timeWeightPercent: number = useMemo(() => {
        const numeratore = Object
            .values(Linea)
            .reduce<number>((acc, linea) => {
                if (!historicalData || !historicalData[linea] || historicalData[linea].length === 0 || !from) return 0
                const indexPrimaQuotazione = closestIndexTo(from, historicalData![linea].map(h => h.date))
                const primaQuotazione = historicalData![linea]![indexPrimaQuotazione!].price_close
                const ultimaQuotazione = historicalData![linea]![historicalData![linea]!.length - 1].price_close
                const totQuote = dettaglioContributi[dettaglioContributi.length - 1][linea]?.numeroQuoteCumulate || 0
                return acc + (ultimaQuotazione / primaQuotazione - 1) * totQuote
            }, 0)
        const sommaPesi = Object
            .values(Linea)
            .reduce<number>((acc, linea) => {
                if (!dettaglioContributi[dettaglioContributi.length - 1]) return 0
                return acc + (dettaglioContributi[dettaglioContributi.length - 1][linea]?.numeroQuoteCumulate || 0)
            }, 0)
        return numeratore / (sommaPesi || 1)
    }, [dettaglioContributi, historicalData, from])    

    const plusvalenza = useMemo(() => {
        return montante && totaleContributi ? montante - totaleContributi : 0
    }, [montante, totaleContributi])

    return (
        <div style={style.container}>
            <div>
                <div style={style.title}>
                    <Circle color={COLOR_AMOUNT} />
                    Montante
                </div>
                <div>{formatCurrency(montante)}</div>
                <div style={getGainStyle(plusvalenza)}>
                    <span>{formatCurrency(plusvalenza, true)}</span>
                    <span style={{marginLeft: '5px'}}>({formatPercentage(timeWeightPercent, true)})</span>                    
                </div>
            </div>        
            <div>
                <div style={style.title}>
                    <Circle color={COLOR_CONTRIBUTION} />
                    Contribuiti
                </div>
                <div>{formatCurrency(totaleContributi)}</div>
            </div>
        </div>
    )
}

export default SummaryPosition