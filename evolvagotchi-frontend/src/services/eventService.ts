import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

export interface GameEvent {
  id: string
  type: 'treasure' | 'encounter' | 'weather' | 'mood' | 'milestone'
  title: string
  description: string
  effect: {
    happiness?: number
    hunger?: number
    health?: number
  }
  timestamp: Date
}

interface EventContext {
  name: string
  evolutionStage: number
  happiness: number
  hunger: number
  health: number
  age: number
}

const EVENT_TEMPLATES = {
  treasure: [
    'found a shiny crystal',
    'discovered a hidden treasure',
    'stumbled upon a rare gem',
    'uncovered an ancient artifact',
  ],
  encounter: [
    'met a friendly creature',
    'spotted a mysterious shadow',
    'heard strange noises',
    'found interesting tracks',
  ],
  weather: [
    'a rainbow appeared',
    'gentle rain started falling',
    'stars are extra bright tonight',
    'warm sunshine fills the area',
  ],
  mood: [
    'feels extra energetic today',
    'is feeling contemplative',
    'wants to explore',
    'is feeling playful',
  ],
  milestone: [
    'learned a new trick',
    'grew stronger',
    'made a new discovery',
    'reached a new understanding',
  ],
}

const STAGE_NAMES = ['Egg', 'Baby', 'Teen', 'Adult']

async function generateAIEvent(context: EventContext): Promise<GameEvent | null> {
  try {
    // Determine event type based on pet state
    let eventType: keyof typeof EVENT_TEMPLATES
    
    if (context.happiness < 50) {
      eventType = Math.random() > 0.5 ? 'treasure' : 'mood'
    } else if (context.hunger > 70) {
      eventType = 'encounter'
    } else {
      const types: Array<keyof typeof EVENT_TEMPLATES> = ['treasure', 'encounter', 'weather', 'mood', 'milestone']
      eventType = types[Math.floor(Math.random() * types.length)]
    }

    const stage = STAGE_NAMES[context.evolutionStage]

    const prompt = `You are generating a random event for an Evolvagotchi named ${context.name}, who is a ${stage}.

Current state:
- Happiness: ${context.happiness}/100
- Hunger: ${context.hunger}/100
- Health: ${context.health}/100

Generate a SHORT, fun, and contextual ${eventType} event. The event should:
1. Be 1-2 sentences
2. Match the pet's evolution stage (${stage})
3. Feel natural and engaging
4. Include the effect it has (positive or negative)

Format EXACTLY as JSON:
{
  "title": "Event Title",
  "description": "What happened to ${context.name}",
  "effect": {
    "happiness": number or null,
    "hunger": number or null,
    "health": number or null
  }
}

Example for Baby stage treasure event:
{
  "title": "Shiny Discovery!",
  "description": "${context.name} found a sparkling crystal and played with it all day! So much fun!",
  "effect": {
    "happiness": 15,
    "hunger": 5,
    "health": null
  }
}

Generate the event now (JSON only, no extra text):`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI event generator for a virtual pet game. Generate engaging, contextual events in valid JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 200,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const eventData = JSON.parse(jsonMatch[0])

    const event: GameEvent = {
      id: Date.now().toString(),
      type: eventType,
      title: eventData.title || 'Something Happened!',
      description: eventData.description || `${context.name} experienced something interesting!`,
      effect: {
        happiness: eventData.effect?.happiness || 0,
        hunger: eventData.effect?.hunger || 0,
        health: eventData.effect?.health || 0,
      },
      timestamp: new Date(),
    }

    return event
  } catch (error) {
    console.error('Error generating AI event:', error)
    return null
  }
}

// Fallback events if AI fails
function generateFallbackEvent(context: EventContext): GameEvent {
  const types: Array<keyof typeof EVENT_TEMPLATES> = ['treasure', 'encounter', 'weather', 'mood', 'milestone']
  const type = types[Math.floor(Math.random() * types.length)]
  const templates = EVENT_TEMPLATES[type]
  const template = templates[Math.floor(Math.random() * templates.length)]

  const effects: Record<string, { happiness?: number; hunger?: number; health?: number }> = {
    treasure: { happiness: 15, hunger: 5 },
    encounter: { happiness: 10 },
    weather: { happiness: 8 },
    mood: { happiness: 12 },
    milestone: { happiness: 20, health: 5 },
  }

  return {
    id: Date.now().toString(),
    type,
    title: type.charAt(0).toUpperCase() + type.slice(1) + '!',
    description: `${context.name} ${template}!`,
    effect: effects[type],
    timestamp: new Date(),
  }
}

export async function triggerRandomEvent(context: EventContext): Promise<GameEvent> {
  // Try AI generation first
  const aiEvent = await generateAIEvent(context)
  
  if (aiEvent) {
    return aiEvent
  }

  // Fallback to template-based events
  return generateFallbackEvent(context)
}

// Check if enough time has passed for a new event
export function shouldTriggerEvent(lastEventTime: number | null): boolean {
  if (!lastEventTime) return true
  
  const MIN_TIME_BETWEEN_EVENTS = 2 * 60 * 1000 // 2 minutes
  const timeSinceLastEvent = Date.now() - lastEventTime
  
  return timeSinceLastEvent >= MIN_TIME_BETWEEN_EVENTS
}

// Calculate chance of event based on pet activity
export function getEventChance(interactionCount: number): number {
  // More interactions = higher chance of events
  const baseChance = 0.3 // 30% base chance
  const bonusChance = Math.min(interactionCount * 0.05, 0.4) // Up to +40%
  
  return Math.min(baseChance + bonusChance, 0.8) // Max 80% chance
}