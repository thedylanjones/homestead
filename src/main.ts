import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'
import { WORLD_CONFIG, GAME_CONFIG } from './config/variables'

/**
 * Main Game Configuration
 * 
 * This is the primary configuration object for the Phaser game.
 * It sets up the game window, physics, scenes, and scaling.
 */
const config: Phaser.Types.Core.GameConfig = {
  // Game rendering settings - OPTIMIZED FOR PERFORMANCE
  type: Phaser.WEBGL, // Force WebGL for better performance
  width: 1024, // Fixed resolution for better performance
  height: 768, // Fixed resolution for better performance
  parent: 'game-container', // HTML element to contain the game
  
  // Performance optimization settings
  fps: {
    limit: 60, // Cap at 60 FPS for consistent performance
    forceSetTimeOut: true // Use setTimeout for better performance
  },
  
  // Background color (fallback - main background is created in scene)
  backgroundColor: WORLD_CONFIG.BACKGROUND_COLOR,
  
  // Physics configuration - OPTIMIZED
  physics: {
    default: 'arcade', // Use Arcade Physics for simple 2D physics
    arcade: {
      gravity: { y: 0, x: 0 }, // No gravity for top-down movement
      debug: GAME_CONFIG.DEBUG.PHYSICS, // Show physics debug info if enabled
      fps: 60, // Limit physics updates to 60 FPS
      timeScale: 1, // Normal time scale
      overlapBias: 4, // Optimize overlap detection
      tileBias: 16, // Optimize tile collision detection
      forceX: false, // Disable force calculations for better performance
      isPaused: false // Keep physics active
    }
  },
  
  // Game scenes (in order of loading)
  scene: [GameScene],
  
  // Scaling configuration - OPTIMIZED FOR PERFORMANCE
  scale: {
    mode: Phaser.Scale.FIT, // Fit to container without constant resizing
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game in the container
    width: 1024, // Fixed width
    height: 768 // Fixed height
  },
  
  // Rendering optimization - MAXIMUM PERFORMANCE
  render: {
    pixelArt: false, // Set to true if using pixel art
    antialias: false, // Disable antialiasing for better performance
    roundPixels: true, // Round pixels for better performance
    batchSize: 4096, // Increase batch size for better batching
    maxTextures: 16, // Limit texture count for better performance
    clearBeforeRender: true, // Clear before render for better performance
    preserveDrawingBuffer: false, // Don't preserve drawing buffer
    failIfMajorPerformanceCaveat: false // Don't fail on performance issues
  }
}

// Create and start the game
const game = new Phaser.Game(config)

// Export for potential external access
export default game
