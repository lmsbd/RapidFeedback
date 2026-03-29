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

  constructor() {
    makeAutoObservable(this);
  }

  setCreateProjectFormData(data) {
    this.createProjectFormData = data;
  }

  clearCreateProjectFormData() {
    this.createProjectFormData = null;
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
