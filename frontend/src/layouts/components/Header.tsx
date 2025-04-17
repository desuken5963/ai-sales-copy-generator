import Link from 'next/link';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">AI Copy Generator</span>
          </Link>

          {/* ナビゲーション */}
          <nav className="flex items-center space-x-4">
            <Link
              href="/copy/new"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              新規作成
            </Link>
            <Link
              href="/copies"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              販促コピー一覧
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}; 
