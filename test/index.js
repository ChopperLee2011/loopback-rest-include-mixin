import loopback from 'loopback'
import request from 'supertest'
import assert from 'assert'
import loopbackRestIncludeMixin from '../src/rest-include'

const app = loopback()
app.use(loopback.rest())

describe('loopbackRestIncludeMixin', () => {
  let server
  const db = app.dataSource('db', {adapter: 'memory'})
  const Review = db.createModel('Review', {customerId: Number, orderDate: Date})
  const Customer = db.createModel('Customer', {name: String})
  Customer.hasMany(Review, {as: 'reviews', foreignKey: 'customerId'})
  loopbackRestIncludeMixin(Customer, {includes: 'reviews'})
  app.model(Customer)

  const User = db.createModel('User', {name: String})
  const Post = db.createModel('Post', {title: String, userId: Number})
  const Order = db.createModel('Order', {amount: String, userId: Number})
  User.hasMany(Post, {as: 'posts', foreignKey: 'userId'})
  User.hasMany(Order, {as: 'orders', foreignKey: 'userId'})
  loopbackRestIncludeMixin(User, {includes: ['posts', 'orders']})
  app.model(User)

  before('test', done => {
    server = app.listen(done)
  })

  after('test', done => {
    server.close(done)
  })

  describe('#includes string', () => {
    before(() => {
      return Customer.create({name: 'Customer 1'})
        .then(() => Review.create({customerId: 1, orderDate: Date.now()}))
    })

    it('findById', () => {
      return request(server).get('/customers/1')
        .then(res => {
          assert.ok(res.body)
          assert.ok(Array.isArray(res.body.reviews))
          assert.equal(res.body.reviews[0].customerId, 1)
        })
    })

    it('find', () => {
      return request(server).get('/customers')
        .then(res => {
          assert.ok(res.body)
          assert.ok(Array.isArray(res.body))
          assert.ok(Array.isArray(res.body[0].reviews))
          assert.equal(res.body[0].reviews[0].customerId, 1)
        })
    })
  })

  describe('#includes array', () => {
    before(() => {
      return User.create({name: 'User 1'})
        .then(() => Post.create({userId: 1, title: 'Title 1'}))
        .then(() => Order.create({userId: 1, amount: '1.00'}))
    })

    it('findById', () => {
      return request(server).get('/users/1')
        .then(res => {
          assert.ok(res.body)
          assert.ok(Array.isArray(res.body.posts))
          assert.ok(Array.isArray(res.body.orders))
          assert.equal(res.body.posts[0].userId, 1)
          assert.equal(res.body.orders[0].userId, 1)
        })
    })

    it('find', () => {
      return request(server).get('/users')
        .then(res => {
          assert.ok(res.body)
          assert.ok(Array.isArray(res.body))
          assert.ok(Array.isArray(res.body[0].posts))
          assert.ok(Array.isArray(res.body[0].orders))
          assert.equal(res.body[0].posts[0].userId, 1)
          assert.equal(res.body[0].orders[0].userId, 1)
        })
    })
  })
})
