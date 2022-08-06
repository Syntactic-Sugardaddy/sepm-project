export function useRouterRef<T extends { [param: string]: string | number | boolean | null }>(
  defaultValue: T,
  excludedKeys: string[] = []
) {
  const router = useRouter();
  const route = useRoute();

  const params = ref<T>(defaultValue);

  const defaultKeys = Object.keys(defaultValue);
  for (const key of defaultKeys) {
    if (excludedKeys.includes(key)) continue;

    const queryParam = route.query[key] as string;
    if (queryParam) {
      if (typeof params.value[key] === 'number') {
        const value = +queryParam;
        params.value[key] = Number.isNaN(value) ? 0 : value;
      } else if (typeof params.value[key] === 'boolean') {
        params.value[key] = queryParam === 'true';
      } else {
        params.value[key] = queryParam;
      }
    }
  }

  watch(
    params,
    () => {
      const queryCopy = { ...route.query };
      const entries = Object.entries(params.value);
      for (const [key, value] of entries) {
        if (excludedKeys.includes(key)) continue;

        if (value) {
          queryCopy[key] = `${value}`;
        } else {
          delete queryCopy[key];
        }
      }
      router.replace({ query: queryCopy });
    },
    { deep: true }
  );
  return params;
}
