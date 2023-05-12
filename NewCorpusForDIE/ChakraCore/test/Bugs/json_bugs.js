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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
  {
    name: "JSON.stringify on proxy object with different length",
    body: function () {
        var i = 0;
        var ret = JSON.stringify(new Proxy([], {
            get(t, pk, r){
                if (pk === "length") {
                    return ++i;
                }
                return Reflect.get(t, pk, r);
            }
        }));
        assert.areEqual("[null]", ret, "JSON.stringify will work on the array with the length 1");
        assert.areEqual(1, i, 'proxy.get with property "length" will be called only once');
    }
  },
  {
    name: "JSON.stringify on proxy object with length > 2**31",
    body: function () {
        assert.throws(() =>
        JSON.stringify(new Proxy([], {
            get(t, pk, r){
                if (pk === "length") {
                    return 2**31 + 1;
                }
                return Reflect.get(t, pk, r);
            }
        })), RangeError, "JSON.stringify will throw range error when needs to allocate string more that 2**31", "String length is out of bound");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
