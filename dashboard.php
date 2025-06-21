<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
require_once 'includes/db.php';
//include '../includes/header.php';
?>

<h2>Welcome, <?= htmlspecialchars($_SESSION['user_name']) ?>!</h2>
<p>Role: <?= $_SESSION['user_role'] ?></p>

<ul>
    <li><a href="pets.php">My Pets</a></li>
    <li><a href="bookings.php">My Bookings</a></li>
</ul>

<?php// include '../includes/footer.php'; ?>
