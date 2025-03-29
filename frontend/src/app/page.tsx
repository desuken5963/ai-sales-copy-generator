import Link from 'next/link';
import { Button } from '@/components/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6">
            AIパーソナライズ販促文最適化ツール
          </h1>
          <p className="text-xl text-secondary mb-8 max-w-3xl mx-auto">
            ターゲット層に合わせて最適化された販促文を、AIが自動生成します。
            商品の特徴を入力するだけで、効果的なコピーが作成できます。
          </p>
          <Link href="/copy/new">
            <Button variant="primary" className="text-lg px-8 py-4">
              無料で始める
            </Button>
          </Link>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">使い方</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">商品を入力</h3>
              <p className="text-secondary">
                商品名や特徴を入力します。AIが理解しやすいように、できるだけ詳しく記入してください。
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">ターゲットを設定</h3>
              <p className="text-secondary">
                ターゲット層や配信チャネル、トーンを選択します。目的に合わせて最適な設定を選びましょう。
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">販促文を生成</h3>
              <p className="text-secondary">
                AIが最適化された販促文を生成します。必要に応じて再生成や編集も可能です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary">さっそく始めてみましょう</h2>
          <p className="text-xl text-secondary mb-8">
            無料で利用できます。今すぐ販促文を生成してみましょう。
          </p>
          <Link href="/copy/new">
            <Button variant="primary" className="text-lg px-8 py-4">
              販促文を生成する
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
