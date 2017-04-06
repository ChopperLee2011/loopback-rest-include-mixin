export default function (Model, options) {
  function injectIncludes (ctx, unused, next) {
    if (ctx.args.filter) {
      if (ctx.args.filter.include) {
        ctx.args.filter.include = [].concat(ctx.args.filter.include, options.includes)
      } else {
        ctx.args.filter.include = options.includes
      }
    } else {
      ctx.args.filter = {include: options.includes}
    }
    next()
  }

  Model.beforeRemote('find', injectIncludes)
  Model.beforeRemote('findById', injectIncludes)
}

module.exports = exports.default
