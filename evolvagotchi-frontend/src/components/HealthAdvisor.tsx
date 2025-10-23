import { useEffect, useState } from 'react'
import { AlertTriangle, Info, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { analyzeHealth, getOptimalAction, getHealthTrend, type PetStats, type HealthPrediction } from '../services/healthAdvisor'

interface HealthAdvisorProps {
  stats: PetStats
  onAction?: (action: string) => void
}

export function HealthAdvisor({ stats, onAction }: HealthAdvisorProps) {
  const [predictions, setPredictions] = useState<HealthPrediction[]>([])
  const [optimalAction, setOptimalAction] = useState<string>('')
  const [healthTrend, setHealthTrend] = useState<'improving' | 'declining' | 'stable'>('stable')

  // Auto-refresh predictions every 30 seconds
  useEffect(() => {
    const analyze = () => {
      const newPredictions = analyzeHealth(stats)
      setPredictions(newPredictions)
      setOptimalAction(getOptimalAction(stats))
      setHealthTrend(getHealthTrend(stats))
    }

    analyze()
    const interval = setInterval(analyze, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [stats])

  const getUrgencyIcon = (urgency: HealthPrediction['urgency']) => {
    switch (urgency) {
      case 'critical':
        return <AlertTriangle size={20} className="urgency-icon critical" />
      case 'warning':
        return <AlertTriangle size={20} className="urgency-icon warning" />
      case 'info':
        return <Info size={20} className="urgency-icon info" />
      case 'good':
        return <CheckCircle size={20} className="urgency-icon good" />
    }
  }

  const getTrendIcon = () => {
    switch (healthTrend) {
      case 'improving':
        return <TrendingUp size={16} color="#4caf50" />
      case 'declining':
        return <TrendingDown size={16} color="#f44336" />
      case 'stable':
        return <Minus size={16} color="#9e9e9e" />
    }
  }

  const getTrendText = () => {
    switch (healthTrend) {
      case 'improving':
        return 'Improving'
      case 'declining':
        return 'Declining'
      case 'stable':
        return 'Stable'
    }
  }

  const handleActionClick = (action?: string) => {
    if (action && onAction) {
      onAction(action)
    }
  }

  return (
    <div className="health-advisor">
      <div className="advisor-header">
        <h3>🤖 AI Health Advisor</h3>
        <div className="health-trend">
          {getTrendIcon()}
          <span className={`trend-text ${healthTrend}`}>{getTrendText()}</span>
        </div>
      </div>

      <div className="optimal-action">
        <span className="action-label">Recommended:</span>
        <span className="action-text">{optimalAction}</span>
      </div>

      <div className="predictions-list">
        {predictions.map((prediction, index) => (
          <div key={index} className={`prediction-card ${prediction.urgency}`}>
            <div className="prediction-header">
              {getUrgencyIcon(prediction.urgency)}
              <div className="prediction-content">
                <div className="prediction-message">
                  <span className="prediction-icon">{prediction.icon}</span>
                  {prediction.message}
                </div>
                {prediction.timeframe && (
                  <div className="prediction-timeframe">
                    ⏰ {prediction.timeframe}
                  </div>
                )}
              </div>
            </div>
            
            {prediction.details && (
              <div className="prediction-details">
                {prediction.details}
              </div>
            )}
            
            {prediction.action && (
              <div className="prediction-action">
                <button 
                  className="action-button"
                  onClick={() => handleActionClick(prediction.action)}
                >
                  {prediction.action}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="advisor-footer">
        <small>🔄 Auto-updates every 30 seconds</small>
      </div>
    </div>
  )
}
