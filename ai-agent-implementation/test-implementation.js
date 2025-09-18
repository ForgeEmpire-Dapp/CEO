// Simple test to verify our AI Agent implementation works
const fs = require('fs');
const path = require('path');

// Load the ceo.json file
const ceoData = require('./ceo.json');

console.log('Testing AI Agent Organization Implementation');
console.log('==========================================');

// Test 1: Check if ceo.json can be loaded
console.log('\n1. Testing ceo.json loading...');
try {
  console.log('✓ ceo.json loaded successfully');
  console.log(`  Version: ${ceoData.metadata.version}`);
  console.log(`  Last Updated: ${ceoData.metadata.last_updated}`);
} catch (error) {
  console.log('✗ Failed to load ceo.json:', error.message);
}

// Test 2: Check executive agents
console.log('\n2. Testing Executive Agents...');
try {
  const executiveAgents = ceoData.organizational_architecture.executive_layer.agents;
  console.log(`✓ Found ${executiveAgents.length} executive agents`);
  
  // Check if CEO exists
  const ceo = executiveAgents.find(agent => agent.name === 'Chief Executive Officer (CEO)');
  if (ceo) {
    console.log('✓ CEO agent found');
    console.log(`  Description: ${ceo.description}`);
    console.log(`  Tools: ${ceo.tools.join(', ')}`);
    console.log(`  Key Metrics: ${ceo.key_metrics.join(', ')}`);
  } else {
    console.log('✗ CEO agent not found');
  }
} catch (error) {
  console.log('✗ Error testing executive agents:', error.message);
}

// Test 3: Check if required files exist
console.log('\n3. Testing file structure...');
const requiredFiles = [
  'src/index.js',
  'src/agents/Agent.js',
  'src/agents/executive/ExecutiveAgent.js',
  'src/agents/director/DirectorAgent.js',
  'src/agents/manager/ManagerAgent.js',
  'src/agents/individual-contributor/IndividualContributorAgent.js',
  'src/pods/Pod.js',
  'src/governance/AIGovernance.js',
  'src/integration/DataIntegration.js',
  'src/utils/TechnologyStack.js'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('✓ All required files exist');
} else {
  console.log('✗ Some required files are missing');
}

// Test 4: Check cross-functional pods
console.log('\n4. Testing Cross-functional Pods...');
try {
  const pods = ceoData.cross_functional_pods.pods;
  console.log(`✓ Found ${pods.length} cross-functional pods`);
  
  if (pods.length > 0) {
    const firstPod = pods[0];
    console.log(`  First pod: ${firstPod.name}`);
    console.log(`  Mission: ${firstPod.mission}`);
    console.log(`  Sponsor: ${firstPod.sponsor}`);
  }
} catch (error) {
  console.log('✗ Error testing cross-functional pods:', error.message);
}

// Test 5: Check AI Governance Council
console.log('\n5. Testing AI Governance Council...');
try {
  const council = ceoData.ai_governance_council;
  console.log('✓ AI Governance Council data found');
  console.log(`  Purpose: ${council.purpose}`);
  console.log(`  Members: ${council.members.length}`);
  
  for (const member of council.members) {
    console.log(`    - ${member.role}: ${member.responsibility}`);
  }
} catch (error) {
  console.log('✗ Error testing AI Governance Council:', error.message);
}

console.log('\n==========================================');
console.log('Test completed!');