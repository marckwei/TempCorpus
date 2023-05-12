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
    var loopInvariant = 9;
    var obj1 = {};
    var arrObj0 = {};
    var func0 = function () {
    };
    var func2 = function () {
        protoObj0;
    };
    arrObj0.method0 = obj1;
    var i8 = new Int8Array(256);
    var VarArr0 = Array(protoObj0, -188);
    var protoObj0 = Object.create(func0);
    protoObj0.prop0 = -1;
    arrObj0.prop0 = -1863021692;
    var __loopvar0 = 3, __loopSecondaryVar0_0 = 9 - 9, __loopSecondaryVar0_1 = 9;
    while ((VarArr0[i8[255] + (arrObj0.prop0 <= protoObj0.prop0)]) && __loopvar0 < 10) {
        __loopvar0++;
        __loopSecondaryVar0_1 += 3;
        if (3 > loopInvariant) {
            break;
        }
        __loopSecondaryVar0_0 += 3;
        arrObj0 = protoObj0;
    }
}
test0();
print("passed");