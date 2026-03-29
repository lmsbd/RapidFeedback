import request from '@/utils/request';

const MOCK_INDIVIDUAL = {
  projectId: 123,
  projectName: 'AI Ethics Analysis',
  description: [
    {
      countdown: 900000,
      assessment: [
        {
          criteriaId: 1,
          name: 'Voice, Pace and Confidence',
          weighting: 50,
          maxMark: 100,
          markIncrements: 0.5,
        },
        {
          criteriaId: 2,
          name: 'Presentation Structure',
          weighting: 50,
          maxMark: 100,
          markIncrements: 1,
        },
      ],
    },
  ],
  projectType: 'individual',
  students: [
    {
      id: 201,
      firstname: 'Alice',
      surname: 'Zhang',
      email: 'alice@example.com',
    },
    {
      id: 202,
      firstname: 'Bob',
      surname: 'Li',
      email: 'bob@example.com',
    },
  ],
  markers: [
    { id: 501, name: 'Dr. Smith', email: 'smith@example.com' },
    { id: 502, name: 'Dr. Jam', email: 'jam@example.com' },
  ],
};

const MOCK_GROUP = {
  projectId: 456,
  projectName: 'Distributed System Design',
  description: [
    {
      countdown: 1800000,
      assessment: [
        {
          criteriaId: 1,
          name: 'Voice, Pace and Confidence',
          weighting: 50,
          maxMark: 100,
          markIncrements: 0.5,
        },
        {
          criteriaId: 2,
          name: 'Presentation Structure',
          weighting: 50,
          maxMark: 100,
          markIncrements: 1,
        },
      ],
    },
  ],
  projectType: 'group',
  teams: [
    {
      id: 1,
      name: 'Team Alpha',
      students: [
        {
          id: 301,
          firstName: 'Liam',
          surname: 'Wang',
          email: 'liam.wang@example.com',
        },
        {
          id: 302,
          firstName: 'Emma',
          surname: 'Chen',
          email: 'emma.chen@example.com',
        },
      ],
    },
    {
      id: 2,
      name: 'Team Beta',
      students: [
        {
          id: 303,
          firstName: 'Noah',
          surname: 'Li',
          email: 'noah.li@example.com',
        },
        {
          id: 304,
          firstName: 'Olivia',
          surname: 'Zhao',
          email: 'olivia.zhao@example.com',
        },
      ],
    },
  ],
  markers: [
    { id: 601, name: 'Dr. Brown', email: 'brown@example.com' },
    { id: 602, name: 'Dr. Taylor', email: 'taylor@example.com' },
  ],
};

// export async function getProjectDetail(projectId) {
//   const pid = Number(projectId);
//   const mock = pid && pid % 2 === 0 ? MOCK_GROUP : MOCK_INDIVIDUAL;
//   return { ...mock, projectId: pid || mock.projectId };
// }

export async function getProjectDetail(projectId) {
  try {
    const numericProjectId = parseInt(projectId);
    const res = await request.get('/projects/getProjectDetail', {
      params: { projectId: numericProjectId },
    });
    return res.data;
  } catch (error) {
    console.error('getProjectDetail error:', error);
    return null;
  }
}

export async function getStudentAssessmentScores(projectId, studentId) {
  try {
    const numericProjectId = Number(projectId);
    const numericStudentId = Number(studentId);
    const res = await request.post('/projects/getStudentAssessmentScores', {
      projectId: numericProjectId,
      studentId: numericStudentId,
    });
    return res.data;
  } catch (error) {
    console.error('getStudentAssessmentScores error:', error);
    return null;
  }
}

export async function getGroupAssessmentScores(projectId, groupId) {
  try {
    const numericProjectId = Number(projectId);
    const numericGroupId = Number(groupId);
    const res = await request.post('/projects/getGroupAssessmentScores', {
      projectId: numericProjectId,
      groupId: numericGroupId,
    });
    return res.data;
  } catch (error) {
    console.error('getGroupAssessmentScores error:', error);
    return null;
  }
}

export async function getProjectDetailMock(projectId) {
  const pid = Number(projectId);
  const mock = pid && pid % 2 === 0 ? MOCK_GROUP : MOCK_INDIVIDUAL;
  const descriptionArr = Array.isArray(mock.description) ? mock.description : [];
  const first = descriptionArr[0] ? descriptionArr[0] : {};
  const assessment = Array.isArray(first.assessment) ? first.assessment : [];
  const normalizedAssessment = assessment.map((a, idx) => ({
    ...a,
    criteriaId: a?.criteriaId ?? idx + 1,
  }));
  return {
    ...mock,
    projectId: Number.isFinite(pid) && pid > 0 ? pid : mock.projectId,
    description: [
      {
        ...first,
        assessment: normalizedAssessment,
      },
    ],
  };
}
