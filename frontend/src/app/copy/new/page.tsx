'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { Toggle } from '@/components/Toggle';
import { createCopy } from '@/lib/api/copy';
import { CreateCopyRequest } from '@/lib/api/types';

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
  const [isPublished, setIsPublished] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const requestData: CreateCopyRequest = {
      productName: formData.get('productName') as string,
      productFeatures: formData.get('productFeatures') as string,
      target: formData.get('targetAudience') as string,
      channel: formData.get('channel') as CreateCopyRequest['channel'],
      tone: formData.get('tone') as CreateCopyRequest['tone'],
      isPublished,
    };

    try {
      const response = await createCopy(requestData);
      setGeneratedCopy({
        title: response.title,
        description: response.description,
      });
    } catch (error) {
      console.error('Failed to create copy:', error);
      // TODO: エラーハンドリングの実装
    } finally {
      setIsLoading(false);
    }
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
            name="productName"
          />

          <Textarea
            label="商品の特徴"
            placeholder="商品の主な特徴やメリットを入力してください"
            rows={4}
            required
            name="productFeatures"
          />

          <Input
            label="ターゲット層"
            placeholder="例：30-40代の会社員"
            required
            name="targetAudience"
          />

          <Select
            label="配信チャネル"
            options={CHANNEL_OPTIONS}
            required
            name="channel"
          />

          <Select
            label="トーン"
            options={TONE_OPTIONS}
            required
            name="tone"
          />

          <Toggle
            label="公開設定"
            checked={isPublished}
            onChange={(checked) => setIsPublished(checked)}
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
