# Trakt Chart API Response Formats

This document contains examples of API responses from different Trakt chart endpoints. These examples are used to understand the response structure and ensure correct data extraction.

## Response Format Classification

- **Simple Format**: Data at root level (e.g., `popular`)
- **Wrapped Format**: Data nested in `movie` or `show` property (e.g., `trending`, `favorited`, etc.)

## Movies Charts

### Popular Movies

<details>
<summary>https://api.trakt.tv/movies/popular?page=1&limit=10</summary>

```json
[
  {
    "title": "Superman",
    "year": 2025,
    "ids": {
      "trakt": 853702,
      "slug": "superman-2025",
      "imdb": "tt5950044",
      "tmdb": 1061474,
      "plex": {
        "guid": "5d776c73ad5437001f7be813",
        "slug": "superman-2025"
      }
    },
    "tagline": "Look up.",
    "overview": "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
    "runtime": 130,
    "country": "us",
    "trailer": "https://youtube.com/watch?v=MikgqM0LXr4",
    "homepage": "https://www.superman.com",
    "status": "released",
    "rating": 7.20762,
    "votes": 19247,
    "comment_count": 364,
    "updated_at": "2025-12-04T17:48:33.000Z",
    "language": "en",
    "languages": [
      "en"
    ],
    "available_translations": [
      "ar",
      "bg",
      "ca",
      "cs",
      "da",
      "de",
      "el",
      "en",
      "es",
      "fa",
      "fi",
      "fr",
      "he",
      "hi",
      "hr",
      "hu",
      "it",
      "ja",
      "ka",
      "ko",
      "lt",
      "lv",
      "nl",
      "no",
      "pl",
      "pt",
      "ro",
      "ru",
      "sk",
      "sl",
      "sr",
      "sv",
      "th",
      "tr",
      "uk",
      "vi",
      "zh"
    ],
    "genres": [
      "superhero",
      "science-fiction",
      "action",
      "adventure"
    ],
    "subgenres": [
      "amused",
      "super-power",
      "based-on-comic",
      "supervillain"
    ],
    "original_title": "Superman",
    "images": {
      "fanart": [
        "media.trakt.tv/images/movies/000/853/702/fanarts/medium/b627398f5e.jpg.webp"
      ],
      "poster": [
        "media.trakt.tv/images/movies/000/853/702/posters/medium/a69dbb1e7e.jpg.webp"
      ],
      "logo": [
        "media.trakt.tv/images/movies/000/853/702/logos/medium/4a25f4afc2.png.webp"
      ],
      "banner": [
        "media.trakt.tv/images/movies/000/853/702/banners/medium/cf2dfc2ea2.jpg.webp"
      ],
      "thumb": [
        "media.trakt.tv/images/movies/000/853/702/thumbs/medium/4a69101258.jpg.webp"
      ],
      "clearart": [
        "media.trakt.tv/images/movies/000/853/702/cleararts/medium/469f4f7983.png.webp"
      ]
    },
    "colors": {
      "poster": [
        "#CA9B96",
        "#3A0D1A"
      ]
    },
    "released": "2025-07-11",
    "after_credits": true,
    "during_credits": true,
    "certification": "PG-13"
  },
  {
    "title": "Thunderbolts*",
    "year": 2025,
    "ids": {
      "trakt": 792299,
      "slug": "thunderbolts-2025",
      "imdb": "tt20969586",
      "tmdb": 986056,
      "plex": {
        "guid": "62aeee70252f044af9c879d6",
        "slug": "thunderbolts-2025"
      }
    },
    "tagline": "Everyone deserves a second shot.",
    "overview": "After finding themselves ensnared in a death trap, seven disillusioned castoffs must embark on a dangerous mission that will force them to confront the darkest corners of their pasts.",
    "runtime": 127,
    "country": "us",
    "trailer": "https://youtube.com/watch?v=7rs_HhSA7XY",
    "homepage": "https://www.marvel.com/movies/thunderbolts",
    "status": "released",
    "rating": 7.19609,
    "votes": 16044,
    "comment_count": 247,
    "updated_at": "2025-12-06T17:36:34.000Z",
    "language": "en",
    "languages": [
      "en",
      "it",
      "ru"
    ],
    "available_translations": [
      "ar",
      "az",
      "bg",
      "ca",
      "cs",
      "da",
      "de",
      "el",
      "en",
      "es",
      "et",
      "fa",
      "fi",
      "fr",
      "he",
      "hi",
      "hr",
      "hu",
      "it",
      "ja",
      "ka",
      "ko",
      "lt",
      "lv",
      "nl",
      "no",
      "pl",
      "pt",
      "ro",
      "ru",
      "sk",
      "sl",
      "sv",
      "th",
      "tr",
      "uk",
      "vi",
      "zh"
    ],
    "genres": [
      "action",
      "adventure",
      "science-fiction",
      "superhero"
    ],
    "subgenres": [
      "father-daughter-relationship",
      "based-on-comic",
      "marvel-cinematic-universe-mcu",
      "villain"
    ],
    "original_title": "Thunderbolts*",
    "images": {
      "fanart": [
        "media.trakt.tv/images/movies/000/792/299/fanarts/medium/6d635b6627.jpg.webp"
      ],
      "poster": [
        "media.trakt.tv/images/movies/000/792/299/posters/medium/36d0bdcb38.jpg.webp"
      ],
      "logo": [
        "media.trakt.tv/images/movies/000/792/299/logos/medium/43d5365342.png.webp"
      ],
      "banner": [
        "media.trakt.tv/images/movies/000/792/299/banners/medium/3ec623a577.jpg.webp"
      ],
      "thumb": [
        "media.trakt.tv/images/movies/000/792/299/thumbs/medium/8cd206cb8b.jpg.webp"
      ],
      "clearart": [
        "media.trakt.tv/images/movies/000/792/299/cleararts/medium/72f5cc0493.png.webp"
      ]
    },
    "colors": {
      "poster": [
        "#B89E6D",
        "#26221C"
      ]
    },
    "released": "2025-05-02",
    "after_credits": true,
    "during_credits": true,
    "certification": "PG-13"
  }
]
```

