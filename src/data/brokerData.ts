import type { Broker, ComparisonRow } from '../types/broker/index';

export const brokers: Broker[] = [
  {
    id: 'degiro',
    name: 'DEGIRO',
    logo: '/lovable-uploads/f9bacf3b-7b11-4c31-917d-e16803dc0887.png',
    description: 'Populární evropský broker s nízkými poplatky a širokou nabídkou ETF. Ideální pro cost-conscious investory.',
    rating: 79,
    regulation: 'BaFin (DE), DNB/AFM (NL)',
    protection: '100 000 EUR (DE), 20 000 EUR (investice)',
    etfFee: '1 EUR (Core Selection), 3 EUR (ostatní ETF)',
    managementFee: '0 EUR (roční popl. za burzy 2,5 EUR)',
    fxFee: 'CZK/EUR zdarma, ostatní 0,25%',
    fractional: false,
    czSupport: true,
    czDividends: '35% (možnost vratky 20%)',
    minDeposit: '0 EUR',
    platforms: ['Web', 'Android', 'iOS'],
    markets: ['EU', 'US', 'Asia'],
    etfCount: '3000+',
    languages: ['čeština', 'angličtina', 'němčina'],
    customerSupport: '9-17 (pracovní dny)',
    specialFeatures: ['Core ETF selection', 'Dividend reinvestment', 'Tax reports'],
    pros: [
      'Core Selection ETF za 0 EUR (200+ fondů)',
      'Pouze 1 EUR manipulační poplatek',
      'Bezplatná konverze CZK/EUR',
      'Široká nabídka UCITS ETF',
      'Česká zákaznická podpora'
    ],
    cons: [
      'Omezení kvůli PRIIPS dokumentaci',
      'Nepodporuje frakční ETF',
      'Vyšší zdanění českých dividend'
    ]
  },
  {
    id: 'xtb',
    name: 'XTB',
    logo: '/lovable-uploads/a7162820-5478-4cd8-9bfd-fd04b80a42ff.png',
    description: 'Transparentní broker kótovaný na varšavské burze s českou licencí ČNB, bezplatnými ETF obchody a 24/7 podporou.',
    rating: 94,
    regulation: 'Licence ČNB (CZ), kótován na varšavské burze',
    protection: '100 000 EUR (EU)',
    etfFee: 'Investování do akcií a ETF bez komisí',
    managementFee: '0 EUR',
    fxFee: '0,5%',
    fractional: true,
    czSupport: true,
    czDividends: '35%',
    minDeposit: '0 EUR',
    platforms: ['xStation 5', 'Web', 'Android', 'iOS'],
    markets: ['EU', 'US', 'UK'],
    etfCount: '7 000+ akcií, 1 690 ETF',
    languages: ['čeština', 'polština', 'angličtina'],
    customerSupport: 'Česká podpora 24/7',
    specialFeatures: ['Frakční práva', 'Demo účet 200k Kč', 'Vzdělávací sekce', 'Rychlé vklady zdarma'],
    pros: [
      'Investování do akcií a ETF bez komisí',
      'Přes 7 000 akcií a 1 690 ETF',
      'Česká zákaznická podpora dostupná 24/7',
      'Moderní obchodní platforma xStation 5 zdarma',
      'Možnost XTB demo účtu s 200 000 Kč',
      'Frakční práva pro investice s malým kapitálem',
      'Rychlé vklady a výběry, většinou zdarma',
      'Transparentní broker kótovaný na varšavské burze',
      'Kvalitní vzdělávací sekce a webináře'
    ],
    cons: [
      'Nenabízí obchodování opcí a futures kontraktů',
      'České akcie mají vysoké zdanění dividend (35 %)',
      'Platforma může být pro nováčky zpočátku nepřehledná'
    ]
  },
  {
    id: 'fio',
    name: 'Fio e-Broker',
    logo: '/lovable-uploads/55aac89b-3834-421c-8689-34fb13fad2b1.png',
    description: 'Český broker s lokální podporou a optimálním zdaněním českých dividend (15%).',
    rating: 75,
    regulation: 'ČNB (CZ)',
    protection: '100 000 EUR (CZ)',
    etfFee: '0,29-0,35% (CZ), 0,79% (EU)',
    managementFee: '0 Kč',
    fxFee: 'Zdarma (dle kurzu banky)',
    fractional: false,
    czSupport: true,
    czDividends: '15%',
    minDeposit: '0 Kč',
    platforms: ['Web', 'Android', 'iOS'],
    markets: ['CZ', 'EU', 'US'],
    etfCount: '200+',
    languages: ['čeština'],
    customerSupport: '8-18 (pracovní dny)',
    specialFeatures: ['Czech dividend optimization', 'Free currency exchange', 'Local support'],
    pros: [
      'Česká společnost s lokální podporou',
      'Standardní 15% zdanění českých dividend',
      'Bezplatná konverze měn',
      'KID dokumentace v češtině'
    ],
    cons: [
      'Vyšší poplatky za ETF',
      'Technické problémy platformy',
      'Nepodporuje frakční ETF'
    ]
  },
  {
    id: 'trading212',
    name: 'Trading 212',
    logo: '/lovable-uploads/25c6d816-7993-40c3-abe2-e21c45cc239d.png',
    description: 'Zcela bezpoplatkový broker s moderní mobilní aplikací, frakčním investováním a AutoInvest funkcí.',
    rating: 87,
    regulation: 'FCA (UK), CySEC (EU pro CZ klienty)',
    protection: '100 000 EUR (německé banky), 20 000 EUR (ICF)',
    etfFee: '0%',
    managementFee: '0 EUR',
    fxFee: '0,15% (v aplikaci)',
    fractional: true,
    czSupport: false,
    czDividends: 'Standard (dle typu fondu)',
    minDeposit: '1 EUR',
    platforms: ['Web', 'Android', 'iOS'],
    markets: ['EU', 'US', 'UK'],
    etfCount: '1 400+ ETF, 11 000+ akcií',
    languages: ['angličtina'],
    customerSupport: '24/7 (chat)',
    specialFeatures: ['Pie charts investing', 'Commission-free', 'AutoInvest'],
    pros: [
      'Zcela bezplatné obchodování',
      'Frakční investování od 1 £',
      'Intuitivní mobilní aplikace',
      'Automatizované investování (Pies)'
    ],
    cons: [
      'Omezená česká podpora',
      'Méně pokročilých analytických nástrojů',
      'Závislost na mobilní aplikaci'
    ]
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    logo: '/lovable-uploads/4465126c-b9d7-4fc5-b560-477d3425500d.png',
    description: 'Americká brokerská společnost založená v roce 1977 s 2,7+ miliony účtů. Profesionální řešení pro zkušené investory.',
    rating: 85,
    regulation: 'CBI (IE pro CZ klienty), SEC (US)',
    protection: '20 000 EUR (ICF), 500 000 USD (SIPC)',
    etfFee: '$0.005/akcii (min. $1)',
    managementFee: '0 EUR (zrušen od 2021)',
    fxFee: '0,002% (min. $2)',
    fractional: true,
    czSupport: false,
    czDividends: '35%',
    minDeposit: '0 USD',
    platforms: ['TWS', 'Web', 'Android', 'iOS', 'Desktop'],
    markets: ['Global - 86 burz'],
    etfCount: '14 000+ akcií a ETF celkem',
    languages: ['angličtina', 'němčina', 'francouzština'],
    customerSupport: '24/7',
    specialFeatures: ['Advanced analytics', 'Global markets', 'Professional tools'],
    pros: [
      'Rozsahlý globální přístup (86 burz)',
      'Nízké obchodní náklady',
      '14 000+ akcií a ETF k obchodování',
      'Frakční obchodování a žádný min. vklad'
    ],
    cons: [
      'Komplexní rozhraní pro začátečníky',
      'Bez MetaTrader podpory',
      'Bez české jazykové podpory'
    ]
  },
  {
    id: 'portu',
    name: 'Portu',
    logo: '/portu-logo.svg',
    description: 'Česká automatizovaná investiční platforma zřízená v roce 2017. Ideální pro menší a nezažitené investory.',
    rating: 98,
    regulation: 'ČNB (CZ)',
    protection: '100 000 EUR (CZ)',
    etfFee: '0,24-1% ročně (dle částky)',
    managementFee: '0,47-1% ročně (bez vstupních poplatků)',
    fxFee: 'Zahrnut v poplatku',
    fractional: true,
    czSupport: true,
    czDividends: '15%',
    minDeposit: '500 Kč',
    platforms: ['Web', 'Android', 'iOS'],
    markets: ['ETF', 'Akcie', 'Krypto', 'české akcie'],
    etfCount: 'ETF portfolia, jednotlivé akcie, krypto',
    languages: ['čeština'],
    customerSupport: '9-17 (pracovní dny)',
    specialFeatures: ['Robo-advisor', 'Investiční rezerva', 'Dětské účty', 'Krypto portfolia'],
    pros: [
      'Velmi uživatelský přístup',
      'Nízké poplatky (0,24-1% ročně)',
      'Nízký minimální vklad (500 Kč)',
      'Automatická správa portfolia',
      'Flexibilní investování'
    ],
    cons: [
      'Omezený výběr akcií',
      'Nižší potenciální výnosy než aktivní obchodování',
      'Není ideální pro zkušené investory',
      'Bez aktivního obchodování'
    ]
  }
];

