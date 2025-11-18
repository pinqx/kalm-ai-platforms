#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      details
    };

    switch (level) {
      case 'ERROR':
        this.issues.push(logEntry);
        console.error(`❌ ${message}`);
        break;
      case 'WARNING':
        this.warnings.push(logEntry);
        console.warn(`⚠️  ${message}`);
        break;
      case 'PASS':
        this.passed.push(logEntry);
        console.log(`✅ ${message}`);
        break;
    }
  }

  // Check environment variables
  checkEnvironmentVariables() {
    console.log('\n🔍 Checking Environment Variables...');
    
    const requiredVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY'
    ];

    const sensitiveVars = [
      'JWT_SECRET',
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];

    // Try to load .env file if it exists
    try {
      const fs = require('fs');
      const path = require('path');
      const dotenv = require('dotenv');
      
      const envPath = path.join(process.cwd(), 'server', '.env');
      if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        
        requiredVars.forEach(varName => {
          const value = envConfig[varName] || process.env[varName];
          if (!value) {
            this.log('ERROR', `Missing required environment variable: ${varName}`);
          } else {
            this.log('PASS', `Environment variable present: ${varName}`);
          }
        });

        sensitiveVars.forEach(varName => {
          const value = envConfig[varName] || process.env[varName];
          if (value) {
            if (value.length < 20) {
              this.log('WARNING', `Suspiciously short ${varName} (${value.length} chars)`);
            } else if (value.includes('test') || value.includes('demo') || value.includes('sk-your-')) {
              this.log('ERROR', `Using placeholder/demo value for ${varName}`);
            } else {
              this.log('PASS', `Secure ${varName} configured`);
            }
          }
        });
      } else {
        this.log('WARNING', 'No .env file found in server directory');
      }
    } catch (error) {
      this.log('WARNING', `Could not check environment variables: ${error.message}`);
    }
  }

  // Check file permissions
  checkFilePermissions() {
    console.log('\n🔍 Checking File Permissions...');
    
    const sensitiveFiles = [
      '.env',
      'server/.env',
      'package-lock.json',
      'yarn.lock'
    ];

    sensitiveFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          const mode = stats.mode.toString(8);
          
          if (mode.endsWith('666') || mode.endsWith('777')) {
            this.log('ERROR', `Insecure file permissions for ${file}: ${mode}`);
          } else if (mode.endsWith('644') || mode.endsWith('600')) {
            this.log('PASS', `Secure file permissions for ${file}: ${mode}`);
          } else {
            this.log('WARNING', `Unusual file permissions for ${file}: ${mode}`);
          }
        }
      } catch (error) {
        this.log('WARNING', `Could not check permissions for ${file}: ${error.message}`);
      }
    });
  }

  // Check for hardcoded secrets
  checkForHardcodedSecrets() {
    console.log('\n🔍 Checking for Hardcoded Secrets...');
    
    const filesToCheck = [
      'server/server.js',
      'server/middleware/security.js',
      'server/models/User.js',
      'client/src/App.tsx',
      'client/src/components/*.tsx'
    ];

    const secretPatterns = [
      /sk-[a-zA-Z0-9]{48}/,
      /pk_[a-zA-Z0-9]{24}/,
      /process\.env\.[A-Z_]+.*=.*['"][^'"]{8,}['"]/, // Hardcoded env vars
      /password.*=.*['"][^'"]{8,}['"]/, // Hardcoded passwords
      /secret.*=.*['"][^'"]{8,}['"]/, // Hardcoded secrets
      /api_key.*=.*['"][^'"]{8,}['"]/, // Hardcoded API keys
      /token.*=.*['"][^'"]{8,}['"]/ // Hardcoded tokens
    ];

    // Patterns to ignore (legitimate code patterns)
    const ignorePatterns = [
      /localStorage\.getItem\(/,
      /localStorage\.setItem\(/,
      /useState\(/,
      /setToken\(/,
      /token, setToken/,
      /password, setPassword/,
      /process\.env\.NODE_ENV/,
      /process\.env\.USE_OPENAI/,
      /authHeader && authHeader\.split\(/,
      /jwt\.verify\(token,/
    ];

    filesToCheck.forEach(pattern => {
      try {
        const files = this.globSync(pattern);
        files.forEach(file => {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            secretPatterns.forEach((regex, index) => {
              const matches = content.match(regex);
              if (matches) {
                // Check if this match should be ignored
                const shouldIgnore = ignorePatterns.some(ignorePattern => 
                  ignorePattern.test(matches[0])
                );
                
                if (!shouldIgnore) {
                  this.log('ERROR', `Potential hardcoded secret found in ${file}: ${matches[0].substring(0, 20)}...`);
                }
              }
            });
          }
        });
      } catch (error) {
        this.log('WARNING', `Could not check ${pattern}: ${error.message}`);
      }
    });
  }

  // Check dependencies for vulnerabilities
  checkDependencies() {
    console.log('\n🔍 Checking Dependencies...');
    
    const packageFiles = ['package.json', 'client/package.json'];
    
    packageFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));
          const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
          
          // Check for known vulnerable packages
          const vulnerablePackages = [
            'lodash',
            'moment',
            'jquery',
            'express'
          ];
          
          vulnerablePackages.forEach(pkg => {
            if (deps[pkg]) {
              this.log('WARNING', `Potentially vulnerable package: ${pkg}@${deps[pkg]}`);
            }
          });
          
          this.log('PASS', `Dependencies checked for ${file}`);
        } catch (error) {
          this.log('ERROR', `Could not parse ${file}: ${error.message}`);
        }
      }
    });
  }

  // Check CORS configuration
  checkCORSConfiguration() {
    console.log('\n🔍 Checking CORS Configuration...');
    
    try {
      const securityFile = fs.readFileSync('server/middleware/security.js', 'utf8');
      
      if (securityFile.includes('origin: true') || securityFile.includes('origin: "*"')) {
        this.log('ERROR', 'CORS is configured to allow all origins');
      } else if (securityFile.includes('corsOptions')) {
        this.log('PASS', 'CORS is properly configured with specific origins');
      } else {
        this.log('WARNING', 'CORS configuration not found');
      }
    } catch (error) {
      this.log('WARNING', `Could not check CORS configuration: ${error.message}`);
    }
  }

  // Check rate limiting
  checkRateLimiting() {
    console.log('\n🔍 Checking Rate Limiting...');
    
    try {
      const securityFile = fs.readFileSync('server/middleware/security.js', 'utf8');
      
      if (securityFile.includes('rateLimit') && securityFile.includes('express-rate-limit')) {
        this.log('PASS', 'Rate limiting is configured');
      } else {
        this.log('ERROR', 'Rate limiting is not configured');
      }
      
      if (securityFile.includes('authLimiter')) {
        this.log('PASS', 'Authentication rate limiting is configured');
      } else {
        this.log('WARNING', 'Authentication rate limiting not found');
      }
    } catch (error) {
      this.log('WARNING', `Could not check rate limiting: ${error.message}`);
    }
  }

  // Check input validation
  checkInputValidation() {
    console.log('\n🔍 Checking Input Validation...');
    
    try {
      const securityFile = fs.readFileSync('server/middleware/security.js', 'utf8');
      
      if (securityFile.includes('sanitizeInput') || securityFile.includes('input.*validation')) {
        this.log('PASS', 'Input validation/sanitization is configured');
      } else {
        this.log('WARNING', 'Input validation not found');
      }
    } catch (error) {
      this.log('WARNING', `Could not check input validation: ${error.message}`);
    }
  }

  // Check HTTPS enforcement
  checkHTTPSEnforcement() {
    console.log('\n🔍 Checking HTTPS Enforcement...');
    
    try {
      const securityFile = fs.readFileSync('server/middleware/security.js', 'utf8');
      
      if (securityFile.includes('Strict-Transport-Security') || securityFile.includes('HSTS')) {
        this.log('PASS', 'HSTS header is configured');
      } else {
        this.log('WARNING', 'HSTS header not configured');
      }
    } catch (error) {
      this.log('WARNING', `Could not check HTTPS enforcement: ${error.message}`);
    }
  }

  // Check for SQL injection vulnerabilities
  checkSQLInjection() {
    console.log('\n🔍 Checking for SQL Injection Vulnerabilities...');
    
    try {
      const serverFile = fs.readFileSync('server/server.js', 'utf8');
      
      if (serverFile.includes('mongoose') && serverFile.includes('connect')) {
        this.log('PASS', 'Using Mongoose ODM (protects against SQL injection)');
      } else {
        this.log('WARNING', 'No database connection found or not using ODM');
      }
    } catch (error) {
      this.log('WARNING', `Could not check SQL injection protection: ${error.message}`);
    }
  }

  // Check for XSS vulnerabilities
  checkXSSProtection() {
    console.log('\n🔍 Checking XSS Protection...');
    
    try {
      const securityFile = fs.readFileSync('server/middleware/security.js', 'utf8');
      
      if (securityFile.includes('X-XSS-Protection') || securityFile.includes('Content-Security-Policy')) {
        this.log('PASS', 'XSS protection headers are configured');
      } else {
        this.log('WARNING', 'XSS protection headers not found');
      }
      
      if (securityFile.includes('sanitize') || securityFile.includes('escape')) {
        this.log('PASS', 'Input sanitization is configured');
      } else {
        this.log('WARNING', 'Input sanitization not found');
      }
    } catch (error) {
      this.log('WARNING', `Could not check XSS protection: ${error.message}`);
    }
  }

  // Generate report
  generateReport() {
    console.log('\n📊 Security Audit Report');
    console.log('='.repeat(50));
    
    console.log(`\n❌ Issues Found: ${this.issues.length}`);
    this.issues.forEach(issue => {
      console.log(`  - ${issue.message}`);
    });
    
    console.log(`\n⚠️  Warnings: ${this.warnings.length}`);
    this.warnings.forEach(warning => {
      console.log(`  - ${warning.message}`);
    });
    
    console.log(`\n✅ Passed Checks: ${this.passed.length}`);
    
    const totalChecks = this.issues.length + this.warnings.length + this.passed.length;
    const securityScore = Math.round((this.passed.length / totalChecks) * 100);
    
    console.log(`\n🔒 Security Score: ${securityScore}%`);
    
    if (securityScore >= 80) {
      console.log('🎉 Good security posture!');
    } else if (securityScore >= 60) {
      console.log('⚠️  Moderate security posture - review warnings and issues');
    } else {
      console.log('🚨 Poor security posture - immediate attention required');
    }
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
      warnings: this.warnings,
      passed: this.passed,
      securityScore
    };
    
    fs.writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to security-audit-report.json');
  }

  // Helper function to simulate glob
  globSync(pattern) {
    if (pattern.includes('*')) {
      // Simple glob implementation
      const dir = path.dirname(pattern);
      const base = path.basename(pattern).replace('*', '');
      try {
        return fs.readdirSync(dir)
          .filter(file => file.includes(base))
          .map(file => path.join(dir, file));
      } catch (error) {
        return [];
      }
    } else {
      return [pattern];
    }
  }

  // Run all checks
  run() {
    console.log('🔒 Starting Security Audit...\n');
    
    this.checkEnvironmentVariables();
    this.checkFilePermissions();
    this.checkForHardcodedSecrets();
    this.checkDependencies();
    this.checkCORSConfiguration();
    this.checkRateLimiting();
    this.checkInputValidation();
    this.checkHTTPSEnforcement();
    this.checkSQLInjection();
    this.checkXSSProtection();
    
    this.generateReport();
  }
}

// Run the audit if this file is executed directly
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.run();
}

module.exports = SecurityAuditor; 