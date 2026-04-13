import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { fetchVenues as apiFetchVenues, createVenue, deleteVenue, updateVenueName } from '../../lib/api';
import { Venue } from '../types';
import { Trash2, Pencil, Settings } from 'lucide-react';
import { SettingsPanel } from '../components/SettingsPanel';

export function VenuesList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVenueName, setNewVenueName] = useState('');
  const navigate = useNavigate();
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [editingVenueName, setEditingVenueName] = useState('');
  const [settingsVenueId, setSettingsVenueId] = useState<string | null>(null);

  useEffect(() => {
    document.title = '会場選択 | BQS';
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const data = await apiFetchVenues();
      setVenues(data);
    } catch (err) {
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim()) return;

    try {
      const data = await createVenue(newVenueName.trim());
      setVenues([...venues, data]);
      setNewVenueName('');
    } catch (err) {
      console.error('Error creating venue:', err);
    }
  };

  const handleUpdateVenue = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!editingVenueId || !editingVenueName.trim()) return;

    try {
      await updateVenueName(editingVenueId, editingVenueName.trim());
      setVenues(venues.map(v => v.id === editingVenueId ? { ...v, name: editingVenueName.trim() } : v));
      setEditingVenueId(null);
      setEditingVenueName('');
    } catch (err) {
      console.error('Error updating venue:', err);
      alert('会場名の更新に失敗しました。');
    }
  };

  const confirmDeleteVenue = async () => {
    if (!venueToDelete) return;

    try {
      await deleteVenue(venueToDelete.id);
      setVenues(venues.filter((v) => v.id !== venueToDelete.id));
      setVenueToDelete(null);
    } catch (err) {
      console.error('Error deleting venue:', err);
      alert('会場の削除に失敗しました。');
      setVenueToDelete(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="max-w-2xl mx-auto p-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">BQS</h1>
          <p className="text-gray-500">操作する会場を選択または作成してください</p>
        </header>
        
        <div className="space-y-4 mb-16">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">登録済みの会場</h2>
          {venues.map((venue) => (
            <div
              key={venue.id}
              onClick={() => {
                if (editingVenueId !== venue.id) {
                  navigate(`/v/${venue.id}/order`);
                }
              }}
              className={`group relative w-full text-left px-6 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-between min-h-[5.5rem] ${
                editingVenueId === venue.id 
                  ? 'ring-2 ring-black border-transparent' 
                  : 'hover:shadow-xl hover:border-blue-200 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {editingVenueId === venue.id ? (
                <div 
                  className="flex flex-col sm:flex-row sm:items-center gap-3 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editingVenueName}
                    onChange={(e) => setEditingVenueName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-lg"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateVenue(e);
                      if (e.key === 'Escape') {
                        setEditingVenueId(null);
                        setEditingVenueName('');
                      }
                    }}
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleUpdateVenue}
                      className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-md hover:bg-gray-800 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingVenueId(null);
                        setEditingVenueName('');
                      }}
                      className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      {venue.name.charAt(0)}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{venue.name}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSettingsVenueId(venue.id);
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black rounded-lg transition-all duration-200 flex items-center gap-1.5"
                      title="メニュー設定"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-bold">設定</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVenueId(venue.id);
                        setEditingVenueName(venue.name);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="編集"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVenueToDelete(venue);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="削除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {venues.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-12 text-center">
              <p className="text-gray-400">登録されている会場がありません</p>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-black"></div>
          <h2 className="text-xl font-bold mb-6 text-gray-900">新しい会場を作成</h2>
          <form onSubmit={handleCreateVenue} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newVenueName}
              onChange={(e) => setNewVenueName(e.target.value)}
              placeholder="会場名（例：青山オフィス）"
              className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-lg"
            />
            <button
              type="submit"
              disabled={!newVenueName.trim()}
              className="px-8 py-3 bg-black text-white rounded-xl font-bold disabled:bg-gray-200 hover:bg-gray-800 active:scale-95 transition-all duration-200 shadow-lg shadow-black/10"
            >
              作成する
            </button>
          </form>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {venueToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">会場の削除</h3>
            <p className="text-gray-600 mb-8">
              「{venueToDelete.name}」を削除しますか？<br/>
              この操作は取り消せません。
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={confirmDeleteVenue}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-base font-bold transition-colors"
              >
                削除する
              </button>
              <button 
                onClick={() => setVenueToDelete(null)}
                className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-base font-bold transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 設定パネル (メニュー・オプション) */}
      {settingsVenueId && (
        <SettingsPanel 
          venueId={settingsVenueId} 
          onClose={() => setSettingsVenueId(null)} 
        />
      )}
    </div>
  );
}
