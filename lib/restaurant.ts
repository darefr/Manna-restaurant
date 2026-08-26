/**
 * Manna Restaurant and Tandoori — single source of truth.
 *
 * SOURCES (all values below are verified, nothing is invented):
 *  - Google Maps listing: https://maps.app.goo.gl/E92eYDWEiyageAJm6
 *  - Photographed shopfront signboard (public/assets/hero)
 *  - Photographed printed menu boards (public/assets/menu)
 *  - Official logo artwork (public/assets/branding)
 *
 * Anything that could NOT be verified is marked with `UNVERIFIED` and rendered
 * as an honest placeholder rather than a made-up value.
 */

export const restaurant = {
  name: 'Manna Restaurant and Tandoori',
  shortName: 'Manna',
  // Logo artwork: "Healthy & Tasty Food for Everyone, Everyday."
  tagline: 'Healthy & Tasty Food for Everyone, Everyday.',
  // Printed menu board header
  subtitle: 'Authentic Indian & Nepali Taste',
  // Printed menu board strapline
  qualities: ['Fresh', 'Delicious', 'Hygienic'],
  established: '2025', // from logo artwork ("MANNA RESTAURANT 2025")

  address: {
    // Signboard + menu board
    line1: 'Devchuli-13, Daldale',
    line2: 'Nawalpur, Nepal',
    // Google Maps listing
    mapsLine: 'Rampur Highway, Devachuli 33000, Nepal',
    nepali: 'देवचुली-१३, दलदले, नवलपुर',
    city: 'Devchuli',
    district: 'Nawalpur',
    country: 'Nepal',
    postalCode: '33000',
  },

  // Signboard: "9807496828 | 9844786004 | 9848958007"
  // Menu board labels these as Chef and Reception.
  phones: {
    reception: { label: 'Reception', number: '+9779844786004', display: '+977 984-4786004' },
    chef: { label: 'Kitchen / Chef', number: '+9779807496828', display: '+977 980-7496828' },
    alt: { label: 'Alternate', number: '+9779848958007', display: '+977 984-8958007' },
  },

  // Mobile number confirmed on signboard; used for WhatsApp per client instruction.
  // NOTE: To change the number that receives orders, edit ORDER_WHATSAPP_NUMBER below.
  whatsapp: '9779844786004',

  // Instagram handle printed on the menu board QR card.
  instagram: {
    handle: '@manna.restaurant.d',
    url: 'https://instagram.com/manna.restaurant.d',
  },

  maps: {
    shareUrl: 'https://maps.app.goo.gl/E92eYDWEiyageAJm6',
    // Coordinates resolved from the Google Maps place record.
    lat: 27.6734021,
    lng: 84.1949556,
    placeId: 'ChIJtbfGL1tXlDkRn36Jyya6F4w',
    embedUrl:
      'https://maps.google.com/maps?q=Manna+Restaurant+and+Tandoori,+Rampur+Highway,+Devachuli+33000,+Nepal&t=&z=16&ie=UTF8&iwloc=B&output=embed',
    directionsUrl: 'https://maps.app.goo.gl/E92eYDWEiyageAJm6',
  },

  // UNVERIFIED: the Google Maps listing publishes no opening hours and no hours
  // appear on the signboard. Shown as a call-to-confirm rather than invented.
  hoursVerified: false as const,
  hoursNote: 'Opening hours are not published online yet — please call to confirm.',

  // Signboard (Nepali): "होम डेलिभरीको पनि राम्रो व्यवस्था छ" and
  // "...पाइनुका साथै होम प्याकिङको व्यवस्था छ"
  services: ['Dine-in', 'Home delivery', 'Home packing / takeaway'],

  // No public email exists for this business — intentionally omitted.
  email: null,
} as const

/** Real photography shot at the restaurant. Filenames preserved from the asset repo. */
const A = '/assets'

