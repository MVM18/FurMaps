<?php
if (isset($_POST['register'])) {
    // 1. Connect to DB
    $conn = new mysqli("localhost", "root", "", "furmaps_db");
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // 2. Sanitize and get data
    $name = $conn->real_escape_string($_POST['fullname']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = $_POST['password'];
    $confirm = $_POST['confirm_password'];

    // 3. Check password match
    if ($password !== $confirm) {
        echo "<script>alert('Passwords do not match'); window.history.back();</script>";
        exit;
    }

    // 4. Hash password
    $hashed = password_hash($password, PASSWORD_DEFAULT);

    // 5. Check if email already exists
    $check = $conn->query("SELECT * FROM users WHERE email='$email'");
    if ($check->num_rows > 0) {
        echo "<script>alert('Email already registered'); window.history.back();</script>";
        exit;
    }

    // 6. Insert into DB
    $sql = "INSERT INTO users (full_name, email, password, role) VALUES ('$name', '$email', '$hashed', 'customer')";
    if ($conn->query($sql) === TRUE) {
           session_start();
           $_SESSION['success'] = "Registration successful! Please log in.";
           header("Location: login.php");
          exit;
    } else {
        echo "Error: " . $conn->error;
    }

    // 7. Close DB
    $conn->close();
} else {
    header("Location: RegisterUser.php");
    exit;
}
?>
