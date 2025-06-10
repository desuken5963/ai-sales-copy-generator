# GitHub Actions ワークフロー手動実行コマンド集

## EC2 Backend Deploy

```sh
gh workflow run backend-deploy.yml --ref <ブランチ名>
```

## Backend Test

```sh
gh workflow run backend-test.yml --ref <ブランチ名>
```

## Frontend Test

```sh
gh workflow run frontend-test.yml --ref <ブランチ名>
```

---

- `<ブランチ名>` には実行したいブランチ名（例: main, terraform など）を指定してください。
- コマンド実行には [GitHub CLI (gh)](https://cli.github.com/) のインストールと認証が必要です。 