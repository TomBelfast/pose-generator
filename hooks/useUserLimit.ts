import { useState, useEffect } from 'react';
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

  const fetchUserLimit = async () => {
    if (!user) {
      setLimitData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setLimitData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // First, ensure user exists in our database
      await fetch('http://localhost:3001/api/user', {
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
      const response = await fetch(`http://localhost:3001/api/user-limit/${user.id}`);
      const data = await response.json();

      if (data.success) {
        setLimitData({
          limit: data.limit,
          remaining: data.remaining,
          resetAt: data.resetAt,
          isLoading: false,
          error: null,
          refresh: fetchUserLimit
        });
      } else {
        setLimitData(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Failed to fetch limit data',
          refresh: fetchUserLimit
        }));
      }
    } catch (error) {
      console.error('Error fetching user limit:', error);
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
  };

  useEffect(() => {
    fetchUserLimit();
  }, [user]);

  return limitData;
};
