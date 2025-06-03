import { useState, useEffect, useCallback } from 'react';
import type { PlaybackControlsProps } from './types';
import './PlaybackControls.css';

const ANIMATION_DURATION = 1000; // Duration in milliseconds

const PlaybackControls = ({
  currentFrame,
  totalFrames,
  onFrameChange,
  onAnimationStart,
  onAnimationEnd,
}: PlaybackControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const advanceFrame = useCallback(async () => {
    if (currentFrame < totalFrames - 1 && !isAnimating) {
      setIsAnimating(true);
      onAnimationStart?.(currentFrame, currentFrame + 1);
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION));
      
      onFrameChange(currentFrame + 1);
      setIsAnimating(false);
      onAnimationEnd?.();
    } else if (currentFrame >= totalFrames - 1) {
      setIsPlaying(false);
    }
  }, [currentFrame, totalFrames, onFrameChange, isAnimating, onAnimationStart, onAnimationEnd]);

  useEffect(() => {
    if (isPlaying && !isAnimating) {
      const timeoutId = setTimeout(advanceFrame, 100); // Small delay between frames
      return () => clearTimeout(timeoutId);
    }
  }, [isPlaying, advanceFrame, isAnimating]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="playback-controls">
      <button
        className="playback-button"
        onClick={() => onFrameChange(0)}
        disabled={currentFrame === 0 || isAnimating}
      >
        <svg
          className="playback-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        className="playback-button"
        onClick={() => onFrameChange(Math.max(0, currentFrame - 1))}
        disabled={currentFrame === 0 || isAnimating}
      >
        <svg
          className="playback-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        className="playback-button"
        onClick={handlePlayPause}
        disabled={isAnimating && !isPlaying}
      >
        {isPlaying ? (
          <svg
            className="playback-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 9v6m4-6v6"
            />
          </svg>
        ) : (
          <svg
            className="playback-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          </svg>
        )}
      </button>

      <button
        className="playback-button"
        onClick={() => onFrameChange(Math.min(totalFrames - 1, currentFrame + 1))}
        disabled={currentFrame === totalFrames - 1 || isAnimating}
      >
        <svg
          className="playback-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <button
        className="playback-button"
        onClick={() => onFrameChange(totalFrames - 1)}
        disabled={currentFrame === totalFrames - 1 || isAnimating}
      >
        <svg
          className="playback-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </button>

      <div className="playback-info">
        Frame {currentFrame + 1} of {totalFrames}
      </div>
    </div>
  );
};

export default PlaybackControls; 