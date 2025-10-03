// Import Phaser game engine and our custom classes
import Phaser from 'phaser'
import { Player, PlayerConfig } from '../entities/Player'
import { Enemy, EnemyConfig } from '../entities/Enemy'
import { 
  WORLD_CONFIG, 
  CAMERA_CONFIG, 
  BACKGROUND_CONFIG, 
  PLAYER_CONFIG,
  GAME_CONFIG,
  GRASS_CONFIG,
  ENEMY_CONFIG
} from '../config/variables'

/**
 * Main Game Scene - The heart of our game
 * 
 * This is the primary scene where all the game action happens. Think of it as
 * the main level or world where the player explores and plays.
 * 
 * This scene handles:
 * - Creating the game world and background
 * - Loading and displaying game assets (images, sprites)
 * - Creating and managing the player character
 * - Setting up the camera to follow the player
 * - Creating grass and other environmental elements
 * - Running the game loop (updating everything 60 times per second)
 * - Performance monitoring and debugging
 */
export class GameScene extends Phaser.Scene {
  // ============================================================================
  // PRIVATE PROPERTIES - Variables that only this scene can use
  // ============================================================================
  
  private player: Player | null = null // The main character (starts as null, gets created later)
  private worldWidth: number = WORLD_CONFIG.WIDTH // How wide our game world is (4096 pixels)
  private worldHeight: number = WORLD_CONFIG.HEIGHT // How tall our game world is (3072 pixels)
  
  // Enemy system
  private enemies: Enemy[] = [] // Array to store all active enemies
  private lastEnemySpawn: number = 0 // When we last spawned an enemy
  
  // Array to store all grass positions (x, y coordinates and rotation)
  private grassPositions: { x: number, y: number, rotation: number }[] = []
  
  // Performance monitoring text that shows FPS and other stats
  private performanceText: Phaser.GameObjects.Text | null = null
  
  // Variables for calculating FPS (frames per second)
  private lastFpsUpdate: number = 0 // When we last updated the FPS display
  private frameCount: number = 0 // How many frames have passed
  private lastFrameTime: number = 0 // When the last frame was processed
  
  // Game over UI elements
  private gameOverText: Phaser.GameObjects.Text | null = null
  private replayButton: Phaser.GameObjects.Text | null = null
  private gameOverBackground: Phaser.GameObjects.Graphics | null = null

  // ============================================================================
  // CONSTRUCTOR - Sets up the scene
  // ============================================================================
  
  /**
   * Constructor - Creates a new GameScene
   * 
   * This runs when the scene is first created, before any assets are loaded.
   */
  constructor() {
    // Call the parent Scene constructor with a unique key name
    super({ key: 'GameScene' })
  }

  // ============================================================================
  // PRELOAD METHOD - Loads all game assets (images, sounds, etc.)
  // ============================================================================
  
  /**
   * Preload method - loads all assets before the scene starts
   * 
   * This method runs first and loads all the images, sounds, and other assets
   * that the game needs. Think of it like loading all the pieces before
   * building a puzzle.
   */
  public preload(): void {
    console.log('Loading assets...')
    
    // Load the player character image
    this.load.image('player-sprite', '/assets/sprites/basic/player_basic.png')
    console.log('Loading player-sprite from: /assets/sprites/basic/player_basic.png')
    
    // Load the basic grass image for world decoration
    this.load.image('grass-basic', '/assets/sprites/basic/grass_basic.png')
    console.log('Loading grass-basic from: /assets/sprites/basic/grass_basic.png')
    
    // Try loading grass with a different path format (in case the first one fails)
    this.load.image('grass-basic-alt', './assets/sprites/basic/grass_basic.png')
    console.log('Loading grass-basic-alt from: ./assets/sprites/basic/grass_basic.png')
    
    // Load an alternative grass texture for testing
    this.load.image('grass-alt', '/assets/sprites/Outdoor/Grass/grass_1-Sheet.png')
    console.log('Loading grass-alt from: /assets/sprites/Outdoor/Grass/grass_1-Sheet.png')
    
    // Add event listeners to help debug asset loading
    this.load.on('filecomplete', (key: string, type: string) => {
      console.log(`Asset loaded successfully: ${key} (${type})`)
    })
    
    this.load.on('loaderror', (file: any) => {
      console.error(`Failed to load asset: ${file.key} from ${file.url}`)
    })
  }

