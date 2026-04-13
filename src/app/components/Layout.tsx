import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router';
import { ClipboardList, ListOrdered, BarChart3, Settings } from 'lucide-react';
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
  }, []);

  const navItems = [
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
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </header>
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* ボトムナビゲーション（会場ページのみ） */}
      {isVenuePage && (
        <nav className="bg-white border-t border-gray-300" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const path = `/v/${venueId}/${item.key}`;
              const isActive = location.pathname.startsWith(path);

              return (
                <Link
                  key={item.key}
                  to={path}
                  className={`flex-1 flex flex-col items-center justify-center py-3 ${
                    isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
