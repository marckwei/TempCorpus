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

const Type = Int32Array;
const n = 100;

function test0(a, b) { for (let i = -50 ; i < n     ; i++) b[i] = a[i]; }
function test1(a, b) { for (let i = -150; i < n     ; i++) b[i] = a[i]; }
function test2(a, b) { for (let i = 0   ; i < n     ; i++) b[i] = a[i]; }
function test3(a, b) { for (let i = 0   ; i < n     ; i++) b[i] = a[i]; }
function test4(a, b) { for (let i = -50 ; i < n     ; i++) b[i] = a[i]; }
function test5(a, b) { for (let i = -100; i < n     ; i++) b[i] = a[i]; }
function test6(a, b) { for (let i = -50 ; i < n     ; i++) b[i] = a[i]; }
function test7(a, b) { for (let i = -50 ; i < n + 50; i++) b[i] = a[i]; }
function test8(a, b) { for (let i = 50  ; i < n + 50; i++) b[i] = a[i]; }

const testCases = [
  test0,
  test1,
  test2,
  test3,
  test4,
  test5,
  test6,
  test7,
  test8
];

function fill(a) { for (let i = 0; i < n; i++) a[i] = i; }
let passed = 1;

for(let fnTest of testCases) {
  let src = new Type(n);
  fill(src);
  let interpreterCopy = new Type(n);
  let JitCopy = new Type(n);
  fnTest(src, interpreterCopy);
  fnTest(src, JitCopy);
  for(let j = 0; j < n; ++j) {
    if(interpreterCopy[j] !== JitCopy[j])
    {
      passed = 0;
      WScript.Echo(fnTest.name + " " + j + " " + interpreterCopy[j] + " " + JitCopy[j]);
      break;
    }
  }
}

if(passed === 1) {
  WScript.Echo("PASSED");
} else {
  WScript.Echo("FAILED");
}
