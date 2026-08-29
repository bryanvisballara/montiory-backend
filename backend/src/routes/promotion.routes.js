import { Router } from 'express'
import { asyncHandler } from '../lib/async-handler.js'
import { createHttpError } from '../lib/http-error.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import Promotion from '../models/Promotion.js'

const router = Router()

router.use(requireAuth, requireRole('admin'))

function buildPromotionPayload(body) {
  const itemCount = Number(body.itemCount)
  const price = Number(body.price)
  const isActive = body.isActive !== false

  if (!Number.isInteger(itemCount) || itemCount < 2) {
    throw createHttpError(400, 'La promoción debe incluir al menos 2 prendas.')
  }

  if (!Number.isFinite(price) || price < 1 || !Number.isInteger(price)) {
    throw createHttpError(400, 'El precio de la promoción debe ser un entero mayor o igual a 1.')
  }

  return {
    itemCount,
    price,
    isActive,
  }
}

router.get(
  '/',
  asyncHandler(async (_request, response) => {
    const promotions = await Promotion.find().sort({ itemCount: 1, createdAt: 1 }).lean()
    response.json(promotions)
  }),
)

router.post(
  '/',
  asyncHandler(async (request, response) => {
    const payload = buildPromotionPayload(request.body)
    const existing = await Promotion.findOne({ itemCount: payload.itemCount }).lean()

    if (existing) {
      throw createHttpError(409, `Ya existe una promoción de ${payload.itemCount} prendas.`)
    }

    const promotion = await Promotion.create(payload)
    response.status(201).json(promotion)
  }),
)

router.put(
  '/:id',
  asyncHandler(async (request, response) => {
    const payload = buildPromotionPayload(request.body)
    const existing = await Promotion.findOne({
      itemCount: payload.itemCount,
      _id: { $ne: request.params.id },
    }).lean()

    if (existing) {
      throw createHttpError(409, `Ya existe una promoción de ${payload.itemCount} prendas.`)
    }

    const promotion = await Promotion.findByIdAndUpdate(request.params.id, payload, {
      new: true,
      runValidators: true,
    })

    if (!promotion) {
      throw createHttpError(404, 'Promotion not found')
    }

    response.json(promotion)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (request, response) => {
    const deletedPromotion = await Promotion.findByIdAndDelete(request.params.id)

    if (!deletedPromotion) {
      throw createHttpError(404, 'Promotion not found')
    }

    response.status(204).send()
  }),
)

export default router
