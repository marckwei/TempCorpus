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

var isPassed1 = false;
var isPassed2 = false;
function test1() {
    try {
        for (var ubwtog in Object(Math.imul(1073741824, Object(Symbol())))) { }
    }
    catch (ex) {
        if (ex instanceof TypeError) {
            if (ex.message === 'Number expected') {
                isPassed1 = true;
            }
        }
    }
}

function test2() {
  ejdmhf_0 = new Uint8Array();
  try
  {
    ejdmhf_0[50341] = Symbol();
  }
  catch(ex)
  {
      if(ex instanceof TypeError) {
          if(ex.message === 'Number expected') {
              isPassed2 = true;
          }
      }
  }
}

test1();
test2();
test2();
test2();

WScript.Echo(isPassed1 ? 'PASS' : 'FAIL');
WScript.Echo(isPassed2 ? 'PASS' : 'FAIL');
