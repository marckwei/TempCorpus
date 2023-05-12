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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

let line = 't("摩"2)';
let module_name = 'temp.js';
WScript.RegisterModuleSource(module_name, line);

var tests = [
    {
        name: "Syntax error thrown parsing dynamic module",
        body: function () {
            let source = `import(module_name)
            .then(v => {
                assert.fail("Parsing this module should not succeed");
            }, e => {
                assert.areEqual(line, e.source, "Source line causing compile error");
            }).catch(e => {
                console.log('fail: ' + e);
                throw e;
            });`

            testRunner.LoadModule(source, 'samethread', true, false);
        }
    },
    {
        name: "Syntax error thrown parsing module code",
        body: function () {
            try {
                WScript.LoadScriptFile(module_name, 'module');
                assert.fail("Parsing this module should not succeed");
            } catch(e) {
                assert.areEqual(line, e.source, "Source line causing compile error");
            }
        }
    },
    {
        name: "Error line which contains multi-byte UTF-8 sequence which is an end-of-line character",
        body: function () {
            WScript.RegisterModuleSource('temp2.js', 't("\u2028"2)');

            try {
                WScript.LoadScriptFile('temp2.js', 'module');
                assert.fail("Parsing this module should not succeed");
            } catch(e) {
                assert.areEqual('t("', e.source, "Source line causing compile error");
            }
        }
    }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
