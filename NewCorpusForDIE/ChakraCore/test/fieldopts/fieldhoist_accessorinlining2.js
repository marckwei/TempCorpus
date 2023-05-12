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

// -force:fieldhoist -off:inlinegetters -off:fixedmethods -mic:1 -msjrc:1

var obj1 = {};
Object.defineProperty(obj1, "prop0", {
        get: function(){return this._prop0;},
        set: function(a){this._prop0 = a;},
        configurable: true
    });

arrObj0 = [];
var ret;
function foo(arrObj0, obj1)
{
    arrObj0.length;
    obj1.prop0 = 1;
    for (var i = 0;i < 3; i++)
    {
        obj1.prop0 = i;
        ret = obj1.prop0;
    }
}

foo(arrObj0, obj1);
WScript.Echo(ret);

foo(arrObj0, obj1);
WScript.Echo(ret);

foo(arrObj0, obj1);
WScript.Echo(ret);
