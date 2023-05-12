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

// Configuration: ..\fuzz.xml
// Testcase Number: 1664
// Bailout Testing: ON
// -maxinterpretcount:1  -off:floattypespec
// Branch:  fbl_ie_dev1(saagarwa.
// Build: 20529-1700)

var Failed = 0;

function FAILED()
{
    Failed++;
    WScript.Echo("FAILED");
}

function test0(){
  var obj0 = {};
  var func1 = function(){
    (obj0.prop0 /=NaN);
    return Object.create(obj0);
  }

  obj0.prop0 = 1;
  obj0.prop1 = {prop2: ( Object.defineProperty(obj0, 'prop0', {writable: false}) )};
  (new func1()).prop0;
  if (obj0.prop0 !== 1) FAILED();
  func1();
  if (obj0.prop0 !== 1) FAILED();
};
// generate profile
test0();

// run JITted code
test0();

test0();

if (!Failed)
{
    WScript.Echo("Passed");
}
