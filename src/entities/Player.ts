// Import Phaser game engine and our configuration settings
import Phaser from 'phaser'
import { PLAYER_CONFIG } from '../config/variables'

/**
 * Player Configuration Interface
 * 
 * This defines what information we need to create a player.
 * Think of it like a form that needs to be filled out.
 * 
 * @interface PlayerConfig - The "form" for creating a player
 */
export interface PlayerConfig {
  x: number // Starting X position (left/right on screen)
  y: number // Starting Y position (up/down on screen)
  speed: number // How fast the player moves
}

/**
 * Player Class - The main character the player controls
 * 
 * This class extends Phaser's Arcade.Sprite, which means it's a visual object
 * that can be displayed on screen, moved around, and has physics.
 * 
 * Think of this like creating a character in a game - it has:
 * - A visual appearance (sprite/image)
 * - The ability to move around with physics
 * - Input controls (keyboard keys)
 * - Movement rules and collision detection
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  // ============================================================================
  // PRIVATE PROPERTIES - Variables that only this class can use
  // ============================================================================
  
  private speed: number // How fast this player moves (pixels per frame)
  
  // Health system
  private maxHealth: number // Maximum health points
  private currentHealth: number // Current health points
  private isDead: boolean = false // Whether the player is dead
  
  // Health bar display
  private healthBar: Phaser.GameObjects.Graphics | null = null // Health bar display
  private healthBarBackground: Phaser.GameObjects.Graphics | null = null // Health bar background
  
  // Attack system
  private lastAutoAttackTime: number = 0 // When the player last auto-attacked
  private lastDirection: { x: number, y: number } = { x: 1, y: 0 } // Last movement direction
  private attackVisual: Phaser.GameObjects.Graphics | null = null // Attack visual indicator
  private isAttackActive: boolean = false // Whether an attack is currently active
  private hitEnemies: Set<any> = new Set() // Track which enemies have been hit by current attack
  
  // Arrow keys for building selection (up, down, left, right)
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  
  // WASD keys for movement (W=up, A=left, S=down, D=right)
  private wasdKeys: {
    W: Phaser.Input.Keyboard.Key // Up movement key
    A: Phaser.Input.Keyboard.Key // Left movement key
    S: Phaser.Input.Keyboard.Key // Down movement key
    D: Phaser.Input.Keyboard.Key // Right movement key
  } | null = null
  
  // Building selection system
  private selectedBuildingType: string = 'POWER' // Currently selected building type
  private buildingTypes: string[] = ['POWER', 'WATER', 'FOOD', 'TURRET'] // Available building types
  private selectedBuildingIndex: number = 0 // Index of currently selected building

  // ============================================================================
  // CONSTRUCTOR - Runs when a new Player is created
  // ============================================================================
  
  /**
   * Creates a new Player
   * @param scene - The game scene this player belongs to
   * @param config - Configuration object with starting position and speed
   */
  constructor(scene: Phaser.Scene, config: PlayerConfig) {
    // Call the parent constructor to create the sprite with the player image
    super(scene, config.x, config.y, 'player-sprite')
    
    // Store the movement speed for later use
    this.speed = config.speed
    
    // Initialize health system
    this.maxHealth = PLAYER_CONFIG.MAX_HEALTH
    this.currentHealth = this.maxHealth
    
    // Add this sprite to the scene so it appears on screen
    scene.add.existing(this)
    
    // Enable physics for this sprite so it can move and collide with things
    scene.physics.add.existing(this)
    
    // Set up physics body properties (how it moves, collides, etc.)
    this.setupPhysics()
    
    // Set up input controls (keyboard keys for movement)
    this.setupInput()
    
    // Create health bar display
    this.createHealthBar()
  }


  // ============================================================================
  // PHYSICS SETUP - How the player moves and collides
  // ============================================================================
  
  /**
   * Sets up physics properties for the player
   * 
   * This method configures how the player behaves in the game world:
   * - How it collides with world boundaries
   * - How much friction it has when moving
   * - What size its collision box is
   * - How big it appears on screen
   */
  private setupPhysics(): void {
    // Prevent player from leaving the game world (like invisible walls)
    this.setCollideWorldBounds(true)
    
    // Add friction so the player doesn't slide forever (like ice vs carpet)
    this.setDrag(PLAYER_CONFIG.DRAG)
    
    // Set the collision box size (the invisible box used for collision detection)
    this.body!.setSize(PLAYER_CONFIG.SIZE, PLAYER_CONFIG.SIZE)
    
    // Use the scale from configuration (2.0 = double size)
    this.setScale(PLAYER_CONFIG.SCALE)
  }

  // ============================================================================
  // INPUT SETUP - How the player controls the character
  // ============================================================================
  
  /**
   * Sets up input controls for player movement and building selection
   * 
   * This method creates keyboard controls:
   * - WASD keys for player movement
   * - Arrow keys for building selection
   */
  private setupInput(): void {
    // Set up WASD keys for movement (common in PC games)
    this.wasdKeys = this.scene.input.keyboard!.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key // W key for moving up
      A: Phaser.Input.Keyboard.Key // A key for moving left
      S: Phaser.Input.Keyboard.Key // S key for moving down
      D: Phaser.Input.Keyboard.Key // D key for moving right
    }
    
    // Set up arrow keys for building selection
    this.cursors = this.scene.input.keyboard!.createCursorKeys()
  }

  // ============================================================================
  // UPDATE METHOD - Called every frame to update the player
  // ============================================================================
  
  /**
   * Updates player movement and position
   * 
   * This method is called every frame (60 times per second) by the game loop.
   * It handles all the player's movement and input processing.
   */
  public update(): void {
    // Don't update if dead
    if (this.isDead) return
    
    // Safety check: make sure input keys are set up
    if (!this.wasdKeys || !this.cursors) return

    // Handle movement input (WASD keys only)
    this.handleMovement()
    
    // Handle building selection input (arrow keys)
    this.handleBuildingSelection()
    
    // Update health bar position only if health changed
    this.updateHealthBarPosition()
    
    // Update attack visual if it exists
    this.updateAttackVisual()
    
    // Check for auto-attack
    this.checkAutoAttack()
  }

  // ============================================================================
  // MOVEMENT HANDLING - How the player moves based on input
  // ============================================================================
  
  /**
   * Handles player movement based on WASD keyboard input
   * 
   * This method checks which WASD keys are currently pressed and moves the player
   * in the appropriate direction. Arrow keys are used for building selection.
   */
  private handleMovement(): void {
    // Safety check: make sure input keys are set up
    if (!this.wasdKeys) return

    let isMoving = false

    // ============================================================================
    // VERTICAL MOVEMENT (Up and Down)
    // ============================================================================
    
    // Move up if W key is pressed
    if (this.wasdKeys.W.isDown) {
      this.setVelocityY(-this.speed) // Negative Y moves up
      this.lastDirection = { x: 0, y: -1 } // Update last direction
      isMoving = true
    }
    
    // Move down if S key is pressed
    if (this.wasdKeys.S.isDown) {
      this.setVelocityY(this.speed) // Positive Y moves down
      this.lastDirection = { x: 0, y: 1 } // Update last direction
      isMoving = true
    }
    
    // ============================================================================
    // HORIZONTAL MOVEMENT (Left and Right)
    // ============================================================================
    
    // Move left if A key is pressed
    if (this.wasdKeys.A.isDown) {
      this.setVelocityX(-this.speed) // Negative X moves left
      this.lastDirection = { x: -1, y: 0 } // Update last direction
      isMoving = true
    }
    
    // Move right if D key is pressed
    if (this.wasdKeys.D.isDown) {
      this.setVelocityX(this.speed) // Positive X moves right
      this.lastDirection = { x: 1, y: 0 } // Update last direction
      isMoving = true
    }

    // Only reset velocity if not moving (optimization)
    if (!isMoving) {
      this.setVelocity(0)
    }
  }

  // ============================================================================
  // BUILDING SELECTION HANDLING - Arrow keys for building selection
  // ============================================================================
  
  /**
   * Handles building selection based on arrow key input
   * 
   * This method uses arrow keys to select different building types:
   * - Left/Right arrows: Select different building types
   * - Up arrow: Place selected building (handled by GameScene)
   */
  private handleBuildingSelection(): void {
    // Safety check: make sure input keys are set up
    if (!this.cursors) return

    // Left arrow: Previous building type
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedBuildingIndex = (this.selectedBuildingIndex - 1 + this.buildingTypes.length) % this.buildingTypes.length
      this.selectedBuildingType = this.buildingTypes[this.selectedBuildingIndex]
      
      // Notify scene of building selection change
      if (this.scene && 'onBuildingSelectionChanged' in this.scene) {
        (this.scene as any).onBuildingSelectionChanged(this.selectedBuildingType, this.selectedBuildingIndex)
      }
    }
    
    // Right arrow: Next building type
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedBuildingIndex = (this.selectedBuildingIndex + 1) % this.buildingTypes.length
      this.selectedBuildingType = this.buildingTypes[this.selectedBuildingIndex]
      
      // Notify scene of building selection change
      if (this.scene && 'onBuildingSelectionChanged' in this.scene) {
        (this.scene as any).onBuildingSelectionChanged(this.selectedBuildingType, this.selectedBuildingIndex)
      }
    }
    
    // Up arrow: Place building (handled by GameScene)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      // Notify scene to place building
      if (this.scene && 'onBuildingPlacementRequested' in this.scene) {
        (this.scene as any).onBuildingPlacementRequested(this.selectedBuildingType)
      }
    }
  }

  // ============================================================================
  // HEALTH BAR SYSTEM - Visual health display
  // ============================================================================
  
  /**
   * Creates a health bar above the player
   */
  private createHealthBar(): void {
    // Create health bar background (black rectangle)
    this.healthBarBackground = this.scene.add.graphics()
    this.healthBarBackground.fillStyle(PLAYER_CONFIG.HEALTH_BAR.BACKGROUND_COLOR)
    this.healthBarBackground.fillRect(
      -PLAYER_CONFIG.HEALTH_BAR.WIDTH / 2, 
      PLAYER_CONFIG.HEALTH_BAR.OFFSET_Y, 
      PLAYER_CONFIG.HEALTH_BAR.WIDTH, 
      PLAYER_CONFIG.HEALTH_BAR.HEIGHT
    )
    this.healthBarBackground.setDepth(10) // Make sure it's visible
    
    // Create health bar (green/red rectangle)
    this.healthBar = this.scene.add.graphics()
    this.healthBar.setDepth(11) // Above the background
    
    // Update the health bar display
    this.updateHealthBar()
  }

  /**
   * Updates the health bar display (only when health changes)
   */
  private updateHealthBar(): void {
    if (!this.healthBar || !this.healthBarBackground) return
    
    // Clear previous health bar
    this.healthBar.clear()
    
    // Calculate health percentage
    const healthPercent = this.currentHealth / this.maxHealth
    
    // Choose color based on health (green when healthy, red when damaged)
    const healthColor = healthPercent > 0.5 ? 
      PLAYER_CONFIG.HEALTH_BAR.HEALTH_COLOR : 
      PLAYER_CONFIG.HEALTH_BAR.DAMAGE_COLOR
    
    // Draw health bar
    this.healthBar.fillStyle(healthColor)
    this.healthBar.fillRect(
      -PLAYER_CONFIG.HEALTH_BAR.WIDTH / 2, 
      PLAYER_CONFIG.HEALTH_BAR.OFFSET_Y, 
      PLAYER_CONFIG.HEALTH_BAR.WIDTH * healthPercent, 
      PLAYER_CONFIG.HEALTH_BAR.HEIGHT
    )
  }

  /**
   * Updates health bar position (called every frame)
   */
  private updateHealthBarPosition(): void {
    if (!this.healthBar || !this.healthBarBackground) return
    
    // Update positions to follow the player
    this.healthBarBackground.x = this.x
    this.healthBarBackground.y = this.y
    this.healthBar.x = this.x
    this.healthBar.y = this.y
  }

  // ============================================================================
  // DAMAGE AND HEALTH SYSTEM
  // ============================================================================
  
  /**
   * Takes damage and updates health
   * @param damage - Amount of damage to take
   */
  public takeDamage(damage: number): void {
    this.currentHealth -= damage
    
    // Make sure health doesn't go below 0
    if (this.currentHealth <= 0) {
      this.currentHealth = 0
      this.die()
    }
    
    // Update health bar display
    this.updateHealthBar()
    
    // Player takes damage
  }

  /**
   * Heals the player
   * @param healing - Amount of health to restore
   */
  public heal(healing: number): void {
    this.currentHealth += healing
    
    // Make sure health doesn't go above maximum
    if (this.currentHealth > this.maxHealth) {
      this.currentHealth = this.maxHealth
    }
    
    // Update health bar display
    this.updateHealthBar()
    
    // Player heals
  }

  /**
   * Handles player death
   */
  private die(): void {
    this.isDead = true
    
    // Stop moving
    this.setVelocity(0)
    
    // Hide the player (you could add death animation here)
    this.setVisible(false)
    
    // Clean up health bar
    if (this.healthBar) {
      this.healthBar.destroy()
      this.healthBar = null
    }
    if (this.healthBarBackground) {
      this.healthBarBackground.destroy()
      this.healthBarBackground = null
    }
    
    // Player has died
    
    // Trigger game over screen
    if (this.scene && 'showGameOverScreen' in this.scene) {
      (this.scene as any).showGameOverScreen()
    }
  }

  // ============================================================================
  // ATTACK SYSTEM - Player attack functionality
  // ============================================================================
  
  /**
   * Checks if auto-attack should trigger
   */
  private checkAutoAttack(): void {
    // Don't auto-attack if dead
    if (this.isDead) return
    
    // Check if enough time has passed since last auto-attack (convert seconds to milliseconds)
    const currentTime = this.scene.time.now
    const intervalMs = PLAYER_CONFIG.ATTACK.INTERVAL * 1000
    
    if (currentTime - this.lastAutoAttackTime >= intervalMs) {
      this.performAutoAttack()
      this.lastAutoAttackTime = currentTime
    }
  }

  /**
   * Performs an auto-attack
   */
  private performAutoAttack(): void {
    // Set attack as active and clear previous hit enemies
    this.isAttackActive = true
    this.hitEnemies.clear()
    
    // Create attack visual
    this.createAttackVisual()
    
    // Player auto-attack
    
    // The actual damage dealing will be handled by the GameScene collision detection
  }

  /**
   * Creates the visual attack indicator
   */
  private createAttackVisual(): void {
    // Remove existing attack visual if it exists
    if (this.attackVisual) {
      this.attackVisual.destroy()
    }
    
    // Create new attack visual
    this.attackVisual = this.scene.add.graphics()
    this.attackVisual.fillStyle(PLAYER_CONFIG.ATTACK.COLOR)
    
    // Calculate attack position
    const attackX = this.lastDirection.x * PLAYER_CONFIG.ATTACK.RANGE
    const attackY = this.lastDirection.y * PLAYER_CONFIG.ATTACK.RANGE
    
    // Draw attack rectangle (white cube/slash)
    this.attackVisual.fillRect(
      attackX - PLAYER_CONFIG.ATTACK.SIZE / 2,
      attackY - PLAYER_CONFIG.ATTACK.SIZE / 2,
      PLAYER_CONFIG.ATTACK.SIZE,
      PLAYER_CONFIG.ATTACK.SIZE
    )
    
    // Position the attack visual relative to the player
    this.attackVisual.x = this.x
    this.attackVisual.y = this.y
    this.attackVisual.setDepth(2) // Above player but below UI
    
    // Remove the attack visual after duration and deactivate attack
    this.scene.time.delayedCall(PLAYER_CONFIG.ATTACK.VISUAL_DURATION * 1000, () => {
      if (this.attackVisual) {
        this.attackVisual.destroy()
        this.attackVisual = null
      }
      // Deactivate attack when visual disappears and clear hit enemies
      this.isAttackActive = false
      this.hitEnemies.clear()
    })
  }

  /**
   * Updates the attack visual position to follow the player
   */
  private updateAttackVisual(): void {
    if (this.attackVisual) {
      this.attackVisual.x = this.x
      this.attackVisual.y = this.y
    }
  }

  /**
   * Gets the current attack position for collision detection
   */
  public getAttackPosition(): { x: number, y: number } {
    return {
      x: this.x + (this.lastDirection.x * PLAYER_CONFIG.ATTACK.RANGE),
      y: this.y + (this.lastDirection.y * PLAYER_CONFIG.ATTACK.RANGE)
    }
  }

  /**
   * Gets the attack damage
   */
  public getAttackDamage(): number {
    return PLAYER_CONFIG.ATTACK.DAMAGE
  }

  /**
   * Gets the attack size for collision detection
   */
  public getAttackSize(): number {
    return PLAYER_CONFIG.ATTACK.SIZE
  }

  /**
   * Gets the last direction the player was facing
   */
  public getLastDirection(): { x: number, y: number } {
    return this.lastDirection
  }

  /**
   * Checks if an attack is currently active
   */
  public isAttackCurrentlyActive(): boolean {
    return this.isAttackActive
  }

  /**
   * Checks if an enemy has already been hit by the current attack
   */
  public hasEnemyBeenHit(enemy: any): boolean {
    return this.hitEnemies.has(enemy)
  }

  /**
   * Marks an enemy as hit by the current attack
   */
  public markEnemyAsHit(enemy: any): void {
    this.hitEnemies.add(enemy)
  }

  // ============================================================================
  // PUBLIC GETTERS AND SETTERS - Methods other classes can use
  // ============================================================================

  /**
   * Gets the current movement speed
   * @returns The current speed value in pixels per frame
   */
  public getSpeed(): number {
    return this.speed
  }

  /**
   * Sets the movement speed
   * @param speed - New speed value in pixels per frame
   */
  public setSpeed(speed: number): void {
    this.speed = speed
  }

  /**
   * Gets the current health
   */
  public getHealth(): number {
    return this.currentHealth
  }

  /**
   * Gets the maximum health
   */
  public getMaxHealth(): number {
    return this.maxHealth
  }

  /**
   * Checks if the player is dead
   */
  public isAlive(): boolean {
    return !this.isDead
  }

  /**
   * Gets the health percentage (0.0 to 1.0)
   */
  public getHealthPercentage(): number {
    return this.currentHealth / this.maxHealth
  }

  /**
   * Gets the currently selected building type
   */
  public getSelectedBuildingType(): string {
    return this.selectedBuildingType
  }

  /**
   * Gets the currently selected building index
   */
  public getSelectedBuildingIndex(): number {
    return this.selectedBuildingIndex
  }

  /**
   * Gets all available building types
   */
  public getBuildingTypes(): string[] {
    return this.buildingTypes
  }
}
