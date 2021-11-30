import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAppState = (listener: (state: AppStateStatus) => void) => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', listener);
    return () => {
      subscription.remove();
    };
  }, [listener]);
};