  // ============================================================================
  // CREATE METHOD - Sets up the game world after assets are loaded
  // ============================================================================
  
  /**
   * Scene creation method - called once when the scene starts
   * 
   * This method runs after all assets are loaded and sets up the entire game world.
   * It's like building the game level - creating the background, placing objects,
   * and setting up the player.
   */
  public create(): void {
    // Set up the physics world boundaries (invisible walls around the world)
    this.setupWorld()
    
    // Create the solid green background
    this.createBackground()
    
    // Create scattered grass across the world for decoration
    this.createGrassField()
    
    // Create and initialize the player character
    this.createPlayer()
    
    // Set up camera to follow the player around
    this.setupCamera()
    
    // Add performance monitoring (shows FPS and other stats)
    this.setupPerformanceMonitoring()
    
    // Set up enemy collision detection
    this.setupEnemyCollisions()
    
    // Log successful scene creation to console
    if (GAME_CONFIG.DEBUG.CONSOLE_LOGS) {
      console.log('GameScene created successfully')
    }
  }

  // ============================================================================
  // WORLD SETUP METHODS - Creating the game environment
  // ============================================================================
  
  /**
   * Sets up the physics world boundaries
   * 
   * This creates invisible walls around the game world so objects
   * can't move outside the playable area.
   */
  private setupWorld(): void {
    // Set world boundaries: start at (0,0) and go to (worldWidth, worldHeight)
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
  }

  /**
   * Creates the background - solid green gradient
   * 
   * This method creates the visual background that the player sees.
   * We use a gradient to make it look more interesting than a flat color.
   */
  private createBackground(): void {
    this.createGradientBackground()
  }


  /**
   * Creates the solid green background using a gradient
   * 
   * This method creates a green background that covers the entire game world.
   * We use a gradient (even though it's all the same color) to make it look
   * more professional and less flat.
   */
  private createGradientBackground(): void {
    // Create a graphics object to draw the background
    const graphics = this.add.graphics()
    
    // Set up the gradient colors (all green for a solid look)
    graphics.fillGradientStyle(
      BACKGROUND_CONFIG.GRADIENT_COLORS.TOP,      // Top color (green)
      BACKGROUND_CONFIG.GRADIENT_COLORS.MID_TOP,  // Middle-top color (green)
      BACKGROUND_CONFIG.GRADIENT_COLORS.MID_BOTTOM, // Middle-bottom color (green)
      BACKGROUND_CONFIG.GRADIENT_COLORS.BOTTOM    // Bottom color (green)
    )
    
    // Draw a rectangle covering the entire world
    graphics.fillRect(0, 0, this.worldWidth, this.worldHeight)
    
    // Set the background to be behind everything else (depth -10)
    graphics.setDepth(-10)
  }

  // ============================================================================
  // GRASS CREATION METHODS - Adding environmental decoration
  // ============================================================================
  
  /**
   * Creates an optimized grass system for decoration
   * 
   * This method creates grass sprites scattered across the world to make it
   * look more natural and interesting. We use a minimal approach for good performance.
   */
  private createGrassField(): void {
    // Check which grass texture is available (try different names in case of loading issues)
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
    
    // Generate random positions for all grass sprites (with reduced density for performance)
    this.generateGrassPositions()
    
    // Create the actual grass sprites at those positions
    this.createMinimalGrassSprites(grassTextureKey)
    
    if (GAME_CONFIG.DEBUG.CONSOLE_LOGS) {
      console.log(`Created minimal grass system with ${this.grassPositions.length} grass positions`)
    }
  }

