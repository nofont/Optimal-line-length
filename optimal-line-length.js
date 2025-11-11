/**
 * OptimalLineLength - A vanilla JavaScript library for analyzing and visualizing line lengths in text
 * Helps ensure text readability by highlighting lines that fall outside the optimal 50-80 character range
 * @version 2.0.0
 * @license MIT
 */

(function() {
  'use strict';

  /**
   * Default configuration options
   */
  const DEFAULT_CONFIG = {
    selector: 'p, blockquote, h1, h2, h3, h4, h5, h6, .optimal-line-length',
    minChars: 50,
    maxChars: 80,
    maxLines: 10,
    showCounters: true,
    highlightEndOfLine: true,
    debounceDelay: 150,
    autoInit: true
  };

  /**
   * CSS styles to be injected into the document
   */
  const STYLES = `
    .oll-zero-width {
      border-left: 1px solid #ccc;
      margin-left: -1px;
    }

    .oll-zero-width.oll-end-of-line {
      background-color: red;
      border-left: 1px solid red;
      margin-left: -1px;
    }

    .oll-counter {
      border-bottom: 1px solid #ccc;
      position: absolute;
      right: 5%;
      font-size: 10px;
      background-color: white;
      padding: 2px 4px;
      z-index: 1000;
    }

    .oll-counter.oll-error {
      color: red;
      border-bottom-color: red;
    }

    .oll-counter.oll-success {
      color: green;
      border-bottom-color: green;
    }
  `;

  /**
   * Main OptimalLineLength class
   */
  class OptimalLineLength {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.elements = [];
      this.resizeTimeout = null;
      this.initialized = false;

      if (this.config.autoInit) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
          this.init();
        }
      }
    }

    /**
     * Initialize the library
     */
    init() {
      if (this.initialized) return;

      this.injectStyles();
      this.findElements();
      this.processElements();
      this.bindEvents();
      this.initialized = true;
    }

    /**
     * Inject CSS styles into the document
     */
    injectStyles() {
      // Check if styles are already injected
      if (document.getElementById('oll-styles')) return;

      const styleElement = document.createElement('style');
      styleElement.id = 'oll-styles';
      styleElement.textContent = STYLES;
      document.head.appendChild(styleElement);
    }

    /**
     * Find all elements matching the selector
     */
    findElements() {
      this.elements = Array.from(document.querySelectorAll(this.config.selector));
    }

    /**
     * Process all found elements
     */
    processElements() {
      this.elements.forEach(element => {
        // Skip if element is empty or already processed
        if (!element.textContent.trim() || element.hasAttribute('data-oll-processed')) {
          return;
        }

        element.setAttribute('data-oll-processed', 'true');
        this.processElement(element);
      });
    }

    /**
     * Process a single element
     * @param {HTMLElement} element - The element to process
     */
    processElement(element) {
      // Only process elements with direct text content (no complex HTML children)
      if (this.hasComplexChildren(element)) {
        console.warn('OptimalLineLength: Skipping element with complex children', element);
        return;
      }

      const textContent = element.textContent.trim();
      if (!textContent) return;

      const words = textContent.split(/\s+/);
      this.insertZeroWidthElements(element, words);
      this.analyzeLines(element, words);
    }

    /**
     * Check if element has complex children (nested elements)
     * @param {HTMLElement} element - The element to check
     * @returns {boolean}
     */
    hasComplexChildren(element) {
      const children = element.children;
      // Allow processing if element has no children or only simple inline elements
      if (children.length === 0) return false;

      // Check if all children are simple inline elements like <strong>, <em>, etc.
      for (let child of children) {
        const tagName = child.tagName.toLowerCase();
        if (!['strong', 'em', 'b', 'i', 'u', 'mark', 'small', 'sub', 'sup'].includes(tagName)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Insert zero-width marker elements between words
     * @param {HTMLElement} element - The element to modify
     * @param {Array} words - Array of words
     */
    insertZeroWidthElements(element, words) {
      // Store original text for later reference
      element.setAttribute('data-oll-original', element.textContent);

      // Clear the element
      element.innerHTML = '';

      // Create array to store zero-width elements
      element.ollZeroWidthElems = [];

      // Insert words with zero-width markers
      words.forEach((word, index) => {
        // Add space before word if not the first word
        if (index > 0) {
          element.appendChild(document.createTextNode(' '));
        }

        // Add the word
        element.appendChild(document.createTextNode(word));

        // Create and add zero-width marker
        const marker = document.createElement('span');
        marker.className = 'oll-zero-width';
        element.ollZeroWidthElems.push(marker);
        element.appendChild(marker);
      });
    }

    /**
     * Analyze lines in the element
     * @param {HTMLElement} element - The element to analyze
     * @param {Array} words - Array of words
     */
    analyzeLines(element, words) {
      if (!element.ollZeroWidthElems) return;

      let lineCount = 0;
      let charCount = 0;
      let wordCount = 0;
      let lastTop = null;

      element.ollZeroWidthElems.forEach((marker, index) => {
        // Stop after maxLines
        if (lineCount >= this.config.maxLines) return;

        // Determine if this is the end of a line
        const isLastElement = index === element.ollZeroWidthElems.length - 1;
        const currentTop = marker.offsetTop;

        // Add current word length and space
        if (words[index]) {
          charCount += words[index].length;
          wordCount++;
          // Add space (except for last word on line)
          if (!isLastElement && currentTop === lastTop) {
            charCount++;
          }
        }

        // Check if line has wrapped or this is the last element
        if (isLastElement || (lastTop !== null && currentTop !== lastTop)) {
          lineCount++;

          // Apply end-of-line styling
          if (this.config.highlightEndOfLine) {
            marker.classList.add('oll-end-of-line');
          }

          // Add counter if enabled
          if (this.config.showCounters) {
            const counter = document.createElement('span');
            counter.className = 'oll-counter';

            // Determine if line length is optimal
            const isOptimal = charCount >= this.config.minChars && charCount <= this.config.maxChars;
            counter.classList.add(isOptimal ? 'oll-success' : 'oll-error');
            counter.textContent = charCount;

            marker.appendChild(counter);
          }

          // Reset counters for next line
          charCount = 0;
          wordCount = 0;
        }

        lastTop = currentTop;
      });
    }

    /**
     * Refresh analysis on specific elements or all elements
     * @param {HTMLElement|null} element - Optional specific element to refresh
     */
    refresh(element = null) {
      if (element) {
        this.clearElement(element);
        const originalText = element.getAttribute('data-oll-original');
        if (originalText) {
          element.textContent = originalText;
          element.removeAttribute('data-oll-processed');
          this.processElement(element);
        }
      } else {
        // Refresh all elements
        this.elements.forEach(el => {
          this.clearElement(el);
          const originalText = el.getAttribute('data-oll-original');
          if (originalText) {
            el.textContent = originalText;
            el.removeAttribute('data-oll-processed');
          }
        });
        this.processElements();
      }
    }

    /**
     * Clear analysis markers from an element
     * @param {HTMLElement} element - The element to clear
     */
    clearElement(element) {
      // Remove counters and end-of-line markers
      const counters = element.querySelectorAll('.oll-counter');
      counters.forEach(counter => counter.remove());

      const endOfLineMarkers = element.querySelectorAll('.oll-end-of-line');
      endOfLineMarkers.forEach(marker => marker.classList.remove('oll-end-of-line'));

      // Clear stored zero-width elements
      if (element.ollZeroWidthElems) {
        delete element.ollZeroWidthElems;
      }
    }

    /**
     * Bind resize event listener with debouncing
     */
    bindEvents() {
      window.addEventListener('resize', () => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          this.refresh();
        }, this.config.debounceDelay);
      });
    }

    /**
     * Destroy the instance and clean up
     */
    destroy() {
      // Restore original text for all elements
      this.elements.forEach(element => {
        const originalText = element.getAttribute('data-oll-original');
        if (originalText) {
          element.textContent = originalText;
          element.removeAttribute('data-oll-original');
          element.removeAttribute('data-oll-processed');
        }
        if (element.ollZeroWidthElems) {
          delete element.ollZeroWidthElems;
        }
      });

      // Remove styles
      const styleElement = document.getElementById('oll-styles');
      if (styleElement) {
        styleElement.remove();
      }

      this.elements = [];
      this.initialized = false;
    }

    /**
     * Add new elements to be analyzed
     * @param {string|HTMLElement|NodeList} selector - Selector string, element, or NodeList
     */
    addElements(selector) {
      let newElements = [];

      if (typeof selector === 'string') {
        newElements = Array.from(document.querySelectorAll(selector));
      } else if (selector instanceof HTMLElement) {
        newElements = [selector];
      } else if (selector instanceof NodeList) {
        newElements = Array.from(selector);
      }

      newElements.forEach(element => {
        if (!this.elements.includes(element)) {
          this.elements.push(element);
          this.processElement(element);
        }
      });
    }
  }

  // Expose to global scope
  window.OptimalLineLength = OptimalLineLength;

  // Auto-initialize with default settings if data attribute is present
  if (document.currentScript && document.currentScript.hasAttribute('data-auto-init')) {
    new OptimalLineLength();
  }

})();