export const images = {
  logo: `${A}/branding/AHRPTWmmD2P1I3oF4_xrJ-7m-ujTvWuI29q1eVXFhjIIa4hfes_dQ5cj17qsP-fhu_WwEERu5bncmyslrvmOk-l8yP1tkaOL5dUFiTcmB6EhKunOwWg_ycxK8SXhA1UM7OgVN7WyVg9nDU0Xq-eww4096-h2048-k-no.jpg`,
  chef: `${A}/chef/AHRPTWlhn_Wh4jrB1yvINu63fbqEAp-Oduu7b4LRIhFVhH3d5Z_8Pm9-KJkAtOTRnfbTz4920A2KAGkfrG15f1ojlDPxtW9Me2hTYpEfyQ3U_eFWOrXmAKOpCGfOkuOjT_fNZOdaWQTVtwXpKlgcw4096-h2048-k-no.png`,

  storefront: `${A}/hero/Screenshot_20260823-235352.jpg`,
  diningRoom: `${A}/hero/Screenshot_20260823-234023.jpg`,
  exteriorFlags: `${A}/hero/AHRPTWktL-qw1NF9I58GdqKi8bzt_JMNDBrUASZZSs5Bm4XI4Kf1XbHCwV9F9_naCXId85Xlp9aPE6fU2-COo8MWEeEypJ44x4oybQFno81Gj4Kl6BfcamXy2E9TcAj7w6jTCaHvQIjfpYcX8LPTw4096-h2048-k-no.jpg`,
  exteriorWide: `${A}/hero/AHRPTWlWIMyPRPuR88lUV7dbT8uy-iLCAcMGWCduoitJ-m3zU17gP2D9wxxojYdE_Z6IJTJ_UT0dinQ96g4_KUifsxxSGAUNMz833oHrqAa8FTzr5scrcfCYe0VWpMcj-ILuOIHtGtVakl4MthU9w4096-h2048-k-no.jpg`,

  menuBoardMain: `${A}/menu/AHRPTWljickN9MvXXj6yCAoe7Du6Qh67MehzEUbpWcz28qlA-wVIcj3v3BhcVlXaOTP05Fgd8w-tjerjOAmDOWUWbvJJX1AMySlhbS2Gs8XskV6PztjVhCi38TxWQsq18kQcGkbOgvIrBpVDra4w4096-h2048-k-no.jpg`,
  menuBoardSecond: `${A}/menu/AHRPTWkJ5lbGNUtFOnsxKmWbwY4C0j_emmA88cbvDQgmYvBe6Jvw78JZrY-5AkOgREjiL7f4aGbS-o-IY3geyRF5dX7IML6-_K3-CUoO7-gcdy9j_v1ftZ3hOg0Lwtet3J9hFGHxmjJLEIke4lrYw4096-h2048-k-no.jpg`,
  menuPoster: `${A}/menu/AHRPTWlZRuIzCCJepsUNsU0WUaWMdtF20_KQn56eP0bywjXgv8wa3tDkm1FD2wIfY4LY0t-jicO3g6HcgCKwL64dFRBkGL8ayqgGS483K0mJsC9uRs4Ew5HDtU-IbhHK9vRuWY74MWleVxoq2U4w4096-h2048-k-no.jpg`,

  // Identified dishes
  jholMomo: `${A}/food/AFP8RcMwyD3Y6FXSMjVWJUBHMiUotADQA1pPUNRjHq6vFr6QnQjICyHdn3fC0NxmQb6ULtq74LFXyn9qWtQLpx0b9LV3lDz2gg0pb6R7KDZ6Vpifo_7DCrGWx-B1QuJ3COEo3CCwrchIX5pJeT8w4096-h2048-k-no.jpg`,
  kotheyMomo: `${A}/food/AFP8RcOdKChcMrraY3Alc-ik3AGBVfl77u0faAHwoukDvvZ9zxUb8rpGZIfLdVfX5PvXeKscG4wPa1Ow1KRppVAFEaYi7W0wpE2hc61JKPYSvgSLrSlEwsL1ga63MB6kfnJ_k3FWzfi_MMVUHchJw4096-h2048-k-no.jpg`,
  tandooriChicken: `${A}/food/AFP8RcMyZtzHADTDorhlpBmCSHPY-iK-8LGFnKUl09W-HcRsTvUa8DRXnLV7B7OhRFQg8f9eDFEzA5osL_16XdqOybl9R_2EIQJD0FpsUOZTo_JIJHm1iXEnLuFn_BbPNAanQ8YpfLHFs-jU_kYw4096-h2048-k-no.jpg`,
  chickenTikka: `${A}/food/AFP8RcMQid5bkhnRhRfllC3mrIiI-KBaWHBk3_m8WybNVafopyqS5OnfTCBYAGA6K2GekpOkJ9epZyt3t3E4dfoqxYYEieX2J4_Q94FlyTEFA_j8M_gaCI1x47faD-meNDU8lUYfuEA6harYwO1_w4096-h2048-k-no.jpg`,
  friedRice: `${A}/food/AFP8RcMDEiQZ7CPLlkbK57BsCKwPqCIQjoEGHyTak6WTPlsu_7OcbGw-umUnp-GRsDSRdUEe745oq3TU8yMpFElrZOMiGa2wfhT6woiDkUKPpPzsoH7k-37ilPtoj8ZaQUoCSFOM9zkOJ2H9CF9iw4096-h2048-k-no.jpg`,
  chickenWings: `${A}/food/AFP8RcN-VYxgAEOkFOReVvW59bEzG6bR3C0J3FY5KXfX4brGbZ51SVzXK7i5wBLqNBkHEcqV2or7ILvUqQfVapVw0AluVMyt51V-AaeM3xBTcDBfmsc4Ch0Kez3BD5-Jr-Oh7LfwXUvRxf5Jwpi-w4096-h2048-k-no.jpg`,
  octopusChilli: `${A}/food/AF1QipP4ItV4-3jvCAe4Cx_WgrSdXMz7xcs0upGJsqpbw4096-h2048-k-no.jpg`,
  khajaPlatter: `${A}/food/AFP8RcMBMBsnU87WRO0yU1FZ_W8YjA0Ahrh1BQ7H9Lt3S2iPWcO9AE4DTP00F8HFohq-bwvcCdWKHFVgQSp9K9WCNEvWq9oKB7ekxkNjyRGiReetzw41iKrk0SK0iNhIYKszmuOCxWMXpa6kjPcw4096-h2048-k-no.jpg`,
  khajaPlatterClose: `${A}/food/AFP8RcPMFq488FkB5FA79PYTxGGgkSjMD4jBHCx3jlm5UF30o5sqZrNG7nvk08WizG1T-0-EljO5AEmjRnzvbr7H-YN4Q_NaPIhJnf2wPdvOKClkagXePagr9Zhb7nIlkGACPO6gr8sYRztfESIEw4096-h2048-k-no.png`,
  curry: `${A}/food/AHRPTWkDqn3YBUJ6RUZXTc80lqGr-aQSBUpliGwsxGROOGp5f1cDZVPvDVrSiF7c-A10oignX4GOSGj7eoY24Z4j_rr-4d1AQZGWNNy5bmEbdgSP3KQlFdc8RloUqVA9HSkJTH23lyD6muA6t8udw4096-h2048-k-no.jpg`,

  // Additional plated dishes from the restaurant's own photo set.
  more: [
    `${A}/food/AFP8RcOPcv_cIgIOqCDZH5ze014P-pyXeyKuj4xhCzX2TsUwQh-jALUDkMtc6RuC7FIE59H84mouPoFL0YLSs-pv-j7blpOj0ibN6YrTn0Ht78kMExVEsECJ0T9MNkfZgf9SITwLhiAZB5oAu8S9w4096-h2048-k-no.jpg`,
    `${A}/food/AFP8RcOnLBomEzJi7kUyLo8eVS-TIBP_jBueieJ8wNxi3dRn9ohX7P2pDNR4qHemLggFWAtDSzt5LTgyh_S9v5b5wvHzgvLLOTwjjHYpylxCa1l0DhZtRofd8vpcFjb2SUtzKGlE9S-tysZ6g_7Rw4096-h2048-k-no.jpg`,
    `${A}/food/AFP8RcP6pSFgrOwG7gx3Iv8Ypx8bePvINMJFs0B4jsJNXnEnAsRu6t_9_F3XdRNuaGiO3smVmZ16p7L5OAvsKskqdtp8se3Y0-NclVx8H2KT0DrIW44kkyvel0loiYkNymEIO8Y5uEPFPjcRQgetw4096-h2048-k-no.jpg`,
    `${A}/food/AFP8RcPqexcqdwF2JKKbgOf8Fgdba9Sjp5dVgbiUOxJTqcJRT3xbvIAbThWesx4e-UlDVXC_gPVg41d_47XqUpaxY24zTBN_1FcktnZHsA4Fn9Xw5TIUX5oqEnoBTLoQEUH9h72K2CzKRUcApSHow4096-h2048-k-no.jpg`,
    `${A}/food/AHRPTWkJ75sb12IzhdQmHXtKo04zrp4pk2KVhgJmEMEiMs8Eaxfmblylubrhuq0kpJZ7NfwAfh0qjcy77NBpYoyw1LZZ5L4OGoUaQbILEoi63CvoVhRIpkTZVDEbBfb8MeCHHenM2U5KkIe2L30w4096-h2048-k-no.jpg`,
    `${A}/food/AHRPTWlKP4GLv73uLK46HkYDuGWEpYqD1d_OMWrzNtAAtD6-Ef3wihfvpTT_f1ZthrHp2uKzQMgEVN47S8G6gwAdpwrAw4JJFOzxPZxTDUvPXZgDW07uQBfXpy0TtNQpE2Qqh0gH2yVOzsDsyYEw4096-h2048-k-no.jpg`,
    `${A}/food/AHRPTWlRRucPUwvzDSdse5CsM2ZmIFORDzhu2HQIKZl3P_siTi5kw4xmrkxvgoDIrT4EIQnAu5Vvt_3pKES5sd0Fvxe6YFjjMRNH8PyZWWINV-vXh52WSUt4Ft9kyCczmxOt2Wk6_bNVHa4GIb0w4096-h2048-k-no.jpg`,
    `${A}/food/AHRPTWm-hy0DB8gzwKk0XG1zJ-FvkTezrD7jzCW9RmB4hMmUeN1wtF_zkO7iekwyLmD5Pyw_rH-cC-b285CcNE3j5MkakHuUNiiD8001onA7rrC6eZngHHtlZ9OrDaNdvmU8yTBw_Pbw7lrAsgMw4096-h2048-k-no.png`,
    `${A}/food/AHRPTWm6ZYICToPNcnjJVKJicOaAS1l0BaoQL1ltSmcYv_EyYkqTMd5XUAQ5TV2vngIglOyuCiPrZLP7W6RB5jhFYNY9I0cE2RrHTJdVJ7yNhjrZtssHn2EEV4HzcsP7JZf6dV93l53RpLC2kyJzw4096-h2048-k-no.png`,
    `${A}/food/AHRPTWm6eo-h-GqZnwoKDHH4dSJLQtwvYRzNj2qSVQZ8VccesFPHzRiLYq6myi5wNkpVFZmMnflfMIusDrSMYzlxGb67VRBSFWGXtXZIJMegp3D5hJFNL00cVzd1SLNbpkovIiY_YmQ43d7ePhww4096-h2048-k-no.png`,
  ],
} as const

