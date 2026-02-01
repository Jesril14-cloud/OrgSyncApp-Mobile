<?php
// 🟢 SILENCE WARNINGS
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// 🟢 FORCE MANILA TIME (Crucial for your laptop date)
date_default_timezone_set('Asia/Manila');
$current_time = date('Y-m-d H:i:s'); 

require_once 'config/database.php';

// 🟢 THE QUERY: Added "WHERE start_time >= '$current_time'"
$query = "SELECT 
            ec.event_id, 
            ec.event_name, 
            ec.location, 
            ec.start_time, 
            ec.end_time,
            ep.description,
            o.name as org_name, 
            o.color_code
          FROM event_calendar ec
          JOIN event_proposals ep ON ec.proposal_id = ep.proposal_id
          JOIN organizations o ON ep.organization_id = o.organization_id
          WHERE ec.start_time >= '$current_time'   
          ORDER BY ec.start_time ASC";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
    exit;
}

$events = [];
while ($row = mysqli_fetch_assoc($result)) {
    $events[] = [
        'id' => $row['event_id'],
        'title' => $row['event_name'],
        'location' => $row['location'],
        'start' => $row['start_time'],
        'end' => $row['end_time'],
        'description' => $row['description'] ?? 'No description provided.',
        'organization' => $row['org_name'],
        'color' => $row['color_code'] ?? '#1b5e20',
        'backgroundColor' => $row['color_code'] ?? '#1b5e20',
        'textColor' => '#ffffff'
    ];
}

echo json_encode(['success' => true, 'events' => $events]);
?>