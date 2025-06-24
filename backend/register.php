<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit(0); // Preflight request
}

require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
  echo json_encode(["success" => false, "message" => "No data received"]);
  exit();
}

$fullName = trim($data->fullname ?? '');
$email = trim($data->email ?? '');
$password = $data->password ?? '';
$role = isset($data->role) ? trim($data->role) : 'owner';

if (!$fullName || !$email || !$password) {
  echo json_encode(["success" => false, "message" => "All fields are required"]);
  exit();
}

// Check if email already exists
$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
  echo json_encode(["success" => false, "message" => "Email already registered"]);
  $checkStmt->close();
  $conn->close();
  exit();
}
$checkStmt->close();

// Hash password
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $fullName, $email, $hashedPassword, $role);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "User registered successfully"]);
} else {
  echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
