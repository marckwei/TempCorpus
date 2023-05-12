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

// Compares the value set by interpreter with the jitted code
// need to run with -mic:1 -off:simplejit -off:JITLoopBody
// Run locally with -trace:memop -trace:bailout to help find bugs

function test(x)
{
  for(var i = 0; i < 10; i++)
  {
    x[i] = 0;
  }

  //Invalid memset
  for(var i = 0; i < 10; i++)
  {
    x[i] = 1;
    x[i / 2] = 3;
  }

  var c = 0;

  //valid memset
  for(var i = 0; i < 10; i++)
  {
    x[i] = 2;
    c += x[i];
  }
  //Invalid memset
  for(var i = 0; i < 9; i++)
  {
    x[i] = 3;
    c += x[i / 2];
  }
}


var x = new Array();
test(x);

var x2 = new Array();
test(x2);
compareResults(0, x.length);

var passed = 1;
function compareResults(start, end) {
  for(var i = start; i < end; i++)
  {
    if(x[i] !== x2[i])
    {
      print(`Invalid value: a[${i}] != b[${i}]`);
      passed = 0;
      break;
    }
  }
}

if(passed === 1)
{
  WScript.Echo("PASSED");
}
else
{
  WScript.Echo("FAILED");
}


