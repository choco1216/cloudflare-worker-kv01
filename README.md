# Cloudflare Worker KVサンプル

## 概要
Cloudflare WorkersでKVストレージからクライアントごとの設定データを取得するAPIサンプルです。

## 使い方
1. このディレクトリで `wrangler deploy` を実行してデプロイ
2. デプロイ後、以下のURLで動作確認
   
   `https://<your-worker-name>.<your-account>.workers.dev/?client_id=client_test`

3. KVに登録した`client_test`などのデータがJSONで返ります。

## 設定ファイル
- `wrangler.toml` でKVバインディングを設定済み

## 注意
- KVネームスペースIDやアカウントIDはご自身の環境に合わせて変更してください。