</details>

### Trending Movies

<details>
<summary>https://api.trakt.tv/movies/trending?page=1&limit=10</summary>

```json
[
  {
    "watchers": 1703,
    "movie": {
      "title": "TRON: Ares",
      "year": 2025,
      "ids": {
        "trakt": 385396,
        "slug": "tron-ares-2025",
        "imdb": "tt6604188",
        "tmdb": 533533,
        "plex": {
          "guid": "5d7770637a53e9001e7a190f",
          "slug": "tron-ares"
        }
      },
      "tagline": "No going back.",
      "overview": "A highly sophisticated Program called Ares is sent from the digital world into the real world on a dangerous mission, marking humankind's first encounter with A.I. beings.",
      "runtime": 119,
      "country": "us",
      "trailer": "https://youtube.com/watch?v=gNa0j4mQo1k",
      "homepage": "https://movies.disney.com/tron-ares",
      "status": "released",
      "rating": 6.64255,
      "votes": 3234,
      "comment_count": 79,
      "updated_at": "2025-12-06T17:42:30.000Z",
      "language": "en",
      "languages": [
        "en"
      ],
      "available_translations": [
        "ar",
        "bg",
        "ca",
        "cs",
        "da",
        "de",
        "el",
        "en",
        "es",
        "fa",
        "fi",
        "fr",
        "he",
        "hr",
        "hu",
        "it",
        "ja",
        "ka",
        "ko",
        "lt",
        "lv",
        "nl",
        "no",
        "pl",
        "pt",
        "ro",
        "ru",
        "sk",
        "sl",
        "sv",
        "th",
        "tr",
        "uk",
        "vi",
        "zh"
      ],
      "genres": [
        "science-fiction",
        "adventure",
        "action"
      ],
      "subgenres": [
        "artificial-intelligence-a-i"
      ],
      "original_title": "TRON: Ares",
      "images": {
        "fanart": [
          "media.trakt.tv/images/movies/000/385/396/fanarts/medium/f805a92248.jpg.webp"
        ],
        "poster": [
          "media.trakt.tv/images/movies/000/385/396/posters/medium/9198618b70.jpg.webp"
        ],
        "logo": [
          "media.trakt.tv/images/movies/000/385/396/logos/medium/3416df40bf.png.webp"
        ],
        "banner": [
          "media.trakt.tv/images/movies/000/385/396/banners/medium/bbdd83539c.jpg.webp"
        ],
        "thumb": [
          "media.trakt.tv/images/movies/000/385/396/thumbs/medium/9f64043b10.jpg.webp"
        ],
        "clearart": [
          "media.trakt.tv/images/movies/000/385/396/cleararts/medium/930f40096c.png.webp"
        ]
      },
      "colors": {
        "poster": [
          "#B36A59",
          "#37130F"
        ]
      },
      "released": "2025-10-10",
      "after_credits": false,
      "during_credits": false,
      "certification": "PG-13"
    }
  },
  {
    "watchers": 956,
    "movie": {
      "title": "Predator: Badlands",
      "year": 2025,
      "ids": {
        "trakt": 1006226,
        "slug": "predator-badlands-2025",
        "imdb": "tt31227572",
        "tmdb": 1242898,
        "plex": {
          "guid": "65ca74670a8f3c2de645d488",
          "slug": "predator-badlands"
        }
      },
      "tagline": "First hunt. Last chance.",
      "overview": "Cast out from his clan, a young Predator finds an unlikely ally in a damaged android and embarks on a treacherous journey in search of the ultimate adversary.",
      "runtime": 107,
      "country": "us",
      "trailer": "https://youtube.com/watch?v=9PgcAIgpwPA",
      "homepage": "https://www.20thcenturystudios.com/movies/predator-badlands",
      "status": "released",
      "rating": 7.68255,
      "votes": 2413,
      "comment_count": 79,
      "updated_at": "2025-12-06T08:19:30.000Z",
      "language": "en",
      "languages": [
        "en"
      ],
      "available_translations": [
        "ar",
        "bg",
        "ca",
        "cs",
        "de",
        "el",
        "en",
        "es",
        "fa",
        "fr",
        "he",
        "hi",
        "hr",
        "hu",
        "id",
        "it",
        "ja",
        "ka",
        "ko",
        "lt",
        "lv",
        "nl",
        "pl",
        "pt",
        "ro",
        "ru",
        "sk",
        "sl",
        "sr",
        "sv",
        "th",
        "tr",
        "uk",
        "vi",
        "zh"
      ],
      "genres": [
        "science-fiction",
        "action",
        "adventure"
      ],
      "subgenres": [
        "survival"
      ],
      "original_title": "Predator: Badlands",
      "images": {
        "fanart": [
          "media.trakt.tv/images/movies/001/006/226/fanarts/medium/57604f5fdc.jpg.webp"
        ],
        "poster": [
          "media.trakt.tv/images/movies/001/006/226/posters/medium/7a93eaf74f.jpg.webp"
        ],
        "logo": [
          "media.trakt.tv/images/movies/001/006/226/logos/medium/97091ba980.png.webp"
        ],
        "banner": [
          "media.trakt.tv/images/movies/001/006/226/banners/medium/1e6201e9fd.jpg.webp"
        ],
        "thumb": [
          "media.trakt.tv/images/movies/001/006/226/thumbs/medium/01362ecb50.jpg.webp"
        ],
        "clearart": [
          "media.trakt.tv/images/movies/001/006/226/cleararts/medium/d7748a88e4.png.webp"
        ]
      },
      "colors": {
        "poster": [
          "#919B90",
          "#202C2E"
        ]
      },
      "released": "2025-11-07",
      "after_credits": false,
      "during_credits": false,
      "certification": "PG-13"
    }
  }
]
```

