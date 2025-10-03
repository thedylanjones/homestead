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
  // Game rendering settings
  type: Phaser.AUTO, // Automatically choose WebGL or Canvas
  width: window.innerWidth, // Use full browser width
  height: window.innerHeight, // Use full browser height
  parent: 'game-container', // HTML element to contain the game
  
  // Background color (fallback - main background is created in scene)
  backgroundColor: WORLD_CONFIG.BACKGROUND_COLOR,
  
  // Physics configuration
  physics: {
    default: 'arcade', // Use Arcade Physics for simple 2D physics
    arcade: {
      gravity: { y: 0, x: 0 }, // No gravity for top-down movement
      debug: GAME_CONFIG.DEBUG.PHYSICS // Show physics debug info if enabled
    }
  },
  
  // Game scenes (in order of loading)
  scene: [GameScene],
  
  // Scaling configuration for responsive design
  scale: {
    mode: Phaser.Scale.RESIZE, // Resize game to fit container
    autoCenter: Phaser.Scale.CENTER_BOTH // Center the game in the container
  }
}

// Create and start the game
const game = new Phaser.Game(config)

// Export for potential external access
export default game
