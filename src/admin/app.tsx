import type { StrapiApp } from '@strapi/strapi/admin';
import { TrendUp } from '@strapi/icons';

import {
  FRANKFURTER_APP_ID,
  FRANKFURTER_READ_PERMISSIONS,
} from '../frankfurter-permissions';

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    app.addMenuLink({
      to: 'frankfurter',
      icon: TrendUp,
      intlLabel: {
        id: `${FRANKFURTER_APP_ID}.plugin.name`,
        defaultMessage: 'Frankfurter',
      },
      Component: () => import('./pages/FrankfurterPage'),
      permissions: FRANKFURTER_READ_PERMISSIONS,
      position: 20,
    });

    app.registerPlugin({
      id: FRANKFURTER_APP_ID,
      name: 'Frankfurter',
    });
  },
  bootstrap() {},
};
