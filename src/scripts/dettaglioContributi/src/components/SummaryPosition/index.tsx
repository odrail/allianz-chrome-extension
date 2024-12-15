import React, { useMemo } from "react"
import { DettaglioContributoCumulato } from "../../services/getDettaglioContributi"
import { formatCurrency, formatPercentage } from "../../utils/numberUtils"
import { InvestmentData } from "investing-com-api"
import { COLOR_AMOUNT, COLOR_CONTRIBUTION } from "../../utils/constants"
import { closestIndexTo } from "date-fns"
import Circle from "../Circle"

type SummaryProps = {
    from: Date | undefined
    dettaglioContributi: DettaglioContributoCumulato[]
    historicalData: InvestmentData[]
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
        return dettaglioContributi.length > 0
            ? dettaglioContributi[dettaglioContributi.length - 1].importoCumulato
            : 0
    }, [dettaglioContributi])

    const montante: number = useMemo(() => {
        const totQuote = dettaglioContributi.length > 0 ? dettaglioContributi[dettaglioContributi.length - 1].numeroQuoteCumulate : 0
        const quotazione = historicalData.length > 0 ? historicalData[historicalData.length - 1].price_close : 0
        return totQuote * quotazione
    }, [dettaglioContributi, historicalData])

    const timeWeightPercent: number = useMemo(() => {
        if (historicalData.length === 0 || !from) return 0
        const indexPrimaQuotazione = closestIndexTo(from, historicalData.map(h => h.date))
        const primaQuotazione = historicalData[indexPrimaQuotazione!].price_close
        const ultimaQuotazione = historicalData[historicalData.length - 1].price_close
        return ultimaQuotazione / primaQuotazione - 1
    }, [historicalData, from])    

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