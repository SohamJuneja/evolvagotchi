import express from 'express'
import Replicate from 'replicate'
import cors from 'cors'
import 'dotenv/config'

const app = express()
const PORT = 3001

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174']
}))

app.use(express.json())

// Initialize Replicate client
// Note: Backend uses REPLICATE_API_TOKEN (no VITE_ prefix)
// Frontend uses VITE_REPLICATE_API_TOKEN (Vite-only variable)
const apiToken = process.env.REPLICATE_API_TOKEN
if (!apiToken) {
  console.error('❌ ERROR: REPLICATE_API_TOKEN not found in environment variables')
  console.error('   Please ensure .env file exists with: REPLICATE_API_TOKEN=your_token')
  process.exit(1)
}

console.log('✅ REPLICATE_API_TOKEN loaded:', apiToken.substring(0, 10) + '...')

const replicate = new Replicate({
  auth: apiToken,
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Generate NFT art endpoint
app.post('/api/generate-art', async (req, res) => {
  try {
    const { prompt, negativePrompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    console.log('Generating art with prompt:', prompt)

    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt,
          negative_prompt: negativePrompt || 'blurry, low quality, distorted, ugly, watermark, text, signature, duplicate, deformed',
          width: 512,
          height: 512,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    )

    if (output && output.length > 0) {
      res.json({ imageUrl: output[0] })
    } else {
      res.status(500).json({ error: 'No image generated' })
    }
  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to generate art',
      details: error.toString()
    })
  }
})

app.listen(PORT, () => {
  console.log(`🎨 NFT Art API running on http://localhost:${PORT}`)
  console.log(`✅ CORS enabled for http://localhost:5173 and http://localhost:5174`)
})