</details>

### Favorited Movies

<details>
<summary>https://api.trakt.tv/movies/favorited?page=1&limit=2</summary>

```json
[
  {
    "user_count": 193,
    "movie": {
      "title": "TRON: Ares",
      "year": 2025,
      "ids": {
        "trakt": 385396,
        "slug": "tron-ares-2025",
        "imdb": "tt6604188",
        "tmdb": 533533
      }
    }
  },
  {
    "user_count": 88,
    "movie": {
      "title": "Zootopia 2",
      "year": 2025,
      "ids": {
        "trakt": 871499,
        "slug": "zootopia-2-2025",
        "imdb": "tt26443597",
        "tmdb": 1084242
      }
    }
  }
]
```

</details>

### Played Movies

<details>
<summary>https://api.trakt.tv/movies/played?page=1&limit=2</summary>

```json
[
  {
    "watcher_count": 6137,
    "play_count": 7996,
    "collected_count": 1295,
    "movie": {
      "title": "Predator: Badlands",
      "year": 2025,
      "ids": {
        "trakt": 1006226,
        "slug": "predator-badlands-2025",
        "imdb": "tt31227572",
        "tmdb": 1242898
      }
    }
  },
  {
    "watcher_count": 6624,
    "play_count": 7506,
    "collected_count": 4995,
    "movie": {
      "title": "TRON: Ares",
      "year": 2025,
      "ids": {
        "trakt": 385396,
        "slug": "tron-ares-2025",
        "imdb": "tt6604188",
        "tmdb": 533533
      }
    }
  }
]
```

</details>

### Watched Movies

<details>
<summary>https://api.trakt.tv/movies/watched?page=1&limit=2</summary>

```json
[
  {
    "watcher_count": 6624,
    "play_count": 7506,
    "collected_count": 4995,
    "movie": {
      "title": "TRON: Ares",
      "year": 2025,
      "ids": {
        "trakt": 385396,
        "slug": "tron-ares-2025",
        "imdb": "tt6604188",
        "tmdb": 533533
      }
    }
  },
  {
    "watcher_count": 6137,
    "play_count": 7996,
    "collected_count": 1295,
    "movie": {
      "title": "Predator: Badlands",
      "year": 2025,
      "ids": {
        "trakt": 1006226,
        "slug": "predator-badlands-2025",
        "imdb": "tt31227572",
        "tmdb": 1242898
      }
    }
  }
]
```

</details>

### Collected Movies

<details>
<summary>https://api.trakt.tv/movies/collected?page=1&limit=2</summary>

```json
[
  {
    "watcher_count": 6624,
    "play_count": 7506,
    "collected_count": 4995,
    "movie": {
      "title": "TRON: Ares",
      "year": 2025,
      "ids": {
        "trakt": 385396,
        "slug": "tron-ares-2025",
        "imdb": "tt6604188",
        "tmdb": 533533
      }
    }
  },
  {
    "watcher_count": 1716,
    "play_count": 1908,
    "collected_count": 1916,
    "movie": {
      "title": "Oh. What. Fun.",
      "year": 2025,
      "ids": {
        "trakt": 1023819,
        "slug": "oh-what-fun-2025",
        "imdb": "tt31998881",
        "tmdb": 1261825
      }
    }
  }
]
```

</details>

### Anticipated Movies

<details>
<summary>https://api.trakt.tv/movies/anticipated?page=1&limit=2</summary>

