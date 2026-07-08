import { useState } from 'react'
import './App.css'
import Board from './components/Board'
import RankingPanel from './components/RankingPanel'
import HistoryPanel from './components/HistoryPanel'
import Modal from './components/Modal'
import RulePanel from './components/RulePanel'
import Button from './components/Button'
import SettingsPanel from './components/SettingsPanel'
import Toast from './components/Toast'

type ActivePanel = 'history' | 'rules' | 'settings' | null

function App() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [settingsVersion, setSettingsVersion] = useState(0)
  const [toastMessage, setToastMessage] = useState('')

  const closePanel = () => {
    setActivePanel(null)
  }

  const showToast = (message: string) => {
    setToastMessage(message)
  
    window.setTimeout(() => {
      setToastMessage('')
    }, 3000)
  }

  const handleChangedSettings = () => {
    setSettingsVersion((current) => current + 1)
  }

  const [currentBoardSize, setCurrentBoardSize] = useState<number | null>(null)

  return (
    <main className="app">
      <section className="app-card">
        <header className="app-header">
          <h1>🧪 Lab Sweeper</h1>
          <p>One Lab. One Board.</p>
        </header>

        <Board
          settingsVersion={settingsVersion}
          showToast={showToast}
          onBoardSizeChange={setCurrentBoardSize}
        />

        <nav className="footer-menu">
          <Button
            variant="secondary"
            onClick={() => setActivePanel('history')}
          >
            履歴
          </Button>

          <Button
            variant="secondary"
            onClick={() => setActivePanel('rules')}
          >
            ルール
          </Button>

          <Button
            variant="secondary"
            onClick={() => setActivePanel('settings')}
          >
            設定
          </Button>
        </nav>

        <RankingPanel />
        
      </section>

      {activePanel === 'history' && (
        <Modal title="履歴" onClose={closePanel}>
          <HistoryPanel />
        </Modal>
      )}

      {activePanel === 'rules' && (
        <Modal title="ルール" onClose={closePanel}>
          <RulePanel />
        </Modal>
      )}

      {activePanel === 'settings' && (
        <Modal title="設定" onClose={closePanel}>
          <SettingsPanel
            currentBoardSize={currentBoardSize}
            onDeletedHistory={closePanel}
            onChangedSettings={handleChangedSettings}
            onApplySettings={closePanel}
            showToast={showToast}
          />
        </Modal>
      )}

      {toastMessage && <Toast message={toastMessage} />}

    </main>
  )
}

export default App