export function getPublicStorefrontBaseUrl() {
  const candidates = [
    process.env.STOREFRONT_PUBLIC_URL,
    process.env.STOREFRONT_URL,
    process.env.FRONTEND_URL,
    process.env.PUBLIC_STORE_URL,
  ]
    .map((value) => String(value || '').trim().replace(/\/$/, ''))
    .filter(Boolean)
    .filter((url) => !url.includes('localhost') && !url.includes('127.0.0.1'))

  return candidates[0] || 'https://montiory.com'
}

export function slugifyProductName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getProductStorefrontUrl({ name, productId }) {
  const id = String(productId || '').trim()

  if (!id) {
    return ''
  }

  const slug = slugifyProductName(name)
  const path = slug ? `/producto/${slug}-${id}` : `/producto/${id}`
  return `${getPublicStorefrontBaseUrl()}${path}`
}

export function getItemProductLinks(item = {}) {
  const promoItems = Array.isArray(item.promoItems) ? item.promoItems : []
  const promoLinks = promoItems
    .map((promoItem) => ({
      name: promoItem.name || item.name,
      url: getProductStorefrontUrl({
        name: promoItem.name || item.name,
        productId: promoItem.productId || promoItem.product,
      }),
    }))
    .filter((link) => link.url)

  if (promoLinks.length) {
    return promoLinks
  }

  const url = item.productUrl || getProductStorefrontUrl({
    name: item.name,
    productId: item.product?._id || item.product || item.productId,
  })

  return url ? [{ name: item.name, url }] : []
}