```json
[
  {
    "list_count": 42302,
    "movie": {
      "title": "Avatar: Fire and Ash",
      "year": 2025,
      "ids": {
        "trakt": 62544,
        "slug": "avatar-fire-and-ash-2025",
        "imdb": "tt1757678",
        "tmdb": 83533,
        "plex": {
          "guid": "5d7768cc9ab54400214eba10",
          "slug": "avatar-fire-and-ash"
        }
      },
      "tagline": "The world of Pandora will change forever.",
      "overview": "In the wake of the devastating war against the RDA and the loss of their eldest son, Jake Sully and Neytiri face a new threat on Pandora: the Ash People, a violent and power-hungry Na'vi tribe led by the ruthless Varang. Jake's family must fight for their survival and the future of Pandora in a conflict that pushes them to their emotional and physical limits.",
      "runtime": 197,
      "country": "us",
      "trailer": "https://youtube.com/watch?v=Ma1x7ikpid8",
      "homepage": "https://www.avatar.com/movies/avatar-fire-and-ash",
      "status": "released",
      "rating": 7.42718,
      "votes": 206,
      "comment_count": 3,
      "updated_at": "2025-12-06T08:17:47.000Z",
      "language": "en",
      "languages": [
        "en"
      ],
      "available_translations": [
        "ar",
        "bg",
        "ca",
        "cs",
        "da",
        "de",
        "en",
        "es",
        "fa",
        "fr",
        "he",
        "hi",
        "hr",
        "hu",
        "it",
        "ja",
        "ka",
        "kn",
        "ko",
        "lt",
        "lv",
        "ml",
        "nl",
        "no",
        "pl",
        "pt",
        "ro",
        "ru",
        "sk",
        "sv",
        "ta",
        "te",
        "th",
        "tr",
        "uk",
        "vi",
        "zh"
      ],
      "genres": [
        "adventure",
        "science-fiction",
        "fantasy"
      ],
      "subgenres": [],
      "original_title": "Avatar: Fire and Ash",
      "images": {
        "fanart": [
          "media.trakt.tv/images/movies/000/062/544/fanarts/medium/8f80150fd6.jpg.webp"
        ],
        "poster": [
          "media.trakt.tv/images/movies/000/062/544/posters/medium/53ba7ba809.jpg.webp"
        ],
        "logo": [
          "media.trakt.tv/images/movies/000/062/544/logos/medium/6879bb24fb.png.webp"
        ],
        "banner": [
          "media.trakt.tv/images/movies/000/062/544/banners/medium/a1378d798e.jpg.webp"
        ],
        "thumb": [
          "media.trakt.tv/images/movies/000/062/544/thumbs/medium/e6a80f7f50.jpg.webp"
        ],
        "clearart": [
          "media.trakt.tv/images/movies/000/062/544/cleararts/medium/d7d7e49a5e.png.webp"
        ]
      },
      "colors": {
        "poster": [
          "#CC997A",
          "#3C3037"
        ]
      },
      "released": "2025-12-19",
      "after_credits": false,
      "during_credits": false,
      "certification": "PG-13"
    }
  },
  {
    "list_count": 9531,
    "movie": {
      "title": "Spider-Man: Brand New Day",
      "year": 2026,
      "ids": {
        "trakt": 905132,
        "slug": "spider-man-brand-new-day-2026",
        "imdb": "tt22084616",
        "tmdb": 969681,
        "plex": {
          "guid": "5ed8a6246e2d7200411126cf",
          "slug": "spider-man-brand-new-day"
        }
      },
      "tagline": "",
      "overview": "The fourth installment in the Spider-Man franchise and part of Phase Six of the Marvel Cinematic Universe (MCU). Plot TBA.",
      "runtime": 90,
      "country": "us",
      "homepage": "https://www.marvel.com/movies/spider-man-brand-new-day",
      "status": "post production",
      "rating": 7.63636,
      "votes": 22,
      "comment_count": 1,
      "updated_at": "2025-12-06T08:24:56.000Z",
      "language": "en",
      "languages": [
        "en"
      ],
      "available_translations": [
        "cs",
        "en",
        "es",
        "fr",
        "he",
        "hu",
        "ja",
        "ka",
        "ko",
        "pl",
        "pt",
        "ro",
        "ru",
        "th",
        "uk",
        "vi",
        "zh"
      ],
      "genres": [
        "science-fiction",
        "action",
        "adventure",
        "superhero"
      ],
      "subgenres": [
        "based-on-comic",
        "marvel-cinematic-universe-mcu"
      ],
      "original_title": "Spider-Man: Brand New Day",
      "images": {
        "fanart": [
          "media.trakt.tv/images/movies/000/905/132/fanarts/medium/638a312284.jpg.webp"
        ],
        "poster": [
          "media.trakt.tv/images/movies/000/905/132/posters/medium/ff77450a46.jpg.webp"
        ],
        "logo": [
          "media.trakt.tv/images/movies/000/905/132/logos/medium/0af84e42ac.png.webp"
        ],
        "banner": [],
        "thumb": [],
        "clearart": []
      },
      "colors": {
        "poster": [
          "#CD2923",
          "#020203"
        ]
      },
      "released": "2026-07-31",
      "after_credits": false,
      "during_credits": false
    }
  }
]
```

</details>

## Shows Charts

### Popular Shows

<details>
<summary>https://api.trakt.tv/shows/popular?page=1&limit=2</summary>

