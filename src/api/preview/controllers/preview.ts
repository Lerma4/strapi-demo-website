import { createHmac, timingSafeEqual } from 'crypto';

const ARTICLE_UID = 'api::article.article';

const signPayload = (secret: string, payload: string) =>
  createHmac('sha256', secret).update(payload).digest('hex');

const compareSignatures = (received: string, expected: string) => {
  const receivedBuffer = Buffer.from(received, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
};

export default {
  async article(ctx) {
    const { documentId, locale, status, signature, expires, uid } = ctx.request.query;

    if (
      typeof documentId !== 'string' ||
      typeof signature !== 'string' ||
      typeof expires !== 'string' ||
      typeof uid !== 'string'
    ) {
      return ctx.badRequest('Missing preview parameters');
    }

    if (uid !== ARTICLE_UID) {
      return ctx.badRequest('Unsupported preview content type');
    }

    const expiresAt = Number(expires);
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
      return ctx.unauthorized('Preview link expired');
    }

    const previewStatus = status === 'published' ? 'published' : 'draft';

    const signingSecret =
      process.env.PREVIEW_SECRET ||
      process.env.ADMIN_JWT_SECRET;

    const payload = [uid, documentId, typeof locale === 'string' ? locale : '', previewStatus, expires].join(':');
    const expectedSignature = signPayload(signingSecret, payload);

    if (!compareSignatures(signature, expectedSignature)) {
      return ctx.unauthorized('Invalid preview signature');
    }

    const article = await strapi.documents(ARTICLE_UID).findOne({
      documentId,
      status: previewStatus,
      ...(typeof locale === 'string' ? { locale } : {}),
      populate: {
        cover: true,
        author: {
          populate: {
            avatar: true,
          },
        },
        category: true,
        blocks: {
          populate: '*',
        },
      },
    });

    if (!article) {
      return ctx.notFound('Preview article not found');
    }

    ctx.body = {
      data: article,
      meta: {
        preview: true,
      },
    };
  },
};
