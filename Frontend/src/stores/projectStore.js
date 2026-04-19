import { makeAutoObservable, toJS } from 'mobx';

/**
 * @typedef {object} Project
 * @property {string} id
 * @property {string} name
 * @property {number} subjectId
 * @property {number} studentCount
 * @property {number} scoredStudents
 */

class ProjectStore {
  projects = [];
  currentProject = null;
  createProjectFormData = null; // In-memory only, cleared on refresh
  createProjectAssignments = {
    individual: {},
    group: {},
  };
  editProjectDetailCache = {}; // { projectId: detail } - avoid refetch when returning from sub-pages

  constructor() {
    makeAutoObservable(this);
  }

  setEditProjectDetail(projectId, detail) {
    if (projectId != null && detail) {
      this.editProjectDetailCache[String(projectId)] = detail;
    }
  }

  getEditProjectDetail(projectId) {
    return projectId != null ? this.editProjectDetailCache[String(projectId)] : null;
  }

  clearEditProjectDetail(projectId) {
    if (projectId != null) {
      delete this.editProjectDetailCache[String(projectId)];
    }
  }

  setCreateProjectFormData(data) {
    this.createProjectFormData = data;
  }

  clearCreateProjectFormData() {
    this.createProjectFormData = null;
  }

  setCreateProjectAssignments(type, assignments) {
    if (type !== 'individual' && type !== 'group') return;
    this.createProjectAssignments[type] = assignments || {};
  }

  clearCreateProjectAssignments() {
    this.createProjectAssignments = {
      individual: {},
      group: {},
    };
  }

  setProjects(subjectId, projects) {
    if (Array.isArray(projects)) {
      this.projects = projects.map((p) => ({
        ...p,
        id: String(p.id),
        subjectId: String(subjectId),
      }));
    }
  }

  setCurrentProject(project) {
    this.currentProject = project;
  }


  getProjectById(projectId) {
    return this.projects.find((p) => String(p.id) === String(projectId));
  }

  get projectsList() {
    return toJS(this.projects);
  }
}

const projectStore = new ProjectStore();
export default projectStore;
