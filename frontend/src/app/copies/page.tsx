'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';
import Link from 'next/link';

const CHANNEL_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'app', label: 'アプリ通知' },
  { value: 'line', label: 'LINE広告' },
  { value: 'pop', label: '店舗POP' },
  { value: 'sns', label: 'SNS投稿' },
  { value: 'email', label: 'メールマガジン' },
];

const TONE_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'pop', label: 'ポップ' },
  { value: 'trust', label: '信頼感' },
  { value: 'value', label: 'お得感' },
  { value: 'luxury', label: '高級感' },
  { value: 'casual', label: 'カジュアル' },
];

// 仮のデータ
const MOCK_COPIES = [
  {
    id: '1',
    title: '【期間限定】新商品のご案内',
    description: '今だけの特別価格で、あなたの生活を彩る新商品をお届けします。商品の特徴を活かした、使いやすいデザインと高品質な素材で、毎日の生活をより快適に。',
    channel: 'app',
    tone: 'pop',
    likes: 12,
    createdAt: '2024-03-29',
  },
  {
    id: '2',
    title: 'プレミアムコーヒーの世界へようこそ',
    description: '厳選された豆から作られた一杯のコーヒーが、あなたの日常に特別なひとときを。',
    channel: 'line',
    tone: 'luxury',
    likes: 8,
    createdAt: '2024-03-28',
  },
  // 他のサンプルデータ...
];

export default function CopiesPage() {
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCopies = MOCK_COPIES.filter((copy) => {
    const matchesChannel = !selectedChannel || copy.channel === selectedChannel;
    const matchesTone = !selectedTone || copy.tone === selectedTone;
    const matchesSearch = !searchQuery ||
      copy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      copy.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesChannel && matchesTone && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">公開済み販促コピー</h1>
          <Button variant="primary">新規作成</Button>
        </div>

        {/* フィルターバー */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="配信チャネル"
              options={CHANNEL_OPTIONS}
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            />
            <Select
              label="トーン"
              options={TONE_OPTIONS}
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
            />
            <Input
              label="キーワード検索"
              placeholder="タイトルや本文で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* コピー一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCopies.map((copy) => (
            <Link
              key={copy.id}
              href={`/copies/${copy.id}`}
              className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow h-full flex flex-col"
            >
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2 text-primary line-clamp-2">{copy.title}</h2>
                <p className="text-secondary mb-4 line-clamp-3">{copy.description}</p>
                <div className="flex items-center justify-between text-sm text-muted mb-4">
                  <span>{CHANNEL_OPTIONS.find(opt => opt.value === copy.channel)?.label}</span>
                  <span>{TONE_OPTIONS.find(opt => opt.value === copy.tone)?.label}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <button
                    className="text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      // いいね機能の実装
                    }}
                  >
                    ♥ {copy.likes}
                  </button>
                  <button
                    className="text-muted hover:text-secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(`${copy.title}\n\n${copy.description}`);
                    }}
                  >
                    コピー
                  </button>
                </div>
                <span className="text-sm text-muted">{copy.createdAt}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 
