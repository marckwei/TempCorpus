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

description(
"This test checks some cases that might be affected by constant folding."
);

shouldBe('"abc" + "2.1"', '"abc2.1"');
shouldBe('"123" + "2.1"', '"1232.1"');
shouldBe('"123" + "="', '"123="');
shouldBe('"*" + "123"', '"*123"');

shouldBe('!"abc"', 'false');
shouldBe('!""', 'true');

shouldBe('10.3 + 2.1', '12.4');
shouldBe('10.3 + "2.1"', '"10.32.1"');
shouldBe('"10.3" + 2.1 ', '"10.32.1"');
shouldBe('"10.3" + "2.1"', '"10.32.1"');
shouldBe('10.3 + true', '11.3');
shouldBe('"10.3" + true', '"10.3true"');
shouldBe('10.3 + false', '10.3');
shouldBe('"10.3" + false', '"10.3false"');
shouldBe('true + 2.1', '3.1');
shouldBe('true + "2.1"', '"true2.1"');
shouldBe('false + 2.1', '2.1');
shouldBe('false + "2.1"', '"false2.1"');

shouldBe('10.3 - 2.1', '8.200000000000001');
shouldBe('10.3 - "2.1"', '8.200000000000001');
shouldBe('"10.3" - 2.1 ', '8.200000000000001');
shouldBe('"10.3" - "2.1"', '8.200000000000001');
shouldBe('10.3 - true', '9.3');
shouldBe('"10.3" - true', '9.3');
shouldBe('10.3 - false', '10.3');
shouldBe('"10.3" - false', '10.3');
shouldBe('true - 2.1', '-1.1');
shouldBe('true - "2.1"', '-1.1');
shouldBe('false - 2.1', '-2.1');
shouldBe('false - "2.1"', '-2.1');

shouldBe('10.3 * 2.1', '21.630000000000003');
shouldBe('10.3 * "2.1"', '21.630000000000003');
shouldBe('"10.3" * 2.1', '21.630000000000003');
shouldBe('"10.3" * "2.1"', '21.630000000000003');
shouldBe('10.3 * true', '10.3');
shouldBe('"10.3" * true', '10.3');
shouldBe('10.3 * false', '0');
shouldBe('"10.3" * false', '0');
shouldBe('true * 10.3', '10.3');
shouldBe('true * "10.3"', '10.3');
shouldBe('false * 10.3', '0');
shouldBe('false * "10.3"', '0');

shouldBe('10.3 / 2', '5.15');
shouldBe('"10.3" / 2', '5.15');
shouldBe('10.3 / "2"', '5.15');
shouldBe('"10.3" / "2"', '5.15');
shouldBe('10.3 / true', '10.3');
shouldBe('"10.3" / true', '10.3');
shouldBe('true / 2', '0.5');
shouldBe('true / "2"', '0.5');
shouldBe('false / 2', '0');
shouldBe('false / "2"', '0');

shouldBe('10.3 % 2.1', '1.9000000000000004');
shouldBe('"10.3" % 2.1', '1.9000000000000004');
shouldBe('10.3 % "2.1"', '1.9000000000000004');
shouldBe('"10.3" % "2.1"', '1.9000000000000004');
shouldBe('10.3 % true', '0.3000000000000007');
shouldBe('"10.3" % true', '0.3000000000000007');
shouldBe('true % 2', '1');
shouldBe('true % "2"', '1');
shouldBe('false % 2', '0');
shouldBe('false % "2"', '0');

shouldBe('10.3 << 2.1', '40');
shouldBe('"10.3" << 2.1', '40');
shouldBe('10.3 << "2.1"', '40');
shouldBe('"10.3" << "2.1"', '40');
shouldBe('10.3 << true', '20');
shouldBe('"10.3" << true', '20');
shouldBe('10.3 << false', '10');
shouldBe('"10.3" << false', '10');
shouldBe('true << 2.1', '4');
shouldBe('true << "2.1"', '4');
shouldBe('false << 2.1', '0');
shouldBe('false << "2.1"', '0');

