import { Product, Category, NewsArticle } from './types';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Тормозные колодки',
    // FIX: Changed 'category' to 'categoryId' and used the category ID.
    categoryId: 'brakes',
    price: 4500.00,
    imageUrl: 'https://images.unsplash.com/photo-1581347997921-213c51088f11?q=80&w=400&auto=format&fit=crop',
    description: 'Высокопроизводительные керамические тормозные колодки для любых погодных условий.',
    sku: 'BP-CER-001',
    brand: 'Brembo',
    inStock: true,
    analogs: ['TRW-GDB1550', 'ATE-13.0460-7186.2'],
  },
  {
    id: 2,
    name: 'Масляный фильтр',
    // FIX: Changed 'category' to 'categoryId' and used the category ID.
    categoryId: 'filters',
    price: 850.50,
    imageUrl: 'https://images.unsplash.com/photo-1615494488581-2af1185b98a7?q=80&w=400&auto=format&fit=crop',
    description: 'Премиальный масляный фильтр с улучшенным синтетическим фильтрующим элементом.',
    sku: 'OF-SYN-002',
    brand: 'Mann-Filter',
    inStock: true,
    analogs: ['BOSCH-F026407022', 'MAHLE-OC205'],
  },
  {
    id: 3,
    name: 'Свечи зажигания (4 шт.)',
    // FIX: Changed 'category' to 'categoryId' and used the category ID.
    categoryId: 'engine',
    price: 1800.00,
    imageUrl: 'https://images.unsplash.com/photo-1617154256828-b7c191307613?q=80&w=400&auto=format&fit=crop',
    description: 'Иридиевые свечи зажигания для максимальной эффективности и долговечности двигателя.',
    sku: 'SP-IRD-003',
    brand: 'NGK',
    inStock: false,
    analogs: ['DENSO-IK20', 'BOSCH-FR7KI332S'],
  },
  {
    id: 4,
    name: 'Воздушный фильтр',
    // FIX: Changed 'category' to 'categoryId' and used the category ID.
    categoryId: 'filters',
    price: 1550.00,
    imageUrl: 'https://images.unsplash.com/photo-1594950945013-5a210a4544f8?q=80&w=400&auto=format&fit=crop',
    description: 'Воздушный фильтр двигателя, улучшающий производительность и экономию топлива.',
    sku: 'AF-PERF-004',
    brand: 'Mann-Filter',
    inStock: true,
    analogs: ['K&N-33-2468', 'MAHLE-LX1211'],
  },
  {
    id: 5,
    name: 'Лампа для фары H7',
    // FIX: Changed 'category' to 'categoryId' and used the category ID.
    categoryId: 'electro',
    price: 990.00,
    imageUrl: 'https://images.unsplash.com/photo-1620165979848-a25b3ff75a5e?q=80&w=400&auto=format&fit=crop',
    description: 'Ультра-яркая галогеновая лампа для превосходной видимости на дороге.',
    sku: 'HL-HAL-005',
    brand: 'Osram',
    inStock: true,
    analogs: ['PHILIPS-12972VP', 'BOSCH-1987301012'],
  },
  {
    id: 6,
    name: 'Щетки стеклоочистителя (комплект)',
    // FIX: Changed 'category' to 'categoryId' and used the category ID.
    categoryId: 'electro',
    price: 2500.99,
    imageUrl: 'https://images.unsplash.com/photo-1574226516631-412702a24344?q=80&w=400&auto=format&fit=crop',
    description: 'Всесезонные бескаркасные щетки для чистого лобового стекла без разводов.',
    sku: 'WW-BEAM-006',
    brand: 'Bosch',
    inStock: true,
    analogs: ['VALEO-574385', 'SWF-119330'],
  },
  {
    id: 7,
    name: 'Автомобильный аккумулятор',
    // FIX: Changed 'category' to 'categoryId' and used the category ID.
    categoryId: 'electro',
    price: 9500.00,
    imageUrl: 'https://images.unsplash.com/photo-1588274783463-631d5b3d9b4b?q=80&w=400&auto=format&fit=crop',
    description: 'Надежный AGM аккумулятор с гарантией на 3 года.',
    sku: 'CB-AGM-007',
    brand: 'Varta',
    inStock: true,
    analogs: ['BOSCH-S5A08', 'EXIDE-EK700'],
  },
  {
    id: 8,
    name: 'Генератор',
    // FIX: Changed 'category' to 'categoryId' and used the category ID.
    categoryId: 'electro',
    price: 15500.00,
    imageUrl: 'https://images.unsplash.com/photo-1629822475754-8785c573751a?q=80&w=400&auto=format&fit=crop',
    description: 'Генератор высокой мощности для современных автомобилей с большим энергопотреблением.',
    sku: 'ALT-HO-008',
    brand: 'Bosch',
    inStock: false,
    analogs: ['VALEO-439534', 'DENSO-DAN930'],
  },
];

