import React, { useMemo } from "react"
import { DettaglioContributoCumulato } from "../../services/getDettaglioContributi"
import formatCurrency from "../../utils/formatCurrency"
import { InvestmentData } from "investing-com-api"
import { COLOR_AMOUNT, COLOR_CONTRIBUTION } from "../../utils/constants"

type SummaryProps = {
    dettaglioContributi: DettaglioContributoCumulato[]
    historicalData: InvestmentData[]
}

const formatPlusvalenza = (plusvalenza: number): string => `${plusvalenza >= 0 ? '+' : ''} ${formatCurrency(plusvalenza)}`

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

const Circle = ({color}: {color: string}): React.ReactNode => {
    const style: React.CSSProperties = {
        width: '10px',
        height: '10px',
        backgroundColor: color,
        borderRadius: '50%',
    }
    return <span style={style}></span>
}

const Summary = ({ dettaglioContributi, historicalData }: SummaryProps): React.ReactNode => {
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

    const plusvalenza = useMemo(() => montante - totaleContributi, [montante, totaleContributi])

    return (
        <div style={style.container}>
            <div>
                <div style={style.title}>
                    <Circle color={COLOR_AMOUNT} />
                    Montante
                </div>
                <div>{formatCurrency(montante)}</div>
                <div style={getGainStyle(plusvalenza)}>
                    {formatPlusvalenza(plusvalenza)}
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

export default Summary