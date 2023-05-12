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

write("Test case 0");
(function() {
var test = function ()
{
   var x = {
     get  value(){
         return 20;
     },
     set value(val){
         this._value = val;
     }
   }
   x.value;
   write(x.value);
}
test();
test();
})();

write("Test case 1");
(function() {
var test = function ()
{
   var x = {
     get  value(){
         return this._value;
     },
     set value(val){
         this._value = val;
     }
   }
   x.value = 10;
   write(x.value);
}
test();
test();
})();

write("Test case 2");
(function() {
var test = function ()
{
   var ab = {};
   Object.defineProperty(ab,"foo",{get:function(){write("In getter"); return 10;}, configurable: true});
   write(ab.foo);
}
test();
test();
})();

write("Test case 3");
(function() {
var test = function (alter)
{
   var x = {
     get  value(){
         return this._value;
     },
     set value(val){
         this._value = val;
     }
   }
   if(alter)
   {
     Object.defineProperty(x,"value",{value: 20, writable: true, enumerable: true, configurable: true});
   }
   write(x.value);
}
test(false);
test(true);
})();

write("Test case 4");
(function() {
var test = function (alter)
{
   var x = {
     _value : 10,
     get  value(){
         return this._value;
     },
     set value(val){
         this._value = val;
     }
   }
   delete x.value;
   write(x.value);
}
test();
test();
})();

write("Test case 5");
(function() {
var test = function (alter)
{
   var x = {
     _value : 10,
     get  value(){
         return this._value;
     },
     set value(val){
         this._value = val;
     }
   }
   if(alter)
   {
     delete x.value;
   }
   write(x.value);
}
test(false);
test(true);
})();

write("Test case 6");
(function() {
var test = function (alter)
{
   var x = {
     _value : 25,
     get  value(){
         return this._value;
     },
     set value(val){
         this._value = val;
     }
   }
   if(alter)
   {
     Object.defineProperty(x,"value",{get:function(){write("In getter");return 10;}, configurable: true});
   }
   write(x.value);
}
test(false);
test(true);
})();

write("Test case 7");
(function() {
var test = function ()
{
   function foo(){ }
   foo.prototype.value = 10;
   var x = new foo();
   Object.defineProperty(x,"value",{get:function(){write("In getter");return 10;}, configurable: true});
   write(x.value);
}
test();
test();
})();

write("Test case 8");
(function() {
var test = function ()
{
   function foo(){ }
   foo.prototype.value = 10;
   var x = new foo();
   write(x.value);
   Object.defineProperty(x,"value",{get:function(){write("In getter");return 10;}, configurable: true});
   write(x.value);
}
test();
test();
})();

write("Test case 9");
(function() {
var test = function (alter)
{
   function foo(){ }
   if (alter)
   {
     foo.prototype.value = 10;
   }
   var x = new foo();
   Object.defineProperty(x,"value",{get:function(){write("In getter");return 10;}, configurable: true});
   write(x.value);
}
test(false);
test(true);
})();

write("Test case 10");
(function() {
var test = function (alter)
{
   var x = {value: 10};
   if (alter)
   {
     write(x.value);
   }
   Object.defineProperty(x,"value",{get:function(){write("In getter");return 10;}, configurable: true});
   write(x.value);
}
test(false);
test(true);
})();

write("Test case 11");
(function() {
var test = function (alter)
{
   var x = {};
   Object.defineProperty(x,"value",{get:function(y){write("In getter");return 10 + y;}, configurable: true});
   write(x.value);
}
test(false);
test(true);
})();

try {
  eval("({ g\\u0065t foo() {} })");
  write("Get and set cannot contain unicode escapes");
} catch {}
