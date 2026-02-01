<?php

/**
 * Secrets Configuration
 * 
 * Centralized location for sensitive configuration values
 * This file should be excluded from version control in production
 */

// Prevent direct access
if (!defined('ORGSYNC_APP')) {
    die('Direct access not permitted');
}

// QR Code generation/validation secret
define('QR_SECRET', 'OrgSync2025SecretKey');

// ============================================
// Email Configuration (SMTP)
// ============================================
// Update these values with your SMTP credentials
// For Gmail: Use App Password (not regular password)
// For testing: Use Mailtrap.io credentials

define('SMTP_HOST', 'smtp.gmail.com');       // SMTP server
define('SMTP_PORT', 587);                     // SMTP port (587 for TLS, 465 for SSL)
define('SMTP_USER', 'testingcrossfire@gmail.com'); // SMTP username
define('SMTP_PASS', 'jaljmccejkdmwcbl');    // SMTP password or app password
define('SMTP_FROM_NAME', 'OrgSync - Holy Name University');
define('SMTP_FROM_EMAIL', 'noreply@hnu.edu.ph');
