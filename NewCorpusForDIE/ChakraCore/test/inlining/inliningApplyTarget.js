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

var Class = {
  create: function() {
    return function bar() {
      this.initialize.apply(this, arguments);
    }
  }
};

var object = {};
object.obj1 = Class.create();

object.obj1.prototype = {
    r : 0,
    initialize : function(r) {
        this.r = r;
   }
}

object.obj2 = Class.create();

object.obj2.prototype = {
        x : 0,
    y : 0,
    initialize : function(x,y) {
        this.x = x;
        this.y = y;
    }
}

object.obj3 = Class.create();

object.obj3.prototype = {
    prop1 : {},
    initialize : function(a) {
        this.prop1 = new object.obj1(a);
    }
}

object.obj4 = Class.create();

object.obj4.prototype = {
    prop1 : {},
    prop2 : {},
    initialize : function(r,s,t) {
        this.prop1 = new object.obj1(r);
        this.prop2 = new object.obj2(s,t);
    }
}

function foo()
{
    var v00 = new object.obj1();
    var v01 = new object.obj1(1);
    var v02 = new object.obj1(1,2);
    var v03 = new object.obj1(1,2,3);
    WScript.Echo(v03.r);

    var v4 = new object.obj2(1);
    var v5 = new object.obj2(1,2);
    var v6 = new object.obj2(1,2,3);
    WScript.Echo(v6.y);

    var v7 = new object.obj3(1);
    var v8 = new object.obj3(1,2);
    var v9 = new object.obj3(1,2,3);
    WScript.Echo(v9.prop1.r);

    var v10 = new object.obj4(1);
    var v11 = new object.obj4(1,2);
    var v12 = new object.obj4(1,2,3);
    WScript.Echo(v12.prop1.r);
    WScript.Echo(v12.prop2.y);
}

foo();
foo();

//override apply
Function.prototype.apply = function(){};
foo();

WScript.Echo("Passed");
