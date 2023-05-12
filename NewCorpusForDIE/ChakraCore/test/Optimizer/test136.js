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

function test0() {
    var GiantPrintArray = [];
    function makeArrayLength() {
        return 100;
    }
    var obj0 = {};
    var obj1 = {};
    var arrObj0 = {};
    var func1 = function(argObj0) {
        function v0(o) {
            for(var v1 = 0; v1 < 8; v1++) {
                function v2() {
                }
                var v3 = v2();
                GiantPrintArray.push(argObj0);
                GiantPrintArray.push(v3);
                o[0] = 0;
            }
        }
        v0(arrObj0);
    };
    obj0.method0 = func1;
    obj1.method1 = obj0.method0;
    method0 = obj1.method1;
    arrObj0[arrObj0.length] = -246;
    Object.prototype.length = makeArrayLength();
    method0();
    WScript.Echo(GiantPrintArray);
}
test0();
test0();
