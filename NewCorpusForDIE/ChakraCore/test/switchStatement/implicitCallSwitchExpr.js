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

/*
*******************************UNIT TEST FOR SWITCH CASE OPTIMIZATION*******************************
*   Test for Bug 232738
*   Exprgen:CAS: JIT is causing a bad code gen with Switches: -maxinterpretcount:1 -bgjit- -loopinterpretcount:1
*
*/

var shouldBailout = false;
function test0(){
  var g = 1;
  if(shouldBailout)
   {
    g = { valueOf: function() { WScript.Echo('g value1Of'); return 3; } }
   }

  var __loopvar2 = 1;

  do {
    switch(g) {
      case 1:
       d = 1;
      case 2:
        d = 2;
      case 3:
    d = 3;
      case 4:
    d = 4;
     default:
    d = -1;
    }
  } while(__loopvar2 < 1)
  return d;
};

WScript.Echo(test0());
shouldBailout = true;
WScript.Echo(test0());
