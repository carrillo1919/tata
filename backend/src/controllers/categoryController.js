import { Category } from '../models/index.js';

export async function listCategories(_req, res, next) {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ ok: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ ok: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    }
    await category.update(req.body);
    return res.json({ ok: true, data: category });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    }
    await category.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
