/**
 * Camera Manager - Simple Camera Setup
 * 
 * This handles setting up the camera to follow the player.
 * It's separate to keep camera logic organized.
 */

import Phaser from 'phaser'
import { CAMERA_CONFIG } from '../config/variables'

export class CameraManager {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * Sets up the camera to follow the player
   * @param player - The player object to follow
   */
  setupCamera(player: Phaser.GameObjects.GameObject): void {
    // Setting up camera
    
    // Get world size
    const worldWidth = this.scene.physics.world.bounds.width
    const worldHeight = this.scene.physics.world.bounds.height
    
    // Make camera follow the player smoothly
    this.scene.cameras.main.startFollow(
      player, 
      true, // Smooth following
      CAMERA_CONFIG.FOLLOW_SPEED_X, 
      CAMERA_CONFIG.FOLLOW_SPEED_Y
    )
    
    // Set camera boundaries to the world size
    this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    
    // Set camera zoom level
    this.scene.cameras.main.setZoom(CAMERA_CONFIG.ZOOM)
    
    // Set camera deadzone (how much player can move before camera follows)
    this.scene.cameras.main.setDeadzone(CAMERA_CONFIG.DEADZONE_X, CAMERA_CONFIG.DEADZONE_Y)
    
    // Camera setup complete
  }
}

