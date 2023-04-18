import { useState } from 'react'
import './ChartSweeper.css'

function ChartSweeper() {
  const [count, setCount] = useState(0)

  return (
    <div className="ChartSweeper">
      <h1>ChartSweeper</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/ChartSweeper.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export { ChartSweeper }
