<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'config/database.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid User ID']);
    exit;
}

// 🟢 UPDATED QUERY: Now joins with event_calendar and organizations
$query = "SELECT sf.fine_id, sf.fine_amount, sf.status, sf.absence_type, sf.justification,
                 ec.event_name, ec.start_time as event_date,
                 o.name as org_name
          FROM student_fines sf
          JOIN event_calendar ec ON sf.event_id = ec.event_id
          LEFT JOIN organizations o ON sf.organization_id = o.organization_id
          WHERE sf.user_id = ?
          ORDER BY sf.issued_at DESC";

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$fines = [];
while ($row = mysqli_fetch_assoc($result)) {
    $fines[] = [
        'id' => $row['fine_id'],
        'event' => $row['event_name'],            // <--- Now we have this!
        'organization' => $row['org_name'],       // <--- And this!
        'date' => date('M d, Y', strtotime($row['event_date'])),
        'amount' => number_format($row['fine_amount'], 2),
        'amount_raw' => $row['fine_amount'],
        'status' => $row['status'],
        'absence_type' => $row['absence_type'],
        'has_justification' => !empty($row['justification'])
    ];
}

echo json_encode(['success' => true, 'fines' => $fines]);
?>