export default {
  async snapshot(ctx) {
    const region = typeof ctx.query.region === 'string' ? ctx.query.region : undefined;

    try {
      const snapshot = await strapi.service('api::open-sky.open-sky').getSnapshot(region);

      ctx.body = {
        data: snapshot,
      };
    } catch (error) {
      strapi.log.error('OpenSky snapshot failed', error);
      ctx.throw(
        502,
        error instanceof Error
          ? error.message
          : 'Non sono riuscito a recuperare il traffico aereo.'
      );
    }
  },
};
