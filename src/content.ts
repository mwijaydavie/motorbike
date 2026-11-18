export type Language = 'en' | 'sw';
export type LocalText = { en: string; sw: string };
export const text = (en: string, sw: string): LocalText => ({ en, sw });

export const instagram = 'https://www.instagram.com/pikipikialtraware/';
export const directMessage = 'https://ig.me/m/pikipikialtraware';
export const reel = 'https://www.instagram.com/p/DfCX47dOOvZ/';
export const directions = 'https://www.google.com/maps/search/?api=1&query=Kigamboni%2C+Dar+es+Salaam%2C+Tanzania';
export const maker = 'https://gzfenghaomotor.com/about-fenghao/';
export const maker200 = 'https://fenghaomotor.en.made-in-china.com/product/MtbYOnxlhSkV/China-Fenghao-200cc-off-Road-Motorcycle-with-Powerful-LED-Headlights.html';

export const categories = {
  all: text('All bikes', 'Pikipiki zote'),
  street: text('Street', 'Mjini'),
  adventure: text('Adventure', 'Safari'),
  utility: text('Utility', 'Kazi'),
  other: text('More models', 'Modeli nyingine'),
};
export type Category = keyof typeof categories;

export interface Bike {
  id: string;
  brand?: string;
  name: string;
  number: string;
  cc: LocalText;
  category: Exclude<Category, 'all'>;
  image?: string;
  imageType?: 'reference' | 'maker';
  source: string;
  referenceSource?: string;
  price?: string;
  registration?: boolean;
  detail: LocalText;
}

export const bikes: Bike[] = [
  {
    id: 'fh-125-xpress', brand: 'Fenghao', name: 'FH 125 Xpress', number: '125',
    cc: text('125 class', 'Daraja la 125'), category: 'street',
    image: '/media/fenghao-125.webp', imageType: 'reference', source: reel,
    referenceSource: 'https://fenghaomotor.en.made-in-china.com/product/UQHplPRbJDkN/China-Fenghao-125cc-Adult-Motorbikes-Scooters-Gasoline-Gas-Fuel-Systems-125cc-Motorcycle.html',
    detail: text('A Fenghao model featured by Pikipiki Altraware. A good place to start if you’re shopping for a bike for your daily trips around town. Watch our reel for a look at the Xpress.', 'Modeli ya Fenghao iliyoonyeshwa na Pikipiki Altraware. Kama unatafuta pikipiki ya safari zako za kila siku mjini, anza hapa. Tazama reel yetu kuiona Xpress.'),
  },
  {
    id: 'fh-200-10', brand: 'Fenghao', name: 'FH-200-10', number: '200',
    cc: text('200 class', 'Daraja la 200'), category: 'adventure',
    image: '/media/fenghao-200-silver.webp', imageType: 'reference',
    source: 'https://www.instagram.com/p/Dfh0q--jtRo/', referenceSource: maker200,
    detail: text('Featured by Pikipiki Altraware for hilly routes and longer trips. See the original post for photos of the FH-200-10 and contact us for current specs and availability.', 'Pikipiki Altraware imeionyesha kwa barabara za milimani na safari ndefu. Tazama chapisho la awali kuona picha za FH-200-10, kisha tuulize kuhusu vipimo na upatikanaji.'),
  },
  {
    id: 'fh150-7', brand: 'Fenghao', name: 'FH150-7', number: '150',
    cc: text('150 class', 'Daraja la 150'), category: 'utility',
    image: '/media/fenghao-fh150-7.webp', imageType: 'maker',
    source: 'https://gzfenghaomotor.com/products-_17/1154.html',
    detail: text('A work-bike design from the Fenghao manufacturer catalogue, shown here as a preview. Ask about the engine version and whether we can source it for you.', 'Pikipiki ya kazi kutoka kwenye katalogi ya mtengenezaji Fenghao, imeonyeshwa hapa kama mfano. Tuulize kuhusu toleo la injini na kama tunaweza kukutafutia.'),
  },
  {
    id: 'motorcycle-180', name: '180 cc Motorcycle', number: '180',
    cc: text('180 cc', 'cc 180'), category: 'other',
    source: 'https://www.instagram.com/p/Dfy1LA3OdPL/', price: 'TSh 2,800,000', registration: true,
    detail: text('Posted by Pikipiki Altraware with registration noted on 16 November 2026. The price below is from that post; confirm the current price and stock with us.', 'Ilichapishwa na Pikipiki Altraware tarehe 16 Novemba 2026, huku usajili ukitajwa. Bei iliyo hapa ni ya chapisho hilo; tuulize kuthibitisha bei ya sasa na upatikanaji.'),
  },
  {
    id: 'wanhoo-250', brand: 'Wanhoo', name: 'Wanhoo 250', number: '250',
    cc: text('250 cc', 'cc 250'), category: 'other',
    source: 'https://www.instagram.com/p/Dfy2oVpDoyP/', registration: true,
    detail: text('A 250 cc listing from Pikipiki Altraware with registration mentioned. Open the original post for photos or ask us for the current price and details.', 'Tangazo la pikipiki ya cc 250 kutoka Pikipiki Altraware, lenye maelezo ya usajili. Fungua chapisho la awali kuona picha au tuulize kuhusu bei na taarifa za sasa.'),
  },
];

export const parts = [
  { id: 'engine', label: text('Engine & service', 'Injini na matengenezo'), examples: text('Cylinder kits, filters & spark plugs', 'Silinda, vichujio na plagi') },
  { id: 'drive', label: text('Chains & sprockets', 'Minyororo na sproketi'), examples: text('Drive chains & sprocket kits', 'Minyororo na seti za sproketi') },
  { id: 'brakes', label: text('Brakes & suspension', 'Breki na suspension'), examples: text('Brake pads, shoes & shocks', 'Pedi, viatu vya breki na shock absorber') },
  { id: 'electric', label: text('Electrical & lighting', 'Umeme na taa'), examples: text('Headlights, indicators & switches', 'Taa za mbele, indicator na swichi') },
] as const;

export const details = [
  { id: 'engine', x: 62, y: 63, label: text('The engine', 'Injini'), detail: text('The FH200-19 uses a four-stroke engine. This is the red 200-series variant pictured in the Fenghao supplier catalogue.', 'FH200-19 ina injini ya mikupuo minne. Hili ni toleo jekundu la mfululizo wa 200 lililoonyeshwa kwenye katalogi ya Fenghao.') },
  { id: 'lamp', x: 78, y: 33, label: text('The headlight', 'Taa ya mbele'), detail: text('Fenghao lists an LED headlight on this model, tucked behind the angular front fairing.', 'Fenghao inataja taa ya LED kwenye modeli hii, iliyo ndani ya kava ya mbele.') },
  { id: 'brake', x: 86, y: 78, label: text('The front brake', 'Breki ya mbele'), detail: text('Look through the front wheel’s spokes to see the disc brake shown on the manufacturer’s side view.', 'Angalia katikati ya spoki za gurudumu la mbele kuona breki ya diski kwenye picha ya mtengenezaji.') },
] as const;