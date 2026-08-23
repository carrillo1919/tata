import { Product } from '../models/index.js';

export async function listProducts(_req, res, next) {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ ok: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const productPayload = { ...req.body };

    if (req.file?.buffer) {
      productPayload.imageData = req.file.buffer;
      productPayload.imageMimeType = req.file.mimetype;
    }

    const product = await Product.create(productPayload);
    res.status(201).json({ ok: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    const productPayload = { ...req.body };
    if (req.file?.buffer) {
      productPayload.imageData = req.file.buffer;
      productPayload.imageMimeType = req.file.mimetype;
    }

    await product.update(productPayload);
    return res.json({ ok: true, data: product });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    await product.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
