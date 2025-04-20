"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16">
          <div className="flex justify-between items-center w-full md:w-auto h-16">
            {/* ロゴ */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">AI Copy Generator</span>
            </Link>

            {/* ハンバーガーメニューボタン（モバイル用） */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* ナビゲーション */}
          <nav
            className={`
              ${isMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'} 
              md:max-h-full md:opacity-100
              overflow-hidden
              transition-all duration-300 ease-in-out
              md:flex md:items-center w-full md:w-auto pb-4 md:pb-0
            `}
          >
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <Link
                href="/copy/new"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                新規作成
              </Link>
              <Link
                href="/copies"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                販促コピー一覧
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}; 
