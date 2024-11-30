import { useState } from "react"

const useCookie = () => {
  const [cookie, setCookie] = useState<string>('')
  chrome.runtime.onMessage.addListener(
    async function(request: Record<string, string>) {
      const cookieStr: string = Object.entries(request)
        .reduce<string>((acc, [key, value])=> `${acc}; ${key}=${value}`, '')
      setCookie(cookieStr)
    }
  )

  return cookie
}

export default useCookie