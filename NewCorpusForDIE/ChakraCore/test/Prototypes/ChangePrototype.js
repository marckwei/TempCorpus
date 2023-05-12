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

// Use -trace:TypeShareForChangePrototype  -verbose to debug if this test case fails
function test1() {
    function bar() {
        this.a = 1;
        this.b = 2;
        this.c = 2;
    }
    function baz() { }

    var obj = {};
    var re = /a/;
    var date1 = new Date();
    var date2 = new Date();
    date2.blah = 1;
    var obj1 = new bar();
    var obj2 = { a: 1, b: 2, c: 3 };
    var obj3 = new baz();
    var buff = new ArrayBuffer(8);
    var i8 = new Int8Array(buff, 0, 0);
    var i8_custom = new Int8Array(buff, 0, 0);
    i8_custom.a = 1;
    var i16 = new Int16Array(buff, 0, 0);
    var proto = { protoProp: 1 };

    obj1.__proto__ = proto;
    print("obj1.protoProp = " + obj1.protoProp);
    
    obj3.__proto__ = proto;
    print("obj3.protoProp = " + obj3.protoProp);

    obj2.__proto__ = proto;
    print("obj2.protoProp = " + obj2.protoProp);
    
    date1.__proto__ = proto;
    print("date1.protoProp = " + date1.protoProp);
    
    date2.__proto__ = proto;
    print("date2.protoProp = " + date2.protoProp);

    re.__proto__ = proto;
    print("re.protoProp = " + re.protoProp);
    
    buff.__proto__ = proto;
    print("buff.protoProp = " + buff.protoProp);
    
    i8.__proto__ = proto;
    print("i8.protoProp = " + i8.protoProp);
    
    i16.__proto__ = proto;
    print("i16.protoProp = " + i16.protoProp);
    
    i8_custom.__proto__ = proto;
    print("i8_custom.protoProp = " + i8_custom.protoProp);
    

    print("done");
}

function test2() {
    function ctor() {
        this.a = 1;
        this.b = 2;
    }

    var obj = { _a: 1 };

    var x1 = new ctor();    // x1's type = T1
    print('Changing __proto__');
    x1.__proto__ = obj;     // cached T2 corresponding to T1 on obj
    var x2 = new ctor();
    var x3 = new ctor();    // shrink the inlineSlotCapacity of T1

    var y = new ctor();
    print('Changing __proto__');
    y.__proto__ = obj;      // cached T2's inlineSlotCapacity doesn't match y's T1
}

function test3() {
    // no switches needed
    var proto = {};

    function foo() {
    }

    var x = new foo();
    var y = new foo();
    y.__proto__ = proto; // empty type cached in map of proto object
    y._a = 1; // evolve cached type created above
    y._b = 1;
    y._c = 1;
    y._d = 1;
    var z = new foo(); // this shrunk oldType's slotCapacity from 8 to 2.

    // retrived the cached type which was evolved. 
    // Realized that oldType's slotCapacity has shrunk, we shrink slot capacity of cachedType but it doesn't match because cachedType has evolved
    z.__proto__ = proto;
}

test1();
test2();
test3();