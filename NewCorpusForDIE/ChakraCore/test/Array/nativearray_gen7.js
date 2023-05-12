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

var reuseObjects = false;
var PolymorphicFuncObjArr = [];
var PolyFuncArr = [];
function GetPolymorphicFunction()
{
    if(PolyFuncArr.length > 1 )
    {
        var myFunc = PolyFuncArr.shift();
        PolyFuncArr.push(myFunc);
        return myFunc;
    }
    else
    {
        return PolyFuncArr[0];
    }
}
function GetObjectwithPolymorphicFunction(){
    if (reuseObjects)
    {
        if(PolymorphicFuncObjArr.length > 1 )
        {
            var myFunc = PolymorphicFuncObjArr.shift();
            PolymorphicFuncObjArr.push(myFunc);
            return myFunc
        }
        else
        {
            return PolymorphicFuncObjArr[0];
        }
    }
    else
    {
        var obj = {};
        obj.polyfunc = GetPolymorphicFunction();
        PolymorphicFuncObjArr.push(obj)
        return obj
    }
};
function InitPolymorphicFunctionArray()
{
    for(var i=0;i<arguments.length;i++)
    {
        PolyFuncArr.push(arguments[i])
    }
}
;
function test0(){
  var obj0 = {};
  var obj1 = {};
  var arrObj0 = {};
  var func0 = function(argMath0){
    (ary[((shouldBailout ? (ary[5] = "x") : undefined ), 5)]);
  }
  var func2 = function(argArr3,argArr4,argFunc5,argArr6){
    // Snippet: Array check hoist where we set an index property to an accessor.

    function v274686(o)
    {
      for (var v274687 = 0 ; v274687 < 8 ; v274687++)
      {
        obj0.prop0 = o[v274687];

        o[v274687] = v274687;
      }
      WScript.Echo(o[3]);
    }

    v274686(argArr3);
    if(shouldBailout) {
      try {
          Object.defineProperty(argArr3,"5",{set:     function(x){ WScript.Echo("inside");this[3] = -3;}, configurable: true})
      }
      catch(e) {
      }
      v274686(argArr3);
    }

    func0.call(obj0 , 1);
  }
  obj0.method0 = func2;
  var ary = new Array(10);
  function bar0 (){
  }
  function bar1 (){
  }
  function bar2 (){
    return 1.1;
  }
  InitPolymorphicFunctionArray(bar0,bar1,bar2);
  var __polyobj = GetObjectwithPolymorphicFunction();
  obj1.prop0 = (__polyobj.polyfunc.call(arrObj0 ) ? Math.pow(1, obj0.method0.call(obj1 , ary, 1, 1, 1)) : 1);
  func2(1, 1, 1, 1);
};

// generate profile
test0();
test0();
test0();

// run JITted code
runningJITtedCode = true;
test0();
test0();
test0();

// run code with bailouts enabled
shouldBailout = true;
test0();

// Test output:
// undefined
// undefined
// 3
// undefined
// undefined
// undefined
// undefined
// 3
// inside
// -3
// inside
// inside
// undefined
// JavaScript runtime error: Object.defineProperty: argument is not an Object
