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
// Copyright (c) 2021 ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

WScript.LoadScriptFile("../UnitTestFramework/known_globals.js");

var fileNames = ["dataview.js", "int8array.js", "uint8array.js", "int16array.js", "uint16array.js",
  "int32array.js", "uint32array.js", "float32array.js", "float64array.js"];

for (var i = 0; i < fileNames.length; i++) {
  WScript.Echo("testing file " + fileNames[i]);
  oneFile(fileNames[i]);
}

function oneFile(fileName) {
  var frame = WScript.LoadScriptFile(fileName, "samethread");
  WScript.Echo("Start same thread different engine test on file " + fileName);
  for (var i in frame) {
    if (isKnownGlobal(i)) {
      continue;
    }

    WScript.Echo("property of global: " + i);
    if (typeof frame[i] == "object") {
      for (var j in frame[i]) {
        WScript.Echo("sub object " + j + " in " + i + " is " + frame[i][j]);
      }
    }
    try {
      if (typeof frame[i] == "function") {
        frame[i]();
      }
    }
    catch (e) {
      WScript.Echo("exception is " + e.number + e.message);
    }
  }
}
