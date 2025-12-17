"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = exports.closeDatabase = exports.getDatabase = exports.initDatabase = void 0;
var database_1 = require("./database");
Object.defineProperty(exports, "initDatabase", { enumerable: true, get: function () { return database_1.initDatabase; } });
Object.defineProperty(exports, "getDatabase", { enumerable: true, get: function () { return database_1.getDatabase; } });
Object.defineProperty(exports, "closeDatabase", { enumerable: true, get: function () { return database_1.closeDatabase; } });
Object.defineProperty(exports, "resetDatabase", { enumerable: true, get: function () { return database_1.resetDatabase; } });
__exportStar(require("./types"), exports);
__exportStar(require("./repositories"), exports);
//# sourceMappingURL=index.js.map