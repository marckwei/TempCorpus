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
    name: "Object literal shorthand syntax with symbol lookup",
    body: function () {
        (function () {
            let a = 1;
            {
                let a = 2;
                var m = {a};
                assert.areEqual(m.a, 2, "Name node in object literal shorthand is binding correctly with inner block");
            }
        })();

        {
            let a2 = 1;
            ({a2} = {a2:2});
            assert.areEqual(a2, 2, "Destructuring object pattern : Name node in object literal shorthand is binding correctly with inner block");
        }
        {
            // Object literal shorthand - referenced in different scopoe works correctly.
            { d; }

            {
                { { d;} };
                var c = {d};
            }

            {
                var d = [];
            }
        }
    }
  },
  {
    name: "Getter/setter methods defined in object literal should not have 'prototype' property",
    body: function () {
        var o = {
            get m() {},
            set m(v) {}
        };
        var g = Object.getOwnPropertyDescriptor(o, 'm').get;
        var s = Object.getOwnPropertyDescriptor(o, 'm').set;
        assert.areEqual(false, g.hasOwnProperty('prototype'), "Getter method defined in object literal should not have 'prototype' property");
        assert.areEqual(false, s.hasOwnProperty('prototype'), "Setter method defined in object literal should not have 'prototype' property");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
