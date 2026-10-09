import mongoose from 'mongoose'

const storefrontSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    chipOrder: {
      type: [String],
      default: [],
    },
    seasonalWelcome: {
      enabled: { type: Boolean, default: true },
      version: { type: String, default: '1' },
      imageUrl: { type: String, default: '' },
      mediaBadge: { type: String, default: 'Edición limitada' },
      eyebrow: { type: String, default: 'Temporada Montiory' },
      title: { type: String, default: 'Aprovecha las promociones de temporada' },
      description: {
        type: String,
        default:
          'Combos especiales, precios preferenciales y piezas seleccionadas para renovar tu guardarropa con elegancia.',
      },
      primaryCta: { type: String, default: 'Ver promociones' },
      secondaryCta: { type: String, default: 'Seguir explorando' },
    },
  },
  { timestamps: true },
)

export default mongoose.model('StorefrontSettings', storefrontSettingsSchema)
