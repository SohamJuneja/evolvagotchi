# 🎯 Next Phase: Death/Revival & AI Health Advisor

## Phase 1: Death/Revival System ☠️💚

### Smart Contract Changes Needed
```solidity
// Add to Evolvagotchi.sol
bool public isDead;
uint256 public deathTimestamp;
uint256 constant REVIVAL_COST = 0.005 ether;

function checkDeath() internal {
    if (health == 0 && !isDead) {
        isDead = true;
        deathTimestamp = block.timestamp;
        emit PetDied(tokenId, block.timestamp);
    }
}

function revive(uint256 tokenId) public payable {
    require(msg.value >= REVIVAL_COST, "Insufficient revival fee");
    require(isDead, "Pet is not dead");
    
    isDead = false;
    health = 50;  // Revival with partial health
    happiness = 30;
    hunger = 50;
    
    emit PetRevived(tokenId, block.timestamp);
}
```

### Frontend Features
1. **Death Detection**: Automatic when health reaches 0
2. **Ghost Visual**: Pet emoji changes to 👻
3. **Revival Button**: Pay 0.005 STT to revive
4. **Death Screen**: Special overlay with revival option
5. **History Logging**: Log death and revival events
6. **Stats Frozen**: No decay while dead

## Phase 2: AI Health Advisor 🤖❤️

### Proactive Guidance System
```typescript
interface HealthPrediction {
  urgency: 'critical' | 'warning' | 'info' | 'good'
  message: string
  icon: string
  timeframe?: string
  action?: string
}

function analyzeHealth(stats: PetStats): HealthPrediction {
  // Critical: Death imminent
  if (stats.health <= 20 && stats.hunger >= 80) {
    return {
      urgency: 'critical',
      message: '⚠️ CRITICAL: Your pet will die soon!',
      timeframe: 'within 5 minutes',
      action: 'Feed immediately and update stats!'
    }
  }
  
  // Warning: Health declining
  if (stats.hunger >= 70) {
    return {
      urgency: 'warning',
      message: '⚠️ High hunger will damage health!',
      timeframe: 'within 2 hours',
      action: 'Feed your pet soon'
    }
  }
  
  // Info: Evolution coming
  if (canEvolve(stats)) {
    return {
      urgency: 'info',
      message: '✨ Your pet is ready to evolve!',
      action: 'Update stats to trigger evolution'
    }
  }
  
  // Good: Everything fine
  return {
    urgency: 'good',
    message: '✅ Your pet is healthy and happy!',
    icon: '😊'
  }
}
```

### UI Components
1. **Health Advisor Panel**: Always-visible widget
2. **Prediction Card**: Shows upcoming events
3. **Action Buttons**: Quick fixes (feed/play/update)
4. **Timeline Forecast**: "In 2 hours, hunger will be 85"
5. **Smart Notifications**: Browser notifications for critical events

### Prediction Types
- 🚨 Death warning (health + hunger calculation)
- ✨ Evolution prediction (age + happiness check)
- 📉 Stat decay forecast (time-based)
- 🎯 Optimal action timing
- 📊 Health trend analysis

## Implementation Order

### Step 1: Update Smart Contract (15 mins)
- Add death tracking
- Add revival function
- Deploy new contract

### Step 2: Death/Revival Frontend (30 mins)
- Death detection in useEffect
- Ghost visual state
- Revival button + transaction
- Death overlay UI
- History logging

### Step 3: AI Health Advisor Service (20 mins)
- Create `healthAdvisor.ts` service
- Implement prediction algorithm
- Time-based forecasting
- Urgency classification

### Step 4: Health Advisor UI (25 mins)
- Create HealthAdvisor component
- Prediction cards
- Action buttons
- Auto-refresh every 30s
- Critical alerts

### Step 5: Integration & Testing (10 mins)
- Add to PetDetail
- Test all scenarios
- Polish animations
- Documentation

## Total Implementation Time
~1.5 - 2 hours for complete system

---

Ready to start with Death/Revival System? 
This will make your Evolvagotchi much more engaging! 🎮
