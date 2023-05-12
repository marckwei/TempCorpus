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

// With scope verification.
function f1() {
    var a = 20;

    var x = {
        a: "with_a",
        b: function b() { },            // this one goes to [Methods] group
        __proto__: {
            b: "proto_b",               // should resolve to local x.b, not x.__proto__.b
            c: "proto_c",               // should resolve to x.__proto__.c
            d: function proto_d() { },  // this in __proto__.[Methods] group
            __proto__: {
                e: "ancestor_e"
            }
        }
    };
    Object.defineProperty(x.__proto__.__proto__, "f", { value: "ancestor_f", enumerable: false }); // non-enumerable

    with (x) {
        var k = a;              //WScript.Echo(a, b, c, d, e, f);
        k;                      /**bp:evaluate('a');evaluate('b');evaluate('c');evaluate('d');evaluate('e');evaluate('f');locals()**/
    }
    
    return a;
}

f1();

with ({ outer3: "outer3" }) {
    (function foo() {
        var foo1 = "foo1";

        with ({ outer2: "outer2" }) {
            with ({ outer1: "outer1" }) {
                (function () {
                    foo1; foo;
                    /**bp:evaluate('outer1');evaluate('outer2');evaluate('foo1');evaluate('foo');evaluate('outer3');locals(1)**/
                }).apply({});
            }
        }
    })();
}

WScript.Echo("Pass");
