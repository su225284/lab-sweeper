import { useEffect, useState } from 'react'
import { loadChallengeHistories } from '../services/challengeService'
import Card from './Card'

type RankingItem = {
  name: string
  count: number
}

export default function RankingPanel() {
  const [ranking, setRanking] = useState<RankingItem[]>([])

  useEffect(() => {
    const loadRanking = async () => {
      const histories = await loadChallengeHistories()
      const counts = new Map<string, number>()

      histories.forEach((history) => {
        history.participants.forEach((name) => {
          counts.set(name, (counts.get(name) ?? 0) + 1)
        })
      })

      setRanking(
        Array.from(counts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      )
    }

    loadRanking()
  }, [])

  return (
    <Card className="ranking-panel">
      <h2>参加ランキング</h2>
  
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
    </Card>
  )
}