export const comparisonData: ComparisonRow[] = [
  { feature: 'Regulace (hlavní)', degiro: 'BaFin (DE), DNB/AFM (NL)', xtb: 'Licence ČNB (CZ), varšavská burza', fio: 'ČNB (CZ)', trading212: 'FCA (UK), CySEC (EU pro CZ klienty)', ibkr: 'CBI (IE), SEC (US)', portu: 'ČNB (CZ)' },
  { feature: 'Ochrana hotovosti', degiro: '100 000 EUR (DE)', xtb: '100 000 EUR (EU)', fio: '100 000 EUR (CZ)', trading212: '85 000 £ (UK)', ibkr: '500 000 USD (SIPC), 20 000 EUR (ICF)', portu: '100 000 EUR (CZ)' },
  { feature: 'Poplatek nákup ETF', degiro: '1 EUR (Core Selection), 3 EUR (ostatní ETF)', xtb: '0% bez komisí', fio: '0,29-0,35% (CZ), 0,79% (EU)', trading212: '0% (bez limitu)', ibkr: '$0.005/akcii (min. $1)', portu: '0,24-1% ročně (dle částky)' },
  { feature: 'Konverze měn', degiro: 'CZK/EUR zdarma, ostatní 0,25%', xtb: '0,5%', fio: 'Zdarma (dle kurzu banky)', trading212: '0,15%', ibkr: '0,2% (min. 2 EUR)', portu: 'Zahrnut v poplatku' },
  { feature: 'Frakční ETF', degiro: 'Ne', xtb: 'Ano', fio: 'Ne', trading212: 'Ano (od 1 EUR)', ibkr: 'Ano', portu: 'Ano (automaticky)' },
  { feature: 'Česká podpora', degiro: 'Částečně', xtb: 'Ano (24/7)', fio: 'Ano (8-18)', trading212: 'Ne (pouze AJ)', ibkr: 'Ne', portu: 'Ano (9-17)' },
  { feature: 'Zdanění CZ dividend', degiro: '35% (vratka možná)', xtb: '35%', fio: '15%', trading212: 'Nevztahuje se', ibkr: '15%', portu: '15%' },
  { feature: 'AutoInvest/DCA', degiro: 'Ne', xtb: 'Investiční plány', fio: 'Ne', trading212: 'Pies & AutoInvest', ibkr: 'Omezené', portu: 'Plně automatické' },
  { feature: 'Min. vklad', degiro: '0 EUR', xtb: '0 EUR', fio: '0 Kč', trading212: '1 EUR', ibkr: '0 USD', portu: '500 Kč' }
];