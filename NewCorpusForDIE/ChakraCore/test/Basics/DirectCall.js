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

var PI = Math.PI;
var c = Math.ceil(PI);
var f = Math.floor(PI);

WScript.Echo(c, f);

(function f()
{
    // Test calls that modify the call target operands when the args are evaluated.
    // Do this locally, as that's the case that we're most likely to get wrong.

    var save;
    var O = { foo : function() { return "O.foo"; }, bar : function() { return "O.bar"; } };
    O.o = { foo : function() { return "O.o.foo"; }, bar : function() { return "O.o.bar"; } };

    WScript.Echo(O.foo(save = O, O = O.o));
    WScript.Echo(O.foo(O = save));

    var str = 'foo';
    WScript.Echo(O[str](O = O.o, str = 'bar'));
    WScript.Echo(O[str](O = save, str = 'foo'));

})();
