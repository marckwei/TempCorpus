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

function AsmModuleSwitch() {
  "use asm";

  function fib(x) {
    // we multiply all the cases by 100 so that the
    // switch is sparse and doesn't generate a jump table
    x = x|0;
    switch(x|0) {
      case 000:  return 1;
      case 100:  return 1;
      case 200:  return 2;
      case 300:  return 3;
      case 400:  return 5;
      case 500:  return 8;
      case 600:  return 13;
      case 700:  return 21;
      case 800:  return 34;
      case 900:  return 55;
    }
    return -1;
  }
    
  return { 
    fib: fib
  };
}

var asmModuleSwitch = AsmModuleSwitch();
WScript.Echo(asmModuleSwitch.fib(000));
WScript.Echo(asmModuleSwitch.fib(100));
WScript.Echo(asmModuleSwitch.fib(200));
WScript.Echo(asmModuleSwitch.fib(300));
WScript.Echo(asmModuleSwitch.fib(400));
WScript.Echo(asmModuleSwitch.fib(500));
WScript.Echo(asmModuleSwitch.fib(600));