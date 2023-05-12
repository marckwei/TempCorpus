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

//reduced switches: -loopinterpretcount:1 -bgjit- -maxsimplejitruncount:2 -maxinterpretcount:1
var obj0 = {};
var protoObj0 = {};
var obj1 = {};
var arrObj0 = {};
var func0 = function () {
};
var func2 = function () {
  '*$*(#!O!\xA5!+%Q\xB4)'.concat((Object.defineProperty(obj0, 'length', { enumerable: true }))).replace().concat().replace();
};
obj0.method0 = func2;
var ui32 = new Uint32Array();
var IntArr2 = Array();
var d = 1;
var protoObj1 = Object();
obj0.prop1 = -162;
var id29 = func0(obj0.method0());
for (var _strvar30 in obj0) {
  if (!(!IntArr2.unshift(22 * protoObj0.prop0 + arrObj0.prop0, ui32[14 + 1 & 255], protoObj0.length, 908048702 * 1643133174725930000 + -28, ++d, true ? (Object.defineProperty(obj0, 'prop1', {
      writable: true,
      enumerable: false,
      configurable: true
    }), obj1.length) : obj1.length, typeof protoObj1.prop0 != 'number'))) {
  }
}
print("PASS")
