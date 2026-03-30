import { errors } from '@strapi/utils';

import { OPEN_SKY_READ_ACTION } from '../open-sky-permissions';

const getBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(/\s+/);

  if (parts[0]?.toLowerCase() !== 'bearer' || parts.length !== 2) {
    return null;
  }

  return parts[1];
};

export default async (policyContext, _config, { strapi }) => {
  const token = getBearerToken(policyContext.request.header.authorization);

  if (!token) {
    throw new errors.UnauthorizedError('Missing or invalid admin token');
  }

  const sessionManager = strapi.sessionManager;

  if (!sessionManager) {
    throw new errors.UnauthorizedError('Admin session manager unavailable');
  }

  const validation = sessionManager('admin').validateAccessToken(token);

  if (!validation.isValid || !validation.payload?.userId || !validation.payload.sessionId) {
    throw new errors.UnauthorizedError('Invalid admin token');
  }

  const isSessionActive = await sessionManager('admin').isSessionActive(validation.payload.sessionId);

  if (!isSessionActive) {
    throw new errors.UnauthorizedError('Admin session expired');
  }

  const rawUserId = validation.payload.userId;
  const numericUserId = Number(rawUserId);
  const userId =
    Number.isFinite(numericUserId) && String(numericUserId) === rawUserId
      ? numericUserId
      : rawUserId;

  const user = await strapi.db.query('admin::user').findOne({
    where: {
      id: userId,
    },
    populate: ['roles'],
  });

  if (!user || user.isActive !== true) {
    throw new errors.UnauthorizedError('Admin user not available');
  }

  const userAbility = await strapi.service('admin::permission').engine.generateUserAbility(user);

  if (userAbility.cannot(OPEN_SKY_READ_ACTION)) {
    throw new errors.ForbiddenError('Missing OpenSky permission');
  }

  policyContext.state.user = user;
  policyContext.state.userAbility = userAbility;
  policyContext.state.auth = {
    credentials: user,
    ability: userAbility,
  };

  return true;
};
