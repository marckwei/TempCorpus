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
// WinOOB 1150093
// Really spill a helper spilled lifetime if the register borrowed from it gets allocated 
// to another lifetime that extends beyond the end of a helper block. 
//
(function() {
    function func() { return -1; }
    var obj1 = new Object();
    var e;
    e = 7.5;
    obj1.a = 6;
    obj1.b = 5.5;
    obj1.length = 1.5;
    obj1.b >>= (obj1.a >> (((obj1.b ) > ((e >>> 1),(obj1.length++ )) ) ? ( 1) : (1 , func(1)) ));
    WScript.Echo("Done");
})();

// Win8 631676
// Helper block spills on caller-save registers should be restored at the end of the block
(function() {
    var obj1 = {};
    var ary = new Array(10);
    (function (p0, p1, p2) {
        obj1.prop0 *= (obj1.length &= 1);
        var obj3 = 1;
        var __loopvar3 = 0;
        while((((ary[(14)] ? h : 1) * (((ary[(1)] ? 5.92399137987761E+18 : 1.1) * obj3.prop1) * (1 - ((ary[(12)] * ary[(10)]) ? 7.86168737043649E+18 : -1048116397.9))) - (~7.61982799133318E+18))) && __loopvar3 < 3) {
            __loopvar3++;
        }
    })();
})();
