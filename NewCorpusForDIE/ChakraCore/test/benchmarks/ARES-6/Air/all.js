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

"use strict";

WScript.LoadScriptFile("symbols.js");
WScript.LoadScriptFile("tmp_base.js");
WScript.LoadScriptFile("arg.js");
WScript.LoadScriptFile("basic_block.js");
WScript.LoadScriptFile("code.js");
WScript.LoadScriptFile("frequented_block.js");
WScript.LoadScriptFile("inst.js");
WScript.LoadScriptFile("opcode.js");
WScript.LoadScriptFile("reg.js");
WScript.LoadScriptFile("stack_slot.js");
WScript.LoadScriptFile("tmp.js");
WScript.LoadScriptFile("util.js");
WScript.LoadScriptFile("custom.js");
WScript.LoadScriptFile("liveness.js");
WScript.LoadScriptFile("insertion_set.js");
WScript.LoadScriptFile("allocate_stack.js");
