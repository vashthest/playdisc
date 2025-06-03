export interface FieldDimensions {
  width: number;        // Width in yards
  height: number;       // Height in yards
  endZoneDepth: number; // End zone depth in yards
  brickMarkDistance: number; // Distance from goal line to brick mark in yards
}

export type FieldOrientation = 'horizontal' | 'vertical';
export type FieldPortion = 'full' | 'half' | 'quarter' | 'three-quarters';

export interface FieldConfiguration {
  id: string;
  name: string;
  dimensions: FieldDimensions;
  orientation: FieldOrientation;
  portion: FieldPortion;
  description?: string;
}

// Base dimensions for standard fields
const USAU_DIMENSIONS = {
  full: {
    width: 110,
    height: 40,
    endZoneDepth: 20,
    brickMarkDistance: 20
  },
  half: {
    width: 55,
    height: 40,
    endZoneDepth: 20,
    brickMarkDistance: 20
  },
  quarter: {
    width: 27.5,
    height: 40,
    endZoneDepth: 20,
    brickMarkDistance: 0
  },
  'three-quarters': {
    width: 72,
    height: 40,
    endZoneDepth: 20,
    brickMarkDistance: 20
  }
};

// Helper function to rotate dimensions
const rotateDimensions = (dimensions: FieldDimensions): FieldDimensions => ({
  width: dimensions.height,
  height: dimensions.width,
  endZoneDepth: dimensions.endZoneDepth,
  brickMarkDistance: dimensions.brickMarkDistance
});

// Standard field configurations
export const FIELD_CONFIGS: Record<string, FieldConfiguration> = {
  USAU_HORIZONTAL: {
    id: 'USAU_HORIZONTAL',
    name: 'USAU Regulation (Horizontal)',
    dimensions: USAU_DIMENSIONS.full,
    orientation: 'horizontal',
    portion: 'full',
    description: 'USA Ultimate regulation field dimensions - horizontal orientation'
  },
  USAU_VERTICAL: {
    id: 'USAU_VERTICAL',
    name: 'USAU Regulation (Vertical)',
    dimensions: rotateDimensions(USAU_DIMENSIONS.full),
    orientation: 'vertical',
    portion: 'full',
    description: 'USA Ultimate regulation field dimensions - vertical orientation'
  },
  USAU_HALF_HORIZONTAL: {
    id: 'USAU_HALF_HORIZONTAL',
    name: 'USAU Half Field (Horizontal)',
    dimensions: USAU_DIMENSIONS.half,
    orientation: 'horizontal',
    portion: 'half',
    description: 'Half of a regulation field - horizontal orientation'
  },
  USAU_HALF_VERTICAL: {
    id: 'USAU_HALF_VERTICAL',
    name: 'USAU Half Field (Vertical)',
    dimensions: rotateDimensions(USAU_DIMENSIONS.half),
    orientation: 'vertical',
    portion: 'half',
    description: 'Half of a regulation field - vertical orientation'
  },
  USAU_QUARTER: {
    id: 'USAU_QUARTER',
    name: 'USAU Quarter Field (Horizontal)',
    dimensions: USAU_DIMENSIONS.quarter,
    orientation: 'horizontal',
    portion: 'quarter',
    description: 'Quarter of a regulation field - horizontal orientation'
  },
  USAU_QUARTER_VERTICAL: {
    id: 'USAU_QUARTER_VERTICAL',
    name: 'USAU Quarter Field (Vertical)',
    dimensions: rotateDimensions(USAU_DIMENSIONS.quarter),
    orientation: 'vertical',
    portion: 'quarter',
    description: 'Quarter of a regulation field - vertical orientation'
  },
  USAU_THREE_QUARTERS: {
    id: 'USAU_THREE_QUARTERS',
    name: 'USAU Three-Quarter Field (Horizontal)',
    dimensions: USAU_DIMENSIONS['three-quarters'],
    orientation: 'horizontal',
    portion: 'three-quarters',
    description: 'Three quarters of a regulation field - horizontal orientation'
  },
  USAU_THREE_QUARTERS_VERTICAL: {
    id: 'USAU_THREE_QUARTERS_VERTICAL',
    name: 'USAU Three-Quarter Field (Vertical)',
    dimensions: rotateDimensions(USAU_DIMENSIONS['three-quarters']),
    orientation: 'vertical',
    portion: 'three-quarters',
    description: 'Three quarters of a regulation field - vertical orientation'
  },
  WFDF: {
    id: 'WFDF',
    name: 'WFDF International',
    dimensions: {
      width: 100,
      height: 37,
      endZoneDepth: 18,
      brickMarkDistance: 20
    },
    orientation: 'horizontal',
    portion: 'full',
    description: 'World Flying Disc Federation regulation field dimensions'
  },
  BEACH: {
    id: 'BEACH',
    name: 'Beach Ultimate',
    dimensions: {
      width: 75,
      height: 25,
      endZoneDepth: 15,
      brickMarkDistance: 10
    },
    orientation: 'horizontal',
    portion: 'full',
    description: 'Standard beach ultimate field dimensions'
  }
}; 