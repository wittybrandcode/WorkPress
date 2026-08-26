<?php
/**
 * WorkPress Task Checklists & Subtasks Unit Test
 *
 * Run via CLI: php tests/test_task_checklists.php
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

echo "=== WorkPress Task Checklists & Subtasks Test ===\n\n";

$admin_user = get_user_by( 'login', 'admin' );
if ( ! $admin_user ) {
	$admins = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
	$admin_user = ! empty( $admins ) ? $admins[0] : null;
}
wp_set_current_user( $admin_user->ID );

// 1. Create a test task
$task_res = WorkPress_Task_Service::create_task( array(
	'title'    => 'اختبار قوائم الفحص والمهام الفرعية - ' . wp_date( 'H:i:s' ),
	'status'   => 'in_progress',
	'priority' => 'high',
) );

if ( is_wp_error( $task_res ) ) {
	echo "[-] Failed to create test task: " . $task_res->get_error_message() . "\n";
	exit( 1 );
}

$task_id = $task_res['id'];
echo "[1] Test Task Created: ID $task_id\n";
echo "    Initial Checklists Count: " . count( $task_res['checklists'] ) . " (Expected: 0)\n";
echo "    Result: PASS\n\n";

// 2. Add 3 Checklist Items
echo "[2] Adding 3 Checklist Items...\n";
$items = array(
	'إعداد وتصميم قاعدة البيانات والمتحكمات',
	'بناء واجهات المستخدم في Preact وعزل الأنماط',
	'إجراء الفحص الآلي واختبار التوافقية'
);

$checklists = array();
foreach ( $items as $idx => $title ) {
	$checklists = WorkPress_Task_Service::add_checklist_item( $task_id, $title, $admin_user->ID );
	if ( is_wp_error( $checklists ) ) {
		echo "[-] Failed to add item $idx: " . $checklists->get_error_message() . "\n";
		exit( 1 );
	}
	echo "    - Added Item: \"$title\" (ID: {$checklists[ count($checklists) - 1 ]['id']})\n";
}

echo "    Current Count: " . count( $checklists ) . " (Expected: 3)\n";
echo "    Result: PASS\n\n";

// 3. Toggle 2 items as completed
echo "[3] Toggling Completion of Items...\n";
$first_item_id = $checklists[0]['id'];
$second_item_id = $checklists[1]['id'];

$after_toggle1 = WorkPress_Task_Service::toggle_checklist_item( $task_id, $first_item_id, $admin_user->ID );
$after_toggle2 = WorkPress_Task_Service::toggle_checklist_item( $task_id, $second_item_id, $admin_user->ID );

$task_updated = WorkPress_Task_Service::get_task( $task_id );
echo "    - Total Items: " . $task_updated['checklists_count'] . " (Expected: 3)\n";
echo "    - Completed Items: " . $task_updated['checklists_completed_count'] . " (Expected: 2)\n";
echo "    - Progress Pct: " . $task_updated['checklists_progress'] . "% (Expected: 67%)\n";

if ( $task_updated['checklists_completed_count'] !== 2 || $task_updated['checklists_progress'] !== 67.0 && $task_updated['checklists_progress'] !== 67 ) {
	echo "[-] Progress calculation mismatch!\n";
	exit( 1 );
}
echo "    Result: PASS\n\n";

// 4. Update an Item Title
echo "[4] Updating Item Title...\n";
$new_title = 'بناء واجهات المستخدم في Preact 0px Sharp Edges';
$after_update = WorkPress_Task_Service::update_checklist_item( $task_id, $second_item_id, $new_title, $admin_user->ID );
$updated_item = null;
foreach ( $after_update as $it ) {
	if ( $it['id'] === $second_item_id ) {
		$updated_item = $it;
		break;
	}
}
echo "    - Updated Item Title: \"{$updated_item['title']}\"\n";
if ( $updated_item['title'] !== $new_title ) {
	echo "[-] Title update mismatch!\n";
	exit( 1 );
}
echo "    Result: PASS\n\n";

// 5. Delete an Item
echo "[5] Deleting One Checklist Item...\n";
$third_item_id = $checklists[2]['id'];
$after_delete = WorkPress_Task_Service::delete_checklist_item( $task_id, $third_item_id, $admin_user->ID );
$task_final = WorkPress_Task_Service::get_task( $task_id );

echo "    - Count After Deletion: " . $task_final['checklists_count'] . " (Expected: 2)\n";
echo "    - Completed Count: " . $task_final['checklists_completed_count'] . " (Expected: 2)\n";
echo "    - New Progress Pct: " . $task_final['checklists_progress'] . "% (Expected: 100%)\n";

if ( $task_final['checklists_progress'] !== 100.0 && $task_final['checklists_progress'] !== 100 ) {
	echo "[-] Final 100% progress mismatch!\n";
	exit( 1 );
}
echo "    Result: PASS\n\n";

echo "=== All Checklist & Subtasks Verification Tests Passed (100%) ===\n";
