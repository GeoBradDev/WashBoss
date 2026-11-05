import axe from 'axe-core'

// Runs axe-core on a rendered node and returns its violations in a compact
// shape so a failing toEqual([]) prints which rule fired and where.
// jsdom cannot paint, so axe usually reports color-contrast as incomplete
// rather than passed; real contrast is checked with Lighthouse in a browser.
export async function axeViolations(node, extraRules = {}) {
  const results = await axe.run(node, { rules: extraRules })
  return results.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => n.target.join(' ')),
  }))
}
