"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// User management hooks and state
function useUserProgress() {
  var _useState = (0, _react.useState)(function () {
      var stored = localStorage.getItem("osha_user");
      return stored ? JSON.parse(stored) : null;
    }),
    _useState2 = _slicedToArray(_useState, 2),
    user = _useState2[0],
    setUser = _useState2[1];
  var handleLogin = function handleLogin(name) {
    var userData = {
      name: name,
      startDate: new Date().toISOString(),
      completedWeeks: [],
      quizScores: {},
      achievements: [],
      streaks: {
        current: 0,
        longest: 0,
        lastCompleted: null
      }
    };
    localStorage.setItem("osha_user", JSON.stringify(userData));
    setUser(userData);
  };
  var updateProgress = function updateProgress(weekNum, quizScore) {
    if (!user) return;
    var updatedUser = _objectSpread(_objectSpread({}, user), {}, {
      completedWeeks: _toConsumableArray(new Set([].concat(_toConsumableArray(user.completedWeeks), [weekNum]))),
      quizScores: _objectSpread(_objectSpread({}, user.quizScores), {}, _defineProperty({}, weekNum, quizScore))
    });

    // Update streak
    var today = new Date();
    var lastComplete = user.streaks.lastCompleted ? new Date(user.streaks.lastCompleted) : null;
    if (lastComplete) {
      var daysDiff = Math.floor((today - lastComplete) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        updatedUser.streaks.current += 1;
        updatedUser.streaks.longest = Math.max(updatedUser.streaks.current, updatedUser.streaks.longest);
      } else {
        updatedUser.streaks.current = 1;
      }
    } else {
      updatedUser.streaks.current = 1;
      updatedUser.streaks.longest = 1;
    }
    updatedUser.streaks.lastCompleted = today.toISOString();

    // Check and award achievements
    updatedUser.achievements = calculateAchievements(updatedUser);
    localStorage.setItem("osha_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };
  return {
    user: user,
    handleLogin: handleLogin,
    updateProgress: updateProgress
  };
}

// Achievement system
var calculateAchievements = function calculateAchievements(user) {
  var achievements = [];

  // Progress based
  if (user.completedWeeks.length >= 10) achievements.push("Safety Scout");
  if (user.completedWeeks.length >= 25) achievements.push("Safety Expert");
  if (user.completedWeeks.length >= 52) achievements.push("Safety Master");

  // Quiz performance
  var perfectScores = Object.values(user.quizScores).filter(function (score) {
    return score === 100;
  }).length;
  if (perfectScores >= 5) achievements.push("Quiz Whiz");
  if (perfectScores >= 20) achievements.push("Safety Scholar");

  // Streaks
  if (user.streaks.longest >= 5) achievements.push("Consistency Champion");
  if (user.streaks.longest >= 10) achievements.push("Safety Streak Star");
  return _toConsumableArray(new Set(achievements));
};

// Initial login component
var LoginForm = function LoginForm(_ref) {
  var onLogin = _ref.onLogin;
  var _useState3 = (0, _react.useState)(""),
    _useState4 = _slicedToArray(_useState3, 2),
    name = _useState4[0],
    setName = _useState4[1];
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center justify-center min-h-screen bg-gray-100"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "p-8 bg-white rounded-lg shadow-md"
  }, /*#__PURE__*/_react["default"].createElement("h2", {
    className: "text-2xl font-bold mb-4"
  }, "Welcome to OSHA Training"), /*#__PURE__*/_react["default"].createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("label", {
    className: "block text-sm font-medium text-gray-700"
  }, "Your Name"), /*#__PURE__*/_react["default"].createElement("input", {
    type: "text",
    value: name,
    onChange: function onChange(e) {
      return setName(e.target.value);
    },
    className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500",
    required: true
  })), /*#__PURE__*/_react["default"].createElement("button", {
    type: "submit",
    className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  }, "Start Training"))));
};

// Main UserTracking component
var UserTracking = function UserTracking() {
  var _useUserProgress = useUserProgress(),
    user = _useUserProgress.user,
    handleLogin = _useUserProgress.handleLogin,
    updateProgress = _useUserProgress.updateProgress;
  if (!user) {
    return /*#__PURE__*/_react["default"].createElement(LoginForm, {
      onLogin: handleLogin
    });
  }
  return null; // or redirect to main content
};
var _default = exports["default"] = UserTracking;