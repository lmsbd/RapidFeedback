import { makeAutoObservable, toJS } from 'mobx';

class StudentStore {
  students = [];
  groupStudents = [];
  subjectStudents = [];
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
   * Only studentId and groupName from CSV are used for grouping.
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
      const groupName = student.groupName;
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
