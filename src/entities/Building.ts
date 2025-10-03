// Import Phaser game engine and our configuration settings
import Phaser from 'phaser'
import { BUILDING_CONFIG } from '../config/variables'

/**
 * Building Type - The different types of buildings available
 */
export type BuildingType = keyof typeof BUILDING_CONFIG.TYPES

/**
 * Building Configuration Interface
 * 
 * This defines what information we need to create a building.
 */
export interface BuildingConfig {
  x: number // Starting X position (left/right on screen)
  y: number // Starting Y position (up/down on screen)
  type: BuildingType // Type of building to create
}

/**
 * Building Class - Represents a building in the game
 * 
 * This class extends Phaser's Arcade.Sprite and represents buildings that can be
 * constructed by the player. Buildings have health systems, build times, and
 * can heal the player when they collide with them.
 */
export class Building extends Phaser.Physics.Arcade.Sprite {
  // ============================================================================
  // PRIVATE PROPERTIES - Variables that only this class can use
  // ============================================================================
  
  private buildingType: BuildingType // Type of this building
  private buildTime: number // Time it takes to build (in milliseconds)
  private maxHealth: number = 100 // Maximum health points
  private currentHealth: number = 10 // Starting health (10% of max)
  private isBuilt: boolean = false // Whether the building is fully constructed
  private playerBuildStartTime: number = 0 // When player first stepped on building to build it
  private isPlayerBuilding: boolean = false // Whether player is currently building this
  
  // Health bar display
  private healthBar: Phaser.GameObjects.Graphics | null = null
  private healthBarBackground: Phaser.GameObjects.Graphics | null = null
  
  // Building visual elements
  private buildingBox: Phaser.GameObjects.Graphics | null = null
  private buildingLabel: Phaser.GameObjects.Text | null = null

  // ============================================================================
  // CONSTRUCTOR - Runs when a new Building is created
  // ============================================================================
  
  /**
   * Creates a new Building
   * @param scene - The game scene this building belongs to
   * @param config - Configuration object with position and type
   */
  constructor(scene: Phaser.Scene, config: BuildingConfig) {
    // Call the parent constructor to create the sprite
    super(scene, config.x, config.y, '')
    
    // Store building type and get its configuration
    this.buildingType = config.type
    const buildingConfig = BUILDING_CONFIG.TYPES[this.buildingType]
    
    // Set build time
    this.buildTime = buildingConfig.BUILD_TIME
    
    // Add this sprite to the scene so it appears on screen
    scene.add.existing(this)
    
    // Enable physics for this sprite so it can collide with the player
    scene.physics.add.existing(this)
    
    // Set up physics body properties
    this.setupPhysics()
    
    // Create building visual elements
    this.createBuildingVisuals()
    
    // Create health bar display
    this.createHealthBar()
    
    // Start building process
    this.startBuilding()
  }

  // ============================================================================
  // PHYSICS SETUP - How the building behaves physically
  // ============================================================================
  
  /**
   * Sets up physics properties for the building
   */
  private setupPhysics(): void {
    const buildingConfig = BUILDING_CONFIG.TYPES[this.buildingType]
    
    // Set the collision box size
    this.body!.setSize(buildingConfig.SIZE, buildingConfig.SIZE)
    
    // Make building immovable (can't be pushed around)
    this.body!.immovable = true
  }

  // ============================================================================
  // VISUAL CREATION - Creating the building appearance
  // ============================================================================
  
  /**
   * Creates the visual elements of the building
   */
  private createBuildingVisuals(): void {
    const buildingConfig = BUILDING_CONFIG.TYPES[this.buildingType]
    
    // Create building box (colored rectangle)
    this.buildingBox = this.scene.add.graphics()
    this.buildingBox.fillStyle(buildingConfig.COLOR)
    this.buildingBox.fillRect(
      -buildingConfig.SIZE / 2,
      -buildingConfig.SIZE / 2,
      buildingConfig.SIZE,
      buildingConfig.SIZE
    )
    this.buildingBox.setDepth(2) // Above player but below UI
    
    // Create building label
    this.buildingLabel = this.scene.add.text(0, 0, buildingConfig.NAME, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    })
    this.buildingLabel.setOrigin(0.5, 0.5)
    this.buildingLabel.setDepth(3) // Above building box
    
