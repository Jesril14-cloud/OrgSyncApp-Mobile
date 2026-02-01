<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['user_id'])) {
    $user_id = $data['user_id'];
    $first_name = $data['first_name'];
    $last_name = $data['last_name'];
    // Assuming you have these columns. If not, you might need to add them to your DB or use existing ones.
    // For this example, I will update the standard user fields.
    
    // NOTE: Ensure your 'users' table has 'course' and 'birthdate' columns. 
    // If not, run this SQL in phpMyAdmin: 
    // ALTER TABLE users ADD COLUMN course VARCHAR(50), ADD COLUMN birthdate DATE;
    
    $course = $data['course'] ?? ''; 
    $birthdate = $data['birthdate'] ?? '';

    $query = "UPDATE users SET first_name=?, last_name=?, course=?, birthdate=? WHERE user_id=?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "ssssi", $first_name, $last_name, $course, $birthdate, $user_id);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
}
?>