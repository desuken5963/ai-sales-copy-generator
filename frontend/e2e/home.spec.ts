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
  // APIリクエストとレスポンスをインターセプト
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (url.includes('localhost:8080')) {
      const newUrl = url.replace('localhost:8080', 'api-test:8080');
      route.continue({ url: newUrl });
    } else {
      route.continue();
    }
  });

  page.on('request', request => {
    if (request.url().includes('/copies')) {
      console.log('API Request:', {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        data: request.postData()
      });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/copies')) {
      console.log('API Response:', {
        url: response.url(),
        status: response.status(),
        data: await response.json().catch(() => 'Failed to parse JSON')
      });
    }
  });

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

  // レスポンスを待機
  const response = await page.waitForResponse(response => 
    response.url().includes('/copies') && 
    response.request().method() === 'POST'
  );
  console.log('Response received:', {
    status: response.status(),
    data: await response.json().catch(() => 'Failed to parse JSON')
  });
  
  // アラートの表示を待機
  await page.waitForSelector('[role="alert"]', { timeout: 30000 });
  
  // 成功メッセージが表示されることを確認
  await expect(page.getByText('コピーが正常に作成されました')).toBeVisible({ timeout: 30000 });
  
  // ページ遷移を明示的に待機
  await page.waitForURL('**/copies/**', { timeout: 30000 });
  
  // URLが/copies/で始まることを確認
  await expect(page.url()).toContain('/copies/');
}); 