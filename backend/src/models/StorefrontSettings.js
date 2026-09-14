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
  },
  { timestamps: true },
)

export default mongoose.model('StorefrontSettings', storefrontSettingsSchema)
