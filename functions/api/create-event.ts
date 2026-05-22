import { json, readBody, requireAdmin, slugify, putTextFile, putBase64File } from '../_shared/github';

export async function onRequestPost({ request, env }: any) {
  const denied = requireAdmin(request, env); if (denied) return denied;
  try {
    const body = await readBody(request);
    if (!body.title || !body.summary) return json({ ok: false, error: 'MISSING_REQUIRED_FIELDS', message: 'Event title and summary are required.' }, 400);
    if (body.registrationType === 'external' && !body.registrationUrl) return json({ ok: false, error: 'REGISTRATION_URL_REQUIRED', message: 'Add a registration link or choose no registration yet.' }, 400);
    const slug = slugify(body.slug || body.title);
    let featuredImage = body.featuredImage || '/assets/logos/sheila-logo.png';
    const media = Array.isArray(body.media) ? body.media : [];
    for (let index = 0; index < media.length; index++) {
      const item = media[index];
      if (!item?.base64 || !item?.filename) continue;
      const safeName = `${String(index + 1).padStart(2, '0')}-${slugify(item.filename.replace(/\.[^.]+$/, ''))}.${(item.filename.split('.').pop() || 'jpg').toLowerCase()}`;
      const publicPath = `/assets/events/${slug}/${safeName}`;
      await putBase64File(env, `public${publicPath}`, item.base64, `Add media for event: ${body.title}`);
      if (index === 0) featuredImage = publicPath;
    }
    const event = {
      title: body.title,
      slug,
      published: true,
      status: body.status || 'upcoming',
      featuredOnHome: Boolean(body.featuredOnHome),
      date: body.date || '',
      displayDate: body.displayDate || body.date || '',
      startTime: body.startTime || '',
      endTime: body.endTime || '',
      location: body.location || 'Sarasota, FL',
      venueName: body.venueName || '',
      address: body.address || '',
      category: body.category || 'Community Gathering',
      series: body.series || '',
      audience: body.audience || 'Women-centered community event. Friends and community members are welcome unless otherwise noted.',
      summary: body.summary,
      description: body.description || body.summary,
      attire: body.attire || '',
      price: body.price || '',
      isFree: Boolean(body.isFree),
      isInvitationOnly: Boolean(body.isInvitationOnly),
      ticketInfo: body.ticketInfo || '',
      contactEmail: body.contactEmail || 'asheilabruceaffair@gmail.com',
      rsvpEmail: body.rsvpEmail || '',
      rsvpPhone: body.rsvpPhone || '',
      featuredImage,
      galleryAlbumSlug: body.galleryAlbumSlug || '',
      registrationType: body.registrationType || 'none',
      registrationUrl: body.registrationUrl || '',
      registrationLabel: body.registrationLabel || 'Register Now',
      registrationNote: body.registrationNote || '',
      registrationClosesAt: body.registrationClosesAt || '',
      partnerName: body.partnerName || '',
      sponsorName: body.sponsorName || '',
      speakers: body.speakers || [],
      panelists: body.panelists || [],
      schedule: body.schedule || [],
      seo: body.seo || { title: '', description: '', image: featuredImage }
    };
    await putTextFile(env, `src/content/events/${slug}.json`, JSON.stringify(event, null, 2) + '\n', `Add event: ${body.title}`);
    return json({ ok: true, slug, event });
  } catch (error: any) { return json({ ok: false, error: 'CREATE_EVENT_FAILED', message: error.message }, 500); }
}
