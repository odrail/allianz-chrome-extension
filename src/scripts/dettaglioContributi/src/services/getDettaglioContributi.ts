import { formatDate, parseDate } from "../utils/dateUtils";

export enum Linea {
  LINEA_FLESSIBILE_CON_GARANZIA_RESTITUZIONE_CAPITALE = "LINEA FLESSIBILE CON GARANZIA RESTITUZIONE CAPITALE",
  LINEA_OBBLIGAZIONARIA = "LINEA OBBLIGAZIONARIA",
  LINEA_BILANCIATA = "LINEA BILANCIATA",
  LINEA_OBBLIGAZIONARIA_BREVE_TERMINE = "LINEA OBBLIGAZIONARIA BREVE TERMINE",
  LINEA_OBBLIGAZIONARIA_LUNGO_TERMINE = "LINEA OBBLIGAZIONARIA LUNGO TERMINE",
  LINEA_MULTIASSET = "LINEA MULTIASSET",
  LINEA_AZIONARIA = "LINEA AZIONARIA",
}

export enum Tipologia {
  VOLONTARIO = "Volontario",
  AZIENDALE = "Aziendale",
  INDIVIDUALE = "Individuale",
  TFR = "Tfr",
  TRASFERIMENTO_AZIENDALE = "Trasf. Aziend.",
  TRASFERIMENTO_INDIVIDUALE = "Trasf. Ind.",
  TRASFERIMENTO_RENDIMENTO = "Trasf. Rend.",
  TRASFERIMENTO_TFR_PREGRESSO = "Trasf. Tfr P.",
}

export type DettaglioContributo = {
  dataCompetenza: Date;
  dataValuta: Date;
  tipologia: Tipologia;
  codiceAzienda: string;
  ragioneSociale: string;
  importo: number | null;
  linea: Linea;
  numeroQuote: number | null;
  valoreQuota: number | null;
  commissioni: number | null;
}

export type DettaglioContributoCumulato = DettaglioContributo & {
  [key in Linea]?: {
    importoCumulato: number;
    numeroQuoteCumulate: number;
    commissioniCumulate: number;
  };
};

const parseString = <T = string>(textContent: string): T =>
  textContent.trim() as T

const parseNumber = (textContent: string): number | null => 
  parseFloat(textContent.trim().replace('.', '').replace(',', '.')) || null

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
  const linea = dettaglioContributo.linea
  acc.push({
    ...dettaglioContributo,
    [linea]: {
      importoCumulato: index === 0 ? dettaglioContributo.importo : ((dettaglioContributo.importo || 0) + (acc[index - 1][linea]?.importoCumulato || 0)),
      numeroQuoteCumulate: index === 0 ? dettaglioContributo.numeroQuote : ((dettaglioContributo.numeroQuote || 0) + (acc[index - 1][linea]?.numeroQuoteCumulate || 0)),
      commissioniCumulate: index === 0 ? dettaglioContributo.commissioni : ((dettaglioContributo.commissioni || 0) + (acc[index - 1][linea]?.commissioniCumulate || 0)),
    }
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