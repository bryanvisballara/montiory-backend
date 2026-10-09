const DEFAULT_SEASONAL_WELCOME = {
  enabled: true,
  version: '1',
  imageUrl: '',
  mediaBadge: 'Edición limitada',
  eyebrow: 'Temporada Montiory',
  title: 'Aprovecha las promociones de temporada',
  description:
    'Combos especiales, precios preferenciales y piezas seleccionadas para renovar tu guardarropa con elegancia.',
  primaryCta: 'Ver promociones',
  secondaryCta: 'Seguir explorando',
}

function trimText(value, maxLength) {
  return String(value || '')
    .trim()
    .slice(0, maxLength)
}

export function normalizeSeasonalWelcome(input) {
  const source = input && typeof input === 'object' ? input : {}

  return {
    enabled: source.enabled !== false,
    version: trimText(source.version, 32) || DEFAULT_SEASONAL_WELCOME.version,
    imageUrl: trimText(source.imageUrl, 2048),
    mediaBadge: trimText(source.mediaBadge, 80) || DEFAULT_SEASONAL_WELCOME.mediaBadge,
    eyebrow: trimText(source.eyebrow, 120) || DEFAULT_SEASONAL_WELCOME.eyebrow,
    title: trimText(source.title, 200) || DEFAULT_SEASONAL_WELCOME.title,
    description: trimText(source.description, 600) || DEFAULT_SEASONAL_WELCOME.description,
    primaryCta: trimText(source.primaryCta, 80) || DEFAULT_SEASONAL_WELCOME.primaryCta,
    secondaryCta: trimText(source.secondaryCta, 80) || DEFAULT_SEASONAL_WELCOME.secondaryCta,
  }
}

export function getDefaultSeasonalWelcome() {
  return { ...DEFAULT_SEASONAL_WELCOME }
}
