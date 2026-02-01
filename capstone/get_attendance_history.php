<?php
error_reporting(0);           // <--- MUST HAVE
ini_set('display_errors', 0); // <--- MUST HAVE

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'config/database.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$response = [];

if ($user_id > 0) {
    // Join 'events_attendance' with 'event_calendar' to get the Event Name and Location
    $query = "SELECT ea.scanned_at, ea.status, ec.event_name, ec.location 
              FROM events_attendance ea
              JOIN event_calendar ec ON ea.event_id = ec.event_id
              WHERE ea.user_id = ? 
              ORDER BY ea.scanned_at DESC";

    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    while ($row = mysqli_fetch_assoc($result)) {
        $row['formatted_date'] = date("M d, Y • h:i A", strtotime($row['scanned_at']));
        $response[] = $row;
    }
}
echo json_encode($response);

?>