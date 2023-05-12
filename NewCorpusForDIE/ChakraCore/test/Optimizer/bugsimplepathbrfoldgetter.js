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

function next1(arr, len) {
  var obj = {done:true, value:undefined};
  if (len > 5) {
    // cannot fold, because obj not defined in localValueTable	  
    return obj;
  }
  return {done:false, value:arr[len]};
}

function iterator1(x) {
  var arr = [0,1,2,3,4,5,6,7,8,9,10];
  var res = next1(arr, x);
  if (!res.done) {
    print(res.value);
  }
}

iterator1(5);
iterator1(100);
iterator1(5);
print("Done iterator1\n");

function next2(arr, len) {
  if (len > 5) {
    var obj = {done:true, value:undefined};
    Object.defineProperty(obj, "done", {get : function() {print("getter\n"); return true;}});
    return obj;
  }
  return {done:false, value:arr[len]};
}

function iterator2(x) {
  var arr = [0,1,2,3,4,5,6,7,8,9,10];
  var res = next2(arr, x);
  if (!res.done) {
    print(res.value);
  }
}

iterator2(5);
iterator2(100);
iterator2(200);
print("Done iterator2\n");

function next3(arr, len) {
  if (len > 5) {
    return {get done() { print("getter\n"); return true;}, value:undefined};
  }
  return {done:false, value:arr[len]};
}

function iterator3(x) {
  var arr = [0,1,2,3,4,5,6,7,8,9,10];
  var res = next3(arr, x);
  if (!res.done) {
    print(res.value);
  }
}

iterator3(5);
iterator3(100);
iterator3(200);
print("Done iterator3\n");

function test0() {
  var obj1 = {};
  var arrObj0 = {};
  var func0 = function (x) {
    with (arrObj0) {
      if (x > 100) {
          obj1.prop1 = (Object.defineProperty(obj1, 'prop1', { get: function () { WScript.Echo('obj1.prop1 getter'); return 3; }, configurable: true }));
      }
      else {
          obj1.prop1 = 3;
      }
      true ? obj1.prop1 : obj1.prop1;
    }
  };
  func0(200);
  func0(200);
  func0(100);
}
test0();
