/**
 * Background Manager - Simple Background Creation
 * 
 * This handles creating the game background.
 * It's separate to keep the main scene clean and simple.
 */

import Phaser from 'phaser'
import { BACKGROUND_CONFIG } from '../config/variables'

export class BackgroundManager {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * Creates a simple green background
   */
  createBackground(): void {
    // Creating background
    
    // Get world size
    const worldWidth = this.scene.physics.world.bounds.width
    const worldHeight = this.scene.physics.world.bounds.height
    
    // Create a graphics object to draw the background
    const graphics = this.scene.add.graphics()
    
    // Set up green colors (all the same for a flat look)
    graphics.fillGradientStyle(
      BACKGROUND_CONFIG.GRADIENT_COLORS.TOP,      // Top color
      BACKGROUND_CONFIG.GRADIENT_COLORS.MID_TOP,  // Middle-top color
      BACKGROUND_CONFIG.GRADIENT_COLORS.MID_BOTTOM, // Middle-bottom color
      BACKGROUND_CONFIG.GRADIENT_COLORS.BOTTOM    // Bottom color
    )
    
    // Draw a rectangle covering the entire world
    graphics.fillRect(0, 0, worldWidth, worldHeight)
    
    // Put background behind everything else
    graphics.setDepth(-10)
    
    // Background created successfully
  }
}
