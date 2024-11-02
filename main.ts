export class Item {
  name: string;
  sellIn: number;
  quality: number;
  basePrice: number;

  constructor(
    name: string,
    sellIn: number,
    quality: number,
    basePrice: number
  ) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
    this.basePrice = basePrice;
  }

  updateQuality(): void {}
}

export class AgedBrie extends Item {
  updateQuality(): void {
    this.sellIn--;
    if (this.quality < 50) {
      this.quality++;
    }
    if (this.sellIn < 0 && this.quality < 50) {
      this.quality++;
    }
  }
}

export class BackstagePass extends Item {
  updateQuality(): void {
    if (this.sellIn > 0) {
      if (this.quality < 50) {
        this.quality++;
        if (this.sellIn < 11 && this.quality < 50) {
          this.quality++;
        }
        if (this.sellIn < 6 && this.quality < 50) {
          this.quality++;
        }
      }
    } else {
      this.quality = 0;
    }
    this.sellIn--;
  }
}

export class Sulfuras extends Item {
  updateQuality(): void {
    // quality never changes
  }
}

export class ConjuredItem extends Item {
  updateQuality(): void {
    this.sellIn--;
    if (this.quality > 0) {
      this.quality -= 2;
      if (this.quality < 0) {
        this.quality = 0;
      }
    }
    if (this.sellIn < 0 && this.quality > 0) {
      this.quality -= 2;
      if (this.quality < 0) {
        this.quality = 0;
      }
    }
  }
}

export class ProductCatalog {
  private items: Array<Item>;

  constructor() {
    this.items = [];
  }

  addItem(item: Item): void {
    this.items.push(item);
  }

  removeItem(item: Item): void {
    this.items = this.items.filter((i) => i !== item);
  }

  getItems(): Array<Item> {
    return this.items;
  }
}

export class ShoppingCartItem {
  item: Item;
  amount: number;
  individualPrice: number;
  individualDiscountedPrice: number;

  constructor(item: Item, amount: number, individualPrice: number) {
    this.item = item;
    this.amount = amount;
    this.individualPrice = individualPrice;
    this.individualDiscountedPrice = individualPrice;
  }
}

export class ShoppingCart {
  private items: Array<ShoppingCartItem>;
  private priceCalculator: PriceCalculator;
  private totalPrice: number;
  private currency: string;

  constructor() {
    this.items = [];

    this.priceCalculator = new PriceCalculator();
    const bulkDiscount = new BulkDiscount();
    const seasonalDiscount = new SeasonalDiscount();
    this.priceCalculator.addDiscountStrategy(bulkDiscount);
    this.priceCalculator.addDiscountStrategy(seasonalDiscount);

    this.currency = "EUR";
  }

  addItem(item: Item, amount: number): void {
    const existingCartItem = this.items.find(
      (cartItem) => cartItem.item === item
    );
    if (existingCartItem) {
      existingCartItem.amount += amount;
    } else {
      const price = item.basePrice;
      const cartItem = new ShoppingCartItem(item, amount, price);
      this.items.push(cartItem);
    }
    this.totalPrice = this.priceCalculator.calculatePrice(
      this.items,
      this.currency
    );
  }

  removeItem(item: Item): void {
    this.items = this.items.filter((i) => i.item !== item);
    this.totalPrice = this.priceCalculator.calculatePrice(
      this.items,
      this.currency
    );
  }
}

export class PriceCalculator {
  private discountStrategies: Array<DiscountStrategy>;

  constructor() {
    this.discountStrategies = [];
  }

  addDiscountStrategy(strategy: DiscountStrategy): void {
    this.discountStrategies.push(strategy);
  }

  calculatePrice(items: Array<ShoppingCartItem>, currency: string): number {
    for (const strategy of this.discountStrategies) {
      strategy.applyDiscount(items);
    }

    let total = 0;
    for (const item of items) {
      total += item.individualDiscountedPrice * item.amount;
    }

    const converter = new CurrencyConverter();
    return converter.convert(total, currency);
  }
}

export interface DiscountStrategy {
  applyDiscount(items: Array<ShoppingCartItem>): void;
}

export class BulkDiscount implements DiscountStrategy {
  applyDiscount(items: Array<ShoppingCartItem>): void {
    for (const item of items) {
      if (item.amount >= 10) {
        item.individualDiscountedPrice *= 0.9;
      }
    }
  }
}

export class SeasonalDiscount implements DiscountStrategy {
  applyDiscount(items: Array<ShoppingCartItem>): void {
    for (const item of items) {
      item.individualDiscountedPrice *= 0.95;
    }
  }
}

export class CurrencyConverter {
  convert(amount: number, currency: string): number {
    // Hier würde die Umrechnung stattfinden
    // leer weil als Generic Subdomain ein externer Service verwendet wird
    return amount;
  }
}
