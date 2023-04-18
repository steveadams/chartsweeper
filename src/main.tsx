import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChartSweeper } from './Chartsweeper'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChartSweeper />
  </React.StrictMode>,
)
