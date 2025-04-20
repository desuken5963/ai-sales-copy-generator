'use client';

import { Button } from '@/components/Button';
import { useState, useEffect } from 'react';
import { use } from 'react';
import { getCopy, updateLikes } from '@/lib/api/copy';
import { GetCopyResponse } from '@/lib/api/types';

export default function CopyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [copy, setCopy] = useState<GetCopyResponse | null>(null);
  const [likes, setLikes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchCopy = async () => {
      try {
        const data = await getCopy(resolvedParams.id);
        setCopy(data);
        setLikes(data.likes || 0);
      } catch (err) {
        setError('コピーの取得に失敗しました');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCopy();
  }, [resolvedParams.id]);

  const handleShare = (platform: string) => {
    if (!copy) return;

    const text = encodeURIComponent(`${copy.title}\n\n${copy.description}`);
    const url = encodeURIComponent(window.location.href);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleLike = async () => {
    if (!copy || isLiking) return;
    
    try {
      setIsLiking(true);
      const updatedCopy = await updateLikes(copy.id);
      setLikes(updatedCopy.likes);
    } catch (err) {
      console.error('いいねの更新に失敗しました:', err);
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !copy) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-red-500">{error || 'コピーが見つかりませんでした'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-primary">{copy.title}</h1>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors ${
                  isLiking ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-2xl">♥</span>
                <span className="text-lg">{likes}</span>
              </button>
            </div>
            <p className="whitespace-pre-line text-secondary">{copy.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4 text-primary">メタ情報</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-secondary">
              <div>
                <span className="font-medium">配信チャネル:</span>
                <span className="ml-2">アプリ通知</span>
              </div>
              <div>
                <span className="font-medium">トーン:</span>
                <span className="ml-2">ポップ</span>
              </div>
              <div>
                <span className="font-medium">ターゲット:</span>
                <span className="ml-2">30-40代の会社員</span>
              </div>
              <div>
                <span className="font-medium">作成日:</span>
                <span className="ml-2">{new Date(copy.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-primary">シェア</h2>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('line')}
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                LINE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
