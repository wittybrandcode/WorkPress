<?php
/**
 * WorkPress REST Webhooks Controller
 *
 * Provides REST API endpoints for Webhook management, testing, and mock receiving.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Webhooks_Controller extends WP_REST_Controller {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'webhooks';
	}

	/**
	 * Register routes.
	 */
	public function register_routes() {
		// GET /workpress/v1/webhooks & POST /workpress/v1/webhooks
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_webhooks' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_webhook' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
			)
		);

		// DELETE /workpress/v1/webhooks/{id}
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[a-zA-Z0-9_-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_webhook' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
					'args'                => array(
						'id' => array(
							'required'          => true,
							'validate_callback' => function( $param ) {
								return is_string( $param );
							},
						),
					),
				),
			)
		);

		// POST /workpress/v1/webhooks/test (Live Ping Test)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/test',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'test_webhook' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
			)
		);

		// POST /workpress/v1/webhooks/mock-receiver (Local Mock Loopback)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/mock-receiver',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'mock_receiver' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Permission check: Only WordPress Administrators (manage_options) can manage webhooks.
	 *
	 * @param WP_REST_Request $request
	 * @return bool|WP_Error
	 */
	public function admin_permissions_check( $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'عذراً، إدارة خطافات الويب والتكامل الخارجي محصورة بمدير النظام فقط.', 'workpress' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}
		return true;
	}

	/**
	 * Get webhooks list and supported events metadata.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function get_webhooks( $request ) {
		$webhooks = WorkPress_Webhook_Service::get_webhooks();
		$events   = WorkPress_Webhook_Service::get_supported_events();
		$mock_url = rest_url( $this->namespace . '/' . $this->rest_base . '/mock-receiver' );

		return rest_ensure_response( array(
			'webhooks'         => $webhooks,
			'supported_events' => $events,
			'mock_receiver'    => $mock_url,
		) );
	}

	/**
	 * Create or update a webhook.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response|WP_Error
	 */
	public function save_webhook( $request ) {
		$params = $request->get_json_params();
		if ( empty( $params ) ) {
			$params = $request->get_params();
		}

		$result = WorkPress_Webhook_Service::save_webhook( $params );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( array(
			'success' => true,
			'webhook' => $result,
			'message' => __( 'تم حفظ إعدادات الخطاف بنجاح.', 'workpress' ),
		) );
	}

	/**
	 * Delete a webhook.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_webhook( $request ) {
		$id      = $request->get_param( 'id' );
		$deleted = WorkPress_Webhook_Service::delete_webhook( $id );

		if ( ! $deleted ) {
			return new WP_Error( 'not_found', __( 'الخطاف المطلوب غير موجود.', 'workpress' ), array( 'status' => 404 ) );
		}

		return rest_ensure_response( array(
			'success' => true,
			'message' => __( 'تم حذف الخطاف بنجاح.', 'workpress' ),
		) );
	}

	/**
	 * Test a webhook with a live ping.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function test_webhook( $request ) {
		$params = $request->get_json_params() ?: $request->get_params();
		$url    = $params['url'] ?? '';
		$secret = $params['secret'] ?? '';
		$preset = $params['preset'] ?? 'generic';

		$result = WorkPress_Webhook_Service::test_webhook( $url, $secret, $preset );

		return rest_ensure_response( $result );
	}

	/**
	 * Local Mock Receiver endpoint to inspect payloads during development without external connection.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function mock_receiver( $request ) {
		$body      = $request->get_json_params() ?: $request->get_body();
		$signature = $request->get_header( 'x_workpress_signature' );
		$event     = $request->get_header( 'x_workpress_event' );

		return rest_ensure_response( array(
			'status'       => 'acknowledged',
			'received_at'  => current_time( 'mysql' ),
			'event'        => $event,
			'signature'    => $signature,
			'body_summary' => is_array( $body ) ? $body : substr( (string) $body, 0, 300 ),
		) );
	}
}
