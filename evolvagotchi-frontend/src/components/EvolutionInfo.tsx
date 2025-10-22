import { Clock, Heart, Sparkles, TrendingUp } from 'lucide-react'

export function EvolutionInfo() {
  return (
    <div className="evolution-info">
      <h2>📖 Evolution Guide</h2>
      
      <div className="info-card">
        <h3>🎯 How Evolution Works</h3>
        <p>Your Evolvagotchi evolves through 4 stages based on age, happiness, and health. Evolution happens automatically on-chain when conditions are met!</p>
      </div>

      <div className="evolution-stages">
        <div className="stage-card egg">
          <div className="stage-icon">🥚</div>
          <h4>Egg</h4>
          <p>Your journey begins!</p>
          <div className="stage-requirements">
            <span className="req">⏱️ Starting stage</span>
          </div>
        </div>

        <div className="arrow">→</div>

        <div className="stage-card baby">
          <div className="stage-icon">🐣</div>
          <h4>Baby</h4>
          <p>Your pet hatches</p>
          <div className="stage-requirements">
            <span className="req"><Clock size={14} /> Age: ~1.1 hours</span>
            <span className="req-detail">25,000 blocks</span>
          </div>
        </div>

        <div className="arrow">→</div>

        <div className="stage-card teen">
          <div className="stage-icon">🦖</div>
          <h4>Teen</h4>
          <p>Growing stronger</p>
          <div className="stage-requirements">
            <span className="req"><Clock size={14} /> Age: ~4.3 hours</span>
            <span className="req-detail">100,000 blocks</span>
            <span className="req"><Sparkles size={14} /> Happiness: ≥60</span>
          </div>
        </div>

        <div className="arrow">→</div>

        <div className="stage-card adult">
          <div className="stage-icon">🐲</div>
          <h4>Adult</h4>
          <p>Fully evolved!</p>
          <div className="stage-requirements">
            <span className="req"><Clock size={14} /> Age: ~13 hours</span>
            <span className="req-detail">300,000 blocks</span>
            <span className="req"><Sparkles size={14} /> Happiness: ≥60</span>
            <span className="req"><Heart size={14} /> Health: ≥80</span>
          </div>
        </div>
      </div>

      <div className="mechanics-grid">
        <div className="mechanic-card">
          <h4><TrendingUp size={18} /> Stat Decay</h4>
          <ul>
            <li><strong>Hunger</strong> increases by 1 every 500 blocks (~78 seconds)</li>
            <li><strong>Happiness</strong> decreases by 1 every 1000 blocks (~2.6 minutes)</li>
            <li><strong>Health</strong> decreases if hunger &gt; 80</li>
            <li><strong>Health</strong> recovers if hunger &lt; 30 and happiness &gt; 70</li>
          </ul>
        </div>

        <div className="mechanic-card">
          <h4><Sparkles size={18} /> Interactions</h4>
          <ul>
            <li><strong>Feed</strong> (0.001 STT): -40 hunger, +15 happiness</li>
            <li><strong>Play</strong> (Free): +25 happiness</li>
            <li><strong>Update Stats</strong> (Free): Syncs stats with blockchain</li>
          </ul>
        </div>
      </div>

      <div className="info-card tips">
        <h4>💡 Pro Tips</h4>
        <ul>
          <li>Keep happiness above 60 to enable Teen and Adult evolution</li>
          <li>Feed regularly to prevent health damage from high hunger</li>
          <li>Play with your pet - it's free and boosts happiness!</li>
          <li>Evolution happens automatically during any interaction</li>
          <li>Stats update autonomously based on Somnia's high-speed blockchain</li>
        </ul>
      </div>

      <div className="info-card technical">
        <h4>🤖 AI Agent Technology</h4>
        <p>
          Evolvagotchi uses <strong>autonomous on-chain logic</strong> - your pet's stats decay automatically 
          based on block time, not user actions. The smart contract calculates time passed since the last 
          update and adjusts stats accordingly. This creates a living, breathing companion that exists 
          entirely on-chain without any centralized backend!
        </p>
        <p className="somnia-info">
          <strong>Optimized for Somnia:</strong> With ~6 blocks per second, your pet experiences time 
          much faster than traditional blockchains. Perfect for quick demos and active gameplay!
        </p>
      </div>
    </div>
  )
}