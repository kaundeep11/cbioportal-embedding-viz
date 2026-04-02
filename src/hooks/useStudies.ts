import { useState, useEffect } from 'react';
import { fetchStudies } from '../utils/api';
import type { Study } from '../types';

export const useStudies = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStudies = async () => {
      try {
        setLoading(true);
        const data = await fetchStudies();
        if (isMounted) {
          setStudies(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch studies');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudies();

    return () => {
      isMounted = false;
    };
  }, []);

  return { studies, loading, error };
};
