export const APP_CONFIG = {
  CHARACTER: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 12,
    NAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  CACHE: {
    STALE_TIME_SHORT: 1000 * 30,
    STALE_TIME_1_MIN: 1000 * 60,
    STALE_TIME_MEDIUM: 1000 * 60 * 5,
    STALE_TIME_10_MIN: 1000 * 60 * 10,
    STALE_TIME_30_MIN: 1000 * 60 * 30,
    STALE_TIME_LONG: 1000 * 60 * 60,
    GC_TIME_DEFAULT: 1000 * 60 * 10,
    REFETCH_INTERVAL_1_MIN: 1000 * 60,
  },
  COOLDOWN: {
    POLL_INTERVAL: 1000,
    ERROR_RETRY_DELAY: 5000,
  },
  UI: {
    ERROR_AUTO_DISMISS_MS: 5000,
    TOAST_DURATION_MS: 3000,
  },
  MAP: {
    DEFAULT_LAYER: 'overworld' as const,
  },
} as const

export type AppConfig = typeof APP_CONFIG
