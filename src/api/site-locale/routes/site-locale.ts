export default {
  routes: [
    {
      method: 'GET',
      path: '/site-locales',
      handler: 'site-locale.list',
      config: {
        auth: false,
      },
    },
  ],
};
