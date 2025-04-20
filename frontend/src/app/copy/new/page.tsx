'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { Toggle } from '@/components/Toggle';
import { Toast } from '@/components/Toast';
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      setToast({ message: 'コピーが正常に作成されました', type: 'success' });
      setTimeout(() => {
        router.push(`/copies/${response.id}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to create copy:', error);
      setToast({
        message: 'コピーの作成に失敗しました。もう一度お試しください。',
        type: 'error',
      });
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
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 
