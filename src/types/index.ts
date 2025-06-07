import type { FieldConfiguration } from './field';

export interface Position {
  x: number;
  y: number;
}

export interface ObjectToken {
  id: string;
  type: 'O' | 'X' | 'D' | 'C';  // Offense, Defense, Disc, Cone
  label: string;
  position: Position;
}

export interface Frame {
  id: string;
  objects: Record<string, Position>;  // objectId -> position mapping
  controlPoints?: Record<string, Position>;  // objectId -> control point mapping
}

export interface Reply {
  id: string;
  author: string;
  body: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  author: string;
  frameIndex: number;
  position: Position;
  body: string;
  createdAt: Date;
  replies?: Reply[];
}

export interface Play {
  id: string;
  name: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  fieldConfigId: string;  // Store just the ID of the field configuration
  objects: Record<string, ObjectToken>;  // objectId -> object mapping
  frames: Frame[];
  comments: Comment[];
} 