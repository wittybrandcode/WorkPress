import { html, useState, useEffect, __, isRtl } from '../utils/html.js';
import { tasksApi, projectsApi } from '../api/client.js';
import GanttChart from '../components/gantt/GanttChart.js';
import Loader from '../components/ui/Loader.js';
import TaskQuickPreviewModal from '../components/tasks/TaskQuickPreviewModal.js';
import sound from '../utils/sound.js';

/**
 * GanttPage Component
 *
 * Full-page interactive Gantt & Schedule view for projects and tasks.
 * 0px sharp geometry, zero emojis, React 18 style compliance.
 */
export default function GanttPage( { refreshKey } ) {
	const [ tasks, setTasks ] = useState( null );
	const [ projects, setProjects ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ quickPreviewTask, setQuickPreviewTask ] = useState( null );
	const rtl = isRtl();

	const fetchData = async () => {
		setLoading( true );
		try {
			const [ tasksRes, projectsRes ] = await Promise.all( [
				tasksApi.list( { number: 100 } ),
				projectsApi.list(),
			] );

			const tasksList = Array.isArray( tasksRes ) ? tasksRes : ( tasksRes.items || [] );
			const projectsList = Array.isArray( projectsRes ) ? projectsRes : ( projectsRes.items || [] );

			setTasks( tasksList );
			setProjects( projectsList );
		} catch ( err ) {
			console.error( 'Error loading Gantt data:', err );
		} finally {
			setLoading( false );
		}
	};

	useEffect( () => {
		fetchData();
	}, [ refreshKey ] );

	const handleTaskClick = ( taskId ) => {
		const found = ( tasks || [] ).find( t => t.id === taskId );
		if ( found ) {
			setQuickPreviewTask( found );
			sound.play( 'click' );
		} else {
			window.location.hash = `#/tasks/${ taskId }`;
		}
	};

	return html`
		<div className="workpress-gantt-page p-4">
			<!-- Header Banner -->
			<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
				<div>
					<h1 className="title is-4 mb-1" style=${{ color: '#0f172a', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<i className="dashicons dashicons-calendar-alt" style=${{ color: '#3b82f6', fontSize: '26px' }}></i>
						<span>${ __( 'Gantt Chart & Institutional Timeline', 'workpress' ) }</span>
					</h1>
					<p className="subtitle is-7 has-text-grey mb-0">
						${ __( 'Track project timelines, dependencies, deadlines, and milestone completion percentages.', 'workpress' ) }
					</p>
				</div>

				<div style=${{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
					<a 
						href="#/kanban" 
						className="button is-small is-light" 
						style=${{ borderRadius: 0, fontWeight: '700', border: '1px solid #cbd5e1' }}
					>
						<i className="dashicons dashicons-columns" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '0.25rem' }}></i>
						<span>${ __( 'Kanban', 'workpress' ) }</span>
					</a>
				</div>
			</div>

			<!-- Main Gantt Chart View -->
			${ loading ? html`
				<div style=${{ padding: '4rem 0', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
					<${Loader} text=${ __( 'Loading...', 'workpress' ) } />
				</div>
			` : html`
				<${GanttChart} 
					tasks=${ tasks || [] } 
					projects=${ projects || [] } 
					onTaskClick=${ handleTaskClick } 
					onTaskUpdated=${ () => fetchData() }
				/>
			` }

			<!-- Task Quick Preview Modal -->
			${ quickPreviewTask ? html`
				<${TaskQuickPreviewModal}
					task=${ quickPreviewTask }
					onClose=${ () => setQuickPreviewTask( null ) }
					onTaskUpdated=${ () => fetchData() }
				/>
			` : null }
		</div>
	`;
}
