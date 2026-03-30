import type { StrapiApp } from '@strapi/strapi/admin';
import { Plane, TrendUp } from '@strapi/icons';

import {
  FRANKFURTER_APP_ID,
  FRANKFURTER_READ_PERMISSIONS,
} from '../frankfurter-permissions';
import { OPEN_SKY_APP_ID, OPEN_SKY_READ_PERMISSIONS } from '../open-sky-permissions';

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

    app.addMenuLink({
      to: 'open-sky',
      icon: Plane,
      intlLabel: {
        id: `${OPEN_SKY_APP_ID}.plugin.name`,
        defaultMessage: 'OpenSky',
      },
      Component: () => import('./pages/OpenSkyPage'),
      permissions: OPEN_SKY_READ_PERMISSIONS,
      position: 21,
    });

    app.registerPlugin({
      id: FRANKFURTER_APP_ID,
      name: 'Frankfurter',
    });

    app.registerPlugin({
      id: OPEN_SKY_APP_ID,
      name: 'OpenSky',
    });
  },
  bootstrap() {},
};
