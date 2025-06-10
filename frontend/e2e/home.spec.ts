import { test, expect } from '@playwright/test';

test('ホームページが正しく表示される', async ({ page }) => {
  await page.goto('/');
  
  // タイトルが正しく表示されているか確認
  await expect(page.getByRole('heading', { name: 'AIパーソナライズ販促コピー最適化ツール' })).toBeVisible();
  
  // 説明文が表示されているか確認
  await expect(page.getByText('ターゲット層に合わせて最適化された販促コピーを、AIが自動生成します。')).toBeVisible();
  
  // ボタンが存在するか確認
  await expect(page.getByRole('button', { name: '無料で始める' })).toBeVisible();
});

test('新規作成ページが正しく表示される', async ({ page }) => {
  await page.goto('/copy/new');
  
  // タイトルが正しく表示されているか確認
  await expect(page.getByRole('heading', { name: '販促コピーを作成' })).toBeVisible();
  
  // 入力フォームが存在するか確認
  await expect(page.getByText('商品名')).toBeVisible();
  await expect(page.getByText('商品の特徴')).toBeVisible();
  await expect(page.getByText('ターゲット層')).toBeVisible();
  await expect(page.getByText('配信チャネル')).toBeVisible();
  await expect(page.getByText('トーン')).toBeVisible();
  
  // プレースホルダーが正しく表示されているか確認
  await expect(page.getByPlaceholder('例：プレミアムコーヒーメーカー')).toBeVisible();
  await expect(page.getByPlaceholder('商品の主な特徴やメリットを入力してください')).toBeVisible();
  await expect(page.getByPlaceholder('例：30-40代の会社員')).toBeVisible();
  
  // 生成ボタンが存在するか確認
  await expect(page.getByRole('button', { name: '生成する' })).toBeVisible();
});

test('セールスコピーの生成が正常に動作する', async ({ page }) => {
  await page.goto('/copy/new');
  
  // フォームが表示されるまで待機
  await page.waitForSelector('form');
  
  // 入力フォームにテキストを入力
  await page.getByPlaceholder('例：プレミアムコーヒーメーカー').fill('高性能なノートパソコン');
  await page.getByPlaceholder('商品の主な特徴やメリットを入力してください').fill('軽量で持ち運びしやすい、バッテリー持ちが良い');
  await page.getByPlaceholder('例：30-40代の会社員').fill('ビジネスパーソン');
  
  // 配信チャネルとトーンを選択
  await page.selectOption('select[name="channel"]', 'app');
  await page.selectOption('select[name="tone"]', 'trust');
  
  // フォームを送信
  await page.getByRole('button', { name: '生成する' }).click();
  
  // アラートの表示を待機
  await page.waitForSelector('[role="alert"]');
  
  // 成功メッセージが表示されることを確認
  await expect(page.getByText('コピーが正常に作成されました')).toBeVisible();
  
  // ページ遷移を明示的に待機
  await page.waitForURL('**/copies/**', { timeout: 10000 });
  
  // URLが/copies/で始まることを確認
  await expect(page.url()).toContain('/copies/');
}); 