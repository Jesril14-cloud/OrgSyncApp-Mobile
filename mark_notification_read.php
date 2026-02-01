<?php
// mark_notification_read.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

require_once 'config/database.php';

$input = json_decode(file_get_contents("php://input"), true);
$notification_id = isset($input['notification_id']) ? intval($input['notification_id']) : 0;
$user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;

if ($notification_id <= 0 || $user_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

// Update the database
$query = "UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $notification_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>