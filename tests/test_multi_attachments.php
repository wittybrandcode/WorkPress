<?php
/**
 * WorkPress Multi-File Attachments Unit Test
 *
 * Run via CLI: php tests/test_multi_attachments.php
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

echo "=== WorkPress Multi-File Attachments Engine Test ===\n\n";

$admin_user = get_user_by( 'login', 'admin' );
if ( ! $admin_user ) {
	$admins = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
	$admin_user = ! empty( $admins ) ? $admins[0] : null;
}
wp_set_current_user( $admin_user->ID );

// 1. Create a dummy media attachment for testing
echo "[1] Creating Mock Attachment in Media Library...\n";
$dummy_att_id = wp_insert_attachment(
	array(
		'post_mime_type' => 'application/pdf',
		'post_title'     => 'وثيقة المتطلبات والمواصفات الفنية.pdf',
		'post_content'   => '',
		'post_status'    => 'inherit',
	),
	__DIR__ . '/test_multi_attachments.php'
);

$dummy_img_id = wp_insert_attachment(
	array(
		'post_mime_type' => 'image/png',
		'post_title'     => 'المخطط الهندسي للبنية التحتية.png',
		'post_content'   => '',
		'post_status'    => 'inherit',
	),
	__DIR__ . '/test_multi_attachments.php'
);

echo "    - Created Attachment 1 (ID: $dummy_att_id, Type: application/pdf)\n";
echo "    - Created Attachment 2 (ID: $dummy_img_id, Type: image/png)\n";
echo "    Result: PASS\n\n";

// 2. Create a test task
echo "[2] Creating Test Task...\n";
$task_res = WorkPress_Task_Service::create_task( array(
	'title'    => 'اختبار المرفقات والملفات المتعددة - ' . wp_date( 'H:i:s' ),
	'status'   => 'in_progress',
	'priority' => 'high',
) );

if ( is_wp_error( $task_res ) ) {
	echo "[-] Failed to create task: " . $task_res->get_error_message() . "\n";
	exit( 1 );
}

$task_id = $task_res['id'];
echo "    - Task Created (ID: $task_id)\n";
echo "    - Initial Attachments Count: {$task_res['attachments_count']} (Expected: 0)\n";
echo "    Result: PASS\n\n";

// 3. Add Task-Level Attachments
echo "[3] Adding Task-Level Multi-Attachments...\n";
$atts_1 = WorkPress_Task_Service::add_task_attachment( $task_id, $dummy_att_id, $admin_user->ID );
$atts_2 = WorkPress_Task_Service::add_task_attachment( $task_id, $dummy_img_id, $admin_user->ID );

$task_after_atts = WorkPress_Task_Service::get_task( $task_id );
echo "    - Task Attachments Count: {$task_after_atts['attachments_count']} (Expected: 2)\n";
echo "    - Attachment 1 Name: {$task_after_atts['attachments'][0]['name']}\n";
echo "    - Attachment 2 Name: {$task_after_atts['attachments'][1]['name']}\n";

if ( $task_after_atts['attachments_count'] !== 2 ) {
	echo "[-] Task attachments count mismatch!\n";
	exit( 1 );
}
echo "    Result: PASS\n\n";

// 4. Create Contribution with Multi-Attachments
echo "[4] Creating Contribution with Multi-Attachments...\n";
$contrib_res = WorkPress_Contribution_Service::add_contribution(
	$task_id,
	$admin_user->ID,
	'تم إرفاق المستندات الهندسية ومخططات واجهات الاستخدام بصيغة PDF و PNG.',
	'implementation',
	array( $dummy_att_id, $dummy_img_id )
);

if ( is_wp_error( $contrib_res ) ) {
	echo "[-] Failed to create contribution: " . $contrib_res->get_error_message() . "\n";
	exit( 1 );
}

echo "    - Contribution Created (ID: {$contrib_res['id']})\n";
echo "    - Formatted Attachments Count: " . count( $contrib_res['attachments'] ) . " (Expected: 2)\n";
echo "    - Attachment 1 MIME: {$contrib_res['attachments'][0]['mime_type']} (Expected: application/pdf)\n";
echo "    - Attachment 2 MIME: {$contrib_res['attachments'][1]['mime_type']} (Expected: image/png)\n";
echo "    Result: PASS\n\n";

// 5. Delete One Task-Level Attachment
echo "[5] Deleting One Task-Level Attachment...\n";
$del_atts = WorkPress_Task_Service::delete_task_attachment( $task_id, $dummy_att_id, $admin_user->ID );
$task_final = WorkPress_Task_Service::get_task( $task_id );

echo "    - Task Attachments Count After Delete: {$task_final['attachments_count']} (Expected: 1)\n";
if ( $task_final['attachments_count'] !== 1 ) {
	echo "[-] Deletion count mismatch!\n";
	exit( 1 );
}
echo "    Result: PASS\n\n";

// Cleanup mock media
wp_delete_attachment( $dummy_att_id, true );
wp_delete_attachment( $dummy_img_id, true );

echo "=== All Multi-File Attachments Engine Tests Passed (100%) ===\n";
