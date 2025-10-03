import Phaser from 'phaser'
import { Player, PlayerConfig } from '../entities/Player'

export class GameScene extends Phaser.Scene {
  private player: Player | null = null
  private worldWidth: number = 4096
  private worldHeight: number = 3072

  constructor() {
    super({ key: 'GameScene' })
  }

  public create(): void {
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight)
    
    // Create beautiful farm-at-sunset background
    this.createFarmBackground()
    
    // Create player
    this.createPlayer()
    
    // Set up camera to follow player
    this.setupCamera()
  }

  private createFarmBackground(): void {
    // Create sunset gradient background
    const graphics = this.add.graphics()
    
    // Create a beautiful sunset gradient from warm orange to soft brown
    const gradient = graphics.createGradient()
    gradient.addColorStop(0, 0xFF8C42) // Warm orange at top (sunset)
    gradient.addColorStop(0.3, 0xFFB366) // Soft orange
    gradient.addColorStop(0.6, 0x90EE90) // Light green (grass)
    gradient.addColorStop(1, 0x8B4513) // Saddle brown (earth)
    
    graphics.fillGradientStyle(gradient, gradient, gradient, gradient)
    graphics.fillRect(0, 0, this.worldWidth, this.worldHeight)
    
    // Add subtle grass texture
    this.createGrassTexture()
    
    // Add some soft cloud-like shapes for atmosphere
    this.createAtmosphere()
  }

  private createGrassTexture(): void {
    const grassGraphics = this.add.graphics()
    
    // Create subtle grass blade texture
    grassGraphics.lineStyle(1, 0x228B22, 0.3) // Forest green with low opacity
    
    // Draw small grass blades randomly across the background
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth)
      const y = Phaser.Math.Between(0, this.worldHeight)
      const height = Phaser.Math.Between(3, 8)
      
      // Draw a small grass blade
      grassGraphics.moveTo(x, y)
      grassGraphics.lineTo(x + Phaser.Math.Between(-1, 1), y - height)
    }
    
    grassGraphics.strokePath()
    
    // Add some earth/dirt spots
    grassGraphics.fillStyle(0x654321, 0.2) // Dark brown with low opacity
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth)
      const y = Phaser.Math.Between(0, this.worldHeight)
      const size = Phaser.Math.Between(2, 6)
      
      grassGraphics.fillCircle(x, y, size)
    }
  }

  private createAtmosphere(): void {
    const atmosphereGraphics = this.add.graphics()
    
    // Add soft, warm atmospheric effects
    atmosphereGraphics.fillStyle(0xFFE4B5, 0.15) // Moccasin with low opacity
    
    // Create soft cloud-like shapes
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth)
      const y = Phaser.Math.Between(0, this.worldHeight * 0.4) // Only in upper portion
      const size = Phaser.Math.Between(30, 80)
      
      atmosphereGraphics.fillCircle(x, y, size)
    }
    
    // Add some warm light rays
    atmosphereGraphics.lineStyle(2, 0xFFD700, 0.1) // Gold with very low opacity
    for (let i = 0; i < 5; i++) {
      const startX = Phaser.Math.Between(0, this.worldWidth)
      const startY = 0
      const endX = startX + Phaser.Math.Between(-50, 50)
      const endY = Phaser.Math.Between(100, 200)
      
      atmosphereGraphics.moveTo(startX, startY)
      atmosphereGraphics.lineTo(endX, endY)
    }
    
    atmosphereGraphics.strokePath()
  }

  private createPlayer(): void {
    const playerConfig: PlayerConfig = {
      x: this.worldWidth / 2,
      y: this.worldHeight / 2,
      speed: 200
    }
    
    this.player = new Player(this, playerConfig)
    
    // Debug: Make sure player is visible
    console.log('Player created at:', this.player.x, this.player.y)
    console.log('Player visible:', this.player.visible)
    console.log('Player alpha:', this.player.alpha)
  }

  private setupCamera(): void {
    if (!this.player) return
    
    // Make camera follow the player smoothly
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    
    // Set camera bounds to the world
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight)
    
    // Set camera zoom to make the world feel larger
    this.cameras.main.setZoom(0.8)
    
    // Center the camera on the player
    this.cameras.main.setDeadzone(0, 0)
  }


  public update(): void {
    // Update player
    if (this.player) {
      this.player.update()
    }
  }
}
