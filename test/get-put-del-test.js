/* Copyright (c) 2012-2013 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT +no-false-attribs License <https://github.com/rvagg/node-levelup/blob/master/LICENSE>
 */

var errors  = require('../lib/errors.js')
  , async   = require('async')
  , common  = require('./common')

  , assert  = require('referee').assert
  , refute  = require('referee').refute
  , buster  = require('bustermove')

buster.testCase('Basic API', {
    'setUp': common.commonSetUp
  , 'tearDown': common.commonTearDown

  , 'Simple operations': {

        'get() on empty database causes error': function (done) {
          this.openTestDatabase(function (db) {
            db.get('undefkey', function (err, value) {
              refute(value)
              assert.isInstanceOf(err, Error)
              assert.isInstanceOf(err, errors.LevelUPError)
              assert.isInstanceOf(err, errors.NotFoundError)
              assert.match(err, '[undefkey]')
              done()
            })
          })
        }

      , 'put() and get() simple string key/value pairs': function (done) {
          this.openTestDatabase(function (db) {
            db.put('some key', 'some value stored in the database', function (err) {
              refute(err)
              db.get('some key', function (err, value) {
                refute(err)
                assert.equals(value, 'some value stored in the database')
                done()
              })
            })
          })
        }

      , 'del() on empty database doesn\'t cause error': function (done) {
          this.openTestDatabase(function (db) {
            db.del('undefkey', function (err) {
              refute(err)
              done()
            })
          })
        }

      , 'del() works on real entries': function (done) {
          this.openTestDatabase(function (db) {
            async.series(
                [
                    function (callback) {
                      async.forEach(
                          ['foo', 'bar', 'baz']
                        , function (key, callback) {
                            db.put(key, 1 + Math.random(), callback)
                          }
                        , callback
                      )
                    }
                  , function (callback) {
                      db.del('bar', callback)
                    }
                  , function (callback) {
                      async.forEach(
                          ['foo', 'bar', 'baz']
                        , function (key, callback) {
                            db.get(key, function (err, value) {
                              // we should get foo & baz but not bar
                              if (key == 'bar') {
                                assert(err)
                                refute(value)
                              } else {
                                refute(err)
                                assert(value)
                              }
                              callback()
                            })
                          }
                        , callback
                      )
                    }
                ]
              , done
            )
          })
        }
    }
})