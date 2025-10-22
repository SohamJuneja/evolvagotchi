// Canvas-based NFT Art Generator
// Generates dynamic pet artwork based on current stats

export interface PetStats {
  name: string
  evolutionStage: number // 0=Egg, 1=Baby, 2=Adult
  happiness: number
  hunger: number
  health: number
}

export interface NFTGenerationResult {
  imageUrl: string // Data URL
  blob: Blob
}

// Helper function to determine life quality
function getLifeQuality(happiness: number, hunger: number, health: number): 'loved' | 'neutral' | 'neglected' {
  const avgScore = (happiness + (100 - hunger) + health) / 3
  if (avgScore >= 70) return 'loved'
  if (avgScore >= 40) return 'neutral'
  return 'neglected'
}

// Color schemes based on pet state
const colorSchemes = {
  loved: {
    primary: '#FFD700', // Gold
    secondary: '#FF69B4', // Hot pink
    glow: '#FFA500', // Orange
    bg: ['#FFF5E1', '#FFE4E1', '#FFF0F5'], // Warm pastels
    aura: 'rgba(255, 215, 0, 0.3)'
  },
  neutral: {
    primary: '#4169E1', // Royal blue
    secondary: '#9370DB', // Medium purple
    glow: '#87CEEB', // Sky blue
    bg: ['#E6E6FA', '#F0F8FF', '#F5F5DC'], // Cool pastels
    aura: 'rgba(65, 105, 225, 0.2)'
  },
  neglected: {
    primary: '#696969', // Dim gray
    secondary: '#A9A9A9', // Dark gray
    glow: '#808080', // Gray
    bg: ['#D3D3D3', '#C0C0C0', '#B0B0B0'], // Gray tones
    aura: 'rgba(128, 128, 128, 0.2)'
  }
}

// Draw evolution stage-specific pet
function drawPet(
  ctx: CanvasRenderingContext2D,
  stage: number,
  quality: 'loved' | 'neutral' | 'neglected',
  centerX: number,
  centerY: number
) {
  const colors = colorSchemes[quality]
  
  // Draw aura/glow effect
  const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 120)
  gradient.addColorStop(0, colors.aura)
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(centerX - 120, centerY - 120, 240, 240)

  if (stage === 0) {
    // EGG STAGE
    drawEgg(ctx, centerX, centerY, colors)
  } else if (stage === 1) {
    // BABY STAGE
    drawBaby(ctx, centerX, centerY, colors)
  } else {
    // ADULT STAGE
    drawAdult(ctx, centerX, centerY, colors)
  }
}

