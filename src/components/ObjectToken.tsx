import { Group, Circle, Text, Ring } from 'react-konva';
import { useEffect, useRef } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { ObjectTokenProps } from './types';
import type { FieldConfiguration } from '../types/field';
import Konva from 'konva';

const ANIMATION_DURATION = 0.3; // Duration in seconds for Konva animation

const ObjectToken = ({
  object,
  position,
  fieldConfig,
  isReadOnly = false,
  onDragEnd,
  isAnimating = false,
  nextPosition,
  isSelected = false,
  onSelect,
  onDeselect
}: ObjectTokenProps) => {
  const radius = 2; // Size in yards
  const { width, height } = fieldConfig.dimensions;
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    if (isAnimating && nextPosition && groupRef.current) {
      // Animate to the next position
      groupRef.current.to({
        x: nextPosition.x * width,
        y: nextPosition.y * height,
        duration: ANIMATION_DURATION,
        easing: Konva.Easings.Linear
      });
    }
  }, [isAnimating, nextPosition, width, height]);

  const getTokenColor = (type: ObjectTokenProps['object']['type']) => {
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
        return '#000000';
    }
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (isReadOnly || !onDragEnd) return;

    // Get the token group (what was dragged)
    const tokenGroup = e.target;
    if (!tokenGroup) return;

    // Get position relative to the field group
    // Since the token's x,y is already relative to its parent (field group),
    // we can use it directly
    const x = tokenGroup.x() / width;
    const y = tokenGroup.y() / height;

    // Ensure the position stays within bounds (0-1)
    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));

    onDragEnd({ x: boundedX, y: boundedY });
  };

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    if (isReadOnly) return;

    // Check if shift key is pressed for multi-select
    if (e.evt.shiftKey) {
      if (isSelected && onDeselect) {
        onDeselect(object.id);
      } else if (onSelect) {
        onSelect(object.id);
      }
    } else {
      // Single select
      if (onSelect) {
        onSelect(object.id);
      }
    }
  };

  return (
    <Group
      ref={groupRef}
      x={position.x * width}
      y={position.y * height}
      draggable={!isReadOnly && !isAnimating}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      {/* Selection ring */}
      {isSelected && (
        <Ring
          innerRadius={radius + 0.2}
          outerRadius={radius + 0.4}
          fill="#3b82f6"
          opacity={0.3}
        />
      )}
      
      <Circle
        radius={radius}
        fill={getTokenColor(object.type)}
        stroke="#000000"
        strokeWidth={0.1}
      />
      {object.type !== 'D' && object.type !== 'C' && (
        <Text
          text={object.label}
          fontSize={2}
          fill="#FFFFFF"
          align="center"
          verticalAlign="middle"
          offsetX={1}
          offsetY={1}
        />
      )}
    </Group>
  );
};

export default ObjectToken; 