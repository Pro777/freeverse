export type AuthorInfo = {
  birth_year: number;
  death_year: number;
  bio: string;
  source_label: string;
  source_url: string;
};

function formatHistoricalYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : `${year}`;
}

function ordinal(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export function formatAuthorYears(birthYear: number, deathYear: number): string {
  return `${formatHistoricalYear(birthYear)}–${formatHistoricalYear(deathYear)}`;
}

export function formatCenturyLabel(century: number): string {
  if (century < 0) return `${ordinal(Math.abs(century))} century BC`;
  return `${ordinal(century)} century`;
}

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
  "gerard-de-nerval": {
    birth_year: 1808,
    death_year: 1855,
    bio: "French poet, translator, and prose writer associated with early Romanticism and later Symbolist influence, remembered for the sonnet sequence 'Les Chimères'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/G%C3%A9rard_de_Nerval",
  },
  "paul-verlaine": {
    birth_year: 1844,
    death_year: 1896,
    bio: "French Symbolist poet whose musical, suggestive lyrics helped define fin-de-siecle verse and influenced modern poetry across Europe.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Paul_Verlaine",
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
  catullus: {
    birth_year: -84,
    death_year: -54,
    bio: "Roman lyric poet whose brief, intensely personal poems on love, betrayal, friendship, and invective shaped later European lyric.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Catullus",
  },
  sappho: {
    birth_year: -630,
    death_year: -570,
    bio: "Archaic Greek lyric poet from Lesbos, famed for fragments on desire, devotion, and intimate speech that became foundational for lyric tradition.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Sappho",
  },
  "john-keats": {
    birth_year: 1795,
    death_year: 1821,
    bio: "English Romantic poet whose odes and sonnets, including 'To Autumn' and 'Ode to a Nightingale', are central to English lyric poetry.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/John_Keats",
  },
  "john-donne": {
    birth_year: 1572,
    death_year: 1631,
    bio: "English poet, preacher, and leading metaphysical writer, known for intellectually charged lyrics such as 'A Valediction: Forbidding Mourning' and the Holy Sonnets.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/John_Donne",
  },
  "john-milton": {
    birth_year: 1608,
    death_year: 1674,
    bio: "English poet and polemicist, author of 'Paradise Lost' and major works of early modern English literature.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/John_Milton",
  },
  "jose-marti": {
    birth_year: 1853,
    death_year: 1895,
    bio: "Cuban poet, essayist, and independence activist whose 'Versos sencillos' joined intimate lyric with civic urgency and became central to modern Spanish-language literature.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Jos%C3%A9_Mart%C3%AD",
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
  "arthur-rimbaud": {
    birth_year: 1854,
    death_year: 1891,
    bio: "French poet whose explosive early work reshaped modern lyric through visionary imagery, formal disruption, and radical compression.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Arthur_Rimbaud",
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
  "george-herbert": {
    birth_year: 1593,
    death_year: 1633,
    bio: "English poet and priest whose devotional lyrics in 'The Temple' combine metaphysical wit with compressed spiritual reflection.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/George_Herbert",
  },
  "andrew-marvell": {
    birth_year: 1621,
    death_year: 1678,
    bio: "English poet and statesman associated with metaphysical and political verse, remembered for 'To His Coy Mistress' and other agile, argument-driven lyrics.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Andrew_Marvell",
  },
  "charlotte-bronte": {
    birth_year: 1816,
    death_year: 1855,
    bio: "English novelist and poet, eldest of the Bronte sisters, whose poetry and fiction combine emotional intensity with moral and psychological drama.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Charlotte_Bront%C3%AB",
  },
  "emily-bronte": {
    birth_year: 1818,
    death_year: 1848,
    bio: "English poet and novelist of the Bronte family whose lyrics are known for moorland solitude, visionary force, and spiritual defiance.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Emily_Bront%C3%AB",
  },
  "anne-bronte": {
    birth_year: 1820,
    death_year: 1849,
    bio: "English novelist and poet, youngest of the Bronte sisters, whose verse joins religious seriousness with reflective domestic and moral themes.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Anne_Bront%C3%AB",
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
  "henry-wadsworth-longfellow": {
    birth_year: 1807,
    death_year: 1882,
    bio: "American poet of the Fireside School whose narrative and lyric poems, including 'Paul Revere's Ride' and 'The Song of Hiawatha', made him the most widely read American poet of the nineteenth century.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Henry_Wadsworth_Longfellow",
  },
  "oliver-wendell-holmes-sr": {
    birth_year: 1809,
    death_year: 1894,
    bio: "American poet, physician, and essayist of the Fireside School, best remembered for 'Old Ironsides' and 'The Chambered Nautilus'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Oliver_Wendell_Holmes_Sr.",
  },
  "james-russell-lowell": {
    birth_year: 1819,
    death_year: 1891,
    bio: "American Romantic poet, critic, and diplomat, known for 'The Vision of Sir Launfal' and his satirical verse in 'The Biglow Papers'.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/James_Russell_Lowell",
  },
  "john-greenleaf-whittier": {
    birth_year: 1807,
    death_year: 1892,
    bio: "American Quaker poet and abolitionist whose rural New England narratives, including 'Snow-Bound' and 'Barbara Frietchie', earned him wide popular acclaim.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/John_Greenleaf_Whittier",
  },
  "gustavo-adolfo-becquer": {
    birth_year: 1836,
    death_year: 1870,
    bio: "Spanish poet and writer whose posthumously collected 'Rimas' became a foundational lyric sequence for modern Spanish poetry.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Gustavo_Adolfo_B%C3%A9cquer",
  },
  "louise-labe": {
    birth_year: 1524,
    death_year: 1566,
    bio: "French Renaissance poet from Lyon celebrated for her elegies and sonnets of desire, absence, and emotional contradiction.",
    source_label: "Wikipedia",
    source_url: "https://en.wikipedia.org/wiki/Louise_Lab%C3%A9",
  },
};
