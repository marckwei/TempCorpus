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

// -loopinterpretcount:1 -bgjit- -force:fieldhoist -mic:1 -msjrc:1

var obj1 = {};
var arrObj0 = {};
var func2 = function (argObj5, argObj6) {
  do {
    argObj6.prop0 += protoObj1;
  } while (argObj5.length);
};
var func3 = function () {
};
obj1.method0 = func3;
obj1.method1 = func2;
protoObj1 = Object(obj1);
obj1.prop0 = 1;
var __loopvar0 = 7 - 13;
do {
  __loopvar0 += 4;
  if (__loopvar0 >= 7) {
    break;
  }
  protoObj1.method0(arrObj0, obj1.prop0, arrObj0);
  Object.defineProperty(obj1, 'prop0', {
    set: function () {
    }
  });
} while (2);

var v30 = obj1.method1(1,protoObj1);
var v30 = obj1.method1(1,protoObj1);

WScript.Echo("passed");
