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
// Copyright (c) 2021 ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "OS21193960: Proxy [[Construct]] trap confuses super call flag",
        body: function () {
            function test(){
              let ctorCount = 0;
              function ctor() {
                  if (new.target !== undefined) {
                      ctorCount++;
                      this.prop0 = 123;
                      assert.isTrue(proxy === new.target, "proxy === new.target");
                  } else {
                      assert.fail('call ctor');
                  }
              }

              let ctor_prototype = ctor.prototype;
              let getCount = 0;
              let proxyHandler = {
                ['get'](handler, prop, target) {
                  getCount++;
                  assert.isTrue(prop !== 'prop0', "prop !== 'prop0'");
                  switch(prop) {
                    case 'prototype':
                      return ctor_prototype;
                  }
                }
              };

              var proxy = new Proxy(ctor, proxyHandler);
              let newProxy = new proxy;

              assert.isTrue(proxy !== newProxy, 'proxy !== newProxy');
              assert.areEqual('object', typeof newProxy, '"object" === typeof newProxy');
              assert.areEqual(1, ctorCount, "1 === ctorCount");

              assert.areEqual(123, newProxy.prop0, "123 === newProxy.prop0");
              assert.areEqual(1, getCount, "1 === getCount");
            };

            test();
            test();
        }
    },
    {
        name: "Proxy target is a base class",
        body: function () {
            function test(){
              let ctorCount = 0;
              class ctor {
                  constructor() {
                  if (new.target !== undefined) {
                      ctorCount++;
                      this.prop0 = 123;
                      assert.isTrue(proxy === new.target, "proxy === new.target");
                  } else {
                      assert.fail('call ctor');
                  }
                }
              }

              let ctor_prototype = ctor.prototype;
              let getCount = 0;
              let proxyHandler = {
                ['get'](handler, prop, target) {
                  getCount++;
                  assert.isTrue(prop !== 'prop0', "prop !== 'prop0'");
                  switch(prop) {
                    case 'prototype':
                      return ctor_prototype;
                  }
                }
              };

              var proxy = new Proxy(ctor, proxyHandler);
              let newProxy = new proxy;

              assert.isTrue(proxy !== newProxy, 'proxy !== newProxy');
              assert.areEqual('object', typeof newProxy, '"object" === typeof newProxy');
              assert.areEqual(1, ctorCount, "1 === ctorCount");

              assert.areEqual(123, newProxy.prop0, "123 === newProxy.prop0");
              assert.areEqual(2, getCount, "2 === getCount");
            };

            test();
            test();
        }
    },
    {
        name: "Proxy target is a derived class",
        body: function () {
            function test(){
              let baseCount = 0;
              class base {
                constructor() {
                  if (new.target !== undefined) {
                      baseCount++;
                      assert.isTrue(proxy === new.target, "proxy === new.target");
                  } else {
                      assert.fail('call base');
                  }
                }
              };

              let ctorCount = 0;
              class ctor extends base {
                  constructor() {
                  if (new.target !== undefined) {
                      ctorCount++;
                      super();
                      this.prop0 = 123;
                      assert.isTrue(proxy === new.target, "proxy === new.target");
                  } else {
                      assert.fail('call ctor');
                  }
                }
              }

              let ctor_prototype = ctor.prototype;
              let getCount = 0;
              let proxyHandler = {
                ['get'](handler, prop, target) {
                  getCount++;
                  assert.isTrue(prop !== 'prop0', "prop !== 'prop0'");
                  switch(prop) {
                    case 'prototype':
                      return ctor_prototype;
                  }
                }
              };

              var proxy = new Proxy(ctor, proxyHandler);
              let newProxy = new proxy;

              assert.isTrue(proxy !== newProxy, 'proxy !== newProxy');
              assert.areEqual('object', typeof newProxy, '"object" === typeof newProxy');
              assert.areEqual(1, ctorCount, "1 === ctorCount");
              assert.areEqual(1, baseCount, "1 === baseCount");

              assert.areEqual(123, newProxy.prop0, "123 === newProxy.prop0");
              assert.areEqual(2, getCount, "2 === getCount");
            };

            test();
            test();
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
