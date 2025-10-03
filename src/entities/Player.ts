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
 * and visual representation. Uses a simple black square as the player sprite.
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
  private graphics!: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, config: PlayerConfig) {
    // Initialize the sprite with empty texture (we'll create our own graphics)
    super(scene, config.x, config.y, '')
    
    this.speed = config.speed
    
    // Create the visual representation as a simple black square
    this.createPlayerGraphics(scene)
    
    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Set up physics body properties
    this.setupPhysics()
    
    // Set up input controls
    this.setupInput()
  }

  /**
   * Creates the visual representation of the player
   * Uses a simple black square that's clearly visible against the background
   */
  private createPlayerGraphics(scene: Phaser.Scene): void {
    this.graphics = scene.add.graphics()
    this.graphics.fillStyle(PLAYER_CONFIG.COLOR) // Use color from config
    this.graphics.fillRect(
      -PLAYER_CONFIG.SIZE / 2, 
      -PLAYER_CONFIG.SIZE / 2, 
      PLAYER_CONFIG.SIZE, 
      PLAYER_CONFIG.SIZE
    )
    this.graphics.setDepth(1000) // Ensure it's rendered on top of background
  }

  /**
   * Sets up physics properties for the player
   */
  private setupPhysics(): void {
    this.setCollideWorldBounds(true) // Prevent player from leaving the world
    this.setDrag(PLAYER_CONFIG.DRAG) // Add friction for smooth movement
    this.body!.setSize(PLAYER_CONFIG.SIZE, PLAYER_CONFIG.SIZE) // Set collision box size
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
   * Updates player movement and position
   * Called every frame by the game loop
   */
  public update(): void {
    if (!this.wasdKeys || !this.cursors) return

    // Reset velocity to zero each frame
    this.setVelocity(0)

    // Handle movement input
    this.handleMovement()
    
    // Synchronize graphics position with physics body
    this.syncGraphicsPosition()
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

  /**
   * Synchronizes the graphics object position with the physics body
   * This ensures the visual representation follows the physics simulation
   */
  private syncGraphicsPosition(): void {
    this.graphics.x = this.x
    this.graphics.y = this.y
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
