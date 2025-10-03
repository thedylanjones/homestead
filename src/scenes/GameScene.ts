// Import Phaser game engine and our custom classes
import Phaser from 'phaser'
import { Player, PlayerConfig } from '../entities/Player'
import { Enemy, EnemyConfig } from '../entities/Enemy'
import { CameraManager } from '../managers/CameraManager'
import { BackgroundManager } from '../managers/BackgroundManager'
import { GrassManager } from '../managers/GrassManager'
import { PerformanceMonitor } from '../utils/PerformanceMonitor'
import { 
  WORLD_CONFIG, 
  PLAYER_CONFIG,
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
  
  // Performance monitoring system
  private performanceMonitor: PerformanceMonitor | null = null
  
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
    // Load the player character image
    this.load.image('player-sprite', '/assets/sprites/basic/player_basic.png')
    
    // Load the basic grass image for world decoration
    this.load.image('grass-basic', '/assets/sprites/basic/grass_basic.png')
    
    // Try loading grass with a different path format (in case the first one fails)
    this.load.image('grass-basic-alt', './assets/sprites/basic/grass_basic.png')
    
    // Load an alternative grass texture for testing
    this.load.image('grass-alt', '/assets/sprites/Outdoor/Grass/grass_1-Sheet.png')
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
    this.performanceMonitor = new PerformanceMonitor(this)
    
    // Set up enemy collision detection
    this.setupEnemyCollisions()
    
    // Scene creation complete
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
    // Use BackgroundManager for consistent background creation
    const backgroundManager = new BackgroundManager(this)
    backgroundManager.createBackground()
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
      if (this.textures.exists('grass-basic-alt')) {
        grassTextureKey = 'grass-basic-alt'
      } else {
        return // No grass texture available
      }
    }
    
    // Use GrassManager for consistent grass creation
    const grassManager = new GrassManager(this)
    grassManager.createGrass(grassTextureKey)
    
    // Store grass positions for performance monitoring
    this.grassPositions = grassManager.getGrassPositions()
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
  }

  /**
   * Sets up the camera to follow the player smoothly
   */
  private setupCamera(): void {
    if (!this.player) return
    
    // Use CameraManager for consistent camera setup
    const cameraManager = new CameraManager(this)
    cameraManager.setupCamera(this.player)
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
    
    // Update performance monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.update(this, this.grassPositions.length, this.enemies.length)
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
    
    // Calculate squared distance between enemy and player (avoid Math.sqrt)
    const dx = this.player.x - enemy.x
    const dy = this.player.y - enemy.y
    const squaredDistance = dx * dx + dy * dy
    
    // Check if they're close enough to collide (using collision box sizes)
    const enemyHitboxSize = enemy.getHitboxSize()
    const playerSize = PLAYER_CONFIG.SIZE
    const collisionDistance = (enemyHitboxSize + playerSize) / 2
    const collisionDistanceSquared = collisionDistance * collisionDistance
    
    if (squaredDistance <= collisionDistanceSquared) {
      // Enemy is touching player - check if they can attack (respects fire rate)
      if (enemy.canAttack()) {
        // Enemy can attack - deal damage and update last attack time
        this.player.takeDamage(enemy.getDamage())
        enemy.updateLastAttackTime() // Update the enemy's last attack time
        
        // Enemy attacks player
      }
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
    
    // Calculate squared distance between attack and enemy (avoid Math.sqrt)
    const dx = attackPos.x - enemy.x
    const dy = attackPos.y - enemy.y
    const squaredDistance = dx * dx + dy * dy
    
    // Check if attack hits enemy (using collision box sizes)
    const enemyHitboxSize = enemy.getHitboxSize()
    const collisionDistance = (attackSize + enemyHitboxSize) / 2
    const collisionDistanceSquared = collisionDistance * collisionDistance
    
    if (squaredDistance <= collisionDistanceSquared) {
      // Player's attack hits enemy - deal damage and mark as hit
      enemy.takeDamage(this.player.getAttackDamage())
      this.player.markEnemyAsHit(enemy)
      
      // Player attack hits enemy
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
    
    // Set depth so enemies appear above player
    enemy.setDepth(1.5)
    
    // Enemy spawned
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
    enemy.setDepth(1.5)
    
    // Enemy spawned at specific location
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
    // All enemies cleared
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

    // Game over screen displayed
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
    // Restarting game
    
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
    
    // Game restarted successfully
  }
}
