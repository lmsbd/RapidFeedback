import { makeAutoObservable } from 'mobx';

class AssessmentStore {
  // Store selected assessment elements with their configurations
  assessmentElements = [];

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Get all assessment elements
   * @returns {Array} Copy of assessment elements array
   */
  get elementList() {
    return this.assessmentElements.slice();
  }

  /**
   * Set assessment elements (replace all)
   * @param {Array} elements - Array of element objects with elementId, Name, weighting, maximumMark, markIncrements
   */
  setElements(elements) {
    this.assessmentElements = elements;
  }

  /**
   * Add a single element
   * @param {Object} element - Element object
   */
  addElement(element) {
    const exists = this.assessmentElements.some(
      (el) => el.elementId === element.elementId
    );
    if (!exists) {
      this.assessmentElements.push(element);
    }
  }

  /**
   * Update an existing element
   * @param {Number} elementId - Element ID to update
   * @param {Object} updates - Object with fields to update
   */
  updateElement(elementId, updates) {
    const index = this.assessmentElements.findIndex(
      (el) => el.elementId === elementId
    );
    if (index !== -1) {
      this.assessmentElements[index] = {
        ...this.assessmentElements[index],
        ...updates,
      };
    }
  }

  /**
   * Remove an element by ID
   * @param {Number} elementId - Element ID to remove
   */
  removeElement(elementId) {
    this.assessmentElements = this.assessmentElements.filter(
      (el) => el.elementId !== elementId
    );
  }

  /**
   * Clear all assessment elements
   */
  clearElements() {
    this.assessmentElements = [];
  }

  /**
   * Check if elements are configured
   * @returns {Boolean}
   */
  get hasElements() {
    return this.assessmentElements.length > 0;
  }

  /**
   * Get total number of elements
   * @returns {Number}
   */
  get elementCount() {
    return this.assessmentElements.length;
  }

  /**
   * Validate total weighting equals 100%
   * @returns {Boolean}
   */
  get isWeightingValid() {
    const totalWeighting = this.assessmentElements.reduce(
      (sum, el) => sum + (el.weighting || 0),
      0
    );
    return totalWeighting === 100;
  }
}

export default new AssessmentStore();

