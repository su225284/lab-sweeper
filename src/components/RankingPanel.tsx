import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { ChallengeDocument } from '../game/types'
import Card from './Card'

type RankingItem = {
  name: string
  count: number
}

export default function RankingPanel() {
  const [ranking, setRanking] = useState<RankingItem[]>([])

  useEffect(() => {
    const historyQuery = query(
      collection(db, 'history'),
      orderBy('number', 'desc')
    )
  
    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const counts = new Map<string, number>()
  
      snapshot.docs.forEach((doc) => {
        const history = doc.data() as ChallengeDocument
  
        history.participants.forEach((name) => {
          counts.set(name, (counts.get(name) ?? 0) + 1)
        })
      })
  
      setRanking(
        Array.from(counts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      )
    })
  
    return () => unsubscribe()
  }, [])

  return (
    <Card className="ranking-panel">
      <h2>🏆チャレンジ参加ランキング🏆</h2>

      {ranking.length === 0 ? (
        <p>まだ履歴がありません。</p>
      ) : (
        <ol>
          {ranking.map((item) => (
            <li key={item.name}>
              {item.name}：{item.count}回
            </li>
          ))}
        </ol>
      )}

      <p className="ranking-note">
        ※ 同じチャレンジで複数回プレイした場合も、
        <br />
        参加回数は1回として集計されます。
      </p>
    </Card>
  )
}