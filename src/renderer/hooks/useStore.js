import { useState, useEffect, useCallback } from 'react';

export function useStore(key, defaultValue = null) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    window.electronAPI.storeGet(key).then(v => {
      setValue(v !== undefined && v !== null ? v : defaultValue);
    }).catch(() => setValue(defaultValue));
  }, [key]);

  const setStoredValue = useCallback(async (newValue) => {
    await window.electronAPI.storeSet(key, newValue);
    setValue(newValue);
  }, [key]);

  return [value, setStoredValue];
}
