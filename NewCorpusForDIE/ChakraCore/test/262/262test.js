function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

"use strict";
var $ = {  global: this,  createRealm(options) {    options = options || {};    options.globals = options.globals || {};    var realm = WScript.LoadScript(this.source, 'samethread');    realm.$.source = this.source;    realm.$.destroy = function () {      if (options.destroy) {        options.destroy();      }    };    for(var glob in options.globals) {      realm.$.global[glob] = options.globals[glob];    }    return realm.$;  },  evalScript(code) {    try {      WScript.LoadScript(code);      return { type: 'normal', value: undefined };    } catch (e) {      return { type: 'throw', value: e };    }  },  getGlobal(name) {    return this.global[name];  },  setGlobal(name, value) {    this.global[name] = value;  },  destroy() { /* noop */ },  source: "var $ = {  global: this,  createRealm(options) {    options = options || {};    options.globals = options.globals || {};    var realm = WScript.LoadScript(this.source, 'samethread');    realm.$.source = this.source;    realm.$.destroy = function () {      if (options.destroy) {        options.destroy();      }    };    for(var glob in options.globals) {      realm.$.global[glob] = options.globals[glob];    }    return realm.$;  },  evalScript(code) {    try {      WScript.LoadScript(code);      return { type: 'normal', value: undefined };    } catch (e) {      return { type: 'throw', value: e };    }  },  getGlobal(name) {    return this.global[name];  },  setGlobal(name, value) {    this.global[name] = value;  },  destroy() { /* noop */ },  source: \"\"};"};function Test262Error(message) {
    if (message) this.message = message;
}

Test262Error.prototype.name = "Test262Error";

Test262Error.prototype.toString = function () {
    return "Test262Error: " + this.message;
};

function $ERROR(err) {
  if(typeof err === "object" && err !== null && "name" in err) {
    print('test262/error ' + err.name + ': ' + err.message);
  } else {
    print('test262/error Test262Error: ' + err);
  }
}

function $DONE(err) {
  if (err) {
    $ERROR(err);
  }
  print('PASS');
  $.destroy();
}

function $LOG(str) {
  print(str);
}

function assert(mustBeTrue, message) {
  if (mustBeTrue === true) {
    return;
  }

  if (message === undefined) {
    message = 'Expected true but got ' + String(mustBeTrue);
  }
  $ERROR(message);
}

assert._isSameValue = function (a, b) {
  if (a === b) {
    // Handle +/-0 vs. -/+0
    return a !== 0 || 1 / a === 1 / b;
  }

  // Handle NaN vs. NaN
  return a !== a && b !== b;
};

assert.sameValue = function (actual, expected, message) {
  if (assert._isSameValue(actual, expected)) {
    return;
  }

  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  message += 'Expected SameValue(«' + String(actual) + '», «' + String(expected) + '») to be true';

  $ERROR(message);
};

assert.notSameValue = function (actual, unexpected, message) {
  if (!assert._isSameValue(actual, unexpected)) {
    return;
  }

  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  message += 'Expected SameValue(«' + String(actual) + '», «' + String(unexpected) + '») to be false';

  $ERROR(message);
};

assert.throws = function (expectedErrorConstructor, func, message) {
  if (typeof func !== "function") {
    $ERROR('assert.throws requires two arguments: the error constructor ' +
      'and a function to run');
    return;
  }
  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  try {
    func();
  } catch (thrown) {
    if (typeof thrown !== 'object' || thrown === null) {
      message += 'Thrown value was not an object!';
      $ERROR(message);
    } else if (thrown.constructor !== expectedErrorConstructor) {
      message += 'Expected a ' + expectedErrorConstructor.name + ' but got a ' + thrown.constructor.name;
      $ERROR(message);
    }
    return;
  }

  message += 'Expected a ' + expectedErrorConstructor.name + ' to be thrown but no exception was thrown at all';
  $ERROR(message);
};

assert.throws.early = function(err, code) {
  let wrappedCode = `function wrapperFn() { ${code} }`;
  let ieval = eval;

  assert.throws(err, () => { Function(wrappedCode); }, `Function: ${code}`);
};


// Create workers and start them all spinning.  We set atomic slots to make
// them go into a wait, thus controlling the waiting order.  Then we wake them
// one by one and observe the wakeup order.

for (var i = 0; i < 3; i++) {
$262.agent.start(
`
$262.agent.receiveBroadcast(function (sab) {
  var ia = new Int32Array(sab);

  while (Atomics.load(ia, ${i}) == 0);

  // the one below should produce 'not-equal'.
  // because ia[i] is no longer 0! (see the loop above)
  // otherwise it would wait until timeout
  $262.agent.report(${i} + Atomics.wait(ia, ${i}, 0));
  $262.agent.leaving();
})
`);
}

var ia = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 3));
$262.agent.broadcast(ia.buffer);

// the `while` loop above waits until we store a value below
for (var i = 0; i < 3; i++) {
  Atomics.store(ia, i, 1);
  $262.agent.sleep(500);
}

for (var i = 0; i < 3; i++) {
  assert.sameValue(Atomics.load(ia, i), 1);
  assert.sameValue(getReport(), i + "not-equal");
}

function getReport() {
    var r;
    while ((r = $262.agent.getReport()) == null)
        $262.agent.sleep(100);
    return r;
}

;$DONE();
;$.destroy();