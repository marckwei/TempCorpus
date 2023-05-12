function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
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

if (this.description)
    description("Test caching with re-entrancy.");

function test1() {
    var objects = [{prop:1}, {get prop(){return 2}}];

    function g(o) {
        return o.prop;
    }

    for (var i = 0; i < 10000; i++) {
        var o = {
            get prop() {
                try {
                    g(objects[++j]);
                }catch(e){
                }
                return 1;
            }
        };
        o[i] = i;
        objects.push(o);
    }
    var j=0;
    g(objects[0]);
    g(objects[1]);
    g(objects[2]);
    g(objects[3]);
}


function test2() {
    var objects = [Object.create({prop:1}), Object.create({get prop(){return 2}})];

    function g(o) {
        return o.prop;
    }
    var proto = {
        get prop() {
            try {
                g(objects[++j]);
            }catch(e){
            }
            return 1;
        }
    };
    for (var i = 0; i < 10000; i++) {
        var o = Object.create(proto);
        o[i] = i;
        objects.push(o);
    }
    var j=0;
    g(objects[0]);
    g(objects[1]);
    g(objects[2]);
    g(objects[3]);
}


function test3() {
    var objects = [Object.create(Object.create({prop:1})), Object.create(Object.create({get prop(){return 2}}))];

    function g(o) {
        return o.prop;
    }
    var proto = {
        get prop() {
            try {
                g(objects[++j]);
            }catch(e){
            }
            return 1;
        }
    };
    for (var i = 0; i < 10000; i++) {
        var o = Object.create(Object.create(proto));
        o[i] = i;
        objects.push(o);
    }
    var j=0;
    g(objects[0]);
    g(objects[1]);
    g(objects[2]);
    g(objects[3]);
}

test1();
test2();
test3();
