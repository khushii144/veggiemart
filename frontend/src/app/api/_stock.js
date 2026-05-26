export const DEFAULT_PRODUCT_STOCK = 50;

export function normalizeProductStock(stock) {
  const parsedStock = Number(stock);
  return Number.isFinite(parsedStock) && parsedStock > 0 ? Math.floor(parsedStock) : DEFAULT_PRODUCT_STOCK;
}

export async function restockUnavailableProducts(Product) {
  await Product.updateMany(
    {
      $or: [
        { stock: { $exists: false } },
        { stock: null },
        { stock: { $lte: 0 } },
      ],
    },
    { $set: { stock: DEFAULT_PRODUCT_STOCK } },
  );
}
