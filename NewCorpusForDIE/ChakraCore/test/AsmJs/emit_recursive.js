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

// Find StackOverflow constructor
let StackOverflow;
try {
  const bar = () => bar();
  bar();
} catch (e) {
  StackOverflow = e.constructor;
}

function test(n) {
  const str = `function asm() {
    "use asm"
    function foo() {
      return (${Array(n).fill("1").join("+")})|0
    }
    return foo;
  }
  `;

  try {
    eval(str);
    const res = asm()();
    if (res !== n) {
      console.log(`Invalid result: expected ${n}. Got ${res}`);
    }
  } catch (e) {
    if (!(e instanceof StackOverflow)) {
      console.log("Expected a StackOverflow error");
    }
  }
}

// Test with/without stackoverflow in asm.js and/or javascript
for (const n of [10, 50, 100, 500, 1000, 5000]) {
  test(n);
}

console.log("pass");