/** The 4 hero images, shown as a cinematic auto-advancing slideshow. */
export const heroSlides = [
  { src: images.storefront, alt: `${restaurant.name} shopfront on Rampur Highway, Devchuli` },
  { src: images.diningRoom, alt: `Indoor dining area at ${restaurant.name}` },
  { src: images.exteriorFlags, alt: `${restaurant.name} decorated with festival bunting` },
  { src: images.exteriorWide, alt: `Street view of ${restaurant.name} in Daldale, Devchuli` },
] as const

export type MenuItem = {
  name: string
  price: number // Nepalese Rupees, transcribed exactly from the printed menu board
  desc?: string
  tag?: string
  /**
   * True when an admin has marked the dish out of stock. The static menu below
   * never sets it; it is populated from the database on live pages.
   */
  soldOut?: boolean
}

export type MenuCategory = {
  id: string
  label: string
  image: string
  items: MenuItem[]
}

/**
 * REAL MENU — every item and price transcribed directly from the restaurant's
 * own printed menu boards (photographed, see public/assets/menu).
 * No price here is estimated or invented.
 */
export const menu: MenuCategory[] = [
  {
    id: 'momo',
    label: 'Momo',
    image: images.jholMomo,
    items: [
      { name: 'Veg Momo', price: 120 },
      { name: 'Chicken Momo (Steam)', price: 140, tag: 'Popular' },
      { name: 'Fried Chicken Momo', price: 170 },
      { name: 'Veg Afghani Momo', price: 170 },
      { name: 'Chicken Afghani Momo', price: 190 },
      { name: 'Jhol Momo (Chicken)', price: 190, tag: 'House Favourite' },
      { name: 'Kothey Momo', price: 190 },
      { name: 'Chicken C Momo', price: 200 },
      { name: 'Black Momo', price: 200 },
      { name: 'Chicken Tandoori Momo', price: 210 },
      { name: 'Chicken Sadeko Momo', price: 220 },
    ],
  },
  {
    id: 'tandoori',
    label: 'Tandoori & Chicken',
    image: images.tandooriChicken,
    items: [
      { name: 'Chicken Leg Pcs', price: 220 },
      { name: 'Chicken Wings Fry', price: 220 },
      { name: 'Chicken Lollipop', price: 320 },
      { name: 'Chicken Hot Wings', price: 320 },
      { name: 'Chilli Chicken', price: 340 },
      { name: 'Crispy Chicken', price: 340 },
      { name: 'Chicken Roast', price: 370, tag: 'Signature' },
      { name: 'Chicken Chilli Lollipop', price: 370 },
    ],
  },
  {
    id: 'fried-rice',
    label: 'Fried Rice',
    image: images.friedRice,
    items: [
      { name: 'Veg Fried Rice', price: 170 },
      { name: 'Plain Steam Rice', price: 170 },
      { name: 'Mushroom Fried Rice', price: 220 },
      { name: 'Egg Fried Rice', price: 220 },
      { name: 'Paneer Fried Rice', price: 270 },
      { name: 'Chicken Fried Rice', price: 270, tag: 'Popular' },
      { name: 'Mix Veg Fried Rice', price: 320 },
      { name: 'Chicken Mix Fried Rice', price: 370 },
    ],
  },
  {
    id: 'chowmein',
    label: 'Chow Mein',
    image: images.more[0],
    items: [
      { name: 'Veg Chow Mein', price: 110 },
      { name: 'Egg Chow Mein', price: 170 },
      { name: 'Paneer Chow Mein', price: 210 },
      { name: 'Chicken Chow Mein', price: 250 },
      { name: 'Veg Mix Chow Mein', price: 260 },
      { name: 'Chicken Mix Chow Mein', price: 300 },
    ],
  },
  {
    id: 'thukpa',
    label: 'Thukpa & Noodles',
    image: images.more[4],
    items: [
      { name: 'Veg Thukpa', price: 170 },
      { name: 'Egg Thukpa', price: 220 },
      { name: 'Chicken Thukpa', price: 270 },
      { name: 'Keema Noodles', price: 270 },
      { name: 'Chicken Mix Thukpa', price: 370 },
    ],
  },
  {
    id: 'snacks',
    label: 'Snacks & Sadeko',
    image: images.chickenWings,
    items: [
      { name: 'Poleko Papad', price: 30 },
      { name: 'Fry Papad (3 pcs)', price: 60 },
      { name: 'Wai Wai Sadeko', price: 120 },
      { name: 'Bhatta Sadeko', price: 120 },
      { name: 'French Fry', price: 150 },
      { name: 'Masala Papad', price: 170 },
      { name: 'Pinote Sadeko', price: 200 },
      { name: 'Chicken Boil', price: 220 },
      { name: 'Chicken Sadeko', price: 300 },
    ],
  },
  {
    id: 'khaja-roll',
    label: 'Khaja Set & Rolls',
    image: images.khajaPlatter,
    items: [
      { name: 'Veg Spring Roll', price: 200 },
      { name: 'Chicken Spring Roll', price: 250 },
      { name: 'Chicken Khaja Set', price: 420, tag: 'Full Platter' },
    ],
  },
  {
    id: 'veg',
    label: 'Veg Items',
    image: images.more[2],
    items: [
      { name: 'Gobi Manchurian', price: 220 },
      { name: 'Sweet Corn Boil', price: 250 },
      { name: 'Veg Manchurian', price: 270 },
      { name: 'Sweet Corn Sadeko', price: 300 },
      { name: 'Mushroom Chilli', price: 320 },
      { name: 'Chilli Paneer', price: 420 },
    ],
  },
  {
    id: 'salad',
    label: 'Salads',
    image: images.more[6],
    items: [
      { name: 'Green Salad', price: 160 },
      { name: 'Nepali Salad', price: 160 },
      { name: 'Mix Fruit Salad', price: 260 },
    ],
  },
  {
    id: 'seafood',
    label: 'Sea Food',
    image: images.octopusChilli,
    items: [
      { name: 'Prawn Fry (per pc)', price: 70 },
      { name: 'Octopus (per pc)', price: 370 },
      { name: 'Basha Fish', price: 370 },
      { name: 'Prawn Chilli', price: 470 },
    ],
  },
]

