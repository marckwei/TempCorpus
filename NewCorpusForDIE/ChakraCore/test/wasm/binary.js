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

/* global assert,testRunner */ // eslint rule
WScript.LoadScriptFile("../UnitTestFramework/UnitTestFramework.js");
WScript.LoadScriptFile("../WasmSpec/testsuite/harness/wasm-constants.js");
WScript.LoadScriptFile("../WasmSpec/testsuite/harness/wasm-module-builder.js");
WScript.Flag("-off:wasmdeferred");

function makeReservedTest(name, body, msg) {
  return {
    name,
    body() {
      const builder = new WasmModuleBuilder();
      builder.addFunction(null, kSig_v_i).addBody(body);
      try {
        new WebAssembly.Module(builder.toBuffer());
        assert.fail("Expected an exception");
      } catch (e) {
        if (!(e instanceof WebAssembly.CompileError) || RegExp(msg, "i").test(e.message)) {
          return;
        }
        assert.fail(`Expected error message: ${msg}. Got ${e.message}`);
      }
    }
  }
}

const tests = [
  makeReservedTest("memory.size reserved", [kExprMemorySize, 1], "memory.size reserved value must be 0"),
  makeReservedTest("memory.grow reserved", [kExprMemoryGrow, 1], "memory.grow reserved value must be 0"),
  makeReservedTest("call_indirect reserved", [kExprCallIndirect, 1], "call_indirect reserved value must be 0"),
];

WScript.LoadScriptFile("../UnitTestFramework/yargs.js");
const argv = yargsParse(WScript.Arguments, {
  boolean: ["verbose"],
  number: ["start", "end"],
  default: {
    verbose: true,
    start: 0,
    end: tests.length
  }
}).argv;

const todoTests = tests
  .slice(argv.start, argv.end);

testRunner.run(todoTests, {verbose: argv.verbose});
