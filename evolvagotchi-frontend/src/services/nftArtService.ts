// NFT Art Service - Backend API integration

interface ArtGenerationParams {
  petName: string
  evolutionStage: number
  happiness: number
  health: number
  lifeQuality: 'loved' | 'neutral' | 'neglected'
}

const STAGE_DESCRIPTIONS = {
  0: {
    name: 'Egg',
    prompt: 'a mysterious glowing egg, magical aura, fantasy art style, cosmic energy',
  },
  1: {
    name: 'Baby',
    prompt: 'a cute baby dragon creature, adorable, big eyes, chibi style, kawaii, soft pastel colors',
  },
  2: {
    name: 'Teen',
    prompt: 'a teenage dragon, energetic, playful, vibrant colors, dynamic pose, detailed scales',
  },
  3: {
    name: 'Adult',
    prompt: 'a majestic adult dragon, powerful, elegant, intricate details, epic fantasy art, wings spread',
  },
}

const QUALITY_MODIFIERS = {
  loved: 'bright vibrant colors, healthy appearance, glowing aura, happy expression, surrounded by sparkles',
  neutral: 'balanced colors, normal appearance, peaceful mood',
  neglected: 'muted dark colors, tired appearance, sad expression, dim lighting, shadows',
}

function getLifeQuality(happiness: number, health: number): 'loved' | 'neutral' | 'neglected' {
  const avgStat = (happiness + health) / 2
  if (avgStat >= 70) return 'loved'
  if (avgStat >= 40) return 'neutral'
  return 'neglected'
}

export async function generatePetArt(params: ArtGenerationParams): Promise<string> {
  const { petName, evolutionStage, happiness, health, lifeQuality } = params
  
  const stageDesc = STAGE_DESCRIPTIONS[evolutionStage as keyof typeof STAGE_DESCRIPTIONS]
  const qualityMod = QUALITY_MODIFIERS[lifeQuality]

  const fullPrompt = `Professional digital art, ${stageDesc.prompt}, ${qualityMod}, named "${petName}", highly detailed, 8k quality, trending on artstation, concept art`

  const negativePrompt = 'blurry, low quality, distorted, ugly, watermark, text, signature, duplicate, deformed'

  try {
    console.log('Generating art with prompt:', fullPrompt)
    
    // Call our backend API instead of Replicate directly
    const response = await fetch('http://localhost:3001/api/generate-art', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        negativePrompt,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to generate art')
    }

    const data = await response.json()
    
    if (data.imageUrl) {
      return data.imageUrl
    }

    throw new Error('No image generated')
  } catch (error) {
    console.error('Error generating art:', error)
    throw error
  }
}

// Fallback images for each stage (placeholder URLs or base64)
export const FALLBACK_IMAGES = {
  0: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Cellipse cx="100" cy="100" rx="80" ry="100" fill="%23e0e0e0" stroke="%23999" stroke-width="3"/%3E%3Ctext x="100" y="110" text-anchor="middle" font-size="60"%3E🥚%3C/text%3E%3C/svg%3E',
  1: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ccircle cx="100" cy="100" r="80" fill="%23ffeb3b" stroke="%23ff9800" stroke-width="3"/%3E%3Ctext x="100" y="120" text-anchor="middle" font-size="60"%3E🐣%3C/text%3E%3C/svg%3E',
  2: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ccircle cx="100" cy="100" r="80" fill="%23ff9800" stroke="%23ff5722" stroke-width="3"/%3E%3Ctext x="100" y="120" text-anchor="middle" font-size="60"%3E🦖%3C/text%3E%3C/svg%3E',
  3: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ccircle cx="100" cy="100" r="80" fill="%23f44336" stroke="%23d32f2f" stroke-width="3"/%3E%3Ctext x="100" y="120" text-anchor="middle" font-size="60"%3E🐲%3C/text%3E%3C/svg%3E',
}

// Store generated images in localStorage for persistence
const STORAGE_KEY = 'evolvagotchi_nft_images'

export function saveGeneratedImage(tokenId: number, stage: number, imageUrl: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const images: Record<string, Record<number, string>> = stored ? JSON.parse(stored) : {}
    
    if (!images[tokenId]) {
      images[tokenId] = {}
    }
    
    images[tokenId][stage] = imageUrl
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
  } catch (error) {
    console.error('Error saving generated image:', error)
  }
}

export function getGeneratedImage(tokenId: number, stage: number): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const images: Record<string, Record<number, string>> = JSON.parse(stored)
    return images[tokenId]?.[stage] || null
  } catch (error) {
    console.error('Error retrieving generated image:', error)
    return null
  }
}

export function hasGeneratedImage(tokenId: number, stage: number): boolean {
  return getGeneratedImage(tokenId, stage) !== null
}