```json
[
  {
    "title": "Adolescence",
    "year": 2025,
    "ids": {
      "trakt": 230892,
      "slug": "adolescence",
      "imdb": "tt31806037",
      "tmdb": 249042,
      "plex": {
        "guid": "65f48a3d97ad9a728e5208f5",
        "slug": "adolescence"
      },
      "tvdb": 452467
    },
    "tagline": "A child accused. Everyone left to answer.",
    "overview": "When a 13-year-old is accused of the murder of a classmate, his family, therapist and the detective in charge are all left asking: what really happened?",
    "runtime": 58,
    "country": "gb",
    "trailer": "https://youtube.com/watch?v=Wk5OxqtpBR4",
    "homepage": "https://www.netflix.com/title/81756069",
    "status": "ended",
    "rating": 7.65489,
    "votes": 11324,
    "comment_count": 125,
    "updated_at": "2025-11-28T15:11:38.000Z",
    "language": "en",
    "languages": [
      "en"
    ],
    "available_translations": [
      "ar",
      "bg",
      "ca",
      "cs",
      "da",
      "de",
      "el",
      "en",
      "es",
      "fa",
      "fi",
      "fr",
      "he",
      "hi",
      "hr",
      "hu",
      "id",
      "it",
      "ja",
      "ka",
      "ko",
      "lt",
      "ms",
      "nl",
      "no",
      "pl",
      "pt",
      "ro",
      "ru",
      "sl",
      "sr",
      "sv",
      "th",
      "tl",
      "tr",
      "uk",
      "vi",
      "zh"
    ],
    "genres": [
      "crime",
      "drama"
    ],
    "subgenres": [
      "intense",
      "miniseries",
      "murder",
      "family-relationships",
      "psychological-drama",
      "blunt"
    ],
    "original_title": "Adolescence",
    "images": {
      "fanart": [
        "media.trakt.tv/images/shows/000/230/892/fanarts/medium/552b62d4dd.jpg.webp"
      ],
      "poster": [
        "media.trakt.tv/images/shows/000/230/892/posters/medium/0ec8ee0876.jpg.webp"
      ],
      "logo": [
        "media.trakt.tv/images/shows/000/230/892/logos/medium/318ead85e2.png.webp"
      ],
      "banner": [
        "media.trakt.tv/images/shows/000/230/892/banners/medium/f586ee00f9.jpg.webp"
      ],
      "thumb": [
        "media.trakt.tv/images/shows/000/230/892/thumbs/medium/e7a13d0c07.jpg.webp"
      ],
      "clearart": []
    },
    "colors": {
      "poster": [
        "#969589",
        "#4D3B29"
      ]
    },
    "first_aired": "2025-03-13T04:00:00.000Z",
    "aired_episodes": 4,
    "certification": "TV-MA",
    "airs": {
      "day": "Thursday",
      "time": "04:00",
      "timezone": "Europe/London"
    },
    "network": "Netflix"
  },
  {
    "title": "MobLand",
    "year": 2025,
    "ids": {
      "trakt": 228595,
      "slug": "mobland",
      "imdb": "tt31510819",
      "tmdb": 247718,
      "plex": {
        "guid": "65e04d051f43644ac5a79a99",
        "slug": "mobland"
      },
      "tvdb": 446831
    },
    "tagline": "",
    "overview": "Two mob families clash in a war that threatens to topple empires and lives.",
    "runtime": 60,
    "country": "us",
    "trailer": "https://youtube.com/watch?v=qKGgw7Ob5f4",
    "homepage": "https://www.paramountplus.com/shows/mobland",
    "status": "returning series",
    "rating": 8.35314,
    "votes": 5216,
    "comment_count": 60,
    "updated_at": "2025-11-27T16:20:58.000Z",
    "language": "en",
    "languages": [
      "en"
    ],
    "available_translations": [
      "ar",
      "bg",
      "cs",
      "da",
      "de",
      "el",
      "en",
      "es",
      "et",
      "fa",
      "fi",
      "fr",
      "he",
      "hr",
      "hu",
      "it",
      "ja",
      "ka",
      "ko",
      "lt",
      "nl",
      "pl",
      "pt",
      "ro",
      "ru",
      "sk",
      "sl",
      "sr",
      "sv",
      "th",
      "tr",
      "uk",
      "vi",
      "zh"
    ],
    "genres": [
      "drama",
      "crime"
    ],
    "subgenres": [
      "betrayal",
      "gangster",
      "murder"
    ],
    "original_title": "MobLand",
    "images": {
      "fanart": [
        "media.trakt.tv/images/shows/000/228/595/fanarts/medium/f08edbdd28.jpg.webp"
      ],
      "poster": [
        "media.trakt.tv/images/shows/000/228/595/posters/medium/e48e8ff899.jpg.webp"
      ],
      "logo": [
        "media.trakt.tv/images/shows/000/228/595/logos/medium/a249cbb88d.png.webp"
      ],
      "banner": [
        "media.trakt.tv/images/shows/000/228/595/banners/medium/c12bf5bbb1.jpg.webp"
      ],
      "thumb": [
        "media.trakt.tv/images/shows/000/228/595/thumbs/medium/6074f6ff5a.jpg.webp"
      ],
      "clearart": [
        "media.trakt.tv/images/shows/000/228/595/cleararts/medium/b29a313363.png.webp"
      ]
    },
    "colors": {
      "poster": [
        "#C25F61",
        "#191B21"
      ]
    },
    "first_aired": "2025-03-30T07:00:00.000Z",
    "aired_episodes": 10,
    "certification": "TV-MA",
    "airs": {
      "day": "Sunday",
      "time": "03:00",
      "timezone": "America/New_York"
    },
    "network": "Paramount+"
  }
]
```

