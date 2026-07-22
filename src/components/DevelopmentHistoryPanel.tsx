import { useState } from 'react'
import Card from './Card'

export default function DevelopmentHistoryPanel() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="development-history-card">
      <button
        type="button"
        className="development-history-toggle"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>📋 開発履歴</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="development-history-content">
          <section className="development-history-item">
            <h3>2026/07/23</h3>
            <div className="development-history-title">
              ⏱️ タイマー・同期処理を改善
            </div>
            <ul>
              <li>タイマーの同期処理を改善</li>
              <li>盤面の保存・復元をスムーズに改善</li>
            </ul>
          </section>
          <section className="development-history-item">
            <h3>2026/07/18</h3>
            <div className="development-history-title">
                ⏰ タイムアップ時の挙動を修正
                </div>

                <ul>
                <li>
                    TIME UPポップアップが消えない問題を修正
                </li>
                </ul>
            </section>

          <section className="development-history-item">
            <h3>2026/07/11</h3>
            <div className="development-history-title">
            🤝 協力プレイ向けにルールをリニューアル
            </div>
            <ul>
              <li>チャレンジ履歴をリセット</li>
              <li>爆発してもチャレンジは終了しないルールに変更</li>
              <li>爆発したプレイヤーのターンだけ巻き戻る仕様に変更</li>
              <li>爆発回数を記録するように変更</li>
              <li>チャレンジ履歴に参加人数・進行率を表示</li>
            </ul>
          </section>

          <section className="development-history-item">
            <h3>2026/07/08</h3>
            <div className="development-history-title">
            🚀 Lab Sweeper 公開
            </div>
            <ul>
              <li>研究室向け協力型マインスイーパーとして運用開始</li>
            </ul>
          </section>
        </div>
      )}
    </Card>
  )
}