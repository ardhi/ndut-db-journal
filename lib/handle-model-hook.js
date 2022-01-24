module.exports = async function (name, opts) {
  const { _ } = this.ndut.helper
  const model = this.ndutDb.model[name]
  const history = this.ndutDb.model.DbjHistory
  model.observe('after save', async function (ctx) {
    let item = ctx.instance
    if (!item) item = await model.findById(_.get(ctx, 'where.id'))
    history.create({
      model: name,
      recordId: item.id,
      state: item[opts.stateColumn],
      isNew: ctx.isNewInstance,
      details: item
    })
  })
}
