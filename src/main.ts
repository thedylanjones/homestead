// Import Phaser game engine and our custom game files
import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'
import { WORLD_CONFIG, GAME_CONFIG } from './config/variables'

/**
 * Main Game Configuration
 * 
 * This is the primary configuration object for the Phaser game.
 * It sets up the game window, physics, scenes, and scaling.
 * 
 * Think of this as the "settings" for our game - like adjusting
 * the settings on a TV or computer game.
 */
const config: Phaser.Types.Core.GameConfig = {
  // ============================================================================
  // GAME RENDERING SETTINGS - How the game looks and performs
  // ============================================================================
  
  type: Phaser.WEBGL, // Use WebGL renderer for better performance (like using a graphics card)
  width: 1280, // Game window width in pixels (1280 is good for 60+ FPS)
  height: 720, // Game window height in pixels (720 is good for 60+ FPS)
  parent: 'game-container', // HTML element where the game will be displayed
  
  // ============================================================================
  // PERFORMANCE SETTINGS - How fast the game runs
  // ============================================================================
  
  fps: {
    limit: 60, // Maximum frames per second (60 FPS = smooth gameplay)
    forceSetTimeOut: false // Use browser's built-in timing for smoother movement
  },
  
  // ============================================================================
  // BACKGROUND SETTINGS - What color shows behind the game
  // ============================================================================
  
  backgroundColor: WORLD_CONFIG.BACKGROUND_COLOR, // Background color (green from config)
  
  // ============================================================================
  // PHYSICS SETTINGS - How objects move and interact
  // ============================================================================
  
  physics: {
    default: 'arcade', // Use simple 2D physics (good for beginners)
    arcade: {
      gravity: { y: 0, x: 0 }, // No gravity (objects don't fall down)
      debug: GAME_CONFIG.DEBUG.PHYSICS // Show physics boxes if debugging is on
    }
  },
  
  // ============================================================================
  // SCENE SETTINGS - What scenes (levels/screens) the game has
  // ============================================================================
  
  scene: [GameScene], // List of game scenes (we only have one main game scene)
  
  // ============================================================================
  // SCALING SETTINGS - How the game fits on different screen sizes
  // ============================================================================
  
  scale: {
    mode: Phaser.Scale.FIT, // Fit game to screen without stretching
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game on screen
    width: 1280, // Fixed width for consistent performance
    height: 720 // Fixed height for consistent performance
  },
  
  // ============================================================================
  // RENDERING OPTIMIZATION SETTINGS - How graphics are drawn
  // ============================================================================
  
  render: {
    pixelArt: false, // Not using pixel art style
    antialias: true, // Smooth edges on graphics (makes things look less jagged)
    roundPixels: false, // Don't round pixels (keeps movement smooth)
    batchSize: 8192, // Draw many objects at once for better performance
    maxTextures: 32, // Maximum number of images that can be loaded
    clearBeforeRender: true, // Clear screen before drawing new frame
    preserveDrawingBuffer: false, // Don't save previous frames (saves memory)
    failIfMajorPerformanceCaveat: false // Don't crash if performance is bad
  }
}

// ============================================================================
// CREATE AND START THE GAME
// ============================================================================

// Create a new Phaser game using our configuration
const game = new Phaser.Game(config)

// Export the game so other files can access it if needed
export default game
