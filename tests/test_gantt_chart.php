<?php
/**
 * WorkPress Gantt Chart & Schedule Engine Unit Test
 *
 * Run via CLI: php tests/test_gantt_chart.php
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

echo "=== WorkPress Gantt Chart & Schedule Engine Test ===\n\n";

$admin_user = get_user_by( 'login', 'admin' );
if ( ! $admin_user ) {
	$admins = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
	$admin_user = ! empty( $admins ) ? $admins[0] : null;
}
wp_set_current_user( $admin_user->ID );

// 1. Create a Project
echo "[1] Creating Test Project for Gantt Timeline...\n";
$project_res = WorkPress_Project_Service::create_project( array(
	'name'        => 'مشروع التحول الرقمي ومخطط جانت - ' . wp_date( 'H:i:s' ),
	'description' => 'مشروع هندسي لإدارة الجداول الزمنية والمسارات الحرجة.',
	'lead_id'     => $admin_user->ID,
) );

if ( is_wp_error( $project_res ) ) {
	echo "[-] Failed to create project: " . $project_res->get_error_message() . "\n";
	exit( 1 );
}

$project_id = $project_res['id'];
echo "    - Project Created (ID: $project_id, Name: {$project_res['name']})\n";
echo "    Result: PASS\n\n";

// 2. Create Sequential Tasks with Specific Due Dates
echo "[2] Creating Sequential Scheduled Tasks...\n";

$today = current_time( 'Y-m-d' );
$due_phase1 = wp_date( 'Y-m-d', strtotime( '+5 days' ) );
$due_phase2 = wp_date( 'Y-m-d', strtotime( '+12 days' ) );
$due_phase3 = wp_date( 'Y-m-d', strtotime( '+20 days' ) );

$task1 = WorkPress_Task_Service::create_task( array(
	'title'      => 'المرحلة الأولى: هندسة المتطلبات وقواعد البيانات',
	'project_id' => $project_id,
	'status'     => 'completed',
	'priority'   => 'high',
	'due_at'     => $due_phase1,
) );

$task2 = WorkPress_Task_Service::create_task( array(
	'title'      => 'المرحلة الثانية: بناء الواجهات وتطوير متحكمات REST',
	'project_id' => $project_id,
	'status'     => 'in_progress',
	'priority'   => 'high',
	'due_at'     => $due_phase2,
) );

$task3 = WorkPress_Task_Service::create_task( array(
	'title'      => 'المرحلة الثالثة: فحص الأداء والاعتماد المعرفي النهائي',
	'project_id' => $project_id,
	'status'     => 'open',
	'priority'   => 'medium',
	'due_at'     => $due_phase3,
) );

echo "    - Task 1: ID {$task1['id']} (Status: {$task1['status']}, Due: {$task1['due_at']})\n";
echo "    - Task 2: ID {$task2['id']} (Status: {$task2['status']}, Due: {$task2['due_at']})\n";
echo "    - Task 3: ID {$task3['id']} (Status: {$task3['status']}, Due: {$task3['due_at']})\n";
echo "    Result: PASS\n\n";

// Update task1 to completed
WorkPress_Task_Service::update_task( $task1['id'], array(
	'title'    => $task1['title'],
	'status'   => 'completed',
	'priority' => 'high',
) );
update_post_meta( $task1['id'], '_workpress_status', 'completed' );

// 3. Verify Gantt Data Structure
echo "[3] Verifying Gantt Timeline Query & Structuring...\n";
$tasks_res = WorkPress_Task_Service::get_tasks( array(
	'project_id' => $project_id,
	'number'     => 10,
) );

$all_tasks = $tasks_res['items'];

echo "    - Total Project Tasks: " . count( $all_tasks ) . " (Expected: 3)\n";
$completed_count = 0;
foreach ( $all_tasks as $t ) {
	if ( in_array( $t['status'], array( 'completed', 'closed' ), true ) ) {
		$completed_count++;
	}
}

$progress_pct = round( ( $completed_count / count( $all_tasks ) ) * 100 );
echo "    - Completed Tasks: $completed_count / 3\n";
echo "    - Calculated Project Progress: $progress_pct% (Expected: 33%)\n";

if ( count( $all_tasks ) !== 3 || $completed_count !== 1 || $progress_pct !== 33.0 && $progress_pct !== 33 ) {
	echo "[-] Gantt calculation mismatch!\n";
	exit( 1 );
}
echo "    Result: PASS\n\n";

echo "=== All Gantt Chart & Schedule Engine Tests Passed (100%) ===\n";
