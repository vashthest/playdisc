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
      const updatedControlPoints = { ...(frame.controlPoints || {}) };
      objectIds.forEach(id => {
        delete updatedFrameObjects[id];
        delete updatedControlPoints[id];
      });
      return {
        ...frame,
        objects: updatedFrameObjects,
        controlPoints: updatedControlPoints
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

  // Initialize stage size
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
          setScale(height / fieldHeight * 0.9); // Reduce scale to 90% to add some padding
        } else {
          // Container is taller than needed
          setScale(width / fieldWidth * 0.9); // Reduce scale to 90% to add some padding
        }
      }
    };

    // Initial update
    updateSize();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Add window resize listener for good measure
    window.addEventListener('resize', updateSize);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
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

    // Calculate the change in position
    const oldPos = currentFrameObjects[objectId];
    const deltaX = newPos.x - oldPos.x;
    const deltaY = newPos.y - oldPos.y;

    // If this object is part of a multi-selection, move all selected objects
    const objectsToMove = selectedObjectIds.includes(objectId) ? selectedObjectIds : [objectId];

    const updatedFrameObjects = { ...currentFrameObjects };
    objectsToMove.forEach(id => {
      const currentPos = currentFrameObjects[id];
      if (currentPos) {
        // Apply the same delta to each selected object, ensuring they stay within bounds
        updatedFrameObjects[id] = {
          x: Math.max(0, Math.min(1, currentPos.x + deltaX)),
          y: Math.max(0, Math.min(1, currentPos.y + deltaY))
        };
      }
    });

    const updatedPlay = {
      ...play,
      frames: play.frames.map((frame, index) => {
        if (index === currentFrame) {
          return {
            ...frame,
            objects: updatedFrameObjects
          };
        }
        return frame;
      })
    };

    onPlayUpdate(updatedPlay);
  };

  // Add useEffect to track frame object changes
  useEffect(() => {
    const currentObjects = play.frames[currentFrame]?.objects || {};
    console.log("--------------------------------");
    console.log("Frame objects updated:");
    console.log("Current frame:", currentFrame);
    console.log("Objects:", currentObjects);
    console.log("Control points:", play.frames[currentFrame]?.controlPoints);
  }, [currentFrame, play.frames]);

  const handleControlPointChange = useCallback((objectId: string, position: { x: number; y: number } | null) => {
    if (!onPlayUpdate) return;

    console.log("--------------------------------");
    console.log("HANDLE CONTROL POINT CHANGE:");
    console.log("Object ID:", objectId);
    console.log("New control point position:", position);

    // Create a stable copy of the current frame
    const frameToUpdate = play.frames[currentFrame];
    console.log("Current frame objects:", frameToUpdate.objects);
    console.log("Current frame control points:", frameToUpdate.controlPoints);

    // Create new references for both objects and control points
    const currentObjects = { ...frameToUpdate.objects };
    const currentControlPoints = { ...(frameToUpdate.controlPoints || {}) };

    // Update only the control points, leaving objects untouched
    if (position === null) {
      delete currentControlPoints[objectId];
      console.log("Deleted control point for object:", objectId);
    } else {
      currentControlPoints[objectId] = position;
      console.log("Updated control point for object:", objectId, "to:", position);
    }

    // Create the updated frame with explicit object preservation
    const updatedFrame = {
      ...frameToUpdate,
      id: frameToUpdate.id, // Ensure ID is preserved
      objects: currentObjects,  // Preserve exact object references
      controlPoints: currentControlPoints
    };

    console.log("Updated frame:", {
      objects: updatedFrame.objects,
      controlPoints: updatedFrame.controlPoints
    });

    // Create updated play with the new frame
    const updatedPlay = {
      ...play,
      frames: play.frames.map((frame, index) => {
        if (index === currentFrame) {
          return updatedFrame;
        }
        // For other frames, ensure their control points are preserved
        return {
          ...frame,
          objects: { ...frame.objects },
          controlPoints: { ...(frame.controlPoints || {}) }
        };
      })
    };

    // Verify the update before applying
    console.log("Verifying update:");
    console.log("Original object position:", frameToUpdate.objects[objectId]);
    console.log("Updated object position:", updatedPlay.frames[currentFrame].objects[objectId]);
    console.log("Updated control points:", updatedPlay.frames[currentFrame].controlPoints);

    onPlayUpdate(updatedPlay);
  }, [currentFrame, play, onPlayUpdate]);

  // Add a debug effect to track frame control points
  useEffect(() => {
    const frame = play.frames[currentFrame];
    console.log("Frame control points check:", {
      frameId: frame.id,
      controlPoints: frame.controlPoints,
      objectPositions: frame.objects
    });
  }, [play.frames, currentFrame]);

  // Add effect to track frame changes
  useEffect(() => {
    console.log("--------------------------------");
    console.log("Frame state changed:");
    console.log("Current frame:", currentFrame);
    console.log("Frame objects:", play.frames[currentFrame].objects);
    console.log("Frame control points:", play.frames[currentFrame].controlPoints);
  }, [currentFrame, play.frames]);

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
            <Group
              x={(stageSize.width / scale - fieldWidth) / 2}
              y={(stageSize.height / scale - fieldHeight) / 2}
              listening={true}
            >
              <FieldMarkings fieldConfig={fieldConfig} />
              
              {/* Previous frame positions */}
              {currentFrame > 0 && !isReadOnly && !isAnimating && (
                <>
                  {Object.entries(play.objects).map(([id, obj]) => {
                    const prevPos = play.frames[currentFrame - 1].objects[id];
                    const currentPos = currentFrameObjects[id];
                    if (!prevPos || !currentPos) return null;
                    
                    return (
                      <ObjectToken
                        key={`prev-${id}`}
                        object={obj}
                        position={prevPos}
                        fieldConfig={fieldConfig}
                        isReadOnly={true}
                        isPrevious={true}
                      />
                    );
                  })}
                </>
              )}

              {/* Current frame objects */}
              {Object.entries(play.objects).map(([id, obj]) => {
                const pos = currentFrameObjects[id];
                const prevPos = currentFrame > 0 ? play.frames[currentFrame - 1].objects[id] : undefined;
                if (!pos) return null;

                return (
                  <ObjectToken
                    key={id}
                    object={obj}
                    position={pos}
                    previousPosition={!isReadOnly && !isAnimating ? prevPos : undefined}
                    fieldConfig={fieldConfig}
                    isReadOnly={isReadOnly}
                    isAnimating={isAnimating}
                    nextPosition={nextFrameObjects?.[id]}
                    onDragEnd={(objectId: string, newPos: Position) => handleDragEnd(objectId, newPos)}
                    isSelected={selectedObjectIds.includes(id)}
                    onSelect={handleSelect}
                    onDeselect={handleDeselect}
                    controlPoint={play.frames[currentFrame].controlPoints?.[id]}
                    onControlPointChange={handleControlPointChange}
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