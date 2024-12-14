import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const getDomNode = (): HTMLDivElement => {
    const { parentNode, nextSibling } = document.querySelector('[name=formIsDettaglioContributi] table')!
    const newNode = document.createElement('div')
    parentNode!.insertBefore(newNode, nextSibling)
    return newNode
}

createRoot(getDomNode()).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )