<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Read JSON input
$data = json_decode(file_get_contents("php://input"));


if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "Missing data"]);
    exit;
}

// DB connection
$conn = new mysqli("localhost", "root", "", "furmaps_db");
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$email = $conn->real_escape_string($data->email);
$password = $data->password;

// Check if user exists
$sql = "SELECT * FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "user" => [
                "id" => $user['id'],
                "name" => $user['full_name'],
                "email" => $user['email'],
                "role" => $user['role']
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Incorrect password"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
}

$conn->close();
?>
