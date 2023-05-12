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
    var obj0 = {};
    var obj2 = {};
    var func1 = function () {
    };
    var func2 = function () {
    };
    obj0.method0 = func2;
    obj2.method1 = obj0.method0;
    method1 = obj2.method1;
    var IntArr0 = [];
    Object.prototype.prop2 = -118;
    function func7() {
        this.prop0 = method1();
        this.prop2 = this.prop3;
    }
    new func7();
    while (prop2) {
        var uniqobj2 = new func7();
        var v0 = {
            v1: function () {
                return function bar() {
                };
            }
        };
        obj2.v6 = v0.v1();
        var v26 = obj2.v6(Object.prototype.prop0--);
        ({ prop5: func1(Math.atan2(Object.prototype.prop3--)) });
        Object.prototype.prop2 = IntArr0.shift();
    }
}
test0();
test0();
test0();

var FloatArr0 = Array();
FloatArr0[5] = 456463198.1;
function func7(arg0, arg1) {
  this.prop0 = arg0;
  this.prop2 = arg1;
}
for (var _strvar2 of FloatArr0) {
  var uniqobj8 = new func7(144);
  uniqobj8.prop3 = uniqobj8.prop2 = test0;
}

WScript.Echo('pass');
