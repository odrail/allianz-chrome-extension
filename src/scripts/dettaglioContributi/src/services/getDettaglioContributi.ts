import { formatDate, parseDate } from "../utils/dateUtils";

type Linea = "LINEA AZIONARIA"
type Tipologia = "Volontario" | "Aziendale" | "Individuale" | "Tfr" | "Trasf. Aziend." | "Trasf. Ind." | "Trasf. Rend." | "Trasf. Tfr P."

export type DettaglioContributo = {
  dataCompetenza: Date;
  dataValuta: Date;
  tipologia: Tipologia;
  codiceAzienda: string;
  ragioneSociale: string;
  importo: number;
  linea: Linea;
  numeroQuote: number;
  valoreQuota: number;
  commissioni: number;
}

export interface DettaglioContributoCumulato extends DettaglioContributo {
  importoCumulato: number,
  numeroQuoteCumulate: number,
  commissioniCumulate: number
}

const parseString = <T = string>(textContent: string): T => {
  return textContent.trim() as T
}

const parseNumber = (textContent: string): number => {
  return parseFloat(textContent.trim().replace('.', '').replace(',', '.'))
}

const parseTable = (document: Document): DettaglioContributo[] => {
  const dettaglioContributi: DettaglioContributo[] = []
  const rows = document.querySelector('.tabBody tbody')!.children
  for (let index = 2; index < rows.length; index++) {
    const columns = rows.item(index)!.children
    dettaglioContributi.push({
      dataCompetenza: parseDate(columns.item(0)!.textContent!),
      dataValuta: parseDate(columns.item(1)!.textContent!),
      tipologia: parseString<Tipologia>(columns.item(2)!.textContent!),
      codiceAzienda: parseString(columns.item(3)!.textContent!),
      ragioneSociale: parseString(columns.item(4)!.textContent!),
      importo: parseNumber(columns.item(5)!.textContent!),
      linea: parseString<Linea>(columns.item(6)!.textContent!),
      numeroQuote: parseNumber(columns.item(7)!.textContent!),
      valoreQuota: parseNumber(columns.item(8)!.textContent!),
      commissioni: parseNumber(columns.item(9)!.textContent!),
    })    
  }
  return dettaglioContributi
}

const isLastPage = (document: Document): boolean => 
  document.querySelector('table[width="40%"] td:last-child')!.children.length === 0

const toDettaglioContributiCumulati = (acc: DettaglioContributoCumulato[], dettaglioContributo: DettaglioContributo, index: number): DettaglioContributoCumulato[] => {
  acc.push({
    ...dettaglioContributo,
    importoCumulato: index === 0 ? dettaglioContributo.importo : (dettaglioContributo.importo + acc[index - 1].importoCumulato),
    numeroQuoteCumulate: index === 0 ? dettaglioContributo.numeroQuote : (dettaglioContributo.numeroQuote + acc[index - 1].numeroQuoteCumulate),
    commissioniCumulate: index === 0 ? dettaglioContributo.commissioni : (dettaglioContributo.commissioni + acc[index - 1].commissioniCumulate),
  })
  return acc
}

const getDettaglioContributi = async (): Promise<DettaglioContributoCumulato[]> => {
  const dettaglioContributi: DettaglioContributo[] = []
  let pageNumber = 0
  let lastPage = false
  do {
    pageNumber++
    const document = await callActionIsDettaglioContributiInit(pageNumber)
    dettaglioContributi.push(...parseTable(document))
    lastPage = isLastPage(document)
  } while (!lastPage);
  return dettaglioContributi
    .reverse()
    .reduce(toDettaglioContributiCumulati, [])
}

const callActionIsDettaglioContributiInit = async (pageNumber: number = 1): Promise<Document> => {
  const parser = new DOMParser();
  const bodyRequest = new URLSearchParams({
    method: 'findPage',
    np: pageNumber.toString(),
    paramName: 'item',
    methodParams: '',
    exportType: 'xls',
    tipoContributo: 'TUTTI',
    dataIni: '01/01/1900',
    dataFin: formatDate(new Date()),
    raggruppamentoData: 'NESSUNO',
    raggruppamento: 'NESSUNO'
  })
  const resp = await fetch("https://previdenzacomplementare.allianz.it/UnifondiRASNP/is/actionIsDettaglioContributiInit.do", {
    "headers": {
      "content-type": "application/x-www-form-urlencoded",
    },
    "body": bodyRequest,
    "method": "POST",
  })
  
  const bodyResponse = await resp.text()
  return parser.parseFromString(bodyResponse, "text/html")  
}

export default getDettaglioContributi