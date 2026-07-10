import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FF3A5C]/10 flex items-center justify-center mx-auto">
          <MapPin size={32} className="text-[#FF3A5C]" />
        </div>
        <h2 className="text-lg font-bold text-white">페이지를 찾을 수 없어요</h2>
        <p className="text-sm text-white/40">요청하신 페이지가 존재하지 않아요</p>
        <Link
          href="/ko"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF3A5C] text-white text-sm font-semibold hover:bg-[#e02e4e] transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