</details>

### Trending Shows

<details>
<summary>https://api.trakt.tv/shows/trending?page=1&limit=2</summary>

```json
[
  {
    "watchers": 9373,
    "show": {
      "title": "Pluribus",
      "year": 2025,
      "ids": {
        "trakt": 206790,
        "slug": "pluribus",
        "imdb": "tt22202452",
        "tmdb": 225171,
        "plex": {
          "guid": "6497f1862313a1f871612318",
          "slug": "pluribus"
        },
        "tvdb": 436457
      },
      "tagline": "Happiness is a state of mind.",
      "overview": "The most miserable person on Earth must save the world from happiness.",
      "runtime": 50,
      "country": "us",
      "trailer": "https://youtube.com/watch?v=a6lzvWby9UE",
      "homepage": "https://tv.apple.com/show/umc.cmc.37axgovs2yozlyh3c2cmwzlza",
      "status": "returning series",
      "rating": 8.28246,
      "votes": 1009,
      "comment_count": 46,
      "updated_at": "2025-12-06T21:22:53.000Z",
      "language": "en",
      "languages": [
        "en",
        "fr",
        "es"
      ],
      "available_translations": [
        "ar",
        "bg",
        "cs",
        "da",
        "de",
        "el",
        "en",
        "es",
        "fa",
        "fi",
        "fr",
        "he",
        "hi",
        "hu",
        "id",
        "it",
        "ja",
        "ka",
        "ko",
        "lt",
        "nl",
        "no",
        "pl",
        "pt",
        "ro",
        "ru",
        "sk",
        "sl",
        "sv",
        "th",
        "tr",
        "uk",
        "vi",
        "zh"
      ],
      "genres": [
        "drama",
        "fantasy",
        "science-fiction"
      ],
      "subgenres": [
        "virus"
      ],
      "original_title": "Pluribus",
      "images": {
        "fanart": [
          "media.trakt.tv/images/shows/000/206/790/fanarts/medium/27e7ef3b00.jpg.webp"
        ],
        "poster": [
          "media.trakt.tv/images/shows/000/206/790/posters/medium/f192887596.jpg.webp"
        ],
        "logo": [
          "media.trakt.tv/images/shows/000/206/790/logos/medium/d445cdd790.png.webp"
        ],
        "banner": [
          "media.trakt.tv/images/shows/000/206/790/banners/medium/b713b94755.jpg.webp"
        ],
        "thumb": [
          "media.trakt.tv/images/shows/000/206/790/thumbs/medium/de60665b9a.jpg.webp"
        ],
        "clearart": [
          "media.trakt.tv/images/shows/000/206/790/cleararts/medium/5917104d2b.png.webp"
        ]
      },
      "colors": {
        "poster": [
          "#EBCE17",
          "#A7795C"
        ]
      },
      "first_aired": "2025-11-07T02:00:00.000Z",
      "aired_episodes": 6,
      "certification": "TV-MA",
      "airs": {
        "day": "Thursday",
        "time": "21:00",
        "timezone": "America/New_York"
      },
      "network": "Apple TV+"
    }
  },
  {
    "watchers": 7172,
    "show": {
      "title": "Stranger Things",
      "year": 2016,
      "ids": {
        "trakt": 104439,
        "slug": "stranger-things",
        "imdb": "tt4574334",
        "tmdb": 66732,
        "plex": {
          "guid": "5d9c07efe9d5a1001f4d5ec1",
          "slug": "stranger-things"
        },
        "tvdb": 305288
      },
      "tagline": "One last adventure.",
      "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
      "runtime": 60,
      "country": "us",
      "trailer": "https://youtube.com/watch?v=PssKpzB0Ah0",
      "homepage": "https://www.netflix.com/title/80057281",
      "status": "returning series",
      "rating": 8.45614,
      "votes": 65221,
      "comment_count": 204,
      "updated_at": "2025-12-06T19:50:46.000Z",
      "language": "en",
      "languages": [
        "en"
      ],
      "available_translations": [
        "ar",
        "bg",
        "bs",
        "cs",
        "da",
        "de",
        "el",
        "en",
        "es",
        "eu",
        "fa",
        "fi",
        "fr",
        "he",
        "hi",
        "hr",
        "hu",
        "id",
        "it",
        "ja",
        "ka",
        "ko",
        "lt",
        "lv",
        "ms",
        "nl",
        "no",
        "pl",
        "pt",
        "ro",
        "ru",
        "sk",
        "sl",
        "so",
        "sr",
        "sv",
        "th",
        "tl",
        "tr",
        "uk",
        "uz",
        "vi",
        "zh"
      ],
      "genres": [
        "fantasy",
        "science-fiction",
        "mystery",
        "action",
        "adventure",
        "horror"
      ],
      "subgenres": [
        "friendship",
        "monster",
        "supernatural",
        "coming-of-age",
        "halloween",
        "small-town",
        "1980s",
        "teen-drama",
        "super-power",
        "experiment",
        "supernatural-horror"
      ],
      "original_title": "Stranger Things",
      "images": {
        "fanart": [
          "media.trakt.tv/images/shows/000/104/439/fanarts/medium/08ffc0eae9.jpg.webp"
        ],
        "poster": [
          "media.trakt.tv/images/shows/000/104/439/posters/medium/84177ad9b8.jpg.webp"
        ],
        "logo": [
          "media.trakt.tv/images/shows/000/104/439/logos/medium/4193c17ea9.png.webp"
        ],
        "banner": [
          "media.trakt.tv/images/shows/000/104/439/banners/medium/b7f2406aed.jpg.webp"
        ],
        "thumb": [
          "media.trakt.tv/images/shows/000/104/439/thumbs/medium/064a38f738.jpg.webp"
        ],
        "clearart": [
          "media.trakt.tv/images/shows/000/104/439/cleararts/medium/42ae109f8d.png.webp"
        ]
      },
      "colors": {
        "poster": [
          "#BCA38C",
          "#2D2F2C"
        ]
      },
      "first_aired": "2016-07-16T00:00:00.000Z",
      "aired_episodes": 38,
      "certification": "TV-MA",
      "airs": {
        "day": "Wednesday",
        "time": "20:00",
        "timezone": "America/New_York"
      },
      "network": "Netflix"
    }
  }
]
```