shouldBe('10.3 >> 2.1', '2');
shouldBe('"10.3" >> 2.1', '2');
shouldBe('10.3 >> "2.1"', '2');
shouldBe('"10.3" >> "2.1"', '2');
shouldBe('10.3 >> true', '5');
shouldBe('"10.3" >> true', '5');
shouldBe('10.3 >> false', '10');
shouldBe('"10.3" >> false', '10');
shouldBe('true >> 2.1', '0');
shouldBe('true >> "2.1"', '0');
shouldBe('false >> 2.1', '0');
shouldBe('false >> "2.1"', '0');

shouldBe('-10.3 >>> 2.1', '1073741821');
shouldBe('"-10.3">>> 2.1', '1073741821');
shouldBe('-10.3 >>> "2.1"', '1073741821');
shouldBe('"-10.3">>> "2.1"', '1073741821');
shouldBe('-10.3 >>> true', '2147483643');
shouldBe('"-10.3">>> true', '2147483643');
shouldBe('-10.3 >>> false', '4294967286');
shouldBe('"-10.3" >>> false', '4294967286');
shouldBe('true >>> 2.1', '0');
shouldBe('true >>> "2.1"', '0');
shouldBe('false >>> 2.1', '0');
shouldBe('false >>> "2.1"', '0');


shouldBe('10.3 & 3.1', '2');
shouldBe('"10.3" & 3.1', '2');
shouldBe('10.3 & "3.1"', '2');
shouldBe('"10.3" & "3.1"', '2');
shouldBe('10.3 & true', '0');
shouldBe('"10.3" & true', '0');
shouldBe('11.3 & true', '1');
shouldBe('"11.3" & true', '1');
shouldBe('10.3 & false', '0');
shouldBe('"10.3" & false', '0');
shouldBe('11.3 & false', '0');
shouldBe('"11.3" & false', '0');
shouldBe('true & 3.1', '1');
shouldBe('true & "3.1"', '1');
shouldBe('true & 2.1', '0');
shouldBe('true & "2.1"', '0');
shouldBe('false & 3.1', '0');
shouldBe('false & "3.1"', '0');
shouldBe('false & 2.1', '0');
shouldBe('false & "2.1"', '0');


shouldBe('10.3 | 3.1', '11');
shouldBe('"10.3" | 3.1', '11');
shouldBe('10.3 | "3.1"', '11');
shouldBe('"10.3" | "3.1"', '11');
shouldBe('10.3 | true', '11');
shouldBe('"10.3" | true', '11');
shouldBe('11.3 | true', '11');
shouldBe('"11.3" | true', '11');
shouldBe('10.3 | false', '10');
shouldBe('"10.3" | false', '10');
shouldBe('11.3 | false', '11');
shouldBe('"11.3" | false', '11');
shouldBe('true | 3.1', '3');
shouldBe('true | "3.1"', '3');
shouldBe('true | 2.1', '3');
shouldBe('true | "2.1"', '3');
shouldBe('false | 3.1', '3');
shouldBe('false | "3.1"', '3');
shouldBe('false | 2.1', '2');
shouldBe('false | "2.1"', '2');

shouldBe('10.3 ^ 3.1', '9');
shouldBe('"10.3" ^ 3.1', '9');
shouldBe('10.3 ^ "3.1"', '9');
shouldBe('"10.3" ^ "3.1"', '9');
shouldBe('10.3 ^ true', '11');
shouldBe('"10.3" ^ true', '11');
shouldBe('11.3 ^ true', '10');
shouldBe('"11.3" ^ true', '10');
shouldBe('10.3 ^ false', '10');
shouldBe('"10.3" ^ false', '10');
shouldBe('11.3 ^ false', '11');
shouldBe('"11.3" ^ false', '11');
shouldBe('true ^ 3.1', '2');
shouldBe('true ^ "3.1"', '2');
shouldBe('true ^ 2.1', '3');
shouldBe('true ^ "2.1"', '3');
shouldBe('false ^ 3.1', '3');
shouldBe('false ^ "3.1"', '3');
shouldBe('false ^ 2.1', '2');
shouldBe('false ^ "2.1"', '2');

