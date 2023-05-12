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

//Switches:   -maxinterpretcount:1  -sse:3 -force:atom -forceserialized
//Arch: AMD64
var shouldBailout = false;
var repeatCount = 0;
function test0(){
  var obj0 = {};
  var obj1 = {};
  var arrObj0 = {};
  repeatCount = 0;
  var func0 = function(argMath0,argArr1){
  }
  var func1 = function(argObj2,argMath3,argArrObj4,argMath5){
  }
  obj0.method0 = func1;
  var i8 = new Int8Array(3);
  d = func1.call(obj1 , 1, func0.call(arrObj0 , (shouldBailout ? (Object.defineProperty(this, 'prop1', {get: function() {WScript.Echo(""); return 3; }, configurable: true}), 1) : 1), 1), 1, 1);
  // regalloc.ecs Snippet WIN8:748330: crash due to bad register allocation
  obj1 = {};
  var f = 6.20856440617424E+18;
  obj1.prop0 = {prop0: 1, prop1: 1, prop2: 1, prop3: ((f + (1 <= 1)) / (((1 instanceof Object) <= 1) == 0 ? 1 : ((1 instanceof Object) <= 1))), prop4: 1, prop5: 1, prop6: 1, prop7: 1};
  for(var v477409 = 0; v477409 < 3; ++v477409) {
  }
  obj1.method0 = function(){
    //Snippets:newobjinlining1.ecs
    function v477410(arg1 , arg2 , arg3)
    {
        this.v477411 = arg1;
        this.v477412 = arg2;
        this.v477413 = arg3;
        this.v477414 = 2;
        this.v477413= 2;
    }
    function v477415()
    {
        v477410.prototype = {};
        var __loopvar2 = 0;
     for(var strvar0 in i8 ) {
       if(strvar0.indexOf('method') != -1) continue;
       if(__loopvar2++ > 3) break;
       //Code Snippet: NegativeArgumentBug.ecs (Blue15423)
       for (var _i in arguments[obj0.method0.call(obj0 , 1, ((this.prop1 != obj0.prop0)||(arrObj0.prop0 > this.prop1)), 1, 1)]) {

       };

       obj0.length -=arrObj0.method0(1, 1, 1, 1);
     }

        var v477416 = new v477410(1,1,1);
        GiantPrintArray.push(v477416.v477413);
        GiantPrintArray.push(v477416.v477411);
        GiantPrintArray.push(v477416.v477412);
        GiantPrintArray.push(v477416.v477414);
    }
    repeatCount++;
    if (repeatCount > 200) return 1;
    v477415();
    v477415();
    Object.defineProperty(v477410.prototype,"v477414",{get:function(){return 100},configurable:false });
    v477415();
    return 1;
  }
  if(shouldBailout){
    obj0.method0 = obj1.method0;
  }
  obj0.method0(1, 1, 1, 1);
};

try {
// generate profile
test0();

// run JITted code
runningJITtedCode = true;
test0();

// run code with bailouts enabled
shouldBailout = true;
test0();
} catch (e) {
WScript.Echo(e);
}

