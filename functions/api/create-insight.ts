import { json, readBody, requireAdmin, slugify, putBase64File, putTextFile, markdownPost } from '../_shared/github';

export async function onRequestPost({ request, env }: any) {
  const denied = requireAdmin(request, env); if (denied) return denied;
  try {
    const body = await readBody(request);
    if (!body.title || !body.summary || !body.body) return json({ ok: false, error: 'MISSING_REQUIRED_FIELDS', message: 'Title, summary, and body are required.' }, 400);
    const slug = slugify(body.slug || body.title);
    if (body.featuredImageFile?.base64 && body.featuredImageFile?.filename) {
      const ext = (body.featuredImageFile.filename.split('.').pop() || 'jpg').toLowerCase();
      const publicPath = `/assets/insights/${slug}/featured.${ext}`;
      await putBase64File(env, `public${publicPath}`, body.featuredImageFile.base64, `Add featured image for post: ${body.title}`);
      body.featuredImage = publicPath;
    }
    body.slug = slug;
    await putTextFile(env, `src/content/insights/${slug}.md`, markdownPost(body), `Add Inspiration post: ${body.title}`);
    return json({ ok: true, slug });
  } catch (error: any) { return json({ ok: false, error: 'CREATE_INSIGHT_FAILED', message: error.message }, 500); }
}
