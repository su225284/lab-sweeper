import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { ChallengeDocument } from '../game/types'
import { subscribeCurrentChallenge } from '../services/challengeService'
import Card from './Card'

type RankingItem = {
  name: string
  count: number
}

export default function RankingPanel() {
  const [historyList, setHistoryList] =
    useState<ChallengeDocument[]>([])

  const [currentChallenge, setCurrentChallenge] =
    useState<ChallengeDocument | null>(null)

  useEffect(() => {
    const historyQuery = query(
      collection(db, 'history'),
      orderBy('number', 'desc'),
    )

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const histories = snapshot.docs.map(
          (document) =>
            document.data() as ChallengeDocument,
        )

        setHistoryList(histories)
      },
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeCurrentChallenge(
      (challenge) => {
        setCurrentChallenge(challenge)
      },
    )

    return unsubscribe
  }, [])

  const ranking = useMemo(() => {
    const counts = new Map<string, number>()

    historyList.forEach((history) => {
      // 現在挑戦中のチャレンジと同じ番号の履歴は二重計上しない
      if (
        currentChallenge &&
        history.number === currentChallenge.number
      ) {
        return
      }
    
      const uniqueParticipants = new Set(
        history.participants,
      )
    
      uniqueParticipants.forEach((name) => {
        counts.set(name, (counts.get(name) ?? 0) + 1)
      })
    })

    if (
      currentChallenge &&
      (currentChallenge.status === 'ready' ||
        currentChallenge.status === 'playing')
    ) {
      const currentParticipants = new Set(
        currentChallenge.participants,
      )

      if (currentChallenge.selectedPlayer) {
        currentParticipants.add(
          currentChallenge.selectedPlayer,
        )
      }

      currentParticipants.forEach((name) => {
        counts.set(name, (counts.get(name) ?? 0) + 1)
      })
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count
        }

        return a.name.localeCompare(b.name, 'ja')
      })
  }, [historyList, currentChallenge])

  return (
    <Card className="ranking-panel">
      <h2>🏆チャレンジ参加ランキング🏆</h2>

      {ranking.length === 0 ? (
        <p>まだ参加記録がありません。</p>
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