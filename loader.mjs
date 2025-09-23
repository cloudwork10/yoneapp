// Custom loader to handle TypeScript files without stripping
export async function resolve(specifier, context, nextResolve) {
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  // Skip TypeScript stripping for node_modules
  if (url.includes('node_modules')) {
    return nextLoad(url, context);
  }
  
  return nextLoad(url, context);
}
