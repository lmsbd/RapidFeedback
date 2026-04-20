import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    {
      path: '/',
      component: '@/layouts/MainLayout',
      routes: [
        { path: '/', redirect: '/subject' },
        {
          path: '/subject',
          component: 'subject',
        },
        { path: '/commentLibrary', component: '@/pages/commentLibrary/index' },
        {
          path: '/commentLibrary/commentList/:categoryId',
          component: '@/pages/commentLibrary/commentList',
        },
        {
          path: '/commentLibrary/editCategory',
          component: '@/pages/commentLibrary/editCategory',
        },
        {
          path: '/criteriaEditor',
          component: 'criteriaEditor',
        },
        {
          path: '/subjectDetails/:id',
          component: 'subjectDetails',
        },
        {
          path: '/createSubject',
          component: 'createSubject',
        },
        {
          path: '/manageSubject/:id',
          component: 'manageSubject',
        },
        {
          path: '/selectStudent',
          component: 'selectStudent',
        },
        {
          path: '/selectMarker',
          component: 'selectMarker',
        },
        {
          path: '/createProject/:subjectId',
          component: 'createProject',
        },
        {
          path: '/:subjectId/editProject/:projectId',
          component: 'editProject',
        },
        {
          path: '/setting',
          component: 'setting',
        },
        {
          path: '/markedList/:projectId',
          component: 'markedList',
        },
        {
          path: '/:subjectId/viewProject/:projectId',
          component: 'viewProject',
        },
        {
          path: '/groupMark',
          component: 'groupMark',
        },
        {
          path: '/mark',
          component: 'mark',
        },
        {
          path: '/finalMark/:projectId',
          component: 'finalMark',
        },
        {
          path: '/:subjectId/formGroups',
          component: 'formGroups',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
});
