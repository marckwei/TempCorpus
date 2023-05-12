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

function verify(){}
function Run(){
    function verify(act, exp, msg) { }
    var level_0_identifier_0 = "level0";
    
    // upper scope - that is closed over in level2func
    {
        let level_1_identifier_0= "level1_0";  /* captured */
        const level_1_identifier_1= "level1_1";   /* not captured by nested function */
        let level_1_identifier_2; /**bp:locals(1); evaluate('level_0_identifier_0'); evaluate('level_1_identifier_0');**/  /* not initialized & captured */ 
        
		function level2Func(level_2_identifier_0) {
            eval("");
            var level_2_identifier_1 = "level2";  
            verify(level_1_identifier_0, "level1level1", "[Let Const - Function Declaration] level_1_identifier_0 at level 2"); 
            level_1_identifier_2; /**bp:locals(1);evaluate('level_0_identifier_0'); evaluate('level_1_identifier_0');**/ 
        }
        level2Func("level2");
        level2Func = undefined;
        level_1_identifier_2 = "test";
    }
}
Run.apply({});
WScript.Echo("PASSED");