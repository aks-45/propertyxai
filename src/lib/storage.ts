export const STORAGE_KEYS = {
  USER_PREFS: 'px_user_prefs',
  SAVED_REPORTS: 'px_saved_reports',
  RECENT_SEARCHES: 'px_recent_searches',
  CURRENT_ANALYSIS: 'px_current_analysis',
  PROPERTY_INPUT: 'px_property_input',
  CURRENT_INPUT: 'px_current_input',
};

export function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error saving to storage', error);
  }
}

export function getFromStorage<T>(key: string): T | null {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.error('Error reading from storage', error);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing from storage', error);
  }
}
