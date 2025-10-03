/**
 * Simple Main Game File - Easy to Understand
 * 
 * This is a simplified version of the main game file that's much easier to understand.
 * It sets up the game with basic settings and starts the simple game scene.
 */

import Phaser from 'phaser'
import { SimpleGameScene } from './scenes/SimpleGameScene'
import { WORLD_CONFIG, GAME_CONFIG } from './config/variables'

/**
 * Simple Game Configuration
 * 
 * This sets up the basic game settings. You can easily change these values
 * to customize how your game looks and runs.
 */
const simpleConfig: Phaser.Types.Core.GameConfig = {
  // ============================================================================
  // BASIC GAME SETTINGS
  // ============================================================================
  
  // Use WebGL for better performance
  type: Phaser.WEBGL,
  
  // Game window size (1280x720 is good for most screens)
  width: 1280,
  height: 720,
  
  // Where to put the game on the webpage
  parent: 'game-container',
  
  // ============================================================================
  // PERFORMANCE SETTINGS
  // ============================================================================
  
  // Limit to 60 FPS for smooth gameplay
  fps: {
    limit: 60,
    forceSetTimeOut: false // Use browser timing for smoother movement
  },
  
  // ============================================================================
  // BACKGROUND COLOR
  // ============================================================================
  
  // Background color (fallback - main background is green)
  backgroundColor: WORLD_CONFIG.BACKGROUND_COLOR,
  
  // ============================================================================
  // PHYSICS SETTINGS
  // ============================================================================
  
  // Use simple 2D physics
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 }, // No gravity (top-down game)
      debug: GAME_CONFIG.DEBUG.PHYSICS // Show physics boxes if debugging
    }
  },
  
  // ============================================================================
  // GAME SCENES
  // ============================================================================
  
  // List of game scenes (we only have one main scene)
  scene: [SimpleGameScene],
  
  // ============================================================================
  // SCALING SETTINGS
  // ============================================================================
  
  // How the game fits on different screen sizes
  scale: {
    mode: Phaser.Scale.FIT, // Fit to screen without stretching
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game
    width: 1280, // Fixed width
    height: 720 // Fixed height
  },
  
  // ============================================================================
  // RENDERING SETTINGS
  // ============================================================================
  
  // How graphics are drawn
  render: {
    pixelArt: false, // Not using pixel art
    antialias: true, // Smooth edges
    roundPixels: false, // Don't round pixels (keeps movement smooth)
    batchSize: 8192, // Draw many objects at once for better performance
    maxTextures: 32, // Maximum number of images
    clearBeforeRender: true, // Clear screen before drawing
    preserveDrawingBuffer: false, // Don't save previous frames
    failIfMajorPerformanceCaveat: false // Don't crash if performance is bad
  }
}

// ============================================================================
// CREATE AND START THE GAME
// ============================================================================

// Create the game with our configuration
const game = new Phaser.Game(simpleConfig)

// Export for potential external access
export default game

// ============================================================================
// PERFORMANCE OPTIMIZATION TIPS
// ============================================================================

/*
 * If you want to optimize performance, here are the main things to adjust:
 * 
 * 1. RESOLUTION: Lower width/height for better performance
 *    - Try: width: 1024, height: 576
 * 
 * 2. GRASS DENSITY: Reduce grass count in GrassManager
 *    - Change GRASS_CONFIG.SPACING to a larger number (like 400)
 * 
 * 3. RENDERING: Disable antialiasing for better performance
 *    - Change antialias: false
 * 
 * 4. BATCH SIZE: Increase for better performance
 *    - Change batchSize: 16384
 * 
 * 5. FPS LIMIT: Lower for better performance on slow devices
 *    - Change limit: 30
 */
