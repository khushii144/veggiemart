export { default as connectDB } from '../../lib/mongodb.js';
export { default as Product } from './model.js';
export { default as Category } from '../categories/model.js';
export { DEFAULT_PRODUCT_STOCK, normalizeProductStock, restockUnavailableProducts } from '../../lib/productStock.js';
