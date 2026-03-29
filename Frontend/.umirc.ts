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
          path: '/markedList/:projectId',
          component: 'markedList',
        },
        {
          path: '/viewProject/:projectId',
          component: 'viewProject',
        },
        {
          path: '/mark',
          component: 'mark',
        },
        {
          path: '/:subjectId/formGroups',
          component: 'formGroups',
        },
      ],
    },
  ],
  proxy: {
    '/api': {
      target: 'http://localhost:8076/rfo/api',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  npmClient: 'pnpm',
});