shouldBe('10.3 == 3.1', 'false');
shouldBe('3.1 == 3.1', 'true');
shouldBe('"10.3" == 3.1', 'false');
shouldBe('"3.1" == 3.1', 'true');
shouldBe('10.3 == "3.1"', 'false');
shouldBe('3.1 == "3.1"', 'true');
shouldBe('"10.3" == "3.1"', 'false');
shouldBe('"3.1" == "3.1"', 'true');
shouldBe('10.3 == true', 'false');
shouldBe('1 == true', 'true');
shouldBe('"10.3" == true', 'false');
shouldBe('"1" == true', 'true');
shouldBe('10.3 == false', 'false');
shouldBe('0 == false', 'true');
shouldBe('"10.3" == false', 'false');
shouldBe('"0" == false', 'true');
shouldBe('true == 3.1', 'false');
shouldBe('true == 1', 'true');
shouldBe('true == "3.1"', 'false');
shouldBe('true == "1" ', 'true');
shouldBe('false == 3.1', 'false');
shouldBe('false == 0', 'true');
shouldBe('false == "3.1"', 'false');
shouldBe('false == "0"', 'true');
shouldBe('true == true', 'true');
shouldBe('false == true', 'false');
shouldBe('true == false', 'false');
shouldBe('false == false', 'true');

shouldBe('10.3 != 3.1', 'true');
shouldBe('3.1 != 3.1', 'false');
shouldBe('"10.3" != 3.1', 'true');
shouldBe('"3.1" != 3.1', 'false');
shouldBe('10.3 != "3.1"', 'true');
shouldBe('3.1 != "3.1"', 'false');
shouldBe('"10.3" != "3.1"', 'true');
shouldBe('"3.1" != "3.1"', 'false');
shouldBe('10.3 != true', 'true');
shouldBe('1 != true', 'false');
shouldBe('"10.3" != true', 'true');
shouldBe('"1" != true', 'false');
shouldBe('10.3 != false', 'true');
shouldBe('0 != false', 'false');
shouldBe('"10.3" != false', 'true');
shouldBe('"0" != false', 'false');
shouldBe('true != 3.1', 'true');
shouldBe('true != 1', 'false');
shouldBe('true != "3.1"', 'true');
shouldBe('true != "1" ', 'false');
shouldBe('false != 3.1', 'true');
shouldBe('false != 0', 'false');
shouldBe('false != "3.1"', 'true');
shouldBe('false != "0"', 'false');
shouldBe('true != true', 'false');
shouldBe('false != true', 'true');
shouldBe('true != false', 'true');
shouldBe('false != false', 'false');

shouldBe('10.3 > 3.1', 'true');
shouldBe('3.1 > 3.1', 'false');
shouldBe('"10.3" > 3.1', 'true');
shouldBe('"3.1" > 3.1', 'false');
shouldBe('10.3 > "3.1"', 'true');
shouldBe('3.1 > "3.1"', 'false');
shouldBe('"10.3" > "3.1"', 'false');
shouldBe('"3.1" > "3.1"', 'false');
shouldBe('10.3 > true', 'true');
shouldBe('0 > true', 'false');
shouldBe('"10.3" > true', 'true');
shouldBe('"0" > true', 'false');
shouldBe('10.3 > false', 'true');
shouldBe('-1 > false', 'false');
shouldBe('"10.3" > false', 'true');
shouldBe('"-1" > false', 'false');
shouldBe('true > 0.1', 'true');
shouldBe('true > 1.1', 'false');
shouldBe('true > "0.1"', 'true');
shouldBe('true > "1.1"', 'false');
shouldBe('false > -3.1', 'true');
shouldBe('false > 0', 'false');
shouldBe('false > "-3.1"', 'true');
shouldBe('false > "0"', 'false');
shouldBe('true > true', 'false');
shouldBe('false > true', 'false');
shouldBe('true > false', 'true');
shouldBe('false > false', 'false');

shouldBe('10.3 < 3.1', 'false');
shouldBe('2.1 < 3.1', 'true');
shouldBe('"10.3" < 3.1', 'false');
shouldBe('"2.1" < 3.1', 'true');
shouldBe('10.3 < "3.1"', 'false');
shouldBe('2.1 < "3.1"', 'true');
shouldBe('"10.3" < "3.1"', 'true');
shouldBe('"2.1" < "3.1"', 'true');
shouldBe('10.3 < true', 'false');
shouldBe('0 < true', 'true');
shouldBe('"10.3" < true', 'false');
shouldBe('"0" < true', 'true');
shouldBe('10.3 < false', 'false');
shouldBe('-1 < false', 'true');
shouldBe('"10.3" < false', 'false');
shouldBe('"-1" < false', 'true');
shouldBe('true < 0.1', 'false');
shouldBe('true < 1.1', 'true');
shouldBe('true < "0.1"', 'false');
shouldBe('true < "1.1"', 'true');
shouldBe('false < -3.1', 'false');
shouldBe('false < 0.1', 'true');
shouldBe('false < "-3.1"', 'false');
shouldBe('false < "0.1"', 'true');
shouldBe('true < true', 'false');
shouldBe('false < true', 'true');
shouldBe('true < false', 'false');
shouldBe('false < false', 'false');

