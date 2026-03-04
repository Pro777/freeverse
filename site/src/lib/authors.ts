export type AuthorInfo = {
  birth_year: number;
  death_year: number;
  bio: string;
  source_label: string;
  source_url: string;
};

export const AUTHOR_INFO: Record<string, AuthorInfo> = {
  "alfred-tennyson": {
    birth_year: 1809,
    death_year: 1892,
    bio: "English poet and Poet Laureate of Great Britain, known for Victorian narrative and lyric poems including 'Ulysses' and 'The Charge of the Light Brigade'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Alfred,_Lord_Tennyson",
  },
  "christina-rossetti": {
    birth_year: 1830,
    death_year: 1894,
    bio: "English poet associated with the Pre-Raphaelites, widely read for devotional lyrics and poems such as 'Goblin Market' and 'Remember'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Christina_Rossetti",
  },
  "edgar-allan-poe": {
    birth_year: 1809,
    death_year: 1849,
    bio: "American poet, critic, and fiction writer, famous for Gothic and musical verse including 'The Raven' and 'Annabel Lee'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Edgar_Allan_Poe",
  },
  "elizabeth-barrett-browning": {
    birth_year: 1806,
    death_year: 1861,
    bio: "English poet of the Victorian era best known for 'Sonnets from the Portuguese', including Sonnet 43 ('How do I love thee?').",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Elizabeth_Barrett_Browning",
  },
  "emily-dickinson": {
    birth_year: 1830,
    death_year: 1886,
    bio: "American lyric poet whose compressed, innovative style and posthumous influence made her one of the central figures of American poetry.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Emily_Dickinson",
  },
  "emma-lazarus": {
    birth_year: 1849,
    death_year: 1887,
    bio: "American poet and essayist known for the sonnet 'The New Colossus', later associated with the Statue of Liberty.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Emma_Lazarus",
  },
  "george-gordon-byron": {
    birth_year: 1788,
    death_year: 1824,
    bio: "English Romantic poet whose works include satirical and lyrical poems such as 'She Walks in Beauty' and 'Don Juan'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Lord_Byron",
  },
  "gerard-manley-hopkins": {
    birth_year: 1844,
    death_year: 1889,
    bio: "English poet and Jesuit priest known for sprung rhythm and intensely patterned devotional language.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Gerard_Manley_Hopkins",
  },
  horace: {
    birth_year: -65,
    death_year: -8,
    bio: "Roman lyric poet of the Augustan age, celebrated for the Odes and enduring maxims including 'non omnis moriar'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Horace",
  },
  "john-keats": {
    birth_year: 1795,
    death_year: 1821,
    bio: "English Romantic poet whose odes and sonnets, including 'To Autumn' and 'Ode to a Nightingale', are central to English lyric poetry.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/John_Keats",
  },
  "john-milton": {
    birth_year: 1608,
    death_year: 1674,
    bio: "English poet and polemicist, author of 'Paradise Lost' and major works of early modern English literature.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/John_Milton",
  },
  "henry-wadsworth-longfellow": {
    birth_year: 1807,
    death_year: 1882,
    bio: "American poet and educator known for widely read narrative and lyric works including 'Paul Revere's Ride' and 'A Psalm of Life'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Henry_Wadsworth_Longfellow",
  },
  "percy-bysshe-shelley": {
    birth_year: 1792,
    death_year: 1822,
    bio: "English Romantic poet known for visionary political and lyric poems such as 'Ozymandias' and 'Ode to the West Wind'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Percy_Bysshe_Shelley",
  },
  "ralph-waldo-emerson": {
    birth_year: 1803,
    death_year: 1882,
    bio: "American essayist and poet, a leading voice in Transcendentalism whose writings shaped nineteenth-century American thought.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Ralph_Waldo_Emerson",
  },
  "robert-browning": {
    birth_year: 1812,
    death_year: 1889,
    bio: "English poet and playwright known for dramatic monologue and psychological intensity in Victorian verse.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Robert_Browning",
  },
  "samuel-taylor-coleridge": {
    birth_year: 1772,
    death_year: 1834,
    bio: "English poet and critic of the Romantic movement, known for 'The Rime of the Ancient Mariner' and collaboration with Wordsworth.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Samuel_Taylor_Coleridge",
  },
  "walt-whitman": {
    birth_year: 1819,
    death_year: 1892,
    bio: "American poet of free verse and expansive democratic style, best known for 'Leaves of Grass'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Walt_Whitman",
  },
  "william-blake": {
    birth_year: 1757,
    death_year: 1827,
    bio: "English poet and artist whose visionary collections 'Songs of Innocence and of Experience' include 'The Lamb' and 'The Tyger'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/William_Blake",
  },
  "william-ernest-henley": {
    birth_year: 1849,
    death_year: 1903,
    bio: "English poet and editor remembered for stoic Victorian verse, especially 'Invictus'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/William_Ernest_Henley",
  },
  "william-shakespeare": {
    birth_year: 1564,
    death_year: 1616,
    bio: "English playwright and poet whose sonnets and dramatic works are foundational in world literature.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/William_Shakespeare",
  },
  "william-wordsworth": {
    birth_year: 1770,
    death_year: 1850,
    bio: "English Romantic poet, co-founder of Lyrical Ballads, known for meditative nature poetry such as 'Tintern Abbey'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/William_Wordsworth",
  },
};
