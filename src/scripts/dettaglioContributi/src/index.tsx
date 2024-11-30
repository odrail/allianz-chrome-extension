import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const getDomNode = (): HTMLDivElement => {
    const element = document.querySelector('[name=formIsDettaglioContributi]')!.closest('div')!
    return element.appendChild(document.createElement('div'))  
}

chrome.runtime.sendMessage('SUBSCRIBE')

createRoot(getDomNode()).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )