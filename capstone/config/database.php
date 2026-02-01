<?php

/**
 * Database Configuration File
 * 
 * This file establishes connection to MySQL database
 * Used by both web pages and API endpoints
 */

// Prevent direct access
if (!defined('ORGSYNC_APP')) {
    define('ORGSYNC_APP', true);
}

// Session security hardening (must be called before session_start)
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.use_strict_mode', 1);
    // Uncomment when using HTTPS:
    // ini_set('session.cookie_secure', 1);
}

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
// SECURITY WARNING: In production, ensure this password is strong and not stored in version control
define('DB_PASS', '');
define('DB_NAME', 'orgsync_db');

// Create connection
$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if (!$conn) {
    // For web pages
    if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
        die("Database connection failed: " . mysqli_connect_error());
    }
    // For API calls (return JSON)
    else {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed'
        ]);
        exit;
    }
}

// Set charset to UTF-8 (supports special characters)
mysqli_set_charset($conn, "utf8mb4");

// Set timezone (adjust to Philippine time)
date_default_timezone_set('Asia/Manila');

/**
 * Function to close database connection
 * Call this at the end of scripts
 */
function close_connection()
{
    global $conn;
    if ($conn && !defined('TEST_MODE')) {
        mysqli_close($conn);
    }
}

// Success indicator for testing
// Remove this in production
if (defined('TEST_DB_CONNECTION')) {
    echo "✓ Database connected successfully!";
}
