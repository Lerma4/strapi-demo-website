export default {
  routes: [
    {
      method: 'GET',
      path: '/open-sky/snapshot',
      handler: 'open-sky.snapshot',
      config: {
        auth: false,
        policies: [
          {
            name: 'global::is-admin-open-sky',
          },
        ],
      },
    },
  ],
};
