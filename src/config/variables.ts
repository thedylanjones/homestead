/**
 * Game Configuration Variables
 * 
 * This file contains all the key variables that you might want to easily change
 * to customize your game. Modify these values to adjust gameplay, appearance, and behavior.
 */

// ============================================================================
// PLAYER CONFIGURATION
// ============================================================================

export const PLAYER_CONFIG = {
  // Movement speed (pixels per second)
  SPEED: 200,
  
  // Player size (width and height in pixels)
  SIZE: 32,
  
  // Player color (hex color code)
  COLOR: 0x000000, // Black
  
  // Movement drag/friction (higher = more friction, smoother stops)
  DRAG: 300,
  
  // Starting position (will be centered in world)
  START_X: 0, // Will be overridden to world center
  START_Y: 0, // Will be overridden to world center
} as const

// ============================================================================
// WORLD CONFIGURATION
// ============================================================================

export const WORLD_CONFIG = {
  // World dimensions (pixels)
  WIDTH: 4096,
  HEIGHT: 3072,
  
  // Background color (fallback color)
  BACKGROUND_COLOR: '#8B4513', // Saddle brown
} as const

// ============================================================================
// CAMERA CONFIGURATION
// ============================================================================

export const CAMERA_CONFIG = {
  // Camera zoom level (1.0 = normal, 0.8 = zoomed out, 1.2 = zoomed in)
  ZOOM: 0.8,
  
  // Camera follow smoothness (0.1 = smooth, 0.05 = very smooth, 0.2 = snappy)
  FOLLOW_SPEED_X: 0.1,
  FOLLOW_SPEED_Y: 0.1,
  
  // Camera deadzone (0 = no deadzone, camera always follows)
  DEADZONE_X: 0,
  DEADZONE_Y: 0,
} as const

// ============================================================================
// BACKGROUND CONFIGURATION
// ============================================================================

export const BACKGROUND_CONFIG = {
  // Sunset gradient colors (from top to bottom)
  GRADIENT_COLORS: {
    TOP: 0xFF8C42,      // Warm orange (sunset)
    MID_TOP: 0xFFB366,  // Soft orange
    MID_BOTTOM: 0x90EE90, // Light green (grass)
    BOTTOM: 0x8B4513,   // Saddle brown (earth)
  },
  
  // Grass texture settings
  GRASS: {
    COUNT: 200,           // Number of grass blades
    COLOR: 0x228B22,      // Forest green
    OPACITY: 0.3,         // Transparency (0.0 = invisible, 1.0 = opaque)
    MIN_HEIGHT: 3,        // Minimum grass blade height
    MAX_HEIGHT: 8,        // Maximum grass blade height
  },
  
  // Dirt spots settings
  DIRT: {
    COUNT: 50,            // Number of dirt spots
    COLOR: 0x654321,      // Dark brown
    OPACITY: 0.2,         // Transparency
    MIN_SIZE: 2,          // Minimum dirt spot size
    MAX_SIZE: 6,          // Maximum dirt spot size
  },
  
  // Atmospheric effects
  ATMOSPHERE: {
    CLOUD_COUNT: 8,       // Number of cloud-like shapes
    CLOUD_COLOR: 0xFFE4B5, // Moccasin color
    CLOUD_OPACITY: 0.15,  // Cloud transparency
    CLOUD_MIN_SIZE: 30,   // Minimum cloud size
    CLOUD_MAX_SIZE: 80,   // Maximum cloud size
    CLOUD_MAX_Y: 0.4,     // Maximum Y position (as fraction of world height)
    
    LIGHT_RAY_COUNT: 5,   // Number of light rays
    LIGHT_RAY_COLOR: 0xFFD700, // Gold color
    LIGHT_RAY_OPACITY: 0.1,    // Light ray transparency
    LIGHT_RAY_LENGTH: 200,     // Maximum light ray length
  },
} as const

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

export const GAME_CONFIG = {
  // Game title
  TITLE: 'Homestead - Phaser 3 Game',
  
  // Development settings
  DEBUG: {
    PHYSICS: false,       // Show physics debug info
    CONSOLE_LOGS: true,   // Show console debug messages
  },
} as const
