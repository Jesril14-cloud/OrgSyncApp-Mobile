<?php
// 🟢 LOGIN.PHP - DEBUG VERSION
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? ''; // The password sent by the phone

// 1. Find User
$query = "SELECT * FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

// 2. User Check
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found in database']);
    exit;
}

// 3. Password Check (THE MOMENT OF TRUTH)
if (!password_verify($password, $user['password'])) {
    // 🔴 DEBUG: TELL THE USER WHAT WE RECEIVED
    echo json_encode([
        'success' => false, 
        'message' => "MISMATCH! Server received: [$password]. Expected Hash starts with: " . substr($user['password'], 0, 10) . "..."
    ]);
    exit;
}

// 4. Success Logic
$session_id = bin2hex(random_bytes(16));
echo json_encode([
    'success' => true, 
    'message' => 'Login successful',
    'session_id' => $session_id,
    'require_otp' => false, 
    'user' => [
        'user_id' => $user['user_id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email'],
        'role' => $user['role']
    ]
]);
?>