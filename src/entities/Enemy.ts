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
  VISUAL_SIZE: number
  SCALE: number
  COLOR: number
  HITBOX_SIZE: number
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
  public lastAttackTime: number = 0 // When this enemy last attacked (public for GameScene access)
  private isDead: boolean = false // Whether this enemy is dead
  
  // Visual elements (health bars removed for cleaner visuals)

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
    // Health bars disabled for cleaner visuals and better performance
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
    
    // Set the collision box size using HITBOX_SIZE (invisible box used for collision detection)
    this.body!.setSize(this.typeConfig.HITBOX_SIZE, this.typeConfig.HITBOX_SIZE)
    
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
    
    // Draw a rectangle using VISUAL_SIZE (how big it appears on screen)
    graphics.fillRect(0, 0, this.typeConfig.VISUAL_SIZE, this.typeConfig.VISUAL_SIZE)
    
    // Generate a texture from the graphics
    graphics.generateTexture('enemy-sprite', this.typeConfig.VISUAL_SIZE, this.typeConfig.VISUAL_SIZE)
    
    // Clean up the graphics object (we don't need it anymore)
    graphics.destroy()
    
    // Set the texture for this sprite
    this.setTexture('enemy-sprite')
  }

  // ============================================================================
  // HEALTH BAR SYSTEM - REMOVED FOR CLEANER VISUALS
  // ============================================================================

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
    
    // Health bars removed for cleaner visuals
    
    // If we have a target, chase it
    if (this.target) {
      this.chaseTarget()
      // Attack logic is now handled by GameScene collision detection
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
    
    // Calculate squared distance to target (avoid expensive Math.sqrt)
    const squaredDistance = dx * dx + dy * dy
    const attackRangeSquared = this.typeConfig.ATTACK_RANGE * this.typeConfig.ATTACK_RANGE
    
    // If we're close enough to attack, stop moving
    if (squaredDistance <= attackRangeSquared) {
      this.setVelocity(0)
      return
    }
    
    // Calculate distance for normalization (only when needed)
    const distance = Math.sqrt(squaredDistance)
    
    // Normalize direction (make it a unit vector)
    const normalizedDx = dx / distance
    const normalizedDy = dy / distance
    
    // Move towards target
    this.setVelocity(
      normalizedDx * this.typeConfig.SPEED,
      normalizedDy * this.typeConfig.SPEED
    )
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
    
    // Health bars removed for cleaner visuals
    
    // Enemy takes damage
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
    
    // Health bars removed for cleaner visuals
    
    // Enemy has died
    
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

  /**
   * Gets the hitbox size for collision detection
   */
  public getHitboxSize(): number {
    return this.typeConfig.HITBOX_SIZE
  }

  /**
   * Checks if the enemy can attack right now (respects cooldown)
   */
  public canAttack(): boolean {
    const currentTime = this.scene.time.now
    const cooldownMs = this.typeConfig.ATTACK_COOLDOWN * 1000
    return currentTime - this.lastAttackTime >= cooldownMs
  }

  /**
   * Gets the attack cooldown time in seconds
   */
  public getAttackCooldown(): number {
    return this.typeConfig.ATTACK_COOLDOWN
  }

  /**
   * Updates the last attack time (used by GameScene)
   */
  public updateLastAttackTime(): void {
    this.lastAttackTime = this.scene.time.now
  }
}
