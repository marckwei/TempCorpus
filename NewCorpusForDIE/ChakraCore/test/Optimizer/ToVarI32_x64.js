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

var shouldBailout = false;
function test0() {
    var loopInvariant = shouldBailout ? 12 : 8;
    var GiantPrintArray = [];
    var protoObj0 = {};
    var obj1 = {};
    var protoObj1 = {};
    var func4 = function () {
    };
    for (var __loopvar0 = loopInvariant; __loopvar0 != loopInvariant + 4; loopInvariant) {
        var __loopvar1 = loopInvariant;
        for (var __loopSecondaryVar1_0 = loopInvariant; ; loopInvariant) {
            while (obj1.prop0) {
                var __loopvar3 = loopInvariant;
                do {
                    var v0 = protoObj1[{}];
                    protoObj1 = protoObj0;
                    var uniqobj1 = [obj1];
                    GiantPrintArray.push(__loopvar0);
                    func4();
                    if (__loopvar3 > loopInvariant + 6) {
                    }
                    __loopvar3 += 2;
                } while (protoObj0);
                GiantPrintArray('arrObj0.prop0 = ' + arrObj0);
                GiantPrintArray('protoObj1.prop0 = ' + protoObj0);
            }
            if (__loopvar1 === loopInvariant) {
                break;
            }
            __loopvar1++;
        }
        __loopvar0++;
    }
}
test0();
test0();
test0();
test0();

WScript.Echo('pass');