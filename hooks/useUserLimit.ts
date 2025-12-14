import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { API_BASE_URL } from '../constants';
import { logger } from '../utils/logger';

interface UserLimitData {
  limit: number;
  remaining: number;
  resetAt: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useUserLimit = (): UserLimitData => {
  const { user } = useUser();
  const [limitData, setLimitData] = useState<UserLimitData>({
    limit: 20,
    remaining: 20,
    resetAt: null,
    isLoading: true,
    error: null,
    refresh: () => { }
  });

  const fetchUserLimit = useCallback(async () => {
    if (!user) {
      logger.debug('useUserLimit: No user, setting default');
      setLimitData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      logger.debug('useUserLimit: Fetching limit for user:', user.id);
      setLimitData(prev => ({ ...prev, isLoading: true, error: null }));

      // First, ensure user exists in our database
      logger.debug('useUserLimit: Creating/updating user in database');
      await fetch(`${API_BASE_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || ''
        })
      });

      // Then get the limit data
      logger.debug('useUserLimit: Getting limit data');
      const response = await fetch(`${API_BASE_URL}/api/user-limit/${user.id}`);
      const data = await response.json();
      logger.debug('useUserLimit: API response:', data);

      if (data.success) {
        logger.debug('useUserLimit: Setting limit data:', { limit: data.limit, remaining: data.remaining });
        setLimitData({
          limit: data.limit,
          remaining: data.remaining,
          resetAt: data.resetAt,
          isLoading: false,
          error: null,
          refresh: fetchUserLimit
        });
      } else {
        logger.error('useUserLimit: API error:', data.error);
        setLimitData(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Failed to fetch limit data',
          refresh: fetchUserLimit
        }));
      }
    } catch (error) {
      logger.error('useUserLimit: Error fetching user limit:', error);
      // If API is not available, show default limit
      setLimitData({
        limit: 20,
        remaining: 20,
        resetAt: null,
        isLoading: false,
        error: null,
        refresh: fetchUserLimit
      });
    }
  }, [user]);

  useEffect(() => {
    fetchUserLimit();
  }, [fetchUserLimit]);

  return limitData;
};