  /**
   * Pre-generates all grass positions for the world with reduced density
   */
  private generateGrassPositions(): void {
    const grassSpacing = GRASS_CONFIG.SPACING // Use configuration for grass spacing
    const grassCount = Math.floor((this.worldWidth / grassSpacing) * (this.worldHeight / grassSpacing))
    
    console.log(`Generating grass: World=${this.worldWidth}x${this.worldHeight}, Spacing=${grassSpacing}, Count=${grassCount}`)
    
    this.grassPositions = []
    
    for (let i = 0; i < grassCount; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth)
      const y = Phaser.Math.Between(0, this.worldHeight)
      const rotation = 0 // Always keep grass upright (no rotation)
      
      this.grassPositions.push({ x, y, rotation })
    }
    
    console.log(`Generated ${this.grassPositions.length} grass positions`)
  }

  /**
   * Creates minimal grass sprites for maximum performance
   */
  private createMinimalGrassSprites(grassTextureKey: string): void {
    this.grassPositions.forEach((pos) => {
      // Create grass sprite with doubled size
      const grass = this.add.image(pos.x, pos.y, grassTextureKey)
      grass.setScale(GRASS_CONFIG.SCALE) // Use configuration for grass scale
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
    // Always show performance monitoring for debugging
    this.performanceText = this.add.text(10, 10, 'Loading...', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 8 },
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    })
    this.performanceText.setDepth(1000) // Always on top
    this.performanceText.setScrollFactor(0) // Don't scroll with camera
    
    // Initialize frame timing
    this.lastFrameTime = this.time.now
    this.frameCount = 0
    
    console.log('Performance monitoring enabled')
  }

  /**
   * Game update loop - called every frame - OPTIMIZED
   * Updates all game objects and systems
   */
  public update(): void {
    // Update player movement and position
    if (this.player && this.player.isAlive()) {
      this.player.update()
    }
    
    // Update all enemies
    this.updateEnemies()
    
    // Spawn new enemies if needed
    this.spawnEnemies()
    
    // Count frames for FPS calculation
    this.frameCount++
    
    // Update performance monitoring (only every second to reduce overhead)
    if (this.performanceText && this.time.now - this.lastFpsUpdate > 1000) {
      // Calculate actual FPS
      const actualFps = Math.round(this.frameCount * 1000 / (this.time.now - this.lastFrameTime))
      const memory = (performance as any).memory ? 
        Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0
      
      // Fix the display format
      const grassCount = this.grassPositions.length
      const enemyCount = this.enemies.length
      this.performanceText.setText(`FPS: ${actualFps}\nMemory: ${memory}MB\nGrass: ${grassCount}\nEnemies: ${enemyCount}`)
      
      // Reset counters
      this.lastFpsUpdate = this.time.now
      this.lastFrameTime = this.time.now
      this.frameCount = 0
      
      // Debug log to confirm it's working
      console.log(`Performance: FPS=${actualFps}, Memory=${memory}MB, Grass=${grassCount}, Enemies=${enemyCount}`)
      console.log(`World size: ${this.worldWidth}x${this.worldHeight}, Grass spacing: ${GRASS_CONFIG.SPACING}`)
      console.log(`Game resolution: ${this.game.config.width}x${this.game.config.height}`)
      console.log(`Renderer: WebGL`)
    }
  }

  // ============================================================================
  // ENEMY SYSTEM METHODS - Managing enemy spawning, AI, and collisions
  // ============================================================================
  
  /**
   * Sets up collision detection between enemies and player
   */
  private setupEnemyCollisions(): void {
    // This will be called when we have enemies to set up collisions
    // For now, we'll handle collision detection in the update loop
  }

  /**
   * Updates all active enemies
   */
  private updateEnemies(): void {
    // Update each enemy and check for collisions with player
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      
      // Remove dead enemies from the array
      if (!enemy.isAlive()) {
        this.enemies.splice(i, 1)
        continue
      }
      
      // Update enemy AI
      enemy.update()
      
      // Check collision with player
      if (this.player && this.player.isAlive()) {
        this.checkEnemyPlayerCollision(enemy)
      }
      
      // Check if player's attack hits this enemy (only when attack is active)
      if (this.player && this.player.isAlive() && this.player.isAttackCurrentlyActive()) {
        this.checkPlayerAttackEnemyCollision(enemy)
      }
    }
  }

  /**
   * Checks collision between an enemy and the player
   */
  private checkEnemyPlayerCollision(enemy: Enemy): void {
    if (!this.player || !this.player.isAlive()) return
    
    // Calculate distance between enemy and player
    const dx = this.player.x - enemy.x
    const dy = this.player.y - enemy.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Check if they're close enough to collide (using collision box sizes)
    const enemySize = ENEMY_CONFIG.TYPES[enemy.getTypeName().toUpperCase() as keyof typeof ENEMY_CONFIG.TYPES]?.SIZE || 24
    const playerSize = PLAYER_CONFIG.SIZE
    const collisionDistance = (enemySize + playerSize) / 2
    
    if (distance <= collisionDistance) {
      // Enemy is touching player - deal damage
      this.player.takeDamage(enemy.getDamage())
      
      // You could add visual/audio effects here
      console.log(`Enemy ${enemy.getTypeName()} collides with player!`)
    }
  }

  /**
   * Checks collision between player's attack and an enemy
   */
  private checkPlayerAttackEnemyCollision(enemy: Enemy): void {
    if (!this.player || !this.player.isAlive()) return
    
    // Check if this enemy has already been hit by the current attack
    if (this.player.hasEnemyBeenHit(enemy)) {
      return // Skip this enemy, already hit
    }
    
    // Get player's attack position and size
    const attackPos = this.player.getAttackPosition()
    const attackSize = this.player.getAttackSize()
    
    // Calculate distance between attack and enemy
    const dx = attackPos.x - enemy.x
    const dy = attackPos.y - enemy.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Check if attack hits enemy (using collision box sizes)
    const enemySize = ENEMY_CONFIG.TYPES[enemy.getTypeName().toUpperCase() as keyof typeof ENEMY_CONFIG.TYPES]?.SIZE || 24
    const collisionDistance = (attackSize + enemySize) / 2
    
    if (distance <= collisionDistance) {
      // Player's attack hits enemy - deal damage and mark as hit
      enemy.takeDamage(this.player.getAttackDamage())
      this.player.markEnemyAsHit(enemy)
      
      console.log(`Player attack hits ${enemy.getTypeName()} for ${this.player.getAttackDamage()} damage!`)
    }
  }

  /**
   * Spawns new enemies based on configuration
   */
  private spawnEnemies(): void {
    // Don't spawn if player is dead
    if (!this.player || !this.player.isAlive()) return
    
    // Check if we need to spawn more enemies
    const currentTime = this.time.now
    const shouldSpawn = 
      this.enemies.length < ENEMY_CONFIG.SPAWN.MAX_ENEMIES &&
      currentTime - this.lastEnemySpawn >= ENEMY_CONFIG.SPAWN.SPAWN_INTERVAL
    
    if (shouldSpawn) {
      this.spawnEnemy()
      this.lastEnemySpawn = currentTime
    }
  }

  /**
   * Spawns a single enemy at a random location
   */
  private spawnEnemy(): void {
    if (!this.player) return
    
    // Choose enemy type (for now, just spawn dogs)
    const enemyType: keyof typeof ENEMY_CONFIG.TYPES = 'DOG'
    
    // Calculate spawn position (away from player)
    const spawnDistance = ENEMY_CONFIG.SPAWN.SPAWN_DISTANCE
    const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180) // Random angle in radians
    
    const spawnX = this.player.x + Math.cos(angle) * spawnDistance
    const spawnY = this.player.y + Math.sin(angle) * spawnDistance
    
    // Make sure spawn position is within world bounds
    const clampedX = Phaser.Math.Clamp(spawnX, 50, this.worldWidth - 50)
    const clampedY = Phaser.Math.Clamp(spawnY, 50, this.worldHeight - 50)
    
    // Create enemy configuration
    const enemyConfig: EnemyConfig = {
      x: clampedX,
      y: clampedY,
      type: enemyType,
      target: this.player
    }
    
    // Create the enemy
    const enemy = new Enemy(this, enemyConfig)
    
    // Add to enemies array
    this.enemies.push(enemy)
    
    // Set depth so enemies appear above grass but below player
    enemy.setDepth(0.5)
    
    console.log(`Spawned ${enemyType} at (${clampedX}, ${clampedY})`)
  }

  /**
   * Spawns a specific enemy type at a specific location (for testing)
   */
  public spawnEnemyAt(x: number, y: number, type: keyof typeof ENEMY_CONFIG.TYPES = 'DOG'): void {
    if (!this.player) return
    
    const enemyConfig: EnemyConfig = {
      x: x,
      y: y,
      type: type,
      target: this.player
    }
    
    const enemy = new Enemy(this, enemyConfig)
    this.enemies.push(enemy)
    enemy.setDepth(0.5)
    
    console.log(`Spawned ${type} at (${x}, ${y})`)
  }

  /**
   * Gets the current number of active enemies
   */
  public getEnemyCount(): number {
    return this.enemies.length
  }

  /**
   * Clears all enemies (useful for testing or game reset)
   */
  public clearAllEnemies(): void {
    this.enemies.forEach(enemy => {
      if (enemy.isAlive()) {
        enemy.destroy()
      }
    })
    this.enemies = []
    console.log('All enemies cleared')
  }

  // ============================================================================
  // GAME OVER AND REPLAY SYSTEM
  // ============================================================================

  /**
   * Shows the game over screen with replay button
   */
  public showGameOverScreen(): void {
    // Don't show if already shown
    if (this.gameOverText) return

    // Get screen center coordinates
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    // Create semi-transparent background overlay
    this.gameOverBackground = this.add.graphics()
    this.gameOverBackground.fillStyle(0x000000, 0.7) // Black with 70% opacity
    this.gameOverBackground.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)
    this.gameOverBackground.setDepth(1000) // Above everything else
    this.gameOverBackground.setScrollFactor(0) // Don't scroll with camera

    // Create "Game Over" text
    this.gameOverText = this.add.text(centerX, centerY - 50, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 4
    })
    this.gameOverText.setOrigin(0.5, 0.5) // Center the text
    this.gameOverText.setDepth(1001) // Above background
    this.gameOverText.setScrollFactor(0) // Don't scroll with camera

    // Create replay button
    this.replayButton = this.add.text(centerX, centerY + 50, 'REPLAY', {
      fontSize: '32px',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    })
    this.replayButton.setOrigin(0.5, 0.5) // Center the text
    this.replayButton.setDepth(1001) // Above background
    this.replayButton.setScrollFactor(0) // Don't scroll with camera

    // Make replay button interactive
    this.replayButton.setInteractive({ useHandCursor: true })
    
    // Add hover effects
    this.replayButton.on('pointerover', () => {
      this.replayButton!.setStyle({ backgroundColor: '#555555' })
    })
    
    this.replayButton.on('pointerout', () => {
      this.replayButton!.setStyle({ backgroundColor: '#333333' })
    })

    // Add click handler
    this.replayButton.on('pointerdown', () => {
      this.restartGame()
    })

    console.log('Game over screen displayed')
  }

  /**
   * Hides the game over screen
   */
  private hideGameOverScreen(): void {
    if (this.gameOverText) {
      this.gameOverText.destroy()
      this.gameOverText = null
    }
    
    if (this.replayButton) {
      this.replayButton.destroy()
      this.replayButton = null
    }
    
    if (this.gameOverBackground) {
      this.gameOverBackground.destroy()
      this.gameOverBackground = null
    }
  }

  /**
   * Restarts the game by recreating the scene
   */
  private restartGame(): void {
    console.log('Restarting game...')
    
    // Hide game over screen
    this.hideGameOverScreen()
    
    // Clear all enemies
    this.clearAllEnemies()
    
    // Reset grass positions
    this.grassPositions = []
    
    // Recreate the game world
    this.createGrassField()
    this.createPlayer()
    this.setupCamera()
    
    console.log('Game restarted successfully')
  }
}
