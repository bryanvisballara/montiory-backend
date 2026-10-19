function trimUrl(value) {
  return String(value || '').trim().slice(0, 2048)
}

export function normalizeCollectionChipImages(input) {
  const source = input && typeof input === 'object' ? input : {}

  return {
    all: trimUrl(source.all),
    promos: trimUrl(source.promos),
  }
}
