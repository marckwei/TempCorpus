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

function main() {
    const v2 = [13.37,13.37,13.37,13.37,13.37];
    async function v4(v5,v6,v7,v8) {
        const v10 = 0;
        for (let v14 = 0; v14 < 8; v14++) {
            v5["vEBD7ei78q"] = v14;
        }
        for (let v16 = 1; v16 < 1337; v16++) {
            const v17 = v2.__proto__;
            const v23 = [13.37,13.37,-2.2250738585072014e-308,13.37,13.37];
            const v24 = v23.length;
            const v25 = "-4294967296";
            const v26 = 7;
            function* v28(v29,v30,v31,...v32) {}
            let v33 = -2.2250738585072014e-308;
            const v34 = v28(v33,Object,Object);
            const v35 = 13.37;
            const v36 = 2384357829;
            const v37 = await "-4294967296";
            const v38 = --v33;
        }
        const v39 = 128;
        print("pass")
    }
v4("vEBD7ei78q");
}
main();
