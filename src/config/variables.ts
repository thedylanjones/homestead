/**
 * Game Configuration Variables - Organized and Clean
 * 
 * This file contains all game configuration variables organized by category.
 * All player-related settings are consolidated in one section for easy management.
 * 
 * Key Concepts:
 * - VISUAL_SIZE: How big the enemy appears on screen (visual representation)
 * - HITBOX_SIZE: Collision box size (invisible hitbox for damage detection)
 * - SCALE: Visual scale multiplier (how big sprites appear on screen)
 * - These can be different! Small hitbox + large visual = precise collision
 * 
 * File Structure:
 * 1. PLAYER_CONFIG - All player settings (movement, visual, health, attack)
 * 2. WORLD_CONFIG - Game world dimensions and background
 * 3. CAMERA_CONFIG - Camera behavior and follow settings
 * 4. BACKGROUND_CONFIG - Background rendering settings
 * 5. GRASS_CONFIG - Environmental decoration settings
 * 6. ENEMY_CONFIG - Enemy types, stats, and spawning
 * 7. GAME_CONFIG - General game and debug settings
 * 
 * Attack System:
 * - Auto-attack system: attacks automatically every X seconds
 * - Attacks in the direction the player last moved
 * - White cube/slash shows attack hitbox for visual feedback
 */

// ============================================================================
// PLAYER CONFIGURATION - All player-related settings
// ============================================================================

export const PLAYER_CONFIG = {
  // ============================================================================
  // MOVEMENT SETTINGS
  // ============================================================================
  
  // Movement speed (pixels per frame)
  SPEED: 100,
  
  // Movement drag/friction (higher = more friction, smoother stops)
  DRAG: 300,
  
  // ============================================================================
  // VISUAL SETTINGS
  // ============================================================================
  
  // Player collision box size (width and height in pixels)
  // This is the invisible box used for collision detection
  SIZE: 32,
  
  // Player visual scale (1.0 = original size, 2.0 = double size, 0.5 = half size)
  // This is how big the player appears on screen
  SCALE: 2.0,
  
  // ============================================================================
  // HEALTH SYSTEM
  // ============================================================================
  
  // Starting health points
  MAX_HEALTH: 100,
  
  // Health bar display settings
  HEALTH_BAR: {
    WIDTH: 60,        // Width of health bar in pixels
    HEIGHT: 8,        // Height of health bar in pixels
    OFFSET_Y: -40,    // How far above player to show health bar (negative = above)
    BACKGROUND_COLOR: 0x000000,  // Black background
    HEALTH_COLOR: 0x00ff00,      // Green when healthy
    DAMAGE_COLOR: 0xff0000,      // Red when damaged
  },
  
  // ============================================================================
  // ATTACK SYSTEM
  // ============================================================================
  
  // Player attack settings (auto-attack only)
  ATTACK: {
    DAMAGE: 20,         // How much damage the player's attack does
    RANGE: 60,          // How far the attack reaches (pixels)
    SIZE: 32,           // Size of the attack hitbox (pixels)
    COLOR: 0xffffff,    // White color for attack indicator
    
    // Auto-attack system
    INTERVAL: 2.0,        // Time between auto-attacks (in seconds) - set to 1.0 for 1 second
    VISUAL_DURATION: 0.3, // How long the white cube/slash shows (seconds)
  },
} as const

// ============================================================================
// WORLD CONFIGURATION - Game world settings
// ============================================================================

export const WORLD_CONFIG = {
  // World dimensions (pixels) - matches actual usage in GameScene
  WIDTH: 2000,
  HEIGHT: 2000,
  
  // Background color (fallback color)
  BACKGROUND_COLOR: '#63ab3f', // Green
} as const

// ============================================================================
// CAMERA CONFIGURATION - Camera behavior settings
// ============================================================================

export const CAMERA_CONFIG = {
  // Camera zoom level (1.0 = normal, 0.8 = zoomed out, 1.2 = zoomed in)
  ZOOM: 1,
  
  // Camera follow smoothness (0.1 = smooth, 0.05 = very smooth, 0.2 = snappy)
  FOLLOW_SPEED_X: 0.1,
  FOLLOW_SPEED_Y: 0.1,
  
  // Camera deadzone (0 = no deadzone, camera always follows)
  DEADZONE_X: 0,
  DEADZONE_Y: 0,
} as const

// ============================================================================
// BACKGROUND CONFIGURATION - Background rendering settings
// ============================================================================

export const BACKGROUND_CONFIG = {
  // Solid green background colors (all the same for a flat green look)
  GRADIENT_COLORS: {
    TOP: 0x63ab3f,      // Green
    MID_TOP: 0x63ab3f,  // Green
    MID_BOTTOM: 0x63ab3f, // Green
    BOTTOM: 0x63ab3f,   // Green
  },
} as const

