const ceoData = require('../../ceo.json');

class AIGovernanceCouncil {
  constructor(logger) {
    this.logger = logger;
    this.members = [];
    this.charter = '';
    this.purpose = '';
    this.initializeCouncil();
  }

  // Initialize the AI governance council from the ceo.json data
  initializeCouncil() {
    const councilData = ceoData.ai_governance_council;
    
    this.purpose = councilData.purpose;
    this.charter = councilData.charter;
    this.members = councilData.members || [];
    
    if (this.logger) {
      this.logger.info('AI Governance Council initialized', { memberCount: this.members.length });
    }
  }

  // Get council information
  getInfo() {
    return {
      purpose: this.purpose,
      charter: this.charter,
      members: this.members
    };
  }

  // Add a new member to the council
  addMember(role, responsibility) {
    const member = { role, responsibility };
    this.members.push(member);
    
    if (this.logger) {
      this.logger.info('New member added to AI Governance Council', { role, responsibility });
    }
    
    return member;
  }

  // Remove a member from the council
  removeMember(role) {
    const initialLength = this.members.length;
    this.members = this.members.filter(member => member.role !== role);
    
    if (this.logger) {
      if (this.members.length < initialLength) {
        this.logger.info('Member removed from AI Governance Council', { role });
      } else {
        this.logger.warn('Attempted to remove non-existent member from AI Governance Council', { role });
      }
    }
    
    return this.members.length < initialLength;
  }

  // Get a specific member by role
  getMemberByRole(role) {
    return this.members.find(member => member.role === role);
  }

  // Update a member's responsibility
  updateMemberResponsibility(role, newResponsibility) {
    const member = this.getMemberByRole(role);
    if (member) {
      const oldResponsibility = member.responsibility;
      member.responsibility = newResponsibility;
      
      if (this.logger) {
        this.logger.info('Member responsibility updated', { 
          role, 
          oldResponsibility, 
          newResponsibility 
        });
      }
      
      return true;
    }
    return false;
  }

  // Check if council has a member with a specific role
  hasMember(role) {
    return this.members.some(member => member.role === role);
  }

  // Get all members
  getAllMembers() {
    return this.members;
  }
}

module.exports = AIGovernanceCouncil;