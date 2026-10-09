import { Router } from 'express'
import { asyncHandler } from '../lib/async-handler.js'
import { normalizeChipOrder } from '../lib/chip-order.js'
import { normalizeSeasonalWelcome } from '../lib/seasonal-welcome.js'
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

function buildSettingsResponse(settings, chipOrder) {
  return {
    key: 'default',
    chipOrder,
    seasonalWelcome: normalizeSeasonalWelcome(settings?.seasonalWelcome),
  }
}

router.get(
  '/',
  asyncHandler(async (_request, response) => {
    const settings = await StorefrontSettings.findOne({ key: 'default' }).lean()
    const chipOrder = await getNormalizedChipOrder(settings?.chipOrder)

    response.json(buildSettingsResponse(settings, chipOrder))
  }),
)

router.put(
  '/',
  asyncHandler(async (request, response) => {
    const existing = await StorefrontSettings.findOne({ key: 'default' }).lean()
    const chipOrder = await getNormalizedChipOrder(
      request.body?.chipOrder !== undefined ? request.body.chipOrder : existing?.chipOrder,
    )
    const seasonalWelcome = normalizeSeasonalWelcome(
      request.body?.seasonalWelcome !== undefined ? request.body.seasonalWelcome : existing?.seasonalWelcome,
    )

    const settings = await StorefrontSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: { chipOrder, seasonalWelcome } },
      { new: true, upsert: true },
    ).lean()

    response.json(buildSettingsResponse(settings, chipOrder))
  }),
)

export default router
