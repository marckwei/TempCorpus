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

function test0(){
  var obj0 = {};
  var arrObj0 = {};
  var func0 = function(argArr0){
    obj0 = arrObj0;
  }
  var func1 = function(argArr1,argMath2,argFunc3){
  }
  arrObj0.method0 = func1; 
  var intfloatary = [1,4,-1,-6,-0,+0,55,-100,2.56,-3.14,6.6,42,2.3,67,1.97,-24,77.99];
  var b = 1;
  function bar0 (argMath8,argObj9){
    b = arguments[((((b &= 1) >= 0 ? (b &= 1) : 0)) & 0XF)]; 
  }
  a = func0.call(obj0 , 1); 
  function v1877769()
  {
    var v1877770 = false;
    (function(){
      this.prop1 =bar0(intfloatary[(1)], 1);
    })();
    var v1877771 = [10];
    var __loopvar4 = 0;
    do {
      __loopvar4++;
    } while((1) && __loopvar4 < 3)
    Object.defineProperty(Array.prototype, "4", {configurable : true, get: function(){v1877770 = true; return 30;}});
    a *=obj0.method0.call(obj0 , 1, (++ b), 1);
    v1877770 = false;
    v1877771.length = 6;
    b = v1877771.indexOf(30);
    WScript.Echo (b);
  }
  
  v1877769();
  v1877769();
  var __loopvar0 = 0;
  for(var strvar19 in obj0 ) {
    if(strvar19.indexOf('method') != -1) continue;
    if(__loopvar0++ > 3) break;
    bar0(1, 1); 
  }
};

// generate profile
test0(); 
test0(); 

// run JITted code
runningJITtedCode = true;
test0(); 
test0(); 

function test1() {
    z = function expr() {
        with({}) {
            expr();
        }
    }
}
test1();
