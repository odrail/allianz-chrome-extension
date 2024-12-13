const ITEur = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  })
  
const formatCurrency = (value: number) => ITEur.format(value)

export default formatCurrency