export interface AniTubeEntry {
  id: number;
  slug: string;
  titleUkr: string;
  titleEng: string;
  shikimoriId: number; // для постеру через Shikimori
}

// Список популярних аніме з AniTube
// Формат посилання: https://anitube.in.ua/{id}-{slug}.html
// Embed: https://anitube.in.ua/embed/{id}/
// IDs підтверджені користувачем
export const ANITUBE_POPULAR: AniTubeEntry[] = [
  { id: 94,   slug: 'van-pis',                     titleUkr: 'Ван Піс',                          titleEng: 'One Piece',                       shikimoriId: 21 },
  { id: 1759, slug: 'na-by-proti-titaniv',          titleUkr: 'Атака Титанів',                    titleEng: 'Attack on Titan',                 shikimoriId: 16498 },
  { id: 37,   slug: 'blich',                        titleUkr: 'Блич',                             titleEng: 'Bleach',                          shikimoriId: 269 },
  { id: 31,   slug: 'zapisnik-smert',               titleUkr: 'Зошит Смерті',                     titleEng: 'Death Note',                      shikimoriId: 1535 },
  { id: 4026, slug: 'pershiy-krok',                 titleUkr: 'Перший Крок',                      titleEng: 'Hajime no Ippo',                  shikimoriId: 263 },
  { id: 1,    slug: 'naruto',                       titleUkr: 'Наруто',                           titleEng: 'Naruto',                          shikimoriId: 20 },
  { id: 7,    slug: 'hunter-x-hunter',              titleUkr: 'Мисливець × Мисливець',            titleEng: 'Hunter x Hunter',                 shikimoriId: 11061 },
  { id: 3,    slug: 'klinok-sho-rozrizaye-demoniv', titleUkr: 'Клинок, що розрізає демонів',      titleEng: 'Demon Slayer',                    shikimoriId: 38524 },
  { id: 4,    slug: 'moya-geroichna-akademiya',     titleUkr: 'Моя Героїчна Академія',            titleEng: 'My Hero Academia',                shikimoriId: 31964 },
  { id: 6,    slug: 'stalevyy-alkhimik-bratstvo',   titleUkr: 'Сталевий Алхімік: Братство',       titleEng: 'Fullmetal Alchemist Brotherhood', shikimoriId: 5114 },
];

export function aniTubeEmbedUrl(id: number): string {
  return `https://anitube.in.ua/embed/${id}/`;
}

export function aniTubePageUrl(id: number, slug: string): string {
  return `https://anitube.in.ua/${id}-${slug}.html`;
}