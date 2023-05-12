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
// Copyright (C) Microsoft Corporation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
    this.WScript.LoadScriptFile("util.js");
}

var tests = [
    {
        name: "Reflect define Property for typedarray can not set writable to false",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "0", {
                value: 42,
                configurable: false,
                enumerable: true,
                writable: false,
            });
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, false, "expect false");                    
        }
    },
    {
        name: "Reflect define Property for typedarray can not set configuration to true",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "0", {
                value: 42,
                configurable: true,
                enumerable: true,
                writable: false,
            });
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, false, "expect false");                    
        }
    },
    {
        name: "Reflect define Property for typedarray can not set enumerable to false",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "0", {
                value: 42,
                configurable: false,
                enumerable: false,
                writable: true,
            });
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, false, "expect false");                    
        }
    },
    {
        name: "Reflect define Property for typedarray can not use index >= length",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "2", {
                value: 42,
                configurable: false,
                enumerable: true,
                writable: true,
            });
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, false, "expect false");                    
        }
    },
    {
        name: "Reflect define Property for typedarray can not use neg zero index",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "-0", {
                value: 42,
                configurable: false,
                enumerable: true,
                writable: true,
            });
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, false, "expect false");                    
        }
    },
    {
        name: "Reflect define Property for typedarray can not use negative index",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "-10", {
                value: 42,
                configurable: false,
                enumerable: true,
                writable: true,
            });
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, false, "expect false");                    
        }
    },
    {
        name: "Reflect define Property for typedarray can not use double index",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "1.1", {
                value: 42,
                configurable: false,
                enumerable: true,
                writable: true,
            });
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, false, "expect false");                    
        }
    },
    {
        name: "Reflect define Property for typedarray can not use accessor descriptor",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "0", {
                get: function() {}
            }); 
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, false, "expect false");                    
        }
    },
    {
        name: "Reflect define Property for typedarray support use symbol index",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, Symbol('foo'), {
                value: 42,
                configurable: false,
                enumerable: true,
                writable: true,
            });
            assert.areEqual(sample[0], 0, "the value should be 0");
            assert.areEqual(result, true, "expect true");                    
        }
    },
    {
        name: "Reflect define Property for typedarray work with valid descriptor and index",
        body: function () {
            const sample = new Float64Array(2)
            var result = Reflect.defineProperty(sample, "0", {
                value: 42,
                configurable: false,
                enumerable: true,
                writable: true,
            }); 
            assert.areEqual(sample[0], 42, "the value should be 42");
            assert.areEqual(result, true, "expect true");                    
        }
    },
];

testRunner.runTests(tests, { verbose: false /*so no need to provide baseline*/ });
