#!/usr/bin/env node

/**
 * JWT Secret Generator
 * Generates a cryptographically secure random string for JWT signing
 * 
 * Usage: node generate-jwt-secret.js
 */

const crypto = require('crypto');

// Generate a 64-byte (512-bit) random secret and convert to hex
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('🔐 Generated JWT Secret:');
console.log('');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');
console.log('📋 Copy the above line to your .env file');
console.log('');
console.log('🔒 Security Notes:');
console.log('- This secret is used to sign JWT tokens');
console.log('- Keep it private and never commit to version control');
console.log('- Use a different secret for each environment (dev/staging/prod)');
console.log('- Store securely in production (environment variables)'); 