function drawEgg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colors: typeof colorSchemes.loved
) {
  // Main egg body
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  ctx.ellipse(x, y, 60, 80, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Shine effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.beginPath()
  ctx.ellipse(x - 15, y - 20, 20, 30, -0.3, 0, Math.PI * 2)
  ctx.fill()
  
  // Pattern spots
  ctx.fillStyle = colors.secondary
  ctx.beginPath()
  ctx.arc(x - 20, y - 10, 8, 0, Math.PI * 2)
  ctx.arc(x + 25, y + 15, 10, 0, Math.PI * 2)
  ctx.arc(x - 10, y + 30, 6, 0, Math.PI * 2)
  ctx.fill()
  
  // Glow outline
  ctx.strokeStyle = colors.glow
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(x, y, 60, 80, 0, 0, Math.PI * 2)
  ctx.stroke()
}

function drawBaby(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colors: typeof colorSchemes.loved
) {
  // Body
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  ctx.arc(x, y + 10, 50, 0, Math.PI * 2)
  ctx.fill()
  
  // Head
  ctx.beginPath()
  ctx.arc(x, y - 30, 40, 0, Math.PI * 2)
  ctx.fill()
  
  // Eyes
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(x - 15, y - 35, 5, 0, Math.PI * 2)
  ctx.arc(x + 15, y - 35, 5, 0, Math.PI * 2)
  ctx.fill()
  
  // Eye shine
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(x - 13, y - 37, 2, 0, Math.PI * 2)
  ctx.arc(x + 17, y - 37, 2, 0, Math.PI * 2)
  ctx.fill()
  
  // Smile
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y - 25, 15, 0.2, Math.PI - 0.2)
  ctx.stroke()
  
  // Cute blush
  ctx.fillStyle = colors.secondary
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.arc(x - 25, y - 25, 8, 0, Math.PI * 2)
  ctx.arc(x + 25, y - 25, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  
  // Arms
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  ctx.arc(x - 45, y, 15, 0, Math.PI * 2)
  ctx.arc(x + 45, y, 15, 0, Math.PI * 2)
  ctx.fill()
  
  // Legs
  ctx.beginPath()
  ctx.arc(x - 20, y + 50, 15, 0, Math.PI * 2)
  ctx.arc(x + 20, y + 50, 15, 0, Math.PI * 2)
  ctx.fill()
}

function drawAdult(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colors: typeof colorSchemes.loved
) {
  // Body (larger and more defined)
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  ctx.ellipse(x, y + 15, 55, 65, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Head
  ctx.beginPath()
  ctx.arc(x, y - 40, 45, 0, Math.PI * 2)
  ctx.fill()
  
  // Crown/decoration on head
  ctx.fillStyle = colors.secondary
  ctx.beginPath()
  ctx.moveTo(x - 30, y - 60)
  ctx.lineTo(x - 20, y - 80)
  ctx.lineTo(x - 10, y - 65)
  ctx.lineTo(x, y - 85)
  ctx.lineTo(x + 10, y - 65)
  ctx.lineTo(x + 20, y - 80)
  ctx.lineTo(x + 30, y - 60)
  ctx.closePath()
  ctx.fill()
  
  // Eyes (more detailed)
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(x - 18, y - 45, 6, 0, Math.PI * 2)
  ctx.arc(x + 18, y - 45, 6, 0, Math.PI * 2)
  ctx.fill()
  
  // Eye shine
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(x - 16, y - 47, 3, 0, Math.PI * 2)
  ctx.arc(x + 20, y - 47, 3, 0, Math.PI * 2)
  ctx.fill()
  
  // Confident smile
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x, y - 30, 20, 0.1, Math.PI - 0.1)
  ctx.stroke()
  
  // Blush
  ctx.fillStyle = colors.secondary
  ctx.globalAlpha = 0.4
  ctx.beginPath()
  ctx.arc(x - 30, y - 35, 10, 0, Math.PI * 2)
  ctx.arc(x + 30, y - 35, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  
  // Strong arms
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  ctx.ellipse(x - 60, y + 5, 18, 35, -0.3, 0, Math.PI * 2)
  ctx.ellipse(x + 60, y + 5, 18, 35, 0.3, 0, Math.PI * 2)
  ctx.fill()
  
  // Hands
  ctx.beginPath()
  ctx.arc(x - 70, y + 35, 12, 0, Math.PI * 2)
  ctx.arc(x + 70, y + 35, 12, 0, Math.PI * 2)
  ctx.fill()
  
  // Strong legs
  ctx.beginPath()
  ctx.ellipse(x - 25, y + 70, 15, 30, 0, 0, Math.PI * 2)
  ctx.ellipse(x + 25, y + 70, 15, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Feet
  ctx.beginPath()
  ctx.ellipse(x - 30, y + 95, 18, 10, 0, 0, Math.PI * 2)
  ctx.ellipse(x + 30, y + 95, 18, 10, 0, 0, Math.PI * 2)
  ctx.fill()
}

// Draw stat bars
function drawStatBars(
  ctx: CanvasRenderingContext2D,
  stats: PetStats,
  x: number,
  y: number
) {
  const barWidth = 200
  const barHeight = 20
  const spacing = 30

  const statData = [
    { label: '❤️ Happiness', value: stats.happiness, color: '#FF69B4' },
    { label: '🍔 Hunger', value: 100 - stats.hunger, color: '#FFA500' },
    { label: '⚕️ Health', value: stats.health, color: '#32CD32' }
  ]

  statData.forEach((stat, index) => {
    const yPos = y + index * spacing

    // Label
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(stat.label, x, yPos - 5)

    // Background bar
    ctx.fillStyle = '#E0E0E0'
    ctx.fillRect(x, yPos, barWidth, barHeight)

    // Stat bar
    ctx.fillStyle = stat.color
    const fillWidth = (barWidth * stat.value) / 100
    ctx.fillRect(x, yPos, fillWidth, barHeight)

    // Border
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(x, yPos, barWidth, barHeight)

    // Value text
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 12px Arial'
    ctx.fillText(`${Math.round(stat.value)}%`, x + barWidth + 10, yPos + 15)
  })
}

// Main generation function
export async function generateNFTArt(stats: PetStats): Promise<NFTGenerationResult> {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 1000
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      const quality = getLifeQuality(stats.happiness, stats.hunger, stats.health)
      const colors = colorSchemes[quality]

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGradient.addColorStop(0, colors.bg[0])
      bgGradient.addColorStop(0.5, colors.bg[1])
      bgGradient.addColorStop(1, colors.bg[2])
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add sparkles/particles based on quality
      drawSparkles(ctx, canvas.width, canvas.height, quality)

      // Title
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(stats.name, canvas.width / 2, 60)

      // Evolution stage text
      const stageNames = ['🥚 Egg Stage', '👶 Baby Stage', '👑 Adult Stage']
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = colors.primary
      ctx.fillText(stageNames[stats.evolutionStage], canvas.width / 2, 100)

      // Life quality badge
      const qualityLabels = {
        loved: '💖 Loved & Thriving',
        neutral: '😊 Doing Okay',
        neglected: '😢 Needs Care'
      }
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = colors.secondary
      ctx.fillText(qualityLabels[quality], canvas.width / 2, 130)

      // Draw the pet
      drawPet(ctx, stats.evolutionStage, quality, canvas.width / 2, 350)

      // Draw stat bars
      drawStatBars(ctx, stats, 280, 620)

      // Footer
      ctx.font = 'italic 16px Arial'
      ctx.fillStyle = '#666666'
      ctx.fillText('Evolvagotchi NFT', canvas.width / 2, 780)
      ctx.font = '14px Arial'
      ctx.fillText(`Generated: ${new Date().toLocaleString()}`, canvas.width / 2, 810)

      // Border frame
      ctx.strokeStyle = colors.primary
      ctx.lineWidth = 10
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10)

      // Convert to blob and data URL
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob'))
          return
        }

        const imageUrl = canvas.toDataURL('image/png')
        resolve({ imageUrl, blob })
      }, 'image/png')
    } catch (error) {
      reject(error)
    }
  })
}

// Draw decorative sparkles
function drawSparkles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  quality: 'loved' | 'neutral' | 'neglected'
) {
  const sparkleCount = quality === 'loved' ? 40 : quality === 'neutral' ? 20 : 10
  const colors = colorSchemes[quality]

  for (let i = 0; i < sparkleCount; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = Math.random() * 4 + 2

    ctx.fillStyle = colors.glow
    ctx.globalAlpha = Math.random() * 0.5 + 0.3
    
    // Draw star shape
    ctx.beginPath()
    ctx.moveTo(x, y - size)
    ctx.lineTo(x + size * 0.3, y - size * 0.3)
    ctx.lineTo(x + size, y)
    ctx.lineTo(x + size * 0.3, y + size * 0.3)
    ctx.lineTo(x, y + size)
    ctx.lineTo(x - size * 0.3, y + size * 0.3)
    ctx.lineTo(x - size, y)
    ctx.lineTo(x - size * 0.3, y - size * 0.3)
    ctx.closePath()
    ctx.fill()
  }
  
  ctx.globalAlpha = 1
}
