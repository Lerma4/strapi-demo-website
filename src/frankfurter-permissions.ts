export const FRANKFURTER_APP_ID = 'frankfurter-dashboard';

export const FRANKFURTER_READ_UID = `${FRANKFURTER_APP_ID}.read`;
export const FRANKFURTER_READ_ACTION = `admin::${FRANKFURTER_READ_UID}`;

export const FRANKFURTER_READ_PERMISSIONS = [
  {
    action: FRANKFURTER_READ_ACTION,
    subject: null,
  },
];

export const FRANKFURTER_ADMIN_ACTIONS = [
  {
    section: 'settings',
    displayName: 'Read',
    uid: FRANKFURTER_READ_UID,
    category: 'custom dashboards',
    subCategory: 'frankfurter',
    pluginName: 'admin',
  },
];