shouldBe('10.3 >= 3.1', 'true');
shouldBe('2.1 >= 3.1', 'false');
shouldBe('"10.3" >= 3.1', 'true');
shouldBe('"2.1" >= 3.1', 'false');
shouldBe('10.3 >= "3.1"', 'true');
shouldBe('2.1 >= "3.1"', 'false');
shouldBe('"10.3" >= "3.1"', 'false');
shouldBe('"2.1" >= "3.1"', 'false');
shouldBe('10.3 >= true', 'true');
shouldBe('0 >= true', 'false');
shouldBe('"10.3" >= true', 'true');
shouldBe('"0" >= true', 'false');
shouldBe('10.3 >= false', 'true');
shouldBe('-1 >= false', 'false');
shouldBe('"10.3" >= false', 'true');
shouldBe('"-1" >= false', 'false');
shouldBe('true >= 0.1', 'true');
shouldBe('true >= 1.1', 'false');
shouldBe('true >= "0.1"', 'true');
shouldBe('true >= "1.1"', 'false');
shouldBe('false >= -3.1', 'true');
shouldBe('false >= 0', 'true');
shouldBe('false >= "-3.1"', 'true');
shouldBe('false >= "0"', 'true');
shouldBe('true >= true', 'true');
shouldBe('false >= true', 'false');
shouldBe('true >= false', 'true');
shouldBe('false >= false', 'true');

shouldBe('10.3 <= 3.1', 'false');
shouldBe('2.1 <= 3.1', 'true');
shouldBe('"10.3" <= 3.1', 'false');
shouldBe('"2.1" <= 3.1', 'true');
shouldBe('10.3 <= "3.1"', 'false');
shouldBe('2.1 <= "3.1"', 'true');
shouldBe('"10.3" <= "3.1"', 'true');
shouldBe('"2.1" <= "3.1"', 'true');
shouldBe('10.3 <= true', 'false');
shouldBe('0 <= true', 'true');
shouldBe('"10.3" <= true', 'false');
shouldBe('"0" <= true', 'true');
shouldBe('10.3 <= false', 'false');
shouldBe('-1 <= false', 'true');
shouldBe('"10.3" <= false', 'false');
shouldBe('"-1" <= false', 'true');
shouldBe('true <= 0.1', 'false');
shouldBe('true <= 1.1', 'true');
shouldBe('true <= "0.1"', 'false');
shouldBe('true <= "1.1"', 'true');
shouldBe('false <= -3.1', 'false');
shouldBe('false <= 0.1', 'true');
shouldBe('false <= "-3.1"', 'false');
shouldBe('false <= "0.1"', 'true');
shouldBe('true <= true', 'true');
shouldBe('false <= true', 'true');
shouldBe('true <= false', 'false');
shouldBe('false <= false', 'true');

shouldBe('true && true', 'true');
shouldBe('true && false', 'false');
shouldBe('false && true', 'false');
shouldBe('false && false', 'false');
shouldBe('1.1 && true', 'true');
shouldBe('1.1 && false', 'false');
shouldBe('0 && true', '0');
shouldBe('0 && false', '0');
shouldBe('"1.1" && true', 'true');
shouldBe('"1.1" && false', 'false');
shouldBe('"0" && true', 'true');
shouldBe('"0" && false', 'false');
shouldBe('true && 1.1', '1.1');
shouldBe('true && 0', '0');
shouldBe('false && 1.1', 'false');
shouldBe('false && 0', 'false');
shouldBe('true && "1.1"', '"1.1"');
shouldBe('true && "0"', '"0"');
shouldBe('false && "1.1"', 'false');
shouldBe('false && "0"', 'false');
shouldBe('1.1 && 1.1', '1.1');
shouldBe('1.1 && 0', '0');
shouldBe('0 && 1.1', '0');
shouldBe('0 && 0', '0');
shouldBe('"1.1" && 1.1', '1.1');
shouldBe('"1.1" && 0', '0');
shouldBe('"0" && 1.1', '1.1');
shouldBe('"0" && 0', '0');
shouldBe('1.1 && "1.1"', '"1.1"');
shouldBe('1.1 && "0"', '"0"');
shouldBe('0 && "1.1"', '0');
shouldBe('0 && "0"', '0');
shouldBe('"1.1" && "1.1"', '"1.1"');
shouldBe('"1.1" && "0"', '"0"');
shouldBe('"0" && "1.1"', '"1.1"');
shouldBe('"0" && "0"', '"0"');

