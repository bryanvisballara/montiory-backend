export function buildDefaultChipOrder(categoryIds, includeDecants = false) {
  return [
    'all',
    ...categoryIds.map(String),
    ...(includeDecants ? ['decants'] : []),
    'promos',
  ]
}

export function normalizeChipOrder(chipOrder, categoryIds, includeDecants = false) {
  const allowedIds = new Set([
    'all',
    'promos',
    ...categoryIds.map(String),
    ...(includeDecants ? ['decants'] : []),
  ])
  const seen = new Set()
  const orderedIds = (Array.isArray(chipOrder) ? chipOrder : [])
    .map(String)
    .filter((id) => allowedIds.has(id) && !seen.has(id) && seen.add(id))

  for (const id of buildDefaultChipOrder(categoryIds, includeDecants)) {
    if (!seen.has(id)) {
      orderedIds.push(id)
      seen.add(id)
    }
  }

  return orderedIds
}
