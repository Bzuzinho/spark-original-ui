import axios from 'axios';

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

const USE_SPORTS_MOCK = parseBooleanEnv(import.meta.env.VITE_SPORTS_USE_MOCK, false);
const FALLBACK_ON_ERROR = parseBooleanEnv(import.meta.env.VITE_SPORTS_FALLBACK_ON_ERROR, false);

export async function getSportsResource<T>(endpoint: string, fallback: T): Promise<T> {
  if (USE_SPORTS_MOCK) {
    return fallback;
  }

  try {
    const response = await axios.get<T>(endpoint, {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    return response.data;
  } catch (error) {
    if (FALLBACK_ON_ERROR) {
      return fallback;
    }

    throw error;
  }
}
