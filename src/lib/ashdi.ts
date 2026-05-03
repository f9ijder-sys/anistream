export interface AshdiAnime {
  id: number;
  title: string;
  titleUa: string;
  posterUrl: string;
  embedUrl: string;
  genres: string[];
  year: number;
  description: string;
}

export const ASHDI_ANIME: AshdiAnime[] = [
  {
    id: 699,
    title: "Death Note",
    titleUa: "Зошит смерті",
    posterUrl: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    embedUrl: "https://ashdi.vip/serial/699",
    genres: ["Психологічний", "Триллер", "Детектив"],
    year: 2006,
    description: "Учень знаходить зошит, який вбиває будь-кого, чиє ім'я в ньому написане."
  },
  {
    id: 1381,
    title: "One Piece",
    titleUa: "Ван Піс",
    posterUrl: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    embedUrl: "https://ashdi.vip/serial/1381",
    genres: ["Пригоди", "Фентезі", "Комедія"],
    year: 1999,
    description: "Монкі Д. Луффі мріє стати Королем піратів і знайти легендарний скарб Ван Піс."
  },
  {
    id: 1397,
    title: "Attack on Titan",
    titleUa: "Атака Титанів",
    posterUrl: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    embedUrl: "https://ashdi.vip/serial/1397",
    genres: ["Екшн", "Драма", "Фентезі"],
    year: 2013,
    description: "Людство бореться за виживання проти гігантських людожерів — титанів."
  },
  {
    id: 103,
    title: "Demon Slayer",
    titleUa: "Клинок, що знищує демонів",
    posterUrl: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    embedUrl: "https://ashdi.vip/serial/103?season=1",
    genres: ["Екшн", "Фентезі", "Пригоди"],
    year: 2019,
    description: "Танджіро стає мисливцем на демонів, щоб врятувати свою сестру."
  },
  {
    id: 1380,
    title: "Bleach",
    titleUa: "Блич",
    posterUrl: "https://cdn.myanimelist.net/images/anime/3/40451.jpg",
    embedUrl: "https://ashdi.vip/serial/1380",
    genres: ["Екшн", "Пригоди", "Надприродне"],
    year: 2004,
    description: "Ічіго Куросакі отримує силу Синігамі і захищає живих від злих духів."
  },
  {
    id: 3,
    title: "Naruto: Shippuden",
    titleUa: "Наруто: Шіппуден",
    posterUrl: "https://cdn.myanimelist.net/images/anime/1565/111305.jpg",
    embedUrl: "https://ashdi.vip/serial/3",
    genres: ["Екшн", "Пригоди", "Фентезі"],
    year: 2007,
    description: "Наруто повертається після 2.5 років тренувань ще сильнішим ніж раніше."
  },
  {
    id: 1398,
    title: "Hunter x Hunter",
    titleUa: "Мисливець × Мисливець",
    posterUrl: "https://cdn.myanimelist.net/images/anime/11/33657.jpg",
    embedUrl: "https://ashdi.vip/serial/1398",
    genres: ["Екшн", "Пригоди", "Фентезі"],
    year: 2011,
    description: "Ґон мріє стати мисливцем і знайти свого батька, що теж є легендарним мисливцем."
  },
  {
    id: 645,
    title: "Fullmetal Alchemist: Brotherhood",
    titleUa: "Сталевий Алхімік: Братство",
    posterUrl: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    embedUrl: "https://ashdi.vip/serial/645",
    genres: ["Екшн", "Пригоди", "Фентезі"],
    year: 2009,
    description: "Брати-алхіміки шукають Філософський камінь, щоб повернути свої тіла."
  },
  {
    id: 1000,
    title: "Tokyo Ghoul",
    titleUa: "Токійський Гуль",
    posterUrl: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
    embedUrl: "https://ashdi.vip/serial/1000?season=1",
    genres: ["Жахи", "Екшн", "Надприродне"],
    year: 2014,
    description: "Студент Канекі стає напівгулем після зустрічі з монстром-людожером."
  }
];
