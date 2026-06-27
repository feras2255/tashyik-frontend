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

      applyLayoutFields(
        {
          logo,
          description,
          site_name,
          default_og_image,
          twitter_site,
          mobile_app_links,
          contact_info,
          social_links,
        },
        auth,
        response,
      );
    } catch (error) {
      console.error('Failed to fetch layout:', error);
    }
  }

  return {
    logo,
    description,
    site_name,
    default_og_image,
    twitter_site,
    mobile_app_links,
    contact_info,
    social_links,
    load,
  };
});
