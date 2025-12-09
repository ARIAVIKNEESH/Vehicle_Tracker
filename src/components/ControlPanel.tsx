import React from 'react';
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ControlPanelProps {
  isPlaying: boolean;
  progress: number;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  progress,
  playbackSpeed,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="icon"
            onClick={isPlaying ? onPause : onPlay}
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            className="h-10 w-10 rounded-full border-border/50 hover:bg-secondary transition-all hover:scale-105"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 mx-4">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-100 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Gauge className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground w-16">Speed</span>
        <Slider
          value={[playbackSpeed]}
          onValueChange={([value]) => onSpeedChange(value)}
          min={0.5}
          max={4}
          step={0.5}
          className="flex-1"
        />
        <span className="text-sm font-mono text-primary w-12 text-right">{playbackSpeed}x</span>
      </div>
    </div>
  );
};

export default ControlPanel;
