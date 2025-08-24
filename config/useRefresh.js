import { useState, useCallback } from 'react';

/**
 * A custom hook to manage pull-to-refresh logic.
 * @param {Function} refreshFunction - The async function to call to refetch data.
 * @returns {{isRefreshing: boolean, onRefresh: Function}}
 */
export const useRefresh = (refreshFunction) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Await the data fetching function passed into the hook
      await refreshFunction();
    } catch (error) {
      console.error("Failed to refresh data:", error);
      // Optionally, show an alert or toast message here
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunction]); // Dependency array ensures the function is stable

  return { isRefreshing, onRefresh };
};