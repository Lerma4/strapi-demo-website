export default {
  async list(ctx) {
    const locales = await strapi.service('api::site-locale.site-locale').list();

    ctx.body = {
      data: locales,
    };
  },
};
