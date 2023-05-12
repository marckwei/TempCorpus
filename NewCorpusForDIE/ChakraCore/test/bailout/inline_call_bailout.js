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

//Configuration: inline.xml
//Testcase Number: 20382
//Switches:  -maxinterpretcount:4  -forceserialized -bgjit- -loopinterpretcount:1 -off:lossyinttypespec -off:arraycheckhoist  -version:5
//Baseline Switches: -nonative  -version:5
//Branch:  fbl_ie_script
//Build: 130517-2000
//Arch: AMD64
//MachineName: BPT02339
//InstructionSet: SSE2
function test0(){
  var func2 = function() {}
  function bar1 (argMath12,argMath13){
    WScript.Echo(argMath12);
  }
  function bar3 (argMath16,argMath17){
    bar1.call(null , argMath16, (((argMath16++ ) instanceof func2)) * func2.call(null));
  }
  bar3(false);
};

// generate profile
test0(); 
test0(); 