shouldBe('true || true', 'true');
shouldBe('true || false', 'true');
shouldBe('false || true', 'true');
shouldBe('false || false', 'false');
shouldBe('1.1 || true', '1.1');
shouldBe('1.1 || false', '1.1');
shouldBe('0 || true', 'true');
shouldBe('0 || false', 'false');
shouldBe('"1.1" || true', '"1.1"');
shouldBe('"1.1" || false', '"1.1"');
shouldBe('"0" || true', '"0"');
shouldBe('"0" || false', '"0"');
shouldBe('true || 1.1', 'true');
shouldBe('true || 0', 'true');
shouldBe('false || 1.1', '1.1');
shouldBe('false || 0', '0');
shouldBe('true || "1.1"', 'true');
shouldBe('true || "0"', 'true');
shouldBe('false || "1.1"', '"1.1"');
shouldBe('false || "0"', '"0"');
shouldBe('1.1 || 1.1', '1.1');
shouldBe('1.1 || 0', '1.1');
shouldBe('0 || 1.1', '1.1');
shouldBe('0 || 0', '0');
shouldBe('"1.1" || 1.1', '"1.1"');
shouldBe('"1.1" || 0', '"1.1"');
shouldBe('"0" || 1.1', '"0"');
shouldBe('"0" || 0', '"0"');
shouldBe('1.1 || "1.1"', '1.1');
shouldBe('1.1 || "0"', '1.1');
shouldBe('0 || "1.1"', '"1.1"');
shouldBe('0 || "0"', '"0"');
shouldBe('"1.1" || "1.1"', '"1.1"');
shouldBe('"1.1" || "0"', '"1.1"');
shouldBe('"0" || "1.1"', '"0"');
shouldBe('"0" || "0"', '"0"');

shouldBe('+3.1', '3.1');
shouldBe('+ +3.1', '3.1');
shouldBe('+"3.1"', '3.1');
shouldBe('+true', '1');
shouldBe('+false', '0');

shouldBe('-3.1', '-3.1');
shouldBe('- -3.1', '3.1');
shouldBe('-"3.1"', '-3.1');
shouldBe('-true', '-1');
shouldBe('-false', '-0');

shouldBe('~3', '-4');
shouldBe('~ ~3', '3');
shouldBe('~"3"', '-4');
shouldBe('~true', '-2');
shouldBe('~false', '-1');

shouldBe('!true', 'false');
shouldBe('!false', 'true');
shouldBe('!3', 'false');
shouldBe('!0', 'true');

shouldBe('10.3 / 0', 'Infinity');
shouldBe('"10.3" / 0', 'Infinity');
shouldBe('-10.3 / 0', '-Infinity');
shouldBe('"-10.3" / 0', '-Infinity');
shouldBe('true / 0', 'Infinity');
shouldBe('false / 0', 'NaN');
shouldBe('0 / 0', 'NaN');

shouldBe('10.3 / -0', '-Infinity');
shouldBe('"10.3" / -0', '-Infinity');
shouldBe('-10.3 / -0', 'Infinity');
shouldBe('"-10.3" / -0', 'Infinity');
shouldBe('true / -0', '-Infinity');
shouldBe('false / -0', 'NaN');
shouldBe('0 / -0', 'NaN');

shouldBe('1 / -0', '-Infinity');
shouldBe('1 / - 0', '-Infinity');
shouldBe('1 / - -0', 'Infinity');
shouldBe('1 / - - -0', '-Infinity');
