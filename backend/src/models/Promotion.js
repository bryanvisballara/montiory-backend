import mongoose from 'mongoose'

const promotionSchema = new mongoose.Schema(
  {
    itemCount: {
      type: Number,
      required: true,
      min: 2,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

promotionSchema.index({ itemCount: 1 }, { unique: true })

export default mongoose.model('Promotion', promotionSchema)
