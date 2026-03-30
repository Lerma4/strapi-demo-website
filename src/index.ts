import type { Core } from '@strapi/strapi';

import { FRANKFURTER_ADMIN_ACTIONS } from './frankfurter-permissions';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await strapi
      .service('admin::permission')
      .actionProvider.registerMany(FRANKFURTER_ADMIN_ACTIONS);

    await strapi.service('admin::role').resetSuperAdminPermissions();
  },
};
