const ceoData = require('../../ceo.json');

class Pod {
  constructor(name, mission, duration, sponsor, teamMembers = [], tools = [], successMetrics = []) {
    this.name = name;
    this.mission = mission;
    this.duration = duration;
    this.sponsor = sponsor;
    this.teamMembers = teamMembers;
    this.tools = tools;
    this.successMetrics = successMetrics;
    this.createdAt = new Date();
    this.status = 'active'; // active, completed, cancelled
  }

  // Add a team member to the pod
  addTeamMember(member) {
    this.teamMembers.push(member);
  }

  // Remove a team member from the pod
  removeTeamMember(memberRole) {
    this.teamMembers = this.teamMembers.filter(member => member.role !== memberRole);
  }

  // Update pod status
  updateStatus(status) {
    if (['active', 'completed', 'cancelled'].includes(status)) {
      this.status = status;
    } else {
      throw new Error('Invalid status. Must be one of: active, completed, cancelled');
    }
  }

  // Get pod information
  getInfo() {
    return {
      name: this.name,
      mission: this.mission,
      duration: this.duration,
      sponsor: this.sponsor,
      teamMembers: this.teamMembers,
      tools: this.tools,
      successMetrics: this.successMetrics,
      createdAt: this.createdAt,
      status: this.status
    };
  }

  // Check if pod is active
  isActive() {
    return this.status === 'active';
  }
}

// Pod Manager to handle all pods
class PodManager {
  constructor(logger) {
    this.logger = logger;
    this.pods = [];
    this.initializePods();
  }

  // Initialize all pods from the ceo.json data
  initializePods() {
    const podsData = ceoData.cross_functional_pods.pods;
    
    podsData.forEach(podData => {
      const pod = new Pod(
        podData.name,
        podData.mission,
        podData.duration,
        podData.sponsor,
        podData.team_members,
        podData.tools,
        podData.success_metrics
      );
      
      this.pods.push(pod);
    });
    
    if (this.logger) {
      this.logger.info('Pods initialized', { count: this.pods.length });
    }
  }

  // Get all pods
  getAllPods() {
    return this.pods.map(pod => pod.getInfo());
  }

  // Get a specific pod by name
  getPodByName(name) {
    const pod = this.pods.find(p => p.name === name);
    return pod ? pod.getInfo() : null;
  }

  // Create a new pod
  createPod(name, mission, duration, sponsor, teamMembers = [], tools = [], successMetrics = []) {
    const pod = new Pod(name, mission, duration, sponsor, teamMembers, tools, successMetrics);
    this.pods.push(pod);
    
    if (this.logger) {
      this.logger.info('New pod created', { name: pod.name });
    }
    
    return pod.getInfo();
  }

  // Update pod status
  updatePodStatus(podName, status) {
    const pod = this.pods.find(p => p.name === podName);
    if (pod) {
      pod.updateStatus(status);
      
      if (this.logger) {
        this.logger.info('Pod status updated', { name: pod.name, status });
      }
      
      return pod.getInfo();
    }
    return null;
  }
}

module.exports = { Pod, PodManager };