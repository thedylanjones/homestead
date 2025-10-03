import Phaser from 'phaser'
import { Player, PlayerConfig } from '../entities/Player'
import { 
  WORLD_CONFIG, 
  CAMERA_CONFIG, 
  BACKGROUND_CONFIG, 
  PLAYER_CONFIG,
  GAME_CONFIG 
} from '../config/variables'

/**
 * Main Game Scene
 * 
 * This is the primary scene where the game takes place. It handles:
 * - World creation and background rendering
 * - Player creation and management
 * - Camera setup and following
 * - Game loop updates
 */
export class GameScene extends Phaser.Scene {
  private player: Player | null = null
  private worldWidth: number = WORLD_CONFIG.WIDTH
  private worldHeight: number = WORLD_CONFIG.HEIGHT

  constructor() {
    super({ key: 'GameScene' })
  }

  /**
   * Scene creation method - called once when the scene starts
   * Sets up the world, background, player, and camera
   */
  public create(): void {
    // Set up the physics world boundaries
    this.setupWorld()
    
    // Create the beautiful farm-at-sunset background
    this.createFarmBackground()
    
    // Create and initialize the player
    this.createPlayer()
    
    // Set up camera to follow the player
    this.setupCamera()
    
    // Log successful scene creation
    if (GAME_CONFIG.DEBUG.CONSOLE_LOGS) {
      console.log('GameScene created successfully')
    }
  }

  /**
   * Sets up the physics world boundaries
   */
  private setupWorld(): void {
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
  }

  /**
   * Creates the beautiful farm-at-sunset background
   * Includes gradient, grass texture, and atmospheric effects
   */
  private createFarmBackground(): void {
    // Create the main gradient background
    this.createGradientBackground()
    
    // Add subtle grass texture for realism
    this.createGrassTexture()
    
    // Add atmospheric effects (clouds, light rays)
    this.createAtmosphere()
  }

  /**
   * Creates the main gradient background
   * Uses warm sunset colors transitioning to earth tones
   */
  private createGradientBackground(): void {
    const graphics = this.add.graphics()
    
    // Create a beautiful sunset gradient from warm orange to soft brown
    graphics.fillGradientStyle(
      BACKGROUND_CONFIG.GRADIENT_COLORS.TOP,      // Warm orange (sunset)
      BACKGROUND_CONFIG.GRADIENT_COLORS.MID_TOP,  // Soft orange
      BACKGROUND_CONFIG.GRADIENT_COLORS.MID_BOTTOM, // Light green (grass)
      BACKGROUND_CONFIG.GRADIENT_COLORS.BOTTOM    // Saddle brown (earth)
    )
    graphics.fillRect(0, 0, this.worldWidth, this.worldHeight)
  }

  /**
   * Creates subtle grass texture and dirt spots for realism
   */
  private createGrassTexture(): void {
    const grassGraphics = this.add.graphics()
    
    // Create grass blades
    this.createGrassBlades(grassGraphics)
    
    // Add dirt spots for realism
    this.createDirtSpots(grassGraphics)
  }

  /**
   * Creates individual grass blades across the background
   */
  private createGrassBlades(graphics: Phaser.GameObjects.Graphics): void {
    graphics.lineStyle(1, BACKGROUND_CONFIG.GRASS.COLOR, BACKGROUND_CONFIG.GRASS.OPACITY)
    
    // Draw grass blades randomly across the background
    for (let i = 0; i < BACKGROUND_CONFIG.GRASS.COUNT; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth)
      const y = Phaser.Math.Between(0, this.worldHeight)
      const height = Phaser.Math.Between(
        BACKGROUND_CONFIG.GRASS.MIN_HEIGHT, 
        BACKGROUND_CONFIG.GRASS.MAX_HEIGHT
      )
      
      // Draw a small grass blade
      graphics.moveTo(x, y)
      graphics.lineTo(x + Phaser.Math.Between(-1, 1), y - height)
    }
    
