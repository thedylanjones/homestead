// Import Phaser game engine and our configuration settings
import Phaser from 'phaser'
import { BUILDING_CONFIG } from '../config/variables'

/**
 * Building UI Manager - Handles the building selection interface
 * 
 * This class manages the visual interface for selecting buildings at the bottom
 * of the screen. It displays building icons and highlights the selected one.
 */
export class BuildingUIManager {
  // ============================================================================
  // PRIVATE PROPERTIES - Variables that only this class can use
  // ============================================================================
  
  private scene: Phaser.Scene // Reference to the game scene
  private buildingIcons: Phaser.GameObjects.Text[] = [] // Array of building icon texts
  private buildingCosts: Phaser.GameObjects.Text[] = [] // Array of building cost texts
  private selectedIndex: number = 0 // Currently selected building index
  private backgroundGraphics: Phaser.GameObjects.Graphics | null = null // Background for UI

  // ============================================================================
  // CONSTRUCTOR - Runs when a new BuildingUIManager is created
  // ============================================================================
  
  /**
   * Creates a new BuildingUIManager
   * @param scene - The game scene this UI belongs to
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createBuildingUI()
  }

  // ============================================================================
  // UI CREATION - Creating the building selection interface
  // ============================================================================
  
  /**
   * Creates the building selection UI at the bottom of the screen
   */
  private createBuildingUI(): void {
    const buildingTypes = Object.keys(BUILDING_CONFIG.TYPES) as Array<keyof typeof BUILDING_CONFIG.TYPES>
    const totalIcons = buildingTypes.length
    
    // Calculate UI positioning
    const screenWidth = this.scene.cameras.main.width
    const screenHeight = this.scene.cameras.main.height
    const iconSize = BUILDING_CONFIG.UI.ICON_SIZE
    const iconSpacing = BUILDING_CONFIG.UI.ICON_SPACING
    const totalWidth = (totalIcons - 1) * iconSpacing
    const startX = (screenWidth - totalWidth) / 2
    const yPosition = screenHeight * BUILDING_CONFIG.UI.ICON_Y_POSITION
    
    // Create background for the building UI
    this.createBackground(startX - iconSpacing, yPosition - iconSize / 2, totalWidth + iconSpacing * 2, iconSize)
    
    // Create building icons
    buildingTypes.forEach((buildingType, index) => {
      const buildingConfig = BUILDING_CONFIG.TYPES[buildingType]
      const x = startX + index * iconSpacing
      
      // Create building icon text
      const icon = this.scene.add.text(x, yPosition, buildingConfig.ICON, {
        fontSize: `${iconSize}px`,
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
      })
      
      icon.setOrigin(0.5, 0.5)
      icon.setDepth(100) // Above everything else
      icon.setScrollFactor(0) // Don't scroll with camera
      
      // Set initial alpha based on selection
      icon.setAlpha(index === this.selectedIndex ? 
        BUILDING_CONFIG.UI.SELECTED_ALPHA : 
        BUILDING_CONFIG.UI.UNSELECTED_ALPHA
      )
      
      this.buildingIcons.push(icon)
      
      // Create building cost text
      const cost = this.scene.add.text(x, yPosition + iconSize / 2 + 15, buildingConfig.COST.toString(), {
        fontSize: '16px',
        color: '#ffff00',
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      })
      
      cost.setOrigin(0.5, 0.5)
      cost.setDepth(100) // Above everything else
      cost.setScrollFactor(0) // Don't scroll with camera
      
      // Set initial alpha based on selection
      cost.setAlpha(index === this.selectedIndex ? 
        BUILDING_CONFIG.UI.SELECTED_ALPHA : 
        BUILDING_CONFIG.UI.UNSELECTED_ALPHA
      )
      
      this.buildingCosts.push(cost)
    })
    
    // Create instruction text
    this.createInstructionText(screenWidth / 2, yPosition + iconSize / 2 + 40)
  }

  /**
   * Creates a background for the building UI
   */
  private createBackground(x: number, y: number, width: number, height: number): void {
    this.backgroundGraphics = this.scene.add.graphics()
    this.backgroundGraphics.fillStyle(0x000000, 0.5) // Semi-transparent black
    this.backgroundGraphics.fillRoundedRect(x, y, width, height, 10)
    this.backgroundGraphics.setDepth(99) // Below icons but above game
    this.backgroundGraphics.setScrollFactor(0) // Don't scroll with camera
  }

  /**
   * Creates instruction text below the building icons
   */
  private createInstructionText(x: number, y: number): void {
    const instructionText = this.scene.add.text(x, y, 'Use ← → to select, ↑ to build', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    })
    
    instructionText.setOrigin(0.5, 0.5)
    instructionText.setDepth(101) // Above everything
    instructionText.setScrollFactor(0) // Don't scroll with camera
  }

  // ============================================================================
  // UI MANAGEMENT - Updating the interface
  // ============================================================================
  
  /**
   * Updates the selected building and highlights it
   * @param selectedIndex - Index of the newly selected building
   */
  public updateSelection(selectedIndex: number): void {
    // Validate index
    if (selectedIndex < 0 || selectedIndex >= this.buildingIcons.length) return
    
    // Update previous selection
    if (this.selectedIndex >= 0 && this.selectedIndex < this.buildingIcons.length) {
      this.buildingIcons[this.selectedIndex].setAlpha(BUILDING_CONFIG.UI.UNSELECTED_ALPHA)
      if (this.buildingCosts[this.selectedIndex]) {
        this.buildingCosts[this.selectedIndex].setAlpha(BUILDING_CONFIG.UI.UNSELECTED_ALPHA)
      }
    }
    
    // Update new selection
    this.selectedIndex = selectedIndex
    this.buildingIcons[this.selectedIndex].setAlpha(BUILDING_CONFIG.UI.SELECTED_ALPHA)
    if (this.buildingCosts[this.selectedIndex]) {
      this.buildingCosts[this.selectedIndex].setAlpha(BUILDING_CONFIG.UI.SELECTED_ALPHA)
    }
  }

  /**
   * Gets the currently selected building type
   * @returns The selected building type key
   */
  public getSelectedBuildingType(): string {
    const buildingTypes = Object.keys(BUILDING_CONFIG.TYPES)
    return buildingTypes[this.selectedIndex] || 'POWER'
  }

  /**
   * Gets the currently selected building index
   * @returns The selected building index
   */
  public getSelectedIndex(): number {
    return this.selectedIndex
  }

  /**
   * Updates the UI when screen size changes
   */
  public updateScreenSize(): void {
    // Destroy existing UI elements
    this.destroy()
    
    // Recreate UI with new screen size
    this.createBuildingUI()
  }

  // ============================================================================
  // CLEANUP - Destroying the UI
  // ============================================================================
  
  /**
   * Destroys all UI elements and cleans up resources
   */
  public destroy(): void {
    // Destroy building icons
    this.buildingIcons.forEach(icon => {
      if (icon) {
        icon.destroy()
      }
    })
    this.buildingIcons = []
    
    // Destroy building costs
    this.buildingCosts.forEach(cost => {
      if (cost) {
        cost.destroy()
      }
    })
    this.buildingCosts = []
    
    // Destroy background
    if (this.backgroundGraphics) {
      this.backgroundGraphics.destroy()
      this.backgroundGraphics = null
    }
    
    // Reset selection
    this.selectedIndex = 0
  }
}
