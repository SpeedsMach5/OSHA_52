"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _card = require("@/components/ui/card");
var _progress = require("@/components/ui/progress");
var _lucideReact = require("lucide-react");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var ProgressDashboard = function ProgressDashboard(_ref) {
  var user = _ref.user;
  var _ref2 = user || {},
    _ref2$completedWeeks = _ref2.completedWeeks,
    completedWeeks = _ref2$completedWeeks === void 0 ? [] : _ref2$completedWeeks,
    _ref2$quizScores = _ref2.quizScores,
    quizScores = _ref2$quizScores === void 0 ? {} : _ref2$quizScores,
    _ref2$achievements = _ref2.achievements,
    achievements = _ref2$achievements === void 0 ? [] : _ref2$achievements,
    lastAccessed = _ref2.lastAccessed;
  var completionRate = completedWeeks.length / 52 * 100;
  var averageScore = Object.values(quizScores).reduce(function (a, b) {
    return a + b;
  }, 0) / Object.values(quizScores).length || 0;
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/_react["default"].createElement(_card.Card, null, /*#__PURE__*/_react["default"].createElement(_card.CardHeader, null, /*#__PURE__*/_react["default"].createElement("h2", {
    className: "text-2xl font-bold"
  }, "Training Progress")), /*#__PURE__*/_react["default"].createElement(_card.CardContent, null, /*#__PURE__*/_react["default"].createElement(_progress.Progress, {
    value: completionRate,
    className: "h-2 w-full"
  }), /*#__PURE__*/_react["default"].createElement("p", {
    className: "mt-2 text-sm text-gray-600"
  }, completedWeeks.length, " of 52 weeks completed (", completionRate.toFixed(1), "%)"))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4"
  }, /*#__PURE__*/_react["default"].createElement(StatCard, {
    icon: /*#__PURE__*/_react["default"].createElement(_lucideReact.CheckCircle, {
      className: "h-5 w-5 text-green-500"
    }),
    title: "Average Score",
    value: "".concat(averageScore.toFixed(1), "%")
  }), /*#__PURE__*/_react["default"].createElement(StatCard, {
    icon: /*#__PURE__*/_react["default"].createElement(_lucideReact.Award, {
      className: "h-5 w-5 text-yellow-500"
    }),
    title: "Achievements",
    value: achievements.length
  }), /*#__PURE__*/_react["default"].createElement(StatCard, {
    icon: /*#__PURE__*/_react["default"].createElement(_lucideReact.Clock, {
      className: "h-5 w-5 text-blue-500"
    }),
    title: "Last Activity",
    value: lastAccessed ? new Date(lastAccessed).toLocaleDateString() : "N/A"
  })), /*#__PURE__*/_react["default"].createElement(_card.Card, null, /*#__PURE__*/_react["default"].createElement(_card.CardHeader, null, /*#__PURE__*/_react["default"].createElement("h3", {
    className: "text-lg font-semibold"
  }, "Recent Activity")), /*#__PURE__*/_react["default"].createElement(_card.CardContent, null, completedWeeks.slice(-3).map(function (week) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: week,
      className: "flex items-center justify-between py-2"
    }, /*#__PURE__*/_react["default"].createElement("span", null, "Week ", week, " Completed"), /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-green-600"
    }, quizScores[week], "%"));
  }))), /*#__PURE__*/_react["default"].createElement(_card.Card, null, /*#__PURE__*/_react["default"].createElement(_card.CardHeader, null, /*#__PURE__*/_react["default"].createElement("h3", {
    className: "text-lg font-semibold"
  }, "Next Steps")), /*#__PURE__*/_react["default"].createElement(_card.CardContent, null, completedWeeks.length < 52 ? /*#__PURE__*/_react["default"].createElement("p", null, "Continue with Week", " ", Math.min.apply(Math, _toConsumableArray(Array.from({
    length: 52
  }, function (_, i) {
    return i + 1;
  }).filter(function (w) {
    return !completedWeeks.includes(w);
  })))) : /*#__PURE__*/_react["default"].createElement("p", null, "All modules completed! Review any topics as needed."))));
};
var StatCard = function StatCard(_ref3) {
  var icon = _ref3.icon,
    title = _ref3.title,
    value = _ref3.value;
  return /*#__PURE__*/_react["default"].createElement(_card.Card, null, /*#__PURE__*/_react["default"].createElement(_card.CardContent, {
    className: "p-4"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2 mb-2"
  }, icon, /*#__PURE__*/_react["default"].createElement("span", {
    className: "font-medium"
  }, title)), /*#__PURE__*/_react["default"].createElement("p", {
    className: "text-2xl font-bold"
  }, value)));
};
var _default = exports["default"] = ProgressDashboard;