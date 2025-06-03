import { useRef } from 'react';
import type { TimelineProps } from './types';
import './Timeline.css';

const Timeline = ({ frames, currentFrame, onFrameSelect, onAddFrame }: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.WheelEvent) => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="timeline-container">
      <div
        ref={timelineRef}
        className="timeline-frames"
        onWheel={handleScroll}
      >
        {frames.map((frame, index) => (
          <button
            key={frame.id}
            className={`timeline-frame ${
              currentFrame === index
                ? 'timeline-frame-current'
                : 'timeline-frame-default'
            }`}
            onClick={() => onFrameSelect(index)}
          >
            <div className="timeline-frame-title">
              Frame {index + 1}
            </div>
            <div className="timeline-frame-info">
              {Object.keys(frame.objects).length} objects
            </div>
          </button>
        ))}

        {onAddFrame && (
          <button
            className="timeline-add-frame"
            onClick={onAddFrame}
          >
            <svg
              className="timeline-add-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="timeline-add-label">Add Frame</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Timeline; 