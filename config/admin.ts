import { createHmac } from 'crypto';
import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin & { preview?: unknown } => {
  const previewUrl = env('PREVIEW_URL', 'http://localhost:4173');
  const previewSecret = env('PREVIEW_SECRET', env('ADMIN_JWT_SECRET'));
  const previewOrigin = new URL(previewUrl).origin;

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    preview: {
      enabled: true,
      config: {
        allowedOrigins: [previewOrigin],
        handler: async (uid: string, params: { documentId?: string; locale?: string | null; status?: string }) => {
          if (uid !== 'api::article.article' || !params.documentId) {
            return undefined;
          }

          const expires = String(Date.now() + 5 * 60 * 1000);
          const signaturePayload = [
            uid,
            params.documentId,
            params.locale || '',
            params.status || 'draft',
            expires,
          ].join(':');
          const signature = createHmac('sha256', previewSecret).update(signaturePayload).digest('hex');
          const url = new URL(previewUrl);

          url.searchParams.set('preview', 'article');
          url.searchParams.set('uid', uid);
          url.searchParams.set('documentId', params.documentId);
          url.searchParams.set('status', params.status || 'draft');
          url.searchParams.set('expires', expires);
          url.searchParams.set('signature', signature);

          if (params.locale) {
            url.searchParams.set('locale', params.locale);
          }

          return url.toString();
        },
      },
    },
  };
};

export default config;
