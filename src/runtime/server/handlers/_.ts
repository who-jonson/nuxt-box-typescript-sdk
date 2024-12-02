import { createError } from '#imports';
import { BoxSdkError } from 'box-typescript-sdk-gen/lib/box/errors.js';

export function createBoxSdkError(err: any) {
  if (err instanceof BoxSdkError) {
    throw createError(JSON.parse(err?.message || '{}'));
  }

  throw createError(err);
}
