import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">サービス</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/" className="text-base text-gray-500 hover:text-gray-900">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/copies/new" className="text-base text-gray-500 hover:text-gray-900">
                  新規作成
                </Link>
              </li>
              <li>
                <Link href="/copies" className="text-base text-gray-500 hover:text-gray-900">
                  販促コピー一覧
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">サポート</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/help" className="text-base text-gray-500 hover:text-gray-900">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-gray-500 hover:text-gray-900">
                  よくある質問
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">会社情報</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
                  会社概要
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">SNS</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} AI Sales Copy Generator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
