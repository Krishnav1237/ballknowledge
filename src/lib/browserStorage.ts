export function getBrowserStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window[type];
  } catch {
    return null;
  }
}

export function getLocalStorage(): Storage | null {
  return getBrowserStorage('localStorage');
}

export function getSessionStorage(): Storage | null {
  return getBrowserStorage('sessionStorage');
}

export function getStorageItem(type: 'localStorage' | 'sessionStorage', key: string): string | null {
  const storage = getBrowserStorage(type);
  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(type: 'localStorage' | 'sessionStorage', key: string, value: string): boolean {
  const storage = getBrowserStorage(type);
  if (!storage) return false;

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(type: 'localStorage' | 'sessionStorage', key: string): boolean {
  const storage = getBrowserStorage(type);
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
