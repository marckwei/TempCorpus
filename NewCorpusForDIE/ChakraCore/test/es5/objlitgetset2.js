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

function __getProperties(obj) {
  let properties = [];
  for (let name of Object.getOwnPropertyNames(obj)) {
 properties.push(name);
  }
  return properties;
}
function __getRandomObject() {
}
function __getRandomProperty(obj, seed) {
  let properties = __getProperties(obj);
  return properties[seed % properties.length];
}
  (function __f_2672() {
      __v_13851 = {
        get p() {
        }
      }
      __v_13862 = {
        get p() {
        },
        p: 2,
        set p(__v_13863) { WScript.Echo('pass'); this.q = __v_13863},
        p:9,
        q:3,
        set p(__v_13863) { WScript.Echo('pass'); this.q = __v_13863},        
      };
      __v_13862.p = 0;
      if (__v_13862.q !== 0) WScript.Echo(__v_13862.q);
  })();
  __v_13851[__getRandomProperty(__v_13851, 483779)] = __getRandomObject();

let o = {get a(){},x:0};
if (o.x !== 0) WScript.Echo('fail x0');
Object.defineProperty(o, 'x', {configurable:true,enumerable:true,get:function(){return 'x1'}});
if (o.x !== 'x1') WScript.Echo('fail x1');
let p = {get a(){},x:0};
p.y = 'y';
Object.defineProperty(p, 'x', {configurable:true,enumerable:true,get:function(){return 'x2'}});
if (p.x !== 'x2') WScript.Echo('fail x2');
if (p.y !== 'y') WScript.Echo('fail y');
