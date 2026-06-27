/**
 * Normalize layout payload from /general/layout or /general/home (layout slice).
 */
export function extractLayoutPayload(response) {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (response.layout && typeof response.layout === 'object') {
    return response.layout;
  }

  if (response.logo || response.social_links || response.contact_info) {
    return response;
  }

  const nested = response.payload ?? response.data;

  if (nested?.layout && typeof nested.layout === 'object') {
    return nested.layout;
  }

  if (nested && (nested.logo || nested.social_links || nested.contact_info)) {
    return nested;
  }

  return null;
}

function assignLayoutField(target, key, value) {
  const current = target[key];

  if (isRef(current)) {
    current.value = value;

    return;
  }

  target[key] = value;
}

export function applyLayoutFields(layoutStore, authStore, payload, options = {}) {
  const layout = extractLayoutPayload(payload) ?? payload;

  if (!layout) {
    return;
  }

  authStore.user = extractApiUser(layout) ?? layout.user ?? null;
  assignLayoutField(layoutStore, 'logo', layout.logo ?? null);
  assignLayoutField(layoutStore, 'description', layout.description ?? null);
  assignLayoutField(layoutStore, 'site_name', layout.site_name ?? null);
  assignLayoutField(layoutStore, 'default_og_image', layout.default_og_image ?? null);
  assignLayoutField(layoutStore, 'twitter_site', layout.twitter_site ?? null);
  assignLayoutField(layoutStore, 'mobile_app_links', layout.mobile_app_links ?? null);
  assignLayoutField(layoutStore, 'contact_info', layout.contact_info ?? {});

  if (!options.skipSocialLinks) {
    assignLayoutField(layoutStore, 'social_links', layout.social_links ?? {});
  }
}
