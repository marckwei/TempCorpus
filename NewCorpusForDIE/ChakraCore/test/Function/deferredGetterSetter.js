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

// /forcedeferparse test to make sure we can handle getters and setters at global scope,
// at function scope, and with nested functions.

var x = {
    _y : 'x.y',
    get y() { WScript.Echo('getting x.y'); return this._y; },
    set y(val) { WScript.Echo('setting x.y'); this._y = val; }
};

WScript.Echo(x.y);
x.y = 'new x.y';

function f() {

    var x = {
        _y : 'local x.y',
        get y() { WScript.Echo('getting local x.y'); return this._y; },
        set y(val) { WScript.Echo('setting local x.y'); this._y = val; }
    };

    WScript.Echo(x.y);
    x.y = 'new local x.y';

    var nested_x = {
        _y : 'nested x.y',
        get y() { function fget(o) { WScript.Echo('getting nested x.y'); return o._y; } return fget(this); },
        set y(val) { function fset(o, val) { WScript.Echo('setting nested x.y'); o._y = val; } fset(this, val); }
    };

    WScript.Echo(nested_x.y);
    nested_x.y = 'new nested x.y';
    WScript.Echo(nested_x.y);

    WScript.Echo(x.y);
}

f();

WScript.Echo(x.y);
