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

//
// Display __proto__ or [prototype]
//

Object.keys(this).forEach(function (p) {
    Object.defineProperty(this, p, { enumerable: false });
});
Object.defineProperty(this, "__saved__proto__desc", {
    value: Object.getOwnPropertyDescriptor(Object.prototype, "__proto__"),
    enumerable: false,
});

(function () {
    arguments = null;
    this; /**bp:locals(2)**/

    Object.defineProperty(Object.prototype, "__proto__", { get: function () { } });
    this; /**bp:locals(2)**/

    Object.defineProperty(Object.prototype, "__proto__", { get: __saved__proto__desc.get });
    this; /**bp:locals(2)**/

    Object.defineProperty(Object.prototype, "__proto__", { set: function () { } });
    this; /**bp:locals(2)**/

    Object.defineProperty(Object.prototype, "__proto__", { set: __saved__proto__desc.set });
    this; /**bp:locals(2)**/

    Object.defineProperty(Object.prototype, "__proto__", {
        get: function () { return __saved__proto__desc.get.apply(this); },
        set: function (p) { return __saved__proto__desc.set.apply(this, [p]); },
    });
    this.__proto__ = { pp2: 2 };
    this; /**bp:locals(2)**/

    Object.defineProperty(Object.prototype, "__proto__", { value: 123 });
    this; /**bp:locals(3)**/

    Object.defineProperty(Object.prototype, "__proto__", __saved__proto__desc);
    this; /**bp:locals(2)**/

}).apply({ thisp: 1, __proto__: { protop: 123 } });

WScript.Echo("pass");
