/**
 * DiceBear Avatar Generation Utility
 * Generates an SVG URL based on user configuration.
 */

export interface AvatarConfig {
  seed: string
  style?: string
  flip?: boolean
  rotate?: number
  scale?: number
  radius?: number
  backgroundColor?: string
  hair?: string
  hairColor?: string
  eyes?: string
  mouth?: string
  accessories?: string
  skinColor?: string
}

export const generateAvatarURL = (config: AvatarConfig): string => {
  const style = config.style || 'adventurer'
  const baseUrl = `https://api.dicebear.com/7.x/${style}/svg`

  const params = new URLSearchParams()

  if (config.seed) params.append('seed', config.seed)
  if (config.flip) params.append('flip', 'true')
  if (config.rotate) params.append('rotate', config.rotate.toString())
  if (config.scale) params.append('scale', config.scale.toString())
  if (config.radius) params.append('radius', config.radius.toString())
  if (config.backgroundColor)
    params.append('backgroundColor', config.backgroundColor.replace('#', ''))

  // Style-specific attributes (mapped to DiceBear params)
  if (config.hair) params.append('hair', config.hair)
  if (config.hairColor) params.append('hairColor', config.hairColor.replace('#', ''))
  if (config.eyes) params.append('eyes', config.eyes)
  if (config.mouth) params.append('mouth', config.mouth)
  if (config.accessories) params.append('accessories', config.accessories)
  if (config.skinColor) params.append('skinColor', config.skinColor.replace('#', ''))

  return `${baseUrl}?${params.toString()}`
}

export const DEFAULT_AVATAR_CONFIG: Partial<AvatarConfig> = {
  style: 'adventurer',
  backgroundColor: 'b6e3f4',
}
