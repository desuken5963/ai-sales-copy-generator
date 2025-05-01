import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">サービス</h3>
            <ul className="mt-4 flex flex-row space-x-8">
              <li>
                <Link href="/" className="text-base text-gray-500 hover:text-gray-900">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/copy/new" className="text-base text-gray-500 hover:text-gray-900">
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
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} AI Sales Copy Generator
          </p>
        </div>
      </div>
    </footer>
  );
} 
