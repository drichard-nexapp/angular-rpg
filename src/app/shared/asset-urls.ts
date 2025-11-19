export const ASSET_BASE_URL = 'https://artifactsmmo.com/images'

export function getCharacterImageUrl(skin: string): string {
  return `${ASSET_BASE_URL}/characters/${skin}.png`
}

export function getCharacterSkinImageUrl(skin: string): string {
  return `${ASSET_BASE_URL}/characters/${skin}.png`
}

export function getItemImageUrl(code: string): string {
  return `${ASSET_BASE_URL}/items/${code}.png`
}

export function getMonsterImageUrl(code: string): string {
  return `${ASSET_BASE_URL}/monsters/${code}.png`
}

export function getMapImageUrl(skin: string): string {
  return `${ASSET_BASE_URL}/maps/${skin}.png`
}

export function getResourceImageUrl(code: string): string {
  return `${ASSET_BASE_URL}/resources/${code}.png`
}

export function getEffectImageUrl(code: string): string {
  return `${ASSET_BASE_URL}/effects/${code}.png`
}

export function getNpcImageUrl(code: string): string {
  return `${ASSET_BASE_URL}/npcs/${code}.png`
}

export function getBadgeImageUrl(code: string): string {
  return `${ASSET_BASE_URL}/badges/${code}.png`
}
