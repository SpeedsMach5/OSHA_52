"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _WeeklyTests = _interopRequireDefault(require("./components/WeeklyTests"));
var _ProgressDashboard = _interopRequireDefault(require("./components/ProgressDashboard"));
var _UserTracking = _interopRequireDefault(require("./components/UserTracking"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function App() {
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "container mx-auto p-4"
  }, /*#__PURE__*/_react["default"].createElement(_UserTracking["default"], null), /*#__PURE__*/_react["default"].createElement(_ProgressDashboard["default"], null), /*#__PURE__*/_react["default"].createElement(_WeeklyTests["default"], null));
}
var _default = exports["default"] = App;