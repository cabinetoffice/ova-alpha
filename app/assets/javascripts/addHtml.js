function addHtml (str) {
  const parser = new DOMParser() // eslint-disable-line
  const doc = parser.parseFromString(str, 'text/html')
  return doc.body
}

module.exports = {
  addHtml
}
