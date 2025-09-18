const crypto = require('crypto');
const winston = require('winston');

/**
 * Encryption Service for secure communications between agents and users
 */
class EncryptionService {
  /**
   * Create a new Encryption Service
   * @param {object} logger - Logger instance
   */
  constructor(logger = null) {
    this.logger = logger || this.createDefaultLogger();
    this.keys = new Map(); // Store encryption keys
    this.sessions = new Map(); // Store active sessions
    
    this.logger.info('Encryption Service initialized');
  }

  /**
   * Create a default logger if none provided
   * @returns {object} Winston logger instance
   */
  createDefaultLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'encryption-service' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Generate RSA key pair for asymmetric encryption
   * @param {number} modulusLength - Key length in bits (default: 2048)
   * @returns {object} Public and private keys
   */
  generateRSAKeyPair(modulusLength = 2048) {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });
      
      this.logger.info('RSA key pair generated', { modulusLength });
      
      return { publicKey, privateKey };
    } catch (error) {
      this.logger.error('Failed to generate RSA key pair', { 
        error: error.message,
        modulusLength
      });
      throw error;
    }
  }

  /**
   * Generate AES key for symmetric encryption
   * @param {number} length - Key length in bytes (default: 32 for 256-bit)
   * @returns {Buffer} AES key
   */
  generateAESKey(length = 32) {
    try {
      const key = crypto.randomBytes(length);
      this.logger.info('AES key generated', { length });
      return key;
    } catch (error) {
      this.logger.error('Failed to generate AES key', { 
        error: error.message,
        length
      });
      throw error;
    }
  }

  /**
   * Encrypt data using AES-CBC
   * @param {string|Buffer} data - Data to encrypt
   * @param {Buffer} key - AES key
   * @returns {object} Encrypted data with IV
   */
  encryptAES(data, key) {
    try {
      const iv = crypto.randomBytes(16); // 128-bit IV for AES-CBC
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      
      let encrypted = cipher.update(data, typeof data === 'string' ? 'utf8' : undefined);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      const result = {
        data: encrypted.toString('hex'),
        iv: iv.toString('hex')
      };
      
      this.logger.info('Data encrypted with AES-CBC');
      return result;
    } catch (error) {
      this.logger.error('Failed to encrypt data with AES', { 
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Decrypt data using AES-CBC
   * @param {object} encryptedData - Encrypted data with IV
   * @param {Buffer} key - AES key
   * @returns {string|Buffer} Decrypted data
   */
  decryptAES(encryptedData, key) {
    try {
      const { data, iv } = encryptedData;
      const ivBuffer = Buffer.from(iv, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
      
      let decrypted = decipher.update(Buffer.from(data, 'hex'));
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      this.logger.info('Data decrypted with AES-CBC');
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt data with AES', { 
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Encrypt data with RSA public key
   * @param {string|Buffer} data - Data to encrypt
   * @param {string} publicKey - RSA public key in PEM format
   * @returns {string} Encrypted data in hex format
   */
  encryptRSA(data, publicKey) {
    try {
      const encrypted = crypto.publicEncrypt(publicKey, 
        typeof data === 'string' ? Buffer.from(data) : data);
      
      this.logger.info('Data encrypted with RSA');
      return encrypted.toString('hex');
    } catch (error) {
      this.logger.error('Failed to encrypt data with RSA', { 
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Decrypt data with RSA private key
   * @param {string} encryptedData - Encrypted data in hex format
   * @param {string} privateKey - RSA private key in PEM format
   * @returns {Buffer} Decrypted data
   */
  decryptRSA(encryptedData, privateKey) {
    try {
      const decrypted = crypto.privateDecrypt(privateKey, 
        Buffer.from(encryptedData, 'hex'));
      
      this.logger.info('Data decrypted with RSA');
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt data with RSA', { 
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create a secure session between two parties
   * @param {string} sessionId - Unique session identifier
   * @param {string} partyA - First party identifier
   * @param {string} partyB - Second party identifier
   * @returns {object} Session information
   */
  createSession(sessionId, partyA, partyB) {
    try {
      // Generate session key
      const sessionKey = this.generateAESKey();
      
      // Store session
      const session = {
        id: sessionId,
        partyA,
        partyB,
        key: sessionKey,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      
      this.sessions.set(sessionId, session);
      
      this.logger.info('Secure session created', { 
        sessionId, 
        partyA, 
        partyB 
      });
      
      return session;
    } catch (error) {
      this.logger.error('Failed to create secure session', { 
        error: error.message,
        sessionId,
        partyA,
        partyB
      });
      throw error;
    }
  }

  /**
   * Get session information
   * @param {string} sessionId - Session identifier
   * @returns {object} Session information
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
    
    return session || null;
  }

  /**
   * Encrypt message for a specific session
   * @param {string} sessionId - Session identifier
   * @param {string|Buffer} message - Message to encrypt
   * @returns {object} Encrypted message
   */
  encryptForSession(sessionId, message) {
    try {
      const session = this.getSession(sessionId);
      
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      
      const encrypted = this.encryptAES(message, session.key);
      
      this.logger.info('Message encrypted for session', { sessionId });
      return encrypted;
    } catch (error) {
      this.logger.error('Failed to encrypt message for session', { 
        error: error.message,
        sessionId
      });
      throw error;
    }
  }

  /**
   * Decrypt message from a specific session
   * @param {string} sessionId - Session identifier
   * @param {object} encryptedMessage - Encrypted message
   * @returns {string|Buffer} Decrypted message
   */
  decryptFromSession(sessionId, encryptedMessage) {
    try {
      const session = this.getSession(sessionId);
      
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      
      const decrypted = this.decryptAES(encryptedMessage, session.key);
      
      this.logger.info('Message decrypted from session', { sessionId });
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt message from session', { 
        error: error.message,
        sessionId
      });
      throw error;
    }
  }

  /**
   * Close a session
   * @param {string} sessionId - Session identifier
   */
  closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      this.sessions.delete(sessionId);
      this.logger.info('Session closed', { sessionId });
    }
  }

  /**
   * Get all active sessions
   * @returns {array} List of active sessions
   */
  getActiveSessions() {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      partyA: session.partyA,
      partyB: session.partyB,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    }));
  }

  /**
   * Generate a digital signature
   * @param {string|Buffer} data - Data to sign
   * @param {string} privateKey - Private key in PEM format
   * @returns {string} Digital signature in hex format
   */
  signData(data, privateKey) {
    try {
      const signature = crypto.sign('sha256', 
        typeof data === 'string' ? Buffer.from(data) : data, 
        privateKey);
      
      this.logger.info('Data signed');
      return signature.toString('hex');
    } catch (error) {
      this.logger.error('Failed to sign data', { 
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify a digital signature
   * @param {string|Buffer} data - Original data
   * @param {string} signature - Digital signature in hex format
   * @param {string} publicKey - Public key in PEM format
   * @returns {boolean} Whether signature is valid
   */
  verifySignature(data, signature, publicKey) {
    try {
      const isValid = crypto.verify('sha256',
        typeof data === 'string' ? Buffer.from(data) : data,
        publicKey,
        Buffer.from(signature, 'hex')
      );
      
      this.logger.info('Signature verification completed', { isValid });
      return isValid;
    } catch (error) {
      this.logger.error('Failed to verify signature', { 
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = EncryptionService;