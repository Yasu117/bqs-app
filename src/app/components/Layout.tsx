import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router';
import { ClipboardList, ListOrdered, BarChart3, ChevronLeft, Store, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchVenues } from '../../lib/api';
import { Venue } from '../types';

export function Layout() {
  const location = useLocation();
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    fetchVenues().then(setVenues).catch(console.error);
  }, [location.pathname]);

  const navItems = [
    { key: 'venues', icon: Store, label: '会場' },
    { key: 'order', icon: ClipboardList, label: '注文' },
    { key: 'queue', icon: ListOrdered, label: 'キュー' },
    { key: 'history', icon: BarChart3, label: '集計' },
  ];

  const isVenuePage = !!venueId;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー（会場ページのみ表示） */}
      {isVenuePage && (
        <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded text-gray-600"
            title="会場選択に戻る"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <select
            value={venueId}
            onChange={(e) => {
              const currentPage = navItems.find((n) =>
                location.pathname.includes(`/${n.key}`),
              );
              navigate(`/v/${e.target.value}/${currentPage?.key ?? 'order'}`);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded text-base bg-white"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate(`/v/${venueId}/settings`)}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 focus:outline-none"
            title="メニュー・オプション設定"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* ボトムナビゲーション（常時表示） */}
      <nav className="bg-white border-t border-gray-200 shrink-0 select-none z-50 w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex max-w-2xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // 会場タブは / へのパス。それ以外は venueId があれば各機能へのパス。
            const path = item.key === 'venues' 
              ? '/' 
              : venueId 
                ? `/v/${venueId}/${item.key}` 
                : '#';
                
            const isActive = item.key === 'venues'
              ? location.pathname === '/'
              : location.pathname.startsWith(`/v/${venueId}/${item.key}`);
              
            const isDisabled = !venueId && item.key !== 'venues';

            return (
              <Link
                key={item.key}
                to={path}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
                className={`flex-1 flex flex-col items-center justify-center py-3.5 transition-all duration-200 ${
                  isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : isActive
                      ? 'text-black'
                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive && !isDisabled ? 'stroke-[2.5px]' : ''}`} />
                <span className={`text-[10px] tracking-wide ${isActive && !isDisabled ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
