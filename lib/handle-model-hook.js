module.exports = async function (name, opts) {
  const { _ } = this.ndut.helper
  const model = this.ndutDb.model[name]
  const history = this.ndutDb.model.DbjHistory
  model.observe('after save', async function (ctx) {
    let id = _.get(ctx, 'where.id')
    if (!id) id = _.get(ctx, 'options.body.id')
    if (!id) return
    const item = await model.findById(id)
    if (_.isEmpty(item)) return
    history.create({
      model: name,
      recordId: item.id,
      state: item[opts.stateColumn],
      action: ctx.isNewInstance ? 'CREATE' : 'UPDATE',
      siteId: _.get(ctx, 'options.site.id'),
      userId: _.get(ctx, 'options.user.id'),
      details: item
    })
  })
  model.observe('before delete', async function (ctx) {
    const item = await model.findById(_.get(ctx, 'where.id'))
    history.create({
      model: name,
      recordId: item.id,
      state: item[opts.stateColumn],
      action: 'REMOVE',
      siteId: _.get(ctx, 'options.site.id'),
      userId: _.get(ctx, 'options.user.id'),
      details: item
    })
  })
}
