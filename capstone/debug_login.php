<?php
// FILE: debug_login.php

// 🔴 FIX: Removed "../" because this file is already inside the capstone folder
// It will now look for: C:\xampp\htdocs\capstone\config\database.php
if (file_exists('config/database.php')) {
    require_once 'config/database.php';
} elseif (file_exists('../config/database.php')) {
    require_once '../config/database.php';
} else {
    die("<h1>Critical Error</h1>Could not find <strong>database.php</strong>.<br>Please check if the folder is named 'config' inside 'capstone'.");
}

$email = $_GET['email'] ?? '';
$password = $_GET['password'] ?? '';

echo "<h1>Debug Report</h1>";
echo "Testing Email: <strong>$email</strong><br>";
echo "Testing Password: <strong>$password</strong><br><hr>";

// 1. Find User
$query = "SELECT * FROM users WHERE email = '$email'";
$result = mysqli_query($conn, $query);
$user = mysqli_fetch_assoc($result);

if (!$user) {
    die("<h2 style='color:red'>USER NOT FOUND in Database</h2>");
}

echo "User Found! ID: " . $user['user_id'] . "<br>";
echo "Stored Hash in DB: <strong>" . $user['password'] . "</strong><br><br>";

// 2. Check Logic
if ($password === $user['password']) {
    echo "<h2 style='color:orange'>WARNING: You are storing PLAIN TEXT passwords!</h2>";
    echo "Your login.php expects a HASH, but you saved it normally. <br>";
    echo "Fix: Update register.php to use password_hash().";
} elseif (password_verify($password, $user['password'])) {
    echo "<h2 style='color:green'>SUCCESS! Password Matches.</h2>";
    echo "If the App fails, the App is sending the wrong data (maybe hidden spaces?).";
} else {
    echo "<h2 style='color:red'>FAILURE: Password does not match.</h2>";
    echo "Possible reasons:<br>";
    echo "1. DB Column is too short (did you change it to 255?)<br>";
    echo "2. You are testing with a different password than you registered.<br>";
    echo "3. Hidden spaces in input.";
}
?>