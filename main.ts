// Core Domain: Qualitätsmanagement
export class Item {
  name: string;
  sellIn: number;
  quality: number;
  basePrice: number;

  constructor(name: string, sellIn: number, quality: number, basePrice: number) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
    this.basePrice = basePrice;
  }

  updateQuality(): void {
    // Standardimplementierung, kann von Unterklassen überschrieben werden
  }
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
    // Sulfuras ändert sich nicht
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

// Supporting Domain: Produktverwaltung
export class ProductCatalog {
  private items: Array<Item>;

  constructor() {
    this.items = [];
  }

  addItem(item: Item): void {
    this.items.push(item);
  }

  removeItem(item: Item): void {
    this.items = this.items.filter(i => i !== item);
  }

  getItems(): Array<Item> {
    return this.items;
  }
}

// Supporting Domain: Warenkorbverwaltung
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

  constructor() {
    this.items = [];
  }

  addItem(item: Item, amount: number): void {
    const price = item.basePrice;
    const cartItem = new ShoppingCartItem(item, amount, price);
    this.items.push(cartItem);
  }

  removeItem(item: Item): void {
    this.items = this.items.filter(i => i.item !== item);
  }

  getTotalPrice(currency: string): number {
    const priceCalculator = new PriceCalculator();
    return priceCalculator.calculatePrice(this.items, currency);
  }
}

// Supporting Domain: Preismanagement
export class PriceCalculator {
  private discountStrategies: Array<DiscountStrategy>;

  constructor() {
    this.discountStrategies = [];
  }

  addDiscountStrategy(strategy: DiscountStrategy): void {
    this.discountStrategies.push(strategy);
  }

  calculatePrice(items: Array<ShoppingCartItem>, currency: string): number {
    // Rabatte anwenden
    for (const strategy of this.discountStrategies) {
      strategy.applyDiscount(items);
    }

    // Preise summieren
    let total = 0;
    for (const item of items) {
      total += item.individualDiscountedPrice * item.amount;
    }

    // Währungsumrechnung
    const converter = new CurrencyConverter();
    return converter.convert(total, currency);
  }
}

// Supporting Domain: Rabattmanagement
export interface DiscountStrategy {
  applyDiscount(items: Array<ShoppingCartItem>): void;
}

export class BulkDiscount implements DiscountStrategy {
  applyDiscount(items: Array<ShoppingCartItem>): void {
    for (const item of items) {
      if (item.amount >= 10) {
        item.individualDiscountedPrice *= 0.9; // 10% Rabatt
      }
    }
  }
}

export class SeasonalDiscount implements DiscountStrategy {
  applyDiscount(items: Array<ShoppingCartItem>): void {
    for (const item of items) {
      item.individualDiscountedPrice *= 0.95; // 5% Rabatt
    }
  }
}

// Generic Domain: Währungsumrechnung
export class CurrencyConverter {
  convert(amount: number, currency: string): number {
    // Vereinfachte Umrechnung (1:1)
    return amount;
  }
}
