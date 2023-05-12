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

// OSG bug 2037772
function AsmModule(glob, imp, b) {
    "use asm";

    function f1(a)
    {
        a = a|0;
        return a|0;
    }
    function f2(a,b)
    {
        a = a|0;
        b = b|0;
        return;
    }
    function f3(a)
    {
        a = a|0;
        return a|0;
    }
    function f4(a,b,c,d,e,f)
    {
        a = a|0;
        b = b|0;
        c = c|0;
        d = d|0;
        e = e|0;
        f = f|0;
        return a|0;
    }

    function f5() {
     var i3 = 0, i4 = 0;
     i3 = f1(7) | 0;
     f2(i3, f3(6) | 0);
     i4 = f4((i3 | 0) == 0 ? 0 : 4 | 0, 1, 2, 3, 4, 5) | 0;
     i3 = (i3+i4) |0
     return i3|0;
    }

    return f5;
}

var global = {Math:Math,Int8Array:Int8Array,Int16Array:Int16Array,Int32Array:Int32Array,Uint8Array:Uint8Array,Uint16Array:Uint16Array,Uint32Array:Uint32Array,Float32Array:Float32Array,Float64Array:Float64Array,Infinity:Infinity, NaN:NaN}
var env = {id: function(x){return x;}}
var heap = new ArrayBuffer(1<<20);
var asmModule = AsmModule(global, env, heap);
print(asmModule());