// ============================================================================
// GRASS CONFIGURATION - Grass decoration settings
// ============================================================================

export const GRASS_CONFIG = {
  // Spacing between grass sprites (pixels) - larger = fewer grass sprites
  SPACING: 400, // Increased spacing for fewer grass sprites = better performance
  
  // Scale multiplier for grass sprites (2 = double size)
  SCALE: 2,
} as const

// ============================================================================
// ENEMY CONFIGURATION - Enemy types and behavior settings
// ============================================================================

export const ENEMY_CONFIG = {
  // ============================================================================
  // ENEMY TYPES - Different enemy behaviors and stats
  // ============================================================================
  
  TYPES: {
    DOG: {
      NAME: 'dog',
      // Movement and combat
      SPEED: 50,           // How fast the enemy moves (pixels per frame)
      DAMAGE: 5,          // How much damage this enemy does per hit
      ATTACK_RANGE: 10,    // How close enemy needs to be to attack (pixels)
      ATTACK_COOLDOWN: 1, // Time between attacks (in seconds) - balanced with player health
      HEALTH: 10,          // Enemy's health points
      // Visual properties
      VISUAL_SIZE: 24,     // Visual size (how big the enemy appears on screen)
      SCALE: 1.5,          // Visual scale multiplier (how big it appears on screen)
      COLOR: 0x8B4513,     // Brown color for dog
      // Collision properties
      HITBOX_SIZE: 26,     // Collision box size (invisible hitbox for damage detection)
    },
  },
  
  // ============================================================================
  // SPAWN SETTINGS - How enemies appear in the game
  // ============================================================================
  
  SPAWN: {
    MAX_ENEMIES: 100,      // Much higher enemy count for proper gameplay
    SPAWN_DISTANCE: 400,   // How far from player to spawn enemies (pixels)
    SPAWN_INTERVAL: 1000,  // Faster spawning for more action (1 second)
  },
} as const

// ============================================================================
// BUILDING CONFIGURATION - Building system settings
// ============================================================================

export const BUILDING_CONFIG = {
  // Building types and their properties
  TYPES: {
    POWER: {
      NAME: 'Power Station',
      BUILD_TIME: 3000,        // 3 seconds to build
      SIZE: 64,               // Building size in pixels
      COLOR: 0xff6b35,        // Orange color
      HEALTH_BAR_COLOR: 0x00ff00, // Green health bar
      ICON: '⚡',             // Power icon
      COST: 100,              // Building cost
    },
    WATER: {
      NAME: 'Water Tower',
      BUILD_TIME: 2500,        // 2.5 seconds to build
      SIZE: 64,
      COLOR: 0x3498db,        // Blue color
      HEALTH_BAR_COLOR: 0x00ff00,
      ICON: '💧',             // Water icon
      COST: 80,               // Building cost
    },
    FOOD: {
      NAME: 'Food Storage',
      BUILD_TIME: 2000,        // 2 seconds to build
      SIZE: 64,
      COLOR: 0xf39c12,        // Yellow color
      HEALTH_BAR_COLOR: 0x00ff00,
      ICON: '🍎',             // Food icon
      COST: 60,               // Building cost
    },
    TURRET: {
      NAME: 'Defense Turret',
      BUILD_TIME: 4000,        // 4 seconds to build
      SIZE: 64,
      COLOR: 0xe74c3c,        // Red color
      HEALTH_BAR_COLOR: 0x00ff00,
      ICON: '🏹',             // Turret icon
      COST: 150,              // Building cost
    },
  },
  
  // Building system settings
  UI: {
    ICON_SIZE: 48,            // Size of building selection icons
    ICON_SPACING: 60,         // Space between icons
    ICON_Y_POSITION: 0.9,     // Position from bottom (0.9 = 90% down)
    SELECTED_ALPHA: 1.0,      // Alpha for selected icon
    UNSELECTED_ALPHA: 0.6,    // Alpha for unselected icons
    HEALTH_BAR_WIDTH: 60,     // Building health bar width
    HEALTH_BAR_HEIGHT: 8,     // Building health bar height
    HEALTH_BAR_OFFSET_Y: -40, // Health bar position above building
  },
  
  // Building placement settings
  PLACEMENT: {
    GRID_SIZE: 32,            // Snap to grid for placement
    MIN_DISTANCE_FROM_PLAYER: 80, // Minimum distance from player to place
  },
} as const

// ============================================================================
// GAME CONFIGURATION - General game settings
// ============================================================================

export const GAME_CONFIG = {
  // Development settings
  DEBUG: {
    PHYSICS: false,       // Show physics debug info
    CONSOLE_LOGS: true,   // Show console debug messages
  },
  // Performance settings
  PERFORMANCE_MODE: true, // Enable aggressive performance optimizations
} as const