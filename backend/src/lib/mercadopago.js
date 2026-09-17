import crypto from 'node:crypto'

const mercadoPagoApiBaseUrl = 'https://api.mercadopago.com'

export function getMercadoPagoAccessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || ''
}

export function getMercadoPagoPublicKey() {
  return process.env.MERCADOPAGO_PUBLIC_KEY?.trim() || ''
}

export function isMercadoPagoSandbox() {
  const accessToken = getMercadoPagoAccessToken()

  if (accessToken.startsWith('TEST-')) {
    return true
  }

  if (accessToken.startsWith('APP_USR-')) {
    return false
  }

  return String(process.env.MERCADOPAGO_SANDBOX || '').trim().toLowerCase() === 'true'
}

export function getApiPublicBaseUrl() {
  return (
    process.env.API_PUBLIC_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    'https://montiory-backend.onrender.com'
  ).replace(/\/$/, '')
}

export function getMercadoPagoWebhookUrl() {
  return `${getApiPublicBaseUrl()}/api/storefront/checkout/online/mercadopago/webhook`
}

export function mapMercadoPagoPaymentStatus(status) {
  switch (String(status || '').trim().toLowerCase()) {
    case 'approved':
      return 'approved'
    case 'rejected':
    case 'cancelled':
      return 'declined'
    case 'refunded':
    case 'charged_back':
      return 'voided'
    default:
      return 'pending'
  }
}

export function parseMercadoPagoNotification(request) {
  const body = request.body && typeof request.body === 'object' ? request.body : {}
  const query = request.query && typeof request.query === 'object' ? request.query : {}
  const type = body.type || body.topic || query.type || query.topic || ''
  const id = body.data?.id || body.id || query['data.id'] || query.id || ''

  return {
    type: String(type || '').trim().toLowerCase(),
    id: String(id || '').trim(),
  }
}

export function verifyMercadoPagoWebhookSignature(request, dataId) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim()

  if (!secret) {
    return true
  }

  const signatureHeader = String(request.headers['x-signature'] || '')

  if (!signatureHeader) {
    return true
  }

  const requestId = String(request.headers['x-request-id'] || '')
  const signatureParts = Object.fromEntries(
    signatureHeader
      .split(',')
      .map((part) => part.trim().split('='))
      .filter((entry) => entry.length === 2),
  )
  const timestamp = signatureParts.ts || ''
  const hash = signatureParts.v1 || ''

  if (!timestamp || !hash || !requestId || !dataId) {
    return false
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`
  const expectedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  if (expectedHash.length !== hash.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))
}

async function mercadoPagoRequest(path, { method = 'GET', body } = {}) {
  const accessToken = getMercadoPagoAccessToken()

  if (!accessToken) {
    throw new Error('Mercado Pago no está configurado en el servidor')
  }

  const response = await fetch(`${mercadoPagoApiBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Mercado Pago respondió ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export async function createMercadoPagoPreference({
  reference,
  items,
  customer,
  shippingAmount,
  totalAmount,
  redirectUrl,
  notificationUrl,
}) {
  const preferenceItems = (Array.isArray(items) ? items : [])
    .map((item) => ({
      title: String(item.name || 'Producto Montiory').slice(0, 256),
      quantity: Number(item.quantity || 1),
      currency_id: 'COP',
      unit_price: Number(item.unitPrice || 0),
    }))
    .filter((item) => item.quantity > 0 && item.unit_price >= 0)

  const shippingPrice = Number(shippingAmount || 0)

  if (shippingPrice > 0) {
    preferenceItems.push({
      title: 'Envío',
      quantity: 1,
      currency_id: 'COP',
      unit_price: shippingPrice,
    })
  }

  const expectedTotal = Number(totalAmount || 0)
  const currentTotal = preferenceItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const roundingDifference = Number((expectedTotal - currentTotal).toFixed(2))

  if (Math.abs(roundingDifference) >= 1) {
    preferenceItems.splice(0, preferenceItems.length, {
      title: `Pedido Montiory ${reference}`.slice(0, 256),
      quantity: 1,
      currency_id: 'COP',
      unit_price: expectedTotal,
    })
  }

  if (!preferenceItems.length && expectedTotal > 0) {
    preferenceItems.push({
      title: `Pedido Montiory ${reference}`.slice(0, 256),
      quantity: 1,
      currency_id: 'COP',
      unit_price: expectedTotal,
    })
  }

  if (!preferenceItems.length) {
    throw new Error('No hay ítems válidos para crear el pago en Mercado Pago')
  }

  const isHttpsRedirect = String(redirectUrl || '').startsWith('https://')
  const preference = await mercadoPagoRequest('/checkout/preferences', {
    method: 'POST',
    body: {
      items: preferenceItems,
      payer: {
        name: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        phone: {
          area_code: String(customer.phoneCountryCode || '+57').replace(/\D/g, ''),
          number: String(customer.phone || '').replace(/\D/g, ''),
        },
        identification: customer.documentNumber
          ? {
              type: String(customer.documentType || 'CC').slice(0, 20),
              number: String(customer.documentNumber),
            }
          : undefined,
      },
      back_urls: {
        success: redirectUrl,
        failure: redirectUrl,
        pending: redirectUrl,
      },
      ...(isHttpsRedirect ? { auto_return: 'approved' } : {}),
      external_reference: reference,
      notification_url: notificationUrl,
      statement_descriptor: 'MONTIORY',
      metadata: {
        reference,
      },
    },
  })

  const checkoutUrl = preference.init_point || preference.sandbox_init_point

  return {
    preference,
    checkoutUrl,
  }
}

export async function getMercadoPagoPayment(paymentId) {
  return mercadoPagoRequest(`/v1/payments/${encodeURIComponent(paymentId)}`)
}

export async function findMercadoPagoPaymentByReference(reference) {
  const payload = await mercadoPagoRequest(
    `/v1/payments/search?sort=date_created&criteria=desc&external_reference=${encodeURIComponent(reference)}`,
  )
  const results = Array.isArray(payload?.results) ? payload.results : []
  return (
    results.find((payment) => String(payment.status || '').toLowerCase() === 'approved') ||
    results[0] ||
    null
  )
}

export async function getMercadoPagoMerchantOrder(orderId) {
  return mercadoPagoRequest(`/merchant_orders/${encodeURIComponent(orderId)}`)
}
