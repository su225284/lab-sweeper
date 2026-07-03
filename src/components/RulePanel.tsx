function RulePanel() {
    return (
      <section className="rule-panel">
        <h3>🧪 Lab Sweeper</h3>
        <ul>
          <li>研究室のみんなで <strong>1つの盤面</strong> を共有して遊びます。</li>
          <li>プレイ前に自分の名前を選択します。</li>
          <li>制限時間は <strong>60秒</strong> です。</li>
          <li>爆弾を踏むか時間切れになるとチャレンジ終了です。</li>
          <li>クリアすると結果画面が表示されます。</li>
          <li><strong>Next Challenge</strong> を押すと次のチャレンジが始まります。</li>
          <li>チャレンジ履歴と参加回数ランキングが記録されます。</li>
        </ul>
  
        <h3>💣 マインスイーパー</h3>
        <ul>
          <li>マスを開いて爆弾のない場所を探します。</li>
          <li>数字は周囲8マスにある爆弾の数を表します。</li>
          <li>爆弾があると思った場所には旗を立てられます。</li>
          <li>すべての安全なマスを開くとクリアです。</li>
          <li>最初に開くマスは必ず安全です。</li>
        </ul>
  
        <h3>🖱️ 操作方法</h3>
        <div className="rule-columns">
          <div>
            <h4>PC</h4>
            <ul>
              <li>左クリック：マスを開く</li>
              <li>右クリック：旗を立てる</li>
              <li>数字クリック：周囲をまとめて開く（Chord）</li>
            </ul>
          </div>
  
          <div>
            <h4>スマホ</h4>
            <ul>
              <li>タップ：マスを開く</li>
              <li>長押し：旗を立てる</li>
              <li>数字タップ：周囲をまとめて開く（Chord）</li>
            </ul>
          </div>
        </div>
  
        <h3>💡 Chordとは？</h3>
        <p>
          数字の周囲に、<strong>数字と同じ数だけ旗が立っている状態</strong>で
          その数字をクリックすると、残りの周囲のマスを一度に開くことができます。
        </p>
      </section>
    )
  }
  
  export default RulePanel