</details>

### Favorited Shows

<details>
<summary>https://api.trakt.tv/shows/favorited?page=1&limit=2</summary>

```json
[
  {
    "user_count": 382,
    "show": {
      "title": "Stranger Things",
      "year": 2016,
      "ids": {
        "trakt": 104439,
        "slug": "stranger-things",
        "tvdb": 305288,
        "imdb": "tt4574334",
        "tmdb": 66732,
        "tvrage": null
      }
    }
  },
  {
    "user_count": 159,
    "show": {
      "title": "Pluribus",
      "year": 2025,
      "ids": {
        "trakt": 206790,
        "slug": "pluribus",
        "tvdb": 436457,
        "imdb": "tt22202452",
        "tmdb": 225171,
        "tvrage": null
      }
    }
  }
]
```

</details>

### Played Shows

<details>
<summary>https://api.trakt.tv/shows/played?page=1&limit=2</summary>

```json
[
  {
    "watcher_count": 42872,
    "play_count": 198725,
    "collected_count": 1450,
    "collector_count": 735,
    "show": {
      "title": "Stranger Things",
      "year": 2016,
      "ids": {
        "trakt": 104439,
        "slug": "stranger-things",
        "tvdb": 305288,
        "imdb": "tt4574334",
        "tmdb": 66732,
        "tvrage": null
      }
    }
  },
  {
    "watcher_count": 6955,
    "play_count": 122937,
    "collected_count": 3138,
    "collector_count": 291,
    "show": {
      "title": "The Simpsons",
      "year": 1989,
      "ids": {
        "trakt": 455,
        "slug": "the-simpsons",
        "tvdb": 71663,
        "imdb": "tt0096697",
        "tmdb": 456,
        "tvrage": null
      }
    }
  }
]
```

</details>

### Watched Shows

<details>
<summary>https://api.trakt.tv/shows/watched?page=1&limit=2</summary>

```json
[
  {
    "watcher_count": 42872,
    "play_count": 198725,
    "collected_count": 1450,
    "collector_count": 735,
    "show": {
      "title": "Stranger Things",
      "year": 2016,
      "ids": {
        "trakt": 104439,
        "slug": "stranger-things",
        "tvdb": 305288,
        "imdb": "tt4574334",
        "tmdb": 66732,
        "tvrage": null
      }
    }
  },
  {
    "watcher_count": 32743,
    "play_count": 60237,
    "collected_count": 5710,
    "collector_count": 0,
    "show": {
      "title": "Pluribus",
      "year": 2025,
      "ids": {
        "trakt": 206790,
        "slug": "pluribus",
        "tvdb": 436457,
        "imdb": "tt22202452",
        "tmdb": 225171,
        "tvrage": null
      }
    }
  }
]
```

</details>

### Collected Shows

<details>
<summary>https://api.trakt.tv/shows/collected?page=1&limit=2</summary>

```json
[
  {
    "watcher_count": 135,
    "play_count": 2768,
    "collected_count": 274,
    "collector_count": 7015,
    "show": {
      "title": "Jimmy Kimmel Live",
      "year": 2003,
      "ids": {
        "trakt": 1480,
        "slug": "jimmy-kimmel-live",
        "tvdb": 71998,
        "imdb": "tt0320037",
        "tmdb": 1489,
        "tvrage": null
      }
    }
  },
  {
    "watcher_count": 873,
    "play_count": 7136,
    "collected_count": 236,
    "collector_count": 6861,
    "show": {
      "title": "Silo",
      "year": 2023,
      "ids": {
        "trakt": 180770,
        "slug": "silo",
        "tvdb": 403245,
        "imdb": "tt14688458",
        "tmdb": 125988,
        "tvrage": null
      }
    }
  }
]
```

</details>

### Anticipated Shows

<details>
<summary>https://api.trakt.tv/shows/anticipated?page=1&limit=2</summary>

