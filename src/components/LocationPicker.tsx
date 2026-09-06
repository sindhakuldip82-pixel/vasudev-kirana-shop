'use client';

import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  onLocation: (lat: number, lng: number) => void;
}

export default function LocationPicker({ onLocation }: Props) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'error'>('idle');

  function requestLocation() {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('granted');
        onLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={requestLocation}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-brand-300 text-brand-700 rounded-xl py-3 text-sm font-medium bg-brand-50"
      >
        {status === 'loading' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <MapPin size={16} />
        )}
        {status === 'granted' ? t('currentLocation') : t('useMyLocation')}
      </button>
      {status === 'denied' && (
        <p className="text-xs text-red-500 mt-1.5">{t('locationDenied')}</p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-1.5">
          Could not get location. Please enter your address manually.
        </p>
      )}
    </div>
  );
}
