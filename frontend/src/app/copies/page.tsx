'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';
import Link from 'next/link';
import { getCopies, updateLikes } from '@/lib/api/copy';
import { GetCopyResponse } from '@/lib/api/types';

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

export default function CopiesPage() {
  const [copies, setCopies] = useState<GetCopyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [likingCopies, setLikingCopies] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCopies = async () => {
      try {
        const response = await getCopies();
        setCopies(response || []);
      } catch (err) {
        setError('コピーの取得に失敗しました');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCopies();
  }, []);

  const handleLike = async (copyId: string) => {
    if (likingCopies.has(copyId)) return;

    try {
      setLikingCopies(prev => new Set(prev).add(copyId));
      const updatedCopy = await updateLikes(copyId);
      setCopies(prev => prev.map(copy => 
        copy.id === copyId ? updatedCopy : copy
      ));
    } catch (err) {
      console.error('いいねの更新に失敗しました:', err);
    } finally {
      setLikingCopies(prev => {
        const newSet = new Set(prev);
        newSet.delete(copyId);
        return newSet;
      });
    }
  };

  const filteredCopies = copies.filter((copy) => {
    const matchesChannel = !selectedChannel || copy.channel === selectedChannel;
    const matchesTone = !selectedTone || copy.tone === selectedTone;
    const matchesSearch = !searchQuery ||
      copy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      copy.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesChannel && matchesTone && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4 md:mb-0">公開済み販促コピー</h1>
          <Link href="/copy/new">
            <Button variant="primary" className="w-full md:w-auto">新規作成</Button>
          </Link>
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
                <button
                  className={`text-red-500 hover:text-red-600 ${
                    likingCopies.has(copy.id) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike(copy.id);
                  }}
                  disabled={likingCopies.has(copy.id)}
                >
                  ♥ {copy.likes}
                </button>
                <span className="text-sm text-muted">作成日: {new Date(copy.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 
