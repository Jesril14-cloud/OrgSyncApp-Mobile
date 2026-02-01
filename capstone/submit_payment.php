<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'config/database.php';

$input = json_decode(file_get_contents("php://input"), true);

$fine_id = isset($input['fine_id']) ? intval($input['fine_id']) : 0;
$user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
$payment_ref = isset($input['payment_reference']) ? trim($input['payment_reference']) : '';

if ($fine_id <= 0 || $user_id <= 0 || empty($payment_ref)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

// Logic: Update fine to 'Paid' and save the OR Number
$query = "UPDATE student_fines 
          SET payment_reference = ?, 
              paid_at = NOW(),
              status = 'Paid'
          WHERE fine_id = ? AND user_id = ? AND absence_type = 'Unexcused'";

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "sii", $payment_ref, $fine_id, $user_id);

if (mysqli_stmt_execute($stmt) && mysqli_stmt_affected_rows($stmt) > 0) {
    echo json_encode(['success' => true, 'message' => 'Payment recorded successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed. Ensure fine is Unpaid/Unexcused.']);
}
?>