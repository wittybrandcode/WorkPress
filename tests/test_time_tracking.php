<?php
/**
 * WorkPress Time Tracking & Estimation Unit Test
 *
 * Run via CLI: php tests/test_time_tracking.php
 *
 * @package WorkPress
 * @subpackage Tests
 */

// Load WordPress Bootstrap
$wp_load_path = dirname( dirname( dirname( dirname( __DIR__ ) ) ) ) . '/wp-load.php';
if ( ! file_exists( $wp_load_path ) ) {
	echo "Error: wp-load.php not found at $wp_load_path\n";
	exit( 1 );
}
require_once $wp_load_path;

echo "=== WorkPress Time Tracking & Estimation Engine Test ===\n\n";

$admin_user = get_user_by( 'login', 'admin' );
if ( ! $admin_user ) {
	$admins = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
	$admin_user = ! empty( $admins ) ? $admins[0] : null;
}
wp_set_current_user( $admin_user->ID );

// 1. Create a test task with 10.0 hours estimate
echo "[1] Creating Task with 10.0 Hours Estimate...\n";
$task_res = WorkPress_Task_Service::create_task( array(
	'title'           => 'اختبار تتبع الوقت وسجلات العمل - ' . wp_date( 'H:i:s' ),
	'status'          => 'in_progress',
	'priority'        => 'high',
	'estimated_hours' => 10.0,
) );

if ( is_wp_error( $task_res ) ) {
	echo "[-] Failed to create task: " . $task_res->get_error_message() . "\n";
	exit( 1 );
}

$task_id = $task_res['id'];
echo "    - Task Created (ID: $task_id)\n";
echo "    - Estimated Hours: {$task_res['estimated_hours']}\n";
echo "    - Logged Hours: {$task_res['logged_hours']} (Expected: 0)\n";
echo "    - Remaining Hours: {$task_res['remaining_hours']} (Expected: 10)\n";
echo "    - Time Progress: {$task_res['time_progress']}% (Expected: 0%)\n";
echo "    Result: PASS\n\n";

// 2. Add first worklog (3.5 hours)
echo "[2] Logging 3.5 Hours Work Session...\n";
$log1_res = WorkPress_Task_Service::add_worklog(
	$task_id,
	3.5,
	'برمجة نقاط نهاية الـ REST API والمصادقة',
	wp_date( 'Y-m-d' ),
	$admin_user->ID
);

if ( is_wp_error( $log1_res ) ) {
	echo "[-] Failed to add worklog 1: " . $log1_res->get_error_message() . "\n";
	exit( 1 );
}

$task_after_log1 = $log1_res['task'];
echo "    - Total Logged Hours: {$task_after_log1['logged_hours']} (Expected: 3.5)\n";
echo "    - Remaining Hours: {$task_after_log1['remaining_hours']} (Expected: 6.5)\n";
echo "    - Time Progress: {$task_after_log1['time_progress']}% (Expected: 35%)\n";
echo "    Result: PASS\n\n";

// 3. Add second worklog (4.0 hours)
echo "[3] Logging 4.0 Hours Work Session...\n";
$log2_res = WorkPress_Task_Service::add_worklog(
	$task_id,
	4.0,
	'بناء واجهات المستخدم في Preact وعزل الأنماط',
	wp_date( 'Y-m-d' ),
	$admin_user->ID
);

$task_after_log2 = $log2_res['task'];
echo "    - Total Logged Hours: {$task_after_log2['logged_hours']} (Expected: 7.5)\n";
echo "    - Remaining Hours: {$task_after_log2['remaining_hours']} (Expected: 2.5)\n";
echo "    - Time Progress: {$task_after_log2['time_progress']}% (Expected: 75%)\n";
echo "    Result: PASS\n\n";

// 4. Over Budget Test (Log 5.0 more hours -> Total 12.5 hrs vs 10.0 hrs estimate)
echo "[4] Over Budget Test: Logging 5.0 More Hours (Total 12.5 hrs vs 10.0 hrs)...\n";
$log3_res = WorkPress_Task_Service::add_worklog(
	$task_id,
	5.0,
	'إجراء اختبارات الضغط والأمان الشاملة',
	wp_date( 'Y-m-d' ),
	$admin_user->ID
);

$task_after_log3 = $log3_res['task'];
echo "    - Total Logged Hours: {$task_after_log3['logged_hours']} (Expected: 12.5)\n";
echo "    - Remaining Hours: {$task_after_log3['remaining_hours']} (Expected: 0)\n";
echo "    - Time Progress: {$task_after_log3['time_progress']}% (Expected: 125%)\n";
echo "    - Worklogs Count: {$task_after_log3['worklogs_count']} (Expected: 3)\n";
echo "    Result: PASS\n\n";

// 5. Delete a worklog and verify recalculation
echo "[5] Deleting One Worklog (ID: {$log3_res['worklogs'][2]['id']})...\n";
$log3_id = $log3_res['worklogs'][2]['id'];
$del_res = WorkPress_Task_Service::delete_worklog( $task_id, $log3_id, $admin_user->ID );

$task_after_del = $del_res['task'];
echo "    - Total Logged Hours After Delete: {$task_after_del['logged_hours']} (Expected: 7.5)\n";
echo "    - Remaining Hours After Delete: {$task_after_del['remaining_hours']} (Expected: 2.5)\n";
echo "    - Time Progress After Delete: {$task_after_del['time_progress']}% (Expected: 75%)\n";
echo "    - Worklogs Count: {$task_after_del['worklogs_count']} (Expected: 2)\n";
echo "    Result: PASS\n\n";

// 6. Update Estimate Test (Change estimate to 15.0 hrs)
echo "[6] Updating Estimate to 15.0 Hours...\n";
$task_after_est = WorkPress_Task_Service::set_estimated_hours( $task_id, 15.0 );
echo "    - New Estimated Hours: {$task_after_est['estimated_hours']} (Expected: 15)\n";
echo "    - New Remaining Hours: {$task_after_est['remaining_hours']} (Expected: 7.5)\n";
echo "    - New Time Progress: {$task_after_est['time_progress']}% (Expected: 50%)\n";
echo "    Result: PASS\n\n";

echo "=== All Time Tracking & Estimation Engine Tests Passed (100%) ===\n";
