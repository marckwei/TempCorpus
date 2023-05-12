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
// Copyright (c) ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

// @ts-check
/// <reference path="..\UnitTestFramework\UnitTestFramework.js" />

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "simple copy",
        body: function ()
        {
            let orig = {};
            let sym = Symbol("c");
            orig.a = 1;
            orig.b = "asdf";
            orig[sym] = "qwert";
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.b, orig.b);
            assert.areEqual(newObj.a, orig.a);
            assert.areEqual(newObj[sym], orig[sym]);
        }
    },
    {
        name: "non-path type handler",
        body: function ()
        {
            let orig = {};
            orig.a = 1;
            orig.b = "asdf";
            delete orig.a;
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.b, orig.b);
            assert.areEqual(newObj.a, orig.a);
        }
    },
    {
        name: "has getter",
        body: function ()
        {
            let orig = {};
            orig.a = 1;
            Object.defineProperty(orig, 'b', {
                get: function() { return "asdf"; }, enumerable: true
              });
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.b, orig.b);
            assert.areEqual(newObj.a, orig.a);
        }
    },
    {
        name: "has setter",
        body: function ()
        {
            let orig = {};
            orig.a = 1;
            Object.defineProperty(orig, 'b', {
                set: function() {  }, enumerable: true
              });
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.b, orig.b);
            assert.areEqual(newObj.a, orig.a);
        }
    },
    {
        name: "different proto",
        body: function ()
        {
            let protoObj = {};
            let orig = Object.create(protoObj);
            orig.a = 1;
            orig.b = "asdf";
            
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.b, orig.b);
            assert.areEqual(newObj.a, orig.a);
        }
    },
    {
        name: "non-enumerable",
        body: function ()
        {
            let orig = {};
            orig.a = 1;
            Object.defineProperty(orig, 'b', {
                value: "asdf", enumerable: false
              });
            
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.b, undefined);
            assert.areEqual(newObj.a, orig.a);
        }
    },
    {
        name: "proto accessor",
        body: function ()
        {
            Object.defineProperty(Object.prototype, 'b', {
                get: function() { return "asdf"; }
              });
            let orig = {};
            orig.a = 1;
            
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.b, "asdf");
            assert.areEqual(newObj.a, orig.a);
        }
    },
    {
        name: "has object array",
        body: function ()
        {
            let orig = {};
            orig.a = 1;
            orig[0] = 2;
            
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.a, orig.a);
            assert.areEqual(newObj[0], orig[0]);
        }
    },
    {
        name: "target has object array",
        body: function ()
        {
            let orig = {};
            orig.a = 1;
            orig[0] = 2;
            let newObj = {};
            newObj[0] = 3;
            Object.assign(newObj, orig);
            assert.areEqual(newObj.a, orig.a);
            assert.areEqual(newObj[0], orig[0]);
        }
    },
    {
        name: "has object array with non-enumerable prop",
        body: function ()
        {
            let orig = {};
            orig.a = 1;
            orig[0] = 2;
            
            Object.defineProperty(orig, '1', {
                value: "3", enumerable: false
              });
            
            let newObj = Object.assign({}, orig);
            assert.areEqual(newObj.a, orig.a);
            assert.areEqual(newObj[0], orig[0]);
            assert.areEqual(newObj[1], undefined);
        }
    },
    {
        name: "Throw on assign to read-only",
        body() {
            const obj = {
                get prop() { return 1; }
            };
            assert.throws(() => Object.assign(obj, obj), TypeError, "Object.assign should throw (readonly property)");
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
