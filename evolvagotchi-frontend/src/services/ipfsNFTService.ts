// IPFS/Pinata NFT Service
// Uploads generated artwork to IPFS and creates NFT metadata

export interface NFTMetadata {
  name: string
  description: string
  image: string // IPFS URL
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface MintResult {
  ipfsImageUrl: string
  ipfsMetadataUrl: string
  tokenURI: string
}

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT

// Check if Pinata credentials are configured
export function isPinataConfigured(): boolean {
  return !!(PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY))
}

// Upload image blob to Pinata IPFS
export async function uploadImageToIPFS(
  imageBlob: Blob,
  filename: string
): Promise<string> {
  if (!isPinataConfigured()) {
    throw new Error('Pinata API credentials not configured. Please add VITE_PINATA_JWT to your .env file.')
  }

  const formData = new FormData()
  formData.append('file', imageBlob, filename)

  const metadata = JSON.stringify({
    name: filename,
  })
  formData.append('pinataMetadata', metadata)

  const options = JSON.stringify({
    cidVersion: 1,
  })
  formData.append('pinataOptions', options)

  const headers: HeadersInit = {}
  
  if (PINATA_JWT) {
    headers['Authorization'] = `Bearer ${PINATA_JWT}`
  } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    headers['pinata_api_key'] = PINATA_API_KEY
    headers['pinata_secret_api_key'] = PINATA_SECRET_KEY
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload image to IPFS: ${error}`)
  }

  const result = await response.json()
  return `ipfs://${result.IpfsHash}`
}

// Upload metadata JSON to Pinata IPFS
export async function uploadMetadataToIPFS(
  metadata: NFTMetadata
): Promise<string> {
  if (!isPinataConfigured()) {
    throw new Error('Pinata API credentials not configured')
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (PINATA_JWT) {
    headers['Authorization'] = `Bearer ${PINATA_JWT}`
  } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    headers['pinata_api_key'] = PINATA_API_KEY
    headers['pinata_secret_api_key'] = PINATA_SECRET_KEY
  }

  const data = JSON.stringify({
    pinataContent: metadata,
    pinataMetadata: {
      name: `${metadata.name}-metadata.json`,
    },
  })

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers,
    body: data,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload metadata to IPFS: ${error}`)
  }

  const result = await response.json()
  return `ipfs://${result.IpfsHash}`
}

// Create NFT metadata from pet stats
export function createNFTMetadata(
  petName: string,
  evolutionStage: number,
  happiness: number,
  hunger: number,
  health: number,
  ipfsImageUrl: string
): NFTMetadata {
  const stageNames = ['Egg', 'Baby', 'Adult']
  const lifeQuality = (() => {
    const avg = (happiness + (100 - hunger) + health) / 3
    if (avg >= 70) return 'Loved'
    if (avg >= 40) return 'Neutral'
    return 'Neglected'
  })()

  return {
    name: `${petName} - ${stageNames[evolutionStage]}`,
    description: `An Evolvagotchi NFT representing ${petName} at ${stageNames[evolutionStage]} stage. This artwork reflects the pet's current life quality: ${lifeQuality}.`,
    image: ipfsImageUrl,
    attributes: [
      {
        trait_type: 'Evolution Stage',
        value: stageNames[evolutionStage],
      },
      {
        trait_type: 'Life Quality',
        value: lifeQuality,
      },
      {
        trait_type: 'Happiness',
        value: happiness,
      },
      {
        trait_type: 'Hunger',
        value: hunger,
      },
      {
        trait_type: 'Health',
        value: health,
      },
      {
        trait_type: 'Generation Date',
        value: new Date().toISOString(),
      },
    ],
  }
}

// Complete NFT minting flow
export async function mintNFTArtwork(
  petName: string,
  evolutionStage: number,
  happiness: number,
  hunger: number,
  health: number,
  imageBlob: Blob
): Promise<MintResult> {
  try {
    console.log('📤 Uploading image to IPFS...')
    const filename = `${petName}-${evolutionStage}-${Date.now()}.png`
    const ipfsImageUrl = await uploadImageToIPFS(imageBlob, filename)
    console.log('✅ Image uploaded:', ipfsImageUrl)

    console.log('📝 Creating metadata...')
    const metadata = createNFTMetadata(
      petName,
      evolutionStage,
      happiness,
      hunger,
      health,
      ipfsImageUrl
    )

    console.log('📤 Uploading metadata to IPFS...')
    const ipfsMetadataUrl = await uploadMetadataToIPFS(metadata)
    console.log('✅ Metadata uploaded:', ipfsMetadataUrl)

    return {
      ipfsImageUrl,
      ipfsMetadataUrl,
      tokenURI: ipfsMetadataUrl,
    }
  } catch (error) {
    console.error('❌ NFT minting failed:', error)
    throw error
  }
}

// Helper to convert IPFS URL to HTTP gateway URL for display
export function ipfsToHttp(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '')
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }
  return ipfsUrl
}
