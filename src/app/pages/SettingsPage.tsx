import { useParams, useNavigate } from 'react-router';
import { SettingsPanel } from '../components/SettingsPanel';

export function SettingsPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();

  if (!venueId) {
    navigate('/venues');
    return null;
  }

  return (
    <SettingsPanel
      venueId={venueId}
      onClose={() => navigate(`/v/${venueId}/order`)}
    />
  );
}
