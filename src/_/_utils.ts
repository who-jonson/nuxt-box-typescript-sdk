import { useNuxt } from '@nuxt/kit';
import type { NuxtServerTemplate } from '@nuxt/schema';

export function addServerTemplate(template: NuxtServerTemplate) {
  const nuxt = useNuxt();

  nuxt.options.nitro.virtual ||= {};
  nuxt.options.nitro.virtual[template.filename] = template.getContents;

  return template;
}
