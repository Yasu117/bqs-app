import { Venue } from '../types';
import { ChevronDown } from 'lucide-react';

interface VenueSwitcherProps {
  venues: Venue[];
  currentVenueId: string | null;
  onVenueChange: (venueId: string) => void;
  onSettingsClick?: () => void;
}

export function VenueSwitcher({
  venues,
  currentVenueId,
  onVenueChange,
  onSettingsClick,
}: VenueSwitcherProps) {
  const currentVenue = venues.find(v => v.id === currentVenueId);

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentVenueId || ''}
        onChange={(e) => onVenueChange(e.target.value)}
        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded text-base appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
      >
        {venues.map(venue => (
          <option key={venue.id} value={venue.id}>
            {venue.name}
          </option>
        ))}
      </select>
      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded text-base"
        >
          設定
        </button>
      )}
    </div>
  );
}
