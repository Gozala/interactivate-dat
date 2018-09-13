// @observablehq/notebook-inspector Copyright 2018 Observable, Inc.
function dispatch(e, t, n) {
  n = n || {};var o = e.ownerDocument,
      r = o.defaultView.CustomEvent;"function" == typeof r ? r = new r(t, { detail: n }) : ((r = o.createEvent("Event")).initEvent(t, !1, !1), r.detail = n), e.dispatchEvent(r);
}function isarray(e) {
  return Array.isArray(e) || e instanceof Int8Array || e instanceof Int16Array || e instanceof Int32Array || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Uint16Array || e instanceof Uint32Array || e instanceof Float32Array || e instanceof Float64Array;
}function isindex(e) {
  return e === (0 | e) + "";
}const symbolToString = Symbol.prototype.toString;function formatSymbol(e) {
  return symbolToString.call(e);
}const { getOwnPropertySymbols: getOwnPropertySymbols, prototype: { hasOwnProperty: hasOwnProperty } } = Object,
      { toStringTag: toStringTag } = Symbol,
      FORBIDDEN = {},
      symbolsof = getOwnPropertySymbols;function isown(e, t) {
  return hasOwnProperty.call(e, t);
}function tagof(e) {
  return e[toStringTag] || e.constructor && e.constructor.name || "Object";
}function valueof(e, t) {
  try {
    const n = e[t];return n && n.constructor, n;
  } catch (e) {
    return FORBIDDEN;
  }
}function inspectExpanded(e) {
  const t = isarray(e);let n, o, r;e instanceof Map ? (n = `Map(${e.size})`, o = iterateMap) : e instanceof Set ? (n = `Set(${e.size})`, o = iterateSet) : t ? (n = `${e.constructor.name}(${e.length})`, o = iterateArray) : (n = tagof(e), o = iterateObject);const a = document.createElement("span");a.className = "observablehq--expanded";const i = a.appendChild(document.createElement("a"));i.innerHTML = "<svg width=8 height=8 class='observablehq--caret'>\n    <path d='M4 7L0 1h8z' fill='currentColor' />\n  </svg>", i.appendChild(document.createTextNode(`${n}${t ? " [" : " {"}`)), i.addEventListener("mouseup", function (t) {
    t.stopPropagation(), replace(a, inspectCollapsed(e));
  }), o = o(e);for (let e = 0; !(r = o.next()).done && e < 20; ++e) a.appendChild(r.value);if (!r.done) {
    const e = a.appendChild(document.createElement("a"));e.className = "observablehq--field", e.style.display = "block", e.appendChild(document.createTextNode("  … more")), e.addEventListener("mouseup", function (e) {
      e.stopPropagation(), a.insertBefore(r.value, a.lastChild.previousSibling);for (let e = 0; !(r = o.next()).done && e < 19; ++e) a.insertBefore(r.value, a.lastChild.previousSibling);r.done && a.removeChild(a.lastChild.previousSibling), dispatch(a, "load");
    });
  }return a.appendChild(document.createTextNode(t ? "]" : "}")), a;
}function* iterateMap(e) {
  for (const [t, n] of e) yield formatMapField(t, n);yield* iterateObject(e);
}function* iterateSet(e) {
  for (const t of e) yield formatSetField(t);yield* iterateObject(e);
}function* iterateArray(e) {
  for (let t = 0, n = e.length; t < n; ++t) t in e && (yield formatField(t, valueof(e, t), "observablehq--index"));for (const t in e) !isindex(t) && isown(e, t) && (yield formatField(t, valueof(e, t), "observablehq--key"));for (const t of symbolsof(e)) yield formatField(formatSymbol(t), valueof(e, t), "observablehq--symbol");
}function* iterateObject(e) {
  for (const t in e) isown(e, t) && (yield formatField(t, valueof(e, t), "observablehq--key"));for (const t of symbolsof(e)) yield formatField(formatSymbol(t), valueof(e, t), "observablehq--symbol");
}function formatField(e, t, n) {
  const o = document.createElement("div"),
        r = o.appendChild(document.createElement("span"));return o.className = "observablehq--field", r.className = n, r.textContent = `  ${e}`, o.appendChild(document.createTextNode(": ")), o.appendChild(inspect(t)), o;
}function formatMapField(e, t) {
  const n = document.createElement("div");return n.className = "observablehq--field", n.appendChild(document.createTextNode("  ")), n.appendChild(inspect(e)), n.appendChild(document.createTextNode(" => ")), n.appendChild(inspect(t)), n;
}function formatSetField(e) {
  const t = document.createElement("div");return t.className = "observablehq--field", t.appendChild(document.createTextNode("  ")), t.appendChild(inspect(e)), t;
}function inspectCollapsed(e, t) {
  const n = isarray(e);let o, r, a;if (e instanceof Map ? (o = `Map(${e.size})`, r = iterateMap$1) : e instanceof Set ? (o = `Set(${e.size})`, r = iterateSet$1) : n ? (o = `${e.constructor.name}(${e.length})`, r = iterateArray$1) : (o = tagof(e), r = iterateObject$1), t) {
    const t = document.createElement("span");return t.className = "observablehq--shallow", t.appendChild(document.createTextNode(o)), t.addEventListener("mouseup", function (n) {
      n.stopPropagation(), replace(t, inspectCollapsed(e));
    }), t;
  }const i = document.createElement("span");i.className = "observablehq--collapsed";const s = i.appendChild(document.createElement("a"));s.innerHTML = "<svg width=8 height=8 class='observablehq--caret'>\n    <path d='M7 4L1 8V0z' fill='currentColor' />\n  </svg>", s.appendChild(document.createTextNode(`${o}${n ? " [" : " {"}`)), i.addEventListener("mouseup", function (t) {
    t.stopPropagation(), replace(i, inspectExpanded(e));
  }, !0), r = r(e);for (let e = 0; !(a = r.next()).done && e < 20; ++e) e > 0 && i.appendChild(document.createTextNode(", ")), i.appendChild(a.value);return a.done || i.appendChild(document.createTextNode(", …")), i.appendChild(document.createTextNode(n ? "]" : "}")), i;
}function* iterateMap$1(e) {
  for (const [t, n] of e) yield formatMapField$1(t, n);yield* iterateObject$1(e);
}function* iterateSet$1(e) {
  for (const t of e) yield inspect(t, !0);yield* iterateObject$1(e);
}function* iterateArray$1(e) {
  for (let t = -1, n = 0, o = e.length; n < o; ++n) if (n in e) {
    let o = n - t - 1;if (o > 0) {
      const e = document.createElement("span");e.className = "observablehq--empty", e.textContent = 1 === o ? "empty" : `empty × ${n - t - 1}`, yield e;
    }yield inspect(valueof(e, n), !0), t = n;
  }for (const t in e) !isindex(t) && isown(e, t) && (yield formatField$1(t, valueof(e, t), "observablehq--key"));for (const t of symbolsof(e)) yield formatField$1(formatSymbol(t), valueof(e, t), "observablehq--symbol");
}function* iterateObject$1(e) {
  for (const t in e) isown(e, t) && (yield formatField$1(t, valueof(e, t), "observablehq--key"));for (const t of symbolsof(e)) yield formatField$1(formatSymbol(t), valueof(e, t), "observablehq--symbol");
}function formatField$1(e, t, n) {
  const o = document.createDocumentFragment(),
        r = o.appendChild(document.createElement("span"));return r.className = n, r.textContent = e, o.appendChild(document.createTextNode(": ")), o.appendChild(inspect(t, !0)), o;
}function formatMapField$1(e, t) {
  const n = document.createDocumentFragment();return n.appendChild(inspect(e, !0)), n.appendChild(document.createTextNode(" => ")), n.appendChild(inspect(t, !0)), n;
}function pad(e, t) {
  var n = e + "",
      o = n.length;return o < t ? new Array(t - o + 1).join(0) + n : n;
}function formatDate(e) {
  return isNaN(e) ? "Invalid Date" : pad(e.getFullYear(), 4) + "-" + pad(e.getMonth() + 1, 2) + "-" + pad(e.getDate(), 2) + (e.getMilliseconds() ? "T" + pad(e.getHours(), 2) + ":" + pad(e.getMinutes(), 2) + ":" + pad(e.getSeconds(), 2) + "." + pad(e.getMilliseconds(), 3) : e.getSeconds() ? "T" + pad(e.getHours(), 2) + ":" + pad(e.getMinutes(), 2) + ":" + pad(e.getSeconds(), 2) : e.getMinutes() || e.getHours() ? "T" + pad(e.getHours(), 2) + ":" + pad(e.getMinutes(), 2) : "");
}var errorToString = Error.prototype.toString;function formatError(e) {
  return e.stack || errorToString.call(e);
}var regExpToString = RegExp.prototype.toString;function formatRegExp(e) {
  return regExpToString.call(e);
}const NEWLINE_LIMIT = 20;function formatString(e, t, n) {
  if (!1 === t) {
    if (count(e, /["\n]/g) <= count(e, /`|\${/g)) {
      const t = document.createElement("span");return t.className = "observablehq--string", t.textContent = JSON.stringify(e), t;
    }const o = e.split("\n");if (o.length > NEWLINE_LIMIT && !n) {
      const n = document.createElement("div");n.className = "observablehq--string", n.textContent = "`" + templatify(o.slice(0, NEWLINE_LIMIT).join("\n"));const r = n.appendChild(document.createElement("span")),
            a = o.length - NEWLINE_LIMIT;return r.textContent = `Show ${a} truncated line${a > 1 ? "s" : ""}`, r.className = "observablehq--string-expand", r.addEventListener("mouseup", function (o) {
        o.stopPropagation(), replace(n, inspect(e, t, !0));
      }), n;
    }const r = document.createElement("span");return r.className = `observablehq--string${n ? " observablehq--expanded" : ""}`, r.textContent = "`" + templatify(e) + "`", r;
  }const o = document.createElement("span");return o.className = "observablehq--string", o.textContent = JSON.stringify(e.length > 100 ? `${e.slice(0, 50)}…${e.slice(-49)}` : e), o;
}function templatify(e) {
  return e.replace(/[\\`\x00-\x09\x0b-\x19]|\${/g, templatifyChar);
}function templatifyChar(e) {
  var t = e.charCodeAt(0);return t < 16 ? "\\x0" + t.toString(16) : t < 32 ? "\\x" + t.toString(16) : "\\" + e;
}function count(e, t) {
  for (var n = 0; t.exec(e);) ++n;return n;
}var toString = Function.prototype.toString,
    TYPE_ASYNC = { prefix: "async ƒ" },
    TYPE_ASYNC_GENERATOR = { prefix: "async ƒ*" },
    TYPE_CLASS = { prefix: "class" },
    TYPE_FUNCTION = { prefix: "ƒ" },
    TYPE_GENERATOR = { prefix: "ƒ*" };function inspectFunction(e) {
  var t,
      n,
      o = toString.call(e);switch (e.constructor && e.constructor.name) {case "AsyncFunction":
      t = TYPE_ASYNC;break;case "AsyncGeneratorFunction":
      t = TYPE_ASYNC_GENERATOR;break;case "GeneratorFunction":
      t = TYPE_GENERATOR;break;default:
      t = /^class\b/.test(o) ? TYPE_CLASS : TYPE_FUNCTION;}return t === TYPE_CLASS ? formatFunction(t, e.name || "") : (n = /^(?:async\s*)?(\w+)\s*=>/.exec(o)) ? formatFunction(t, "(" + n[1] + ")") : (n = /^(?:async\s*)?\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(o)) ? formatFunction(t, n[1] ? "(" + n[1].replace(/\s*,\s*/g, ", ") + ")" : "()") : (n = /^(?:async\s*)?function(?:\s*\*)?(?:\s*\w+)?\s*\(\s*(\w+(?:\s*,\s*\w+)*)?\s*\)/.exec(o)) ? formatFunction(t, (e.name || "") + (n[1] ? "(" + n[1].replace(/\s*,\s*/g, ", ") + ")" : "()")) : formatFunction(t, (e.name || "") + "(…)");
}function formatFunction(e, t) {
  var n = document.createElement("span");n.className = "observablehq--function";var o = n.appendChild(document.createElement("span"));return o.className = "observablehq--keyword", o.textContent = e.prefix, n.appendChild(document.createTextNode(" " + t)), n;
}const { prototype: { toString: toString$1 } } = Object;function inspect(e, t, n) {
  let o = typeof e;switch (o) {case "boolean":case "undefined":
      e += "";break;case "number":
      e = 0 === e && 1 / e < 0 ? "-0" : e + "";break;case "bigint":
      e += "n";break;case "symbol":
      e = formatSymbol(e);break;case "function":
      return inspectFunction(e);case "string":
      return formatString(e, t, n);default:
      if (null === e) {
        o = null, e = "null";break;
      }if (e instanceof Date) {
        o = "date", e = formatDate(e);break;
      }if (e === FORBIDDEN) {
        o = "forbidden", e = "[forbidden]";break;
      }switch (toString$1.call(e)) {case "[object RegExp]":
          o = "regexp", e = formatRegExp(e);break;case "[object Error]":case "[object DOMException]":
          o = "error", e = formatError(e);break;default:
          return (n ? inspectExpanded : inspectCollapsed)(e, t);}}const r = document.createElement("span");return r.className = `observablehq--${o}`, r.textContent = e, r;
}function replace(e, t) {
  e.classList.contains("observablehq--inspect") && t.classList.add("observablehq--inspect"), e.parentNode.replaceChild(t, e), dispatch(t, "load");
}const LOCATION_MATCH = /\s+\(\d+:\d+\)$/m;class Inspector {
  constructor(e) {
    if (!e) throw new Error("invalid node");this._node = e, e.classList.add("observablehq");
  }pending() {
    const { _node: e } = this;e.classList.remove("observablehq--error"), e.classList.add("observablehq--running");
  }fulfilled(e) {
    const { _node: t } = this;if ((!(e instanceof Element || e instanceof Text) || e.parentNode && e.parentNode !== t) && (e = inspect(e, !1, t.firstChild && t.firstChild.classList && t.firstChild.classList.contains("observablehq--expanded"))).classList.add("observablehq--inspect"), t.classList.remove("observablehq--running", "observablehq--error"), t.firstChild !== e) if (t.firstChild) {
      for (; t.lastChild !== t.firstChild;) t.removeChild(t.lastChild);t.replaceChild(e, t.firstChild);
    } else t.appendChild(e);dispatch(t, "update");
  }rejected(e) {
    const { _node: t } = this;for (t.classList.remove("observablehq--running"), t.classList.add("observablehq--error"); t.lastChild;) t.removeChild(t.lastChild);var n = document.createElement("span");n.className = "observablehq--inspect", n.textContent = (e + "").replace(LOCATION_MATCH, ""), t.appendChild(n), dispatch(t, "error", { error: e });
  }
}Inspector.into = function (e) {
  if ("string" == typeof e && null == (e = document.querySelector(e))) throw new Error("container not found");return function () {
    return new Inspector(e.appendChild(document.createElement("div")));
  };
};export { Inspector };