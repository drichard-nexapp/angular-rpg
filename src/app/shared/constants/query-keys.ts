export const QUERY_KEYS = {
  account: {
    details: () => ['account-details'] as const,
    achievements: (username: string, completed?: boolean) => ['achievements', username, completed] as const,
  },
  characters: {
    all: () => ['my-characters'] as const,
    detail: (name: string) => ['character', name] as const,
  },
  maps: {
    layer: (layer: string) => ['maps', layer] as const,
    tileDetails: (x: number, y: number) => ['tile-details', x, y] as const,
  },
  monsters: {
    detail: (code: string) => ['monster-details', code] as const,
  },
  resources: {
    detail: (code: string) => ['resource-details', code] as const,
  },
  npcs: {
    detail: (code: string) => ['npc-details', code] as const,
    items: (code: string) => ['npc-items', code] as const,
  },
  tasks: {
    list: (skill?: string, minLevel?: number, maxLevel?: number) => ['tasks', skill, minLevel, maxLevel] as const,
  },
  events: {
    active: () => ['active-events'] as const,
  },
  items: {
    all: () => ['all-items'] as const,
  },
} as const
