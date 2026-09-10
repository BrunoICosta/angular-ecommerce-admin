import {
  Customer,
  Order,
  OrderEvent,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductCategory,
  User,
} from '../models';
import { SeededRandom } from './random';

export interface SeedData {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  users: User[];
}

export const SEED = 20260907;
export const PRODUCT_COUNT = 60;
export const CUSTOMER_COUNT = 90;
export const ORDER_COUNT = 200;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Base catalogue: [name, reference price]. Real prices get a small deterministic jitter. */
const CATALOG: Record<ProductCategory, readonly (readonly [string, number])[]> = {
  Eletrônicos: [
    ['Fone Bluetooth com Cancelamento de Ruído', 899],
    ['Smartwatch Fit Pro', 1299],
    ['Caixa de Som Portátil à Prova d’Água', 449],
    ['Smart TV 50" 4K', 2799],
    ['Câmera de Ação 4K', 1199],
    ['Soundbar 2.1 Bluetooth', 1049],
    ['Carregador Portátil 20.000 mAh', 179],
    ['Fone de Ouvido Esportivo', 229],
  ],
  Informática: [
    ['Notebook Ultrafino 14"', 4599],
    ['Monitor 27" QHD', 1899],
    ['Teclado Mecânico RGB', 389],
    ['Mouse Sem Fio Ergonômico', 159],
    ['SSD NVMe 1TB', 499],
    ['Webcam Full HD', 279],
    ['Hub USB-C 7 em 1', 219],
    ['Headset Gamer 7.1', 349],
  ],
  'Casa e Cozinha': [
    ['Air Fryer 5L', 499],
    ['Cafeteira Expresso Automática', 1399],
    ['Jogo de Panelas Antiaderente 5 Peças', 589],
    ['Liquidificador Turbo 1200W', 249],
    ['Aspirador Robô Smart', 1699],
    ['Luminária de Mesa LED', 139],
    ['Garrafa de Café Inox 1L', 119],
    ['Jogo de Facas Profissional', 299],
  ],
  Moda: [
    ['Jaqueta Jeans Unissex', 259],
    ['Tênis Casual Branco', 349],
    ['Mochila Urbana Impermeável', 229],
    ['Camiseta Básica Algodão Pima', 89],
    ['Óculos de Sol Polarizado', 319],
    ['Relógio Analógico Couro', 449],
    ['Boné Aba Curva', 79],
  ],
  Esportes: [
    ['Bicicleta Aro 29 Alumínio', 2399],
    ['Tapete de Yoga Antiderrapante', 149],
    ['Halteres Ajustáveis 20kg', 699],
    ['Garrafa Térmica Esportiva 1L', 129],
    ['Bola de Futebol Oficial', 199],
    ['Corda de Pular Speed', 59],
    ['Faixa Elástica Kit 5 Níveis', 89],
  ],
  Beleza: [
    ['Secador de Cabelo Íon 2200W', 329],
    ['Kit Skincare Vitamina C', 189],
    ['Perfume Amadeirado 100ml', 399],
    ['Prancha Alisadora Titânio', 279],
    ['Barbeador Elétrico Recarregável', 359],
    ['Hidratante Facial FPS 30', 79],
    ['Escova Secadora Rotativa', 299],
  ],
  Livros: [
    ['Código Limpo', 109],
    ['O Programador Pragmático', 119],
    ['Arquitetura Limpa', 99],
    ['Padrões de Projeto', 159],
    ['Refatoração', 139],
    ['Domain-Driven Design', 179],
    ['Entendendo Algoritmos', 79],
  ],
  Brinquedos: [
    ['Blocos de Montar 500 Peças', 249],
    ['Quebra-Cabeça 1000 Peças', 89],
    ['Carrinho de Controle Remoto', 299],
    ['Jogo de Tabuleiro Estratégia', 189],
    ['Pelúcia Urso 40cm', 99],
    ['Kit Ciência Divertida', 149],
    ['Pista de Corrida Looping', 219],
    ['Massinha de Modelar Kit 12 Cores', 49],
  ],
};

const FIRST_NAMES = [
  'Ana',
  'Bruno',
  'Carla',
  'Diego',
  'Eduarda',
  'Felipe',
  'Gabriela',
  'Henrique',
  'Isabela',
  'João',
  'Karina',
  'Lucas',
  'Mariana',
  'Nicolas',
  'Olívia',
  'Pedro',
  'Rafaela',
  'Samuel',
  'Tatiane',
  'Vinícius',
  'Larissa',
  'Matheus',
  'Beatriz',
  'Gustavo',
  'Letícia',
  'Rodrigo',
  'Camila',
  'Thiago',
  'Juliana',
  'André',
];

