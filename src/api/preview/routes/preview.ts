export default {
  routes: [
    {
      method: 'GET',
      path: '/preview/article',
      handler: 'preview.article',
      config: {
        auth: false,
      },
    },
  ],
};
