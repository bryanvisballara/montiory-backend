import { Router } from 'express'
import { asyncHandler } from '../lib/async-handler.js'
import { normalizeChipOrder } from '../lib/chip-order.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import Category from '../models/Category.js'
import DecantSettings from '../models/DecantSettings.js'
import StorefrontSettings from '../models/StorefrontSettings.js'

const router = Router()

router.use(requireAuth, requireRole('admin'))

async function getNormalizedChipOrder(chipOrder) {
  const [categories, decantSettings] = await Promise.all([
    Category.find().sort({ sortOrder: 1, createdAt: 1 }).select('_id').lean(),
    DecantSettings.findOne({ key: 'default' }).lean(),
  ])

  return normalizeChipOrder(
    chipOrder,
    categories.map((category) => String(category._id)),
    Boolean(decantSettings?.isEnabled),
  )
}

router.get(
  '/',
  asyncHandler(async (_request, response) => {
    const settings = await StorefrontSettings.findOne({ key: 'default' }).lean()
    const chipOrder = await getNormalizedChipOrder(settings?.chipOrder)

    response.json({
      key: 'default',
      chipOrder,
    })
  }),
)

router.put(
  '/',
  asyncHandler(async (request, response) => {
    const chipOrder = await getNormalizedChipOrder(request.body?.chipOrder)
    const settings = await StorefrontSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: { chipOrder } },
      { new: true, upsert: true },
    ).lean()

    response.json({
      key: 'default',
      chipOrder: settings.chipOrder,
    })
  }),
)

export default router
