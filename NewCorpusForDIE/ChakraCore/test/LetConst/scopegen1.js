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

let print = function(x) { WScript.Echo(x) }

try {
    throw "level1";
} catch (level_1_identifier_0) {
    eval("var level_1_identifier_3 = 'level1'");

    function level2Func(level_2_identifier_0) {
        level_1_identifier_3 += "level2"; //throws error
    }
    level2Func("level2");
    print(level_1_identifier_3);
}

with({ }) {
    //let level_1_identifier_1= "level1";
    //or
    const level_1_identifier_2= "level1";     

    with({ }) {        
        eval("var level_2_identifier_3 = 'level2'");
        eval("print(level_2_identifier_3);");
        eval("print(level_1_identifier_2);");
    }  
}

function evalcaller() {
    eval("\
        var level_1_identifier_0= \"level1\";\n\
        try {\n\
             throw \"level2\";\n\
        }catch(e) {  \n\
            let level_2_identifier_1= \"level2\";\n\
            function level3Func(level_3_identifier_0) {      \n\
                level_1_identifier_0 += \"level3\";          \n\
                level_2_identifier_1 += \"level3\";          \n\
            }\n\
            level3Func(\"level3\");\n\
            print(level_2_identifier_1);\n\
        }\n\
    ");
    print(level_1_identifier_0);
}
evalcaller();
