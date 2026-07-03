import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { ChallengeDocument } from '../game/types'
import Card from './Card'

function HistoryPanel() {
  const [historyList, setHistoryList] = useState<ChallengeDocument[]>([])

  useEffect(() => {
    const historyQuery = query(
      collection(db, 'history'),
      orderBy('number', 'desc')
    )

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const histories = snapshot.docs.map(
        (doc) => doc.data() as ChallengeDocument
      )

      setHistoryList(histories)
    })

    return () => unsubscribe()
  }, [])

  return (
    <section className="history-panel">

      {historyList.length === 0 ? (
        <p>まだ履歴はありません。</p>
      ) : (
        <div className="history-list">
          {historyList.map((history) => (
            <Card key={history.number} className="history-card">
              <div className="history-card-header">
                <strong>Challenge #{history.number}</strong>
            
                <span className={`history-status ${history.status}`}>
                  {formatStatus(history.status)}
                </span>
              </div>
            
              <div className="history-card-footer">
                <span>👥 {history.participants.join(', ')}</span>
            
                <span className="history-time">
                  {formatFinishedAt(history.finishedAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

function formatStatus(status: ChallengeDocument['status']) {
  if (status === 'cleared') return 'CLEAR'
  if (status === 'failed') return 'FAILED'
  if (status === 'timeUp') return 'TIME UP'
  return status
}

function formatFinishedAt(finishedAt: ChallengeDocument['finishedAt']) {
  if (!finishedAt) {
    return ''
  }

  const date = new Date(finishedAt.seconds * 1000)

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default HistoryPanel