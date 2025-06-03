import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import Konva from 'konva';
import type { Position } from '../types';
import type { FieldEditorProps } from './types';
import { FieldMarkings, ObjectToken } from '.';
import SelectionPanel from './SelectionPanel';
import './FieldEditor.css';

const FieldEditor = ({ play, fieldConfig, currentFrame, isReadOnly = false, onPlayUpdate, isAnimating = false, nextFrame }: FieldEditorProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);

  const handleDeleteObjects = useCallback((objectIds: string[]) => {
    if (!onPlayUpdate) return;

    // Create new play with objects removed
    const updatedObjects = { ...play.objects };
    objectIds.forEach(id => delete updatedObjects[id]);

    // Remove objects from all frames
    const updatedFrames = play.frames.map(frame => {
      const updatedFrameObjects = { ...frame.objects };
      objectIds.forEach(id => delete updatedFrameObjects[id]);
      return {
        ...frame,
        objects: updatedFrameObjects
      };
    });

    const updatedPlay = {
      ...play,
      objects: updatedObjects,
      frames: updatedFrames
    };

    onPlayUpdate(updatedPlay);
    setSelectedObjectIds([]); // Clear selection after delete
  }, [play, onPlayUpdate]);

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setStageSize({ width, height });
        
        // Calculate scale to fit field in view while maintaining aspect ratio
        const { width: fieldWidth, height: fieldHeight } = fieldConfig.dimensions;
        const fieldAspectRatio = fieldWidth / fieldHeight;
        const containerAspectRatio = width / height;
        
        if (containerAspectRatio > fieldAspectRatio) {
          // Container is wider than needed
          setScale(height / fieldHeight * 0.95);
        } else {
          // Container is taller than needed
          setScale(width / fieldWidth * 0.95);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [fieldConfig.dimensions]);

  // Handle keyboard events for selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard events when focused on input elements
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectIds.length > 0 && !isReadOnly) {
          handleDeleteObjects(selectedObjectIds);
        }
      } else if (e.key === 'Escape') {
        setSelectedObjectIds([]);
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isReadOnly) {
          // Select all objects
          setSelectedObjectIds(Object.keys(play.objects));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteObjects, isReadOnly, play.objects, selectedObjectIds]);

  const handleDragEnd = (objectId: string, newPos: Position) => {
    if (isReadOnly || !onPlayUpdate) return;

    // Ensure position is within bounds
    const x = Math.max(0, Math.min(1, newPos.x));
    const y = Math.max(0, Math.min(1, newPos.y));

    const updatedPlay = {
      ...play,
      frames: play.frames.map((frame, index) => {
        if (index === currentFrame) {
          return {
            ...frame,
            objects: {
              ...frame.objects,
              [objectId]: { x, y }
            }
          };
        }
        return frame;
      })
    };

    onPlayUpdate(updatedPlay);
  };

  const handleSelect = useCallback((objectId: string) => {
    setSelectedObjectIds(prev => {
      // If not holding shift, replace selection
      const evt = window.event as KeyboardEvent | MouseEvent | undefined;
      if (!evt?.shiftKey) {
        return [objectId];
      }
      // If holding shift, toggle selection
      return prev.includes(objectId)
        ? prev.filter(id => id !== objectId)
        : [...prev, objectId];
    });
  }, []);

  const handleDeselect = useCallback((objectId: string) => {
    setSelectedObjectIds(prev => prev.filter(id => id !== objectId));
  }, []);

  const handleNameChange = useCallback((objectId: string, newName: string) => {
    if (!onPlayUpdate) return;

    const updatedPlay = {
      ...play,
      objects: {
        ...play.objects,
        [objectId]: {
          ...play.objects[objectId],
          label: newName
        }
      }
    };

    onPlayUpdate(updatedPlay);
  }, [play, onPlayUpdate]);

  const currentFrameObjects = play.frames[currentFrame]?.objects || {};
  const nextFrameObjects = nextFrame ? play.frames[nextFrame]?.objects || {} : null;
  const { width: fieldWidth, height: fieldHeight } = fieldConfig.dimensions;

  // Get selected objects for the panel
  const selectedObjects = selectedObjectIds
    .map(id => play.objects[id])
    .filter(Boolean);

  return (
    <div className="field-editor-container">
      <div ref={containerRef} className="field-editor-main">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scale={{ x: scale, y: scale }}
          onClick={(e) => {
            // Deselect when clicking empty space
            if (e.target === e.currentTarget) {
              setSelectedObjectIds([]);
            }
          }}
        >
          <Layer>
            <Group x={(stageSize.width / scale - fieldWidth) / 2} y={(stageSize.height / scale - fieldHeight) / 2}>
              <FieldMarkings fieldConfig={fieldConfig} />
              
              {/* Previous frame positions (faded) */}
              {currentFrame > 0 && !isReadOnly && !isAnimating && (
                <Group opacity={0.3}>
                  {Object.entries(play.objects).map(([id, obj]) => {
                    const prevPos = play.frames[currentFrame - 1].objects[id];
                    if (!prevPos) return null;
                    
                    return (
                      <ObjectToken
                        key={`prev-${id}`}
                        object={obj}
                        position={prevPos}
                        fieldConfig={fieldConfig}
                        isReadOnly={true}
                      />
                    );
                  })}
                </Group>
              )}

              {/* Current frame objects */}
              {Object.entries(play.objects).map(([id, obj]) => {
                const pos = currentFrameObjects[id];
                if (!pos) return null;

                return (
                  <ObjectToken
                    key={id}
                    object={obj}
                    position={pos}
                    fieldConfig={fieldConfig}
                    isReadOnly={isReadOnly}
                    isAnimating={isAnimating}
                    nextPosition={nextFrameObjects?.[id]}
                    onDragEnd={(newPos: Position) => handleDragEnd(id, newPos)}
                    isSelected={selectedObjectIds.includes(id)}
                    onSelect={handleSelect}
                    onDeselect={handleDeselect}
                  />
                );
              })}
            </Group>
          </Layer>
        </Stage>
      </div>

      {!isReadOnly && (
        <SelectionPanel
          selectedObjects={selectedObjects}
          onNameChange={handleNameChange}
          onDelete={handleDeleteObjects}
        />
      )}
    </div>
  );
};

export default FieldEditor; 