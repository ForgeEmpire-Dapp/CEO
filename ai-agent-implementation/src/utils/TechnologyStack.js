const ceoData = require('../../ceo.json');

class TechnologyStack {
  constructor(logger) {
    this.logger = logger;
    this.stack = {};
    this.initializeStack();
  }

  // Initialize technology stack from the ceo.json data
  initializeStack() {
    const stackData = ceoData.core_technology_stack;
    
    this.stack = {
      communication: stackData.communication || [],
      collaboration: stackData.collaboration || [],
      projectManagement: stackData.project_management || [],
      crm: stackData.crm || [],
      dataWarehouse: stackData.data_warehouse || [],
      biAnalytics: stackData.bi_analytics || [],
      devops: stackData.devops || [],
      aiPlatform: stackData.ai_platform || []
    };
    
    // Convert string values to arrays if needed
    for (const [key, value] of Object.entries(this.stack)) {
      if (typeof value === 'string') {
        this.stack[key] = value.split(',').map(item => item.trim());
      }
    }
    
    if (this.logger) {
      this.logger.info('Technology stack initialized');
    }
  }

  // Get the entire technology stack
  getStack() {
    return this.stack;
  }

  // Get specific category from the stack
  getStackCategory(category) {
    return this.stack[category] || [];
  }

  // Add a tool to a specific category
  addTool(category, tool) {
    if (!this.stack[category]) {
      this.stack[category] = [];
    }
    
    if (!this.stack[category].includes(tool)) {
      this.stack[category].push(tool);
      
      if (this.logger) {
        this.logger.info('Tool added to technology stack', { category, tool });
      }
      
      return true;
    }
    
    return false; // Tool already exists
  }

  // Remove a tool from a specific category
  removeTool(category, tool) {
    if (this.stack[category]) {
      const initialLength = this.stack[category].length;
      this.stack[category] = this.stack[category].filter(t => t !== tool);
      
      const removed = this.stack[category].length < initialLength;
      
      if (this.logger) {
        if (removed) {
          this.logger.info('Tool removed from technology stack', { category, tool });
        } else {
          this.logger.warn('Attempted to remove non-existent tool from technology stack', { category, tool });
        }
      }
      
      return removed;
    }
    
    return false;
  }

  // Check if a tool exists in a category
  hasTool(category, tool) {
    return this.stack[category] && this.stack[category].includes(tool);
  }

  // Get all categories
  getCategories() {
    return Object.keys(this.stack);
  }

  // Search for tools across all categories
  searchTools(searchTerm) {
    const results = [];
    
    for (const [category, tools] of Object.entries(this.stack)) {
      const matchingTools = tools.filter(tool => 
        tool.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchingTools.length > 0) {
        results.push({
          category,
          tools: matchingTools
        });
      }
    }
    
    return results;
  }
}

module.exports = TechnologyStack;