# Lab Sweeper

研究室向けのリアルタイム共有マインスイーパーです。

## 概要

Lab Sweeper は研究室のメンバーが同じチャレンジを共有して遊ぶことを目的としたゲームです。

1つのチャレンジを複数人で共有し、プレイヤー名を選択して順番に挑戦します。

ゲームの状態は Firestore に保存され、複数端末でリアルタイム同期されます。

---

# 使用技術

- React
- TypeScript
- Vite
- Firebase Firestore

---

# 現在の機能

## ゲーム

- 5×5 マインスイーパー
- 初手安全
- 長押しで旗
- Chord（数字クリック）
- 60秒タイマー
- BOOM
- CLEAR
- TIME UP
- プレイヤー選択
- やめる

## チャレンジ

- チャレンジ番号
- 参加人数表示
- プレイ中プレイヤー表示
- プレイヤーロック

## Firestore

- 現在のチャレンジ保存
- チャレンジ履歴保存
- リアルタイム同期
- ブラウザ更新後の復元

## 履歴

history コレクションに

- cleared
- failed
- timeUp

を保存する。

## ランキング

現在は

- 参加回数ランキング

を実装済み。

---

# Firestore構成

```
currentChallenge
    current

history
    challenge-1
    challenge-2
    challenge-3
    ...
```

---

# ChallengeDocument

```ts
type ChallengeDocument = {
  number: number
  size: number
  mineCount: number

  participants: string[]

  selectedPlayer: string | null

  status:
    | 'ready'
    | 'playing'
    | 'cleared'
    | 'failed'
    | 'timeUp'

  remainingSeconds: number

  cells: Cell[]
}
```

---

# 今後の予定

優先順位

1. 履歴画面
2. 統計
3. ランキング強化
4. UI改善

---

# 開発方針

- 小さくリファクタリングしながら開発する
- Firestore のデータモデルを中心に設計する
- React の state と Firestore の型をできるだけ一致させる
- 機能追加ごとに Git コミットする

---

# 更新履歴

## 2026-07-03

- Firestore導入
- リアルタイム同期実装
- ChallengeDocumentへ統一
- 履歴保存
- ランキング実装