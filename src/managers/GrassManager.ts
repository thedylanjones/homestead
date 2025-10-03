/**
 * Grass Manager - Simple Grass Creation and Management
 * 
 * This handles creating grass sprites around the world.
 * It's separate from the main game scene to keep things organized.
 */

import Phaser from 'phaser'
import { GRASS_CONFIG } from '../config/variables'

export class GrassManager {
  private scene: Phaser.Scene
  private grassPositions: { x: number, y: number, rotation: number }[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * Creates grass sprites across the world
   * @param grassTextureKey - The name of the grass image to use
   */
  createGrass(grassTextureKey: string): void {
    console.log('Creating grass...')
    
    // First, generate random positions for grass
    this.generateGrassPositions()
    
    // Then create the actual grass sprites
    this.createGrassSprites(grassTextureKey)
    
    console.log(`Created ${this.grassPositions.length} grass sprites`)
  }

  /**
   * Generates random positions for grass sprites
   */
  private generateGrassPositions(): void {
    const worldWidth = this.scene.physics.world.bounds.width
    const worldHeight = this.scene.physics.world.bounds.height
    const spacing = GRASS_CONFIG.SPACING
    
    // Calculate how many grass sprites we can fit
    const grassCount = Math.floor((worldWidth / spacing) * (worldHeight / spacing))
    
    console.log(`Generating ${grassCount} grass positions with ${spacing}px spacing`)
    
    this.grassPositions = []
    
    // Create random positions
    for (let i = 0; i < grassCount; i++) {
      const x = Phaser.Math.Between(0, worldWidth)
      const y = Phaser.Math.Between(0, worldHeight)
      const rotation = 0 // Keep grass upright
      
      this.grassPositions.push({ x, y, rotation })
    }
  }

  /**
   * Creates the actual grass sprite objects
   * @param grassTextureKey - The name of the grass image
   */
  private createGrassSprites(grassTextureKey: string): void {
    this.grassPositions.forEach((pos) => {
      // Create each grass sprite
      const grass = this.scene.add.image(pos.x, pos.y, grassTextureKey)
      grass.setScale(GRASS_CONFIG.SCALE) // Make grass bigger
      grass.setRotation(pos.rotation) // Set rotation
      grass.setDepth(-1) // Put grass behind player
      grass.setVisible(true) // Make sure it's visible
    })
  }

  /**
   * Gets the number of grass sprites created
   * @returns Number of grass sprites
   */
  getGrassCount(): number {
    return this.grassPositions.length
  }
}
