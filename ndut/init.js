const handleModelHook = require('../lib/handle-model-hook')

module.exports = async function (options) {
  const { _ } = this.ndut.helper
  const model = {}
  for (const s of this.ndutDb.schemas) {
    if (['DbjHistory'].includes(s.name)) continue
    let feature = options.model[s.name]
    if (!feature) feature = _.get(s, 'feature.journal')
    if (feature && _.isBoolean(feature)) feature = { stateColumn: 'status' }
    if (!feature) continue
    if (feature && _.has(s.properties, feature.stateColumn)) model[s.name] = feature
    else throw new Error(`Model '${s.name}' doesn't have '${feature.stateColumn}' column`)
  }
  this.ndutDbJournal.model = model
  for (const m of Object.keys(model)) {
    const cfg = model[m]
    await handleModelHook.call(this, m, cfg)
  }
}
