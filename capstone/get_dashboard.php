<?php
// 🟢 SILENCE WARNINGS
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// 🟢 FORCE MANILA TIME
date_default_timezone_set('Asia/Manila');
$current_time = date('Y-m-d H:i:s'); 

require_once 'config/database.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode(["events_count" => 0, "fines_total" => 0, "notifs_count" => 0, "upcoming_events" => []]);
    exit;
}

// 1. GET UPCOMING EVENTS
// Note: We select 'o.name as org_name' here, but we will map it to 'organization_name' below to match the Web.
$events_query = "SELECT ec.event_id, ec.event_name, ec.start_time, ec.location, o.name as org_name
                 FROM event_calendar ec
                 JOIN event_proposals ep ON ec.proposal_id = ep.proposal_id
                 JOIN organizations o ON ep.organization_id = o.organization_id
                 WHERE ec.start_time >= '$current_time' 
                 AND ec.start_time <= DATE_ADD('$current_time', INTERVAL 30 DAY)
                 ORDER BY ec.start_time ASC
                 LIMIT 5";

$events_result = mysqli_query($conn, $events_query);
$upcoming_events = [];

while ($row = mysqli_fetch_assoc($events_result)) {
    // Format: "Feb 20, 2026 9:00 AM" (Matches your Web Dashboard)
    $formatted_date = date('M d, Y g:i A', strtotime($row['start_time']));

    $upcoming_events[] = [
        'id' => $row['event_id'],
        
        // 🟢 TITLES (Sending all variations)
        'event_name' => $row['event_name'],  // Web uses this
        'title' => $row['event_name'],       // Common mobile name
        'name' => $row['event_name'],

        // 🟢 ORGANIZATION (This was the missing piece!)
        'organization_name' => $row['org_name'], // <--- MATCHES WEB DASHBOARD
        'org_name' => $row['org_name'],
        'organization' => $row['org_name'],
        
        // 🟢 DATES (Sending all variations)
        'start_time' => $formatted_date, // Web uses this
        'start' => $formatted_date,      // Calendars use this
        'date' => $formatted_date,
        'time' => $formatted_date,
        
        // 🟢 LOCATION
        'location' => $row['location']
    ];
}

// 2. GET UNPAID FINES
$fines_query = "SELECT SUM(fine_amount) as total_fines 
                FROM student_fines 
                WHERE user_id = $user_id AND status = 'Unpaid'";
$fines_result = mysqli_query($conn, $fines_query);
$fines_data = mysqli_fetch_assoc($fines_result);
$total_fines = $fines_data['total_fines'] ? $fines_data['total_fines'] : 0;

// 3. GET UNREAD NOTIFICATIONS
$notif_query = "SELECT COUNT(*) as count FROM notifications WHERE user_id = $user_id AND is_read = 0";
$notif_result = mysqli_query($conn, $notif_query);
$notif_data = mysqli_fetch_assoc($notif_result);

// 4. RETURN DATA
echo json_encode([
    "events_count" => count($upcoming_events),
    "fines_total" => floatval($total_fines),
    "notifs_count" => intval($notif_data['count']),
    "upcoming_events" => $upcoming_events
]);
?>