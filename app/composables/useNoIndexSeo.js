export function useNoIndexSeo() {
  useSeoMeta({
    robots: 'noindex, follow',
    googlebot: 'noindex, follow',
  });
}
