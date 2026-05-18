export const useLayoutStore = defineStore('layout', () => {
  const auth = useAuthStore();
  const logo = ref(null);
  const description = ref(null);
  const site_name = ref(null);
  const default_og_image = ref(null);
  const twitter_site = ref(null);
  const mobile_app_links = ref(null);
  const contact_info = ref({});
  const social_links = ref({});

  async function load() {
    try {
      const response = await useApiFetch('/general/layout');

      auth.user = response.user;
      logo.value = response.logo;
      description.value = response.description;
      site_name.value = response.site_name ?? null;
      default_og_image.value = response.default_og_image ?? null;
      twitter_site.value = response.twitter_site ?? null;
      mobile_app_links.value = response.mobile_app_links;
      contact_info.value = response.contact_info;
      social_links.value = response.social_links;
    } catch (error) {
      console.error('Failed to fetch layout:', error);
    }
  }

  return {
    // state
    logo,
    description,
    site_name,
    default_og_image,
    twitter_site,
    mobile_app_links,
    contact_info,
    social_links,

    // actions
    load,
  };
});