    // Position visuals relative to building
    this.buildingBox.x = this.x
    this.buildingBox.y = this.y
    this.buildingLabel.x = this.x
    this.buildingLabel.y = this.y
  }

  // ============================================================================
  // HEALTH BAR SYSTEM - Visual health display
  // ============================================================================
  
  /**
   * Creates a health bar above the building
   */
  private createHealthBar(): void {
    // Create health bar background (black rectangle)
    this.healthBarBackground = this.scene.add.graphics()
    this.healthBarBackground.fillStyle(0x000000)
    this.healthBarBackground.fillRect(
      -BUILDING_CONFIG.UI.HEALTH_BAR_WIDTH / 2,
      BUILDING_CONFIG.UI.HEALTH_BAR_OFFSET_Y,
      BUILDING_CONFIG.UI.HEALTH_BAR_WIDTH,
      BUILDING_CONFIG.UI.HEALTH_BAR_HEIGHT
    )
    this.healthBarBackground.setDepth(10)
    
    // Create health bar (green rectangle)
    this.healthBar = this.scene.add.graphics()
    this.healthBar.setDepth(11)
    
    // Update the health bar display
    this.updateHealthBar()
  }

  /**
   * Updates the health bar display
   */
  private updateHealthBar(): void {
    if (!this.healthBar || !this.healthBarBackground) return
    
    // Don't show health bar if at full health
    if (this.currentHealth >= this.maxHealth) {
      this.healthBar.setVisible(false)
      this.healthBarBackground.setVisible(false)
      return
    }
    
    // Show health bar if not at full health
    this.healthBar.setVisible(true)
    this.healthBarBackground.setVisible(true)
    
    // Clear previous health bar
    this.healthBar.clear()
    
    // Calculate health percentage
    const healthPercent = this.currentHealth / this.maxHealth
    
    // Draw health bar
    this.healthBar.fillStyle(BUILDING_CONFIG.TYPES[this.buildingType].HEALTH_BAR_COLOR)
    this.healthBar.fillRect(
      -BUILDING_CONFIG.UI.HEALTH_BAR_WIDTH / 2,
      BUILDING_CONFIG.UI.HEALTH_BAR_OFFSET_Y,
      BUILDING_CONFIG.UI.HEALTH_BAR_WIDTH * healthPercent,
      BUILDING_CONFIG.UI.HEALTH_BAR_HEIGHT
    )
  }

  /**
   * Updates health bar position (called every frame)
   */
  private updateHealthBarPosition(): void {
    if (!this.healthBar || !this.healthBarBackground) return
    
    // Update positions to follow the building
    this.healthBarBackground.x = this.x
    this.healthBarBackground.y = this.y
    this.healthBar.x = this.x
    this.healthBar.y = this.y
  }

  // ============================================================================
  // BUILDING PROCESS - Managing the construction
  // ============================================================================
  
  /**
   * Starts the building construction process
   */
  private startBuilding(): void {
    // Building completion is now handled in updateBuildingProgress when player is on it
    // No need to track build start time since we track when player first steps on it
  }

  /**
   * Finishes the building construction
   */
  private finishBuilding(): void {
    this.isBuilt = true
    this.currentHealth = this.maxHealth
    this.isPlayerBuilding = false // Reset building state
    this.updateHealthBar()
    
    // Building construction complete
  }

  // ============================================================================
  // UPDATE METHOD - Called every frame to update the building
  // ============================================================================
  
  /**
   * Updates building state and visuals
   * @param player - The player to check collision with for building progress
   */
  public update(player: any): void {
    // Update health bar position
    this.updateHealthBarPosition()
    
    // Update building construction progress (only when player is on it)
    this.updateBuildingProgress(player)
  }

  /**
   * Updates building construction progress - only when player is standing on it
   */
  private updateBuildingProgress(player: any): void {
    if (this.isBuilt) return
    
    const isPlayerOnBuilding = this.isPlayerColliding(player)
    
    // If player just stepped on the building, start tracking build time
    if (isPlayerOnBuilding && !this.isPlayerBuilding) {
      this.isPlayerBuilding = true
      this.playerBuildStartTime = this.scene.time.now
    }
    
    // If player stepped off the building, stop tracking build time
    if (!isPlayerOnBuilding && this.isPlayerBuilding) {
      this.isPlayerBuilding = false
    }
    
    // Only increase health if player is currently building
    if (this.isPlayerBuilding) {
      const elapsedTime = this.scene.time.now - this.playerBuildStartTime
      const progress = Math.min(elapsedTime / this.buildTime, 1.0)
      
      // Health increases from 10% to 100% during construction when player is on it
      this.currentHealth = 10 + (90 * progress)
      this.updateHealthBar()
      
      // Check if building is complete
      if (progress >= 1.0) {
        this.finishBuilding()
      }
    }
  }

  // ============================================================================
  // COLLISION AND INTERACTION
  // ============================================================================
  
  /**
   * Checks if the player is colliding with this building
   * @param player - The player to check collision with
   * @returns True if player is colliding with building
   */
  public isPlayerColliding(player: any): boolean {
    if (!player) return false
    
    // Calculate squared distance between player and building (avoid Math.sqrt)
    const dx = this.x - player.x
    const dy = this.y - player.y
    const squaredDistance = dx * dx + dy * dy
    
    // Check if they're close enough to collide
    const buildingConfig = BUILDING_CONFIG.TYPES[this.buildingType]
    const collisionDistance = (buildingConfig.SIZE + 32) / 2 // 32 is player size
    const collisionDistanceSquared = collisionDistance * collisionDistance
    
    return squaredDistance <= collisionDistanceSquared
  }

  /**
   * Heals the player when they're colliding with this building
   * @param player - The player to heal
   * @param healingPerSecond - How much healing per second
   */
  public healPlayer(player: any, healingPerSecond: number = 50): void {
    if (!this.isPlayerColliding(player)) return
    
    // Only heal if building is at full health (100%)
    if (this.currentHealth < this.maxHealth) return
    
    // Heal player over time
    const healingAmount = healingPerSecond * (1/60) // Assuming 60 FPS
    player.heal(healingAmount)
  }

  // ============================================================================
  // PUBLIC GETTERS AND SETTERS
  // ============================================================================

  /**
   * Gets the building type
   */
  public getBuildingType(): BuildingType {
    return this.buildingType
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
   * Gets the health percentage (0.0 to 1.0)
   */
  public getHealthPercentage(): number {
    return this.currentHealth / this.maxHealth
  }

  /**
   * Checks if the building is fully constructed
   */
  public isFullyBuilt(): boolean {
    return this.isBuilt
  }

  /**
   * Gets the building configuration
   */
  public getBuildingConfig() {
    return BUILDING_CONFIG.TYPES[this.buildingType]
  }

  /**
   * Destroys the building and cleans up resources
   */
  public destroy(): void {
    // Clean up health bar
    if (this.healthBar) {
      this.healthBar.destroy()
      this.healthBar = null
    }
    if (this.healthBarBackground) {
      this.healthBarBackground.destroy()
      this.healthBarBackground = null
    }
    
    // Clean up building visuals
    if (this.buildingBox) {
      this.buildingBox.destroy()
      this.buildingBox = null
    }
    if (this.buildingLabel) {
      this.buildingLabel.destroy()
      this.buildingLabel = null
    }
    
    // Call parent destroy
    super.destroy()
  }
}
