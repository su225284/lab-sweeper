import './App.css'
import Board from './components/Board'

function App() {
  return (
    <main className="app">
      <h1>🧪 Lab Sweeper</h1>

      <h2>第1回チャレンジ</h2>

      <p>進捗：0%</p>

      <div className="board">
        <Board />
      </div>

      <button>盤面をタップして参加</button>
    </main>
  )
}

export default App