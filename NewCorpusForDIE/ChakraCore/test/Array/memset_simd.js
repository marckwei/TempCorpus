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

this.WScript.LoadScriptFile("memset_tester.js");

const simdRegex = /^\w+(\d+)?x(\d+)$/;
const allSimdTypes = Object.getOwnPropertyNames(SIMD)
  // just to make sure
  .filter(simdType => simdRegex.test(simdType))
  .map(simdType => {
    const result = simdRegex.exec(simdType);
    const nLanes = parseInt(result[2]);
    const simdInfo = {
      makeSimd() {
        const args = new Array(nLanes);
        for(let i = 0; i < nLanes; ++i) {
          args[i] = Math.random() * (1 << 62);
        }
        if (simdType != 'Float64x2') //Type is not part of spec. Will be removed as part of cleanup.
        {
            return SIMD[simdType](...args);
        }
      },
      makeStringValue() {
        const args = new Array(nLanes);
        for(let i = 0; i < nLanes; ++i) {
          args[i] = Math.random() * (1 << 62);
        }
        if (simdType != 'Float64x2') //Type is not part of spec. Will be removed as part of cleanup.
        {
            return `SIMD.${simdType}(${args.join(",")})`;
        }
      },
      nLanes,
      simdType
    };
    return simdInfo;
  });

const allTypes = [0, 1.5, undefined, null, 9223372036854775807, "string", {a: null, b: "b"}];
const tests = allSimdTypes.map(simdInfo => {
  return {
    name: `memset${simdInfo.simdType}`,
    stringValue: simdInfo.makeStringValue(),
    v2: simdInfo.makeSimd()
  };
});

const types = "Array".split(" ");

let passed = RunMemsetTest(tests, types, allTypes);

print(passed ? "PASSED" : "FAILED");
