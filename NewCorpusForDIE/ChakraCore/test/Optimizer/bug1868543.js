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

var ary = new Array(10);
var e = -6;
function makeArrayLength(x) { if (x < 1 || x > 4294967295 || x != x || isNaN(x) || !isFinite(x)) return 100; else return Math.floor(x) & 0xffff; };;
var func3 = function (argStr4, argArr5, argArr6) {
    var re1 = /ab[b7]ba/m;
    var __loopvar3 = loopInvariant, __loopSecondaryVar3_0 = loopInvariant + 6;
    LABEL0:
        do {
            __loopSecondaryVar3_0 -= 2;
            if (__loopvar3 === loopInvariant - 3) break;
            __loopvar3--;
            obj1.prop1 = 5.77075486440603E+18;
            arrObj0.prop0 = (((argArr5.reverse()) instanceof ((typeof Boolean == 'function') ? Boolean : Object)) << (argArr6[(((arrObj0.prop0 >= 0 ? arrObj0.prop0 : 0)) & 0XF)] + i8[(18) & 255]));
            obj1.length = makeArrayLength(undefined);
        } while (((argArr5[(loopInvariant)] * ary[((((argArr6[(((arrObj0.prop0 >= 0 ? arrObj0.prop0 : 0)) & 0XF)] + i8[(18) & 255]) >= 0 ? (argArr6[(((arrObj0.prop0 >= 0 ? arrObj0.prop0 : 0)) & 0XF)] + i8[(18) & 255]) : 0)) & 0XF)] + ((obj1.prop1 !== e) || (arrObj0.prop0 != obj1.length)))))
    return (5 in arrObj0);
};
var strvar3 = 'f';
var FloatArr0 = [];
var loopInvariant = 5;
var obj0 = {};
var obj1 = {};
var arrObj0 = {};
var i8 = new Int8Array(256);
var v0 = Uint16Array;
var v1 = [arrObj0.prop0, obj1.prop1, obj1.prop0, obj1.prop1, obj1.prop1];
var v2 = new v0(v1);
v0 = v2.filter(function (v5) { obj1.prop1 = 8.50905997247229E+18; return func3.call(obj1, strvar3, v2, FloatArr0); }, this);

WScript.Echo('pass');