    graphics.strokePath()
  }

  /**
   * Creates dirt spots for added realism
   */
  private createDirtSpots(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(BACKGROUND_CONFIG.DIRT.COLOR, BACKGROUND_CONFIG.DIRT.OPACITY)
    
    for (let i = 0; i < BACKGROUND_CONFIG.DIRT.COUNT; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth)
      const y = Phaser.Math.Between(0, this.worldHeight)
      const size = Phaser.Math.Between(
        BACKGROUND_CONFIG.DIRT.MIN_SIZE, 
        BACKGROUND_CONFIG.DIRT.MAX_SIZE
      )
      
      graphics.fillCircle(x, y, size)
    }
  }

  /**
   * Creates atmospheric effects like clouds and light rays
   */
  private createAtmosphere(): void {
    const atmosphereGraphics = this.add.graphics()
    
    // Create cloud-like shapes
    this.createClouds(atmosphereGraphics)
    
    // Create light rays
    this.createLightRays(atmosphereGraphics)
  }

  /**
   * Creates soft cloud-like shapes in the sky
   */
  private createClouds(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(
      BACKGROUND_CONFIG.ATMOSPHERE.CLOUD_COLOR, 
      BACKGROUND_CONFIG.ATMOSPHERE.CLOUD_OPACITY
    )
    
    // Create soft cloud-like shapes
    for (let i = 0; i < BACKGROUND_CONFIG.ATMOSPHERE.CLOUD_COUNT; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth)
      const y = Phaser.Math.Between(0, this.worldHeight * BACKGROUND_CONFIG.ATMOSPHERE.CLOUD_MAX_Y)
      const size = Phaser.Math.Between(
        BACKGROUND_CONFIG.ATMOSPHERE.CLOUD_MIN_SIZE, 
        BACKGROUND_CONFIG.ATMOSPHERE.CLOUD_MAX_SIZE
      )
      
      graphics.fillCircle(x, y, size)
    }
  }

  /**
   * Creates warm light rays from the sun
   */
  private createLightRays(graphics: Phaser.GameObjects.Graphics): void {
    graphics.lineStyle(2, BACKGROUND_CONFIG.ATMOSPHERE.LIGHT_RAY_COLOR, BACKGROUND_CONFIG.ATMOSPHERE.LIGHT_RAY_OPACITY)
    
    for (let i = 0; i < BACKGROUND_CONFIG.ATMOSPHERE.LIGHT_RAY_COUNT; i++) {
      const startX = Phaser.Math.Between(0, this.worldWidth)
      const startY = 0
      const endX = startX + Phaser.Math.Between(-50, 50)
      const endY = Phaser.Math.Between(100, BACKGROUND_CONFIG.ATMOSPHERE.LIGHT_RAY_LENGTH)
      
      graphics.moveTo(startX, startY)
      graphics.lineTo(endX, endY)
    }
    
    graphics.strokePath()
  }

  /**
   * Creates and initializes the player character
   */
  private createPlayer(): void {
    const playerConfig: PlayerConfig = {
      x: this.worldWidth / 2,  // Start at world center
      y: this.worldHeight / 2, // Start at world center
      speed: PLAYER_CONFIG.SPEED
    }
    
    this.player = new Player(this, playerConfig)
    
    // Debug logging
    if (GAME_CONFIG.DEBUG.CONSOLE_LOGS) {
      console.log('Player created at:', this.player.x, this.player.y)
      console.log('Player visible:', this.player.visible)
      console.log('Player alpha:', this.player.alpha)
    }
  }

  /**
   * Sets up the camera to follow the player smoothly
   */
  private setupCamera(): void {
    if (!this.player) return
    
    // Make camera follow the player smoothly
    this.cameras.main.startFollow(
      this.player, 
      true, 
      CAMERA_CONFIG.FOLLOW_SPEED_X, 
      CAMERA_CONFIG.FOLLOW_SPEED_Y
    )
    
    // Set camera bounds to the world
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight)
    
    // Set camera zoom level
    this.cameras.main.setZoom(CAMERA_CONFIG.ZOOM)
    
    // Set camera deadzone (0 = no deadzone, camera always follows)
    this.cameras.main.setDeadzone(CAMERA_CONFIG.DEADZONE_X, CAMERA_CONFIG.DEADZONE_Y)
  }

  /**
   * Game update loop - called every frame
   * Updates all game objects and systems
   */
  public update(): void {
    // Update player movement and position
    if (this.player) {
      this.player.update()
    }
  }
}
