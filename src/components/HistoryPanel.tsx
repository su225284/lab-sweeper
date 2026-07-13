import { useEffect, useState } from 'react'
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

function HistoryPanel() {
  const [currentChallenge, setCurrentChallenge] =
    useState<ChallengeDocument | null>(null)

  const [historyList, setHistoryList] =
    useState<ChallengeDocument[]>([])

  useEffect(() => {
    const unsubscribeCurrent = subscribeCurrentChallenge(
      (challenge) => {
        setCurrentChallenge(challenge)
      },
    )

    return unsubscribeCurrent
  }, [])

  useEffect(() => {
    const historyQuery = query(
      collection(db, 'history'),
      orderBy('number', 'desc'),
    )

    const unsubscribeHistory = onSnapshot(
      historyQuery,
      (snapshot) => {
        const histories = snapshot.docs
        .map(
          (document) =>
            document.data() as ChallengeDocument,
        )
        .filter(
          (history) => history.status === 'cleared',
        )
      
      setHistoryList(histories)
      },
    )

    return unsubscribeHistory
  }, [])

  const isCurrentChallengeActive =
    currentChallenge !== null &&
    (currentChallenge.status === 'ready' ||
      currentChallenge.status === 'playing')

  return (
    <section className="history-panel">
      {isCurrentChallengeActive && (
        <ChallengeCard
          challenge={currentChallenge}
          isCurrent
        />
      )}

      {historyList.length === 0 ? (
        !isCurrentChallengeActive && (
          <p>まだ履歴はありません。</p>
        )
      ) : (
        <div className="history-list">
          {historyList.map((history) => (
            <ChallengeCard
              key={history.number}
              challenge={history}
            />
          ))}
        </div>
      )}
    </section>
  )
}

type ChallengeCardProps = {
  challenge: ChallengeDocument
  isCurrent?: boolean
}

function ChallengeCard({
  challenge,
  isCurrent = false,
}: ChallengeCardProps) {
  const safeCellCount =
    challenge.safeCellCount ??
    challenge.cells.filter(
      (cell) => !cell.hasMine,
    ).length

  const openedSafeCount =
    challenge.openedSafeCount ??
    challenge.cells.filter(
      (cell) => !cell.hasMine && cell.opened,
    ).length

  const progressRate =
    challenge.progressRate ??
    (challenge.status === 'cleared'
      ? 100
      : safeCellCount === 0
        ? 0
        : Math.round(
            (openedSafeCount / safeCellCount) * 100,
          ))

  const participants =
    challenge.selectedPlayer &&
    !challenge.participants.includes(
      challenge.selectedPlayer,
    )
      ? [
          ...challenge.participants,
          challenge.selectedPlayer,
        ]
      : challenge.participants

  const participantCount =
    challenge.participantCount ??
    participants.length

  const explosionCount =
    challenge.explosionCount ?? 0

  return (
    <Card
      className={`history-card ${
        isCurrent ? 'current-challenge-card' : ''
      }`}
    >
      <div className="history-card-header">
        <strong>
          第{challenge.number}回チャレンジ
          {challenge.size
            ? `　${challenge.size}×${challenge.size}マス`
            : ''}
        </strong>

        <span
          className={`history-status ${
            isCurrent
              ? 'playing'
              : challenge.status
          }`}
        >
          {isCurrent
            ? '挑戦中'
            : formatStatus(challenge.status)}
        </span>
      </div>

      <div className="history-stats">
        <span>👥 {participantCount}人</span>
        <span>達成率 {progressRate}%</span>
        <span>💥 {explosionCount}回</span>
      </div>

      {participants.length > 0 && (
        <div className="history-participants">
          <strong>参加者：</strong>
          <span>{participants.join('、')}</span>
        </div>
      )}

      {!isCurrent && (
        <div className="history-card-footer">
          <span className="history-time">
            {formatFinishedAt(challenge.finishedAt)}
          </span>
        </div>
      )}
    </Card>
  )
}

function formatStatus(
  status: ChallengeDocument['status'],
) {
  if (status === 'cleared') return 'CLEAR'
  if (status === 'failed') return 'FAILED'
  if (status === 'timeUp') return 'TIME UP'
  if (status === 'playing') return '挑戦中'
  if (status === 'ready') return '挑戦中'

  return status
}

function formatFinishedAt(
  finishedAt: ChallengeDocument['finishedAt'],
) {
  if (!finishedAt) {
    return ''
  }

  const date = new Date(
    finishedAt.seconds * 1000,
  )

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default HistoryPanel