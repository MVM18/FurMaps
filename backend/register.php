<?php 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");


require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
  echo json_encode(["success" => false, "message" => "No data received"]);
  exit();
}

$fullName = $conn->real_escape_string($data->fullname ?? '');
$email = $conn->real_escape_string($data->email ?? '');
$password = password_hash($data->password ?? '', PASSWORD_BCRYPT);
$role = 'pet_owner';

$checkEmail = $conn->query("SELECT * FROM users WHERE email = '$email'");
if ($checkEmail->num_rows > 0) {
  echo json_encode(["success" => false, "message" => "Email already registered"]);
  exit();
}

$sql = "INSERT INTO users (full_name, email, password, role) VALUES ('$fullName', '$email', '$password', '$role')";

if ($conn->query($sql) === TRUE) {
  echo json_encode(["success" => true, "message" => "User registered successfully"]);
} else {
  echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$conn->close();
?>
