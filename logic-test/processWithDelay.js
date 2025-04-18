var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function processWithDelay(numbers, delay, cancelToken) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, numbers_1, num, total, i, processed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Handle invalid inputs
                    if (!Array.isArray(numbers)) {
                        throw new Error("Invalid input: Expected an array of numbers.");
                    }
                    for (_i = 0, numbers_1 = numbers; _i < numbers_1.length; _i++) {
                        num = numbers_1[_i];
                        if (typeof num !== "number") {
                            throw new Error("Invalid input: Array must contain only numbers.");
                        }
                    }
                    // Handle empty arrays gracefully
                    if (numbers.length === 0) {
                        console.log("No numbers to process!");
                        return [2 /*return*/, Promise.resolve()];
                    }
                    total = numbers.length;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < total)) return [3 /*break*/, 4];
                    // Check for cancellation
                    if (cancelToken === null || cancelToken === void 0 ? void 0 : cancelToken.cancelled) {
                        console.log("Process cancelled!");
                        return [2 /*return*/];
                    }
                    // Process the current number
                    console.log(numbers[i]);
                    processed = i + 1;
                    console.log("Progress: ".concat(processed, "/").concat(total));
                    // Delay before processing the next number
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                case 2:
                    // Delay before processing the next number
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("All numbers processed!");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runCases() {
    return __awaiter(this, void 0, void 0, function () {
        var cancelToken, cancellationPromise, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Case 1: Normal execution
                    console.log("Running Case 1: Normal execution");
                    return [4 /*yield*/, processWithDelay([1, 2, 3, 4, 5], 1000)];
                case 1:
                    _a.sent();
                    console.log("----------------------------------------------------------------");
                    // Case 2: Empty array
                    console.log("Running Case 2: Empty array");
                    return [4 /*yield*/, processWithDelay([], 1000)];
                case 2:
                    _a.sent();
                    console.log("----------------------------------------------------------------");
                    // Case 3: Cancellation
                    console.log("Running Case 3: Cancellation");
                    cancelToken = { cancelled: false };
                    cancellationPromise = processWithDelay([1, 2, 3, 4, 5], 1000, cancelToken);
                    setTimeout(function () {
                        cancelToken.cancelled = true;
                    }, 2500);
                    return [4 /*yield*/, cancellationPromise];
                case 3:
                    _a.sent();
                    //Case 4: Invalid input (non-array)
                    console.log("----------------------------------------------------------------");
                    console.log("Running Case 4: Invalid input (non-array)");
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, processWithDelay("invalid input", 1000)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error(error_1.message);
                    return [3 /*break*/, 7];
                case 7:
                    // Case 5: Invalid input (array with non-number elements)
                    console.log("----------------------------------------------------------------");
                    console.log("Running Case 5: Invalid input (array with non-number elements)");
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, processWithDelay([1, "two", 3])];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _a.sent();
                    console.error(error_2.message);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Run all cases sequentially
runCases(); //.catch((error) => console.error("Error:", error.message));
