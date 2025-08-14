# copilot-instructions.md

このリポジトリは「ニワン語」(Niwango) のパーサ・実行エンジンを TypeScript で実装したライブラリです。@xpadev-net/niwango-core として UMD モジュール形式で配布されます。

## 開発ガイドライン

### パッケージマネージャー
- 本プロジェクトは `pnpm` を使用します。
- 初回セットアップは以下のコマンドを実行してください。
	```sh
	npm -g install pnpm
	pnpm install
	```

### ビルド
- `npm run build` : 全体ビルド (dist/削除, TS/DTS生成)
- `npm run build:ts` : TypeScript の Rollup ビルド
- `npm run build:dts` : 型定義とパスエイリアス解決
- `npm run watch` : ファイル監視付き開発ビルド

### コード品質
- `npm run lint` : ESLint + TypeScript 型チェック
- `npm run lint:fix` : フォーマット・ESLint修正・型チェック
- `npm run check-types` : 型チェックのみ
- `npm run eslint` : ESLintのみ
- `npm run eslint:fix` : ESLint自動修正
- `npm run format` : Prettierによるフォーマット

### テスト
- `npm test` : Jestによるテスト (jsdom環境)

### パーサ生成
- `npm run pegjs` : Peggyでniwango.pegjsからparser.js生成

### ドキュメント
- `npm run typedoc` : TypeDocでドキュメント生成

## アーキテクチャ概要

- **パーサ層**: `src/parser/`, `src/grammar/` (PEG.js文法, パーサ生成)
- **実行エンジン**: `src/executor.ts`, `src/context.ts` (ASTベースのインタプリタ, スコープ管理, 再帰制限)
- **ASTプロセッサ**: `src/processors/` (各ASTノード型ごとの処理関数)
- **型・プロトタイプシステム**: `src/prototype/` (Array, Bool, Number, Object, String, Value型のメソッド群)
- **組み込み関数**: `src/functions/` (if, while_kari, dump, timethis等)
- **エラーシステム**: `src/errors/` (InvalidTypeError, NotImplementedError, TooMuchRecursionError)

## 主要パターン

- パスエイリアス: `@/*` → `src/*` (tsconfig, Jestで設定)
- 型定義: `src/@types/` にTypeScript型を集約
- プロセッサパターン: ASTノードごとに専用処理関数
- プロトタイプシステム: JSのプロトタイプに近いメソッド分派
- フックシステム: 結果フック・関数登録による拡張性

## テスト戦略

- `src/__tests__/` に言語機能テスト
- `testUtils.ts` の `run()` でニワン語コード実行
- 元Wiki仕様サンプルの検証

## ビルドシステム

- RollupによるUMDバンドル
- TypeScriptコンパイル・型定義生成
- パスエイリアス解決ユーティリティ
- BabelによるJS変換
- Peggyによるパーサ生成

---

### GitHub Copilot向け指示
- 上記の設計・コマンド・パターンに従い、型安全・拡張性・テスト容易性を重視してください。
- 新機能追加時はASTプロセッサ・型・プロトタイプ・組み込み関数のいずれかに適切に実装してください。
- テストは必ず `src/__tests__/` に追加し、既存テストも通ることを確認してください。
- パスエイリアス・型定義・ビルド/テストコマンドの一貫性を保ってください。

#### タスク完了時の運用
- タスクが完了した際は終了する前にレビューが来ていないかを必ず確認してください。
- コメントがあれば終了せず、内容に対応してから完了してください。
