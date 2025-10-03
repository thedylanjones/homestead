// Import Phaser game engine and our configuration settings
import Phaser from 'phaser'
import { ENEMY_CONFIG } from '../config/variables'

/**
 * Enemy Type Configuration Interface
 * 
 * This defines the structure for enemy type configurations.
 * Each enemy type (dog, officer, etc.) has different stats and behaviors.
 */
export interface EnemyTypeConfig {
  NAME: string
  SPEED: number
  DAMAGE: number
  ATTACK_RANGE: number
  ATTACK_COOLDOWN: number
  HEALTH: number
  SIZE: number
  SCALE: number
  COLOR: number
}

/**
 * Enemy Configuration Interface
 * 
 * This defines what information we need to create an enemy.
 */
export interface EnemyConfig {
  x: number // Starting X position
  y: number // Starting Y position
  type: keyof typeof ENEMY_CONFIG.TYPES // Which enemy type to create
  target?: Phaser.Physics.Arcade.Sprite // What the enemy should chase (usually the player)
}

/**
 * Enemy Class - AI-controlled entities that chase and attack the player
 * 
 * This class extends Phaser's Arcade.Sprite and represents different types of enemies
 * that can spawn in the game. Each enemy type has different stats and behaviors.
 * 
 * Features:
 * - AI that chases the player
 * - Different enemy types with unique stats
 * - Attack system with cooldowns
 * - Health system
 * - Visual representation as colored squares
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  // ============================================================================
  // PRIVATE PROPERTIES - Variables that only this class can use
  // ============================================================================
  
  private typeConfig: EnemyTypeConfig // Configuration for this enemy type
  private maxHealth: number // Maximum health points
  private currentHealth: number // Current health points
  private target: Phaser.Physics.Arcade.Sprite | null = null // What this enemy is chasing
  private lastAttackTime: number = 0 // When this enemy last attacked
  private isDead: boolean = false // Whether this enemy is dead
  
  // Visual elements
  private healthBar: Phaser.GameObjects.Graphics | null = null // Health bar display
  private healthBarBackground: Phaser.GameObjects.Graphics | null = null // Health bar background

  // ============================================================================
  // CONSTRUCTOR - Runs when a new Enemy is created
  // ============================================================================
  
  /**
   * Creates a new Enemy
   * @param scene - The game scene this enemy belongs to
   * @param config - Configuration object with position, type, and target
   */
  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    // Get the configuration for this enemy type
    const typeConfig = ENEMY_CONFIG.TYPES[config.type]
    
    // Call the parent constructor to create the sprite
    // We'll create a colored rectangle as the visual representation
    super(scene, config.x, config.y, 'enemy-sprite')
    
    // Store the type configuration
    this.typeConfig = typeConfig
    
    // Set up health
    this.maxHealth = typeConfig.HEALTH
    this.currentHealth = this.maxHealth
    
    // Set the target (usually the player)
    this.target = config.target || null
    
    // Add this sprite to the scene
    scene.add.existing(this)
    
    // Enable physics for this sprite
    scene.physics.add.existing(this)
    
    // Set up physics and visual properties
    this.setupPhysics()
    this.setupVisuals()
    this.createHealthBar()
  }

  // ============================================================================
  // PHYSICS SETUP - How the enemy moves and collides
  // ============================================================================
  
  /**
   * Sets up physics properties for the enemy
   */
  private setupPhysics(): void {
    // Prevent enemy from leaving the game world
    this.setCollideWorldBounds(true)
    
    // Set the collision box size (invisible box used for collision detection)
    this.body!.setSize(this.typeConfig.SIZE, this.typeConfig.SIZE)
    
    // Use the scale from configuration (how big it appears on screen)
    this.setScale(this.typeConfig.SCALE)
    
    // Add some drag so enemies don't slide around too much
    this.setDrag(200)
  }

  // ============================================================================
  // VISUAL SETUP - How the enemy appears on screen
  // ============================================================================
  
  /**
   * Sets up visual properties for the enemy
   * Since we don't have enemy sprites yet, we'll create a colored rectangle
   */
  private setupVisuals(): void {
    // Create a colored rectangle as the enemy visual
    const graphics = this.scene.add.graphics()
    
    // Set the color based on enemy type
    graphics.fillStyle(this.typeConfig.COLOR)
    
    // Draw a rectangle (we'll use the collision box size for consistency)
    graphics.fillRect(0, 0, this.typeConfig.SIZE, this.typeConfig.SIZE)
    
    // Generate a texture from the graphics
    graphics.generateTexture('enemy-sprite', this.typeConfig.SIZE, this.typeConfig.SIZE)
    
    // Clean up the graphics object (we don't need it anymore)
    graphics.destroy()
    
    // Set the texture for this sprite
    this.setTexture('enemy-sprite')
  }

  // ============================================================================
  // HEALTH BAR SYSTEM - Visual health display
  // ============================================================================
  
  /**
   * Creates a health bar above the enemy
   */
  private createHealthBar(): void {
    // Create health bar background (black rectangle)
    this.healthBarBackground = this.scene.add.graphics()
    this.healthBarBackground.fillStyle(0x000000) // Black background
    this.healthBarBackground.fillRect(-15, -25, 30, 4)
    this.healthBarBackground.setDepth(10) // Make sure it's visible
    
    // Create health bar (green/red rectangle)
    this.healthBar = this.scene.add.graphics()
    this.healthBar.setDepth(11) // Above the background
    
    // Add both to this enemy's container so they move with the enemy
    this.scene.add.container(this.x, this.y, [this.healthBarBackground, this.healthBar])
    
    // Update the health bar display
    this.updateHealthBar()
  }

  /**
   * Updates the health bar display
   */
  private updateHealthBar(): void {
    if (!this.healthBar || !this.healthBarBackground) return
    
    // Clear previous health bar
    this.healthBar.clear()
    
    // Calculate health percentage
    const healthPercent = this.currentHealth / this.maxHealth
    
    // Choose color based on health (green when healthy, red when damaged)
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : 0xff0000
    
    // Draw health bar
    this.healthBar.fillStyle(healthColor)
    this.healthBar.fillRect(-15, -25, 30 * healthPercent, 4)
    
    // Update positions to follow the enemy
    if (this.healthBarBackground) {
      this.healthBarBackground.x = this.x
      this.healthBarBackground.y = this.y - 25
    }
    this.healthBar.x = this.x
    this.healthBar.y = this.y - 25
  }

  // ============================================================================
  // AI BEHAVIOR - How the enemy thinks and acts
  // ============================================================================
  
  /**
   * Updates enemy AI behavior
   * Called every frame to make the enemy chase and attack the player
   */
  public update(): void {
    // Don't update if dead
    if (this.isDead) return
    
    // Update health bar position
    this.updateHealthBar()
    
    // If we have a target, chase it
    if (this.target) {
      this.chaseTarget()
      this.checkAttack()
    }
  }

  /**
   * Makes the enemy chase its target (usually the player)
   */
  private chaseTarget(): void {
    if (!this.target) return
    
    // Calculate direction to target
    const dx = this.target.x - this.x
    const dy = this.target.y - this.y
    
    // Calculate distance to target
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // If we're close enough to attack, stop moving
    if (distance <= this.typeConfig.ATTACK_RANGE) {
      this.setVelocity(0)
      return
    }
    
    // Normalize direction (make it a unit vector)
    const normalizedDx = dx / distance
    const normalizedDy = dy / distance
    
    // Move towards target
    this.setVelocity(
      normalizedDx * this.typeConfig.SPEED,
      normalizedDy * this.typeConfig.SPEED
    )
  }

  /**
   * Checks if the enemy can attack and performs attack if possible
   */
  private checkAttack(): void {
    if (!this.target) return
    
    // Calculate distance to target
    const dx = this.target.x - this.x
    const dy = this.target.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Check if we're in attack range
    if (distance <= this.typeConfig.ATTACK_RANGE) {
    // Check if enough time has passed since last attack (convert seconds to milliseconds)
    const currentTime = this.scene.time.now
    const cooldownMs = this.typeConfig.ATTACK_COOLDOWN * 1000
    if (currentTime - this.lastAttackTime >= cooldownMs) {
      this.attack()
      this.lastAttackTime = currentTime
    }
    }
  }

  /**
   * Performs an attack on the target
   */
  private attack(): void {
    if (!this.target) return
    
    // For now, we'll just log the attack
    // In the future, this could trigger damage on the player
    console.log(`${this.typeConfig.NAME} attacks for ${this.typeConfig.DAMAGE} damage!`)
    
    // You can add attack effects here (particles, sound, etc.)
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
    
    console.log(`${this.typeConfig.NAME} takes ${damage} damage! Health: ${this.currentHealth}/${this.maxHealth}`)
  }

  /**
   * Handles enemy death
   */
  private die(): void {
    this.isDead = true
    
    // Stop moving
    this.setVelocity(0)
    
    // Hide the enemy (you could add death animation here)
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
    
    console.log(`${this.typeConfig.NAME} has died!`)
    
    // Destroy this enemy after a short delay
    this.scene.time.delayedCall(100, () => {
      this.destroy()
    })
  }

  // ============================================================================
  // PUBLIC GETTERS AND SETTERS - Methods other classes can use
  // ============================================================================

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
   * Checks if the enemy is dead
   */
  public isAlive(): boolean {
    return !this.isDead
  }

  /**
   * Gets the enemy type name
   */
  public getTypeName(): string {
    return this.typeConfig.NAME
  }

  /**
   * Gets the attack damage
   */
  public getDamage(): number {
    return this.typeConfig.DAMAGE
  }

  /**
   * Sets a new target for the enemy to chase
   */
  public setTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.target = target
  }
}
