import { Line, Rect } from 'react-konva';
import type { FieldMarkingsProps } from './types';

const FieldMarkings = ({ fieldConfig }: FieldMarkingsProps) => {
  const { width, height, endZoneDepth } = fieldConfig.dimensions;
  const isVertical = fieldConfig.orientation === 'vertical';
  
  // Calculate full field dimensions based on portion and orientation
  const getFullFieldDimensions = () => {
    const fullWidth = isVertical ? width : width * getPortionMultiplier();
    const fullHeight = isVertical ? height * getPortionMultiplier() : height;
    return { fullWidth, fullHeight };
  };

  // Get multiplier based on portion
  const getPortionMultiplier = () => {
    switch (fieldConfig.portion) {
      case 'half':
        return 2;
      case 'quarter':
        return 4;
      case 'three-quarters':
        return 4/3;
      default:
        return 1;
    }
  };

  // Helper function to get line points based on orientation
  const getEndZoneLine = (distance: number) => {
    getFullFieldDimensions(); // Call to maintain consistency but we don't need the values
    return isVertical
      ? [0, distance, width, distance] // Horizontal line for vertical field
      : [distance, 0, distance, height]; // Vertical line for horizontal field
  };

  const getCenterLine = () => {
    const { fullWidth, fullHeight } = getFullFieldDimensions();
    if (isVertical) {
      const centerY = fullHeight / 2;
      // Only show center line if it falls within our portion
      if (centerY > height) return null;
      return [0, centerY, width, centerY]; // Horizontal line for vertical field
    } else {
      const centerX = fullWidth / 2;
      // Only show center line if it falls within our portion
      if (centerX > width) return null;
      return [centerX, 0, centerX, height]; // Vertical line for horizontal field
    }
  };

  // Get all end zone lines that should be visible in this portion
  const getVisibleEndZoneLines = () => {
    const { fullWidth, fullHeight } = getFullFieldDimensions();
    const lines = [];
    
    if (isVertical) {
      // Add end zone lines from the top down
      const positions = [endZoneDepth, fullHeight - endZoneDepth];
      for (const pos of positions) {
        if (pos <= height) {
          lines.push(getEndZoneLine(pos));
        }
      }
    } else {
      // Add end zone lines from left to right
      const positions = [endZoneDepth, fullWidth - endZoneDepth];
      for (const pos of positions) {
        if (pos <= width) {
          lines.push(getEndZoneLine(pos));
        }
      }
    }
    
    return lines;
  };

  const endZoneLines = getVisibleEndZoneLines();
  const centerLine = getCenterLine();

  return (
    <>
      {/* Background rect that will pass through click events */}
      <Rect
        width={width}
        height={height}
        fill="#4CAF50"
        opacity={1}
        listening={false}
      />
      
      {/* Field lines */}
      <Line
        points={[0, 0, width, 0, width, height, 0, height, 0, 0]}
        stroke="#FFFFFF"
        strokeWidth={0}
        opacity={1}
        listening={false}
      />
      
      {/* End zones */}
      {endZoneLines.map((points, index) => (
        <Line
          key={`endzone-${index}`}
          points={points}
          stroke="#FFFFFF"
          strokeWidth={0.5}
          opacity={1}
          listening={false}
        />
      ))}
      
      {/* Center line */}
      {centerLine && (
        <Line
          points={centerLine}
          stroke="#FFFFFF"
          strokeWidth={0.25}
          opacity={0.5}
          listening={false}
        />
      )}
    </>
  );
};

export default FieldMarkings; 