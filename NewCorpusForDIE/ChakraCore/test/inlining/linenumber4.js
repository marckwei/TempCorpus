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

var shouldBailout = false;
function test0(){
  var obj0 = {};
  var obj1 = {};
  var obj2 = {};
  var func0 = function(p0){
  }
  var func1 = function(){
    if(ary[(((((shouldBailout ? (ary[1] = "x") : undefined ), 1) >= 0 ? 1 : 0)) & 0XF)]) {
      var __loopvar3 = 0;
      while((func0(1, (shouldBailout ? (Object.defineProperty(obj0, 'prop1', {get: function() { WScript.Echo('obj0.prop1 getter'); return 3; }}), 1) : 1), 1, 1)) && __loopvar3 < 3) {
        __loopvar3++;
      }
    }
  }
  var func2 = function(){
    if(((ary[(((obj1.prop3 >= 0 ? obj1.prop3 : 0)) & 0XF)] ? func1(1, 1, 1, 1, 1) : 1) + func1())) {
    }
  }
  Object.prototype.method0 = func2;
  var ary = new Array(10);
  this.prop2 = {prop0: 1, prop1: 1, prop2: 1, prop3: 1, prop4: 1, prop5: 1, prop6: 1, prop7: (shouldBailout ? (Object.defineProperty(this, 'prop2', {set: function(_x) { WScript.Echo('this.prop2 setter'); }}), 1) : 1)};
  this.prop5 = {prop7: 1, prop6: (-- obj2.prop6), prop5: 1, prop4: ary[(((((shouldBailout ? (ary[Math.acos(1)] = "x") : undefined ), Math.acos(1)) >= 0 ? Math.acos(1) : 0)) & 0XF)], prop3: obj1.method0(1), prop2: 1, prop1: 1, prop0: 1};
};

// generate profile
test0();

// run JITted code
test0();

// run code with bailouts enabled
shouldBailout = true;
test0();
