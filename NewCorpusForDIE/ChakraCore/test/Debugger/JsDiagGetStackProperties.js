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

/**exception(all):locals();**/

// Tests getting "exception" from JsDiagGetStackProperties
try {
  throw 1;
} catch (ex) {}

try {
  throw new Error('Caught Error');
} catch (ex) {}

// Tests getting "arguments", "locals", "scopes" and "globals" from JsDiagGetStackProperties
var globalVar = {
  prop : 1
};

function FuncLevel1() {
  var level1Var = {
    prop : 1
  };
  function FuncLevel2() {
    var level2Var = {
      prop : 1
    };
    function FuncLevel3() {
      var localVar1 = level1Var;
      var localVar2 = level2Var; /**bp:locals(1);**/
    }
    FuncLevel3();
  }
  FuncLevel2();
}
FuncLevel1(1);

// Tests getting "returnValue" and "functionCallsReturn" from JsDiagGetStackProperties
function outerFunc1() {
  function innerFunc1() {
    return 1;
  }
  function innerFunc2() {
    return "2";
  }
  function innerFunc3() {
    return new Object(3);
  }
  return innerFunc1() + innerFunc2() + innerFunc3(); /**bp:resume('step_over');locals(1);**/
}
outerFunc1();
WScript.Echo("pass");