export const mockCategories: Category[] = [
  // FIX: Added 'slug' property to match the Category type.
  { id: 'oils', name: 'Масла и жидкости', slug: 'oils-and-liquids', imageUrl: 'https://images.unsplash.com/photo-1590483890292-3d3f507b3858?q=80&w=800&auto=format&fit=crop' },
  { id: 'filters', name: 'Фильтры', slug: 'filters', imageUrl: 'https://images.unsplash.com/photo-1628176212591-224a18f7a3d3?q=80&w=800&auto=format&fit=crop' },
  { id: 'brakes', name: 'Тормозная система', slug: 'brake-system', imageUrl: 'https://images.unsplash.com/photo-1599401135243-a4c330545f17?q=80&w=800&auto=format&fit=crop' },
  { id: 'engine', name: 'Двигатель', slug: 'engine', imageUrl: 'https://images.unsplash.com/photo-1543747255-94b72220269f?q=80&w=800&auto=format&fit=crop' },
  { id: 'suspension', name: 'Подвеска', slug: 'suspension', imageUrl: 'https://images.unsplash.com/photo-1617096200347-cb04ae465063?q=80&w=800&auto=format&fit=crop' },
  { id: 'electro', name: 'Электрика', slug: 'electro', imageUrl: 'https://images.unsplash.com/photo-1581453224497-a72a0a294867?q=80&w=800&auto=format&fit=crop' },
];

export const mockNews: NewsArticle[] = [
    {
        id: 1,
        title: 'Новое поступление: тормозные диски Brembo',
        excerpt: 'Рады сообщить, что наш ассортимент пополнился высококачественными тормозными дисками от мирового лидера Brembo.',
        // FIX: Added missing 'content' and 'createdAt' properties.
        content: 'Полный текст новости о поступлении тормозных дисков Brembo. Узнайте больше о преимуществах и доступных моделях.',
        createdAt: new Date('2023-10-28T10:00:00Z').toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1617834215357-b08110b96b4b?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 2,
        title: 'Как выбрать моторное масло для зимы?',
        excerpt: 'Наши эксперты подготовили подробное руководство по выбору масла, которое обеспечит легкий запуск двигателя в морозы.',
        // FIX: Added missing 'content' and 'createdAt' properties.
        content: 'Полное руководство по выбору зимнего моторного масла. Рассматриваем вязкость, допуски производителей и популярные бренды.',
        createdAt: new Date('2023-10-25T12:30:00Z').toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1601884481125-72782b1446a9?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 3,
        title: 'Акция: -20% на все фильтры MANN-FILTER',
        excerpt: 'Только до конца месяца! Успейте купить воздушные, масляные и салонные фильтры MANN-FILTER со скидкой 20%.',
        // FIX: Added missing 'content' and 'createdAt' properties.
        content: 'Не пропустите выгодное предложение! Скидка 20% на весь ассортимент фильтров MANN-FILTER до 31 октября. Подробности акции внутри.',
        createdAt: new Date('2023-10-22T09:00:00Z').toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1599256872455-5154a33327d7?q=80&w=400&auto=format&fit=crop',
    }
];