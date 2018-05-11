function decapitalizeKeys(obj) {
  const result = {}
  Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]).forEach(([k, v]) => result[k] = v)
  return result
}

module.exports = decapitalizeKeys
