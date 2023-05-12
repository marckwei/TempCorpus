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

var GiantPrintArray = [];
var reuseObjects = false;
var PolymorphicFuncObjArr = [];
var PolyFuncArr = [];
function GetPolymorphicFunction() {
    if (PolyFuncArr.length > 1) {
        var myFunc = PolyFuncArr.shift();
        PolyFuncArr.push(myFunc);
        return myFunc;
    }
    else {
        return PolyFuncArr[0];
    }
}
function GetObjectwithPolymorphicFunction() {
    if (reuseObjects) {
        if (PolymorphicFuncObjArr.length > 1) {
            var myFunc = PolymorphicFuncObjArr.shift();
            PolymorphicFuncObjArr.push(myFunc);
            return myFunc
        }
        else {
            return PolymorphicFuncObjArr[0];
        }
    }
    else {
        var obj = {};
        obj.polyfunc = GetPolymorphicFunction();
        PolymorphicFuncObjArr.push(obj)
        return obj
    }
};
function InitPolymorphicFunctionArray(args) {
    PolyFuncArr = [];
    for (var i = 0; i < args.length; i++) {
        PolyFuncArr.push(args[i])
    }
}
;
function test0() {
    var obj0 = {};
    var arrObj0 = {};
    var ary = new Array(10);
    var FloatArr0 = 1;
    var h = 1;
    var __loopvar0 = 0;
    do {
        __loopvar0++;
        // Snippet: Array Check hoist for nested loop where bailout happens before 2nd loop.

        var v4916 = 0;
        arrObj0[5] = "temp";
        for (var v4917 = 0 ; v4917 < 3 ; v4917++) {

            for (var v4918 = 0 ; v4918 < 3 ; v4918++) {
                v4916 += arrObj0[v4918 + v4917];
            }

            if (shouldBailout) {
                Object.defineProperty(arrObj0, "5", { get: function () { GiantPrintArray.push("getter"); return 5; }, configurable: true });
            }

            for (var v4919 = 0 ; v4919 < 3 ; v4919++) {
                v4916 += arrObj0[v4919 + v4917];
            }
            1
        }

        GiantPrintArray.push(v4916);
        var __loopvar3 = 0;
        do {
            __loopvar3++;
            litObj4 = { prop0: 1, prop1: (ary.shift()), prop2: (ary.pop()), prop3: 1, prop4: 1, prop5: 1, prop6: 1, prop7: 1 };
            var uniqobj2 = { prop0: (ary[((shouldBailout ? (ary[1] = 'x') : undefined), 1)], 1, 1, 1), prop1: 1 };
        } while ((1) && __loopvar3 < 3)
        arrObj0 = Object.prototype;
        var id29 = (ary.push((h ^= -4.00753612819473E+18), FloatArr0[(((174 >= 0 ? 174 : 0)) & 0XF)], obj0.prop2))
        ;
    } while ((1) && __loopvar0 < 3)
    for (var i = 0; i < GiantPrintArray.length; i++) {
        WScript.Echo(GiantPrintArray[i]);
    };
};

// generate profile
test0();
// Run Simple JIT
test0();

// run JITted code
runningJITtedCode = true;
test0();

// run code with bailouts enabled
shouldBailout = true;
test0();
