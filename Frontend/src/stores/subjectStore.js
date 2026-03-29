import { makeAutoObservable, toJS } from 'mobx';
/**
 * @typedef {object} subjects
 * @property {string} id
 * @property {string} name
 * @property {string} description
 *
 * */

/**
 * @typedef {object} projectItem
 * @property {string} id
 * @property {string} name
 * @property {string} conutdown
 * @property {number} subjectId
 *
 */

/***
 * 
 * @typedef {object} projects
 * @property {string} subjectId
 * @property {projectItem[]} projects
 *
 * 
 */
class SubjectStore {
  subjects = [];

  constructor() {
    makeAutoObservable(this);
  }

  setSubjects(subjects) {
    if (Array.isArray(subjects)) {
      this.subjects = subjects.map((s) => ({ ...s, id: String(s.id) }));
      this.saveToSessionStorage();
    } else {
      this.subjects = [];
      this.saveToSessionStorage();
    }
  }

  saveToSessionStorage() {
    try {
      sessionStorage.setItem('subjects', JSON.stringify(this.subjects));
      console.log('Saved subjects to session storage');
    } catch (error) {
      console.error('Error saving subjects to session storage:', error);
    }
  }

  getSubjectNameFromSession(subjectId) {
    try {
      const cachedSubjects = sessionStorage.getItem('subjects');
      if (cachedSubjects) {
        const subjects = JSON.parse(cachedSubjects);
        const subject = subjects.find(s => String(s.id) === String(subjectId));
        return subject.name || null;
      }
    } catch (error) {
      console.error('Error loading subject from session storage:', error);
    }
    return null;
  }
  get subjectsList() {
    return toJS(this.subjects);
  }
  
  getSubjectName(id) {
    const subject = this.subjects.find(
      (subject) => String(subject.id) === String(id)
    );
    if (subject) {
      return toJS(subject).name;
    }
    return null;
  }
}

const subjectStore = new SubjectStore();
export default subjectStore;
