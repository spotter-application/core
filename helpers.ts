import { OnQueryOption } from './interfaces';

export const generateId = (): string =>
  (Math.random() + 1).toString(36).substring(7);

export const randomPort = (): number =>
  (Math.floor(10000 + Math.random() * 9000));

export const onQueryFilter = (
  query: string,
  options: OnQueryOption[]
): OnQueryOption[] => {
  if (!query?.length) {
    return options;
  }

  const lowerCasedQuery = query.toLowerCase();
  return options.filter(o =>
    o.title.toLowerCase().split(' ').find(t => t.startsWith(lowerCasedQuery))
  );
}
