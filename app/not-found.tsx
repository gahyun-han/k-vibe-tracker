import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html>
      <body className="bg-[#0D0D1A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-bold">페이지를 찾을 수 없어요</h2>
          <Link href="/ko" className="text-[#FF3A5C] underline text-sm">홈으로</Link>
        </div>
      </body>
    </html>
  );
}
