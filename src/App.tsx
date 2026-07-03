import './App.css'
import Board from './components/Board'

function App() {
  return (
    <main className="app">
      <section className="app-card">
        <header className="app-header">
          <h1>🧪 Lab Sweeper</h1>
          <p>One Lab. One Board.</p>
        </header>

        <Board />

        <nav className="footer-menu">
          <button type="button">履歴</button>
          <button type="button">ルール</button>
          <button type="button">設定</button>
        </nav>
      </section>
    </main>
  )
}

export default App