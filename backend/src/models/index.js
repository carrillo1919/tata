import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'vendedor', 'comprador'), allowNull: false },
  phone: { type: DataTypes.STRING },
}, { tableName: 'users' });

export const Category = sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  parentId: { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'categories' });

export const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phoneMobile: { type: DataTypes.STRING },
  phoneLandline: { type: DataTypes.STRING },
  address: { type: DataTypes.JSONB },
  email: { type: DataTypes.STRING },
  extraContact: { type: DataTypes.TEXT },
}, { tableName: 'suppliers' });

export const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  shortDescription: { type: DataTypes.STRING },
  longDescription: { type: DataTypes.TEXT },
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  supplierPriceUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  salePriceUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  stockCurrent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  stockMinAlert: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  imageData: { type: DataTypes.BLOB('long') },
  imageMimeType: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false, defaultValue: 'activo' },
  weightKg: { type: DataTypes.DECIMAL(10, 2) },
  dimensions: { type: DataTypes.JSONB },
}, { tableName: 'products' });

export const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
}, { tableName: 'carts' });

export const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, { tableName: 'cart_items' });

export const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  invoiceNumber: { type: DataTypes.STRING, unique: true },
  status: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'preparando_envio', 'enviado', 'entregado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  subtotalUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  taxUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  shippingUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  totalUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  bcvRate: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
  paymentType: { type: DataTypes.ENUM('contado', 'cuotas'), allowNull: false, defaultValue: 'contado' },
}, { tableName: 'orders' });

export const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPriceUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  totalPriceUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { tableName: 'order_items' });

export const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  paymentType: { type: DataTypes.ENUM('efectivo', 'transferencia', 'pago_movil'), allowNull: false },
  bankFrom: { type: DataTypes.STRING },
  bankTo: { type: DataTypes.STRING },
  accountOrPhone: { type: DataTypes.STRING },
  referenceNumber: { type: DataTypes.STRING, allowNull: false },
  paidAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  amountUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amountBs: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  bcvRate: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
  status: { type: DataTypes.ENUM('pendiente', 'confirmado', 'rechazado'), allowNull: false, defaultValue: 'pendiente' },
}, { tableName: 'payments' });

export const Installment = sequelize.define('Installment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  installmentNumber: { type: DataTypes.INTEGER, allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false },
  amountUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amountBs: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pendiente', 'pagado', 'vencido'), allowNull: false, defaultValue: 'pendiente' },
}, { tableName: 'installments' });

export const Shipment = sequelize.define('Shipment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: {
    type: DataTypes.ENUM('preparando', 'enviado', 'en_transito', 'entregado'),
    allowNull: false,
    defaultValue: 'preparando',
  },
  trackingNumber: { type: DataTypes.STRING },
  estimatedDeliveryDate: { type: DataTypes.DATEONLY },
}, { tableName: 'shipments' });

export const InventoryMovement = sequelize.define('InventoryMovement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  movementType: { type: DataTypes.ENUM('entrada', 'salida', 'ajuste'), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  note: { type: DataTypes.TEXT },
}, { tableName: 'inventory_movements' });

export const Configuration = sequelize.define('Configuration', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  value: { type: DataTypes.JSONB, allowNull: false },
}, { tableName: 'configurations' });

Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });
Order.belongsTo(User, { foreignKey: 'userId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });
Payment.belongsTo(Installment, { foreignKey: 'installmentId' });
Installment.belongsTo(Order, { foreignKey: 'orderId' });
Shipment.belongsTo(Order, { foreignKey: 'orderId' });
InventoryMovement.belongsTo(Product, { foreignKey: 'productId' });
InventoryMovement.belongsTo(User, { foreignKey: 'userId' });

export async function syncDb() {
  await sequelize.sync();
}
