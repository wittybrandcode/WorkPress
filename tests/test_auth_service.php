<?php
require_once dirname( __DIR__, 4 ) . '/wp-load.php';

echo "=== WorkPress Native Auth Gateway Verification ===" . PHP_EOL;

// 1. Service Instance
$auth_service = WorkPress_Auth_Service::get_instance();
echo "[1] Service Instance: " . ($auth_service ? 'PASS' : 'FAIL') . PHP_EOL;

// 2. Filtered Login URL
$login_url = wp_login_url();
echo "[2] Filtered Login URL: " . $login_url . PHP_EOL;
$is_custom = strpos($login_url, 'workpress-login') !== false;
echo "    Custom URL Active: " . ($is_custom ? 'PASS' : 'FAIL') . PHP_EOL;

// 3. Filtered Logout URL
$logout_url = wp_logout_url();
echo "[3] Filtered Logout URL: " . $logout_url . PHP_EOL;

// 4. Role-based Smart Redirection Test
$all_users = get_users();
echo "[4] Testing Smart Redirections across users (" . count($all_users) . "):" . PHP_EOL;
foreach ($all_users as $u) {
    $roles_str = implode(',', (array)$u->roles);
    $dest = $auth_service->resolve_role_landing_page($u);
    echo "    User: {$u->user_login} (Roles: [{$roles_str}]) => Landing: {$dest}" . PHP_EOL;
}

// 5. Template file existence
$tpl = WORKPRESS_PATH . 'templates/auth/login.php';
echo "[5] Login Template File Exists: " . (file_exists($tpl) ? 'PASS' : 'FAIL') . PHP_EOL;

$css = WORKPRESS_PATH . 'assets/css/auth.css';
echo "[6] Auth CSS File Exists: " . (file_exists($css) ? 'PASS' : 'FAIL') . PHP_EOL;

$js = WORKPRESS_PATH . 'assets/src/auth/auth-app.js';
echo "[7] Auth JS File Exists: " . (file_exists($js) ? 'PASS' : 'FAIL') . PHP_EOL;

echo "=== Verification Completed Successfully ===" . PHP_EOL;
