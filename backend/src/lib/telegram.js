export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()

  if (!token || !chatId) {
    console.warn('Telegram skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing')
    return {
      skipped: true,
      reason: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing',
    }
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.description || `Telegram respondió ${response.status}`)
  }

  return payload
}

export function buildPaidOrderTelegramMessage({
  reference,
  customer,
  items,
  shippingZone,
  couponName,
  totalAmount,
  paymentMethod,
}) {
  const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
  const phone = `${customer.phoneCountryCode || '+57'} ${customer.phone || ''}`.trim()
  const address = [
    customer.address,
    customer.neighborhood,
    customer.city,
    customer.state,
  ]
    .filter(Boolean)
    .join(', ')
  const itemLines = (Array.isArray(items) ? items : []).map((item) => {
    const variant = item.variantLabel ? ` · ${item.variantLabel}` : ''
    return `- ${item.name}${variant} x${item.quantity}`
  })

  return [
    'Compra pagada en Montiory',
    '',
    `Referencia: ${reference}`,
    `Pago: ${paymentMethod || 'Pago en línea'}`,
    '',
    `Cliente: ${customerName}`,
    `Documento: ${customer.documentType || ''} ${customer.documentNumber || ''}`.trim(),
    `Teléfono: ${phone}`,
    `Correo: ${customer.email || ''}`,
    `Dirección de despacho: ${address}`,
    shippingZone?.place ? `Envío: ${shippingZone.place}${shippingZone.eta ? ` · ${shippingZone.eta}` : ''}` : null,
    couponName ? `Cupón: ${couponName}` : null,
    '',
    'Productos:',
    ...itemLines,
    '',
    `Total: ${totalAmount}`,
  ]
    .filter((line) => line != null)
    .join('\n')
}
