import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { fetchVenues as apiFetchVenues, createVenue } from '../../lib/api';
import { Venue } from '../types';

export function VenuesList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVenueName, setNewVenueName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
      setVenues([data, ...venues]);
      setNewVenueName('');
    } catch (err) {
      console.error('Error creating venue:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-12">
      <h1 className="text-2xl font-bold mb-8">BQS - 会場選択</h1>
      
      <div className="space-y-4 mb-12">
        {venues.map((venue) => (
          <button
            key={venue.id}
            onClick={() => navigate(`/v/${venue.id}/order`)}
            className="w-full text-left px-6 py-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="text-lg font-medium">{venue.name}</div>
          </button>
        ))}
        {venues.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            登録されている会場がありません。新しく作成してください。
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium mb-4">新しい会場を作成</h2>
        <form onSubmit={handleCreateVenue} className="flex gap-2">
          <input
            type="text"
            value={newVenueName}
            onChange={(e) => setNewVenueName(e.target.value)}
            placeholder="会場名を入力"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newVenueName.trim()}
            className="px-6 py-2 bg-black text-white rounded-md disabled:bg-gray-300 transition-colors"
          >
            作成
          </button>
        </form>
      </div>
    </div>
  );
}
