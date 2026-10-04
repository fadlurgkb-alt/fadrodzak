'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, BookOpen, PenLine, UserRound } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Beranda',
      path: '/',
      icon: House,
    },
    {
      name: 'Belajar',
      path: '/belajar',
      icon: BookOpen,
    },
    {
      name: 'Tulis',
      path: '/tulis',
      icon: PenLine,
    },
    {
      name: 'Profil',
      path: '/profil',
      icon: UserRound,
    },
  ];

  const isChatDetailPage = pathname?.startsWith('/chat/');

  return (
    <>
      {/* Spacer agar konten halaman biasa tidak tertutup di mobile (tidak diperlukan di layar chat penuh) */}
      {!isChatDetailPage && <div className="h-16 md:hidden" />}

      {/* Navigasi Bawah Khusus Mobile (Disembunyikan di Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8DED6] h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] z-40 md:hidden shadow-xs">
        <div className="max-w-md mx-auto h-16 flex justify-around items-center px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? pathname === '/'
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`group flex flex-col items-center gap-1 min-w-[56px] py-1 px-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-[#C85A32]'
                    : 'text-[#6B625D] hover:text-[#2C2A29]'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  className="transition-transform group-active:scale-95"
                />
                <span
                  className={`text-[11px] tracking-tight leading-none ${
                    isActive ? 'font-semibold text-[#C85A32]' : 'font-normal text-[#6B625D]'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
