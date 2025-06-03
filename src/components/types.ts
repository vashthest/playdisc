import type { Play, ObjectToken, Frame } from '../types';
import type { FieldConfiguration } from '../types/field';

export interface FieldEditorProps {
  play: Play;
  fieldConfig: FieldConfiguration;
  currentFrame: number;
  isReadOnly?: boolean;
  onPlayUpdate?: (updatedPlay: Play) => void;
  isAnimating?: boolean;
  nextFrame?: number;
}

export interface TimelineProps {
  frames: Frame[];
  currentFrame: number;
  onFrameSelect: (index: number) => void;
  onAddFrame?: () => void;
}

export interface CommentsSidebarProps {
  play: Play;
  currentFrame: number;
  onFrameSelect: (frame: number) => void;
  onPlayUpdate?: (updatedPlay: Play) => void;
}

export interface PlaybackControlsProps {
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  onAnimationStart?: (fromFrame: number, toFrame: number) => void;
  onAnimationEnd?: () => void;
}

export interface LeftToolbarProps {
  onAddObject: (type: ObjectToken['type']) => void;
}

export interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export interface FieldConfigSelectorProps {
  currentConfig: FieldConfiguration;
  onConfigChange: (config: FieldConfiguration) => void;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export interface ObjectTokenProps {
  object: ObjectToken;
  position: { x: number; y: number };
  fieldConfig: FieldConfiguration;
  isReadOnly?: boolean;
  onDragEnd?: (position: { x: number; y: number }) => void;
  isAnimating?: boolean;
  nextPosition?: { x: number; y: number };
  isSelected?: boolean;
  onSelect?: (objectId: string) => void;
  onDeselect?: (objectId: string) => void;
}

export interface FieldMarkingsProps {
  fieldConfig: FieldConfiguration;
} 