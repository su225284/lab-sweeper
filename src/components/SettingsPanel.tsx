import { useState } from 'react'
import { collection, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import Button from './Button'

function SettingsPanel() {
  const [isDeletingHistory, setIsDeletingHistory] = useState(false)

  const handleDeleteHistory = async () => {
    const ok = window.confirm(
      '履歴をすべて削除します。\nこの操作は元に戻せません。よろしいですか？'
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

      alert('履歴を全削除しました。')
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

      <div className="settings-item">
        <div>
          <strong>マスの大きさ</strong>
          <p>今後ここで盤面サイズを変更できるようにします。</p>
        </div>
        <span className="settings-badge">準備中</span>
      </div>

      <h3>メンバー管理</h3>

      <div className="settings-item">
        <div>
          <strong>メンバー登録</strong>
          <p>今後ここで参加メンバーを編集できるようにします。</p>
        </div>
        <span className="settings-badge">準備中</span>
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