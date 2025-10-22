import { useState } from 'react'
import { Image, Download, Sparkles, Upload } from 'lucide-react'
import html2canvas from 'html2canvas'
import { mintNFTArtwork, isPinataConfigured, ipfsToHttp } from '../services/ipfsNFTService'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import EvolvagotchiABI from '../contracts/Evolvagotchi.json'

interface NFTArtGeneratorProps {
  tokenId: number
  petName: string
  evolutionStage: number
  happiness: number
  hunger: number
  health: number
}

export function NFTArtGenerator({ tokenId, petName, evolutionStage, happiness, hunger, health }: NFTArtGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [ipfsMetadataUrl, setIpfsMetadataUrl] = useState<string | null>(null)
  const [ipfsImageUrl, setIpfsImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const hasPinata = isPinataConfigured()

  const lifeQuality = (() => {
    const avg = (happiness + (100 - hunger) + health) / 3
    if (avg >= 70) return 'loved'
    if (avg >= 40) return 'neutral'
    return 'neglected'
  })() as 'loved' | 'neutral' | 'neglected'

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Find the pet card element
      const petCard = document.querySelector('.pet-card') as HTMLElement
      
      if (!petCard) {
        throw new Error('Pet card not found')
      }

      // Capture the pet card as an image
      const canvas = await html2canvas(petCard, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      })

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/png')
      })

      // Convert to data URL for preview
      const dataUrl = canvas.toDataURL('image/png')

      setGeneratedImage(dataUrl)
      setImageBlob(blob)
    } catch (err) {
      console.error('Generation error:', err)
      setError('Failed to capture pet card. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMintNFT = async () => {
    if (!imageBlob) {
      setError('Please generate artwork first')
      return
    }

    if (!hasPinata) {
      setError('Pinata not configured. Add VITE_PINATA_JWT to your .env file.')
      return
    }

    setIsMinting(true)
    setError(null)

    try {
      console.log('🎨 Minting NFT on blockchain...')
      
      // Upload to IPFS
      const { tokenURI, ipfsImageUrl, ipfsMetadataUrl } = await mintNFTArtwork(
        petName,
        evolutionStage,
        happiness,
        hunger,
        health,
        imageBlob
      )

      console.log('✅ Uploaded to IPFS')
      console.log('📷 Image:', ipfsImageUrl)
      console.log('📝 Metadata:', ipfsMetadataUrl)
      
      setIpfsMetadataUrl(ipfsMetadataUrl)
      setIpfsImageUrl(ipfsImageUrl)

      // Update token URI on blockchain
      console.log('⛓️ Updating blockchain...')
      writeContract({
        address: EvolvagotchiABI.address as `0x${string}`,
        abi: EvolvagotchiABI.abi,
        functionName: 'updateTokenURI',
        args: [BigInt(tokenId), tokenURI],
      })

    } catch (err: any) {
      console.error('Minting error:', err)
      setError(err.message || 'Failed to mint NFT')
      setIsMinting(false)
    }
  }

  // Reset minting state when confirmed
  if (isConfirmed && isMinting) {
    setIsMinting(false)
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `${petName}-nft-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="nft-art-generator">
      <div className="art-preview">
        {generatedImage ? (
          <img src={generatedImage} alt={`${petName} NFT Art`} className="nft-image" />
        ) : (
          <div className="placeholder-overlay">
            <Image size={48} />
            <p>Capture your pet card as NFT!</p>
            <p className="small">Takes a snapshot of the current view</p>
          </div>
        )}
      </div>

      <div className="art-controls">
        {!generatedImage ? (
          <button
            className="btn btn-generate"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Sparkles size={18} className="spin" />
                Capturing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Capture Pet Card
              </>
            )}
          </button>
        ) : (
          <>
            <button className="btn btn-download" onClick={handleDownload}>
              <Download size={18} />
              Download PNG
            </button>
            {hasPinata && (
              <button 
                className="btn btn-mint" 
                onClick={handleMintNFT} 
                disabled={isMinting || isConfirming}
              >
                {isMinting || isConfirming ? (
                  <>
                    <Sparkles size={18} className="spin" />
                    {isConfirming ? 'Confirming...' : 'Minting NFT...'}
                  </>
                ) : isConfirmed ? (
                  <>✅ NFT Minted!</>
                ) : (
                  <>
                    <Upload size={18} />
                    Mint as NFT
                  </>
                )}
              </button>
            )}
            <button className="btn btn-regenerate" onClick={handleGenerate} disabled={isGenerating}>
              <Sparkles size={18} />
              Regenerate
            </button>
          </>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {!hasPinata && generatedImage && (
        <div className="info-message">
          <p>💡 To mint as NFT on blockchain, add VITE_PINATA_JWT to your .env file</p>
          <p className="small">Visit <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer">pinata.cloud</a> to get your API key</p>
        </div>
      )}

      {isGenerating && (
        <div className="generation-info">
          <p>📸 Capturing pet card...</p>
          <p className="small">Taking a snapshot!</p>
        </div>
      )}

      {(isMinting || isConfirming) && (
        <div className="generation-info">
          <p>⛓️ {isConfirming ? 'Confirming transaction...' : 'Uploading to IPFS...'}</p>
          <p className="small">{isConfirming ? 'Check your wallet' : 'Creating permanent NFT'}</p>
        </div>
      )}

      {isConfirmed && (
        <div className="success-message">
          <p>✅ NFT successfully minted on blockchain!</p>
          <p className="small">Your pet now has permanent artwork stored on IPFS</p>
          
          {ipfsImageUrl && (
            <div className="nft-links">
              <p className="link-label">🖼️ View NFT Image:</p>
              <a 
                href={ipfsToHttp(ipfsImageUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ipfs-link"
              >
                View on IPFS Gateway
              </a>
            </div>
          )}
          
          {ipfsMetadataUrl && (
            <div className="nft-links">
              <p className="link-label">📝 View Metadata:</p>
              <a 
                href={ipfsToHttp(ipfsMetadataUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ipfs-link"
              >
                View Metadata JSON
              </a>
            </div>
          )}
        </div>
      )}

      {generatedImage && (
        <div className="art-info">
          <p className={`quality-badge quality-${lifeQuality}`}>
            Life Quality: {lifeQuality === 'loved' ? '💖 Loved' : lifeQuality === 'neutral' ? '😊 Happy' : '😢 Needs Care'}
          </p>
          <p className="small">Snapshot of your pet card with all stats!</p>
        </div>
      )}
    </div>
  )
}