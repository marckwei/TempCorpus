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

let threw = false
try
{
    var obj1 = {};
    var func0 = function () {
    for (var _strvar2 in Object) {
        Object.prototype[_strvar2] = {};
    }
    };
    let cnt = 0;

    Object.defineProperty(obj1, 'prop0', {
    get: function () {
        print("BAD!");
    },
    configurable: true
    });

    Object.prototype.prop0 = func0();
    Object.prototype.prop2 = func0();

    Object.prop2 = Object.defineProperty(Object.prototype, 'prop2', {
    get: function () {
    }});
    (function () {
    'use strict';
    for (var _strvar0 in Object) {
        Object.prototype[_strvar0] = func0();
    }
    }());
}
catch(e)
{
    threw = true;
}

print(threw ? "Pass" : "Fail")