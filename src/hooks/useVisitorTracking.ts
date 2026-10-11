import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVisit, sendHeartbeat } from '../services/visitorTracker';

interface UseVisitorTrackingProps {
  user: any;
  userProfile?: any;
}

export function useVisitorTracking({ user, userProfile }: UseVisitorTrackingProps) {
  const location = useLocation();

  // Sayfa değiştiğinde ziyareti kaydet
  useEffect(() => {
    const userInfo = user ? {
      uid: user.uid,
      nickname: userProfile?.nickname || user.displayName || user.email?.split('@')[0],
      role: userProfile?.role || 'user',
      email: user.email,
    } : null;

    trackVisit({
      path: location.pathname + location.search,
      user: userInfo,
    });
  }, [location.pathname, location.search, user, userProfile]);

  // Her 30 saniyede bir canlı oturum kalp atışı (heartbeat) gönder
  useEffect(() => {
    const interval = setInterval(() => {
      // Sekme aktif ve görünürse kalp atışı gönder
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const userInfo = user ? {
          uid: user.uid,
          nickname: userProfile?.nickname || user.displayName || user.email?.split('@')[0],
          role: userProfile?.role || 'user',
          email: user.email,
        } : null;

        sendHeartbeat(location.pathname + location.search, userInfo);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [location.pathname, location.search, user, userProfile]);
}
