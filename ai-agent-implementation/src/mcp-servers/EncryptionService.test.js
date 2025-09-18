const EncryptionService = require('./EncryptionService');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('EncryptionService', () => {
  let encryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService(logger);
  });

  test('should create encryption service successfully', () => {
    expect(encryptionService).toBeDefined();
  });

  test('should generate RSA key pair', () => {
    const { publicKey, privateKey } = encryptionService.generateRSAKeyPair(1024);
    
    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
    expect(typeof publicKey).toBe('string');
    expect(typeof privateKey).toBe('string');
    expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
  });

  test('should generate AES key', () => {
    const key = encryptionService.generateAESKey(16);
    
    expect(key).toBeDefined();
    expect(Buffer.isBuffer(key)).toBe(true);
    expect(key.length).toBe(16);
  });

  test('should encrypt and decrypt with AES', () => {
    const key = encryptionService.generateAESKey();
    const originalData = 'This is a secret message for AES encryption';
    
    const encrypted = encryptionService.encryptAES(originalData, key);
    expect(encrypted).toBeDefined();
    expect(encrypted.data).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    
    const decrypted = encryptionService.decryptAES(encrypted, key);
    expect(decrypted.toString()).toBe(originalData);
  });

  test('should encrypt and decrypt with RSA', () => {
    const { publicKey, privateKey } = encryptionService.generateRSAKeyPair(1024);
    const originalData = 'This is a secret message for RSA encryption';
    
    const encrypted = encryptionService.encryptRSA(originalData, publicKey);
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe('string');
    
    const decrypted = encryptionService.decryptRSA(encrypted, privateKey);
    expect(decrypted.toString()).toBe(originalData);
  });

  test('should create and manage sessions', () => {
    const sessionId = 'test-session-1';
    const partyA = 'agent-1';
    const partyB = 'agent-2';
    
    const session = encryptionService.createSession(sessionId, partyA, partyB);
    expect(session).toBeDefined();
    expect(session.id).toBe(sessionId);
    expect(session.partyA).toBe(partyA);
    expect(session.partyB).toBe(partyB);
    expect(session.key).toBeDefined();
    
    const retrievedSession = encryptionService.getSession(sessionId);
    expect(retrievedSession).toBeDefined();
    expect(retrievedSession.id).toBe(sessionId);
    
    const activeSessions = encryptionService.getActiveSessions();
    expect(activeSessions).toHaveLength(1);
    expect(activeSessions[0].id).toBe(sessionId);
    
    encryptionService.closeSession(sessionId);
    const closedSession = encryptionService.getSession(sessionId);
    expect(closedSession).toBeNull();
  });

  test('should encrypt and decrypt messages for sessions', () => {
    const sessionId = 'test-session-2';
    const partyA = 'agent-1';
    const partyB = 'agent-2';
    const originalMessage = 'This is a confidential message between agents';
    
    // Create session
    encryptionService.createSession(sessionId, partyA, partyB);
    
    // Encrypt message
    const encrypted = encryptionService.encryptForSession(sessionId, originalMessage);
    expect(encrypted).toBeDefined();
    
    // Decrypt message
    const decrypted = encryptionService.decryptFromSession(sessionId, encrypted);
    expect(decrypted.toString()).toBe(originalMessage);
  });

  test('should sign and verify data', () => {
    const { publicKey, privateKey } = encryptionService.generateRSAKeyPair(1024);
    const originalData = 'This is data to be signed';
    
    const signature = encryptionService.signData(originalData, privateKey);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    
    const isValid = encryptionService.verifySignature(originalData, signature, publicKey);
    expect(isValid).toBe(true);
    
    // Test with invalid signature
    const invalidSignature = signature.substring(0, signature.length - 5) + 'abcde';
    const isInvalid = encryptionService.verifySignature(originalData, invalidSignature, publicKey);
    expect(isInvalid).toBe(false);
  });
});