const LAST_NAMES = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Rodrigues',
  'Ferreira',
  'Alves',
  'Pereira',
  'Lima',
  'Gomes',
  'Costa',
  'Ribeiro',
  'Martins',
  'Carvalho',
  'Almeida',
  'Lopes',
  'Barbosa',
  'Rocha',
  'Araújo',
  'Moreira',
];

const CITIES: readonly (readonly [string, string])[] = [
  ['São Paulo', 'SP'],
  ['Campinas', 'SP'],
  ['Rio de Janeiro', 'RJ'],
  ['Niterói', 'RJ'],
  ['Belo Horizonte', 'MG'],
  ['Uberlândia', 'MG'],
  ['Curitiba', 'PR'],
  ['Londrina', 'PR'],
  ['Porto Alegre', 'RS'],
  ['Florianópolis', 'SC'],
  ['Salvador', 'BA'],
  ['Recife', 'PE'],
  ['Fortaleza', 'CE'],
  ['Brasília', 'DF'],
  ['Goiânia', 'GO'],
  ['Manaus', 'AM'],
  ['Belém', 'PA'],
];

const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'pix',
  'pix',
  'credit_card',
  'credit_card',
  'credit_card',
  'boleto',
];

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Turns e.g. 1234 into 1229.90, the way retail prices usually look. */
function retailPrice(raw: number): number {
  return round2(Math.max(9.9, Math.floor(raw / 10) * 10 - 0.1));
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function slug(value: string): string {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/(^\.|\.$)/g, '');
}

function generateProducts(rng: SeededRandom, now: number): Product[] {
  const entries = (Object.keys(CATALOG) as ProductCategory[]).flatMap((category) =>
    CATALOG[category].map(([name, basePrice]) => ({ category, name, basePrice })),
  );

  return entries.slice(0, PRODUCT_COUNT).map(({ category, name, basePrice }, index) => {
    const id = index + 1;
    const sku = `${stripAccents(category).slice(0, 3).toUpperCase()}-${1000 + id}`;
    const minStock = rng.pick([5, 10, 10, 15, 20]);
    const roll = rng.next();
    const stock = roll < 0.08 ? 0 : roll < 0.22 ? rng.int(1, minStock) : rng.int(minStock + 1, 180);

    return {
      id,
      sku,
      name,
      description: `${name} da categoria ${category.toLowerCase()}, com garantia de 12 meses e envio para todo o Brasil.`,
      category,
      price: retailPrice(basePrice * (0.9 + rng.next() * 0.2)),
      stock,
      minStock,
      imageUrl: `https://picsum.photos/seed/${sku.toLowerCase()}/480/480`,
      active: rng.chance(0.93),
      createdAt: new Date(now - rng.int(60, 540) * DAY).toISOString(),
    };
  });
}

