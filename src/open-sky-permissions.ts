export const OPEN_SKY_APP_ID = 'open-sky-dashboard';

export const OPEN_SKY_READ_UID = `${OPEN_SKY_APP_ID}.read`;
export const OPEN_SKY_READ_ACTION = `admin::${OPEN_SKY_READ_UID}`;

export const OPEN_SKY_READ_PERMISSIONS = [
  {
    action: OPEN_SKY_READ_ACTION,
    subject: null,
  },
];

export const OPEN_SKY_ADMIN_ACTIONS = [
  {
    section: 'settings',
    displayName: 'Read',
    uid: OPEN_SKY_READ_UID,
    category: 'custom dashboards',
    subCategory: 'open sky',
    pluginName: 'admin',
  },
];
