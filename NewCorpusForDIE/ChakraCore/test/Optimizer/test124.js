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

function test14() {
    var obj0 = {};
    var obj1 = {};
    var arrObj0 = {};
    var func1 = function(argFunc148, argMath149, argFunc150) {
    }
    var func2 = function() {
        for(var __loopvar0 = 0; __loopvar0 < 3; __loopvar0++) {
            var __loopvar1 = 0;
            while((func1.call(obj1, 1, (func1.call(arrObj0, 1, ({} instanceof ((typeof String == 'function') ? String : Object)), 1) ? (func1.call(arrObj0, 1, ({} instanceof ((typeof String == 'function') ? String : Object)), 1) * ((b >>= -428738333) + func1.call(arrObj0, 1, ({} instanceof ((typeof String == 'function') ? String : Object)), 1))) : 1), 1)) && __loopvar1 < 3) {
                __loopvar1++;
                GiantPrintArray.push('obj0.prop0 = ' + (obj0.prop0 | 0));
                for(var __loopvar2 = 0; __loopvar2 < 3; __loopvar2++) {
                    for(var __loopvar3 = 0; __loopvar3 < 3; __loopvar3++) {
                        eval('1 = 1');
                    }
                }
            }
        }
        (function() {
            'use strict';
        })();
    }
    var i8 = new Int8Array(256);
    var a = 1;
    function bar0(argMath151, argObj152, argFunc153) {
        i8[(((argObj152.length !== a) && (obj0.length == obj0.prop0))) & 255];
    }
    bar0.call(obj1, 1, 1, 1);
    func2.call(arrObj0);
};
test14();
test14();
test14();

WScript.Echo("pass");
