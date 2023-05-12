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

function testBuiltInFunction(options, builtInConstructor, builtInName, builtInFunc, intlConstructor, intlFunc, args) {
    try {
        var builtInValue = args.length === 1 ?
            new builtInConstructor(args[0])[builtInFunc]("en-US", options) :
            new builtInConstructor(args[0])[builtInFunc](args[1], "en-US", options);

        var intlValue = new Intl[intlConstructor]("en-US", options)[intlFunc](args[0], args[1]);

        if (builtInValue !== intlValue) {
            console.log(`ERROR: new ${builtInConstructor.name}(${args[0]}).${builtInFunc}() -> ${builtInValue} !== new Intl.${intlConstructor}("en-US", ${JSON.stringify(options)}).${intlFunc}(${args[0]}, ${args[1]}) -> ${intlValue}`);
        }
    }
    catch (ex) {
        console.log(`Error: testBuiltInFunction(${[...arguments].join(",")}) threw message ${ex.message}`);
    }
}

testBuiltInFunction({ minimumFractionDigits: 3 }, Number, "Number", "toLocaleString", "NumberFormat", "format", [5]);
testBuiltInFunction({ sensitivity: "base" }, String, "String", "localeCompare", "Collator", "compare", ["A", "a"]);
testBuiltInFunction({ hour: "numeric", timeZone: "UTC" }, Date, "Date", "toLocaleString", "DateTimeFormat", "format", [new Date(2000, 1, 1)]);
testBuiltInFunction({ hour: "numeric", timeZone: "UTC" }, Date, "Date", "toLocaleTimeString", "DateTimeFormat", "format", [new Date(2000, 1, 1)]);
testBuiltInFunction({ month: "numeric", timeZone: "UTC" }, Date, "Date", "toLocaleDateString", "DateTimeFormat", "format", [new Date(2000, 1, 1)]);

console.log("Pass");