function generateCustomers(rng: SeededRandom, now: number): Customer[] {
  return Array.from({ length: CUSTOMER_COUNT }, (_, i) => {
    const first = rng.pick(FIRST_NAMES);
    const last = `${rng.pick(LAST_NAMES)}${rng.chance(0.35) ? ` ${rng.pick(LAST_NAMES)}` : ''}`;
    const [city, state] = rng.pick(CITIES);
    const domain = rng.pick([
      'gmail.com',
      'outlook.com',
      'hotmail.com',
      'yahoo.com.br',
      'uol.com.br',
    ]);
    // Most customers signed up within the last year; some in the last 30 days.
    const ageDays = rng.chance(0.15) ? rng.int(0, 29) : rng.int(30, 420);
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}${i + 1}@${domain}`,
      phone: `(${rng.int(11, 99)}) 9${rng.int(1000, 9999)}-${rng.int(1000, 9999)}`,
      city,
      state,
      createdAt: new Date(now - ageDays * DAY - rng.int(0, DAY - 1)).toISOString(),
    };
  });
}

/** Decides the current status of an order based on how old it is. */
function statusForAge(rng: SeededRandom, ageDays: number): OrderStatus {
  if (rng.chance(0.07)) return 'cancelled';
  if (ageDays <= 2) return rng.pick<OrderStatus>(['pending', 'pending', 'paid']);
  if (ageDays <= 6) return rng.pick<OrderStatus>(['paid', 'shipped', 'shipped']);
  if (ageDays <= 12) return rng.pick<OrderStatus>(['shipped', 'delivered', 'delivered']);
  return 'delivered';
}

function buildHistory(
  rng: SeededRandom,
  createdAt: number,
  status: OrderStatus,
  now: number,
): OrderEvent[] {
  const history: OrderEvent[] = [{ status: 'pending', at: new Date(createdAt).toISOString() }];
  const path: OrderStatus[] = ['paid', 'shipped', 'delivered'];
  const steps = status === 'cancelled' ? rng.int(0, 1) : path.indexOf(status) + 1;
  const maxGapHours = [6, 48, 120];
  let at = createdAt;

  for (let i = 0; i < steps; i++) {
    at = Math.min(now, at + rng.int(1, maxGapHours[i]) * HOUR);
    history.push({ status: path[i], at: new Date(at).toISOString() });
  }
  if (status === 'cancelled') {
    at = Math.min(now, at + rng.int(2, 30) * HOUR);
    history.push({ status: 'cancelled', at: new Date(at).toISOString() });
  }
  return history;
}

/**
 * Order age in days over the last 12 months. Rejection sampling makes recent
 * months denser, so the revenue chart shows a store that is growing; a slice of
 * orders lands in the last two weeks so every workflow status shows up.
 */
function orderAgeInDays(rng: SeededRandom): number {
  if (rng.chance(0.12)) return rng.int(0, 13);
  for (;;) {
    const age = rng.int(0, 364);
    if (rng.chance(0.5 + 0.5 * (1 - age / 364))) return age;
  }
}

/** Picks 1–3 distinct products; expensive items are bought less often. */
function pickItems(rng: SeededRandom, products: Product[]): Product[] {
  const count = rng.pick([1, 1, 1, 2, 2, 3]);
  const picked = new Set<Product>();
  while (picked.size < count) {
    const candidate = rng.pick(products);
    if (rng.chance(Math.min(1, 350 / candidate.price))) picked.add(candidate);
  }
  return [...picked];
}

function generateOrders(
  rng: SeededRandom,
  now: number,
  products: Product[],
  customers: Customer[],
): Order[] {
  const sellable = products.filter((p) => p.active);
  const orders: Omit<Order, 'id' | 'number'>[] = [];

  for (let i = 0; i < ORDER_COUNT; i++) {
    const ageDays = orderAgeInDays(rng);
    const createdAt = now - ageDays * DAY - rng.int(0, 20) * HOUR;
    const customer = rng.pick(customers);
    const items: OrderItem[] = pickItems(rng, sellable).map((product) => ({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: product.price > 300 ? 1 : rng.pick([1, 1, 2, 3]),
    }));
    const subtotal = round2(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
    const shipping = subtotal >= 299 ? 0 : rng.pick([14.9, 19.9, 24.9]);
    const status = statusForAge(rng, ageDays);

    orders.push({
      customerId: customer.id,
      customerName: customer.name,
      items,
      subtotal,
      shipping,
      total: round2(subtotal + shipping),
      status,
      paymentMethod: rng.pick(PAYMENT_METHODS),
      city: customer.city,
      state: customer.state,
      createdAt: new Date(createdAt).toISOString(),
      history: buildHistory(rng, createdAt, status, now),
    });
  }

  // Ids and order numbers follow chronological order, like a real store.
  return orders
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((order, index) => ({ id: index + 1, number: `#${10_001 + index}`, ...order }));
}

function generateUsers(now: number): User[] {
  const lastLogin = (days: number) => new Date(now - days * DAY).toISOString();
  return [
    {
      id: 1,
      name: 'Bruno Costa',
      email: 'admin@loja.com',
      role: 'admin',
      active: true,
      lastLoginAt: lastLogin(1),
    },
    {
      id: 2,
      name: 'Marina Duarte',
      email: 'manager@loja.com',
      role: 'manager',
      active: true,
      lastLoginAt: lastLogin(3),
    },
    {
      id: 3,
      name: 'Paulo Henrique',
      email: 'paulo@loja.com',
      role: 'manager',
      active: true,
      lastLoginAt: lastLogin(9),
    },
    {
      id: 4,
      name: 'Renata Lima',
      email: 'renata@loja.com',
      role: 'admin',
      active: true,
      lastLoginAt: lastLogin(14),
    },
    {
      id: 5,
      name: 'Caio Teixeira',
      email: 'caio@loja.com',
      role: 'manager',
      active: false,
      lastLoginAt: null,
    },
  ];
}

/**
 * Builds the whole fake database. The output only depends on `seed` and on the
 * reference date, so the demo always looks "current" while staying reproducible
 * (tests pass a fixed reference date).
 */
export function generateSeedData(referenceDate: Date = new Date(), seed = SEED): SeedData {
  const rng = new SeededRandom(seed);
  const now = referenceDate.getTime();
  const products = generateProducts(rng, now);
  const customers = generateCustomers(rng, now);
  const orders = generateOrders(rng, now, products, customers);
  return { products, customers, orders, users: generateUsers(now) };
}
