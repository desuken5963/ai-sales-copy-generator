'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { Toggle } from '@/components/Toggle';

const CHANNEL_OPTIONS = [
  { value: 'app', label: 'アプリ通知' },
  { value: 'line', label: 'LINE広告' },
  { value: 'pop', label: '店舗POP' },
  { value: 'sns', label: 'SNS投稿' },
  { value: 'email', label: 'メールマガジン' },
];

const TONE_OPTIONS = [
  { value: 'pop', label: 'ポップ' },
  { value: 'trust', label: '信頼感' },
  { value: 'value', label: 'お得感' },
  { value: 'luxury', label: '高級感' },
  { value: 'casual', label: 'カジュアル' },
];

export default function NewCopyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // 仮のAPI呼び出し
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 仮のレスポンス
    setGeneratedCopy({
      title: '【期間限定】新商品のご案内',
      description: '今だけの特別価格で、あなたの生活を彩る新商品をお届けします。\n\n商品の特徴を活かした、使いやすいデザインと高品質な素材で、毎日の生活をより快適に。\n\nこの機会にぜひお試しください。',
    });

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">販促コピーを作成</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <Input
            label="商品名"
            placeholder="例：プレミアムコーヒーメーカー"
            required
          />

          <Textarea
            label="商品の特徴"
            placeholder="商品の主な特徴やメリットを入力してください"
            rows={4}
            required
          />

          <Input
            label="ターゲット層"
            placeholder="例：30-40代の会社員"
            required
          />

          <Select
            label="配信チャネル"
            options={CHANNEL_OPTIONS}
            required
          />

          <Select
            label="トーン"
            options={TONE_OPTIONS}
            required
          />

          <Toggle
            label="公開設定"
            checked={false}
            onChange={() => { }}
          />

          <div className="flex justify-center">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              生成する
            </Button>
          </div>
        </form>

        {generatedCopy && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-primary">生成された販促文</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-secondary mb-2">タイトル</h3>
                <p className="text-lg font-bold text-blue-600">{generatedCopy.title}</p>
              </div>
              <div>
                <h3 className="font-medium text-secondary mb-2">本文</h3>
                <p className="whitespace-pre-line text-primary">{generatedCopy.description}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${generatedCopy.title}\n\n${generatedCopy.description}`
                  );
                }}
              >
                コピー
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setGeneratedCopy(null);
                  setIsLoading(false);
                }}
              >
                再生成
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
