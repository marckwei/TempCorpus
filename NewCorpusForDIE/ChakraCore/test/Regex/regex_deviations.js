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

if (this.WScript && this.WScript.LoadScriptFile) {
    this.WScript.LoadScriptFile('..\\UnitTestFramework\\UnitTestFramework.js');
}

var tests = [
    {
        name: '"\\c" should be treated as "\\\\c" outside the character set',
        assertions: [
            [/^\c$/, '\\c'],
        ]
    },
    {
        name: '"\\c" should be treated as "c" inside the character set',
        assertions: [
            [/[\c]/, 'c'],
            [/[\c-]/, 'c']
        ]
    },
    {
        name: 'A non-letter character after "\\c" inside the character set should be the letter\'s mathematical value mod 32',
        assertions: [
            [/[\c1]/, '\x11']
        ]
    },
    {
        name: 'A non-letter character after "\\c" outside the character set should not be treated differently',
        assertions: [
            [/\c1/, '\\c1']
        ]
    },
    {
        name: '"]" should be allowed on its own',
        assertions: [
            [/]/, ']']
        ]
    }
];

var testsForRunner = tests.map(function (test) {
    return {
        name: test.name,
        body: function () {
            test.assertions.forEach(function (assertion) {
                var re = assertion[0];
                var inputString = assertion[1];
                assert.isTrue(re.test(inputString), re.source);
            });
        }
    }
});

testRunner.runTests(testsForRunner, { verbose: WScript.Arguments[0] != 'summary' });
