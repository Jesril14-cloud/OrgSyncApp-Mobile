<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['email']) && isset($data['otp'])) {
    $email = $data['email'];
    $otp_input = $data['otp'];

    // 1. Find user with this email AND this OTP
    $sql = "SELECT * FROM users WHERE email = '$email' AND otp_code = '$otp_input'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);

        // 2. Check if expired
        $current_time = date("Y-m-d H:i:s");
        if ($current_time > $row['otp_expiry']) {
            echo json_encode(["success" => false, "message" => "Code expired. Login again."]);
        } else {
            // 3. SUCCESS! Clear the OTP so it can't be used twice
            mysqli_query($conn, "UPDATE users SET otp_code = NULL WHERE id = " . $row['id']);

            echo json_encode([
                "success" => true,
                "message" => "Login Successful",
                "user" => [
                    "id" => $row['id'],
                    "first_name" => $row['first_name'],
                    "last_name" => $row['last_name'],
                    "phone_number" => $row['phone_number'],
                    "student_id" => $row['student_id'],
                    "course" => $row['course'],
                    "year_level" => $row['year_level'],
                    "email" => $row['email']
                ]
            ]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid Code"]);
    }
}
?>