'use strict'

module.exports = once
module.exports.strict = onceStrict

module.exports.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

// Optimized once implementation
// Key optimizations:
// 1. Removed wrappy dependency (eliminates extra closure and arguments array creation)
// 2. Direct property assignment instead of Object.defineProperty (faster creation)
// 3. Fast-path check uses direct property access
function once (fn) {
  var f = function oncedWrapper () {
    // Fast path: check if already called first (property access is very fast)
    if (f.called) return f.value
    f.called = true
    // Cache result and return in one expression
    return f.value = fn.apply(this, arguments)
  }

  // Direct property assignment is much faster than Object.defineProperty
  f.called = false

  // Copy own properties from original function
  // Using for loop instead of forEach for better performance
  var keys = Object.keys(fn)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    f[key] = fn[key]
  }

  return f
}

// Optimized strict implementation
// Same optimizations as once() but with error throwing
function onceStrict (fn) {
  var name = fn.name || 'Function wrapped with `once`'

  var f = function oncedStrictWrapper () {
    if (f.called) throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }

  // Direct property assignment
  f.called = false
  f.onceError = name + " shouldn't be called more than once"

  // Copy own properties from original function
  var keys = Object.keys(fn)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    f[key] = fn[key]
  }

  return f
}
