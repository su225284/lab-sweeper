import { useState } from 'react'
import { collection, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import {
  createInitialChallenge,
  DEFAULT_BOARD_SIZE,
  calculateMineCount,
} from '../game/challengeFactory'
import { saveCurrentChallenge } from '../services/challengeService'
import Button from './Button'
import { getMembers, saveMembers } from '../game/memberManager'
import Card from './Card'

type SettingsPanelProps = {
    onDeletedHistory?: () => void
    onChangedSettings?: () => void
    onApplySettings?: () => void
    showToast?: (message: string) => void
  }

function getSavedBoardSize() {
  const saved = localStorage.getItem('boardSize')
  return saved ? Number(saved) : DEFAULT_BOARD_SIZE
}

function SettingsPanel({
    onDeletedHistory,
    onChangedSettings,
    onApplySettings,
    showToast,
  }: SettingsPanelProps) {
  const [isDeletingHistory, setIsDeletingHistory] = useState(false)
  const [boardSize, setBoardSize] = useState(getSavedBoardSize)

  const appliedBoardSize = getSavedBoardSize()
  const hasBoardSizeChanged = boardSize !== appliedBoardSize
  const previewMineCount = calculateMineCount(boardSize)
  const [members, setMembers] = useState(getMembers)
  const [newMemberName, setNewMemberName] = useState('')

  const handleDecreaseBoardSize = () => {
    setBoardSize((current) => Math.max(5, current - 1))
  }

  const handleIncreaseBoardSize = () => {
    setBoardSize((current) => Math.min(30, current + 1))
  }

  const handleApplyBoardSize = () => {
    localStorage.setItem('boardSize', String(boardSize))
    onChangedSettings?.()
    onApplySettings?.()
  }

  const handleAddMember = () => {
    const trimmedName = newMemberName.trim()
  
    if (!trimmedName) return
    if (members.includes(trimmedName)) return
  
    const nextMembers = [...members, trimmedName]
  
    setMembers(nextMembers)
    saveMembers(nextMembers)
    setNewMemberName('')

    showToast?.(`「${trimmedName}」を追加しました。`)
  }

  const handleDeleteMember = (memberName: string) => {
    if (members.length <= 1) {
      return
    }
  
    const ok = window.confirm(
      `「${memberName}」を削除しますか？`,
    )
  
    if (!ok) return
  
    const nextMembers = members.filter(
      (member) => member !== memberName,
    )
  
    setMembers(nextMembers)
    saveMembers(nextMembers)

    showToast?.(`「${memberName}」を削除しました。`)
  }

  const handleDeleteHistory = async () => {
    const ok = window.confirm(
      '履歴をすべて削除します。\nこの操作は元に戻せません。よろしいですか？',
    )

    if (!ok) return

    setIsDeletingHistory(true)

    try {
      const snapshot = await getDocs(collection(db, 'history'))
      const batch = writeBatch(db)

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      await saveCurrentChallenge(createInitialChallenge())
      alert('履歴を全削除し、第1回チャレンジにリセットしました。')
      onDeletedHistory?.()
    } catch (error) {
      console.error(error)
      alert('履歴の削除に失敗しました。')
    } finally {
      setIsDeletingHistory(false)
    }
  }

  return (
    <section className="settings-panel">
      <h3>ゲーム設定</h3>

      <div className="settings-item settings-item-vertical">
        <div>
          <strong>盤面サイズ</strong>
          <p>適用後、{boardSize} × {boardSize} で開始します。</p>
          <p>予想爆弾数：{previewMineCount} 個</p>
          <p>プレイ中の場合は次のChallengeから反映されます。</p>
        </div>

        <div className="settings-stepper">
          <Button
            variant="secondary"
            onClick={handleDecreaseBoardSize}
            disabled={boardSize <= 5}
          >
            −
          </Button>

          <span className="settings-size-value">{boardSize}</span>

          <Button
            variant="secondary"
            onClick={handleIncreaseBoardSize}
            disabled={boardSize >= 30}
          >
            ＋
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={handleApplyBoardSize}
          fullWidth
          disabled={!hasBoardSizeChanged}
        >
          {hasBoardSizeChanged ? '適用' : '適用済み'}
        </Button>
      </div>

      <h3>メンバー管理</h3>

        <div className="settings-item settings-item-vertical">
        <div>
            <strong>登録メンバー</strong>
            <p>現在登録されているメンバーです。</p>
        </div>

        <div className="member-list">
            {members.map((member) => (
            <div key={member} className="member-card">
            <span>{member}</span>
          
            <Button
              variant="danger"
              onClick={() => handleDeleteMember(member)}
              disabled={members.length <= 1}
            >
              削除
            </Button>
          </div>
            ))}
        </div>
        <div className="member-add-row">
            <input
                value={newMemberName}
                onChange={(event) => setNewMemberName(event.target.value)}
                placeholder="名前を入力"
            />

            <Button
                variant="primary"
                onClick={handleAddMember}
                disabled={!newMemberName.trim()}
            >
                追加
            </Button>
            </div>
        </div>

      <h3>テスト用</h3>

      <div className="settings-danger-zone">
        <div>
          <strong>履歴全削除</strong>
          <p>テスト中の履歴データをまとめて削除する機能です。</p>
        </div>

        <Button
          variant="danger"
          onClick={handleDeleteHistory}
          disabled={isDeletingHistory}
        >
          {isDeletingHistory ? '削除中...' : '履歴を全削除'}
        </Button>
      </div>
    </section>
  )
}

export default SettingsPanel