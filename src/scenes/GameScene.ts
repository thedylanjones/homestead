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
  private grassPositions: { x: number, y: number, rotation: number }[] = []
  private performanceText: Phaser.GameObjects.Text | null = null
  private lastFpsUpdate: number = 0

  constructor() {
    super({ key: 'GameScene' })
  }

  /**
   * Preload method - loads assets before the scene starts
   */
  public preload(): void {
    console.log('Loading assets...')
    
    // Load the basic player sprite image
    this.load.image('player-sprite', '/assets/sprites/basic/player_basic.png')
    console.log('Loading player-sprite from: /assets/sprites/basic/player_basic.png')
    
    // Load the basic grass sprite for world decoration
    this.load.image('grass-basic', '/assets/sprites/basic/grass_basic.png')
    console.log('Loading grass-basic from: /assets/sprites/basic/grass_basic.png')
    
    // Also try loading with a different path format
    this.load.image('grass-basic-alt', './assets/sprites/basic/grass_basic.png')
    console.log('Loading grass-basic-alt from: ./assets/sprites/basic/grass_basic.png')
    
    // Also load an alternative grass texture for testing
    this.load.image('grass-alt', '/assets/sprites/Outdoor/Grass/grass_1-Sheet.png')
    console.log('Loading grass-alt from: /assets/sprites/Outdoor/Grass/grass_1-Sheet.png')
    
    // Add load event listeners to debug asset loading
    this.load.on('filecomplete', (key: string, type: string) => {
      console.log(`Asset loaded successfully: ${key} (${type})`)
    })
    
    this.load.on('loaderror', (file: any) => {
      console.error(`Failed to load asset: ${file.key} from ${file.url}`)
    })
  }

  /**
   * Scene creation method - called once when the scene starts
   * Sets up the world, background, player, and camera
   */
  public create(): void {
    // Set up the physics world boundaries
    this.setupWorld()
    
    // Create the solid green background
    this.createBackground()
    
    // Create scattered grass across the world
    this.createGrassField()
    
    // Create and initialize the player
    this.createPlayer()
    
    // Set up camera to follow the player
    this.setupCamera()
    
    // Add performance monitoring
    this.setupPerformanceMonitoring()
    
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
   * Creates the background - solid green gradient
   */
  private createBackground(): void {
    this.createGradientBackground()
  }


  /**
   * Creates the solid green background
   * Uses solid green color for consistent background
   */
  private createGradientBackground(): void {
    const graphics = this.add.graphics()
    
    // Create solid green background
    graphics.fillGradientStyle(
      BACKGROUND_CONFIG.GRADIENT_COLORS.TOP,      // Green
      BACKGROUND_CONFIG.GRADIENT_COLORS.MID_TOP,  // Green
      BACKGROUND_CONFIG.GRADIENT_COLORS.MID_BOTTOM, // Green
      BACKGROUND_CONFIG.GRADIENT_COLORS.BOTTOM    // Green
    )
    graphics.fillRect(0, 0, this.worldWidth, this.worldHeight)
    
    // Set background to be behind everything else
    graphics.setDepth(-10)
  }

  /**
   * Creates an ultra-optimized grass system with minimal sprites for maximum performance
   */
  private createGrassField(): void {
    // Check if grass texture is loaded
    let grassTextureKey = 'grass-basic'
    if (!this.textures.exists('grass-basic')) {
      console.log('grass-basic not found, trying grass-basic-alt...')
      if (this.textures.exists('grass-basic-alt')) {
        grassTextureKey = 'grass-basic-alt'
        console.log('Using grass-basic-alt instead')
      } else {
        console.error('Neither grass texture found! Available textures:', this.textures.list)
        return
      }
    }
    
    console.log('Grass texture found! Creating ultra-optimized minimal grass system...')
    console.log('Using texture key:', grassTextureKey)
    
    // Generate grass positions with reduced density (50% less common)
    this.generateGrassPositions()
    
    // Create minimal grass sprites - only what's absolutely necessary
    this.createMinimalGrassSprites(grassTextureKey)
    
    if (GAME_CONFIG.DEBUG.CONSOLE_LOGS) {
      console.log(`Created minimal grass system with ${this.grassPositions.length} grass positions`)
    }
  }

  /**
   * Pre-generates all grass positions for the world with reduced density
   */
  private generateGrassPositions(): void {
    const grassSpacing = 200 // Much larger spacing = 50% less common
    const grassCount = Math.floor((this.worldWidth / grassSpacing) * (this.worldHeight / grassSpacing))
    
    this.grassPositions = []
    
    for (let i = 0; i < grassCount; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth)
      const y = Phaser.Math.Between(0, this.worldHeight)
      const rotation = 0 // Always keep grass upright (no rotation)
      
      this.grassPositions.push({ x, y, rotation })
    }
  }

  /**
   * Creates minimal grass sprites for maximum performance
   */
  private createMinimalGrassSprites(grassTextureKey: string): void {
    this.grassPositions.forEach((pos) => {
      // Create grass sprite with doubled size
      const grass = this.add.image(pos.x, pos.y, grassTextureKey)
      grass.setScale(2) // Double the size
      grass.setRotation(pos.rotation)
      grass.setDepth(-1)
      grass.setVisible(true)
    })
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
    
    // Ensure player is on top of grass
    this.player.setDepth(1)
    
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
   * Sets up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (GAME_CONFIG.DEBUG.CONSOLE_LOGS) {
      this.performanceText = this.add.text(10, 10, '', {
        fontSize: '16px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 }
      })
      this.performanceText.setDepth(1000) // Always on top
    }
  }

  /**
   * Game update loop - called every frame - OPTIMIZED
   * Updates all game objects and systems
   */
  public update(): void {
    // Update player movement and position
    if (this.player) {
      this.player.update()
    }
    
    // Update performance monitoring (only every 60 frames to reduce overhead)
    if (this.performanceText && this.time.now - this.lastFpsUpdate > 1000) {
      const fps = Math.round(this.game.loop.actualFps)
      const memory = (performance as any).memory ? 
        Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0
      
      this.performanceText.setText(`FPS: ${fps}\nMemory: ${memory}MB\nGrass: ${this.grassPositions.length}`)
      this.lastFpsUpdate = this.time.now
    }
  }
}
