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

var __counter = 0;
function test0(){
  __counter++;;
  var obj0 = {};
  var obj1 = {};
  var func1 = function(){
  }
  var func4 = function(){
  }
  obj0.method1 = func1;
  obj1.method1 = func4;
  protoObj0 = Object.create(obj0);
  protoObj1 = Object.create(obj1);
  // loopbreakblock5.ecs

  function v464() {
    var v465 = 0;
    var __loopvar1000 = 0;
  while(1) {
    if (__loopvar1000 > 3) break;
    __loopvar1000++;

        if(v465++ > 2) {
            var uniqobj0 = [protoObj1, protoObj0];
     uniqobj0[__counter%uniqobj0.length].method1();
            throw "loopbreakblock5.ecs";
        }
    }
  }

  try {
    v464();
  } catch(e) {};
};

// generate profile
test0();
// Run Simple JIT
test0();

// run JITted code
runningJITtedCode = true;
test0();
WScript.Echo("PASSED\n");
