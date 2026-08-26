<?php
/**
 * WorkPress Workflow Service.
 *
 * Defines allowed states and transitions for tasks.
 * Core defines possibility only; meaning belongs to Office Packs (Principle 16).
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Workflow_Service {

	// Core states — domain neutral.
	const STATE_NEW         = 'new';
	const STATE_ASSIGNED    = 'assigned';
	const STATE_OPEN        = 'open';
	const STATE_IN_PROGRESS = 'in_progress';
	const STATE_IN_REVIEW   = 'in_review';
	const STATE_APPROVED    = 'approved';
	const STATE_COMPLETED   = 'completed';
	const STATE_CLOSED      = 'closed';

	/**
	 * Default allowed transitions map.
	 *
	 * @var array
	 */
	private static $default_transitions = array(
		'new'         => array( 'assigned', 'in_progress', 'open', 'completed', 'closed' ),
		'assigned'    => array( 'new', 'in_progress', 'open', 'completed', 'closed' ),
		'open'        => array( 'new', 'assigned', 'in_progress', 'in_review', 'approved', 'completed', 'closed' ),
		'in_progress' => array( 'new', 'assigned', 'open', 'in_review', 'approved', 'completed', 'closed' ),
		'in_review'   => array( 'new', 'assigned', 'open', 'in_progress', 'approved', 'completed', 'closed' ),
		'approved'    => array( 'new', 'assigned', 'open', 'in_progress', 'in_review', 'completed', 'closed' ),
		'completed'   => array( 'new', 'assigned', 'open', 'in_progress', 'in_review', 'approved', 'closed' ),
		'closed'      => array( 'new', 'assigned', 'open', 'in_progress', 'in_review', 'approved', 'completed' ),
	);

	/**
	 * Get the transitions map (filterable by Office Packs).
	 *
	 * @return array
	 */
	public static function get_transitions() {
		/**
		 * Filter the allowed workflow transitions.
		 * Office Packs can add custom states and transitions here.
		 *
		 * @param array $transitions Map of state => array of allowed target states.
		 */
		return apply_filters( 'workpress_workflow_transitions', self::$default_transitions );
	}

	/**
	 * Get all registered states.
	 *
	 * @return array List of state keys.
	 */
	public static function get_states() {
		return array_keys( self::get_transitions() );
	}

	/**
	 * Get allowed transitions from a given state.
	 *
	 * @param string $current_state Current state key.
	 * @return array List of allowed target states.
	 */
	public static function get_allowed_transitions( $current_state ) {
		$transitions = self::get_transitions();
		return isset( $transitions[ $current_state ] ) ? $transitions[ $current_state ] : array();
	}

	/**
	 * Check if a transition is allowed.
	 *
	 * @param string $from Current state.
	 * @param string $to   Target state.
	 * @return bool
	 */
	public static function can_transition( $from, $to ) {
		// If same state, it is always allowed (idempotent)
		if ( $from === $to ) {
			return true;
		}
		$allowed = self::get_allowed_transitions( $from );
		return in_array( $to, $allowed, true );
	}

	/**
	 * Get human-readable labels for states.
	 *
	 * @return array Map of state => label.
	 */
	public static function get_state_labels() {
		$labels = array(
			self::STATE_NEW         => __( 'جديدة', 'workpress' ),
			self::STATE_ASSIGNED    => __( 'مسندة', 'workpress' ),
			self::STATE_OPEN        => __( 'مفتوحة', 'workpress' ),
			self::STATE_IN_PROGRESS => __( 'قيد التنفيذ', 'workpress' ),
			self::STATE_IN_REVIEW   => __( 'في المراجعة', 'workpress' ),
			self::STATE_APPROVED    => __( 'معتمدة', 'workpress' ),
			self::STATE_COMPLETED   => __( 'مكتملة', 'workpress' ),
			self::STATE_CLOSED      => __( 'مغلقة', 'workpress' ),
		);

		/**
		 * Filter state labels. Office Packs can add labels for custom states.
		 *
		 * @param array $labels Map of state => label.
		 */
		return apply_filters( 'workpress_workflow_state_labels', $labels );
	}

	/**
	 * Get label for a specific state.
	 *
	 * @param string $state State key.
	 * @return string Human-readable label.
	 */
	public static function get_state_label( $state ) {
		$labels = self::get_state_labels();
		return isset( $labels[ $state ] ) ? $labels[ $state ] : $state;
	}
}
