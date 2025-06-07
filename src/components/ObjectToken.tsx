import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Circle, Group, Line, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import type { ObjectTokenProps } from './types';

const ANIMATION_DURATION = 0.3; // Duration in seconds

const getTokenColor = (type: string): string => {
  switch (type) {
    case 'O':
      return '#3182CE'; // Blue for offense
    case 'X':
      return '#E53E3E'; // Red for defense
    case 'D':
      return '#FFFFFF'; // White for disc
    case 'C':
      return '#ED8936'; // Orange for cone
    default:
      return '#FFFFFF';
  }
};

const ObjectToken: React.FC<ObjectTokenProps> = ({
  object,
  position,
  previousPosition,
  isSelected,
  fieldConfig,
  isReadOnly = false,
  isAnimating = false,
  nextPosition,
  isPrevious = false,
  onSelect,
  onDeselect,
  onDragEnd,
  onControlPointChange,
  controlPoint
}) => {
  const { width: fieldWidth, height: fieldHeight } = fieldConfig.dimensions;
  const groupRef = useRef<Konva.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState(position);
  const [controlPointDragPos, setControlPointDragPos] = useState<{ x: number; y: number } | null>(null);
  const animationRef = useRef<Konva.Animation | null>(null);

  // Token dimensions
  const tokenRadius = (isPrevious ? 0.75 : 1) * fieldWidth / 100; // Base radius in field units
  const fontSize = fieldWidth / 100; // Font size in field units
  const strokeWidth = fieldWidth / 200; // Stroke width in field units
  const controlPointRadius = fieldWidth / 150; // Control point radius in field units

  // Selection indicator
  const selectionRadius = tokenRadius * 1.2;

  // Update drag position when position changes
  useEffect(() => {
    setDragPos(position);
  }, [position]);

  // Handle animation when nextPosition changes
  useEffect(() => {
    if (!isAnimating || !nextPosition || !groupRef.current) return;

    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const startPos = { x: position.x * fieldWidth, y: position.y * fieldHeight };
    const endPos = { x: nextPosition.x * fieldWidth, y: nextPosition.y * fieldHeight };

    const startTime = Date.now();
    const duration = ANIMATION_DURATION * 1000; // Convert to milliseconds

    // Create a new animation
    const anim = new Konva.Animation((frame) => {
      if (!frame || !groupRef.current) return;
      
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // Linear interpolation with easing
      const newX = startPos.x + (endPos.x - startPos.x) * easeT;
      const newY = startPos.y + (endPos.y - startPos.y) * easeT;
      
      // Update position
      groupRef.current.x(newX);
      groupRef.current.y(newY);

      // Stop animation when complete
      if (t >= 1) {
        anim.stop();
        return false;
      }
      return true;
    });

    // Start the animation
    anim.start();
    animationRef.current = anim;

    // Cleanup
    return () => {
      anim.stop();
      if (groupRef.current) {
        groupRef.current.x(position.x * fieldWidth);
        groupRef.current.y(position.y * fieldHeight);
      }
    };
  }, [isAnimating, nextPosition, fieldWidth, fieldHeight, position]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const x = e.target.x() / fieldWidth;
    const y = e.target.y() / fieldHeight;

    // Ensure coordinates are within bounds [0, 1]
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));

    // Update position
    e.target.x(boundedX * fieldWidth);
    e.target.y(boundedY * fieldHeight);

    setDragPos({ x: boundedX, y: boundedY });
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    if (isReadOnly || !onDragEnd) return;

    // Convert pixel coordinates to normalized coordinates
    const x = e.target.x() / fieldWidth;
    const y = e.target.y() / fieldHeight;

    // Ensure coordinates are within bounds [0, 1]
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));

    onDragEnd(object.id, { x: boundedX, y: boundedY });
  };

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    if (isReadOnly || isPrevious) return;

    // Handle selection
    if (onSelect && !isSelected) {
      onSelect(object.id);
    } else if (onDeselect && isSelected) {
      onDeselect(object.id);
    }

    // Stop event propagation
    e.cancelBubble = true;
  };

  const handleControlPointDragStart = (e: KonvaEventObject<DragEvent>) => {
    const point = e.target;
    if (!point) return;

    setControlPointDragPos({
      x: point.x() / fieldWidth,
      y: point.y() / fieldHeight
    });
  };

  const handleControlPointDragMove = (e: KonvaEventObject<DragEvent>) => {
    const point = e.target;
    if (!point) return;

    const x = point.x() / fieldWidth;
    const y = point.y() / fieldHeight;

    // Ensure coordinates are within bounds [0, 1]
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));

    // Update position
    point.x(boundedX * fieldWidth);
    point.y(boundedY * fieldHeight);

    setControlPointDragPos({ x: boundedX, y: boundedY });
  };

  const handleControlPointDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    if (!onControlPointChange) return;

    if (controlPointDragPos) {
      onControlPointChange(object.id, controlPointDragPos);
    }

    setControlPointDragPos(null);
  }, [object.id, controlPointDragPos, onControlPointChange]);

  const tokenColor = getTokenColor(object.type);

  return (
    <>
      <Group
        ref={groupRef}
        x={position.x * fieldWidth}
        y={position.y * fieldHeight}
        draggable={!isReadOnly && !isAnimating}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
      >
        {/* Connection line to previous position */}
        {previousPosition && (
          <Line
            points={[
              (previousPosition.x - position.x) * fieldWidth,
              (previousPosition.y - position.y) * fieldHeight,
              0,
              0
            ]}
            stroke={tokenColor}
            strokeWidth={strokeWidth}
            opacity={0.6}
            listening={false}
          />
        )}
        
        {/* Selection indicator */}
        {isSelected && (
          <Circle
            radius={selectionRadius}
            stroke={tokenColor}
            strokeWidth={strokeWidth}
            opacity={0.3}
            listening={false}
          />
        )}

        {/* Token circle */}
        <Circle
          radius={tokenRadius}
          fill={tokenColor}
          stroke={isSelected ? '#FFFFFF' : undefined}
          strokeWidth={isSelected ? strokeWidth : undefined}
          listening={true}
        />

        {/* Label */}
        {object.label && (
          <Text
            text={object.label}
            fill="white"
            fontSize={fontSize}
            align="center"
            verticalAlign="middle"
            offsetX={0}
            offsetY={0}
            width={tokenRadius * 2}
            height={tokenRadius * 2}
            listening={false}
          />
        )}
      </Group>
      
      {/* Control point */}
      {isSelected && controlPoint && (
        <Circle
          x={controlPoint.x * fieldWidth}
          y={controlPoint.y * fieldHeight}
          radius={controlPointRadius}
          fill="white"
          stroke={tokenColor}
          strokeWidth={strokeWidth}
          draggable
          onDragStart={handleControlPointDragStart}
          onDragMove={handleControlPointDragMove}
          onDragEnd={handleControlPointDragEnd}
        />
      )}
    </>
  );
};

export default ObjectToken; 