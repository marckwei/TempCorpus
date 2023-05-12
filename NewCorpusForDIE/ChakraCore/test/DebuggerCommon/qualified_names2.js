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

// Validation of fully qualified names (object literals and es6 classes)
var a = 10;
var f2 = function () {}
 
f2.prototype = { 
        subF1 : function () { 
            a;
            a++;/**bp:stack()**/
        },
        subInt : 10,
        subF2 : function () { 
            a;
            a++;/**bp:stack()**/
        }
        
 }

var obj1 = new f2();
obj1.subF1();
obj1.subF2();


f2.prototype = { subF3 : { subSubF3 : function () { 
        a;
        a++;/**bp:stack()**/
 } } }
 
obj1 = new f2();
obj1.subF3.subSubF3();

var Foo = function () {
    this.subF1 = function () {         
        a;
        a++;/**bp:stack()**/
    }
    this.val = "value"
    this.subF2 = function () {         
        a;
        a++;/**bp:stack()**/
    }
}

obj1 = new Foo();
obj1.subF1();
obj1.subF2();

class OneClass {

    constructor(a) { 
        a;
        a++;/**bp:stack()**/ 
    }
    static method1() {     
        a;
        a++;/**bp:stack()**/ 
    }
    
    method() { 
        a;
        a++;/**bp:stack()**/ 
    }
    
    get method2() {
        var str = "getter";
        a++;/**bp:evaluate('str');stack()**/ 
        return a;
    }
    
    set method2(abc) { 
        var str = "setter";
        a++;/**bp:evaluate('str');stack()**/ 
    }
}

var obj = new OneClass();
obj.method();
OneClass.method1();
var k = obj.method2;
obj.method2 = 31;
 
WScript.Echo("Pass");