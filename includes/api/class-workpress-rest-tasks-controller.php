<?php
/**
 * REST API Controller for Tasks.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Tasks_Controller extends WP_REST_Controller {

	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'tasks';
	}

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_item' ),
				'permission_callback' => array( $this, 'create_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item' ),
				'permission_callback' => array( $this, 'delete_item_permissions_check' ),
			),
		) );
		
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/state', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item_state' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/assignment', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item_assignment' ),
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item_assignment' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/close', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'close_item' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/reopen', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'reopen_item' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/checklists', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item_checklists' ),
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_item_checklist' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/checklists/(?P<item_id>[a-zA-Z0-9_\-]+)', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item_checklist' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item_checklist' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/estimate', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'set_item_estimate' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/worklogs', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item_worklogs' ),
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'add_item_worklog' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/worklogs/(?P<log_id>[a-zA-Z0-9_\-]+)', array(
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item_worklog' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/attachments', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item_attachments' ),
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'add_item_attachment' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/attachments/(?P<att_id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item_attachment' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
		) );
	}

	public function get_items_permissions_check( $request ) {
		return is_user_logged_in();
	}

	public function get_items( $request ) {
		$args    = array();
		$user_id = get_current_user_id();
		
		if ( $request->get_param( 'project_id' ) ) {
			$project_id = (int) $request->get_param( 'project_id' );
			if ( ! WorkPress_Permission_Service::can_view_project( $user_id, $project_id ) ) {
				return new WP_Error( 'rest_forbidden', __( 'You are not authorized.', 'workpress' ), array( 'status' => 403 ) );
			}
			$args['project_id'] = $project_id;
		} else {
			if ( ! current_user_can( 'manage_options' ) ) {
				$visible_ids = WorkPress_Knowledge_Service::get_visible_project_ids( $user_id );
				if ( empty( $visible_ids ) ) {
					// Return empty if no projects visible
					return rest_ensure_response( array() );
				}
				$args['project_ids'] = $visible_ids;
			}
		}
		
		if ( $request->get_param( 'status' ) ) {
			$args['status'] = sanitize_text_field( $request->get_param( 'status' ) );
		}
		if ( $request->get_param( 'number' ) ) {
			$args['number'] = (int) $request->get_param( 'number' );
		}
		if ( $request->get_param( 'page' ) ) {
			$args['paged'] = (int) $request->get_param( 'page' );
		}
		
		$result = WorkPress_Task_Service::get_tasks( $args );
		
		$response = rest_ensure_response( $result['items'] );
		$response->header( 'X-WP-Total', $result['total'] );
		$response->header( 'X-WP-TotalPages', $result['total_pages'] );
		
		return $response;
	}

	public function create_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) return false;
		$project_id = (int) $request->get_param( 'project_id' );
		if ( $project_id > 0 ) {
			return WorkPress_Permission_Service::can_create_task( get_current_user_id(), $project_id );
		}
		return current_user_can( 'manage_options' ) || current_user_can( 'edit_workpress_projects' );
	}

	public function create_item( $request ) {
		$title      = sanitize_text_field( $request->get_param( 'title' ) );
		$content    = wp_kses_post( $request->get_param( 'content' ) );
		$project_id = (int) $request->get_param( 'project_id' );
		$priority   = sanitize_key( $request->get_param( 'priority' ) );
		$due_at     = sanitize_text_field( $request->get_param( 'due_at' ) );
		$cover_id   = (int) $request->get_param( 'cover_id' );
		$assignees  = $request->get_param( 'assignees' ) ? array_map( 'intval', (array) $request->get_param( 'assignees' ) ) : array();

		if ( empty( $title ) ) {
			return new WP_Error( 'rest_missing_title', __( 'Task title is required', 'workpress' ), array( 'status' => 400 ) );
		}

		$task = WorkPress_Task_Service::create_task( array(
			'title'      => $title,
			'content'    => $content,
			'project_id' => $project_id,
			'priority'   => $priority ? $priority : 'medium',
			'due_at'     => $due_at,
			'cover_id'   => $cover_id,
		) );

		if ( is_wp_error( $task ) ) {
			return $task;
		}

		if ( ! empty( $assignees ) && class_exists( 'WorkPress_Assignment_Service' ) ) {
			WorkPress_Assignment_Service::assign( $task['id'], $assignees, get_current_user_id() );
			$task = WorkPress_Task_Service::get_task( $task['id'] );
		}

		return rest_ensure_response( $task );
	}

	public function get_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		
		$task_id = (int) $request['id'];
		$task    = get_post( $task_id );
		
		if ( ! $task || WorkPress_Install::CPT_WORK_ITEM !== $task->post_type ) {
			return new WP_Error( 'rest_task_not_found', __( 'Task not found', 'workpress' ), array( 'status' => 404 ) );
		}
		
		// المسؤولون يمكنهم رؤية أي مهمة
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}
		
		// التحقق من عضوية المشروع
		$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			$project_id = $terms[0]->term_id;
			return WorkPress_Permission_Service::can_view_project( get_current_user_id(), $project_id );
		}
		
		// المهام بدون مشروع: المؤلف أو المكلف فقط
		$user_id = get_current_user_id();
		if ( (int) $task->post_author === $user_id ) {
			return true;
		}
		
		$assignees = get_post_meta( $task_id, '_workpress_assignee_ids', true ) ?: array();
		return in_array( $user_id, (array) $assignees, true );
	}

	public function get_item( $request ) {
		$task_id = (int) $request['id'];
		$task    = WorkPress_Task_Service::get_task( $task_id );
		
		if ( is_wp_error( $task ) ) {
			return new WP_Error( 'rest_task_not_found', __( 'Task not found', 'workpress' ), array( 'status' => 404 ) );
		}

		return rest_ensure_response( $task );
	}

	public function update_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) return false;
		return WorkPress_Permission_Service::can_edit_task( get_current_user_id(), (int) $request['id'] );
	}

	public function update_item( $request ) {
		$task_id    = (int) $request['id'];
		$existing   = WorkPress_Task_Service::get_task( $task_id );

		if ( is_wp_error( $existing ) ) {
			return $existing;
		}

		$title      = $request->has_param( 'title' ) ? sanitize_text_field( $request->get_param( 'title' ) ) : $existing['title'];
		$content    = $request->has_param( 'content' ) ? wp_kses_post( $request->get_param( 'content' ) ) : $existing['content'];
		$project_id = $request->has_param( 'project_id' ) ? (int) $request->get_param( 'project_id' ) : $existing['project_id'];
		$priority   = $request->has_param( 'priority' ) ? sanitize_key( $request->get_param( 'priority' ) ) : $existing['priority'];
		$cover_id   = $request->has_param( 'cover_id' ) ? (int) $request->get_param( 'cover_id' ) : $existing['cover_id'];
		$is_pending = $request->has_param( 'is_pending_trash' ) ? rest_sanitize_boolean( $request->get_param( 'is_pending_trash' ) ) : $existing['is_pending_trash'];

		if ( empty( $title ) ) {
			return new WP_Error( 'rest_missing_title', __( 'Task title is required', 'workpress' ), array( 'status' => 400 ) );
		}

		if ( $request->has_param( 'is_pending_trash' ) && ! $is_pending ) {
			WorkPress_Task_Service::restore_from_trash( $task_id, get_current_user_id() );
		} elseif ( $request->has_param( 'is_pending_trash' ) && $is_pending ) {
			$reason = $request->has_param( 'trash_reason' ) ? sanitize_textarea_field( $request->get_param( 'trash_reason' ) ) : '';
			WorkPress_Task_Service::trash_request( $task_id, $reason, get_current_user_id() );
		}

		$task = WorkPress_Task_Service::update_task( $task_id, array(
			'title'      => $title,
			'content'    => $content,
			'project_id' => $project_id,
			'priority'   => $priority,
			'cover_id'   => $cover_id,
		) );

		if ( is_wp_error( $task ) ) {
			return $task;
		}

		return rest_ensure_response( $task );
	}
	
	public function update_item_state( $request ) {
		$task_id = (int) $request['id'];
		$status  = sanitize_key( $request->get_param( 'status' ) );
		
		if ( empty( $status ) ) {
			// Fallback for old clients
			$status = sanitize_key( $request->get_param( 'state' ) );
		}
		
		if ( empty( $status ) ) {
			return new WP_Error( 'rest_missing_status', __( 'Status is required', 'workpress' ), array( 'status' => 400 ) );
		}
		
		$task = WorkPress_Task_Service::update_task_status( $task_id, $status, get_current_user_id() );
		
		if ( is_wp_error( $task ) ) {
			return $task;
		}
		
		return rest_ensure_response( $task );
	}

	public function get_item_assignment( $request ) {
		$task_id = (int) $request['id'];
		
		if ( ! class_exists( 'WorkPress_Assignment_Service' ) ) {
			return rest_ensure_response( array() );
		}
		
		$assignees = WorkPress_Assignment_Service::get_assignees( $task_id );
		return rest_ensure_response( $assignees );
	}

	public function update_item_assignment( $request ) {
		$task_id   = (int) $request['id'];
		$assignees = $request->get_param( 'assignees' ) ? array_map( 'intval', (array) $request->get_param( 'assignees' ) ) : array();
		
		if ( ! class_exists( 'WorkPress_Assignment_Service' ) ) {
			return new WP_Error( 'rest_service_missing', __( 'Assignment service unavailable', 'workpress' ), array( 'status' => 500 ) );
		}

		WorkPress_Assignment_Service::set_assignees( $task_id, $assignees, get_current_user_id() );

		$task = WorkPress_Task_Service::get_task( $task_id );
		return rest_ensure_response( $task );
	}

	public function close_item( $request ) {
		$task_id = (int) $request['id'];
		$task    = WorkPress_Task_Service::close_task( $task_id, get_current_user_id() );
		
		if ( is_wp_error( $task ) ) {
			return $task;
		}
		
		return rest_ensure_response( $task );
	}

	public function reopen_item( $request ) {
		$task_id = (int) $request['id'];
		$task    = WorkPress_Task_Service::reopen_task( $task_id, get_current_user_id() );
		
		if ( is_wp_error( $task ) ) {
			return $task;
		}
		
		return rest_ensure_response( $task );
	}

	public function delete_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) return false;
		return WorkPress_Permission_Service::can_delete_task( get_current_user_id(), (int) $request['id'] );
	}

	public function delete_item( $request ) {
		$task_id = (int) $request['id'];
		$deleted = WorkPress_Task_Service::delete_task( $task_id );
		
		if ( is_wp_error( $deleted ) ) {
			return $deleted;
		}

		return rest_ensure_response( array( 'deleted' => true ) );
	}

	public function get_item_checklists( $request ) {
		$task_id = (int) $request['id'];
		$checklists = WorkPress_Task_Service::get_task_checklists( $task_id );
		return rest_ensure_response( $checklists );
	}

	public function create_item_checklist( $request ) {
		$task_id = (int) $request['id'];
		$title   = $request->get_param( 'title' );
		
		$result = WorkPress_Task_Service::add_checklist_item( $task_id, $title, get_current_user_id() );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$task = WorkPress_Task_Service::get_task( $task_id );
		return rest_ensure_response( array(
			'checklists' => $result,
			'task'       => $task,
		) );
	}

	public function update_item_checklist( $request ) {
		$task_id = (int) $request['id'];
		$item_id = sanitize_key( $request['item_id'] );
		$action  = $request->get_param( 'action' ) ?: 'toggle';

		if ( 'toggle' === $action ) {
			$result = WorkPress_Task_Service::toggle_checklist_item( $task_id, $item_id, get_current_user_id() );
		} else {
			$title  = $request->get_param( 'title' );
			$result = WorkPress_Task_Service::update_checklist_item( $task_id, $item_id, $title, get_current_user_id() );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$task = WorkPress_Task_Service::get_task( $task_id );
		return rest_ensure_response( array(
			'checklists' => $result,
			'task'       => $task,
		) );
	}

	public function delete_item_checklist( $request ) {
		$task_id = (int) $request['id'];
		$item_id = sanitize_key( $request['item_id'] );

		$result = WorkPress_Task_Service::delete_checklist_item( $task_id, $item_id, get_current_user_id() );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$task = WorkPress_Task_Service::get_task( $task_id );
		return rest_ensure_response( array(
			'checklists' => $result,
			'task'       => $task,
		) );
	}

	public function set_item_estimate( $request ) {
		$task_id = (int) $request['id'];
		$hours   = (float) $request->get_param( 'estimated_hours' );

		$task = WorkPress_Task_Service::set_estimated_hours( $task_id, $hours );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		return rest_ensure_response( $task );
	}

	public function get_item_worklogs( $request ) {
		$task_id = (int) $request['id'];
		$logs = WorkPress_Task_Service::get_task_worklogs( $task_id );
		return rest_ensure_response( $logs );
	}

	public function add_item_worklog( $request ) {
		$task_id = (int) $request['id'];
		$hours   = (float) $request->get_param( 'hours' );
		$note    = $request->get_param( 'note' ) ?: '';
		$date    = $request->get_param( 'date' ) ?: '';

		$result = WorkPress_Task_Service::add_worklog( $task_id, $hours, $note, $date, get_current_user_id() );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	public function delete_item_worklog( $request ) {
		$task_id = (int) $request['id'];
		$log_id  = sanitize_key( $request['log_id'] );

		$result = WorkPress_Task_Service::delete_worklog( $task_id, $log_id, get_current_user_id() );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	public function get_item_attachments( $request ) {
		$task_id     = (int) $request['id'];
		$attachments = WorkPress_Task_Service::get_task_attachments( $task_id );
		return rest_ensure_response( $attachments );
	}

	public function add_item_attachment( $request ) {
		$task_id = (int) $request['id'];
		$att_id  = (int) $request->get_param( 'attachment_id' );

		$result = WorkPress_Task_Service::add_task_attachment( $task_id, $att_id, get_current_user_id() );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$task = WorkPress_Task_Service::get_task( $task_id );
		return rest_ensure_response( array(
			'attachments' => $result,
			'task'        => $task,
		) );
	}

	public function delete_item_attachment( $request ) {
		$task_id = (int) $request['id'];
		$att_id  = (int) $request['att_id'];

		$result = WorkPress_Task_Service::delete_task_attachment( $task_id, $att_id, get_current_user_id() );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$task = WorkPress_Task_Service::get_task( $task_id );
		return rest_ensure_response( array(
			'attachments' => $result,
			'task'        => $task,
		) );
	}
}
