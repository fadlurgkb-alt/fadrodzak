'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Sparkles, Heart, BookOpen, Flame, Check, CheckCircle2, Send } from 'lucide-react';

interface NotifItem {
  id: number;
  kategori: 'apresiasi' | 'streak' | 'tantangan' | 'redaksi';
  judul: string;
  pesan: string;
  waktu: string;
  iconType: 'heart' | 'flame' | 'book' | 'sparkles';
  link: string;
  isRead?: boolean;
}

const INITIAL_NOTIF_DATA: NotifItem[] = [
  {
    id: 1,
    kategori: 'apresiasi',
    judul: 'Apresiasi Rasa Sastra',
    pesan: 'Seseorang menitipkan apresiasi pada bait sajakmu.',
    waktu: '15 menit lalu',
    iconType: 'heart',
    link: '/karya/1',
    isRead: false,
  },
  {
    id: 2,
    kategori: 'streak',
    judul: 'Pena Tak Padam',
    pesan: 'Streak membacamu telah mencapai 3 hari! Teruskan membaca bait hari ini.',
    waktu: '3 jam lalu',
    iconType: 'flame',
    link: '/',
    isRead: false,
  },
  {
    id: 3,
    kategori: 'redaksi',
    judul: 'Secangkir Aksara',
    pesan: 'Ada karya kurasi baru menunggumu dari komunitas Fadrodzak.',
    waktu: 'Kemarin',
    iconType: 'book',
    link: '/karya/2',
    isRead: false,
  },
  {
    id: 4,
    kategori: 'tantangan',
    judul: 'Tantangan Harian Baru',
    pesan: 'Tema hari ini: "Surat Tak Pernah Terkirim" menanti sentuhan penamu.',
    waktu: '2 hari lalu',
    iconType: 'sparkles',
    link: '/tulis?tema=Surat%20Tak%20Pernah%20Terkirim&kategori=Puisi',
    isRead: true,
  },
];

export default function NotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'semua' | 'apresiasi' | 'tantangan'>('semua');
  const [permissionState, setPermissionState] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [notifList, setNotifList] = useState<NotifItem[]>(INITIAL_NOTIF_DATA);

  const unreadCount = notifList.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleRequestPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
        if (perm === 'granted') {
          sendTestNotification();
        }
      } catch {}
    }
  };

  const sendTestNotification = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          reg.showNotification('Fadrodzak — Ruang Sastra', {
            body: 'Pengingat sastra aktif. Secangkir aksara akan menyapamu setiap fajar dan senja.',
            icon: '/pwa-192x192.png',
            badge: '/fadrodzak-logo.svg',
          });
          return;
        }
      }
      new Notification('Fadrodzak — Ruang Sastra', {
        body: 'Pengingat sastra aktif. Secangkir aksara akan menyapamu setiap fajar dan senja.',
        icon: '/pwa-192x192.png',
      });
    } catch {}
  };

  const filteredNotifs = notifList.filter((n) => {
    if (filter === 'semua') return true;
    return n.kategori === filter;
  });

  const renderIcon = (type: NotifItem['iconType']) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-4 h-4 text-[#C85A32]" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-[#C85A32]" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-[#7A8B68]" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-[#C85A32]" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 text-[#2C2A29] hover:bg-[#FAF8F5] rounded-xl transition bg-[#FFFDF9] border border-[#E8DED6] shadow-2xs cursor-pointer"
        aria-label="Lihat Notifikasi"
      >
        <Bell className="w-4 h-4 text-[#C85A32]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#C85A32] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] w-full max-w-md rounded-2xl p-6 shadow-xl border border-[#E8DED6] animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DED6] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-[#2C2A29]">
                    Warta &amp; Notifikasi
                  </h2>
                  <p className="text-[11px] text-[#6B625D]">
                    Apresiasi karya, sahabat, dan kabar redaksi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#FAF8F5] flex items-center justify-center text-xs font-bold text-[#6B625D] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filter Tab & Tandai Baca */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DED6] text-xs">
                <button
                  type="button"
                  onClick={() => setFilter('semua')}
                  className={`px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
                    filter === 'semua'
                      ? 'bg-[#C85A32] text-white shadow-2xs'
                      : 'text-[#6B625D] hover:text-[#2C2A29]'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('apresiasi')}
                  className={`px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
                    filter === 'apresiasi'
                      ? 'bg-[#C85A32] text-white shadow-2xs'
                      : 'text-[#6B625D] hover:text-[#2C2A29]'
                  }`}
                >
                  Apresiasi
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('tantangan')}
                  className={`px-3 py-1 rounded-lg transition font-medium cursor-pointer ${
                    filter === 'tantangan'
                      ? 'bg-[#C85A32] text-white shadow-2xs'
                      : 'text-[#6B625D] hover:text-[#2C2A29]'
                  }`}
                >
                  Tantangan
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] text-[#C85A32] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  Tandai Dibaca
                </button>
              )}
            </div>

            {/* Daftar Notifikasi */}
            <div className="space-y-2 mb-5 max-h-[50vh] overflow-y-auto pr-1">
              {filteredNotifs.length === 0 ? (
                <p className="text-center text-xs text-[#6B625D] italic py-8">
                  Tidak ada warta di kategori ini.
                </p>
              ) : (
                filteredNotifs.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    onClick={() => setIsOpen(false)}
                    className={`p-3 rounded-xl border transition flex gap-3 items-start ${
                      notif.isRead
                        ? 'bg-[#FFFDF9] border-[#E8DED6] hover:border-[#C85A32]/40'
                        : 'bg-[#FAF8F5] border-[#C85A32]/40 shadow-2xs'
                    }`}
                  >
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-white border border-[#E8DED6] flex items-center justify-center">
                      {renderIcon(notif.iconType)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-serif font-bold text-xs text-[#2C2A29]">
                          {notif.judul}
                        </h3>
                        <span className="text-[10px] text-[#6B625D]">
                          {notif.waktu}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B625D] leading-relaxed">
                        {notif.pesan}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Opsi Izin Pengingat Web Push */}
            <div className="pt-3 border-t border-[#E8DED6] flex items-center justify-between text-xs">
              {permissionState === 'granted' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[#7A8B68] flex items-center gap-1 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Notifikasi Aktif
                  </span>
                  <button
                    type="button"
                    onClick={sendTestNotification}
                    className="text-[10px] text-[#C85A32] hover:underline flex items-center gap-0.5 cursor-pointer"
                    title="Uji kirim notifikasi"
                  >
                    <Send className="w-2.5 h-2.5" />
                    Uji
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPush}
                  className="text-[#C85A32] hover:underline font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Aktifkan Notifikasi
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-[#C85A32] text-white px-4 py-1.5 rounded-xl font-medium hover:bg-[#A94728] transition shadow-2xs cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
