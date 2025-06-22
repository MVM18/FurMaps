<?php
$servername = "sql213.infinityfree.com";  // or 127.0.0.1
$username = "if0_39292121";         // default for XAMPP
$password = "8pBwOSvhQp";             // default is empty
$dbname = "if0_39292121_furmaps";     // your database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
