import Phaser from 'phaser'
import { PLAYER_CONFIG } from '../config/variables'

/**
 * Player Configuration Interface
 * Defines the initial setup parameters for the player
 */
export interface PlayerConfig {
  x: number
  y: number
  speed: number
}

/**
 * Player Class
 * 
 * Represents the main character in the game. Handles movement, input,
 * and visual representation. Uses a loaded sprite image from assets.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  } | null = null

  constructor(scene: Phaser.Scene, config: PlayerConfig) {
    // Initialize the sprite with the loaded player sprite image
    super(scene, config.x, config.y, 'player-sprite')
    
    this.speed = config.speed
    
    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Set up physics body properties
    this.setupPhysics()
    
    // Set up input controls
    this.setupInput()
  }


  /**
   * Sets up physics properties for the player - OPTIMIZED
   */
  private setupPhysics(): void {
    this.setCollideWorldBounds(true) // Prevent player from leaving the world
    this.setDrag(PLAYER_CONFIG.DRAG) // Add friction for smooth movement
    this.body!.setSize(32, 32) // Set collision box size to match sprite
    this.setScale(2) // Scale up the sprite for better visibility
    
    // OPTIMIZATION: Configure physics body for better performance
    if (this.body && 'immovable' in this.body) {
      this.body.immovable = false // Allow movement
    }
    if (this.body && 'bounce' in this.body) {
      this.body.bounce.set(0, 0) // No bouncing for better performance
    }
    if (this.body && 'maxVelocity' in this.body) {
      this.body.maxVelocity.set(PLAYER_CONFIG.SPEED, PLAYER_CONFIG.SPEED) // Limit max velocity
    }
  }

  /**
   * Sets up input controls for player movement
   * Supports both WASD keys and arrow keys
   */
  private setupInput(): void {
    // Set up WASD keys for movement
    this.wasdKeys = this.scene.input.keyboard!.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key
      A: Phaser.Input.Keyboard.Key
      S: Phaser.Input.Keyboard.Key
      D: Phaser.Input.Keyboard.Key
    }
    
    // Also set up cursor keys as alternative control scheme
    this.cursors = this.scene.input.keyboard!.createCursorKeys()
  }

  /**
   * Updates player movement and position - OPTIMIZED
   * Called every frame by the game loop
   */
  public update(): void {
    if (!this.wasdKeys || !this.cursors) return

    // OPTIMIZATION: Only reset velocity if there's no input
    const hasInput = this.wasdKeys.W.isDown || this.wasdKeys.S.isDown || 
                    this.wasdKeys.A.isDown || this.wasdKeys.D.isDown ||
                    this.cursors.up.isDown || this.cursors.down.isDown ||
                    this.cursors.left.isDown || this.cursors.right.isDown

    if (!hasInput) {
      // Only reset velocity when no input is detected
      this.setVelocity(0)
    } else {
      // Handle movement input
      this.handleMovement()
    }
  }

  /**
   * Handles player movement based on input
   */
  private handleMovement(): void {
    if (!this.wasdKeys || !this.cursors) return

    // Vertical movement (W/S or Up/Down arrows)
    if (this.wasdKeys.W.isDown || this.cursors.up.isDown) {
      this.setVelocityY(-this.speed)
    }
    if (this.wasdKeys.S.isDown || this.cursors.down.isDown) {
      this.setVelocityY(this.speed)
    }
    
    // Horizontal movement (A/D or Left/Right arrows)
    if (this.wasdKeys.A.isDown || this.cursors.left.isDown) {
      this.setVelocityX(-this.speed)
    }
    if (this.wasdKeys.D.isDown || this.cursors.right.isDown) {
      this.setVelocityX(this.speed)
    }
  }

  // ============================================================================
  // PUBLIC GETTERS AND SETTERS
  // ============================================================================

  /**
   * Gets the current movement speed
   */
  public getSpeed(): number {
    return this.speed
  }

  /**
   * Sets the movement speed
   * @param speed - New speed value in pixels per second
   */
  public setSpeed(speed: number): void {
    this.speed = speed
  }
}
