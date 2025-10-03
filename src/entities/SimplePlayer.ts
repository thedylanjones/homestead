/**
 * Simple Player - Easy to Understand Player Class
 * 
 * This is a simplified version of the player that's easier to understand
 * and modify. It handles basic movement and physics.
 */

import Phaser from 'phaser'
import { PLAYER_CONFIG } from '../config/variables'

export class SimplePlayer extends Phaser.Physics.Arcade.Sprite {
  private speed: number
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  } | null = null

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Create the sprite with the player image
    super(scene, x, y, 'player-sprite')
    
    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Store speed
    this.speed = PLAYER_CONFIG.SPEED
    
    // Set up physics and controls
    this.setupPhysics()
    this.setupControls()
    
    console.log('Simple player created')
  }

  /**
   * Sets up basic physics properties
   */
  private setupPhysics(): void {
    // Prevent player from leaving the world
    this.setCollideWorldBounds(true)
    
    // Add friction for smooth movement
    this.setDrag(PLAYER_CONFIG.DRAG)
    
    // Set collision box size
    this.body!.setSize(PLAYER_CONFIG.SIZE, PLAYER_CONFIG.SIZE)
    
    // Use the scale from configuration (2.0 = double size)
    this.setScale(PLAYER_CONFIG.SCALE)
  }

  /**
   * Sets up keyboard controls
   */
  private setupControls(): void {
    // WASD keys
    this.wasdKeys = this.scene.input.keyboard!.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key
      A: Phaser.Input.Keyboard.Key
      S: Phaser.Input.Keyboard.Key
      D: Phaser.Input.Keyboard.Key
    }
    
    // Arrow keys
    this.cursors = this.scene.input.keyboard!.createCursorKeys()
  }

  /**
   * Updates player movement - called every frame
   */
  update(): void {
    // Safety check
    if (!this.wasdKeys || !this.cursors) return

    // Reset velocity each frame for smooth movement
    this.setVelocity(0)

    // Check for movement input and move accordingly
    this.handleMovement()
  }

  /**
   * Handles movement based on keyboard input
   */
  private handleMovement(): void {
    // Move up
    if (this.wasdKeys!.W.isDown || this.cursors!.up.isDown) {
      this.setVelocityY(-this.speed)
    }
    
    // Move down
    if (this.wasdKeys!.S.isDown || this.cursors!.down.isDown) {
      this.setVelocityY(this.speed)
    }
    
    // Move left
    if (this.wasdKeys!.A.isDown || this.cursors!.left.isDown) {
      this.setVelocityX(-this.speed)
    }
    
    // Move right
    if (this.wasdKeys!.D.isDown || this.cursors!.right.isDown) {
      this.setVelocityX(this.speed)
    }
  }

  /**
   * Gets the current speed
   */
  getSpeed(): number {
    return this.speed
  }

  /**
   * Sets the movement speed
   */
  setSpeed(speed: number): void {
    this.speed = speed
  }
}
