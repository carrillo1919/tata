import { Cart, CartItem, Product } from '../models/index.js';
import { addCartItemSchema, updateCartItemSchema } from '../validators/cartValidator.js';
import { AppError } from '../utils/errors.js';

async function getOrCreateCart(userId, transaction) {
  let cart = await Cart.findOne({ where: { userId }, transaction });
  if (!cart) {
    cart = await Cart.create({ userId }, { transaction });
  }
  return cart;
}

export async function getMyCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const items = await CartItem.findAll({ where: { cartId: cart.id }, include: [Product] });
    const subtotalUsd = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.Product?.salePriceUsd || 0), 0);

    res.json({
      ok: true,
      data: {
        id: cart.id,
        items,
        subtotalUsd: Number(subtotalUsd.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const payload = await addCartItemSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    const product = await Product.findByPk(payload.productId);

    if (!product || product.status !== 'activo') {
      throw new AppError('Producto no disponible', 404);
    }

    if (product.stockCurrent < payload.quantity) {
      throw new AppError('Stock insuficiente', 400);
    }

    const cart = await getOrCreateCart(req.user.id);
    const existing = await CartItem.findOne({ where: { cartId: cart.id, productId: payload.productId } });

    if (existing) {
      const newQuantity = existing.quantity + payload.quantity;
      if (newQuantity > product.stockCurrent) {
        throw new AppError('Stock insuficiente', 400);
      }
      await existing.update({ quantity: newQuantity });
    } else {
      await CartItem.create({ cartId: cart.id, productId: payload.productId, quantity: payload.quantity });
    }

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const payload = await updateCartItemSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    const cart = await getOrCreateCart(req.user.id);

    const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } });
    if (!item) {
      throw new AppError('Ítem de carrito no encontrado', 404);
    }

    const product = await Product.findByPk(item.productId);
    if (!product || product.stockCurrent < payload.quantity) {
      throw new AppError('Stock insuficiente', 400);
    }

    await item.update({ quantity: payload.quantity });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } });

    if (!item) {
      throw new AppError('Ítem de carrito no encontrado', 404);
    }

    await item.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
