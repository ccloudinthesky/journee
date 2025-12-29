import { useState, useEffect } from 'react';
import { loadGoogleMaps } from '../services/googleMaps';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        setLoadError(error);
        console.error('Failed to load Google Maps:', error);
      });
  }, []);

  return { isLoaded, loadError };
};

