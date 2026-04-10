import { makeAutoObservable, toJS } from 'mobx';
/**
 * studentStore.groups
 * create groups payload 
 * @typedef {Object} ProjectGroupPayload
 * @property {string} groupName
 * @property {(number|string)[]} studentIds
 * @example
 * const payload = {
 *   groupName: 'Group 1',
 *   studentIds: [1, 2, 3],
 * };
 */

/**
 * studentStore.groupStudents
 * group card / preview group (studentStore.groupStudents, same shape as page state `groups`)
 * @typedef {Object} FormGroupWithStudents
 * @property {string} groupName
 * @property {(number|string)[]} studentIds
 * @property {FormGroupStudentRow[]} students
 * @example
 * const group = {
 *   groupName: 'Group 1',
 *   studentIds: [1, 2, 3],
 *   students: [
 *     { studentId: 1, studentName: 'Alice' },
 *     { studentId: 2, studentName: 'Bob' },
 *     { studentId: 3, studentName: 'Charlie' },
 *   ],
 */

/**
 * subjectStudents
 * @typedef {Object} SubjectStudent
 * @property {string} studentId
 * @property {string} studentName
 * @property {string} email
 * @property {string} firstName
 * @property {string} surname
 * @example
 * const subjectStudent = {
 *   id: 1,
 *   studentId: 150001,
 *   email: 'alice@example.com',
 *   firstName: 'Alice',
 *   surname: 'Smith',
 *   totalScore: 0,
 * };
 */
class StudentStore {
  students = [];
  groupStudents = [];
  // api: getStudentListBySubject
  subjectStudents = [];
  // api: createProject
  groups = [];

  constructor() {
    makeAutoObservable(this);
  }
  addStudent(student) {
    const exists = this.students.some(
      (stu) => stu.studentId === student.studentId
    );
    if (!exists) {
      this.students.push(student);
    }
  }
  addAllStudents(students) {
    const newStudents = students.filter(
      (student) =>
        !this.subjectStudents.some(
          (existing) => existing.studentId === student.studentId
        )
    );
    this.subjectStudents.push(...newStudents);

  }
  addGroupStudent(student) {
    const exists = this.groupStudents.some(
      (stu) => stu.studentId === student.studentId
    );
    if (exists) {
      // return false;
    }
    this.groupStudents.push(student);
  }

  deleteStudent(studentId) {
    this.students = this.students.filter((stu) => stu.studentId !== studentId);
  }

  clearStudents() {
    this.students = [];
  }
  clearGroupStudents() {
    this.groupStudents = [];
  }
  clearSubjectStudents() {
    this.subjectStudents = [];
  }
  clearGroups() {
    this.groups = [];
  }
  setGroups(groups) {
    this.groups = groups;
  }
  setGroupStudents(groupStudents) {
    this.groupStudents = groupStudents;
  }
  get studentList() {
    return this.students.slice();
  }
  get groupStudentsList() {
    return toJS(this.groupStudents);
  }
  get subjectStudentsList() {
    return toJS(this.subjectStudents);
  }

  /**
   * Create group list from CSV data.
   * Uses studentId and group column: `groupName` or `group` (same meaning).
   * Student names are always taken from subjectStudentsList (authoritative source)
   * to avoid displaying incorrect names from CSV.
   */
  createGroupList(students) {
    let groups = [];
    const groupMap = new Map();
    const subjectStudentMap = new Map(
      this.subjectStudents.map((s) => [String(s.studentId), s])
    );

    students.forEach((student) => {
      const groupName = student.groupName ?? student.group;
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, []);
      }
      groupMap.get(groupName).push(student);
    });

    groupMap.forEach((groupStudents, groupName) => {
      const studentIds = groupStudents.map((student) => student.studentId);
      const studentsInfo = groupStudents.map((student) => {
        const subjectStudent =
          subjectStudentMap.get(String(student.studentId)) ||
          subjectStudentMap.get(student.studentId);
        const studentName = subjectStudent
          ? `${subjectStudent.firstName || ''} ${subjectStudent.surname || ''}`.trim() ||
            subjectStudent.studentName
          : student.studentName ||
            `${student.firstName || ''} ${student.surname || ''}`.trim();
        return {
          studentId: student.studentId,
          studentName: studentName || String(student.studentId),
        };
      });

      const group = {
        groupName: groupName,
        studentIds: studentIds,
        students: studentsInfo,
      };
      groups.push(group);
     // this.groupStudents.push(group);
    });
    return groups;
  }
  getUnGroupedStudents(groups) {
    const assigned = new Set();
    (groups || []).forEach((g) => {
      (g.studentIds || []).forEach((id) => assigned.add(String(id)));
    });
    return this.subjectStudents.filter((s) => !assigned.has(String(s.studentId)));
  }
  randomFormGroup(size) {
    const shuffledStudents = [...this.subjectStudents].sort(() => Math.random() - 0.5);
    const groups = [];
    let groupIndex = 1;

    for (let i = 0; i < shuffledStudents.length; i += size) {
      const groupStudents = shuffledStudents.slice(i, i + size);
      const studentIds = groupStudents.map((student) => student.studentId);
      const studentsInfo = groupStudents.map((student) => ({
        studentId: student.studentId,
        studentName: student.studentName || student.name || `${student.firstName || ''} ${student.surname || ''}`.trim(),
      }));

      const group = {
        groupName: `Group ${groupIndex}`,
        studentIds: studentIds,
        students: studentsInfo,
      };

      groups.push(group);
      groupIndex++;
    }

    return groups;
  }
}

export default new StudentStore();
