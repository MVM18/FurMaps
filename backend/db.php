<?php
$servername = "localhost";  // or 127.0.0.1
$username = "root";         // default for XAMPP
$password = "";             // default is empty
$dbname = "furmaps_db";     // your database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
