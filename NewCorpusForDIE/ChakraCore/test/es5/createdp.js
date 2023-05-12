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

function write(args)
{
 WScript.Echo(args);
}

write("Test case 1");

function base() {}
var b = new base();
var prop = new Object();
var d = Object.create(b);
write(typeof d);
write(Object.getOwnPropertyNames(d));

write("Test case 2");

var prop = {b:{value:10},c:{value:30},d:{value:70}};
Array.prototype[1]=10;
var  a = Object.create(Array.prototype, prop);
WScript.Echo(Object.getOwnPropertyNames(a));
WScript.Echo(a[1]);

write("Test case 3");

var prop = {b:{value:10},c:{value:30},d:{value:70}};
var  a = Object.defineProperties({}, prop);
WScript.Echo(Object.getOwnPropertyNames(a));
WScript.Echo(a.b);

write("Test case 4");

var gettersetter = {get: function(){write("In getter");},set: function(arg){write("In setter")}};
var prop = {gs: gettersetter, bar: {value:10}};
var  a = Object.defineProperties({}, prop);
WScript.Echo(Object.getOwnPropertyNames(a));
a.gs;
a.gs=10;

write("Test case 5");
Object.defineProperty(
    Number.prototype,
    "p",
    {
        get: function () { write("In getter"); },
        set: function (v) { write("In setter"); },
        configurable: true,
        enumerable: true
    });
var o = 1;
o.p;
o.p = 2;
delete Number.prototype.p;

write("Test case 6 - simple dictionary");
var obj = {};
Object.defineProperty(Object.prototype, "data", { value:"qrs", enumerable:true, writable:true, configurable:true });
// add user defined property
Object.defineProperty(obj, "data", { value:10, enumerable:true, writable:true, configurable:true });
// remove user defined property <--- remove this and it works as expected
delete obj.data;
// should be global property <--- remove this and it works as expected
write("Is global: " + (obj.data === "qrs"));
// redeclare user defined property
Object.defineProperty(obj, "data", { value:10, enumerable:true, writable:true, configurable:true });
write("Is local again: " + (obj.data === 10));

write("Test case 7 - dictionary");
var obj = {};
Object.defineProperty(Object.prototype, "data", { value:"qrs", enumerable:true, writable:true, configurable:true });
// add user defined property
Object.defineProperty(obj, "data", { get: function(){}, enumerable:true,  configurable:true  });
// remove user defined property <--- remove this and it works as expected
delete obj.data;
// should be global property <--- remove this and it works as expected
write("Is global: " + (obj.data === "qrs"));
// redeclare user defined property
Object.defineProperty(obj, "data", { value:10, enumerable:true, writable:true, configurable:true });
write("Is local again: " + (obj.data === 10));

