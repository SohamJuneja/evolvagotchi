import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // For demo purposes - move to backend in production
})

export interface PetContext {
  name: string
  evolutionStage: number
  happiness: number
  hunger: number
  health: number
  age: number
  interaction: 'feed' | 'play' | 'greet' | 'evolve' | 'chat'
  userMessage?: string
}

const STAGE_NAMES = ['Egg', 'Baby', 'Teen', 'Adult']

const PERSONALITY_PROMPTS = {
  0: `You are a mysterious egg, about to hatch. You communicate with soft vibrations and gentle pulses of warmth. Keep responses very short (1-2 sentences) and mystical.`,
  
  1: `You are a baby Evolvagotchi - innocent, excitable, and full of wonder. You see everything for the first time and express emotions openly with simple words. Use emojis like 🥺, 😊, 🎉. Keep responses SHORT (1-2 sentences) and childlike.`,
  
  2: `You are a teenage Evolvagotchi - curious, energetic, but sometimes moody. You're discovering your personality and can be dramatic or sarcastic when neglected, but loving when cared for. Use emojis like 😎, 😤, 💪. Keep responses 2-3 sentences.`,
  
  3: `You are a fully evolved adult Evolvagotchi - wise, loyal, and protective of your trainer. You speak with maturity and gratitude, remembering all the care you've received. Use emojis like 🐲, ✨, 💎. Keep responses 2-3 sentences but thoughtful.`,
}

function buildPrompt(context: PetContext): string {
  const { name, evolutionStage, happiness, hunger, health, interaction, userMessage } = context
  const stage = STAGE_NAMES[evolutionStage]
  const personalityBase = PERSONALITY_PROMPTS[evolutionStage as keyof typeof PERSONALITY_PROMPTS]

  let situationContext = ''
  
  // Analyze pet's current state
  if (hunger > 80) {
    situationContext = 'You are VERY HUNGRY and feel weak. '
  } else if (hunger > 50) {
    situationContext = 'You are getting hungry. '
  }

  if (happiness < 20) {
    situationContext += 'You feel very sad and neglected. '
  } else if (happiness < 50) {
    situationContext += 'You are feeling a bit down. '
  } else if (happiness > 80) {
    situationContext += 'You are very happy and energetic! '
  }

  if (health < 30) {
    situationContext += 'You feel sick and unwell. '
  }

  // Interaction-specific context
  let interactionContext = ''
  switch (interaction) {
    case 'feed':
      interactionContext = 'Your trainer just fed you. React with gratitude and describe how you feel. '
      break
    case 'play':
      interactionContext = 'Your trainer just played with you. React with joy and excitement. '
      break
    case 'greet':
      interactionContext = 'Your trainer just opened your profile. Greet them warmly and let them know how you are feeling. '
      break
    case 'evolve':
      interactionContext = `You just evolved from ${STAGE_NAMES[evolutionStage - 1]} to ${stage}! Express your excitement and transformation. This is a HUGE moment! `
      break
    case 'chat':
      interactionContext = `Your trainer said: "${userMessage}". Respond naturally to what they said. `
      break
  }

  const fullPrompt = `${personalityBase}

Your name is ${name}. You are currently a ${stage} stage Evolvagotchi.

Current stats:
- Happiness: ${happiness}/100
- Hunger: ${hunger}/100  
- Health: ${health}/100

${situationContext}
${interactionContext}

IMPORTANT: 
- Stay in character as a ${stage}
- Keep response SHORT and emotional
- Be authentic to your current feelings (happy, sad, hungry, etc.)
- NO explanations, just respond as the pet would
- Use 1-2 emojis maximum

Respond now:`

  return fullPrompt
}

export async function getPetResponse(context: PetContext): Promise<string> {
  try {
    const prompt = buildPrompt(context)
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI-powered virtual pet in a blockchain game. Respond naturally and emotionally based on your current state and evolution stage. Keep responses concise and in-character.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Fast Groq model
      temperature: 0.9, // High creativity for personality
      max_tokens: 100,
    })

    const response = completion.choices[0]?.message?.content || 'Pet is thinking...'
    return response.trim()
  } catch (error) {
    console.error('Groq API error:', error)
    return '💭 *Pet is deep in thought...*'
  }
}

// Fallback responses if API fails
export const FALLBACK_RESPONSES = {
  feed: {
    0: '✨ *The egg glows warmly* ✨',
    1: 'Yummy yummy! 😋 Thank you!',
    2: 'Finally! I was starving! 😤',
    3: 'Your care sustains me. Thank you, trainer. 🙏',
  },
  play: {
    0: '✨ *The egg wiggles happily* ✨',
    1: 'Yay! This is so fun! 🎉',
    2: 'Now this is what I am talking about! 💪',
    3: 'It is good to bond with you, old friend. ✨',
  },
  greet: {
    0: '✨ *A presence stirs within* ✨',
    1: 'Hi hi! I missed you! 🥺',
    2: 'Oh, you are finally here! 😎',
    3: 'Welcome back, trainer. I have been waiting. 🐲',
  },
}