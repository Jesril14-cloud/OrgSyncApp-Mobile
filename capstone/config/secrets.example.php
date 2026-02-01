<?php

/**
 * Secrets Configuration TEMPLATE
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to 'secrets.php' in the same directory
 * 2. Fill in your actual credentials
 * 3. NEVER commit secrets.php to version control
 * 
 * This template file CAN be committed - it contains no real credentials.
 */

// Prevent direct access
if (!defined('ORGSYNC_APP')) {
    die('Direct access not permitted');
}

// QR Code generation/validation secret
// Generate a unique random string for production
define('QR_SECRET', 'CHANGE_THIS_TO_A_RANDOM_STRING');

// ============================================
// Email Configuration (SMTP)
// ============================================
// For Gmail: Use App Password (not regular password)
// To create an App Password:
// 1. Go to Google Account > Security
// 2. Enable 2-Factor Authentication
// 3. Go to App Passwords and generate one for "Mail"

define('SMTP_HOST', 'smtp.gmail.com');       // SMTP server
define('SMTP_PORT', 587);                     // SMTP port (587 for TLS, 465 for SSL)
define('SMTP_USER', 'your-email@gmail.com'); // SMTP username
define('SMTP_PASS', 'your-app-password');    // SMTP password or app password
define('SMTP_FROM_NAME', 'OrgSync - Holy Name University');
define('SMTP_FROM_EMAIL', 'noreply@hnu.edu.ph');
