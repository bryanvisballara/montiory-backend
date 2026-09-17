import { sendBrevoEmail } from './brevo.js'
import { buildAdminOrderNotificationEmail, buildOrderPlacedEmail } from './email-templates.js'
import { getItemProductLinks, getOrderStorefrontUrl } from './storefront-urls.js'
import { buildPaidOrderTelegramMessage, sendTelegramMessage } from './telegram.js'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getAdminOrderEmail() {
  return process.env.ADMIN_ORDER_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || 'orders@montiory.com'
}

function formatOrderItems(items = []) {
  return items.map((item) => {
    const productLinks = getItemProductLinks(item)

    return {
      ...item,
      unitPriceLabel: formatCurrency(item.unitPrice),
      lineTotalLabel: formatCurrency(item.lineTotal),
      productUrl: productLinks[0]?.url || '',
      productLinks,
    }
  })
}

export async function notifyPaidOrder({ order, customer, session }) {
  const reference = order.reference
  const items = formatOrderItems(
    (order.items || []).map((item, index) => {
      const plain = typeof item.toObject === 'function' ? item.toObject() : item
      const sessionItem = session.items?.[index] || {}

      return {
        ...plain,
        promoItems: plain.promoItems?.length ? plain.promoItems : sessionItem.promoItems || [],
        product: plain.product || sessionItem.product || null,
        productId: plain.productId || sessionItem.productId || plain.product || sessionItem.product || null,
      }
    }),
  )
  const shippingZone = {
    place: session.shippingZone?.place || order.shippingPlace || '',
    eta: session.shippingZone?.eta || order.shippingEta || '',
    price: Number(session.shippingAmount || order.shippingPrice || 0),
    priceLabel: formatCurrency(session.shippingAmount || order.shippingPrice || 0),
  }
  const customerPayload = {
    firstName: customer.firstName || session.customer?.firstName || '',
    lastName: customer.lastName || session.customer?.lastName || '',
    email: customer.email || session.customer?.email || '',
    phone: customer.phone || session.customer?.phone || '',
    phoneCountryCode: customer.phoneCountryCode || session.customer?.phoneCountryCode || '+57',
    documentType: session.customer?.documentType || '',
    documentNumber: session.customer?.documentNumber || '',
    address: session.customer?.address || customer.address || '',
    neighborhood: session.customer?.neighborhood || '',
    city: session.customer?.city || customer.city || '',
    state: session.customer?.state || '',
  }
  const couponName = session.coupon?.name || order.couponName || ''
  const totalAmountLabel = formatCurrency(order.totalAmount)
  const customerName = `${customerPayload.firstName} ${customerPayload.lastName}`.trim()

  const results = await Promise.allSettled([
    sendBrevoEmail({
      to: {
        email: customerPayload.email,
        name: customerName,
      },
      subject: `Compra exitosa ${reference}`,
      htmlContent: buildOrderPlacedEmail({
        customerName: customerPayload.firstName,
        orderReference: reference,
        items,
        totalAmount: order.totalAmount,
        shippingPlace: shippingZone.place,
        shippingPrice: shippingZone.price,
      }),
    }),
    sendBrevoEmail({
      to: {
        email: getAdminOrderEmail(),
        name: 'Despachos Montiory',
      },
      subject: `Orden pagada ${reference}`,
      htmlContent: buildAdminOrderNotificationEmail({
        reference,
        customer: customerPayload,
        items,
        shippingZone,
        coupon: couponName
          ? {
              name: couponName,
              discountAmountLabel: `- ${formatCurrency(session.discountAmount || order.discountAmount || 0)}`,
            }
          : null,
        baseSubtotalAmount: formatCurrency(session.subtotalAmount || order.subtotalAmount || 0),
        discountAmount: Number(session.discountAmount || order.discountAmount || 0) > 0
          ? `- ${formatCurrency(session.discountAmount || order.discountAmount || 0)}`
          : 'Sin descuento',
        totalAmount: totalAmountLabel,
        paid: true,
        paymentMethod: 'Mercado Pago · pago en línea',
      }),
    }),
    sendTelegramMessage(
      buildPaidOrderTelegramMessage({
        reference,
        customer: customerPayload,
        items,
        shippingZone,
        couponName,
        totalAmount: totalAmountLabel,
        paymentMethod: 'Mercado Pago · pago en línea',
        orderUrl: getOrderStorefrontUrl(reference),
      }),
    ),
  ])

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const channel = ['customer-email', 'admin-email', 'telegram'][index]
      console.error(`Paid order ${channel} failed`, result.reason)
    }
  })
}
