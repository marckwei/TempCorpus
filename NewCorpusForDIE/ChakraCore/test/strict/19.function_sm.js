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

function write(v) { WScript.Echo(v + ""); }

function PrintDescriptor(name, propDesc) {
    write(name + ":configurable : " + propDesc.configurable);
    write(name + ":enumerable   : " + propDesc.enumerable);
    write(name + ":writable     : " + propDesc.writable);    
    write(name + ":getter       : " + propDesc.get);
    write(name + ":setter       : " + propDesc.set);    
    write(name + ":value        : " + propDesc.value);
}

function exceptToString(ee) {
    if (ee instanceof TypeError) return "TypeError";
    if (ee instanceof ReferenceError) return "ReferenceError";
    if (ee instanceof EvalError) return "EvalError";
    if (ee instanceof SyntaxError) return "SyntaxError";
    return "Unknown Error";
}

(function Test1() {
    "use strict";
    var str = "function.caller get";
        
    try {
        Test1.caller;
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
})();

(function Test2() {
    "use strict";
    var str = "function.caller set";
        
    try {
        Test2.caller = 10;
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
})();

(function Test3() {
    "use strict";
    var str = "function.arguments get";
        
    try {
        Test3.arguments;
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
})();

(function Test4() {
    "use strict";
    var str = "function.arguments set";
        
    try {
        Test4.arguments = 10;
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
})();

(function Test5() {
    "use strict";
    var str = "function.arguments and function.caller descriptors are undefined";

    // Properties on the function object. 
    var callerDescriptor = Object.getOwnPropertyDescriptor(function() {}, 'caller');
    var argumentsDescriptor = Object.getOwnPropertyDescriptor(function() {}, 'arguments');
    
    write("Return: " +
        (callerDescriptor === undefined) + " " +
        (argumentsDescriptor === undefined) + ": " +
        str);
})();

(function Test5() {
    "use strict";
    var str = "arguments.caller is not defined and arguments.callee getter and setter are equal/strictEqual to each other";
    
    // Properties on the arguments object. 
    var argumentsCallerDescriptor = Object.getOwnPropertyDescriptor(arguments, 'caller');
    var argumentsCalleeGet = Object.getOwnPropertyDescriptor(arguments, 'callee').get;
    var argumentsCalleeSet = Object.getOwnPropertyDescriptor(arguments, 'callee').set;
    
    write("Return: " + 
      (argumentsCallerDescriptor === undefined).toString() + " " +
      (argumentsCalleeGet === argumentsCalleeSet).toString() + ": " +
      str);
})();

(function Test6() {
    var str = "function.caller's value is a strict mode function";

    function foo() {
        "use strict";
        return goo();
    }

    function goo() {
        return goo.caller;  // Expected: TypeError, as the caller (foo) is a strict mode function -- ES5.15.3.5.4.
    }

    try {
        foo();
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
})();

/* TODO
(function Test5() {
    "use strict";
    var str = "function.caller get";
        
    try {
        PrintDescriptor("Test5.caller", Object.getOwnPropertyDescriptor(Test5, "caller"));
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
})();

(function Test6() {
    "use strict";
    var str = "function.arguments get";
        
    try {
        PrintDescriptor("Test6.arguments", Object.getOwnPropertyDescriptor(Test6, "arguments"));
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
})();
*/
