import deprecate from 'deprecate'
import restInclude from './rest-include'

export default deprecate(app => {
  app.loopback.modelBuilder.mixins.define('RestInclude', restInclude)
}, 'DEPRECATED: Use mixinSources, see https://github.com/chopperlee2011/loopback-rest-include-mixin#mixinsources')

module.exports = exports.default
