import { json, readBody, requireAdmin, slugify, putTextFile, putBase64File } from '../_shared/github';

export async function onRequestPost({ request, env }: any) {
  const denied = requireAdmin(request, env); if (denied) return denied;
  try {
    const body = await readBody(request);
    if (!body.title) return json({ ok: false, error: 'MISSING_TITLE', message: 'Album title is required.' }, 400);
    const slug = slugify(body.slug || body.title);
    const inputMedia = Array.isArray(body.media) ? body.media : [];
    const media = [];
    for (let index = 0; index < inputMedia.length; index++) {
      const item = inputMedia[index];
      if (!item?.base64 || !item?.filename) continue;
      const ext = (item.filename.split('.').pop() || (item.type === 'video' ? 'mp4' : 'jpg')).toLowerCase();
      const safeName = `${String(index + 1).padStart(2, '0')}-${slugify(item.filename.replace(/\.[^.]+$/, ''))}.${ext}`;
      const publicPath = `/assets/gallery/${slug}/${safeName}`;
      await putBase64File(env, `public${publicPath}`, item.base64, `Add gallery media: ${body.title}`);
      media.push({ id: `${slug}-${index + 1}`, type: item.type || (ext === 'mp4' ? 'video' : 'image'), src: publicPath, poster: item.poster || '', alt: item.alt || body.title, caption: item.caption || '', published: true, sortOrder: index + 1 });
    }
    const album = { title: body.title, slug, published: true, eventSlug: body.eventSlug || '', series: body.series || '', description: body.description || '', coverImage: body.coverImage || media[0]?.src || '/assets/logos/sheila-logo.png', featuredOnHome: Boolean(body.featuredOnHome), media };
    await putTextFile(env, `src/content/gallery/${slug}.json`, JSON.stringify(album, null, 2) + '\n', `Add gallery album: ${body.title}`);
    return json({ ok: true, slug, album });
  } catch (error: any) { return json({ ok: false, error: 'CREATE_GALLERY_FAILED', message: error.message }, 500); }
}
