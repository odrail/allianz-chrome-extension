type CookieStore = Record<string, string>
let cookiesStore: CookieStore = {};
const subscribedTabIds = new Set<number>()

const sendCookiesToSubscribed = async (subscribedTabIds: Set<number>, cookies: CookieStore) => {
  for (const tabId of subscribedTabIds) {
    await sendMessage(tabId, cookies)
  }
}
const sendMessage = async(tabId: number, message: Record<string, string>) => {
  try {
    const response = await chrome.tabs.sendMessage(tabId, message)
    console.info("Popup received response from tab with title '%s' and url %s", response.title, response.url)
  } catch (error) {
    console.warn("Popup could not send message to tab %d", tabId, error)
  }
}

const reduceCookies = (cookies: chrome.cookies.Cookie[]): Record<string, string> => {
  return cookies.reduce<CookieStore>((acc, cookie) => {
    acc[cookie.name] = cookie.value
    return acc
  }, {})
}

const areCookiesUpdated = (oldCookieStore: CookieStore, newCookieStore: CookieStore): boolean => {
  for (const [key] of Object.entries(newCookieStore)) {
    if (newCookieStore[key] !== oldCookieStore[key]) return true
  }
return false;
}

chrome.cookies.onChanged.addListener(
  async () => {
    const cookies = await chrome.cookies.getAll({domain: 'previdenzacomplementare.allianz.it'})
    const newCookies = reduceCookies(cookies)
    if (!areCookiesUpdated(cookiesStore, newCookies)) return
    cookiesStore = newCookies
    await sendCookiesToSubscribed(subscribedTabIds, cookiesStore)
  }
)

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message) {
    case 'SUBSCRIBE': {
      const tabId = sender.tab!.id!
      subscribedTabIds.add(tabId)
      await sendMessage(tabId, cookiesStore)
      sendResponse('OK')
      break;
    }  
    default:
      break;
  }
})