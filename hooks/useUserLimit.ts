import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';

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
    limit: 10,
    remaining: 10,
    resetAt: null,
    isLoading: true,
    error: null,
    refresh: () => {}
  });

  const fetchUserLimit = useCallback(async () => {
    if (!user) {
      console.log('🔍 useUserLimit: No user, setting default');
      setLimitData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      console.log('🔍 useUserLimit: Fetching limit for user:', user.id);
      setLimitData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // First, ensure user exists in our database
      console.log('🔍 useUserLimit: Creating/updating user in database');
      await fetch('http://localhost:4999/api/user', {
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
      console.log('🔍 useUserLimit: Getting limit data');
      const response = await fetch(`http://localhost:4999/api/user-limit/${user.id}`);
      const data = await response.json();
      console.log('🔍 useUserLimit: API response:', data);

      if (data.success) {
        console.log('🔍 useUserLimit: Setting limit data:', { limit: data.limit, remaining: data.remaining });
        setLimitData({
          limit: data.limit,
          remaining: data.remaining,
          resetAt: data.resetAt,
          isLoading: false,
          error: null,
          refresh: fetchUserLimit
        });
      } else {
        console.log('🔍 useUserLimit: API error:', data.error);
        setLimitData(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Failed to fetch limit data',
          refresh: fetchUserLimit
        }));
      }
    } catch (error) {
      console.error('🔍 useUserLimit: Error fetching user limit:', error);
      // If API is not available, show default limit
      setLimitData({
        limit: 10,
        remaining: 10,
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
