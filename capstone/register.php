<?php
// 🟢 1. MOBILE & WEB HYBRID HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle Pre-flight checks (Crucial for Mobile)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 🟢 2. DETECT MOBILE APP DATA (JSON)
// If the phone sends data, we convert it so the old Web code understands it
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

if ($data) {
    $_POST = $data; // Convert JSON to $_POST
    
    // 🔴 CRITICAL: FAKE THE BUTTON CLICK
    // This tricks the code below into thinking you clicked the "Register" button
    $_POST['register'] = true;       
    $_POST['submit'] = true;         
    $_POST['btn_register'] = true;   
}

// 🟢 3. YOUR ORIGINAL WEB LOGIC STARTS HERE
// (We just ensure it doesn't crash if files are missing)

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Adjust these paths if your folder structure is different!
require 'vendor/autoload.php'; 
require 'config/database.php'; 

$message = "";
$error = "";

// 🟢 4. THE REGISTRATION LOGIC
// We check for 'register' OR 'submit' OR 'btn_register' just to be safe
if (isset($_POST['register']) || isset($_POST['submit']) || isset($_POST['btn_register']) || !empty($data)) {
    
    // Sanitize Inputs
    $first_name = mysqli_real_escape_string($conn, $_POST['first_name'] ?? '');
    $last_name = mysqli_real_escape_string($conn, $_POST['last_name'] ?? '');
    $email = mysqli_real_escape_string($conn, $_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Default Role = Student (if not sent)
    $role = $_POST['role'] ?? 'Student'; 

    // Validation
    if (empty($first_name) || empty($last_name) || empty($email) || empty($password)) {
        if ($data) { echo json_encode(['success' => false, 'message' => 'All fields are required']); exit; }
        $error = "All fields are required";
    } else {
        
        // Check if Email Exists
        $check_query = "SELECT * FROM users WHERE email = '$email'";
        $check_result = mysqli_query($conn, $check_query);
        
        if (mysqli_num_rows($check_result) > 0) {
            if ($data) { echo json_encode(['success' => false, 'message' => 'Email already registered']); exit; }
            $error = "Email already registered!";
        } else {
            // 🟢 5. HASH PASSWORD (CRITICAL FOR LOGIN TO WORK)
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $verification_code = substr(number_format(time() * rand(), 0, '', ''), 0, 6);
            $status = "Pending"; // Default status

            // Insert User
            $query = "INSERT INTO users (first_name, last_name, email, password, role, account_status, verification_code) 
                      VALUES ('$first_name', '$last_name', '$email', '$hashed_password', '$role', '$status', '$verification_code')";
            
            if (mysqli_query($conn, $query)) {
                
                // 🟢 6. SEND EMAIL (PHPMailer)
                $mail = new PHPMailer(true);
                try {
                    // SMTP Settings (Make sure these match your working web version!)
                    $mail->isSMTP();
                    $mail->Host       = 'smtp.gmail.com'; 
                    $mail->SMTPAuth   = true;
                    $mail->Username   = 'your_email@gmail.com'; // REPLACE THIS
                    $mail->Password   = 'your_app_password';    // REPLACE THIS
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port       = 587;

                    $mail->setFrom('your_email@gmail.com', 'OrgSync Admin'); // REPLACE THIS
                    $mail->addAddress($email, "$first_name $last_name");

                    $mail->isHTML(true);
                    $mail->Subject = 'Verify Your OrgSync Account';
                    $mail->Body    = "
                        <h3>Welcome to OrgSync, $first_name!</h3>
                        <p>Your account has been created successfully.</p>
                        <p><b>Verification Code:</b> $verification_code</p>
                        <p>Please wait for the CSA Admin to approve your account.</p>
                    ";

                    $mail->send();

                    // Success Response for Mobile
                    if ($data) {
                        echo json_encode(['success' => true, 'message' => 'Registration successful! Check your email.']);
                        exit;
                    }
                    $message = "Registration successful! Please check your email.";

                } catch (Exception $e) {
                    if ($data) {
                        echo json_encode(['success' => true, 'message' => 'Registered, but email failed: ' . $mail->ErrorInfo]);
                        exit;
                    }
                    $error = "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
                }
            } else {
                if ($data) { echo json_encode(['success' => false, 'message' => 'Database Error: ' . mysqli_error($conn)]); exit; }
                $error = "Database Error!";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head><title>Register</title></head>
<body>
    <?php if($message) echo "<h3 style='color:green'>$message</h3>"; ?>
    <?php if($error) echo "<h3 style='color:red'>$error</h3>"; ?>
    
    <form method="POST" action="">
        <input type="text" name="first_name" placeholder="First Name" required><br>
        <input type="text" name="last_name" placeholder="Last Name" required><br>
        <input type="email" name="email" placeholder="Email" required><br>
        <input type="password" name="password" placeholder="Password" required><br>
        <button type="submit" name="register">Register</button>
    </form>
</body>
</html>