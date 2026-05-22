import { json, readBody, requireAdmin, putTextFile } from '../_shared/github';

export async function onRequestPost({ request, env }: any) {
  const denied = requireAdmin(request, env); if (denied) return denied;
  try {
    const body = await readBody(request);
    const config = {
      featuredEventSlug: body.featuredEventSlug || (body.type === 'event' ? body.slug : ''),
      featuredAlbumSlug: body.featuredAlbumSlug || (body.type === 'album' ? body.slug : ''),
      featuredVideoId: body.featuredVideoId || (body.type === 'video' ? body.slug : ''),
      homepageMode: body.homepageMode || (body.type === 'album' ? 'featured_album' : body.type === 'video' ? 'featured_video' : body.type === 'event' ? 'featured_event' : 'auto')
    };
    await putTextFile(env, 'src/data/homepage-feature.json', JSON.stringify(config, null, 2) + '\n', 'Update homepage feature');
    return json({ ok: true, config });
  } catch (error: any) { return json({ ok: false, error: 'SET_FEATURE_FAILED', message: error.message }, 500); }
}
