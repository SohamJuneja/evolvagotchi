import { useState } from 'react'
import { FastForward, Zap, RotateCcw } from 'lucide-react'

interface DemoControlsProps {
  onAdvanceTime: (blocks: number) => void
  onForceEvolve: () => void
  onAdjustStats: (happiness: number, hunger: number, health: number) => void
  onReset: () => void
  enabled: boolean
  onToggle: () => void
}

export function DemoControls({
  onAdvanceTime,
  onForceEvolve,
  onAdjustStats,
  onReset,
  enabled,
  onToggle,
}: DemoControlsProps) {
  const [blocksToAdvance, setBlocksToAdvance] = useState('5000')

  const handleAdvance = () => {
    const blocks = Math.max(0, parseInt(blocksToAdvance || '0', 10))
    if (blocks > 0) {
      onAdvanceTime(blocks)
    }
  }

  return (
    <div className="demo-sidebar">
      <div className="demo-header">
        <h3>🎮 Demo Mode</h3>
        <label className="switch">
          <input type="checkbox" checked={enabled} onChange={onToggle} />
          <span className="slider"></span>
        </label>
      </div>

      {enabled && (
        <>
          <p className="demo-description">
            Control time and stats for demonstration. Changes are temporary and reset on page refresh.
          </p>

          <div className="demo-section">
            <h4>⏱️ Time Travel</h4>
            <div className="demo-group">
              <label htmlFor="blocks">Advance Blocks:</label>
              <input
                id="blocks"
                type="number"
                value={blocksToAdvance}
                onChange={(e) => setBlocksToAdvance(e.target.value)}
                className="input-small"
                min="1"
                placeholder="5000"
              />
              <button className="btn btn-demo" onClick={handleAdvance}>
                <FastForward size={16} />
                Advance
              </button>
            </div>
            <div className="demo-hints">
              <small>💡 Suggestions:</small>
              <div className="demo-chips">
                <button onClick={() => { setBlocksToAdvance('5000'); onAdvanceTime(5000); }}>
                  +14 min
                </button>
                <button onClick={() => { setBlocksToAdvance('25000'); onAdvanceTime(25000); }}>
                  +1.2 hr
                </button>
                <button onClick={() => { setBlocksToAdvance('100000'); onAdvanceTime(100000); }}>
                  +4.6 hr
                </button>
              </div>
            </div>
          </div>

          <div className="demo-section">
            <h4>✨ Quick Actions</h4>
            <button className="btn btn-demo btn-evolve" onClick={onForceEvolve}>
              <Zap size={16} />
              Force Evolution
            </button>
          </div>

          <div className="demo-section">
            <h4>🎯 Preset Stats</h4>
            <div className="demo-presets">
              <button
                className="preset-btn happy"
                onClick={() => onAdjustStats(100, 0, 100)}
              >
                😊 Perfect
                <small>H:100 Hg:0 Ht:100</small>
              </button>
              <button
                className="preset-btn sad"
                onClick={() => onAdjustStats(30, 80, 50)}
              >
                😢 Sad
                <small>H:30 Hg:80 Ht:50</small>
              </button>
              <button
                className="preset-btn ready"
                onClick={() => onAdjustStats(70, 20, 90)}
              >
                ✅ Ready to Evolve
                <small>H:70 Hg:20 Ht:90</small>
              </button>
            </div>
          </div>

          <button className="btn btn-reset" onClick={onReset}>
            <RotateCcw size={16} />
            Reset to Real Stats
          </button>
        </>
      )}

      {!enabled && (
        <p className="demo-disabled">
          Enable demo mode to simulate time passing and adjust stats for presentations.
        </p>
      )}
    </div>
  )
}