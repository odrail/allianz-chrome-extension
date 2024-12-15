const LOCALE: Intl.LocalesArgument = 'it-IT'

const CurrencyEurFormat = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR',
  })

const percentageFormat = new Intl.NumberFormat(LOCALE, 
  { 
    style: 'percent', 
    minimumFractionDigits: 2,
  })

export const getSign = (value: number) => `${value >= 0 ? '+' : ''}`
  
export const formatCurrency = (value: number, forceSign: boolean = false) => `${forceSign ? getSign(value) : ''}${CurrencyEurFormat.format(value)}`

export const formatPercentage = (value: number, forceSign: boolean = false) => `${forceSign ? getSign(value) : ''}${percentageFormat.format(value)}`