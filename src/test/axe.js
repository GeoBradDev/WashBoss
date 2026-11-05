import axe from 'axe-core'

// Runs axe-core on a rendered node and returns its violations in a compact
// shape so a failing toEqual([]) prints which rule fired and where.
// color-contrast is always off: jsdom cannot compute it, and colors are
// tracked in issue #4.
export async function axeViolations(node, extraRules = {}) {
  const results = await axe.run(node, {
    rules: { 'color-contrast': { enabled: false }, ...extraRules },
  })
  return results.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => n.target.join(' ')),
  }))
}
