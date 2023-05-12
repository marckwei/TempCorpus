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

var echo = WScript.Echo;

function testHasItem(o, prop) {
    try {
        Object.defineProperty(o, prop, {
            get: function () { echo(" ", "FAIL: THIS SHOULD NOT BE CALLED"); },
            configurable: false,
            enumerable: false
        });
    } catch (e) {
        echo(" ", "pass", "...can not defineProperty...", "(" + prop + ")");
        return;
    }
    echo(" ", o.hasOwnProperty(prop) && !o.propertyIsEnumerable(prop) ? "pass" : "fail",
        "(" + prop + ")");
}

var objs = {
    "empty object": function () {
        return {};
    },

    "empty array": function () {
        return [];
    },

    "number object": function () {
        return new Number(123);
    },

    "string object": function () {
        return new String("test");
    },

    "Object": function () {
        return Object;
    },

    "global object": function () {
        return this;
    },

    "object with 1 property": function () {
        return {
            hello: "world"
        };
    },

    "object with many properties": function () {
        var o = {};
        for (var i = 0; i < 50; i++) {
            Object.defineProperty(o, "prop" + i, {
                value: "value" + i
            });
        }
        return o;
    },

    "object with accessor": function () {
        return {
            get hello() { return "world"; },
            0: "value0",
            1: "value1",
            2: "value2"
        };
    },

    "array": function () {
        return [0, 1, 2, 3];
    },

    "es5 array": function () {
        var o = [0, 1, 2, 3];
        Object.defineProperty(o, 1, {
            get: function() { return "getter1"; }
        });
        return o;
    },
};

var props = [
    "abc",
    -1,
    0,
    1,
    10,
    0xfffffffe,
    "x y",
    "x\u0000y",
    "x\u0000\u0000y"
];

for (var obj in objs) {
    echo("Test " + obj);
    for(var prop in props) {
        testHasItem(objs[obj](), props[prop]);
    }
}
