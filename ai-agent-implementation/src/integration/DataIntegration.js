const ceoData = require('../../ceo.json');

class DataIntegration {
  constructor(logger) {
    this.logger = logger;
    this.integrations = [];
    this.initializeIntegrations();
  }

  // Initialize data integrations from the ceo.json data
  initializeIntegrations() {
    const integrationData = ceoData.data_flow_integration.integrations;
    
    this.integrations = integrationData.map(integration => ({
      from: integration.from,
      to: integration.to,
      dataType: integration.data_type,
      purpose: integration.purpose,
      active: true,
      lastSync: null
    }));
    
    if (this.logger) {
      this.logger.info('Data integrations initialized', { count: this.integrations.length });
    }
  }

  // Get all integrations
  getAllIntegrations() {
    return this.integrations;
  }

  // Get integration by source and destination
  getIntegration(from, to) {
    return this.integrations.find(
      integration => integration.from === from && integration.to === to
    );
  }

  // Add a new data integration
  addIntegration(from, to, dataType, purpose) {
    const integration = {
      from,
      to,
      dataType,
      purpose,
      active: true,
      lastSync: null
    };
    
    this.integrations.push(integration);
    
    if (this.logger) {
      this.logger.info('New data integration added', { from, to, dataType });
    }
    
    return integration;
  }

  // Remove an integration
  removeIntegration(from, to) {
    const initialLength = this.integrations.length;
    this.integrations = this.integrations.filter(
      integration => !(integration.from === from && integration.to === to)
    );
    
    const removed = this.integrations.length < initialLength;
    
    if (this.logger) {
      if (removed) {
        this.logger.info('Data integration removed', { from, to });
      } else {
        this.logger.warn('Attempted to remove non-existent integration', { from, to });
      }
    }
    
    return removed;
  }

  // Update integration status
  updateIntegrationStatus(from, to, active) {
    const integration = this.getIntegration(from, to);
    if (integration) {
      integration.active = active;
      integration.lastSync = new Date();
      
      if (this.logger) {
        this.logger.info('Integration status updated', { from, to, active });
      }
      
      return true;
    }
    return false;
  }

  // Simulate data sync
  syncData(from, to) {
    const integration = this.getIntegration(from, to);
    if (integration && integration.active) {
      integration.lastSync = new Date();
      
      if (this.logger) {
        this.logger.info('Data synced', { from, to, timestamp: integration.lastSync });
      }
      
      return {
        success: true,
        from,
        to,
        timestamp: integration.lastSync
      };
    }
    
    return {
      success: false,
      from,
      to,
      error: 'Integration not found or inactive'
    };
  }

  // Get integrations by source
  getIntegrationsFrom(source) {
    return this.integrations.filter(integration => integration.from === source);
  }

  // Get integrations by destination
  getIntegrationsTo(destination) {
    return this.integrations.filter(integration => integration.to === destination);
  }
}

module.exports = DataIntegration;