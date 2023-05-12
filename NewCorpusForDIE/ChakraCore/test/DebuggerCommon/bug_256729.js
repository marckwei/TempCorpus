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

// Validating bug 256729

let level_0_identifier_1= "level0";

eval("let level_1_identifier_0= \"level1\";\n\
      const level_1_identifier_1= \"level1\";\n\
      {  \n\
         function level3Func(level_1_identifier_0) {\n    \n\
            let level_3_identifier_1= \"level3\";\n\n    \n\
            \
            level_1_identifier_1; /**bp:evaluate('level_1_identifier_1')**/;\n    \n\
            \n\
                 level_1_identifier_0 += \"level3\";\n\
            \
            level_3_identifier_1; /**bp:evaluate('level_3_identifier_1')**/; \n\
            }\n\
            level3Func(\"level3\");\nlevel3Func = undefined;\n\
            level_1_identifier_0; /**bp:evaluate('level_1_identifier_0')**/; \n\n\
        };    \n\
        \n");
        
WScript.Echo("Pass");
