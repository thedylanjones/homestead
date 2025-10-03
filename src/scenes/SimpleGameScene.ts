/**
 * Simple Game Scene - Easy to Understand Main Game
 * 
 * This is a simplified version of the game scene that's much easier to understand.
 * It uses separate managers for different parts of the game.
 */

import Phaser from 'phaser'
import { SimplePlayer } from '../entities/SimplePlayer'
import { BackgroundManager } from '../managers/BackgroundManager'
import { GrassManager } from '../managers/GrassManager'
import { CameraManager } from '../managers/CameraManager'
import { PerformanceMonitor } from '../utils/PerformanceMonitor'
import { WORLD_CONFIG, GAME_CONFIG } from '../config/variables'

export class SimpleGameScene extends Phaser.Scene {
  // Game objects
  private player: SimplePlayer | null = null
  
  // Managers (handle different parts of the game)
  private backgroundManager: BackgroundManager | null = null
  private grassManager: GrassManager | null = null
  private cameraManager: CameraManager | null = null
  private performanceMonitor: PerformanceMonitor | null = null

  constructor() {
    super({ key: 'SimpleGameScene' })
  }

  /**
   * Loads all the images and assets the game needs
   */
  preload(): void {
    console.log('Loading game assets...')
    
    // Load player image
    this.load.image('player-sprite', '/assets/sprites/basic/player_basic.png')
    
    // Load grass image
    this.load.image('grass-basic', '/assets/sprites/basic/grass_basic.png')
    
    // Try alternative grass path if first one fails
    this.load.image('grass-basic-alt', './assets/sprites/basic/grass_basic.png')
    
    console.log('Assets loaded successfully')
  }

  /**
   * Creates the game world after assets are loaded
   */
  create(): void {
    console.log('Creating game world...')
    
    // Set up the game world boundaries
    this.setupWorld()
    
    // Create managers
    this.createManagers()
    
    // Create the background
    this.backgroundManager!.createBackground()
    
    // Create grass
    this.createGrass()
    
    // Create the player
    this.createPlayer()
    
    // Set up camera to follow player
    this.cameraManager!.setupCamera(this.player!)
    
    console.log('Game world created successfully!')
  }

  /**
   * Updates the game every frame (60 times per second)
   */
  update(): void {
    // Update player movement
    if (this.player) {
      this.player.update()
    }
    
    // Update performance monitoring
    if (this.performanceMonitor) {
      const grassCount = this.grassManager ? this.grassManager.getGrassCount() : 0
      this.performanceMonitor.update(this, grassCount)
    }
  }

  /**
   * Sets up the game world boundaries
   */
  private setupWorld(): void {
    // Set world size
    this.physics.world.setBounds(0, 0, WORLD_CONFIG.WIDTH, WORLD_CONFIG.HEIGHT)
    console.log(`World size set to ${WORLD_CONFIG.WIDTH}x${WORLD_CONFIG.HEIGHT}`)
  }

  /**
   * Creates all the manager objects
   */
  private createManagers(): void {
    this.backgroundManager = new BackgroundManager(this)
    this.grassManager = new GrassManager(this)
    this.cameraManager = new CameraManager(this)
    this.performanceMonitor = new PerformanceMonitor(this)
    
    console.log('Managers created')
  }

  /**
   * Creates grass sprites around the world
   */
  private createGrass(): void {
    // Check which grass texture is available
    let grassTextureKey = 'grass-basic'
    if (!this.textures.exists('grass-basic')) {
      if (this.textures.exists('grass-basic-alt')) {
        grassTextureKey = 'grass-basic-alt'
        console.log('Using alternative grass texture')
      } else {
        console.error('No grass texture found!')
        return
      }
    }
    
    // Create grass using the manager
    this.grassManager!.createGrass(grassTextureKey)
  }

  /**
   * Creates the player character
   */
  private createPlayer(): void {
    // Start player in the center of the world
    const startX = WORLD_CONFIG.WIDTH / 2
    const startY = WORLD_CONFIG.HEIGHT / 2
    
    this.player = new SimplePlayer(this, startX, startY)
    console.log(`Player created at position (${startX}, ${startY})`)
  }
}
