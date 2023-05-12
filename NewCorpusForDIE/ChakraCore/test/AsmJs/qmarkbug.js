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

eval(`
(function(stdlib, foreign, heap) {
    'use asm';
    var Uint8ArrayView = new stdlib.Uint8Array(heap);
    var Int16ArrayView = new stdlib.Int16Array(heap);
    function f(d0, i1)
    {
        d0 = +d0;
        i1 = i1|0;
        var i4 = 0;
        i4 = ((0) ? 0 : ((Uint8ArrayView[0])));
        return +((-7.555786372591432e+22));
    }
    return f;
})(this, {}, new ArrayBuffer(1<<24));
`);

eval(`
(function(stdlib, foreign, heap) {
    'use asm';
    var Uint8ArrayView = new stdlib.Uint8Array(heap);
    var Int16ArrayView = new stdlib.Int16Array(heap);
    function f(d0, i1)
    {
        d0 = +d0;
        i1 = i1|0;
        var i4 = 0;
        i4 = ((0) ? ((Uint8ArrayView[0])): 0 );
        return +((-7.555786372591432e+22));
    }
    return f; 
})(this, {}, new ArrayBuffer(1<<24));
`);
