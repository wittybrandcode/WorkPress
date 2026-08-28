import { html } from '../../utils/html.js';
import TaskModal from '../TaskModal.js';
import ProjectModal from '../ProjectModal.js';
import TaskAssignmentModal from '../TaskAssignmentModal.js';
import ContributionModal from '../ContributionModal.js';
import ContributionDetailModal from '../ContributionDetailModal.js';
import ProjectMembersModal from '../ProjectMembersModal.js';
import ConfirmModal from '../ConfirmModal.js';
import ReportModal from '../ReportModal.js';

/**
 * Shared Modals Container for Dashboard Operations
 */
export default function DashboardModals({
	isProjectModalOpen = false,
	setIsProjectModalOpen,
	selectedProject = null,
	setSelectedProject,
	isTaskModalOpen = false,
	setIsTaskModalOpen,
	selectedTask = null,
	setSelectedTask,
	isAssignmentModalOpen = false,
	setIsAssignmentModalOpen,
	assignmentTask = null,
	setAssignmentTask,
	isContributionModalOpen = false,
	setIsContributionModalOpen,
	targetTaskForContribution = null,
	setTargetTaskForContribution,
	isDetailModalOpen = false,
	setIsDetailModalOpen,
	selectedContribution = null,
	setSelectedContribution,
	isMembersModalOpen = false,
	setIsMembersModalOpen,
	membersProject = null,
	setMembersProject,
	confirmModalConfig = { isActive: false },
	setConfirmModalConfig,
	reportModalProject = null,
	setReportModalProject,
	fetchData
}) {
	return html`
		<div>
			<${ProjectModal} 
				isActive=${ isProjectModalOpen } 
				onClose=${ () => { setIsProjectModalOpen(false); setSelectedProject(null); } }
				onSave=${ fetchData }
				project=${ selectedProject }
			/>

			<${TaskModal} 
				isActive=${ isTaskModalOpen } 
				onClose=${ () => { setIsTaskModalOpen(false); setSelectedTask(null); } }
				onSave=${ fetchData }
				task=${ selectedTask }
			/>

			<${TaskAssignmentModal}
				isActive=${ isAssignmentModalOpen }
				onClose=${ () => { setIsAssignmentModalOpen(false); setAssignmentTask(null); fetchData(); } }
				task=${ assignmentTask }
			/>

			<${ContributionModal}
				isActive=${ isContributionModalOpen }
				onClose=${ () => { setIsContributionModalOpen(false); setTargetTaskForContribution(null); } }
				onSave=${ fetchData }
				defaultTaskId=${ targetTaskForContribution ? targetTaskForContribution.id : null }
			/>

			<${ContributionDetailModal}
				isActive=${ isDetailModalOpen }
				onClose=${ () => { setIsDetailModalOpen(false); setSelectedContribution(null); } }
				contribution=${ selectedContribution }
				onStatusChange=${ fetchData }
			/>

			<${ProjectMembersModal}
				isActive=${ isMembersModalOpen }
				onClose=${ () => { setIsMembersModalOpen(false); setMembersProject(null); fetchData(); } }
				project=${ membersProject }
			/>

			<${ConfirmModal}
				...${ confirmModalConfig }
				onClose=${ () => setConfirmModalConfig({ isActive: false }) }
			/>

			<${ReportModal}
				isActive=${ Boolean( reportModalProject ) }
				onClose=${ () => setReportModalProject( null ) }
				projectId=${ reportModalProject ? reportModalProject.id : null }
				projectName=${ reportModalProject ? reportModalProject.name : '' }
			/>
		</div>
	`;
}
