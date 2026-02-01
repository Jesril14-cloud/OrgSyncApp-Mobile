<?php
$to = "jesrilababon2003@gmail.com"; // We send it to yourself to test
$subject = "Test Email from XAMPP";
$message = "If you can read this, your XAMPP is working!";
$headers = "From: jesrilababon2003@gmail.com";

echo "Attempting to send email...<br>";

if (mail($to, $subject, $message, $headers)) {
    echo "SUCCESS! Email was sent.";
} else {
    echo "FAILED! Email could not be sent.";
}
?>