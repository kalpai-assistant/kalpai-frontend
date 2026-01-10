import { useState, useEffect, useCallback } from 'react';
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { initializeCognito, isCognitoConfigured } from '../services/cognitoConfig';

interface CognitoUser {
  username: string;
  userId: string;
}

interface UseCognitoAuthReturn {
  user: CognitoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signInUser: (username: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const useCognitoAuth = (): UseCognitoAuthReturn => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    if (!isCognitoConfigured()) {
      setError('Cognito not configured');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      if (currentUser && session.tokens) {
        setUser({
          username: currentUser.username,
          userId: currentUser.userId
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log('No authenticated user:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInUser = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signIn({ username, password });
      await checkAuthStatus();
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  const signOutUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isCognitoConfigured()) {
      initializeCognito();
      checkAuthStatus();
    } else {
      setError('Cognito configuration missing');
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signInUser,
    signOutUser,
    checkAuthStatus
  };
};