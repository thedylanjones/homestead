/**
 * Performance Monitor - Simple FPS and Memory Tracking
 * 
 * This is a simple utility to help you see how well your game is running.
 * It shows FPS (frames per second) and memory usage on screen.
 * 
 * Usage: Just call update() every frame and it handles the rest!
 */

import Phaser from 'phaser'

export class PerformanceMonitor {
  private performanceText: Phaser.GameObjects.Text | null = null
  private lastUpdate: number = 0
  private frameCount: number = 0
  private lastFrameTime: number = 0

  /**
   * Creates the performance display on screen
   * @param scene - The game scene to add the display to
   */
  constructor(scene: Phaser.Scene) {
    // Create a text object to show performance info
    this.performanceText = scene.add.text(10, 10, 'Loading...', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 8 },
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    })
    
    // Make sure it stays on top and doesn't move with camera
    this.performanceText.setDepth(1000)
    this.performanceText.setScrollFactor(0)
    
    // Initialize timing
    this.lastFrameTime = scene.time.now
    this.frameCount = 0
    
    console.log('Performance monitoring enabled')
  }

  /**
   * Updates the performance display
   * Call this every frame in your game loop
   * @param scene - The game scene (needed for timing)
   * @param grassCount - Number of grass sprites (optional)
   */
  update(scene: Phaser.Scene, grassCount?: number): void {
    // Count frames
    this.frameCount++
    
    // Only update display every second (to avoid spam)
    if (scene.time.now - this.lastUpdate > 1000) {
      // Calculate actual FPS
      const fps = Math.round(this.frameCount * 1000 / (scene.time.now - this.lastFrameTime))
      
      // Get memory usage (if available)
      const memory = (performance as any).memory ? 
        Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0
      
      // Update the display
      const grassInfo = grassCount ? `\nGrass: ${grassCount}` : ''
      this.performanceText!.setText(`FPS: ${fps}\nMemory: ${memory}MB${grassInfo}`)
      
      // Reset counters
      this.lastUpdate = scene.time.now
      this.lastFrameTime = scene.time.now
      this.frameCount = 0
      
      // Log to console too
      console.log(`Performance: FPS=${fps}, Memory=${memory}MB${grassInfo}`)
    }
  }
}
