<?php
// 🟢 SILENCE WARNINGS
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

require_once 'config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id)) {
    echo json_encode(["success" => false, "message" => "Missing User ID"]);
    exit;
}

$user_id = intval($data->user_id);
$first_name = mysqli_real_escape_string($conn, $data->first_name);
$last_name = mysqli_real_escape_string($conn, $data->last_name);
$phone = mysqli_real_escape_string($conn, $data->phone);
$birthdate = mysqli_real_escape_string($conn, $data->birthdate);

// 1. Update Text Fields
$query = "UPDATE users SET first_name='$first_name', last_name='$last_name', phone_number='$phone', birthdate='$birthdate' WHERE user_id=$user_id";

if (!mysqli_query($conn, $query)) {
    echo json_encode(["success" => false, "message" => "Update failed: " . mysqli_error($conn)]);
    exit;
}

// 2. Handle Profile Picture (if provided)
if (!empty($data->photo_base64)) {
    $photoData = mysqli_real_escape_string($conn, $data->photo_base64);
    $imgQuery = "UPDATE users SET profile_pic='$photoData' WHERE user_id=$user_id";
    mysqli_query($conn, $imgQuery);
}

// 3. Return the Updated User Data
$result = mysqli_query($conn, "SELECT * FROM users WHERE user_id=$user_id");
$updatedUser = mysqli_fetch_assoc($result);
unset($updatedUser['password']); // Don't send password back

echo json_encode(["success" => true, "message" => "Profile updated!", "user" => $updatedUser]);
?>