```json
[
  {
    "list_count": 9357,
    "show": {
      "title": "A Knight of the Seven Kingdoms",
      "year": 2026,
      "ids": {
        "trakt": 204141,
        "slug": "a-knight-of-the-seven-kingdoms",
        "imdb": "tt27497448",
        "tmdb": 224372,
        "plex": {},
        "tvdb": 433631
      },
      "tagline": "A tall tale that became legend.",
      "overview": "A century before the events of Game of Thrones, two unlikely heroes wandered Westeros: a young, naive but courageous knight, Ser Duncan the Tall, and his diminutive squire, Egg. Set in an age when the Targaryen line still holds the Iron Throne and the last dragon has not yet passed from living memory, great destinies, powerful foes, and dangerous exploits await these improbable and incomparable friends.",
      "runtime": 42,
      "country": "us",
      "trailer": "https://youtube.com/watch?v=sItUCKJQLTU",
      "homepage": "https://www.hbo.com/content/a-knight-of-the-seven-kingdoms",
      "status": "in production",
      "rating": 8.6875,
      "votes": 16,
      "comment_count": 2,
      "updated_at": "2025-12-06T15:28:49.000Z",
      "language": "en",
      "languages": [
        "en"
      ],
      "available_translations": [
        "ar",
        "bg",
        "ca",
        "el",
        "en",
        "es",
        "fr",
        "hr",
        "hu",
        "ko",
        "nl",
        "pt",
        "ru",
        "uk",
        "zh"
      ],
      "genres": [
        "drama",
        "fantasy",
        "science-fiction"
      ],
      "subgenres": [],
      "original_title": "A Knight of the Seven Kingdoms",
      "images": {
        "fanart": [
          "media.trakt.tv/images/shows/000/204/141/fanarts/medium/40fb57e72d.jpg.webp"
        ],
        "poster": [
          "media.trakt.tv/images/shows/000/204/141/posters/medium/ba681f33fc.jpg.webp"
        ],
        "logo": [
          "media.trakt.tv/images/shows/000/204/141/logos/medium/e4718bddda.png.webp"
        ],
        "banner": [],
        "thumb": [],
        "clearart": []
      },
      "colors": {
        "poster": [
          "#AEA897",
          "#252219"
        ]
      },
      "first_aired": "2026-01-18T05:00:00.000Z",
      "aired_episodes": 0,
      "airs": {
        "day": "Saturday",
        "time": "00:00",
        "timezone": "America/New_York"
      },
      "network": "HBO"
    }
  },
  {
    "list_count": 4843,
    "show": {
      "title": "Wonder Man",
      "year": 2026,
      "ids": {
        "trakt": 196325,
        "slug": "wonder-man",
        "imdb": "tt21066182",
        "tmdb": 198178,
        "plex": {
          "guid": "626411f62ca794f0875278f6",
          "slug": "wonder-man-1"
        },
        "tvdb": 428629
      },
      "tagline": "",
      "overview": "Simon and Trevor, two actors at opposite ends of their careers, chase life-changing roles.",
      "runtime": 42,
      "country": "us",
      "trailer": "https://youtube.com/watch?v=lgoxHC7WF9w",
      "homepage": "https://disneyplus.com/browse/entity-555c5896-02e4-4873-8fa9-ce090dcd874b",
      "status": "in production",
      "rating": 6.5,
      "votes": 4,
      "comment_count": 1,
      "updated_at": "2025-12-06T15:21:14.000Z",
      "language": "en",
      "languages": [
        "en"
      ],
      "available_translations": [
        "en",
        "ja",
        "ko",
        "nl",
        "pt",
        "ro",
        "ru",
        "uk",
        "zh"
      ],
      "genres": [
        "comedy"
      ],
      "subgenres": [
        "based-on-comic",
        "marvel-cinematic-universe-mcu"
      ],
      "original_title": "Wonder Man",
      "images": {
        "fanart": [
          "media.trakt.tv/images/shows/000/196/325/fanarts/medium/72f1cf564a.jpg.webp"
        ],
        "poster": [
          "media.trakt.tv/images/shows/000/196/325/posters/medium/c60afc89d0.jpg.webp"
        ],
        "logo": [
          "media.trakt.tv/images/shows/000/196/325/logos/medium/4d0f909a50.png.webp"
        ],
        "banner": [],
        "thumb": [],
        "clearart": []
      },
      "colors": {
        "poster": [
          "#D3B1A2",
          "#301D15"
        ]
      },
      "first_aired": "2026-01-28T02:00:00.000Z",
      "aired_episodes": 0,
      "certification": "TV-14",
      "airs": {
        "day": "Tuesday",
        "time": "21:00",
        "timezone": "America/New_York"
      },
      "network": "Disney+"
    }
  }
]
```

</details>

## Summary Table

| Chart Type | Movies Format | Shows Format | Key Difference |
|-----------|---------------|--------------|----------------|
| `popular` | Simple | Simple | Data at root level |
| `trending` | Wrapped | Wrapped | Data in `movie`/`show` property with `watchers` count |
| `favorited` | Wrapped | Wrapped | Data in `movie`/`show` property with `user_count` |
| `played` | Wrapped | Wrapped | Data in `movie`/`show` property with `watcher_count`, `play_count`, `collected_count` |
| `watched` | Wrapped | Wrapped | Data in `movie`/`show` property with `watcher_count`, `play_count`, `collected_count` |
| `collected` | Wrapped | Wrapped | Data in `movie`/`show` property with `watcher_count`, `play_count`, `collected_count`, `collector_count` |
| `anticipated` | Wrapped | Wrapped | Data in `movie`/`show` property with `list_count` |