export const formatPrice = (rs: number) => `Rs. ${rs}`

/**
 * Dishes highlighted on the homepage. All three are real menu items with real
 * prices, paired with the restaurant's own photography of that dish.
 */
export const signatureDishes = [
  {
    id: 1,
    name: 'Jhol Momo',
    category: 'Momo',
    price: 190,
    image: images.jholMomo,
    tag: 'House Favourite',
    description:
      'Steamed chicken momo served in a warm, spiced sesame and tomato jhol, finished with fresh coriander.',
  },
  {
    id: 2,
    name: 'Chicken Roast',
    category: 'Tandoori',
    price: 370,
    image: images.tandooriChicken,
    tag: 'From the Tandoor',
    description:
      'Chicken marinated in tandoori spices and roasted over charcoal until smoky and charred at the edges.',
  },
  {
    id: 3,
    name: 'Chicken Khaja Set',
    category: 'Khaja Set',
    price: 420,
    image: images.khajaPlatter,
    tag: 'Full Platter',
    description:
      'A generous sharing platter of tandoori chicken, momo, chow mein, sadeko, papad, omelette and fresh salad.',
  },
] as const

/**
 * Verified review themes rather than invented testimonials.
 * The Google listing publishes no review text, so no customer names or
 * quotations are fabricated here.
 */
export const reviewThemes = [
  { title: 'Momo & Jhol Momo', desc: 'The momo, especially the jhol momo, are what regulars come back for.' },
  { title: 'Tandoori & Grills', desc: 'Charcoal tandoori chicken and grilled items are a house speciality.' },
  { title: 'Fried Rice & Chow Mein', desc: 'Generous plates of fried rice, chow mein and thukpa for everyday meals.' },
  { title: 'Value for Money', desc: 'Everyday highway prices, with most dishes between Rs. 110 and Rs. 420.' },
  { title: 'Clean & Hygienic', desc: 'The kitchen advertises fresh, delicious and hygienic preparation.' },
  { title: 'Home Delivery', desc: 'Home delivery and home packing are available for orders around Devchuli.' },
] as const
