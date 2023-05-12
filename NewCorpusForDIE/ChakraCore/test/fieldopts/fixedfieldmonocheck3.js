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

var __counter = 0;
function test0() {
    __counter++;
    var obj0 = {};
    var protoObj0 = {};
    var obj1 = {};
    var arrObj0 = {};
    var func0 = function () {
    };
    var func1 = function () {
        this.prop1 = 10;
        for (var v0 = 0; v0 < 4; ++v0) {
            i = this.prop1;
            prop1 = 30;
        }
        return Error(), this.prop1;
    };
    var func2 = function (argMath0) {
        return typeof {
            prop0: test0.caller,
            prop1: arguments[10] * (f64[1073741823] + i8[9 & 255]),
            prop2: i8[9 & 255] * ((false ? (f = {
                valueOf: function () {
                    WScript.Echo('f valueOf');
                    return 3;
                }
            }, test0.caller) : test0.caller) + test0.caller),
            prop3: ~((false ? (a = {
                valueOf: function () {
                    WScript.Echo('a valueOf');
                    return 3;
                }
            }, Object.prototype.length) : Object.prototype.length) * g++ - (-773191191 === 467528665)),
            prop4: false ? func1() : func1(),
            prop5: /a/ instanceof (typeof Error == 'function' ? Error : Object),
            prop6: arrObj0[false ? arrObj0[8] = 'x' : undefined, 8],
            prop7: (0 && 1886309404 ? d < 7989750482363150000 && obj1.prop1 !== argMath0 : arrObj0.length != argMath0) && arrObj0.prop2
        };
    };
    var func4 = function () {
        return { prop5: func2() };
    };
    obj0.method1 = func2;
    obj1.method0 = func0;
    obj1.method1 = func1;
    Object.prototype.method1 = obj1.method0;
    var i8 = new Int8Array();
    var f64 = new Float64Array();
    var g = -2128076251;
    func4();
    var uniqobj5 = [
      protoObj0,
      obj0
    ];
    uniqobj5[__counter % uniqobj5.length].method1(obj1.method1());
    func2();
    if (i !== 30) {
        WScript.Echo('i === ' + i);
    }
}
test0();
test0();

WScript.Echo('pass');