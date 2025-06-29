export function mergeSpecs(target, source) {
  // 1. PATHS ------------------------------------------
  target.paths = Object.assign({}, target.paths, source.paths);

  // 2. SCHEMAS (components.schemas) --------------------
  target.components ??= {};
  target.components.schemas ??= {};
  if (source.components?.schemas) {
    target.components.schemas = Object.assign({}, target.components.schemas, source.components.schemas);
  }

  // 3. Теги (optional) ---------------------------------
  if (source.tags) {
    const tagNames = new Set(target.tags?.map(t => t.name) ?? []);
    target.tags = [
      ...(target.tags ?? []),
      ...source.tags.filter(t => !tagNames.has(t.name))
    ];
  }

  return target;
}
