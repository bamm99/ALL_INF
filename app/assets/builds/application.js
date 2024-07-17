var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@rails/actioncable/src/adapters.js
var adapters_default;
var init_adapters = __esm({
  "node_modules/@rails/actioncable/src/adapters.js"() {
    adapters_default = {
      logger: typeof console !== "undefined" ? console : void 0,
      WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
    };
  }
});

// node_modules/@rails/actioncable/src/logger.js
var logger_default;
var init_logger = __esm({
  "node_modules/@rails/actioncable/src/logger.js"() {
    init_adapters();
    logger_default = {
      log(...messages) {
        if (this.enabled) {
          messages.push(Date.now());
          adapters_default.logger.log("[ActionCable]", ...messages);
        }
      }
    };
  }
});

// node_modules/@rails/actioncable/src/connection_monitor.js
var now, secondsSince, ConnectionMonitor, connection_monitor_default;
var init_connection_monitor = __esm({
  "node_modules/@rails/actioncable/src/connection_monitor.js"() {
    init_logger();
    now = () => (/* @__PURE__ */ new Date()).getTime();
    secondsSince = (time) => (now() - time) / 1e3;
    ConnectionMonitor = class {
      constructor(connection) {
        this.visibilityDidChange = this.visibilityDidChange.bind(this);
        this.connection = connection;
        this.reconnectAttempts = 0;
      }
      start() {
        if (!this.isRunning()) {
          this.startedAt = now();
          delete this.stoppedAt;
          this.startPolling();
          addEventListener("visibilitychange", this.visibilityDidChange);
          logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
        }
      }
      stop() {
        if (this.isRunning()) {
          this.stoppedAt = now();
          this.stopPolling();
          removeEventListener("visibilitychange", this.visibilityDidChange);
          logger_default.log("ConnectionMonitor stopped");
        }
      }
      isRunning() {
        return this.startedAt && !this.stoppedAt;
      }
      recordPing() {
        this.pingedAt = now();
      }
      recordConnect() {
        this.reconnectAttempts = 0;
        this.recordPing();
        delete this.disconnectedAt;
        logger_default.log("ConnectionMonitor recorded connect");
      }
      recordDisconnect() {
        this.disconnectedAt = now();
        logger_default.log("ConnectionMonitor recorded disconnect");
      }
      // Private
      startPolling() {
        this.stopPolling();
        this.poll();
      }
      stopPolling() {
        clearTimeout(this.pollTimeout);
      }
      poll() {
        this.pollTimeout = setTimeout(
          () => {
            this.reconnectIfStale();
            this.poll();
          },
          this.getPollInterval()
        );
      }
      getPollInterval() {
        const { staleThreshold, reconnectionBackoffRate } = this.constructor;
        const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
        const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
        const jitter = jitterMax * Math.random();
        return staleThreshold * 1e3 * backoff * (1 + jitter);
      }
      reconnectIfStale() {
        if (this.connectionIsStale()) {
          logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
          this.reconnectAttempts++;
          if (this.disconnectedRecently()) {
            logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
          } else {
            logger_default.log("ConnectionMonitor reopening");
            this.connection.reopen();
          }
        }
      }
      get refreshedAt() {
        return this.pingedAt ? this.pingedAt : this.startedAt;
      }
      connectionIsStale() {
        return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
      }
      disconnectedRecently() {
        return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
      }
      visibilityDidChange() {
        if (document.visibilityState === "visible") {
          setTimeout(
            () => {
              if (this.connectionIsStale() || !this.connection.isOpen()) {
                logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                this.connection.reopen();
              }
            },
            200
          );
        }
      }
    };
    ConnectionMonitor.staleThreshold = 6;
    ConnectionMonitor.reconnectionBackoffRate = 0.15;
    connection_monitor_default = ConnectionMonitor;
  }
});

// node_modules/@rails/actioncable/src/internal.js
var internal_default;
var init_internal = __esm({
  "node_modules/@rails/actioncable/src/internal.js"() {
    internal_default = {
      "message_types": {
        "welcome": "welcome",
        "disconnect": "disconnect",
        "ping": "ping",
        "confirmation": "confirm_subscription",
        "rejection": "reject_subscription"
      },
      "disconnect_reasons": {
        "unauthorized": "unauthorized",
        "invalid_request": "invalid_request",
        "server_restart": "server_restart",
        "remote": "remote"
      },
      "default_mount_path": "/cable",
      "protocols": [
        "actioncable-v1-json",
        "actioncable-unsupported"
      ]
    };
  }
});

// node_modules/@rails/actioncable/src/connection.js
var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
var init_connection = __esm({
  "node_modules/@rails/actioncable/src/connection.js"() {
    init_adapters();
    init_connection_monitor();
    init_internal();
    init_logger();
    ({ message_types, protocols } = internal_default);
    supportedProtocols = protocols.slice(0, protocols.length - 1);
    indexOf = [].indexOf;
    Connection = class {
      constructor(consumer2) {
        this.open = this.open.bind(this);
        this.consumer = consumer2;
        this.subscriptions = this.consumer.subscriptions;
        this.monitor = new connection_monitor_default(this);
        this.disconnected = true;
      }
      send(data) {
        if (this.isOpen()) {
          this.webSocket.send(JSON.stringify(data));
          return true;
        } else {
          return false;
        }
      }
      open() {
        if (this.isActive()) {
          logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
          return false;
        } else {
          const socketProtocols = [...protocols, ...this.consumer.subprotocols || []];
          logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
          if (this.webSocket) {
            this.uninstallEventHandlers();
          }
          this.webSocket = new adapters_default.WebSocket(this.consumer.url, socketProtocols);
          this.installEventHandlers();
          this.monitor.start();
          return true;
        }
      }
      close({ allowReconnect } = { allowReconnect: true }) {
        if (!allowReconnect) {
          this.monitor.stop();
        }
        if (this.isOpen()) {
          return this.webSocket.close();
        }
      }
      reopen() {
        logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
        if (this.isActive()) {
          try {
            return this.close();
          } catch (error2) {
            logger_default.log("Failed to reopen WebSocket", error2);
          } finally {
            logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
            setTimeout(this.open, this.constructor.reopenDelay);
          }
        } else {
          return this.open();
        }
      }
      getProtocol() {
        if (this.webSocket) {
          return this.webSocket.protocol;
        }
      }
      isOpen() {
        return this.isState("open");
      }
      isActive() {
        return this.isState("open", "connecting");
      }
      triedToReconnect() {
        return this.monitor.reconnectAttempts > 0;
      }
      // Private
      isProtocolSupported() {
        return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
      }
      isState(...states) {
        return indexOf.call(states, this.getState()) >= 0;
      }
      getState() {
        if (this.webSocket) {
          for (let state in adapters_default.WebSocket) {
            if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
              return state.toLowerCase();
            }
          }
        }
        return null;
      }
      installEventHandlers() {
        for (let eventName in this.events) {
          const handler = this.events[eventName].bind(this);
          this.webSocket[`on${eventName}`] = handler;
        }
      }
      uninstallEventHandlers() {
        for (let eventName in this.events) {
          this.webSocket[`on${eventName}`] = function() {
          };
        }
      }
    };
    Connection.reopenDelay = 500;
    Connection.prototype.events = {
      message(event) {
        if (!this.isProtocolSupported()) {
          return;
        }
        const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
        switch (type) {
          case message_types.welcome:
            if (this.triedToReconnect()) {
              this.reconnectAttempted = true;
            }
            this.monitor.recordConnect();
            return this.subscriptions.reload();
          case message_types.disconnect:
            logger_default.log(`Disconnecting. Reason: ${reason}`);
            return this.close({ allowReconnect: reconnect });
          case message_types.ping:
            return this.monitor.recordPing();
          case message_types.confirmation:
            this.subscriptions.confirmSubscription(identifier);
            if (this.reconnectAttempted) {
              this.reconnectAttempted = false;
              return this.subscriptions.notify(identifier, "connected", { reconnected: true });
            } else {
              return this.subscriptions.notify(identifier, "connected", { reconnected: false });
            }
          case message_types.rejection:
            return this.subscriptions.reject(identifier);
          default:
            return this.subscriptions.notify(identifier, "received", message);
        }
      },
      open() {
        logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
        this.disconnected = false;
        if (!this.isProtocolSupported()) {
          logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
          return this.close({ allowReconnect: false });
        }
      },
      close(event) {
        logger_default.log("WebSocket onclose event");
        if (this.disconnected) {
          return;
        }
        this.disconnected = true;
        this.monitor.recordDisconnect();
        return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
      },
      error() {
        logger_default.log("WebSocket onerror event");
      }
    };
    connection_default = Connection;
  }
});

// node_modules/@rails/actioncable/src/subscription.js
var extend, Subscription;
var init_subscription = __esm({
  "node_modules/@rails/actioncable/src/subscription.js"() {
    extend = function(object, properties) {
      if (properties != null) {
        for (let key in properties) {
          const value = properties[key];
          object[key] = value;
        }
      }
      return object;
    };
    Subscription = class {
      constructor(consumer2, params = {}, mixin) {
        this.consumer = consumer2;
        this.identifier = JSON.stringify(params);
        extend(this, mixin);
      }
      // Perform a channel action with the optional data passed as an attribute
      perform(action, data = {}) {
        data.action = action;
        return this.send(data);
      }
      send(data) {
        return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
      }
      unsubscribe() {
        return this.consumer.subscriptions.remove(this);
      }
    };
  }
});

// node_modules/@rails/actioncable/src/subscription_guarantor.js
var SubscriptionGuarantor, subscription_guarantor_default;
var init_subscription_guarantor = __esm({
  "node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
    init_logger();
    SubscriptionGuarantor = class {
      constructor(subscriptions) {
        this.subscriptions = subscriptions;
        this.pendingSubscriptions = [];
      }
      guarantee(subscription) {
        if (this.pendingSubscriptions.indexOf(subscription) == -1) {
          logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
          this.pendingSubscriptions.push(subscription);
        } else {
          logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
        }
        this.startGuaranteeing();
      }
      forget(subscription) {
        logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
        this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
      }
      startGuaranteeing() {
        this.stopGuaranteeing();
        this.retrySubscribing();
      }
      stopGuaranteeing() {
        clearTimeout(this.retryTimeout);
      }
      retrySubscribing() {
        this.retryTimeout = setTimeout(
          () => {
            if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
              this.pendingSubscriptions.map((subscription) => {
                logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                this.subscriptions.subscribe(subscription);
              });
            }
          },
          500
        );
      }
    };
    subscription_guarantor_default = SubscriptionGuarantor;
  }
});

// node_modules/@rails/actioncable/src/subscriptions.js
var Subscriptions;
var init_subscriptions = __esm({
  "node_modules/@rails/actioncable/src/subscriptions.js"() {
    init_subscription();
    init_subscription_guarantor();
    init_logger();
    Subscriptions = class {
      constructor(consumer2) {
        this.consumer = consumer2;
        this.guarantor = new subscription_guarantor_default(this);
        this.subscriptions = [];
      }
      create(channelName, mixin) {
        const channel = channelName;
        const params = typeof channel === "object" ? channel : { channel };
        const subscription = new Subscription(this.consumer, params, mixin);
        return this.add(subscription);
      }
      // Private
      add(subscription) {
        this.subscriptions.push(subscription);
        this.consumer.ensureActiveConnection();
        this.notify(subscription, "initialized");
        this.subscribe(subscription);
        return subscription;
      }
      remove(subscription) {
        this.forget(subscription);
        if (!this.findAll(subscription.identifier).length) {
          this.sendCommand(subscription, "unsubscribe");
        }
        return subscription;
      }
      reject(identifier) {
        return this.findAll(identifier).map((subscription) => {
          this.forget(subscription);
          this.notify(subscription, "rejected");
          return subscription;
        });
      }
      forget(subscription) {
        this.guarantor.forget(subscription);
        this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
        return subscription;
      }
      findAll(identifier) {
        return this.subscriptions.filter((s) => s.identifier === identifier);
      }
      reload() {
        return this.subscriptions.map((subscription) => this.subscribe(subscription));
      }
      notifyAll(callbackName, ...args) {
        return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
      }
      notify(subscription, callbackName, ...args) {
        let subscriptions;
        if (typeof subscription === "string") {
          subscriptions = this.findAll(subscription);
        } else {
          subscriptions = [subscription];
        }
        return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
      }
      subscribe(subscription) {
        if (this.sendCommand(subscription, "subscribe")) {
          this.guarantor.guarantee(subscription);
        }
      }
      confirmSubscription(identifier) {
        logger_default.log(`Subscription confirmed ${identifier}`);
        this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
      }
      sendCommand(subscription, command) {
        const { identifier } = subscription;
        return this.consumer.send({ command, identifier });
      }
    };
  }
});

// node_modules/@rails/actioncable/src/consumer.js
function createWebSocketURL(url) {
  if (typeof url === "function") {
    url = url();
  }
  if (url && !/^wss?:/i.test(url)) {
    const a = document.createElement("a");
    a.href = url;
    a.href = a.href;
    a.protocol = a.protocol.replace("http", "ws");
    return a.href;
  } else {
    return url;
  }
}
var Consumer;
var init_consumer = __esm({
  "node_modules/@rails/actioncable/src/consumer.js"() {
    init_connection();
    init_subscriptions();
    Consumer = class {
      constructor(url) {
        this._url = url;
        this.subscriptions = new Subscriptions(this);
        this.connection = new connection_default(this);
        this.subprotocols = [];
      }
      get url() {
        return createWebSocketURL(this._url);
      }
      send(data) {
        return this.connection.send(data);
      }
      connect() {
        return this.connection.open();
      }
      disconnect() {
        return this.connection.close({ allowReconnect: false });
      }
      ensureActiveConnection() {
        if (!this.connection.isActive()) {
          return this.connection.open();
        }
      }
      addSubProtocol(subprotocol) {
        this.subprotocols = [...this.subprotocols, subprotocol];
      }
    };
  }
});

// node_modules/@rails/actioncable/src/index.js
var src_exports = {};
__export(src_exports, {
  Connection: () => connection_default,
  ConnectionMonitor: () => connection_monitor_default,
  Consumer: () => Consumer,
  INTERNAL: () => internal_default,
  Subscription: () => Subscription,
  SubscriptionGuarantor: () => subscription_guarantor_default,
  Subscriptions: () => Subscriptions,
  adapters: () => adapters_default,
  createConsumer: () => createConsumer,
  createWebSocketURL: () => createWebSocketURL,
  getConfig: () => getConfig,
  logger: () => logger_default
});
function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
  return new Consumer(url);
}
function getConfig(name) {
  const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
  if (element) {
    return element.getAttribute("content");
  }
}
var init_src = __esm({
  "node_modules/@rails/actioncable/src/index.js"() {
    init_connection();
    init_connection_monitor();
    init_consumer();
    init_internal();
    init_subscription();
    init_subscriptions();
    init_subscription_guarantor();
    init_adapters();
    init_logger();
  }
});

// node_modules/jquery/dist/jquery.js
var require_jquery = __commonJS({
  "node_modules/jquery/dist/jquery.js"(exports, module) {
    (function(global, factory) {
      "use strict";
      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ? factory(global, true) : function(w) {
          if (!w.document) {
            throw new Error("jQuery requires a window with a document");
          }
          return factory(w);
        };
      } else {
        factory(global);
      }
    })(typeof window !== "undefined" ? window : exports, function(window2, noGlobal) {
      "use strict";
      var arr = [];
      var getProto = Object.getPrototypeOf;
      var slice = arr.slice;
      var flat = arr.flat ? function(array) {
        return arr.flat.call(array);
      } : function(array) {
        return arr.concat.apply([], array);
      };
      var push = arr.push;
      var indexOf2 = arr.indexOf;
      var class2type = {};
      var toString = class2type.toString;
      var hasOwn = class2type.hasOwnProperty;
      var fnToString = hasOwn.toString;
      var ObjectFunctionString = fnToString.call(Object);
      var support = {};
      var isFunction = function isFunction2(obj) {
        return typeof obj === "function" && typeof obj.nodeType !== "number" && typeof obj.item !== "function";
      };
      var isWindow = function isWindow2(obj) {
        return obj != null && obj === obj.window;
      };
      var document2 = window2.document;
      var preservedScriptAttributes = {
        type: true,
        src: true,
        nonce: true,
        noModule: true
      };
      function DOMEval(code, node, doc) {
        doc = doc || document2;
        var i, val, script = doc.createElement("script");
        script.text = code;
        if (node) {
          for (i in preservedScriptAttributes) {
            val = node[i] || node.getAttribute && node.getAttribute(i);
            if (val) {
              script.setAttribute(i, val);
            }
          }
        }
        doc.head.appendChild(script).parentNode.removeChild(script);
      }
      function toType(obj) {
        if (obj == null) {
          return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
      }
      var version = "3.7.1", rhtmlSuffix = /HTML$/i, jQuery2 = function(selector, context) {
        return new jQuery2.fn.init(selector, context);
      };
      jQuery2.fn = jQuery2.prototype = {
        // The current version of jQuery being used
        jquery: version,
        constructor: jQuery2,
        // The default length of a jQuery object is 0
        length: 0,
        toArray: function() {
          return slice.call(this);
        },
        // Get the Nth element in the matched element set OR
        // Get the whole matched element set as a clean array
        get: function(num) {
          if (num == null) {
            return slice.call(this);
          }
          return num < 0 ? this[num + this.length] : this[num];
        },
        // Take an array of elements and push it onto the stack
        // (returning the new matched element set)
        pushStack: function(elems) {
          var ret = jQuery2.merge(this.constructor(), elems);
          ret.prevObject = this;
          return ret;
        },
        // Execute a callback for every element in the matched set.
        each: function(callback) {
          return jQuery2.each(this, callback);
        },
        map: function(callback) {
          return this.pushStack(jQuery2.map(this, function(elem, i) {
            return callback.call(elem, i, elem);
          }));
        },
        slice: function() {
          return this.pushStack(slice.apply(this, arguments));
        },
        first: function() {
          return this.eq(0);
        },
        last: function() {
          return this.eq(-1);
        },
        even: function() {
          return this.pushStack(jQuery2.grep(this, function(_elem, i) {
            return (i + 1) % 2;
          }));
        },
        odd: function() {
          return this.pushStack(jQuery2.grep(this, function(_elem, i) {
            return i % 2;
          }));
        },
        eq: function(i) {
          var len = this.length, j = +i + (i < 0 ? len : 0);
          return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
        },
        end: function() {
          return this.prevObject || this.constructor();
        },
        // For internal use only.
        // Behaves like an Array's method, not like a jQuery method.
        push,
        sort: arr.sort,
        splice: arr.splice
      };
      jQuery2.extend = jQuery2.fn.extend = function() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === "boolean") {
          deep = target;
          target = arguments[i] || {};
          i++;
        }
        if (typeof target !== "object" && !isFunction(target)) {
          target = {};
        }
        if (i === length) {
          target = this;
          i--;
        }
        for (; i < length; i++) {
          if ((options = arguments[i]) != null) {
            for (name in options) {
              copy = options[name];
              if (name === "__proto__" || target === copy) {
                continue;
              }
              if (deep && copy && (jQuery2.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                src = target[name];
                if (copyIsArray && !Array.isArray(src)) {
                  clone = [];
                } else if (!copyIsArray && !jQuery2.isPlainObject(src)) {
                  clone = {};
                } else {
                  clone = src;
                }
                copyIsArray = false;
                target[name] = jQuery2.extend(deep, clone, copy);
              } else if (copy !== void 0) {
                target[name] = copy;
              }
            }
          }
        }
        return target;
      };
      jQuery2.extend({
        // Unique for each copy of jQuery on the page
        expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
        // Assume jQuery is ready without the ready module
        isReady: true,
        error: function(msg) {
          throw new Error(msg);
        },
        noop: function() {
        },
        isPlainObject: function(obj) {
          var proto, Ctor;
          if (!obj || toString.call(obj) !== "[object Object]") {
            return false;
          }
          proto = getProto(obj);
          if (!proto) {
            return true;
          }
          Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
          return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
        },
        isEmptyObject: function(obj) {
          var name;
          for (name in obj) {
            return false;
          }
          return true;
        },
        // Evaluates a script in a provided context; falls back to the global one
        // if not specified.
        globalEval: function(code, options, doc) {
          DOMEval(code, { nonce: options && options.nonce }, doc);
        },
        each: function(obj, callback) {
          var length, i = 0;
          if (isArrayLike(obj)) {
            length = obj.length;
            for (; i < length; i++) {
              if (callback.call(obj[i], i, obj[i]) === false) {
                break;
              }
            }
          } else {
            for (i in obj) {
              if (callback.call(obj[i], i, obj[i]) === false) {
                break;
              }
            }
          }
          return obj;
        },
        // Retrieve the text value of an array of DOM nodes
        text: function(elem) {
          var node, ret = "", i = 0, nodeType = elem.nodeType;
          if (!nodeType) {
            while (node = elem[i++]) {
              ret += jQuery2.text(node);
            }
          }
          if (nodeType === 1 || nodeType === 11) {
            return elem.textContent;
          }
          if (nodeType === 9) {
            return elem.documentElement.textContent;
          }
          if (nodeType === 3 || nodeType === 4) {
            return elem.nodeValue;
          }
          return ret;
        },
        // results is for internal usage only
        makeArray: function(arr2, results) {
          var ret = results || [];
          if (arr2 != null) {
            if (isArrayLike(Object(arr2))) {
              jQuery2.merge(
                ret,
                typeof arr2 === "string" ? [arr2] : arr2
              );
            } else {
              push.call(ret, arr2);
            }
          }
          return ret;
        },
        inArray: function(elem, arr2, i) {
          return arr2 == null ? -1 : indexOf2.call(arr2, elem, i);
        },
        isXMLDoc: function(elem) {
          var namespace = elem && elem.namespaceURI, docElem = elem && (elem.ownerDocument || elem).documentElement;
          return !rhtmlSuffix.test(namespace || docElem && docElem.nodeName || "HTML");
        },
        // Support: Android <=4.0 only, PhantomJS 1 only
        // push.apply(_, arraylike) throws on ancient WebKit
        merge: function(first, second) {
          var len = +second.length, j = 0, i = first.length;
          for (; j < len; j++) {
            first[i++] = second[j];
          }
          first.length = i;
          return first;
        },
        grep: function(elems, callback, invert) {
          var callbackInverse, matches2 = [], i = 0, length = elems.length, callbackExpect = !invert;
          for (; i < length; i++) {
            callbackInverse = !callback(elems[i], i);
            if (callbackInverse !== callbackExpect) {
              matches2.push(elems[i]);
            }
          }
          return matches2;
        },
        // arg is for internal usage only
        map: function(elems, callback, arg) {
          var length, value, i = 0, ret = [];
          if (isArrayLike(elems)) {
            length = elems.length;
            for (; i < length; i++) {
              value = callback(elems[i], i, arg);
              if (value != null) {
                ret.push(value);
              }
            }
          } else {
            for (i in elems) {
              value = callback(elems[i], i, arg);
              if (value != null) {
                ret.push(value);
              }
            }
          }
          return flat(ret);
        },
        // A global GUID counter for objects
        guid: 1,
        // jQuery.support is not used in Core but other projects attach their
        // properties to it so it needs to exist.
        support
      });
      if (typeof Symbol === "function") {
        jQuery2.fn[Symbol.iterator] = arr[Symbol.iterator];
      }
      jQuery2.each(
        "Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),
        function(_i, name) {
          class2type["[object " + name + "]"] = name.toLowerCase();
        }
      );
      function isArrayLike(obj) {
        var length = !!obj && "length" in obj && obj.length, type = toType(obj);
        if (isFunction(obj) || isWindow(obj)) {
          return false;
        }
        return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
      }
      function nodeName(elem, name) {
        return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
      }
      var pop = arr.pop;
      var sort = arr.sort;
      var splice = arr.splice;
      var whitespace = "[\\x20\\t\\r\\n\\f]";
      var rtrimCSS = new RegExp(
        "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
        "g"
      );
      jQuery2.contains = function(a, b) {
        var bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && // Support: IE 9 - 11+
        // IE doesn't have `contains` on SVG.
        (a.contains ? a.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
      };
      var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;
      function fcssescape(ch, asCodePoint) {
        if (asCodePoint) {
          if (ch === "\0") {
            return "\uFFFD";
          }
          return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
        }
        return "\\" + ch;
      }
      jQuery2.escapeSelector = function(sel) {
        return (sel + "").replace(rcssescape, fcssescape);
      };
      var preferredDoc = document2, pushNative = push;
      (function() {
        var i, Expr, outermostContext, sortInput, hasDuplicate, push2 = pushNative, document3, documentElement2, documentIsHTML, rbuggyQSA, matches2, expando = jQuery2.expando, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), nonnativeSelectorCache = createCache(), sortOrder = function(a, b) {
          if (a === b) {
            hasDuplicate = true;
          }
          return 0;
        }, booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+", attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + // Operator (capture 2)
        "*([*^$|!~]?=)" + whitespace + // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
        `*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(` + identifier + "))|)" + whitespace + "*\\]", pseudos = ":(" + identifier + `)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|` + attributes + ")*)|.*)\\)|)", rwhitespace = new RegExp(whitespace + "+", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"), rleadingCombinator = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"), rdescend = new RegExp(whitespace + "|>"), rpseudo = new RegExp(pseudos), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = {
          ID: new RegExp("^#(" + identifier + ")"),
          CLASS: new RegExp("^\\.(" + identifier + ")"),
          TAG: new RegExp("^(" + identifier + "|[*])"),
          ATTR: new RegExp("^" + attributes),
          PSEUDO: new RegExp("^" + pseudos),
          CHILD: new RegExp(
            "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)",
            "i"
          ),
          bool: new RegExp("^(?:" + booleans + ")$", "i"),
          // For use in libraries implementing .is()
          // We use this for POS matching in `select`
          needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
        }, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rquickExpr2 = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, runescape = new RegExp("\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g"), funescape = function(escape, nonHex) {
          var high = "0x" + escape.slice(1) - 65536;
          if (nonHex) {
            return nonHex;
          }
          return high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
        }, unloadHandler = function() {
          setDocument();
        }, inDisabledFieldset = addCombinator(
          function(elem) {
            return elem.disabled === true && nodeName(elem, "fieldset");
          },
          { dir: "parentNode", next: "legend" }
        );
        function safeActiveElement() {
          try {
            return document3.activeElement;
          } catch (err) {
          }
        }
        try {
          push2.apply(
            arr = slice.call(preferredDoc.childNodes),
            preferredDoc.childNodes
          );
          arr[preferredDoc.childNodes.length].nodeType;
        } catch (e) {
          push2 = {
            apply: function(target, els) {
              pushNative.apply(target, slice.call(els));
            },
            call: function(target) {
              pushNative.apply(target, slice.call(arguments, 1));
            }
          };
        }
        function find(selector, context, results, seed) {
          var m2, i2, elem, nid, match, groups, newSelector, newContext = context && context.ownerDocument, nodeType = context ? context.nodeType : 9;
          results = results || [];
          if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
            return results;
          }
          if (!seed) {
            setDocument(context);
            context = context || document3;
            if (documentIsHTML) {
              if (nodeType !== 11 && (match = rquickExpr2.exec(selector))) {
                if (m2 = match[1]) {
                  if (nodeType === 9) {
                    if (elem = context.getElementById(m2)) {
                      if (elem.id === m2) {
                        push2.call(results, elem);
                        return results;
                      }
                    } else {
                      return results;
                    }
                  } else {
                    if (newContext && (elem = newContext.getElementById(m2)) && find.contains(context, elem) && elem.id === m2) {
                      push2.call(results, elem);
                      return results;
                    }
                  }
                } else if (match[2]) {
                  push2.apply(results, context.getElementsByTagName(selector));
                  return results;
                } else if ((m2 = match[3]) && context.getElementsByClassName) {
                  push2.apply(results, context.getElementsByClassName(m2));
                  return results;
                }
              }
              if (!nonnativeSelectorCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                newSelector = selector;
                newContext = context;
                if (nodeType === 1 && (rdescend.test(selector) || rleadingCombinator.test(selector))) {
                  newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                  if (newContext != context || !support.scope) {
                    if (nid = context.getAttribute("id")) {
                      nid = jQuery2.escapeSelector(nid);
                    } else {
                      context.setAttribute("id", nid = expando);
                    }
                  }
                  groups = tokenize2(selector);
                  i2 = groups.length;
                  while (i2--) {
                    groups[i2] = (nid ? "#" + nid : ":scope") + " " + toSelector(groups[i2]);
                  }
                  newSelector = groups.join(",");
                }
                try {
                  push2.apply(
                    results,
                    newContext.querySelectorAll(newSelector)
                  );
                  return results;
                } catch (qsaError) {
                  nonnativeSelectorCache(selector, true);
                } finally {
                  if (nid === expando) {
                    context.removeAttribute("id");
                  }
                }
              }
            }
          }
          return select(selector.replace(rtrimCSS, "$1"), context, results, seed);
        }
        function createCache() {
          var keys = [];
          function cache2(key, value) {
            if (keys.push(key + " ") > Expr.cacheLength) {
              delete cache2[keys.shift()];
            }
            return cache2[key + " "] = value;
          }
          return cache2;
        }
        function markFunction(fn) {
          fn[expando] = true;
          return fn;
        }
        function assert(fn) {
          var el = document3.createElement("fieldset");
          try {
            return !!fn(el);
          } catch (e) {
            return false;
          } finally {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
            el = null;
          }
        }
        function createInputPseudo(type) {
          return function(elem) {
            return nodeName(elem, "input") && elem.type === type;
          };
        }
        function createButtonPseudo(type) {
          return function(elem) {
            return (nodeName(elem, "input") || nodeName(elem, "button")) && elem.type === type;
          };
        }
        function createDisabledPseudo(disabled) {
          return function(elem) {
            if ("form" in elem) {
              if (elem.parentNode && elem.disabled === false) {
                if ("label" in elem) {
                  if ("label" in elem.parentNode) {
                    return elem.parentNode.disabled === disabled;
                  } else {
                    return elem.disabled === disabled;
                  }
                }
                return elem.isDisabled === disabled || // Where there is no isDisabled, check manually
                elem.isDisabled !== !disabled && inDisabledFieldset(elem) === disabled;
              }
              return elem.disabled === disabled;
            } else if ("label" in elem) {
              return elem.disabled === disabled;
            }
            return false;
          };
        }
        function createPositionalPseudo(fn) {
          return markFunction(function(argument) {
            argument = +argument;
            return markFunction(function(seed, matches3) {
              var j, matchIndexes = fn([], seed.length, argument), i2 = matchIndexes.length;
              while (i2--) {
                if (seed[j = matchIndexes[i2]]) {
                  seed[j] = !(matches3[j] = seed[j]);
                }
              }
            });
          });
        }
        function testContext(context) {
          return context && typeof context.getElementsByTagName !== "undefined" && context;
        }
        function setDocument(node) {
          var subWindow, doc = node ? node.ownerDocument || node : preferredDoc;
          if (doc == document3 || doc.nodeType !== 9 || !doc.documentElement) {
            return document3;
          }
          document3 = doc;
          documentElement2 = document3.documentElement;
          documentIsHTML = !jQuery2.isXMLDoc(document3);
          matches2 = documentElement2.matches || documentElement2.webkitMatchesSelector || documentElement2.msMatchesSelector;
          if (documentElement2.msMatchesSelector && // Support: IE 11+, Edge 17 - 18+
          // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
          // two documents; shallow comparisons work.
          // eslint-disable-next-line eqeqeq
          preferredDoc != document3 && (subWindow = document3.defaultView) && subWindow.top !== subWindow) {
            subWindow.addEventListener("unload", unloadHandler);
          }
          support.getById = assert(function(el) {
            documentElement2.appendChild(el).id = jQuery2.expando;
            return !document3.getElementsByName || !document3.getElementsByName(jQuery2.expando).length;
          });
          support.disconnectedMatch = assert(function(el) {
            return matches2.call(el, "*");
          });
          support.scope = assert(function() {
            return document3.querySelectorAll(":scope");
          });
          support.cssHas = assert(function() {
            try {
              document3.querySelector(":has(*,:jqfake)");
              return false;
            } catch (e) {
              return true;
            }
          });
          if (support.getById) {
            Expr.filter.ID = function(id) {
              var attrId = id.replace(runescape, funescape);
              return function(elem) {
                return elem.getAttribute("id") === attrId;
              };
            };
            Expr.find.ID = function(id, context) {
              if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                var elem = context.getElementById(id);
                return elem ? [elem] : [];
              }
            };
          } else {
            Expr.filter.ID = function(id) {
              var attrId = id.replace(runescape, funescape);
              return function(elem) {
                var node2 = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                return node2 && node2.value === attrId;
              };
            };
            Expr.find.ID = function(id, context) {
              if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                var node2, i2, elems, elem = context.getElementById(id);
                if (elem) {
                  node2 = elem.getAttributeNode("id");
                  if (node2 && node2.value === id) {
                    return [elem];
                  }
                  elems = context.getElementsByName(id);
                  i2 = 0;
                  while (elem = elems[i2++]) {
                    node2 = elem.getAttributeNode("id");
                    if (node2 && node2.value === id) {
                      return [elem];
                    }
                  }
                }
                return [];
              }
            };
          }
          Expr.find.TAG = function(tag, context) {
            if (typeof context.getElementsByTagName !== "undefined") {
              return context.getElementsByTagName(tag);
            } else {
              return context.querySelectorAll(tag);
            }
          };
          Expr.find.CLASS = function(className, context) {
            if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
              return context.getElementsByClassName(className);
            }
          };
          rbuggyQSA = [];
          assert(function(el) {
            var input;
            documentElement2.appendChild(el).innerHTML = "<a id='" + expando + "' href='' disabled='disabled'></a><select id='" + expando + "-\r\\' disabled='disabled'><option selected=''></option></select>";
            if (!el.querySelectorAll("[selected]").length) {
              rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
            }
            if (!el.querySelectorAll("[id~=" + expando + "-]").length) {
              rbuggyQSA.push("~=");
            }
            if (!el.querySelectorAll("a#" + expando + "+*").length) {
              rbuggyQSA.push(".#.+[+~]");
            }
            if (!el.querySelectorAll(":checked").length) {
              rbuggyQSA.push(":checked");
            }
            input = document3.createElement("input");
            input.setAttribute("type", "hidden");
            el.appendChild(input).setAttribute("name", "D");
            documentElement2.appendChild(el).disabled = true;
            if (el.querySelectorAll(":disabled").length !== 2) {
              rbuggyQSA.push(":enabled", ":disabled");
            }
            input = document3.createElement("input");
            input.setAttribute("name", "");
            el.appendChild(input);
            if (!el.querySelectorAll("[name='']").length) {
              rbuggyQSA.push("\\[" + whitespace + "*name" + whitespace + "*=" + whitespace + `*(?:''|"")`);
            }
          });
          if (!support.cssHas) {
            rbuggyQSA.push(":has");
          }
          rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
          sortOrder = function(a, b) {
            if (a === b) {
              hasDuplicate = true;
              return 0;
            }
            var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
            if (compare) {
              return compare;
            }
            compare = (a.ownerDocument || a) == (b.ownerDocument || b) ? a.compareDocumentPosition(b) : (
              // Otherwise we know they are disconnected
              1
            );
            if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {
              if (a === document3 || a.ownerDocument == preferredDoc && find.contains(preferredDoc, a)) {
                return -1;
              }
              if (b === document3 || b.ownerDocument == preferredDoc && find.contains(preferredDoc, b)) {
                return 1;
              }
              return sortInput ? indexOf2.call(sortInput, a) - indexOf2.call(sortInput, b) : 0;
            }
            return compare & 4 ? -1 : 1;
          };
          return document3;
        }
        find.matches = function(expr, elements) {
          return find(expr, null, null, elements);
        };
        find.matchesSelector = function(elem, expr) {
          setDocument(elem);
          if (documentIsHTML && !nonnativeSelectorCache[expr + " "] && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
            try {
              var ret = matches2.call(elem, expr);
              if (ret || support.disconnectedMatch || // As well, disconnected nodes are said to be in a document
              // fragment in IE 9
              elem.document && elem.document.nodeType !== 11) {
                return ret;
              }
            } catch (e) {
              nonnativeSelectorCache(expr, true);
            }
          }
          return find(expr, document3, null, [elem]).length > 0;
        };
        find.contains = function(context, elem) {
          if ((context.ownerDocument || context) != document3) {
            setDocument(context);
          }
          return jQuery2.contains(context, elem);
        };
        find.attr = function(elem, name) {
          if ((elem.ownerDocument || elem) != document3) {
            setDocument(elem);
          }
          var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
          if (val !== void 0) {
            return val;
          }
          return elem.getAttribute(name);
        };
        find.error = function(msg) {
          throw new Error("Syntax error, unrecognized expression: " + msg);
        };
        jQuery2.uniqueSort = function(results) {
          var elem, duplicates = [], j = 0, i2 = 0;
          hasDuplicate = !support.sortStable;
          sortInput = !support.sortStable && slice.call(results, 0);
          sort.call(results, sortOrder);
          if (hasDuplicate) {
            while (elem = results[i2++]) {
              if (elem === results[i2]) {
                j = duplicates.push(i2);
              }
            }
            while (j--) {
              splice.call(results, duplicates[j], 1);
            }
          }
          sortInput = null;
          return results;
        };
        jQuery2.fn.uniqueSort = function() {
          return this.pushStack(jQuery2.uniqueSort(slice.apply(this)));
        };
        Expr = jQuery2.expr = {
          // Can be adjusted by the user
          cacheLength: 50,
          createPseudo: markFunction,
          match: matchExpr,
          attrHandle: {},
          find: {},
          relative: {
            ">": { dir: "parentNode", first: true },
            " ": { dir: "parentNode" },
            "+": { dir: "previousSibling", first: true },
            "~": { dir: "previousSibling" }
          },
          preFilter: {
            ATTR: function(match) {
              match[1] = match[1].replace(runescape, funescape);
              match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
              if (match[2] === "~=") {
                match[3] = " " + match[3] + " ";
              }
              return match.slice(0, 4);
            },
            CHILD: function(match) {
              match[1] = match[1].toLowerCase();
              if (match[1].slice(0, 3) === "nth") {
                if (!match[3]) {
                  find.error(match[0]);
                }
                match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                match[5] = +(match[7] + match[8] || match[3] === "odd");
              } else if (match[3]) {
                find.error(match[0]);
              }
              return match;
            },
            PSEUDO: function(match) {
              var excess, unquoted = !match[6] && match[2];
              if (matchExpr.CHILD.test(match[0])) {
                return null;
              }
              if (match[3]) {
                match[2] = match[4] || match[5] || "";
              } else if (unquoted && rpseudo.test(unquoted) && // Get excess from tokenize (recursively)
              (excess = tokenize2(unquoted, true)) && // advance to the next closing parenthesis
              (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                match[0] = match[0].slice(0, excess);
                match[2] = unquoted.slice(0, excess);
              }
              return match.slice(0, 3);
            }
          },
          filter: {
            TAG: function(nodeNameSelector) {
              var expectedNodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
              return nodeNameSelector === "*" ? function() {
                return true;
              } : function(elem) {
                return nodeName(elem, expectedNodeName);
              };
            },
            CLASS: function(className) {
              var pattern = classCache[className + " "];
              return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                return pattern.test(
                  typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || ""
                );
              });
            },
            ATTR: function(name, operator, check) {
              return function(elem) {
                var result = find.attr(elem, name);
                if (result == null) {
                  return operator === "!=";
                }
                if (!operator) {
                  return true;
                }
                result += "";
                if (operator === "=") {
                  return result === check;
                }
                if (operator === "!=") {
                  return result !== check;
                }
                if (operator === "^=") {
                  return check && result.indexOf(check) === 0;
                }
                if (operator === "*=") {
                  return check && result.indexOf(check) > -1;
                }
                if (operator === "$=") {
                  return check && result.slice(-check.length) === check;
                }
                if (operator === "~=") {
                  return (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1;
                }
                if (operator === "|=") {
                  return result === check || result.slice(0, check.length + 1) === check + "-";
                }
                return false;
              };
            },
            CHILD: function(type, what, _argument, first, last) {
              var simple = type.slice(0, 3) !== "nth", forward = type.slice(-4) !== "last", ofType = what === "of-type";
              return first === 1 && last === 0 ? (
                // Shortcut for :nth-*(n)
                function(elem) {
                  return !!elem.parentNode;
                }
              ) : function(elem, _context, xml) {
                var cache2, outerCache, node, nodeIndex, start3, dir2 = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType, diff = false;
                if (parent) {
                  if (simple) {
                    while (dir2) {
                      node = elem;
                      while (node = node[dir2]) {
                        if (ofType ? nodeName(node, name) : node.nodeType === 1) {
                          return false;
                        }
                      }
                      start3 = dir2 = type === "only" && !start3 && "nextSibling";
                    }
                    return true;
                  }
                  start3 = [forward ? parent.firstChild : parent.lastChild];
                  if (forward && useCache) {
                    outerCache = parent[expando] || (parent[expando] = {});
                    cache2 = outerCache[type] || [];
                    nodeIndex = cache2[0] === dirruns && cache2[1];
                    diff = nodeIndex && cache2[2];
                    node = nodeIndex && parent.childNodes[nodeIndex];
                    while (node = ++nodeIndex && node && node[dir2] || // Fallback to seeking `elem` from the start
                    (diff = nodeIndex = 0) || start3.pop()) {
                      if (node.nodeType === 1 && ++diff && node === elem) {
                        outerCache[type] = [dirruns, nodeIndex, diff];
                        break;
                      }
                    }
                  } else {
                    if (useCache) {
                      outerCache = elem[expando] || (elem[expando] = {});
                      cache2 = outerCache[type] || [];
                      nodeIndex = cache2[0] === dirruns && cache2[1];
                      diff = nodeIndex;
                    }
                    if (diff === false) {
                      while (node = ++nodeIndex && node && node[dir2] || (diff = nodeIndex = 0) || start3.pop()) {
                        if ((ofType ? nodeName(node, name) : node.nodeType === 1) && ++diff) {
                          if (useCache) {
                            outerCache = node[expando] || (node[expando] = {});
                            outerCache[type] = [dirruns, diff];
                          }
                          if (node === elem) {
                            break;
                          }
                        }
                      }
                    }
                  }
                  diff -= last;
                  return diff === first || diff % first === 0 && diff / first >= 0;
                }
              };
            },
            PSEUDO: function(pseudo, argument) {
              var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || find.error("unsupported pseudo: " + pseudo);
              if (fn[expando]) {
                return fn(argument);
              }
              if (fn.length > 1) {
                args = [pseudo, pseudo, "", argument];
                return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches3) {
                  var idx, matched = fn(seed, argument), i2 = matched.length;
                  while (i2--) {
                    idx = indexOf2.call(seed, matched[i2]);
                    seed[idx] = !(matches3[idx] = matched[i2]);
                  }
                }) : function(elem) {
                  return fn(elem, 0, args);
                };
              }
              return fn;
            }
          },
          pseudos: {
            // Potentially complex pseudos
            not: markFunction(function(selector) {
              var input = [], results = [], matcher = compile(selector.replace(rtrimCSS, "$1"));
              return matcher[expando] ? markFunction(function(seed, matches3, _context, xml) {
                var elem, unmatched = matcher(seed, null, xml, []), i2 = seed.length;
                while (i2--) {
                  if (elem = unmatched[i2]) {
                    seed[i2] = !(matches3[i2] = elem);
                  }
                }
              }) : function(elem, _context, xml) {
                input[0] = elem;
                matcher(input, null, xml, results);
                input[0] = null;
                return !results.pop();
              };
            }),
            has: markFunction(function(selector) {
              return function(elem) {
                return find(selector, elem).length > 0;
              };
            }),
            contains: markFunction(function(text) {
              text = text.replace(runescape, funescape);
              return function(elem) {
                return (elem.textContent || jQuery2.text(elem)).indexOf(text) > -1;
              };
            }),
            // "Whether an element is represented by a :lang() selector
            // is based solely on the element's language value
            // being equal to the identifier C,
            // or beginning with the identifier C immediately followed by "-".
            // The matching of C against the element's language value is performed case-insensitively.
            // The identifier C does not have to be a valid language name."
            // https://www.w3.org/TR/selectors/#lang-pseudo
            lang: markFunction(function(lang) {
              if (!ridentifier.test(lang || "")) {
                find.error("unsupported lang: " + lang);
              }
              lang = lang.replace(runescape, funescape).toLowerCase();
              return function(elem) {
                var elemLang;
                do {
                  if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                    elemLang = elemLang.toLowerCase();
                    return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                  }
                } while ((elem = elem.parentNode) && elem.nodeType === 1);
                return false;
              };
            }),
            // Miscellaneous
            target: function(elem) {
              var hash = window2.location && window2.location.hash;
              return hash && hash.slice(1) === elem.id;
            },
            root: function(elem) {
              return elem === documentElement2;
            },
            focus: function(elem) {
              return elem === safeActiveElement() && document3.hasFocus() && !!(elem.type || elem.href || ~elem.tabIndex);
            },
            // Boolean properties
            enabled: createDisabledPseudo(false),
            disabled: createDisabledPseudo(true),
            checked: function(elem) {
              return nodeName(elem, "input") && !!elem.checked || nodeName(elem, "option") && !!elem.selected;
            },
            selected: function(elem) {
              if (elem.parentNode) {
                elem.parentNode.selectedIndex;
              }
              return elem.selected === true;
            },
            // Contents
            empty: function(elem) {
              for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                if (elem.nodeType < 6) {
                  return false;
                }
              }
              return true;
            },
            parent: function(elem) {
              return !Expr.pseudos.empty(elem);
            },
            // Element/input types
            header: function(elem) {
              return rheader.test(elem.nodeName);
            },
            input: function(elem) {
              return rinputs.test(elem.nodeName);
            },
            button: function(elem) {
              return nodeName(elem, "input") && elem.type === "button" || nodeName(elem, "button");
            },
            text: function(elem) {
              var attr;
              return nodeName(elem, "input") && elem.type === "text" && // Support: IE <10 only
              // New HTML5 attribute values (e.g., "search") appear
              // with elem.type === "text"
              ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
            },
            // Position-in-collection
            first: createPositionalPseudo(function() {
              return [0];
            }),
            last: createPositionalPseudo(function(_matchIndexes, length) {
              return [length - 1];
            }),
            eq: createPositionalPseudo(function(_matchIndexes, length, argument) {
              return [argument < 0 ? argument + length : argument];
            }),
            even: createPositionalPseudo(function(matchIndexes, length) {
              var i2 = 0;
              for (; i2 < length; i2 += 2) {
                matchIndexes.push(i2);
              }
              return matchIndexes;
            }),
            odd: createPositionalPseudo(function(matchIndexes, length) {
              var i2 = 1;
              for (; i2 < length; i2 += 2) {
                matchIndexes.push(i2);
              }
              return matchIndexes;
            }),
            lt: createPositionalPseudo(function(matchIndexes, length, argument) {
              var i2;
              if (argument < 0) {
                i2 = argument + length;
              } else if (argument > length) {
                i2 = length;
              } else {
                i2 = argument;
              }
              for (; --i2 >= 0; ) {
                matchIndexes.push(i2);
              }
              return matchIndexes;
            }),
            gt: createPositionalPseudo(function(matchIndexes, length, argument) {
              var i2 = argument < 0 ? argument + length : argument;
              for (; ++i2 < length; ) {
                matchIndexes.push(i2);
              }
              return matchIndexes;
            })
          }
        };
        Expr.pseudos.nth = Expr.pseudos.eq;
        for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
          Expr.pseudos[i] = createInputPseudo(i);
        }
        for (i in { submit: true, reset: true }) {
          Expr.pseudos[i] = createButtonPseudo(i);
        }
        function setFilters() {
        }
        setFilters.prototype = Expr.filters = Expr.pseudos;
        Expr.setFilters = new setFilters();
        function tokenize2(selector, parseOnly) {
          var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
          if (cached) {
            return parseOnly ? 0 : cached.slice(0);
          }
          soFar = selector;
          groups = [];
          preFilters = Expr.preFilter;
          while (soFar) {
            if (!matched || (match = rcomma.exec(soFar))) {
              if (match) {
                soFar = soFar.slice(match[0].length) || soFar;
              }
              groups.push(tokens = []);
            }
            matched = false;
            if (match = rleadingCombinator.exec(soFar)) {
              matched = match.shift();
              tokens.push({
                value: matched,
                // Cast descendant combinators to space
                type: match[0].replace(rtrimCSS, " ")
              });
              soFar = soFar.slice(matched.length);
            }
            for (type in Expr.filter) {
              if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                matched = match.shift();
                tokens.push({
                  value: matched,
                  type,
                  matches: match
                });
                soFar = soFar.slice(matched.length);
              }
            }
            if (!matched) {
              break;
            }
          }
          if (parseOnly) {
            return soFar.length;
          }
          return soFar ? find.error(selector) : (
            // Cache the tokens
            tokenCache(selector, groups).slice(0)
          );
        }
        function toSelector(tokens) {
          var i2 = 0, len = tokens.length, selector = "";
          for (; i2 < len; i2++) {
            selector += tokens[i2].value;
          }
          return selector;
        }
        function addCombinator(matcher, combinator, base) {
          var dir2 = combinator.dir, skip = combinator.next, key = skip || dir2, checkNonElements = base && key === "parentNode", doneName = done++;
          return combinator.first ? (
            // Check against closest ancestor/preceding element
            function(elem, context, xml) {
              while (elem = elem[dir2]) {
                if (elem.nodeType === 1 || checkNonElements) {
                  return matcher(elem, context, xml);
                }
              }
              return false;
            }
          ) : (
            // Check against all ancestor/preceding elements
            function(elem, context, xml) {
              var oldCache, outerCache, newCache = [dirruns, doneName];
              if (xml) {
                while (elem = elem[dir2]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    if (matcher(elem, context, xml)) {
                      return true;
                    }
                  }
                }
              } else {
                while (elem = elem[dir2]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    outerCache = elem[expando] || (elem[expando] = {});
                    if (skip && nodeName(elem, skip)) {
                      elem = elem[dir2] || elem;
                    } else if ((oldCache = outerCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                      return newCache[2] = oldCache[2];
                    } else {
                      outerCache[key] = newCache;
                      if (newCache[2] = matcher(elem, context, xml)) {
                        return true;
                      }
                    }
                  }
                }
              }
              return false;
            }
          );
        }
        function elementMatcher(matchers) {
          return matchers.length > 1 ? function(elem, context, xml) {
            var i2 = matchers.length;
            while (i2--) {
              if (!matchers[i2](elem, context, xml)) {
                return false;
              }
            }
            return true;
          } : matchers[0];
        }
        function multipleContexts(selector, contexts, results) {
          var i2 = 0, len = contexts.length;
          for (; i2 < len; i2++) {
            find(selector, contexts[i2], results);
          }
          return results;
        }
        function condense(unmatched, map, filter, context, xml) {
          var elem, newUnmatched = [], i2 = 0, len = unmatched.length, mapped = map != null;
          for (; i2 < len; i2++) {
            if (elem = unmatched[i2]) {
              if (!filter || filter(elem, context, xml)) {
                newUnmatched.push(elem);
                if (mapped) {
                  map.push(i2);
                }
              }
            }
          }
          return newUnmatched;
        }
        function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
          if (postFilter && !postFilter[expando]) {
            postFilter = setMatcher(postFilter);
          }
          if (postFinder && !postFinder[expando]) {
            postFinder = setMatcher(postFinder, postSelector);
          }
          return markFunction(function(seed, results, context, xml) {
            var temp, i2, elem, matcherOut, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(
              selector || "*",
              context.nodeType ? [context] : context,
              []
            ), matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems;
            if (matcher) {
              matcherOut = postFinder || (seed ? preFilter : preexisting || postFilter) ? (
                // ...intermediate processing is necessary
                []
              ) : (
                // ...otherwise use results directly
                results
              );
              matcher(matcherIn, matcherOut, context, xml);
            } else {
              matcherOut = matcherIn;
            }
            if (postFilter) {
              temp = condense(matcherOut, postMap);
              postFilter(temp, [], context, xml);
              i2 = temp.length;
              while (i2--) {
                if (elem = temp[i2]) {
                  matcherOut[postMap[i2]] = !(matcherIn[postMap[i2]] = elem);
                }
              }
            }
            if (seed) {
              if (postFinder || preFilter) {
                if (postFinder) {
                  temp = [];
                  i2 = matcherOut.length;
                  while (i2--) {
                    if (elem = matcherOut[i2]) {
                      temp.push(matcherIn[i2] = elem);
                    }
                  }
                  postFinder(null, matcherOut = [], temp, xml);
                }
                i2 = matcherOut.length;
                while (i2--) {
                  if ((elem = matcherOut[i2]) && (temp = postFinder ? indexOf2.call(seed, elem) : preMap[i2]) > -1) {
                    seed[temp] = !(results[temp] = elem);
                  }
                }
              }
            } else {
              matcherOut = condense(
                matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut
              );
              if (postFinder) {
                postFinder(null, results, matcherOut, xml);
              } else {
                push2.apply(results, matcherOut);
              }
            }
          });
        }
        function matcherFromTokens(tokens) {
          var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i2 = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
            return elem === checkContext;
          }, implicitRelative, true), matchAnyContext = addCombinator(function(elem) {
            return indexOf2.call(checkContext, elem) > -1;
          }, implicitRelative, true), matchers = [function(elem, context, xml) {
            var ret = !leadingRelative && (xml || context != outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
            checkContext = null;
            return ret;
          }];
          for (; i2 < len; i2++) {
            if (matcher = Expr.relative[tokens[i2].type]) {
              matchers = [addCombinator(elementMatcher(matchers), matcher)];
            } else {
              matcher = Expr.filter[tokens[i2].type].apply(null, tokens[i2].matches);
              if (matcher[expando]) {
                j = ++i2;
                for (; j < len; j++) {
                  if (Expr.relative[tokens[j].type]) {
                    break;
                  }
                }
                return setMatcher(
                  i2 > 1 && elementMatcher(matchers),
                  i2 > 1 && toSelector(
                    // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                    tokens.slice(0, i2 - 1).concat({ value: tokens[i2 - 2].type === " " ? "*" : "" })
                  ).replace(rtrimCSS, "$1"),
                  matcher,
                  i2 < j && matcherFromTokens(tokens.slice(i2, j)),
                  j < len && matcherFromTokens(tokens = tokens.slice(j)),
                  j < len && toSelector(tokens)
                );
              }
              matchers.push(matcher);
            }
          }
          return elementMatcher(matchers);
        }
        function matcherFromGroupMatchers(elementMatchers, setMatchers) {
          var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, outermost) {
            var elem, j, matcher, matchedCount = 0, i2 = "0", unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find.TAG("*", outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
            if (outermost) {
              outermostContext = context == document3 || context || outermost;
            }
            for (; i2 !== len && (elem = elems[i2]) != null; i2++) {
              if (byElement && elem) {
                j = 0;
                if (!context && elem.ownerDocument != document3) {
                  setDocument(elem);
                  xml = !documentIsHTML;
                }
                while (matcher = elementMatchers[j++]) {
                  if (matcher(elem, context || document3, xml)) {
                    push2.call(results, elem);
                    break;
                  }
                }
                if (outermost) {
                  dirruns = dirrunsUnique;
                }
              }
              if (bySet) {
                if (elem = !matcher && elem) {
                  matchedCount--;
                }
                if (seed) {
                  unmatched.push(elem);
                }
              }
            }
            matchedCount += i2;
            if (bySet && i2 !== matchedCount) {
              j = 0;
              while (matcher = setMatchers[j++]) {
                matcher(unmatched, setMatched, context, xml);
              }
              if (seed) {
                if (matchedCount > 0) {
                  while (i2--) {
                    if (!(unmatched[i2] || setMatched[i2])) {
                      setMatched[i2] = pop.call(results);
                    }
                  }
                }
                setMatched = condense(setMatched);
              }
              push2.apply(results, setMatched);
              if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
                jQuery2.uniqueSort(results);
              }
            }
            if (outermost) {
              dirruns = dirrunsUnique;
              outermostContext = contextBackup;
            }
            return unmatched;
          };
          return bySet ? markFunction(superMatcher) : superMatcher;
        }
        function compile(selector, match) {
          var i2, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
          if (!cached) {
            if (!match) {
              match = tokenize2(selector);
            }
            i2 = match.length;
            while (i2--) {
              cached = matcherFromTokens(match[i2]);
              if (cached[expando]) {
                setMatchers.push(cached);
              } else {
                elementMatchers.push(cached);
              }
            }
            cached = compilerCache(
              selector,
              matcherFromGroupMatchers(elementMatchers, setMatchers)
            );
            cached.selector = selector;
          }
          return cached;
        }
        function select(selector, context, results, seed) {
          var i2, tokens, token, type, find2, compiled = typeof selector === "function" && selector, match = !seed && tokenize2(selector = compiled.selector || selector);
          results = results || [];
          if (match.length === 1) {
            tokens = match[0] = match[0].slice(0);
            if (tokens.length > 2 && (token = tokens[0]).type === "ID" && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
              context = (Expr.find.ID(
                token.matches[0].replace(runescape, funescape),
                context
              ) || [])[0];
              if (!context) {
                return results;
              } else if (compiled) {
                context = context.parentNode;
              }
              selector = selector.slice(tokens.shift().value.length);
            }
            i2 = matchExpr.needsContext.test(selector) ? 0 : tokens.length;
            while (i2--) {
              token = tokens[i2];
              if (Expr.relative[type = token.type]) {
                break;
              }
              if (find2 = Expr.find[type]) {
                if (seed = find2(
                  token.matches[0].replace(runescape, funescape),
                  rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
                )) {
                  tokens.splice(i2, 1);
                  selector = seed.length && toSelector(tokens);
                  if (!selector) {
                    push2.apply(results, seed);
                    return results;
                  }
                  break;
                }
              }
            }
          }
          (compiled || compile(selector, match))(
            seed,
            context,
            !documentIsHTML,
            results,
            !context || rsibling.test(selector) && testContext(context.parentNode) || context
          );
          return results;
        }
        support.sortStable = expando.split("").sort(sortOrder).join("") === expando;
        setDocument();
        support.sortDetached = assert(function(el) {
          return el.compareDocumentPosition(document3.createElement("fieldset")) & 1;
        });
        jQuery2.find = find;
        jQuery2.expr[":"] = jQuery2.expr.pseudos;
        jQuery2.unique = jQuery2.uniqueSort;
        find.compile = compile;
        find.select = select;
        find.setDocument = setDocument;
        find.tokenize = tokenize2;
        find.escape = jQuery2.escapeSelector;
        find.getText = jQuery2.text;
        find.isXML = jQuery2.isXMLDoc;
        find.selectors = jQuery2.expr;
        find.support = jQuery2.support;
        find.uniqueSort = jQuery2.uniqueSort;
      })();
      var dir = function(elem, dir2, until) {
        var matched = [], truncate = until !== void 0;
        while ((elem = elem[dir2]) && elem.nodeType !== 9) {
          if (elem.nodeType === 1) {
            if (truncate && jQuery2(elem).is(until)) {
              break;
            }
            matched.push(elem);
          }
        }
        return matched;
      };
      var siblings = function(n, elem) {
        var matched = [];
        for (; n; n = n.nextSibling) {
          if (n.nodeType === 1 && n !== elem) {
            matched.push(n);
          }
        }
        return matched;
      };
      var rneedsContext = jQuery2.expr.match.needsContext;
      var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
      function winnow(elements, qualifier, not) {
        if (isFunction(qualifier)) {
          return jQuery2.grep(elements, function(elem, i) {
            return !!qualifier.call(elem, i, elem) !== not;
          });
        }
        if (qualifier.nodeType) {
          return jQuery2.grep(elements, function(elem) {
            return elem === qualifier !== not;
          });
        }
        if (typeof qualifier !== "string") {
          return jQuery2.grep(elements, function(elem) {
            return indexOf2.call(qualifier, elem) > -1 !== not;
          });
        }
        return jQuery2.filter(qualifier, elements, not);
      }
      jQuery2.filter = function(expr, elems, not) {
        var elem = elems[0];
        if (not) {
          expr = ":not(" + expr + ")";
        }
        if (elems.length === 1 && elem.nodeType === 1) {
          return jQuery2.find.matchesSelector(elem, expr) ? [elem] : [];
        }
        return jQuery2.find.matches(expr, jQuery2.grep(elems, function(elem2) {
          return elem2.nodeType === 1;
        }));
      };
      jQuery2.fn.extend({
        find: function(selector) {
          var i, ret, len = this.length, self2 = this;
          if (typeof selector !== "string") {
            return this.pushStack(jQuery2(selector).filter(function() {
              for (i = 0; i < len; i++) {
                if (jQuery2.contains(self2[i], this)) {
                  return true;
                }
              }
            }));
          }
          ret = this.pushStack([]);
          for (i = 0; i < len; i++) {
            jQuery2.find(selector, self2[i], ret);
          }
          return len > 1 ? jQuery2.uniqueSort(ret) : ret;
        },
        filter: function(selector) {
          return this.pushStack(winnow(this, selector || [], false));
        },
        not: function(selector) {
          return this.pushStack(winnow(this, selector || [], true));
        },
        is: function(selector) {
          return !!winnow(
            this,
            // If this is a positional/relative selector, check membership in the returned set
            // so $("p:first").is("p:last") won't return true for a doc with two "p".
            typeof selector === "string" && rneedsContext.test(selector) ? jQuery2(selector) : selector || [],
            false
          ).length;
        }
      });
      var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/, init = jQuery2.fn.init = function(selector, context, root) {
        var match, elem;
        if (!selector) {
          return this;
        }
        root = root || rootjQuery;
        if (typeof selector === "string") {
          if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
            match = [null, selector, null];
          } else {
            match = rquickExpr.exec(selector);
          }
          if (match && (match[1] || !context)) {
            if (match[1]) {
              context = context instanceof jQuery2 ? context[0] : context;
              jQuery2.merge(this, jQuery2.parseHTML(
                match[1],
                context && context.nodeType ? context.ownerDocument || context : document2,
                true
              ));
              if (rsingleTag.test(match[1]) && jQuery2.isPlainObject(context)) {
                for (match in context) {
                  if (isFunction(this[match])) {
                    this[match](context[match]);
                  } else {
                    this.attr(match, context[match]);
                  }
                }
              }
              return this;
            } else {
              elem = document2.getElementById(match[2]);
              if (elem) {
                this[0] = elem;
                this.length = 1;
              }
              return this;
            }
          } else if (!context || context.jquery) {
            return (context || root).find(selector);
          } else {
            return this.constructor(context).find(selector);
          }
        } else if (selector.nodeType) {
          this[0] = selector;
          this.length = 1;
          return this;
        } else if (isFunction(selector)) {
          return root.ready !== void 0 ? root.ready(selector) : (
            // Execute immediately if ready is not present
            selector(jQuery2)
          );
        }
        return jQuery2.makeArray(selector, this);
      };
      init.prototype = jQuery2.fn;
      rootjQuery = jQuery2(document2);
      var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
      };
      jQuery2.fn.extend({
        has: function(target) {
          var targets = jQuery2(target, this), l = targets.length;
          return this.filter(function() {
            var i = 0;
            for (; i < l; i++) {
              if (jQuery2.contains(this, targets[i])) {
                return true;
              }
            }
          });
        },
        closest: function(selectors, context) {
          var cur, i = 0, l = this.length, matched = [], targets = typeof selectors !== "string" && jQuery2(selectors);
          if (!rneedsContext.test(selectors)) {
            for (; i < l; i++) {
              for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                if (cur.nodeType < 11 && (targets ? targets.index(cur) > -1 : (
                  // Don't pass non-elements to jQuery#find
                  cur.nodeType === 1 && jQuery2.find.matchesSelector(cur, selectors)
                ))) {
                  matched.push(cur);
                  break;
                }
              }
            }
          }
          return this.pushStack(matched.length > 1 ? jQuery2.uniqueSort(matched) : matched);
        },
        // Determine the position of an element within the set
        index: function(elem) {
          if (!elem) {
            return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
          }
          if (typeof elem === "string") {
            return indexOf2.call(jQuery2(elem), this[0]);
          }
          return indexOf2.call(
            this,
            // If it receives a jQuery object, the first element is used
            elem.jquery ? elem[0] : elem
          );
        },
        add: function(selector, context) {
          return this.pushStack(
            jQuery2.uniqueSort(
              jQuery2.merge(this.get(), jQuery2(selector, context))
            )
          );
        },
        addBack: function(selector) {
          return this.add(
            selector == null ? this.prevObject : this.prevObject.filter(selector)
          );
        }
      });
      function sibling(cur, dir2) {
        while ((cur = cur[dir2]) && cur.nodeType !== 1) {
        }
        return cur;
      }
      jQuery2.each({
        parent: function(elem) {
          var parent = elem.parentNode;
          return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function(elem) {
          return dir(elem, "parentNode");
        },
        parentsUntil: function(elem, _i, until) {
          return dir(elem, "parentNode", until);
        },
        next: function(elem) {
          return sibling(elem, "nextSibling");
        },
        prev: function(elem) {
          return sibling(elem, "previousSibling");
        },
        nextAll: function(elem) {
          return dir(elem, "nextSibling");
        },
        prevAll: function(elem) {
          return dir(elem, "previousSibling");
        },
        nextUntil: function(elem, _i, until) {
          return dir(elem, "nextSibling", until);
        },
        prevUntil: function(elem, _i, until) {
          return dir(elem, "previousSibling", until);
        },
        siblings: function(elem) {
          return siblings((elem.parentNode || {}).firstChild, elem);
        },
        children: function(elem) {
          return siblings(elem.firstChild);
        },
        contents: function(elem) {
          if (elem.contentDocument != null && // Support: IE 11+
          // <object> elements with no `data` attribute has an object
          // `contentDocument` with a `null` prototype.
          getProto(elem.contentDocument)) {
            return elem.contentDocument;
          }
          if (nodeName(elem, "template")) {
            elem = elem.content || elem;
          }
          return jQuery2.merge([], elem.childNodes);
        }
      }, function(name, fn) {
        jQuery2.fn[name] = function(until, selector) {
          var matched = jQuery2.map(this, fn, until);
          if (name.slice(-5) !== "Until") {
            selector = until;
          }
          if (selector && typeof selector === "string") {
            matched = jQuery2.filter(selector, matched);
          }
          if (this.length > 1) {
            if (!guaranteedUnique[name]) {
              jQuery2.uniqueSort(matched);
            }
            if (rparentsprev.test(name)) {
              matched.reverse();
            }
          }
          return this.pushStack(matched);
        };
      });
      var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;
      function createOptions(options) {
        var object = {};
        jQuery2.each(options.match(rnothtmlwhite) || [], function(_, flag) {
          object[flag] = true;
        });
        return object;
      }
      jQuery2.Callbacks = function(options) {
        options = typeof options === "string" ? createOptions(options) : jQuery2.extend({}, options);
        var firing, memory, fired, locked, list = [], queue = [], firingIndex = -1, fire2 = function() {
          locked = locked || options.once;
          fired = firing = true;
          for (; queue.length; firingIndex = -1) {
            memory = queue.shift();
            while (++firingIndex < list.length) {
              if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {
                firingIndex = list.length;
                memory = false;
              }
            }
          }
          if (!options.memory) {
            memory = false;
          }
          firing = false;
          if (locked) {
            if (memory) {
              list = [];
            } else {
              list = "";
            }
          }
        }, self2 = {
          // Add a callback or a collection of callbacks to the list
          add: function() {
            if (list) {
              if (memory && !firing) {
                firingIndex = list.length - 1;
                queue.push(memory);
              }
              (function add2(args) {
                jQuery2.each(args, function(_, arg) {
                  if (isFunction(arg)) {
                    if (!options.unique || !self2.has(arg)) {
                      list.push(arg);
                    }
                  } else if (arg && arg.length && toType(arg) !== "string") {
                    add2(arg);
                  }
                });
              })(arguments);
              if (memory && !firing) {
                fire2();
              }
            }
            return this;
          },
          // Remove a callback from the list
          remove: function() {
            jQuery2.each(arguments, function(_, arg) {
              var index;
              while ((index = jQuery2.inArray(arg, list, index)) > -1) {
                list.splice(index, 1);
                if (index <= firingIndex) {
                  firingIndex--;
                }
              }
            });
            return this;
          },
          // Check if a given callback is in the list.
          // If no argument is given, return whether or not list has callbacks attached.
          has: function(fn) {
            return fn ? jQuery2.inArray(fn, list) > -1 : list.length > 0;
          },
          // Remove all callbacks from the list
          empty: function() {
            if (list) {
              list = [];
            }
            return this;
          },
          // Disable .fire and .add
          // Abort any current/pending executions
          // Clear all callbacks and values
          disable: function() {
            locked = queue = [];
            list = memory = "";
            return this;
          },
          disabled: function() {
            return !list;
          },
          // Disable .fire
          // Also disable .add unless we have memory (since it would have no effect)
          // Abort any pending executions
          lock: function() {
            locked = queue = [];
            if (!memory && !firing) {
              list = memory = "";
            }
            return this;
          },
          locked: function() {
            return !!locked;
          },
          // Call all callbacks with the given context and arguments
          fireWith: function(context, args) {
            if (!locked) {
              args = args || [];
              args = [context, args.slice ? args.slice() : args];
              queue.push(args);
              if (!firing) {
                fire2();
              }
            }
            return this;
          },
          // Call all the callbacks with the given arguments
          fire: function() {
            self2.fireWith(this, arguments);
            return this;
          },
          // To know if the callbacks have already been called at least once
          fired: function() {
            return !!fired;
          }
        };
        return self2;
      };
      function Identity(v) {
        return v;
      }
      function Thrower(ex) {
        throw ex;
      }
      function adoptValue(value, resolve, reject, noValue) {
        var method;
        try {
          if (value && isFunction(method = value.promise)) {
            method.call(value).done(resolve).fail(reject);
          } else if (value && isFunction(method = value.then)) {
            method.call(value, resolve, reject);
          } else {
            resolve.apply(void 0, [value].slice(noValue));
          }
        } catch (value2) {
          reject.apply(void 0, [value2]);
        }
      }
      jQuery2.extend({
        Deferred: function(func) {
          var tuples = [
            // action, add listener, callbacks,
            // ... .then handlers, argument index, [final state]
            [
              "notify",
              "progress",
              jQuery2.Callbacks("memory"),
              jQuery2.Callbacks("memory"),
              2
            ],
            [
              "resolve",
              "done",
              jQuery2.Callbacks("once memory"),
              jQuery2.Callbacks("once memory"),
              0,
              "resolved"
            ],
            [
              "reject",
              "fail",
              jQuery2.Callbacks("once memory"),
              jQuery2.Callbacks("once memory"),
              1,
              "rejected"
            ]
          ], state = "pending", promise = {
            state: function() {
              return state;
            },
            always: function() {
              deferred.done(arguments).fail(arguments);
              return this;
            },
            "catch": function(fn) {
              return promise.then(null, fn);
            },
            // Keep pipe for back-compat
            pipe: function() {
              var fns = arguments;
              return jQuery2.Deferred(function(newDefer) {
                jQuery2.each(tuples, function(_i, tuple) {
                  var fn = isFunction(fns[tuple[4]]) && fns[tuple[4]];
                  deferred[tuple[1]](function() {
                    var returned = fn && fn.apply(this, arguments);
                    if (returned && isFunction(returned.promise)) {
                      returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);
                    } else {
                      newDefer[tuple[0] + "With"](
                        this,
                        fn ? [returned] : arguments
                      );
                    }
                  });
                });
                fns = null;
              }).promise();
            },
            then: function(onFulfilled, onRejected, onProgress) {
              var maxDepth = 0;
              function resolve(depth, deferred2, handler, special) {
                return function() {
                  var that = this, args = arguments, mightThrow = function() {
                    var returned, then;
                    if (depth < maxDepth) {
                      return;
                    }
                    returned = handler.apply(that, args);
                    if (returned === deferred2.promise()) {
                      throw new TypeError("Thenable self-resolution");
                    }
                    then = returned && // Support: Promises/A+ section 2.3.4
                    // https://promisesaplus.com/#point-64
                    // Only check objects and functions for thenability
                    (typeof returned === "object" || typeof returned === "function") && returned.then;
                    if (isFunction(then)) {
                      if (special) {
                        then.call(
                          returned,
                          resolve(maxDepth, deferred2, Identity, special),
                          resolve(maxDepth, deferred2, Thrower, special)
                        );
                      } else {
                        maxDepth++;
                        then.call(
                          returned,
                          resolve(maxDepth, deferred2, Identity, special),
                          resolve(maxDepth, deferred2, Thrower, special),
                          resolve(
                            maxDepth,
                            deferred2,
                            Identity,
                            deferred2.notifyWith
                          )
                        );
                      }
                    } else {
                      if (handler !== Identity) {
                        that = void 0;
                        args = [returned];
                      }
                      (special || deferred2.resolveWith)(that, args);
                    }
                  }, process = special ? mightThrow : function() {
                    try {
                      mightThrow();
                    } catch (e) {
                      if (jQuery2.Deferred.exceptionHook) {
                        jQuery2.Deferred.exceptionHook(
                          e,
                          process.error
                        );
                      }
                      if (depth + 1 >= maxDepth) {
                        if (handler !== Thrower) {
                          that = void 0;
                          args = [e];
                        }
                        deferred2.rejectWith(that, args);
                      }
                    }
                  };
                  if (depth) {
                    process();
                  } else {
                    if (jQuery2.Deferred.getErrorHook) {
                      process.error = jQuery2.Deferred.getErrorHook();
                    } else if (jQuery2.Deferred.getStackHook) {
                      process.error = jQuery2.Deferred.getStackHook();
                    }
                    window2.setTimeout(process);
                  }
                };
              }
              return jQuery2.Deferred(function(newDefer) {
                tuples[0][3].add(
                  resolve(
                    0,
                    newDefer,
                    isFunction(onProgress) ? onProgress : Identity,
                    newDefer.notifyWith
                  )
                );
                tuples[1][3].add(
                  resolve(
                    0,
                    newDefer,
                    isFunction(onFulfilled) ? onFulfilled : Identity
                  )
                );
                tuples[2][3].add(
                  resolve(
                    0,
                    newDefer,
                    isFunction(onRejected) ? onRejected : Thrower
                  )
                );
              }).promise();
            },
            // Get a promise for this deferred
            // If obj is provided, the promise aspect is added to the object
            promise: function(obj) {
              return obj != null ? jQuery2.extend(obj, promise) : promise;
            }
          }, deferred = {};
          jQuery2.each(tuples, function(i, tuple) {
            var list = tuple[2], stateString = tuple[5];
            promise[tuple[1]] = list.add;
            if (stateString) {
              list.add(
                function() {
                  state = stateString;
                },
                // rejected_callbacks.disable
                // fulfilled_callbacks.disable
                tuples[3 - i][2].disable,
                // rejected_handlers.disable
                // fulfilled_handlers.disable
                tuples[3 - i][3].disable,
                // progress_callbacks.lock
                tuples[0][2].lock,
                // progress_handlers.lock
                tuples[0][3].lock
              );
            }
            list.add(tuple[3].fire);
            deferred[tuple[0]] = function() {
              deferred[tuple[0] + "With"](this === deferred ? void 0 : this, arguments);
              return this;
            };
            deferred[tuple[0] + "With"] = list.fireWith;
          });
          promise.promise(deferred);
          if (func) {
            func.call(deferred, deferred);
          }
          return deferred;
        },
        // Deferred helper
        when: function(singleValue) {
          var remaining = arguments.length, i = remaining, resolveContexts = Array(i), resolveValues = slice.call(arguments), primary = jQuery2.Deferred(), updateFunc = function(i2) {
            return function(value) {
              resolveContexts[i2] = this;
              resolveValues[i2] = arguments.length > 1 ? slice.call(arguments) : value;
              if (!--remaining) {
                primary.resolveWith(resolveContexts, resolveValues);
              }
            };
          };
          if (remaining <= 1) {
            adoptValue(
              singleValue,
              primary.done(updateFunc(i)).resolve,
              primary.reject,
              !remaining
            );
            if (primary.state() === "pending" || isFunction(resolveValues[i] && resolveValues[i].then)) {
              return primary.then();
            }
          }
          while (i--) {
            adoptValue(resolveValues[i], updateFunc(i), primary.reject);
          }
          return primary.promise();
        }
      });
      var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
      jQuery2.Deferred.exceptionHook = function(error2, asyncError) {
        if (window2.console && window2.console.warn && error2 && rerrorNames.test(error2.name)) {
          window2.console.warn(
            "jQuery.Deferred exception: " + error2.message,
            error2.stack,
            asyncError
          );
        }
      };
      jQuery2.readyException = function(error2) {
        window2.setTimeout(function() {
          throw error2;
        });
      };
      var readyList = jQuery2.Deferred();
      jQuery2.fn.ready = function(fn) {
        readyList.then(fn).catch(function(error2) {
          jQuery2.readyException(error2);
        });
        return this;
      };
      jQuery2.extend({
        // Is the DOM ready to be used? Set to true once it occurs.
        isReady: false,
        // A counter to track how many items to wait for before
        // the ready event fires. See trac-6781
        readyWait: 1,
        // Handle when the DOM is ready
        ready: function(wait) {
          if (wait === true ? --jQuery2.readyWait : jQuery2.isReady) {
            return;
          }
          jQuery2.isReady = true;
          if (wait !== true && --jQuery2.readyWait > 0) {
            return;
          }
          readyList.resolveWith(document2, [jQuery2]);
        }
      });
      jQuery2.ready.then = readyList.then;
      function completed() {
        document2.removeEventListener("DOMContentLoaded", completed);
        window2.removeEventListener("load", completed);
        jQuery2.ready();
      }
      if (document2.readyState === "complete" || document2.readyState !== "loading" && !document2.documentElement.doScroll) {
        window2.setTimeout(jQuery2.ready);
      } else {
        document2.addEventListener("DOMContentLoaded", completed);
        window2.addEventListener("load", completed);
      }
      var access = function(elems, fn, key, value, chainable, emptyGet, raw) {
        var i = 0, len = elems.length, bulk = key == null;
        if (toType(key) === "object") {
          chainable = true;
          for (i in key) {
            access(elems, fn, i, key[i], true, emptyGet, raw);
          }
        } else if (value !== void 0) {
          chainable = true;
          if (!isFunction(value)) {
            raw = true;
          }
          if (bulk) {
            if (raw) {
              fn.call(elems, value);
              fn = null;
            } else {
              bulk = fn;
              fn = function(elem, _key, value2) {
                return bulk.call(jQuery2(elem), value2);
              };
            }
          }
          if (fn) {
            for (; i < len; i++) {
              fn(
                elems[i],
                key,
                raw ? value : value.call(elems[i], i, fn(elems[i], key))
              );
            }
          }
        }
        if (chainable) {
          return elems;
        }
        if (bulk) {
          return fn.call(elems);
        }
        return len ? fn(elems[0], key) : emptyGet;
      };
      var rmsPrefix = /^-ms-/, rdashAlpha = /-([a-z])/g;
      function fcamelCase(_all, letter) {
        return letter.toUpperCase();
      }
      function camelCase(string) {
        return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
      }
      var acceptData = function(owner) {
        return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
      };
      function Data() {
        this.expando = jQuery2.expando + Data.uid++;
      }
      Data.uid = 1;
      Data.prototype = {
        cache: function(owner) {
          var value = owner[this.expando];
          if (!value) {
            value = {};
            if (acceptData(owner)) {
              if (owner.nodeType) {
                owner[this.expando] = value;
              } else {
                Object.defineProperty(owner, this.expando, {
                  value,
                  configurable: true
                });
              }
            }
          }
          return value;
        },
        set: function(owner, data, value) {
          var prop, cache2 = this.cache(owner);
          if (typeof data === "string") {
            cache2[camelCase(data)] = value;
          } else {
            for (prop in data) {
              cache2[camelCase(prop)] = data[prop];
            }
          }
          return cache2;
        },
        get: function(owner, key) {
          return key === void 0 ? this.cache(owner) : (
            // Always use camelCase key (gh-2257)
            owner[this.expando] && owner[this.expando][camelCase(key)]
          );
        },
        access: function(owner, key, value) {
          if (key === void 0 || key && typeof key === "string" && value === void 0) {
            return this.get(owner, key);
          }
          this.set(owner, key, value);
          return value !== void 0 ? value : key;
        },
        remove: function(owner, key) {
          var i, cache2 = owner[this.expando];
          if (cache2 === void 0) {
            return;
          }
          if (key !== void 0) {
            if (Array.isArray(key)) {
              key = key.map(camelCase);
            } else {
              key = camelCase(key);
              key = key in cache2 ? [key] : key.match(rnothtmlwhite) || [];
            }
            i = key.length;
            while (i--) {
              delete cache2[key[i]];
            }
          }
          if (key === void 0 || jQuery2.isEmptyObject(cache2)) {
            if (owner.nodeType) {
              owner[this.expando] = void 0;
            } else {
              delete owner[this.expando];
            }
          }
        },
        hasData: function(owner) {
          var cache2 = owner[this.expando];
          return cache2 !== void 0 && !jQuery2.isEmptyObject(cache2);
        }
      };
      var dataPriv = new Data();
      var dataUser = new Data();
      var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /[A-Z]/g;
      function getData2(data) {
        if (data === "true") {
          return true;
        }
        if (data === "false") {
          return false;
        }
        if (data === "null") {
          return null;
        }
        if (data === +data + "") {
          return +data;
        }
        if (rbrace.test(data)) {
          return JSON.parse(data);
        }
        return data;
      }
      function dataAttr(elem, key, data) {
        var name;
        if (data === void 0 && elem.nodeType === 1) {
          name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
          data = elem.getAttribute(name);
          if (typeof data === "string") {
            try {
              data = getData2(data);
            } catch (e) {
            }
            dataUser.set(elem, key, data);
          } else {
            data = void 0;
          }
        }
        return data;
      }
      jQuery2.extend({
        hasData: function(elem) {
          return dataUser.hasData(elem) || dataPriv.hasData(elem);
        },
        data: function(elem, name, data) {
          return dataUser.access(elem, name, data);
        },
        removeData: function(elem, name) {
          dataUser.remove(elem, name);
        },
        // TODO: Now that all calls to _data and _removeData have been replaced
        // with direct calls to dataPriv methods, these can be deprecated.
        _data: function(elem, name, data) {
          return dataPriv.access(elem, name, data);
        },
        _removeData: function(elem, name) {
          dataPriv.remove(elem, name);
        }
      });
      jQuery2.fn.extend({
        data: function(key, value) {
          var i, name, data, elem = this[0], attrs = elem && elem.attributes;
          if (key === void 0) {
            if (this.length) {
              data = dataUser.get(elem);
              if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
                i = attrs.length;
                while (i--) {
                  if (attrs[i]) {
                    name = attrs[i].name;
                    if (name.indexOf("data-") === 0) {
                      name = camelCase(name.slice(5));
                      dataAttr(elem, name, data[name]);
                    }
                  }
                }
                dataPriv.set(elem, "hasDataAttrs", true);
              }
            }
            return data;
          }
          if (typeof key === "object") {
            return this.each(function() {
              dataUser.set(this, key);
            });
          }
          return access(this, function(value2) {
            var data2;
            if (elem && value2 === void 0) {
              data2 = dataUser.get(elem, key);
              if (data2 !== void 0) {
                return data2;
              }
              data2 = dataAttr(elem, key);
              if (data2 !== void 0) {
                return data2;
              }
              return;
            }
            this.each(function() {
              dataUser.set(this, key, value2);
            });
          }, null, value, arguments.length > 1, null, true);
        },
        removeData: function(key) {
          return this.each(function() {
            dataUser.remove(this, key);
          });
        }
      });
      jQuery2.extend({
        queue: function(elem, type, data) {
          var queue;
          if (elem) {
            type = (type || "fx") + "queue";
            queue = dataPriv.get(elem, type);
            if (data) {
              if (!queue || Array.isArray(data)) {
                queue = dataPriv.access(elem, type, jQuery2.makeArray(data));
              } else {
                queue.push(data);
              }
            }
            return queue || [];
          }
        },
        dequeue: function(elem, type) {
          type = type || "fx";
          var queue = jQuery2.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery2._queueHooks(elem, type), next = function() {
            jQuery2.dequeue(elem, type);
          };
          if (fn === "inprogress") {
            fn = queue.shift();
            startLength--;
          }
          if (fn) {
            if (type === "fx") {
              queue.unshift("inprogress");
            }
            delete hooks.stop;
            fn.call(elem, next, hooks);
          }
          if (!startLength && hooks) {
            hooks.empty.fire();
          }
        },
        // Not public - generate a queueHooks object, or return the current one
        _queueHooks: function(elem, type) {
          var key = type + "queueHooks";
          return dataPriv.get(elem, key) || dataPriv.access(elem, key, {
            empty: jQuery2.Callbacks("once memory").add(function() {
              dataPriv.remove(elem, [type + "queue", key]);
            })
          });
        }
      });
      jQuery2.fn.extend({
        queue: function(type, data) {
          var setter = 2;
          if (typeof type !== "string") {
            data = type;
            type = "fx";
            setter--;
          }
          if (arguments.length < setter) {
            return jQuery2.queue(this[0], type);
          }
          return data === void 0 ? this : this.each(function() {
            var queue = jQuery2.queue(this, type, data);
            jQuery2._queueHooks(this, type);
            if (type === "fx" && queue[0] !== "inprogress") {
              jQuery2.dequeue(this, type);
            }
          });
        },
        dequeue: function(type) {
          return this.each(function() {
            jQuery2.dequeue(this, type);
          });
        },
        clearQueue: function(type) {
          return this.queue(type || "fx", []);
        },
        // Get a promise resolved when queues of a certain type
        // are emptied (fx is the type by default)
        promise: function(type, obj) {
          var tmp, count = 1, defer = jQuery2.Deferred(), elements = this, i = this.length, resolve = function() {
            if (!--count) {
              defer.resolveWith(elements, [elements]);
            }
          };
          if (typeof type !== "string") {
            obj = type;
            type = void 0;
          }
          type = type || "fx";
          while (i--) {
            tmp = dataPriv.get(elements[i], type + "queueHooks");
            if (tmp && tmp.empty) {
              count++;
              tmp.empty.add(resolve);
            }
          }
          resolve();
          return defer.promise(obj);
        }
      });
      var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
      var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");
      var cssExpand = ["Top", "Right", "Bottom", "Left"];
      var documentElement = document2.documentElement;
      var isAttached = function(elem) {
        return jQuery2.contains(elem.ownerDocument, elem);
      }, composed = { composed: true };
      if (documentElement.getRootNode) {
        isAttached = function(elem) {
          return jQuery2.contains(elem.ownerDocument, elem) || elem.getRootNode(composed) === elem.ownerDocument;
        };
      }
      var isHiddenWithinTree = function(elem, el) {
        elem = el || elem;
        return elem.style.display === "none" || elem.style.display === "" && // Otherwise, check computed style
        // Support: Firefox <=43 - 45
        // Disconnected elements can have computed display: none, so first confirm that elem is
        // in the document.
        isAttached(elem) && jQuery2.css(elem, "display") === "none";
      };
      function adjustCSS(elem, prop, valueParts, tween) {
        var adjusted, scale, maxIterations = 20, currentValue = tween ? function() {
          return tween.cur();
        } : function() {
          return jQuery2.css(elem, prop, "");
        }, initial = currentValue(), unit = valueParts && valueParts[3] || (jQuery2.cssNumber[prop] ? "" : "px"), initialInUnit = elem.nodeType && (jQuery2.cssNumber[prop] || unit !== "px" && +initial) && rcssNum.exec(jQuery2.css(elem, prop));
        if (initialInUnit && initialInUnit[3] !== unit) {
          initial = initial / 2;
          unit = unit || initialInUnit[3];
          initialInUnit = +initial || 1;
          while (maxIterations--) {
            jQuery2.style(elem, prop, initialInUnit + unit);
            if ((1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <= 0) {
              maxIterations = 0;
            }
            initialInUnit = initialInUnit / scale;
          }
          initialInUnit = initialInUnit * 2;
          jQuery2.style(elem, prop, initialInUnit + unit);
          valueParts = valueParts || [];
        }
        if (valueParts) {
          initialInUnit = +initialInUnit || +initial || 0;
          adjusted = valueParts[1] ? initialInUnit + (valueParts[1] + 1) * valueParts[2] : +valueParts[2];
          if (tween) {
            tween.unit = unit;
            tween.start = initialInUnit;
            tween.end = adjusted;
          }
        }
        return adjusted;
      }
      var defaultDisplayMap = {};
      function getDefaultDisplay(elem) {
        var temp, doc = elem.ownerDocument, nodeName2 = elem.nodeName, display = defaultDisplayMap[nodeName2];
        if (display) {
          return display;
        }
        temp = doc.body.appendChild(doc.createElement(nodeName2));
        display = jQuery2.css(temp, "display");
        temp.parentNode.removeChild(temp);
        if (display === "none") {
          display = "block";
        }
        defaultDisplayMap[nodeName2] = display;
        return display;
      }
      function showHide(elements, show) {
        var display, elem, values = [], index = 0, length = elements.length;
        for (; index < length; index++) {
          elem = elements[index];
          if (!elem.style) {
            continue;
          }
          display = elem.style.display;
          if (show) {
            if (display === "none") {
              values[index] = dataPriv.get(elem, "display") || null;
              if (!values[index]) {
                elem.style.display = "";
              }
            }
            if (elem.style.display === "" && isHiddenWithinTree(elem)) {
              values[index] = getDefaultDisplay(elem);
            }
          } else {
            if (display !== "none") {
              values[index] = "none";
              dataPriv.set(elem, "display", display);
            }
          }
        }
        for (index = 0; index < length; index++) {
          if (values[index] != null) {
            elements[index].style.display = values[index];
          }
        }
        return elements;
      }
      jQuery2.fn.extend({
        show: function() {
          return showHide(this, true);
        },
        hide: function() {
          return showHide(this);
        },
        toggle: function(state) {
          if (typeof state === "boolean") {
            return state ? this.show() : this.hide();
          }
          return this.each(function() {
            if (isHiddenWithinTree(this)) {
              jQuery2(this).show();
            } else {
              jQuery2(this).hide();
            }
          });
        }
      });
      var rcheckableType = /^(?:checkbox|radio)$/i;
      var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
      var rscriptType = /^$|^module$|\/(?:java|ecma)script/i;
      (function() {
        var fragment = document2.createDocumentFragment(), div = fragment.appendChild(document2.createElement("div")), input = document2.createElement("input");
        input.setAttribute("type", "radio");
        input.setAttribute("checked", "checked");
        input.setAttribute("name", "t");
        div.appendChild(input);
        support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
        div.innerHTML = "<textarea>x</textarea>";
        support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
        div.innerHTML = "<option></option>";
        support.option = !!div.lastChild;
      })();
      var wrapMap = {
        // XHTML parsers do not magically insert elements in the
        // same way that tag soup parsers do. So we cannot shorten
        // this by omitting <tbody> or other required elements.
        thead: [1, "<table>", "</table>"],
        col: [2, "<table><colgroup>", "</colgroup></table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        _default: [0, "", ""]
      };
      wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
      wrapMap.th = wrapMap.td;
      if (!support.option) {
        wrapMap.optgroup = wrapMap.option = [1, "<select multiple='multiple'>", "</select>"];
      }
      function getAll(context, tag) {
        var ret;
        if (typeof context.getElementsByTagName !== "undefined") {
          ret = context.getElementsByTagName(tag || "*");
        } else if (typeof context.querySelectorAll !== "undefined") {
          ret = context.querySelectorAll(tag || "*");
        } else {
          ret = [];
        }
        if (tag === void 0 || tag && nodeName(context, tag)) {
          return jQuery2.merge([context], ret);
        }
        return ret;
      }
      function setGlobalEval(elems, refElements) {
        var i = 0, l = elems.length;
        for (; i < l; i++) {
          dataPriv.set(
            elems[i],
            "globalEval",
            !refElements || dataPriv.get(refElements[i], "globalEval")
          );
        }
      }
      var rhtml = /<|&#?\w+;/;
      function buildFragment(elems, context, scripts, selection, ignored) {
        var elem, tmp, tag, wrap, attached, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length;
        for (; i < l; i++) {
          elem = elems[i];
          if (elem || elem === 0) {
            if (toType(elem) === "object") {
              jQuery2.merge(nodes, elem.nodeType ? [elem] : elem);
            } else if (!rhtml.test(elem)) {
              nodes.push(context.createTextNode(elem));
            } else {
              tmp = tmp || fragment.appendChild(context.createElement("div"));
              tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
              wrap = wrapMap[tag] || wrapMap._default;
              tmp.innerHTML = wrap[1] + jQuery2.htmlPrefilter(elem) + wrap[2];
              j = wrap[0];
              while (j--) {
                tmp = tmp.lastChild;
              }
              jQuery2.merge(nodes, tmp.childNodes);
              tmp = fragment.firstChild;
              tmp.textContent = "";
            }
          }
        }
        fragment.textContent = "";
        i = 0;
        while (elem = nodes[i++]) {
          if (selection && jQuery2.inArray(elem, selection) > -1) {
            if (ignored) {
              ignored.push(elem);
            }
            continue;
          }
          attached = isAttached(elem);
          tmp = getAll(fragment.appendChild(elem), "script");
          if (attached) {
            setGlobalEval(tmp);
          }
          if (scripts) {
            j = 0;
            while (elem = tmp[j++]) {
              if (rscriptType.test(elem.type || "")) {
                scripts.push(elem);
              }
            }
          }
        }
        return fragment;
      }
      var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
      function returnTrue() {
        return true;
      }
      function returnFalse() {
        return false;
      }
      function on(elem, types, selector, data, fn, one) {
        var origFn, type;
        if (typeof types === "object") {
          if (typeof selector !== "string") {
            data = data || selector;
            selector = void 0;
          }
          for (type in types) {
            on(elem, type, selector, data, types[type], one);
          }
          return elem;
        }
        if (data == null && fn == null) {
          fn = selector;
          data = selector = void 0;
        } else if (fn == null) {
          if (typeof selector === "string") {
            fn = data;
            data = void 0;
          } else {
            fn = data;
            data = selector;
            selector = void 0;
          }
        }
        if (fn === false) {
          fn = returnFalse;
        } else if (!fn) {
          return elem;
        }
        if (one === 1) {
          origFn = fn;
          fn = function(event) {
            jQuery2().off(event);
            return origFn.apply(this, arguments);
          };
          fn.guid = origFn.guid || (origFn.guid = jQuery2.guid++);
        }
        return elem.each(function() {
          jQuery2.event.add(this, types, fn, data, selector);
        });
      }
      jQuery2.event = {
        global: {},
        add: function(elem, types, handler, data, selector) {
          var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.get(elem);
          if (!acceptData(elem)) {
            return;
          }
          if (handler.handler) {
            handleObjIn = handler;
            handler = handleObjIn.handler;
            selector = handleObjIn.selector;
          }
          if (selector) {
            jQuery2.find.matchesSelector(documentElement, selector);
          }
          if (!handler.guid) {
            handler.guid = jQuery2.guid++;
          }
          if (!(events = elemData.events)) {
            events = elemData.events = /* @__PURE__ */ Object.create(null);
          }
          if (!(eventHandle = elemData.handle)) {
            eventHandle = elemData.handle = function(e) {
              return typeof jQuery2 !== "undefined" && jQuery2.event.triggered !== e.type ? jQuery2.event.dispatch.apply(elem, arguments) : void 0;
            };
          }
          types = (types || "").match(rnothtmlwhite) || [""];
          t = types.length;
          while (t--) {
            tmp = rtypenamespace.exec(types[t]) || [];
            type = origType = tmp[1];
            namespaces = (tmp[2] || "").split(".").sort();
            if (!type) {
              continue;
            }
            special = jQuery2.event.special[type] || {};
            type = (selector ? special.delegateType : special.bindType) || type;
            special = jQuery2.event.special[type] || {};
            handleObj = jQuery2.extend({
              type,
              origType,
              data,
              handler,
              guid: handler.guid,
              selector,
              needsContext: selector && jQuery2.expr.match.needsContext.test(selector),
              namespace: namespaces.join(".")
            }, handleObjIn);
            if (!(handlers = events[type])) {
              handlers = events[type] = [];
              handlers.delegateCount = 0;
              if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                if (elem.addEventListener) {
                  elem.addEventListener(type, eventHandle);
                }
              }
            }
            if (special.add) {
              special.add.call(elem, handleObj);
              if (!handleObj.handler.guid) {
                handleObj.handler.guid = handler.guid;
              }
            }
            if (selector) {
              handlers.splice(handlers.delegateCount++, 0, handleObj);
            } else {
              handlers.push(handleObj);
            }
            jQuery2.event.global[type] = true;
          }
        },
        // Detach an event or set of events from an element
        remove: function(elem, types, handler, selector, mappedTypes) {
          var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.hasData(elem) && dataPriv.get(elem);
          if (!elemData || !(events = elemData.events)) {
            return;
          }
          types = (types || "").match(rnothtmlwhite) || [""];
          t = types.length;
          while (t--) {
            tmp = rtypenamespace.exec(types[t]) || [];
            type = origType = tmp[1];
            namespaces = (tmp[2] || "").split(".").sort();
            if (!type) {
              for (type in events) {
                jQuery2.event.remove(elem, type + types[t], handler, selector, true);
              }
              continue;
            }
            special = jQuery2.event.special[type] || {};
            type = (selector ? special.delegateType : special.bindType) || type;
            handlers = events[type] || [];
            tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
            origCount = j = handlers.length;
            while (j--) {
              handleObj = handlers[j];
              if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                handlers.splice(j, 1);
                if (handleObj.selector) {
                  handlers.delegateCount--;
                }
                if (special.remove) {
                  special.remove.call(elem, handleObj);
                }
              }
            }
            if (origCount && !handlers.length) {
              if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                jQuery2.removeEvent(elem, type, elemData.handle);
              }
              delete events[type];
            }
          }
          if (jQuery2.isEmptyObject(events)) {
            dataPriv.remove(elem, "handle events");
          }
        },
        dispatch: function(nativeEvent) {
          var i, j, ret, matched, handleObj, handlerQueue, args = new Array(arguments.length), event = jQuery2.event.fix(nativeEvent), handlers = (dataPriv.get(this, "events") || /* @__PURE__ */ Object.create(null))[event.type] || [], special = jQuery2.event.special[event.type] || {};
          args[0] = event;
          for (i = 1; i < arguments.length; i++) {
            args[i] = arguments[i];
          }
          event.delegateTarget = this;
          if (special.preDispatch && special.preDispatch.call(this, event) === false) {
            return;
          }
          handlerQueue = jQuery2.event.handlers.call(this, event, handlers);
          i = 0;
          while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
            event.currentTarget = matched.elem;
            j = 0;
            while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
              if (!event.rnamespace || handleObj.namespace === false || event.rnamespace.test(handleObj.namespace)) {
                event.handleObj = handleObj;
                event.data = handleObj.data;
                ret = ((jQuery2.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                if (ret !== void 0) {
                  if ((event.result = ret) === false) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }
              }
            }
          }
          if (special.postDispatch) {
            special.postDispatch.call(this, event);
          }
          return event.result;
        },
        handlers: function(event, handlers) {
          var i, handleObj, sel, matchedHandlers, matchedSelectors, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
          if (delegateCount && // Support: IE <=9
          // Black-hole SVG <use> instance trees (trac-13180)
          cur.nodeType && // Support: Firefox <=42
          // Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
          // https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
          // Support: IE 11 only
          // ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
          !(event.type === "click" && event.button >= 1)) {
            for (; cur !== this; cur = cur.parentNode || this) {
              if (cur.nodeType === 1 && !(event.type === "click" && cur.disabled === true)) {
                matchedHandlers = [];
                matchedSelectors = {};
                for (i = 0; i < delegateCount; i++) {
                  handleObj = handlers[i];
                  sel = handleObj.selector + " ";
                  if (matchedSelectors[sel] === void 0) {
                    matchedSelectors[sel] = handleObj.needsContext ? jQuery2(sel, this).index(cur) > -1 : jQuery2.find(sel, this, null, [cur]).length;
                  }
                  if (matchedSelectors[sel]) {
                    matchedHandlers.push(handleObj);
                  }
                }
                if (matchedHandlers.length) {
                  handlerQueue.push({ elem: cur, handlers: matchedHandlers });
                }
              }
            }
          }
          cur = this;
          if (delegateCount < handlers.length) {
            handlerQueue.push({ elem: cur, handlers: handlers.slice(delegateCount) });
          }
          return handlerQueue;
        },
        addProp: function(name, hook) {
          Object.defineProperty(jQuery2.Event.prototype, name, {
            enumerable: true,
            configurable: true,
            get: isFunction(hook) ? function() {
              if (this.originalEvent) {
                return hook(this.originalEvent);
              }
            } : function() {
              if (this.originalEvent) {
                return this.originalEvent[name];
              }
            },
            set: function(value) {
              Object.defineProperty(this, name, {
                enumerable: true,
                configurable: true,
                writable: true,
                value
              });
            }
          });
        },
        fix: function(originalEvent) {
          return originalEvent[jQuery2.expando] ? originalEvent : new jQuery2.Event(originalEvent);
        },
        special: {
          load: {
            // Prevent triggered image.load events from bubbling to window.load
            noBubble: true
          },
          click: {
            // Utilize native event to ensure correct state for checkable inputs
            setup: function(data) {
              var el = this || data;
              if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
                leverageNative(el, "click", true);
              }
              return false;
            },
            trigger: function(data) {
              var el = this || data;
              if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
                leverageNative(el, "click");
              }
              return true;
            },
            // For cross-browser consistency, suppress native .click() on links
            // Also prevent it if we're currently inside a leveraged native-event stack
            _default: function(event) {
              var target = event.target;
              return rcheckableType.test(target.type) && target.click && nodeName(target, "input") && dataPriv.get(target, "click") || nodeName(target, "a");
            }
          },
          beforeunload: {
            postDispatch: function(event) {
              if (event.result !== void 0 && event.originalEvent) {
                event.originalEvent.returnValue = event.result;
              }
            }
          }
        }
      };
      function leverageNative(el, type, isSetup) {
        if (!isSetup) {
          if (dataPriv.get(el, type) === void 0) {
            jQuery2.event.add(el, type, returnTrue);
          }
          return;
        }
        dataPriv.set(el, type, false);
        jQuery2.event.add(el, type, {
          namespace: false,
          handler: function(event) {
            var result, saved = dataPriv.get(this, type);
            if (event.isTrigger & 1 && this[type]) {
              if (!saved) {
                saved = slice.call(arguments);
                dataPriv.set(this, type, saved);
                this[type]();
                result = dataPriv.get(this, type);
                dataPriv.set(this, type, false);
                if (saved !== result) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                  return result;
                }
              } else if ((jQuery2.event.special[type] || {}).delegateType) {
                event.stopPropagation();
              }
            } else if (saved) {
              dataPriv.set(this, type, jQuery2.event.trigger(
                saved[0],
                saved.slice(1),
                this
              ));
              event.stopPropagation();
              event.isImmediatePropagationStopped = returnTrue;
            }
          }
        });
      }
      jQuery2.removeEvent = function(elem, type, handle) {
        if (elem.removeEventListener) {
          elem.removeEventListener(type, handle);
        }
      };
      jQuery2.Event = function(src, props) {
        if (!(this instanceof jQuery2.Event)) {
          return new jQuery2.Event(src, props);
        }
        if (src && src.type) {
          this.originalEvent = src;
          this.type = src.type;
          this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === void 0 && // Support: Android <=2.3 only
          src.returnValue === false ? returnTrue : returnFalse;
          this.target = src.target && src.target.nodeType === 3 ? src.target.parentNode : src.target;
          this.currentTarget = src.currentTarget;
          this.relatedTarget = src.relatedTarget;
        } else {
          this.type = src;
        }
        if (props) {
          jQuery2.extend(this, props);
        }
        this.timeStamp = src && src.timeStamp || Date.now();
        this[jQuery2.expando] = true;
      };
      jQuery2.Event.prototype = {
        constructor: jQuery2.Event,
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        isSimulated: false,
        preventDefault: function() {
          var e = this.originalEvent;
          this.isDefaultPrevented = returnTrue;
          if (e && !this.isSimulated) {
            e.preventDefault();
          }
        },
        stopPropagation: function() {
          var e = this.originalEvent;
          this.isPropagationStopped = returnTrue;
          if (e && !this.isSimulated) {
            e.stopPropagation();
          }
        },
        stopImmediatePropagation: function() {
          var e = this.originalEvent;
          this.isImmediatePropagationStopped = returnTrue;
          if (e && !this.isSimulated) {
            e.stopImmediatePropagation();
          }
          this.stopPropagation();
        }
      };
      jQuery2.each({
        altKey: true,
        bubbles: true,
        cancelable: true,
        changedTouches: true,
        ctrlKey: true,
        detail: true,
        eventPhase: true,
        metaKey: true,
        pageX: true,
        pageY: true,
        shiftKey: true,
        view: true,
        "char": true,
        code: true,
        charCode: true,
        key: true,
        keyCode: true,
        button: true,
        buttons: true,
        clientX: true,
        clientY: true,
        offsetX: true,
        offsetY: true,
        pointerId: true,
        pointerType: true,
        screenX: true,
        screenY: true,
        targetTouches: true,
        toElement: true,
        touches: true,
        which: true
      }, jQuery2.event.addProp);
      jQuery2.each({ focus: "focusin", blur: "focusout" }, function(type, delegateType) {
        function focusMappedHandler(nativeEvent) {
          if (document2.documentMode) {
            var handle = dataPriv.get(this, "handle"), event = jQuery2.event.fix(nativeEvent);
            event.type = nativeEvent.type === "focusin" ? "focus" : "blur";
            event.isSimulated = true;
            handle(nativeEvent);
            if (event.target === event.currentTarget) {
              handle(event);
            }
          } else {
            jQuery2.event.simulate(
              delegateType,
              nativeEvent.target,
              jQuery2.event.fix(nativeEvent)
            );
          }
        }
        jQuery2.event.special[type] = {
          // Utilize native event if possible so blur/focus sequence is correct
          setup: function() {
            var attaches;
            leverageNative(this, type, true);
            if (document2.documentMode) {
              attaches = dataPriv.get(this, delegateType);
              if (!attaches) {
                this.addEventListener(delegateType, focusMappedHandler);
              }
              dataPriv.set(this, delegateType, (attaches || 0) + 1);
            } else {
              return false;
            }
          },
          trigger: function() {
            leverageNative(this, type);
            return true;
          },
          teardown: function() {
            var attaches;
            if (document2.documentMode) {
              attaches = dataPriv.get(this, delegateType) - 1;
              if (!attaches) {
                this.removeEventListener(delegateType, focusMappedHandler);
                dataPriv.remove(this, delegateType);
              } else {
                dataPriv.set(this, delegateType, attaches);
              }
            } else {
              return false;
            }
          },
          // Suppress native focus or blur if we're currently inside
          // a leveraged native-event stack
          _default: function(event) {
            return dataPriv.get(event.target, type);
          },
          delegateType
        };
        jQuery2.event.special[delegateType] = {
          setup: function() {
            var doc = this.ownerDocument || this.document || this, dataHolder = document2.documentMode ? this : doc, attaches = dataPriv.get(dataHolder, delegateType);
            if (!attaches) {
              if (document2.documentMode) {
                this.addEventListener(delegateType, focusMappedHandler);
              } else {
                doc.addEventListener(type, focusMappedHandler, true);
              }
            }
            dataPriv.set(dataHolder, delegateType, (attaches || 0) + 1);
          },
          teardown: function() {
            var doc = this.ownerDocument || this.document || this, dataHolder = document2.documentMode ? this : doc, attaches = dataPriv.get(dataHolder, delegateType) - 1;
            if (!attaches) {
              if (document2.documentMode) {
                this.removeEventListener(delegateType, focusMappedHandler);
              } else {
                doc.removeEventListener(type, focusMappedHandler, true);
              }
              dataPriv.remove(dataHolder, delegateType);
            } else {
              dataPriv.set(dataHolder, delegateType, attaches);
            }
          }
        };
      });
      jQuery2.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
      }, function(orig, fix) {
        jQuery2.event.special[orig] = {
          delegateType: fix,
          bindType: fix,
          handle: function(event) {
            var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
            if (!related || related !== target && !jQuery2.contains(target, related)) {
              event.type = handleObj.origType;
              ret = handleObj.handler.apply(this, arguments);
              event.type = fix;
            }
            return ret;
          }
        };
      });
      jQuery2.fn.extend({
        on: function(types, selector, data, fn) {
          return on(this, types, selector, data, fn);
        },
        one: function(types, selector, data, fn) {
          return on(this, types, selector, data, fn, 1);
        },
        off: function(types, selector, fn) {
          var handleObj, type;
          if (types && types.preventDefault && types.handleObj) {
            handleObj = types.handleObj;
            jQuery2(types.delegateTarget).off(
              handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
              handleObj.selector,
              handleObj.handler
            );
            return this;
          }
          if (typeof types === "object") {
            for (type in types) {
              this.off(type, selector, types[type]);
            }
            return this;
          }
          if (selector === false || typeof selector === "function") {
            fn = selector;
            selector = void 0;
          }
          if (fn === false) {
            fn = returnFalse;
          }
          return this.each(function() {
            jQuery2.event.remove(this, types, fn, selector);
          });
        }
      });
      var rnoInnerhtml = /<script|<style|<link/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rcleanScript = /^\s*<!\[CDATA\[|\]\]>\s*$/g;
      function manipulationTarget(elem, content) {
        if (nodeName(elem, "table") && nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr")) {
          return jQuery2(elem).children("tbody")[0] || elem;
        }
        return elem;
      }
      function disableScript(elem) {
        elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
        return elem;
      }
      function restoreScript(elem) {
        if ((elem.type || "").slice(0, 5) === "true/") {
          elem.type = elem.type.slice(5);
        } else {
          elem.removeAttribute("type");
        }
        return elem;
      }
      function cloneCopyEvent(src, dest) {
        var i, l, type, pdataOld, udataOld, udataCur, events;
        if (dest.nodeType !== 1) {
          return;
        }
        if (dataPriv.hasData(src)) {
          pdataOld = dataPriv.get(src);
          events = pdataOld.events;
          if (events) {
            dataPriv.remove(dest, "handle events");
            for (type in events) {
              for (i = 0, l = events[type].length; i < l; i++) {
                jQuery2.event.add(dest, type, events[type][i]);
              }
            }
          }
        }
        if (dataUser.hasData(src)) {
          udataOld = dataUser.access(src);
          udataCur = jQuery2.extend({}, udataOld);
          dataUser.set(dest, udataCur);
        }
      }
      function fixInput(src, dest) {
        var nodeName2 = dest.nodeName.toLowerCase();
        if (nodeName2 === "input" && rcheckableType.test(src.type)) {
          dest.checked = src.checked;
        } else if (nodeName2 === "input" || nodeName2 === "textarea") {
          dest.defaultValue = src.defaultValue;
        }
      }
      function domManip(collection, args, callback, ignored) {
        args = flat(args);
        var fragment, first, scripts, hasScripts, node, doc, i = 0, l = collection.length, iNoClone = l - 1, value = args[0], valueIsFunction = isFunction(value);
        if (valueIsFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
          return collection.each(function(index) {
            var self2 = collection.eq(index);
            if (valueIsFunction) {
              args[0] = value.call(this, index, self2.html());
            }
            domManip(self2, args, callback, ignored);
          });
        }
        if (l) {
          fragment = buildFragment(args, collection[0].ownerDocument, false, collection, ignored);
          first = fragment.firstChild;
          if (fragment.childNodes.length === 1) {
            fragment = first;
          }
          if (first || ignored) {
            scripts = jQuery2.map(getAll(fragment, "script"), disableScript);
            hasScripts = scripts.length;
            for (; i < l; i++) {
              node = fragment;
              if (i !== iNoClone) {
                node = jQuery2.clone(node, true, true);
                if (hasScripts) {
                  jQuery2.merge(scripts, getAll(node, "script"));
                }
              }
              callback.call(collection[i], node, i);
            }
            if (hasScripts) {
              doc = scripts[scripts.length - 1].ownerDocument;
              jQuery2.map(scripts, restoreScript);
              for (i = 0; i < hasScripts; i++) {
                node = scripts[i];
                if (rscriptType.test(node.type || "") && !dataPriv.access(node, "globalEval") && jQuery2.contains(doc, node)) {
                  if (node.src && (node.type || "").toLowerCase() !== "module") {
                    if (jQuery2._evalUrl && !node.noModule) {
                      jQuery2._evalUrl(node.src, {
                        nonce: node.nonce || node.getAttribute("nonce")
                      }, doc);
                    }
                  } else {
                    DOMEval(node.textContent.replace(rcleanScript, ""), node, doc);
                  }
                }
              }
            }
          }
        }
        return collection;
      }
      function remove(elem, selector, keepData) {
        var node, nodes = selector ? jQuery2.filter(selector, elem) : elem, i = 0;
        for (; (node = nodes[i]) != null; i++) {
          if (!keepData && node.nodeType === 1) {
            jQuery2.cleanData(getAll(node));
          }
          if (node.parentNode) {
            if (keepData && isAttached(node)) {
              setGlobalEval(getAll(node, "script"));
            }
            node.parentNode.removeChild(node);
          }
        }
        return elem;
      }
      jQuery2.extend({
        htmlPrefilter: function(html) {
          return html;
        },
        clone: function(elem, dataAndEvents, deepDataAndEvents) {
          var i, l, srcElements, destElements, clone = elem.cloneNode(true), inPage = isAttached(elem);
          if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery2.isXMLDoc(elem)) {
            destElements = getAll(clone);
            srcElements = getAll(elem);
            for (i = 0, l = srcElements.length; i < l; i++) {
              fixInput(srcElements[i], destElements[i]);
            }
          }
          if (dataAndEvents) {
            if (deepDataAndEvents) {
              srcElements = srcElements || getAll(elem);
              destElements = destElements || getAll(clone);
              for (i = 0, l = srcElements.length; i < l; i++) {
                cloneCopyEvent(srcElements[i], destElements[i]);
              }
            } else {
              cloneCopyEvent(elem, clone);
            }
          }
          destElements = getAll(clone, "script");
          if (destElements.length > 0) {
            setGlobalEval(destElements, !inPage && getAll(elem, "script"));
          }
          return clone;
        },
        cleanData: function(elems) {
          var data, elem, type, special = jQuery2.event.special, i = 0;
          for (; (elem = elems[i]) !== void 0; i++) {
            if (acceptData(elem)) {
              if (data = elem[dataPriv.expando]) {
                if (data.events) {
                  for (type in data.events) {
                    if (special[type]) {
                      jQuery2.event.remove(elem, type);
                    } else {
                      jQuery2.removeEvent(elem, type, data.handle);
                    }
                  }
                }
                elem[dataPriv.expando] = void 0;
              }
              if (elem[dataUser.expando]) {
                elem[dataUser.expando] = void 0;
              }
            }
          }
        }
      });
      jQuery2.fn.extend({
        detach: function(selector) {
          return remove(this, selector, true);
        },
        remove: function(selector) {
          return remove(this, selector);
        },
        text: function(value) {
          return access(this, function(value2) {
            return value2 === void 0 ? jQuery2.text(this) : this.empty().each(function() {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                this.textContent = value2;
              }
            });
          }, null, value, arguments.length);
        },
        append: function() {
          return domManip(this, arguments, function(elem) {
            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
              var target = manipulationTarget(this, elem);
              target.appendChild(elem);
            }
          });
        },
        prepend: function() {
          return domManip(this, arguments, function(elem) {
            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
              var target = manipulationTarget(this, elem);
              target.insertBefore(elem, target.firstChild);
            }
          });
        },
        before: function() {
          return domManip(this, arguments, function(elem) {
            if (this.parentNode) {
              this.parentNode.insertBefore(elem, this);
            }
          });
        },
        after: function() {
          return domManip(this, arguments, function(elem) {
            if (this.parentNode) {
              this.parentNode.insertBefore(elem, this.nextSibling);
            }
          });
        },
        empty: function() {
          var elem, i = 0;
          for (; (elem = this[i]) != null; i++) {
            if (elem.nodeType === 1) {
              jQuery2.cleanData(getAll(elem, false));
              elem.textContent = "";
            }
          }
          return this;
        },
        clone: function(dataAndEvents, deepDataAndEvents) {
          dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
          deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
          return this.map(function() {
            return jQuery2.clone(this, dataAndEvents, deepDataAndEvents);
          });
        },
        html: function(value) {
          return access(this, function(value2) {
            var elem = this[0] || {}, i = 0, l = this.length;
            if (value2 === void 0 && elem.nodeType === 1) {
              return elem.innerHTML;
            }
            if (typeof value2 === "string" && !rnoInnerhtml.test(value2) && !wrapMap[(rtagName.exec(value2) || ["", ""])[1].toLowerCase()]) {
              value2 = jQuery2.htmlPrefilter(value2);
              try {
                for (; i < l; i++) {
                  elem = this[i] || {};
                  if (elem.nodeType === 1) {
                    jQuery2.cleanData(getAll(elem, false));
                    elem.innerHTML = value2;
                  }
                }
                elem = 0;
              } catch (e) {
              }
            }
            if (elem) {
              this.empty().append(value2);
            }
          }, null, value, arguments.length);
        },
        replaceWith: function() {
          var ignored = [];
          return domManip(this, arguments, function(elem) {
            var parent = this.parentNode;
            if (jQuery2.inArray(this, ignored) < 0) {
              jQuery2.cleanData(getAll(this));
              if (parent) {
                parent.replaceChild(elem, this);
              }
            }
          }, ignored);
        }
      });
      jQuery2.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
      }, function(name, original) {
        jQuery2.fn[name] = function(selector) {
          var elems, ret = [], insert = jQuery2(selector), last = insert.length - 1, i = 0;
          for (; i <= last; i++) {
            elems = i === last ? this : this.clone(true);
            jQuery2(insert[i])[original](elems);
            push.apply(ret, elems.get());
          }
          return this.pushStack(ret);
        };
      });
      var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
      var rcustomProp = /^--/;
      var getStyles = function(elem) {
        var view = elem.ownerDocument.defaultView;
        if (!view || !view.opener) {
          view = window2;
        }
        return view.getComputedStyle(elem);
      };
      var swap = function(elem, options, callback) {
        var ret, name, old = {};
        for (name in options) {
          old[name] = elem.style[name];
          elem.style[name] = options[name];
        }
        ret = callback.call(elem);
        for (name in options) {
          elem.style[name] = old[name];
        }
        return ret;
      };
      var rboxStyle = new RegExp(cssExpand.join("|"), "i");
      (function() {
        function computeStyleTests() {
          if (!div) {
            return;
          }
          container.style.cssText = "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0";
          div.style.cssText = "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%";
          documentElement.appendChild(container).appendChild(div);
          var divStyle = window2.getComputedStyle(div);
          pixelPositionVal = divStyle.top !== "1%";
          reliableMarginLeftVal = roundPixelMeasures(divStyle.marginLeft) === 12;
          div.style.right = "60%";
          pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36;
          boxSizingReliableVal = roundPixelMeasures(divStyle.width) === 36;
          div.style.position = "absolute";
          scrollboxSizeVal = roundPixelMeasures(div.offsetWidth / 3) === 12;
          documentElement.removeChild(container);
          div = null;
        }
        function roundPixelMeasures(measure) {
          return Math.round(parseFloat(measure));
        }
        var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal, reliableTrDimensionsVal, reliableMarginLeftVal, container = document2.createElement("div"), div = document2.createElement("div");
        if (!div.style) {
          return;
        }
        div.style.backgroundClip = "content-box";
        div.cloneNode(true).style.backgroundClip = "";
        support.clearCloneStyle = div.style.backgroundClip === "content-box";
        jQuery2.extend(support, {
          boxSizingReliable: function() {
            computeStyleTests();
            return boxSizingReliableVal;
          },
          pixelBoxStyles: function() {
            computeStyleTests();
            return pixelBoxStylesVal;
          },
          pixelPosition: function() {
            computeStyleTests();
            return pixelPositionVal;
          },
          reliableMarginLeft: function() {
            computeStyleTests();
            return reliableMarginLeftVal;
          },
          scrollboxSize: function() {
            computeStyleTests();
            return scrollboxSizeVal;
          },
          // Support: IE 9 - 11+, Edge 15 - 18+
          // IE/Edge misreport `getComputedStyle` of table rows with width/height
          // set in CSS while `offset*` properties report correct values.
          // Behavior in IE 9 is more subtle than in newer versions & it passes
          // some versions of this test; make sure not to make it pass there!
          //
          // Support: Firefox 70+
          // Only Firefox includes border widths
          // in computed dimensions. (gh-4529)
          reliableTrDimensions: function() {
            var table, tr, trChild, trStyle;
            if (reliableTrDimensionsVal == null) {
              table = document2.createElement("table");
              tr = document2.createElement("tr");
              trChild = document2.createElement("div");
              table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
              tr.style.cssText = "box-sizing:content-box;border:1px solid";
              tr.style.height = "1px";
              trChild.style.height = "9px";
              trChild.style.display = "block";
              documentElement.appendChild(table).appendChild(tr).appendChild(trChild);
              trStyle = window2.getComputedStyle(tr);
              reliableTrDimensionsVal = parseInt(trStyle.height, 10) + parseInt(trStyle.borderTopWidth, 10) + parseInt(trStyle.borderBottomWidth, 10) === tr.offsetHeight;
              documentElement.removeChild(table);
            }
            return reliableTrDimensionsVal;
          }
        });
      })();
      function curCSS(elem, name, computed) {
        var width, minWidth, maxWidth, ret, isCustomProp = rcustomProp.test(name), style = elem.style;
        computed = computed || getStyles(elem);
        if (computed) {
          ret = computed.getPropertyValue(name) || computed[name];
          if (isCustomProp && ret) {
            ret = ret.replace(rtrimCSS, "$1") || void 0;
          }
          if (ret === "" && !isAttached(elem)) {
            ret = jQuery2.style(elem, name);
          }
          if (!support.pixelBoxStyles() && rnumnonpx.test(ret) && rboxStyle.test(name)) {
            width = style.width;
            minWidth = style.minWidth;
            maxWidth = style.maxWidth;
            style.minWidth = style.maxWidth = style.width = ret;
            ret = computed.width;
            style.width = width;
            style.minWidth = minWidth;
            style.maxWidth = maxWidth;
          }
        }
        return ret !== void 0 ? (
          // Support: IE <=9 - 11 only
          // IE returns zIndex value as an integer.
          ret + ""
        ) : ret;
      }
      function addGetHookIf(conditionFn, hookFn) {
        return {
          get: function() {
            if (conditionFn()) {
              delete this.get;
              return;
            }
            return (this.get = hookFn).apply(this, arguments);
          }
        };
      }
      var cssPrefixes = ["Webkit", "Moz", "ms"], emptyStyle = document2.createElement("div").style, vendorProps = {};
      function vendorPropName(name) {
        var capName = name[0].toUpperCase() + name.slice(1), i = cssPrefixes.length;
        while (i--) {
          name = cssPrefixes[i] + capName;
          if (name in emptyStyle) {
            return name;
          }
        }
      }
      function finalPropName(name) {
        var final = jQuery2.cssProps[name] || vendorProps[name];
        if (final) {
          return final;
        }
        if (name in emptyStyle) {
          return name;
        }
        return vendorProps[name] = vendorPropName(name) || name;
      }
      var rdisplayswap = /^(none|table(?!-c[ea]).+)/, cssShow = { position: "absolute", visibility: "hidden", display: "block" }, cssNormalTransform = {
        letterSpacing: "0",
        fontWeight: "400"
      };
      function setPositiveNumber(_elem, value, subtract) {
        var matches2 = rcssNum.exec(value);
        return matches2 ? (
          // Guard against undefined "subtract", e.g., when used as in cssHooks
          Math.max(0, matches2[2] - (subtract || 0)) + (matches2[3] || "px")
        ) : value;
      }
      function boxModelAdjustment(elem, dimension, box, isBorderBox, styles, computedVal) {
        var i = dimension === "width" ? 1 : 0, extra = 0, delta = 0, marginDelta = 0;
        if (box === (isBorderBox ? "border" : "content")) {
          return 0;
        }
        for (; i < 4; i += 2) {
          if (box === "margin") {
            marginDelta += jQuery2.css(elem, box + cssExpand[i], true, styles);
          }
          if (!isBorderBox) {
            delta += jQuery2.css(elem, "padding" + cssExpand[i], true, styles);
            if (box !== "padding") {
              delta += jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
            } else {
              extra += jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
            }
          } else {
            if (box === "content") {
              delta -= jQuery2.css(elem, "padding" + cssExpand[i], true, styles);
            }
            if (box !== "margin") {
              delta -= jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
            }
          }
        }
        if (!isBorderBox && computedVal >= 0) {
          delta += Math.max(0, Math.ceil(
            elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - computedVal - delta - extra - 0.5
            // If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
            // Use an explicit zero to avoid NaN (gh-3964)
          )) || 0;
        }
        return delta + marginDelta;
      }
      function getWidthOrHeight(elem, dimension, extra) {
        var styles = getStyles(elem), boxSizingNeeded = !support.boxSizingReliable() || extra, isBorderBox = boxSizingNeeded && jQuery2.css(elem, "boxSizing", false, styles) === "border-box", valueIsBorderBox = isBorderBox, val = curCSS(elem, dimension, styles), offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);
        if (rnumnonpx.test(val)) {
          if (!extra) {
            return val;
          }
          val = "auto";
        }
        if ((!support.boxSizingReliable() && isBorderBox || // Support: IE 10 - 11+, Edge 15 - 18+
        // IE/Edge misreport `getComputedStyle` of table rows with width/height
        // set in CSS while `offset*` properties report correct values.
        // Interestingly, in some cases IE 9 doesn't suffer from this issue.
        !support.reliableTrDimensions() && nodeName(elem, "tr") || // Fall back to offsetWidth/offsetHeight when value is "auto"
        // This happens for inline elements with no explicit setting (gh-3571)
        val === "auto" || // Support: Android <=4.1 - 4.3 only
        // Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
        !parseFloat(val) && jQuery2.css(elem, "display", false, styles) === "inline") && // Make sure the element is visible & connected
        elem.getClientRects().length) {
          isBorderBox = jQuery2.css(elem, "boxSizing", false, styles) === "border-box";
          valueIsBorderBox = offsetProp in elem;
          if (valueIsBorderBox) {
            val = elem[offsetProp];
          }
        }
        val = parseFloat(val) || 0;
        return val + boxModelAdjustment(
          elem,
          dimension,
          extra || (isBorderBox ? "border" : "content"),
          valueIsBorderBox,
          styles,
          // Provide the current computed size to request scroll gutter calculation (gh-3589)
          val
        ) + "px";
      }
      jQuery2.extend({
        // Add in style property hooks for overriding the default
        // behavior of getting and setting a style property
        cssHooks: {
          opacity: {
            get: function(elem, computed) {
              if (computed) {
                var ret = curCSS(elem, "opacity");
                return ret === "" ? "1" : ret;
              }
            }
          }
        },
        // Don't automatically add "px" to these possibly-unitless properties
        cssNumber: {
          animationIterationCount: true,
          aspectRatio: true,
          borderImageSlice: true,
          columnCount: true,
          flexGrow: true,
          flexShrink: true,
          fontWeight: true,
          gridArea: true,
          gridColumn: true,
          gridColumnEnd: true,
          gridColumnStart: true,
          gridRow: true,
          gridRowEnd: true,
          gridRowStart: true,
          lineHeight: true,
          opacity: true,
          order: true,
          orphans: true,
          scale: true,
          widows: true,
          zIndex: true,
          zoom: true,
          // SVG-related
          fillOpacity: true,
          floodOpacity: true,
          stopOpacity: true,
          strokeMiterlimit: true,
          strokeOpacity: true
        },
        // Add in properties whose names you wish to fix before
        // setting or getting the value
        cssProps: {},
        // Get and set the style property on a DOM Node
        style: function(elem, name, value, extra) {
          if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
            return;
          }
          var ret, type, hooks, origName = camelCase(name), isCustomProp = rcustomProp.test(name), style = elem.style;
          if (!isCustomProp) {
            name = finalPropName(origName);
          }
          hooks = jQuery2.cssHooks[name] || jQuery2.cssHooks[origName];
          if (value !== void 0) {
            type = typeof value;
            if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
              value = adjustCSS(elem, name, ret);
              type = "number";
            }
            if (value == null || value !== value) {
              return;
            }
            if (type === "number" && !isCustomProp) {
              value += ret && ret[3] || (jQuery2.cssNumber[origName] ? "" : "px");
            }
            if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
              style[name] = "inherit";
            }
            if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== void 0) {
              if (isCustomProp) {
                style.setProperty(name, value);
              } else {
                style[name] = value;
              }
            }
          } else {
            if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== void 0) {
              return ret;
            }
            return style[name];
          }
        },
        css: function(elem, name, extra, styles) {
          var val, num, hooks, origName = camelCase(name), isCustomProp = rcustomProp.test(name);
          if (!isCustomProp) {
            name = finalPropName(origName);
          }
          hooks = jQuery2.cssHooks[name] || jQuery2.cssHooks[origName];
          if (hooks && "get" in hooks) {
            val = hooks.get(elem, true, extra);
          }
          if (val === void 0) {
            val = curCSS(elem, name, styles);
          }
          if (val === "normal" && name in cssNormalTransform) {
            val = cssNormalTransform[name];
          }
          if (extra === "" || extra) {
            num = parseFloat(val);
            return extra === true || isFinite(num) ? num || 0 : val;
          }
          return val;
        }
      });
      jQuery2.each(["height", "width"], function(_i, dimension) {
        jQuery2.cssHooks[dimension] = {
          get: function(elem, computed, extra) {
            if (computed) {
              return rdisplayswap.test(jQuery2.css(elem, "display")) && // Support: Safari 8+
              // Table columns in Safari have non-zero offsetWidth & zero
              // getBoundingClientRect().width unless display is changed.
              // Support: IE <=11 only
              // Running getBoundingClientRect on a disconnected node
              // in IE throws an error.
              (!elem.getClientRects().length || !elem.getBoundingClientRect().width) ? swap(elem, cssShow, function() {
                return getWidthOrHeight(elem, dimension, extra);
              }) : getWidthOrHeight(elem, dimension, extra);
            }
          },
          set: function(elem, value, extra) {
            var matches2, styles = getStyles(elem), scrollboxSizeBuggy = !support.scrollboxSize() && styles.position === "absolute", boxSizingNeeded = scrollboxSizeBuggy || extra, isBorderBox = boxSizingNeeded && jQuery2.css(elem, "boxSizing", false, styles) === "border-box", subtract = extra ? boxModelAdjustment(
              elem,
              dimension,
              extra,
              isBorderBox,
              styles
            ) : 0;
            if (isBorderBox && scrollboxSizeBuggy) {
              subtract -= Math.ceil(
                elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - parseFloat(styles[dimension]) - boxModelAdjustment(elem, dimension, "border", false, styles) - 0.5
              );
            }
            if (subtract && (matches2 = rcssNum.exec(value)) && (matches2[3] || "px") !== "px") {
              elem.style[dimension] = value;
              value = jQuery2.css(elem, dimension);
            }
            return setPositiveNumber(elem, value, subtract);
          }
        };
      });
      jQuery2.cssHooks.marginLeft = addGetHookIf(
        support.reliableMarginLeft,
        function(elem, computed) {
          if (computed) {
            return (parseFloat(curCSS(elem, "marginLeft")) || elem.getBoundingClientRect().left - swap(elem, { marginLeft: 0 }, function() {
              return elem.getBoundingClientRect().left;
            })) + "px";
          }
        }
      );
      jQuery2.each({
        margin: "",
        padding: "",
        border: "Width"
      }, function(prefix, suffix) {
        jQuery2.cssHooks[prefix + suffix] = {
          expand: function(value) {
            var i = 0, expanded = {}, parts = typeof value === "string" ? value.split(" ") : [value];
            for (; i < 4; i++) {
              expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
            }
            return expanded;
          }
        };
        if (prefix !== "margin") {
          jQuery2.cssHooks[prefix + suffix].set = setPositiveNumber;
        }
      });
      jQuery2.fn.extend({
        css: function(name, value) {
          return access(this, function(elem, name2, value2) {
            var styles, len, map = {}, i = 0;
            if (Array.isArray(name2)) {
              styles = getStyles(elem);
              len = name2.length;
              for (; i < len; i++) {
                map[name2[i]] = jQuery2.css(elem, name2[i], false, styles);
              }
              return map;
            }
            return value2 !== void 0 ? jQuery2.style(elem, name2, value2) : jQuery2.css(elem, name2);
          }, name, value, arguments.length > 1);
        }
      });
      function Tween(elem, options, prop, end, easing) {
        return new Tween.prototype.init(elem, options, prop, end, easing);
      }
      jQuery2.Tween = Tween;
      Tween.prototype = {
        constructor: Tween,
        init: function(elem, options, prop, end, easing, unit) {
          this.elem = elem;
          this.prop = prop;
          this.easing = easing || jQuery2.easing._default;
          this.options = options;
          this.start = this.now = this.cur();
          this.end = end;
          this.unit = unit || (jQuery2.cssNumber[prop] ? "" : "px");
        },
        cur: function() {
          var hooks = Tween.propHooks[this.prop];
          return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
        },
        run: function(percent) {
          var eased, hooks = Tween.propHooks[this.prop];
          if (this.options.duration) {
            this.pos = eased = jQuery2.easing[this.easing](
              percent,
              this.options.duration * percent,
              0,
              1,
              this.options.duration
            );
          } else {
            this.pos = eased = percent;
          }
          this.now = (this.end - this.start) * eased + this.start;
          if (this.options.step) {
            this.options.step.call(this.elem, this.now, this);
          }
          if (hooks && hooks.set) {
            hooks.set(this);
          } else {
            Tween.propHooks._default.set(this);
          }
          return this;
        }
      };
      Tween.prototype.init.prototype = Tween.prototype;
      Tween.propHooks = {
        _default: {
          get: function(tween) {
            var result;
            if (tween.elem.nodeType !== 1 || tween.elem[tween.prop] != null && tween.elem.style[tween.prop] == null) {
              return tween.elem[tween.prop];
            }
            result = jQuery2.css(tween.elem, tween.prop, "");
            return !result || result === "auto" ? 0 : result;
          },
          set: function(tween) {
            if (jQuery2.fx.step[tween.prop]) {
              jQuery2.fx.step[tween.prop](tween);
            } else if (tween.elem.nodeType === 1 && (jQuery2.cssHooks[tween.prop] || tween.elem.style[finalPropName(tween.prop)] != null)) {
              jQuery2.style(tween.elem, tween.prop, tween.now + tween.unit);
            } else {
              tween.elem[tween.prop] = tween.now;
            }
          }
        }
      };
      Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
        set: function(tween) {
          if (tween.elem.nodeType && tween.elem.parentNode) {
            tween.elem[tween.prop] = tween.now;
          }
        }
      };
      jQuery2.easing = {
        linear: function(p) {
          return p;
        },
        swing: function(p) {
          return 0.5 - Math.cos(p * Math.PI) / 2;
        },
        _default: "swing"
      };
      jQuery2.fx = Tween.prototype.init;
      jQuery2.fx.step = {};
      var fxNow, inProgress, rfxtypes = /^(?:toggle|show|hide)$/, rrun = /queueHooks$/;
      function schedule() {
        if (inProgress) {
          if (document2.hidden === false && window2.requestAnimationFrame) {
            window2.requestAnimationFrame(schedule);
          } else {
            window2.setTimeout(schedule, jQuery2.fx.interval);
          }
          jQuery2.fx.tick();
        }
      }
      function createFxNow() {
        window2.setTimeout(function() {
          fxNow = void 0;
        });
        return fxNow = Date.now();
      }
      function genFx(type, includeWidth) {
        var which, i = 0, attrs = { height: type };
        includeWidth = includeWidth ? 1 : 0;
        for (; i < 4; i += 2 - includeWidth) {
          which = cssExpand[i];
          attrs["margin" + which] = attrs["padding" + which] = type;
        }
        if (includeWidth) {
          attrs.opacity = attrs.width = type;
        }
        return attrs;
      }
      function createTween(value, prop, animation) {
        var tween, collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]), index = 0, length = collection.length;
        for (; index < length; index++) {
          if (tween = collection[index].call(animation, prop, value)) {
            return tween;
          }
        }
      }
      function defaultPrefilter(elem, props, opts) {
        var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display, isBox = "width" in props || "height" in props, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHiddenWithinTree(elem), dataShow = dataPriv.get(elem, "fxshow");
        if (!opts.queue) {
          hooks = jQuery2._queueHooks(elem, "fx");
          if (hooks.unqueued == null) {
            hooks.unqueued = 0;
            oldfire = hooks.empty.fire;
            hooks.empty.fire = function() {
              if (!hooks.unqueued) {
                oldfire();
              }
            };
          }
          hooks.unqueued++;
          anim.always(function() {
            anim.always(function() {
              hooks.unqueued--;
              if (!jQuery2.queue(elem, "fx").length) {
                hooks.empty.fire();
              }
            });
          });
        }
        for (prop in props) {
          value = props[prop];
          if (rfxtypes.test(value)) {
            delete props[prop];
            toggle = toggle || value === "toggle";
            if (value === (hidden ? "hide" : "show")) {
              if (value === "show" && dataShow && dataShow[prop] !== void 0) {
                hidden = true;
              } else {
                continue;
              }
            }
            orig[prop] = dataShow && dataShow[prop] || jQuery2.style(elem, prop);
          }
        }
        propTween = !jQuery2.isEmptyObject(props);
        if (!propTween && jQuery2.isEmptyObject(orig)) {
          return;
        }
        if (isBox && elem.nodeType === 1) {
          opts.overflow = [style.overflow, style.overflowX, style.overflowY];
          restoreDisplay = dataShow && dataShow.display;
          if (restoreDisplay == null) {
            restoreDisplay = dataPriv.get(elem, "display");
          }
          display = jQuery2.css(elem, "display");
          if (display === "none") {
            if (restoreDisplay) {
              display = restoreDisplay;
            } else {
              showHide([elem], true);
              restoreDisplay = elem.style.display || restoreDisplay;
              display = jQuery2.css(elem, "display");
              showHide([elem]);
            }
          }
          if (display === "inline" || display === "inline-block" && restoreDisplay != null) {
            if (jQuery2.css(elem, "float") === "none") {
              if (!propTween) {
                anim.done(function() {
                  style.display = restoreDisplay;
                });
                if (restoreDisplay == null) {
                  display = style.display;
                  restoreDisplay = display === "none" ? "" : display;
                }
              }
              style.display = "inline-block";
            }
          }
        }
        if (opts.overflow) {
          style.overflow = "hidden";
          anim.always(function() {
            style.overflow = opts.overflow[0];
            style.overflowX = opts.overflow[1];
            style.overflowY = opts.overflow[2];
          });
        }
        propTween = false;
        for (prop in orig) {
          if (!propTween) {
            if (dataShow) {
              if ("hidden" in dataShow) {
                hidden = dataShow.hidden;
              }
            } else {
              dataShow = dataPriv.access(elem, "fxshow", { display: restoreDisplay });
            }
            if (toggle) {
              dataShow.hidden = !hidden;
            }
            if (hidden) {
              showHide([elem], true);
            }
            anim.done(function() {
              if (!hidden) {
                showHide([elem]);
              }
              dataPriv.remove(elem, "fxshow");
              for (prop in orig) {
                jQuery2.style(elem, prop, orig[prop]);
              }
            });
          }
          propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
          if (!(prop in dataShow)) {
            dataShow[prop] = propTween.start;
            if (hidden) {
              propTween.end = propTween.start;
              propTween.start = 0;
            }
          }
        }
      }
      function propFilter(props, specialEasing) {
        var index, name, easing, value, hooks;
        for (index in props) {
          name = camelCase(index);
          easing = specialEasing[name];
          value = props[index];
          if (Array.isArray(value)) {
            easing = value[1];
            value = props[index] = value[0];
          }
          if (index !== name) {
            props[name] = value;
            delete props[index];
          }
          hooks = jQuery2.cssHooks[name];
          if (hooks && "expand" in hooks) {
            value = hooks.expand(value);
            delete props[name];
            for (index in value) {
              if (!(index in props)) {
                props[index] = value[index];
                specialEasing[index] = easing;
              }
            }
          } else {
            specialEasing[name] = easing;
          }
        }
      }
      function Animation(elem, properties, options) {
        var result, stopped, index = 0, length = Animation.prefilters.length, deferred = jQuery2.Deferred().always(function() {
          delete tick.elem;
        }), tick = function() {
          if (stopped) {
            return false;
          }
          var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index2 = 0, length2 = animation.tweens.length;
          for (; index2 < length2; index2++) {
            animation.tweens[index2].run(percent);
          }
          deferred.notifyWith(elem, [animation, percent, remaining]);
          if (percent < 1 && length2) {
            return remaining;
          }
          if (!length2) {
            deferred.notifyWith(elem, [animation, 1, 0]);
          }
          deferred.resolveWith(elem, [animation]);
          return false;
        }, animation = deferred.promise({
          elem,
          props: jQuery2.extend({}, properties),
          opts: jQuery2.extend(true, {
            specialEasing: {},
            easing: jQuery2.easing._default
          }, options),
          originalProperties: properties,
          originalOptions: options,
          startTime: fxNow || createFxNow(),
          duration: options.duration,
          tweens: [],
          createTween: function(prop, end) {
            var tween = jQuery2.Tween(
              elem,
              animation.opts,
              prop,
              end,
              animation.opts.specialEasing[prop] || animation.opts.easing
            );
            animation.tweens.push(tween);
            return tween;
          },
          stop: function(gotoEnd) {
            var index2 = 0, length2 = gotoEnd ? animation.tweens.length : 0;
            if (stopped) {
              return this;
            }
            stopped = true;
            for (; index2 < length2; index2++) {
              animation.tweens[index2].run(1);
            }
            if (gotoEnd) {
              deferred.notifyWith(elem, [animation, 1, 0]);
              deferred.resolveWith(elem, [animation, gotoEnd]);
            } else {
              deferred.rejectWith(elem, [animation, gotoEnd]);
            }
            return this;
          }
        }), props = animation.props;
        propFilter(props, animation.opts.specialEasing);
        for (; index < length; index++) {
          result = Animation.prefilters[index].call(animation, elem, props, animation.opts);
          if (result) {
            if (isFunction(result.stop)) {
              jQuery2._queueHooks(animation.elem, animation.opts.queue).stop = result.stop.bind(result);
            }
            return result;
          }
        }
        jQuery2.map(props, createTween, animation);
        if (isFunction(animation.opts.start)) {
          animation.opts.start.call(elem, animation);
        }
        animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
        jQuery2.fx.timer(
          jQuery2.extend(tick, {
            elem,
            anim: animation,
            queue: animation.opts.queue
          })
        );
        return animation;
      }
      jQuery2.Animation = jQuery2.extend(Animation, {
        tweeners: {
          "*": [function(prop, value) {
            var tween = this.createTween(prop, value);
            adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
            return tween;
          }]
        },
        tweener: function(props, callback) {
          if (isFunction(props)) {
            callback = props;
            props = ["*"];
          } else {
            props = props.match(rnothtmlwhite);
          }
          var prop, index = 0, length = props.length;
          for (; index < length; index++) {
            prop = props[index];
            Animation.tweeners[prop] = Animation.tweeners[prop] || [];
            Animation.tweeners[prop].unshift(callback);
          }
        },
        prefilters: [defaultPrefilter],
        prefilter: function(callback, prepend) {
          if (prepend) {
            Animation.prefilters.unshift(callback);
          } else {
            Animation.prefilters.push(callback);
          }
        }
      });
      jQuery2.speed = function(speed, easing, fn) {
        var opt = speed && typeof speed === "object" ? jQuery2.extend({}, speed) : {
          complete: fn || !fn && easing || isFunction(speed) && speed,
          duration: speed,
          easing: fn && easing || easing && !isFunction(easing) && easing
        };
        if (jQuery2.fx.off) {
          opt.duration = 0;
        } else {
          if (typeof opt.duration !== "number") {
            if (opt.duration in jQuery2.fx.speeds) {
              opt.duration = jQuery2.fx.speeds[opt.duration];
            } else {
              opt.duration = jQuery2.fx.speeds._default;
            }
          }
        }
        if (opt.queue == null || opt.queue === true) {
          opt.queue = "fx";
        }
        opt.old = opt.complete;
        opt.complete = function() {
          if (isFunction(opt.old)) {
            opt.old.call(this);
          }
          if (opt.queue) {
            jQuery2.dequeue(this, opt.queue);
          }
        };
        return opt;
      };
      jQuery2.fn.extend({
        fadeTo: function(speed, to, easing, callback) {
          return this.filter(isHiddenWithinTree).css("opacity", 0).show().end().animate({ opacity: to }, speed, easing, callback);
        },
        animate: function(prop, speed, easing, callback) {
          var empty = jQuery2.isEmptyObject(prop), optall = jQuery2.speed(speed, easing, callback), doAnimation = function() {
            var anim = Animation(this, jQuery2.extend({}, prop), optall);
            if (empty || dataPriv.get(this, "finish")) {
              anim.stop(true);
            }
          };
          doAnimation.finish = doAnimation;
          return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
        },
        stop: function(type, clearQueue, gotoEnd) {
          var stopQueue = function(hooks) {
            var stop = hooks.stop;
            delete hooks.stop;
            stop(gotoEnd);
          };
          if (typeof type !== "string") {
            gotoEnd = clearQueue;
            clearQueue = type;
            type = void 0;
          }
          if (clearQueue) {
            this.queue(type || "fx", []);
          }
          return this.each(function() {
            var dequeue = true, index = type != null && type + "queueHooks", timers = jQuery2.timers, data = dataPriv.get(this);
            if (index) {
              if (data[index] && data[index].stop) {
                stopQueue(data[index]);
              }
            } else {
              for (index in data) {
                if (data[index] && data[index].stop && rrun.test(index)) {
                  stopQueue(data[index]);
                }
              }
            }
            for (index = timers.length; index--; ) {
              if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                timers[index].anim.stop(gotoEnd);
                dequeue = false;
                timers.splice(index, 1);
              }
            }
            if (dequeue || !gotoEnd) {
              jQuery2.dequeue(this, type);
            }
          });
        },
        finish: function(type) {
          if (type !== false) {
            type = type || "fx";
          }
          return this.each(function() {
            var index, data = dataPriv.get(this), queue = data[type + "queue"], hooks = data[type + "queueHooks"], timers = jQuery2.timers, length = queue ? queue.length : 0;
            data.finish = true;
            jQuery2.queue(this, type, []);
            if (hooks && hooks.stop) {
              hooks.stop.call(this, true);
            }
            for (index = timers.length; index--; ) {
              if (timers[index].elem === this && timers[index].queue === type) {
                timers[index].anim.stop(true);
                timers.splice(index, 1);
              }
            }
            for (index = 0; index < length; index++) {
              if (queue[index] && queue[index].finish) {
                queue[index].finish.call(this);
              }
            }
            delete data.finish;
          });
        }
      });
      jQuery2.each(["toggle", "show", "hide"], function(_i, name) {
        var cssFn = jQuery2.fn[name];
        jQuery2.fn[name] = function(speed, easing, callback) {
          return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
        };
      });
      jQuery2.each({
        slideDown: genFx("show"),
        slideUp: genFx("hide"),
        slideToggle: genFx("toggle"),
        fadeIn: { opacity: "show" },
        fadeOut: { opacity: "hide" },
        fadeToggle: { opacity: "toggle" }
      }, function(name, props) {
        jQuery2.fn[name] = function(speed, easing, callback) {
          return this.animate(props, speed, easing, callback);
        };
      });
      jQuery2.timers = [];
      jQuery2.fx.tick = function() {
        var timer, i = 0, timers = jQuery2.timers;
        fxNow = Date.now();
        for (; i < timers.length; i++) {
          timer = timers[i];
          if (!timer() && timers[i] === timer) {
            timers.splice(i--, 1);
          }
        }
        if (!timers.length) {
          jQuery2.fx.stop();
        }
        fxNow = void 0;
      };
      jQuery2.fx.timer = function(timer) {
        jQuery2.timers.push(timer);
        jQuery2.fx.start();
      };
      jQuery2.fx.interval = 13;
      jQuery2.fx.start = function() {
        if (inProgress) {
          return;
        }
        inProgress = true;
        schedule();
      };
      jQuery2.fx.stop = function() {
        inProgress = null;
      };
      jQuery2.fx.speeds = {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
      };
      jQuery2.fn.delay = function(time, type) {
        time = jQuery2.fx ? jQuery2.fx.speeds[time] || time : time;
        type = type || "fx";
        return this.queue(type, function(next, hooks) {
          var timeout = window2.setTimeout(next, time);
          hooks.stop = function() {
            window2.clearTimeout(timeout);
          };
        });
      };
      (function() {
        var input = document2.createElement("input"), select = document2.createElement("select"), opt = select.appendChild(document2.createElement("option"));
        input.type = "checkbox";
        support.checkOn = input.value !== "";
        support.optSelected = opt.selected;
        input = document2.createElement("input");
        input.value = "t";
        input.type = "radio";
        support.radioValue = input.value === "t";
      })();
      var boolHook, attrHandle = jQuery2.expr.attrHandle;
      jQuery2.fn.extend({
        attr: function(name, value) {
          return access(this, jQuery2.attr, name, value, arguments.length > 1);
        },
        removeAttr: function(name) {
          return this.each(function() {
            jQuery2.removeAttr(this, name);
          });
        }
      });
      jQuery2.extend({
        attr: function(elem, name, value) {
          var ret, hooks, nType = elem.nodeType;
          if (nType === 3 || nType === 8 || nType === 2) {
            return;
          }
          if (typeof elem.getAttribute === "undefined") {
            return jQuery2.prop(elem, name, value);
          }
          if (nType !== 1 || !jQuery2.isXMLDoc(elem)) {
            hooks = jQuery2.attrHooks[name.toLowerCase()] || (jQuery2.expr.match.bool.test(name) ? boolHook : void 0);
          }
          if (value !== void 0) {
            if (value === null) {
              jQuery2.removeAttr(elem, name);
              return;
            }
            if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
              return ret;
            }
            elem.setAttribute(name, value + "");
            return value;
          }
          if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
            return ret;
          }
          ret = jQuery2.find.attr(elem, name);
          return ret == null ? void 0 : ret;
        },
        attrHooks: {
          type: {
            set: function(elem, value) {
              if (!support.radioValue && value === "radio" && nodeName(elem, "input")) {
                var val = elem.value;
                elem.setAttribute("type", value);
                if (val) {
                  elem.value = val;
                }
                return value;
              }
            }
          }
        },
        removeAttr: function(elem, value) {
          var name, i = 0, attrNames = value && value.match(rnothtmlwhite);
          if (attrNames && elem.nodeType === 1) {
            while (name = attrNames[i++]) {
              elem.removeAttribute(name);
            }
          }
        }
      });
      boolHook = {
        set: function(elem, value, name) {
          if (value === false) {
            jQuery2.removeAttr(elem, name);
          } else {
            elem.setAttribute(name, name);
          }
          return name;
        }
      };
      jQuery2.each(jQuery2.expr.match.bool.source.match(/\w+/g), function(_i, name) {
        var getter = attrHandle[name] || jQuery2.find.attr;
        attrHandle[name] = function(elem, name2, isXML) {
          var ret, handle, lowercaseName = name2.toLowerCase();
          if (!isXML) {
            handle = attrHandle[lowercaseName];
            attrHandle[lowercaseName] = ret;
            ret = getter(elem, name2, isXML) != null ? lowercaseName : null;
            attrHandle[lowercaseName] = handle;
          }
          return ret;
        };
      });
      var rfocusable = /^(?:input|select|textarea|button)$/i, rclickable = /^(?:a|area)$/i;
      jQuery2.fn.extend({
        prop: function(name, value) {
          return access(this, jQuery2.prop, name, value, arguments.length > 1);
        },
        removeProp: function(name) {
          return this.each(function() {
            delete this[jQuery2.propFix[name] || name];
          });
        }
      });
      jQuery2.extend({
        prop: function(elem, name, value) {
          var ret, hooks, nType = elem.nodeType;
          if (nType === 3 || nType === 8 || nType === 2) {
            return;
          }
          if (nType !== 1 || !jQuery2.isXMLDoc(elem)) {
            name = jQuery2.propFix[name] || name;
            hooks = jQuery2.propHooks[name];
          }
          if (value !== void 0) {
            if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
              return ret;
            }
            return elem[name] = value;
          }
          if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
            return ret;
          }
          return elem[name];
        },
        propHooks: {
          tabIndex: {
            get: function(elem) {
              var tabindex = jQuery2.find.attr(elem, "tabindex");
              if (tabindex) {
                return parseInt(tabindex, 10);
              }
              if (rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href) {
                return 0;
              }
              return -1;
            }
          }
        },
        propFix: {
          "for": "htmlFor",
          "class": "className"
        }
      });
      if (!support.optSelected) {
        jQuery2.propHooks.selected = {
          get: function(elem) {
            var parent = elem.parentNode;
            if (parent && parent.parentNode) {
              parent.parentNode.selectedIndex;
            }
            return null;
          },
          set: function(elem) {
            var parent = elem.parentNode;
            if (parent) {
              parent.selectedIndex;
              if (parent.parentNode) {
                parent.parentNode.selectedIndex;
              }
            }
          }
        };
      }
      jQuery2.each([
        "tabIndex",
        "readOnly",
        "maxLength",
        "cellSpacing",
        "cellPadding",
        "rowSpan",
        "colSpan",
        "useMap",
        "frameBorder",
        "contentEditable"
      ], function() {
        jQuery2.propFix[this.toLowerCase()] = this;
      });
      function stripAndCollapse(value) {
        var tokens = value.match(rnothtmlwhite) || [];
        return tokens.join(" ");
      }
      function getClass(elem) {
        return elem.getAttribute && elem.getAttribute("class") || "";
      }
      function classesToArray(value) {
        if (Array.isArray(value)) {
          return value;
        }
        if (typeof value === "string") {
          return value.match(rnothtmlwhite) || [];
        }
        return [];
      }
      jQuery2.fn.extend({
        addClass: function(value) {
          var classNames, cur, curValue, className, i, finalValue;
          if (isFunction(value)) {
            return this.each(function(j) {
              jQuery2(this).addClass(value.call(this, j, getClass(this)));
            });
          }
          classNames = classesToArray(value);
          if (classNames.length) {
            return this.each(function() {
              curValue = getClass(this);
              cur = this.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
              if (cur) {
                for (i = 0; i < classNames.length; i++) {
                  className = classNames[i];
                  if (cur.indexOf(" " + className + " ") < 0) {
                    cur += className + " ";
                  }
                }
                finalValue = stripAndCollapse(cur);
                if (curValue !== finalValue) {
                  this.setAttribute("class", finalValue);
                }
              }
            });
          }
          return this;
        },
        removeClass: function(value) {
          var classNames, cur, curValue, className, i, finalValue;
          if (isFunction(value)) {
            return this.each(function(j) {
              jQuery2(this).removeClass(value.call(this, j, getClass(this)));
            });
          }
          if (!arguments.length) {
            return this.attr("class", "");
          }
          classNames = classesToArray(value);
          if (classNames.length) {
            return this.each(function() {
              curValue = getClass(this);
              cur = this.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
              if (cur) {
                for (i = 0; i < classNames.length; i++) {
                  className = classNames[i];
                  while (cur.indexOf(" " + className + " ") > -1) {
                    cur = cur.replace(" " + className + " ", " ");
                  }
                }
                finalValue = stripAndCollapse(cur);
                if (curValue !== finalValue) {
                  this.setAttribute("class", finalValue);
                }
              }
            });
          }
          return this;
        },
        toggleClass: function(value, stateVal) {
          var classNames, className, i, self2, type = typeof value, isValidValue = type === "string" || Array.isArray(value);
          if (isFunction(value)) {
            return this.each(function(i2) {
              jQuery2(this).toggleClass(
                value.call(this, i2, getClass(this), stateVal),
                stateVal
              );
            });
          }
          if (typeof stateVal === "boolean" && isValidValue) {
            return stateVal ? this.addClass(value) : this.removeClass(value);
          }
          classNames = classesToArray(value);
          return this.each(function() {
            if (isValidValue) {
              self2 = jQuery2(this);
              for (i = 0; i < classNames.length; i++) {
                className = classNames[i];
                if (self2.hasClass(className)) {
                  self2.removeClass(className);
                } else {
                  self2.addClass(className);
                }
              }
            } else if (value === void 0 || type === "boolean") {
              className = getClass(this);
              if (className) {
                dataPriv.set(this, "__className__", className);
              }
              if (this.setAttribute) {
                this.setAttribute(
                  "class",
                  className || value === false ? "" : dataPriv.get(this, "__className__") || ""
                );
              }
            }
          });
        },
        hasClass: function(selector) {
          var className, elem, i = 0;
          className = " " + selector + " ";
          while (elem = this[i++]) {
            if (elem.nodeType === 1 && (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) {
              return true;
            }
          }
          return false;
        }
      });
      var rreturn = /\r/g;
      jQuery2.fn.extend({
        val: function(value) {
          var hooks, ret, valueIsFunction, elem = this[0];
          if (!arguments.length) {
            if (elem) {
              hooks = jQuery2.valHooks[elem.type] || jQuery2.valHooks[elem.nodeName.toLowerCase()];
              if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== void 0) {
                return ret;
              }
              ret = elem.value;
              if (typeof ret === "string") {
                return ret.replace(rreturn, "");
              }
              return ret == null ? "" : ret;
            }
            return;
          }
          valueIsFunction = isFunction(value);
          return this.each(function(i) {
            var val;
            if (this.nodeType !== 1) {
              return;
            }
            if (valueIsFunction) {
              val = value.call(this, i, jQuery2(this).val());
            } else {
              val = value;
            }
            if (val == null) {
              val = "";
            } else if (typeof val === "number") {
              val += "";
            } else if (Array.isArray(val)) {
              val = jQuery2.map(val, function(value2) {
                return value2 == null ? "" : value2 + "";
              });
            }
            hooks = jQuery2.valHooks[this.type] || jQuery2.valHooks[this.nodeName.toLowerCase()];
            if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === void 0) {
              this.value = val;
            }
          });
        }
      });
      jQuery2.extend({
        valHooks: {
          option: {
            get: function(elem) {
              var val = jQuery2.find.attr(elem, "value");
              return val != null ? val : (
                // Support: IE <=10 - 11 only
                // option.text throws exceptions (trac-14686, trac-14858)
                // Strip and collapse whitespace
                // https://html.spec.whatwg.org/#strip-and-collapse-whitespace
                stripAndCollapse(jQuery2.text(elem))
              );
            }
          },
          select: {
            get: function(elem) {
              var value, option, i, options = elem.options, index = elem.selectedIndex, one = elem.type === "select-one", values = one ? null : [], max = one ? index + 1 : options.length;
              if (index < 0) {
                i = max;
              } else {
                i = one ? index : 0;
              }
              for (; i < max; i++) {
                option = options[i];
                if ((option.selected || i === index) && // Don't return options that are disabled or in a disabled optgroup
                !option.disabled && (!option.parentNode.disabled || !nodeName(option.parentNode, "optgroup"))) {
                  value = jQuery2(option).val();
                  if (one) {
                    return value;
                  }
                  values.push(value);
                }
              }
              return values;
            },
            set: function(elem, value) {
              var optionSet, option, options = elem.options, values = jQuery2.makeArray(value), i = options.length;
              while (i--) {
                option = options[i];
                if (option.selected = jQuery2.inArray(jQuery2.valHooks.option.get(option), values) > -1) {
                  optionSet = true;
                }
              }
              if (!optionSet) {
                elem.selectedIndex = -1;
              }
              return values;
            }
          }
        }
      });
      jQuery2.each(["radio", "checkbox"], function() {
        jQuery2.valHooks[this] = {
          set: function(elem, value) {
            if (Array.isArray(value)) {
              return elem.checked = jQuery2.inArray(jQuery2(elem).val(), value) > -1;
            }
          }
        };
        if (!support.checkOn) {
          jQuery2.valHooks[this].get = function(elem) {
            return elem.getAttribute("value") === null ? "on" : elem.value;
          };
        }
      });
      var location2 = window2.location;
      var nonce2 = { guid: Date.now() };
      var rquery = /\?/;
      jQuery2.parseXML = function(data) {
        var xml, parserErrorElem;
        if (!data || typeof data !== "string") {
          return null;
        }
        try {
          xml = new window2.DOMParser().parseFromString(data, "text/xml");
        } catch (e) {
        }
        parserErrorElem = xml && xml.getElementsByTagName("parsererror")[0];
        if (!xml || parserErrorElem) {
          jQuery2.error("Invalid XML: " + (parserErrorElem ? jQuery2.map(parserErrorElem.childNodes, function(el) {
            return el.textContent;
          }).join("\n") : data));
        }
        return xml;
      };
      var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, stopPropagationCallback = function(e) {
        e.stopPropagation();
      };
      jQuery2.extend(jQuery2.event, {
        trigger: function(event, data, elem, onlyHandlers) {
          var i, cur, tmp, bubbleType, ontype, handle, special, lastElement, eventPath = [elem || document2], type = hasOwn.call(event, "type") ? event.type : event, namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
          cur = lastElement = tmp = elem = elem || document2;
          if (elem.nodeType === 3 || elem.nodeType === 8) {
            return;
          }
          if (rfocusMorph.test(type + jQuery2.event.triggered)) {
            return;
          }
          if (type.indexOf(".") > -1) {
            namespaces = type.split(".");
            type = namespaces.shift();
            namespaces.sort();
          }
          ontype = type.indexOf(":") < 0 && "on" + type;
          event = event[jQuery2.expando] ? event : new jQuery2.Event(type, typeof event === "object" && event);
          event.isTrigger = onlyHandlers ? 2 : 3;
          event.namespace = namespaces.join(".");
          event.rnamespace = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
          event.result = void 0;
          if (!event.target) {
            event.target = elem;
          }
          data = data == null ? [event] : jQuery2.makeArray(data, [event]);
          special = jQuery2.event.special[type] || {};
          if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
            return;
          }
          if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
            bubbleType = special.delegateType || type;
            if (!rfocusMorph.test(bubbleType + type)) {
              cur = cur.parentNode;
            }
            for (; cur; cur = cur.parentNode) {
              eventPath.push(cur);
              tmp = cur;
            }
            if (tmp === (elem.ownerDocument || document2)) {
              eventPath.push(tmp.defaultView || tmp.parentWindow || window2);
            }
          }
          i = 0;
          while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
            lastElement = cur;
            event.type = i > 1 ? bubbleType : special.bindType || type;
            handle = (dataPriv.get(cur, "events") || /* @__PURE__ */ Object.create(null))[event.type] && dataPriv.get(cur, "handle");
            if (handle) {
              handle.apply(cur, data);
            }
            handle = ontype && cur[ontype];
            if (handle && handle.apply && acceptData(cur)) {
              event.result = handle.apply(cur, data);
              if (event.result === false) {
                event.preventDefault();
              }
            }
          }
          event.type = type;
          if (!onlyHandlers && !event.isDefaultPrevented()) {
            if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && acceptData(elem)) {
              if (ontype && isFunction(elem[type]) && !isWindow(elem)) {
                tmp = elem[ontype];
                if (tmp) {
                  elem[ontype] = null;
                }
                jQuery2.event.triggered = type;
                if (event.isPropagationStopped()) {
                  lastElement.addEventListener(type, stopPropagationCallback);
                }
                elem[type]();
                if (event.isPropagationStopped()) {
                  lastElement.removeEventListener(type, stopPropagationCallback);
                }
                jQuery2.event.triggered = void 0;
                if (tmp) {
                  elem[ontype] = tmp;
                }
              }
            }
          }
          return event.result;
        },
        // Piggyback on a donor event to simulate a different one
        // Used only for `focus(in | out)` events
        simulate: function(type, elem, event) {
          var e = jQuery2.extend(
            new jQuery2.Event(),
            event,
            {
              type,
              isSimulated: true
            }
          );
          jQuery2.event.trigger(e, null, elem);
        }
      });
      jQuery2.fn.extend({
        trigger: function(type, data) {
          return this.each(function() {
            jQuery2.event.trigger(type, data, this);
          });
        },
        triggerHandler: function(type, data) {
          var elem = this[0];
          if (elem) {
            return jQuery2.event.trigger(type, data, elem, true);
          }
        }
      });
      var rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
      function buildParams(prefix, obj, traditional, add2) {
        var name;
        if (Array.isArray(obj)) {
          jQuery2.each(obj, function(i, v) {
            if (traditional || rbracket.test(prefix)) {
              add2(prefix, v);
            } else {
              buildParams(
                prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]",
                v,
                traditional,
                add2
              );
            }
          });
        } else if (!traditional && toType(obj) === "object") {
          for (name in obj) {
            buildParams(prefix + "[" + name + "]", obj[name], traditional, add2);
          }
        } else {
          add2(prefix, obj);
        }
      }
      jQuery2.param = function(a, traditional) {
        var prefix, s = [], add2 = function(key, valueOrFunction) {
          var value = isFunction(valueOrFunction) ? valueOrFunction() : valueOrFunction;
          s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value == null ? "" : value);
        };
        if (a == null) {
          return "";
        }
        if (Array.isArray(a) || a.jquery && !jQuery2.isPlainObject(a)) {
          jQuery2.each(a, function() {
            add2(this.name, this.value);
          });
        } else {
          for (prefix in a) {
            buildParams(prefix, a[prefix], traditional, add2);
          }
        }
        return s.join("&");
      };
      jQuery2.fn.extend({
        serialize: function() {
          return jQuery2.param(this.serializeArray());
        },
        serializeArray: function() {
          return this.map(function() {
            var elements = jQuery2.prop(this, "elements");
            return elements ? jQuery2.makeArray(elements) : this;
          }).filter(function() {
            var type = this.type;
            return this.name && !jQuery2(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
          }).map(function(_i, elem) {
            var val = jQuery2(this).val();
            if (val == null) {
              return null;
            }
            if (Array.isArray(val)) {
              return jQuery2.map(val, function(val2) {
                return { name: elem.name, value: val2.replace(rCRLF, "\r\n") };
              });
            }
            return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
          }).get();
        }
      });
      var r20 = /%20/g, rhash = /#.*$/, rantiCache = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, prefilters = {}, transports = {}, allTypes = "*/".concat("*"), originAnchor = document2.createElement("a");
      originAnchor.href = location2.href;
      function addToPrefiltersOrTransports(structure) {
        return function(dataTypeExpression, func) {
          if (typeof dataTypeExpression !== "string") {
            func = dataTypeExpression;
            dataTypeExpression = "*";
          }
          var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];
          if (isFunction(func)) {
            while (dataType = dataTypes[i++]) {
              if (dataType[0] === "+") {
                dataType = dataType.slice(1) || "*";
                (structure[dataType] = structure[dataType] || []).unshift(func);
              } else {
                (structure[dataType] = structure[dataType] || []).push(func);
              }
            }
          }
        };
      }
      function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
        var inspected = {}, seekingTransport = structure === transports;
        function inspect(dataType) {
          var selected;
          inspected[dataType] = true;
          jQuery2.each(structure[dataType] || [], function(_, prefilterOrFactory) {
            var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
            if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
              options.dataTypes.unshift(dataTypeOrTransport);
              inspect(dataTypeOrTransport);
              return false;
            } else if (seekingTransport) {
              return !(selected = dataTypeOrTransport);
            }
          });
          return selected;
        }
        return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
      }
      function ajaxExtend(target, src) {
        var key, deep, flatOptions = jQuery2.ajaxSettings.flatOptions || {};
        for (key in src) {
          if (src[key] !== void 0) {
            (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
          }
        }
        if (deep) {
          jQuery2.extend(true, target, deep);
        }
        return target;
      }
      function ajaxHandleResponses(s, jqXHR, responses) {
        var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
        while (dataTypes[0] === "*") {
          dataTypes.shift();
          if (ct === void 0) {
            ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
          }
        }
        if (ct) {
          for (type in contents) {
            if (contents[type] && contents[type].test(ct)) {
              dataTypes.unshift(type);
              break;
            }
          }
        }
        if (dataTypes[0] in responses) {
          finalDataType = dataTypes[0];
        } else {
          for (type in responses) {
            if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
              finalDataType = type;
              break;
            }
            if (!firstDataType) {
              firstDataType = type;
            }
          }
          finalDataType = finalDataType || firstDataType;
        }
        if (finalDataType) {
          if (finalDataType !== dataTypes[0]) {
            dataTypes.unshift(finalDataType);
          }
          return responses[finalDataType];
        }
      }
      function ajaxConvert(s, response, jqXHR, isSuccess) {
        var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
        if (dataTypes[1]) {
          for (conv in s.converters) {
            converters[conv.toLowerCase()] = s.converters[conv];
          }
        }
        current = dataTypes.shift();
        while (current) {
          if (s.responseFields[current]) {
            jqXHR[s.responseFields[current]] = response;
          }
          if (!prev && isSuccess && s.dataFilter) {
            response = s.dataFilter(response, s.dataType);
          }
          prev = current;
          current = dataTypes.shift();
          if (current) {
            if (current === "*") {
              current = prev;
            } else if (prev !== "*" && prev !== current) {
              conv = converters[prev + " " + current] || converters["* " + current];
              if (!conv) {
                for (conv2 in converters) {
                  tmp = conv2.split(" ");
                  if (tmp[1] === current) {
                    conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                    if (conv) {
                      if (conv === true) {
                        conv = converters[conv2];
                      } else if (converters[conv2] !== true) {
                        current = tmp[0];
                        dataTypes.unshift(tmp[1]);
                      }
                      break;
                    }
                  }
                }
              }
              if (conv !== true) {
                if (conv && s.throws) {
                  response = conv(response);
                } else {
                  try {
                    response = conv(response);
                  } catch (e) {
                    return {
                      state: "parsererror",
                      error: conv ? e : "No conversion from " + prev + " to " + current
                    };
                  }
                }
              }
            }
          }
        }
        return { state: "success", data: response };
      }
      jQuery2.extend({
        // Counter for holding the number of active queries
        active: 0,
        // Last-Modified header cache for next request
        lastModified: {},
        etag: {},
        ajaxSettings: {
          url: location2.href,
          type: "GET",
          isLocal: rlocalProtocol.test(location2.protocol),
          global: true,
          processData: true,
          async: true,
          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
          /*
          timeout: 0,
          data: null,
          dataType: null,
          username: null,
          password: null,
          cache: null,
          throws: false,
          traditional: false,
          headers: {},
          */
          accepts: {
            "*": allTypes,
            text: "text/plain",
            html: "text/html",
            xml: "application/xml, text/xml",
            json: "application/json, text/javascript"
          },
          contents: {
            xml: /\bxml\b/,
            html: /\bhtml/,
            json: /\bjson\b/
          },
          responseFields: {
            xml: "responseXML",
            text: "responseText",
            json: "responseJSON"
          },
          // Data converters
          // Keys separate source (or catchall "*") and destination types with a single space
          converters: {
            // Convert anything to text
            "* text": String,
            // Text to html (true = no transformation)
            "text html": true,
            // Evaluate text as a json expression
            "text json": JSON.parse,
            // Parse text as xml
            "text xml": jQuery2.parseXML
          },
          // For options that shouldn't be deep extended:
          // you can add your own custom options here if
          // and when you create one that shouldn't be
          // deep extended (see ajaxExtend)
          flatOptions: {
            url: true,
            context: true
          }
        },
        // Creates a full fledged settings object into target
        // with both ajaxSettings and settings fields.
        // If target is omitted, writes into ajaxSettings.
        ajaxSetup: function(target, settings) {
          return settings ? (
            // Building a settings object
            ajaxExtend(ajaxExtend(target, jQuery2.ajaxSettings), settings)
          ) : (
            // Extending ajaxSettings
            ajaxExtend(jQuery2.ajaxSettings, target)
          );
        },
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
        ajaxTransport: addToPrefiltersOrTransports(transports),
        // Main method
        ajax: function(url, options) {
          if (typeof url === "object") {
            options = url;
            url = void 0;
          }
          options = options || {};
          var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, urlAnchor, completed2, fireGlobals, i, uncached, s = jQuery2.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery2(callbackContext) : jQuery2.event, deferred = jQuery2.Deferred(), completeDeferred = jQuery2.Callbacks("once memory"), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, strAbort = "canceled", jqXHR = {
            readyState: 0,
            // Builds headers hashtable if needed
            getResponseHeader: function(key) {
              var match;
              if (completed2) {
                if (!responseHeaders) {
                  responseHeaders = {};
                  while (match = rheaders.exec(responseHeadersString)) {
                    responseHeaders[match[1].toLowerCase() + " "] = (responseHeaders[match[1].toLowerCase() + " "] || []).concat(match[2]);
                  }
                }
                match = responseHeaders[key.toLowerCase() + " "];
              }
              return match == null ? null : match.join(", ");
            },
            // Raw string
            getAllResponseHeaders: function() {
              return completed2 ? responseHeadersString : null;
            },
            // Caches the header
            setRequestHeader: function(name, value) {
              if (completed2 == null) {
                name = requestHeadersNames[name.toLowerCase()] = requestHeadersNames[name.toLowerCase()] || name;
                requestHeaders[name] = value;
              }
              return this;
            },
            // Overrides response content-type header
            overrideMimeType: function(type) {
              if (completed2 == null) {
                s.mimeType = type;
              }
              return this;
            },
            // Status-dependent callbacks
            statusCode: function(map) {
              var code;
              if (map) {
                if (completed2) {
                  jqXHR.always(map[jqXHR.status]);
                } else {
                  for (code in map) {
                    statusCode[code] = [statusCode[code], map[code]];
                  }
                }
              }
              return this;
            },
            // Cancel the request
            abort: function(statusText) {
              var finalText = statusText || strAbort;
              if (transport) {
                transport.abort(finalText);
              }
              done(0, finalText);
              return this;
            }
          };
          deferred.promise(jqXHR);
          s.url = ((url || s.url || location2.href) + "").replace(rprotocol, location2.protocol + "//");
          s.type = options.method || options.type || s.method || s.type;
          s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];
          if (s.crossDomain == null) {
            urlAnchor = document2.createElement("a");
            try {
              urlAnchor.href = s.url;
              urlAnchor.href = urlAnchor.href;
              s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host;
            } catch (e) {
              s.crossDomain = true;
            }
          }
          if (s.data && s.processData && typeof s.data !== "string") {
            s.data = jQuery2.param(s.data, s.traditional);
          }
          inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
          if (completed2) {
            return jqXHR;
          }
          fireGlobals = jQuery2.event && s.global;
          if (fireGlobals && jQuery2.active++ === 0) {
            jQuery2.event.trigger("ajaxStart");
          }
          s.type = s.type.toUpperCase();
          s.hasContent = !rnoContent.test(s.type);
          cacheURL = s.url.replace(rhash, "");
          if (!s.hasContent) {
            uncached = s.url.slice(cacheURL.length);
            if (s.data && (s.processData || typeof s.data === "string")) {
              cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;
              delete s.data;
            }
            if (s.cache === false) {
              cacheURL = cacheURL.replace(rantiCache, "$1");
              uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce2.guid++ + uncached;
            }
            s.url = cacheURL + uncached;
          } else if (s.data && s.processData && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
            s.data = s.data.replace(r20, "+");
          }
          if (s.ifModified) {
            if (jQuery2.lastModified[cacheURL]) {
              jqXHR.setRequestHeader("If-Modified-Since", jQuery2.lastModified[cacheURL]);
            }
            if (jQuery2.etag[cacheURL]) {
              jqXHR.setRequestHeader("If-None-Match", jQuery2.etag[cacheURL]);
            }
          }
          if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
            jqXHR.setRequestHeader("Content-Type", s.contentType);
          }
          jqXHR.setRequestHeader(
            "Accept",
            s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]
          );
          for (i in s.headers) {
            jqXHR.setRequestHeader(i, s.headers[i]);
          }
          if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed2)) {
            return jqXHR.abort();
          }
          strAbort = "abort";
          completeDeferred.add(s.complete);
          jqXHR.done(s.success);
          jqXHR.fail(s.error);
          transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
          if (!transport) {
            done(-1, "No Transport");
          } else {
            jqXHR.readyState = 1;
            if (fireGlobals) {
              globalEventContext.trigger("ajaxSend", [jqXHR, s]);
            }
            if (completed2) {
              return jqXHR;
            }
            if (s.async && s.timeout > 0) {
              timeoutTimer = window2.setTimeout(function() {
                jqXHR.abort("timeout");
              }, s.timeout);
            }
            try {
              completed2 = false;
              transport.send(requestHeaders, done);
            } catch (e) {
              if (completed2) {
                throw e;
              }
              done(-1, e);
            }
          }
          function done(status, nativeStatusText, responses, headers) {
            var isSuccess, success, error2, response, modified, statusText = nativeStatusText;
            if (completed2) {
              return;
            }
            completed2 = true;
            if (timeoutTimer) {
              window2.clearTimeout(timeoutTimer);
            }
            transport = void 0;
            responseHeadersString = headers || "";
            jqXHR.readyState = status > 0 ? 4 : 0;
            isSuccess = status >= 200 && status < 300 || status === 304;
            if (responses) {
              response = ajaxHandleResponses(s, jqXHR, responses);
            }
            if (!isSuccess && jQuery2.inArray("script", s.dataTypes) > -1 && jQuery2.inArray("json", s.dataTypes) < 0) {
              s.converters["text script"] = function() {
              };
            }
            response = ajaxConvert(s, response, jqXHR, isSuccess);
            if (isSuccess) {
              if (s.ifModified) {
                modified = jqXHR.getResponseHeader("Last-Modified");
                if (modified) {
                  jQuery2.lastModified[cacheURL] = modified;
                }
                modified = jqXHR.getResponseHeader("etag");
                if (modified) {
                  jQuery2.etag[cacheURL] = modified;
                }
              }
              if (status === 204 || s.type === "HEAD") {
                statusText = "nocontent";
              } else if (status === 304) {
                statusText = "notmodified";
              } else {
                statusText = response.state;
                success = response.data;
                error2 = response.error;
                isSuccess = !error2;
              }
            } else {
              error2 = statusText;
              if (status || !statusText) {
                statusText = "error";
                if (status < 0) {
                  status = 0;
                }
              }
            }
            jqXHR.status = status;
            jqXHR.statusText = (nativeStatusText || statusText) + "";
            if (isSuccess) {
              deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
            } else {
              deferred.rejectWith(callbackContext, [jqXHR, statusText, error2]);
            }
            jqXHR.statusCode(statusCode);
            statusCode = void 0;
            if (fireGlobals) {
              globalEventContext.trigger(
                isSuccess ? "ajaxSuccess" : "ajaxError",
                [jqXHR, s, isSuccess ? success : error2]
              );
            }
            completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
            if (fireGlobals) {
              globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
              if (!--jQuery2.active) {
                jQuery2.event.trigger("ajaxStop");
              }
            }
          }
          return jqXHR;
        },
        getJSON: function(url, data, callback) {
          return jQuery2.get(url, data, callback, "json");
        },
        getScript: function(url, callback) {
          return jQuery2.get(url, void 0, callback, "script");
        }
      });
      jQuery2.each(["get", "post"], function(_i, method) {
        jQuery2[method] = function(url, data, callback, type) {
          if (isFunction(data)) {
            type = type || callback;
            callback = data;
            data = void 0;
          }
          return jQuery2.ajax(jQuery2.extend({
            url,
            type: method,
            dataType: type,
            data,
            success: callback
          }, jQuery2.isPlainObject(url) && url));
        };
      });
      jQuery2.ajaxPrefilter(function(s) {
        var i;
        for (i in s.headers) {
          if (i.toLowerCase() === "content-type") {
            s.contentType = s.headers[i] || "";
          }
        }
      });
      jQuery2._evalUrl = function(url, options, doc) {
        return jQuery2.ajax({
          url,
          // Make this explicit, since user can override this through ajaxSetup (trac-11264)
          type: "GET",
          dataType: "script",
          cache: true,
          async: false,
          global: false,
          // Only evaluate the response if it is successful (gh-4126)
          // dataFilter is not invoked for failure responses, so using it instead
          // of the default converter is kludgy but it works.
          converters: {
            "text script": function() {
            }
          },
          dataFilter: function(response) {
            jQuery2.globalEval(response, options, doc);
          }
        });
      };
      jQuery2.fn.extend({
        wrapAll: function(html) {
          var wrap;
          if (this[0]) {
            if (isFunction(html)) {
              html = html.call(this[0]);
            }
            wrap = jQuery2(html, this[0].ownerDocument).eq(0).clone(true);
            if (this[0].parentNode) {
              wrap.insertBefore(this[0]);
            }
            wrap.map(function() {
              var elem = this;
              while (elem.firstElementChild) {
                elem = elem.firstElementChild;
              }
              return elem;
            }).append(this);
          }
          return this;
        },
        wrapInner: function(html) {
          if (isFunction(html)) {
            return this.each(function(i) {
              jQuery2(this).wrapInner(html.call(this, i));
            });
          }
          return this.each(function() {
            var self2 = jQuery2(this), contents = self2.contents();
            if (contents.length) {
              contents.wrapAll(html);
            } else {
              self2.append(html);
            }
          });
        },
        wrap: function(html) {
          var htmlIsFunction = isFunction(html);
          return this.each(function(i) {
            jQuery2(this).wrapAll(htmlIsFunction ? html.call(this, i) : html);
          });
        },
        unwrap: function(selector) {
          this.parent(selector).not("body").each(function() {
            jQuery2(this).replaceWith(this.childNodes);
          });
          return this;
        }
      });
      jQuery2.expr.pseudos.hidden = function(elem) {
        return !jQuery2.expr.pseudos.visible(elem);
      };
      jQuery2.expr.pseudos.visible = function(elem) {
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
      };
      jQuery2.ajaxSettings.xhr = function() {
        try {
          return new window2.XMLHttpRequest();
        } catch (e) {
        }
      };
      var xhrSuccessStatus = {
        // File protocol always yields status code 0, assume 200
        0: 200,
        // Support: IE <=9 only
        // trac-1450: sometimes IE returns 1223 when it should be 204
        1223: 204
      }, xhrSupported = jQuery2.ajaxSettings.xhr();
      support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
      support.ajax = xhrSupported = !!xhrSupported;
      jQuery2.ajaxTransport(function(options) {
        var callback, errorCallback;
        if (support.cors || xhrSupported && !options.crossDomain) {
          return {
            send: function(headers, complete) {
              var i, xhr = options.xhr();
              xhr.open(
                options.type,
                options.url,
                options.async,
                options.username,
                options.password
              );
              if (options.xhrFields) {
                for (i in options.xhrFields) {
                  xhr[i] = options.xhrFields[i];
                }
              }
              if (options.mimeType && xhr.overrideMimeType) {
                xhr.overrideMimeType(options.mimeType);
              }
              if (!options.crossDomain && !headers["X-Requested-With"]) {
                headers["X-Requested-With"] = "XMLHttpRequest";
              }
              for (i in headers) {
                xhr.setRequestHeader(i, headers[i]);
              }
              callback = function(type) {
                return function() {
                  if (callback) {
                    callback = errorCallback = xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = xhr.onreadystatechange = null;
                    if (type === "abort") {
                      xhr.abort();
                    } else if (type === "error") {
                      if (typeof xhr.status !== "number") {
                        complete(0, "error");
                      } else {
                        complete(
                          // File: protocol always yields status 0; see trac-8605, trac-14207
                          xhr.status,
                          xhr.statusText
                        );
                      }
                    } else {
                      complete(
                        xhrSuccessStatus[xhr.status] || xhr.status,
                        xhr.statusText,
                        // Support: IE <=9 only
                        // IE9 has no XHR2 but throws on binary (trac-11426)
                        // For XHR2 non-text, let the caller handle it (gh-2498)
                        (xhr.responseType || "text") !== "text" || typeof xhr.responseText !== "string" ? { binary: xhr.response } : { text: xhr.responseText },
                        xhr.getAllResponseHeaders()
                      );
                    }
                  }
                };
              };
              xhr.onload = callback();
              errorCallback = xhr.onerror = xhr.ontimeout = callback("error");
              if (xhr.onabort !== void 0) {
                xhr.onabort = errorCallback;
              } else {
                xhr.onreadystatechange = function() {
                  if (xhr.readyState === 4) {
                    window2.setTimeout(function() {
                      if (callback) {
                        errorCallback();
                      }
                    });
                  }
                };
              }
              callback = callback("abort");
              try {
                xhr.send(options.hasContent && options.data || null);
              } catch (e) {
                if (callback) {
                  throw e;
                }
              }
            },
            abort: function() {
              if (callback) {
                callback();
              }
            }
          };
        }
      });
      jQuery2.ajaxPrefilter(function(s) {
        if (s.crossDomain) {
          s.contents.script = false;
        }
      });
      jQuery2.ajaxSetup({
        accepts: {
          script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
          script: /\b(?:java|ecma)script\b/
        },
        converters: {
          "text script": function(text) {
            jQuery2.globalEval(text);
            return text;
          }
        }
      });
      jQuery2.ajaxPrefilter("script", function(s) {
        if (s.cache === void 0) {
          s.cache = false;
        }
        if (s.crossDomain) {
          s.type = "GET";
        }
      });
      jQuery2.ajaxTransport("script", function(s) {
        if (s.crossDomain || s.scriptAttrs) {
          var script, callback;
          return {
            send: function(_, complete) {
              script = jQuery2("<script>").attr(s.scriptAttrs || {}).prop({ charset: s.scriptCharset, src: s.url }).on("load error", callback = function(evt) {
                script.remove();
                callback = null;
                if (evt) {
                  complete(evt.type === "error" ? 404 : 200, evt.type);
                }
              });
              document2.head.appendChild(script[0]);
            },
            abort: function() {
              if (callback) {
                callback();
              }
            }
          };
        }
      });
      var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
      jQuery2.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
          var callback = oldCallbacks.pop() || jQuery2.expando + "_" + nonce2.guid++;
          this[callback] = true;
          return callback;
        }
      });
      jQuery2.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
        var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0 && rjsonp.test(s.data) && "data");
        if (jsonProp || s.dataTypes[0] === "jsonp") {
          callbackName = s.jsonpCallback = isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
          if (jsonProp) {
            s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
          } else if (s.jsonp !== false) {
            s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
          }
          s.converters["script json"] = function() {
            if (!responseContainer) {
              jQuery2.error(callbackName + " was not called");
            }
            return responseContainer[0];
          };
          s.dataTypes[0] = "json";
          overwritten = window2[callbackName];
          window2[callbackName] = function() {
            responseContainer = arguments;
          };
          jqXHR.always(function() {
            if (overwritten === void 0) {
              jQuery2(window2).removeProp(callbackName);
            } else {
              window2[callbackName] = overwritten;
            }
            if (s[callbackName]) {
              s.jsonpCallback = originalSettings.jsonpCallback;
              oldCallbacks.push(callbackName);
            }
            if (responseContainer && isFunction(overwritten)) {
              overwritten(responseContainer[0]);
            }
            responseContainer = overwritten = void 0;
          });
          return "script";
        }
      });
      support.createHTMLDocument = function() {
        var body = document2.implementation.createHTMLDocument("").body;
        body.innerHTML = "<form></form><form></form>";
        return body.childNodes.length === 2;
      }();
      jQuery2.parseHTML = function(data, context, keepScripts) {
        if (typeof data !== "string") {
          return [];
        }
        if (typeof context === "boolean") {
          keepScripts = context;
          context = false;
        }
        var base, parsed, scripts;
        if (!context) {
          if (support.createHTMLDocument) {
            context = document2.implementation.createHTMLDocument("");
            base = context.createElement("base");
            base.href = document2.location.href;
            context.head.appendChild(base);
          } else {
            context = document2;
          }
        }
        parsed = rsingleTag.exec(data);
        scripts = !keepScripts && [];
        if (parsed) {
          return [context.createElement(parsed[1])];
        }
        parsed = buildFragment([data], context, scripts);
        if (scripts && scripts.length) {
          jQuery2(scripts).remove();
        }
        return jQuery2.merge([], parsed.childNodes);
      };
      jQuery2.fn.load = function(url, params, callback) {
        var selector, type, response, self2 = this, off = url.indexOf(" ");
        if (off > -1) {
          selector = stripAndCollapse(url.slice(off));
          url = url.slice(0, off);
        }
        if (isFunction(params)) {
          callback = params;
          params = void 0;
        } else if (params && typeof params === "object") {
          type = "POST";
        }
        if (self2.length > 0) {
          jQuery2.ajax({
            url,
            // If "type" variable is undefined, then "GET" method will be used.
            // Make value of this field explicit since
            // user can override it through ajaxSetup method
            type: type || "GET",
            dataType: "html",
            data: params
          }).done(function(responseText) {
            response = arguments;
            self2.html(selector ? (
              // If a selector was specified, locate the right elements in a dummy div
              // Exclude scripts to avoid IE 'Permission Denied' errors
              jQuery2("<div>").append(jQuery2.parseHTML(responseText)).find(selector)
            ) : (
              // Otherwise use the full result
              responseText
            ));
          }).always(callback && function(jqXHR, status) {
            self2.each(function() {
              callback.apply(this, response || [jqXHR.responseText, status, jqXHR]);
            });
          });
        }
        return this;
      };
      jQuery2.expr.pseudos.animated = function(elem) {
        return jQuery2.grep(jQuery2.timers, function(fn) {
          return elem === fn.elem;
        }).length;
      };
      jQuery2.offset = {
        setOffset: function(elem, options, i) {
          var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery2.css(elem, "position"), curElem = jQuery2(elem), props = {};
          if (position === "static") {
            elem.style.position = "relative";
          }
          curOffset = curElem.offset();
          curCSSTop = jQuery2.css(elem, "top");
          curCSSLeft = jQuery2.css(elem, "left");
          calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
          if (calculatePosition) {
            curPosition = curElem.position();
            curTop = curPosition.top;
            curLeft = curPosition.left;
          } else {
            curTop = parseFloat(curCSSTop) || 0;
            curLeft = parseFloat(curCSSLeft) || 0;
          }
          if (isFunction(options)) {
            options = options.call(elem, i, jQuery2.extend({}, curOffset));
          }
          if (options.top != null) {
            props.top = options.top - curOffset.top + curTop;
          }
          if (options.left != null) {
            props.left = options.left - curOffset.left + curLeft;
          }
          if ("using" in options) {
            options.using.call(elem, props);
          } else {
            curElem.css(props);
          }
        }
      };
      jQuery2.fn.extend({
        // offset() relates an element's border box to the document origin
        offset: function(options) {
          if (arguments.length) {
            return options === void 0 ? this : this.each(function(i) {
              jQuery2.offset.setOffset(this, options, i);
            });
          }
          var rect, win, elem = this[0];
          if (!elem) {
            return;
          }
          if (!elem.getClientRects().length) {
            return { top: 0, left: 0 };
          }
          rect = elem.getBoundingClientRect();
          win = elem.ownerDocument.defaultView;
          return {
            top: rect.top + win.pageYOffset,
            left: rect.left + win.pageXOffset
          };
        },
        // position() relates an element's margin box to its offset parent's padding box
        // This corresponds to the behavior of CSS absolute positioning
        position: function() {
          if (!this[0]) {
            return;
          }
          var offsetParent, offset, doc, elem = this[0], parentOffset = { top: 0, left: 0 };
          if (jQuery2.css(elem, "position") === "fixed") {
            offset = elem.getBoundingClientRect();
          } else {
            offset = this.offset();
            doc = elem.ownerDocument;
            offsetParent = elem.offsetParent || doc.documentElement;
            while (offsetParent && (offsetParent === doc.body || offsetParent === doc.documentElement) && jQuery2.css(offsetParent, "position") === "static") {
              offsetParent = offsetParent.parentNode;
            }
            if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
              parentOffset = jQuery2(offsetParent).offset();
              parentOffset.top += jQuery2.css(offsetParent, "borderTopWidth", true);
              parentOffset.left += jQuery2.css(offsetParent, "borderLeftWidth", true);
            }
          }
          return {
            top: offset.top - parentOffset.top - jQuery2.css(elem, "marginTop", true),
            left: offset.left - parentOffset.left - jQuery2.css(elem, "marginLeft", true)
          };
        },
        // This method will return documentElement in the following cases:
        // 1) For the element inside the iframe without offsetParent, this method will return
        //    documentElement of the parent window
        // 2) For the hidden or detached element
        // 3) For body or html element, i.e. in case of the html node - it will return itself
        //
        // but those exceptions were never presented as a real life use-cases
        // and might be considered as more preferable results.
        //
        // This logic, however, is not guaranteed and can change at any point in the future
        offsetParent: function() {
          return this.map(function() {
            var offsetParent = this.offsetParent;
            while (offsetParent && jQuery2.css(offsetParent, "position") === "static") {
              offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || documentElement;
          });
        }
      });
      jQuery2.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function(method, prop) {
        var top = "pageYOffset" === prop;
        jQuery2.fn[method] = function(val) {
          return access(this, function(elem, method2, val2) {
            var win;
            if (isWindow(elem)) {
              win = elem;
            } else if (elem.nodeType === 9) {
              win = elem.defaultView;
            }
            if (val2 === void 0) {
              return win ? win[prop] : elem[method2];
            }
            if (win) {
              win.scrollTo(
                !top ? val2 : win.pageXOffset,
                top ? val2 : win.pageYOffset
              );
            } else {
              elem[method2] = val2;
            }
          }, method, val, arguments.length);
        };
      });
      jQuery2.each(["top", "left"], function(_i, prop) {
        jQuery2.cssHooks[prop] = addGetHookIf(
          support.pixelPosition,
          function(elem, computed) {
            if (computed) {
              computed = curCSS(elem, prop);
              return rnumnonpx.test(computed) ? jQuery2(elem).position()[prop] + "px" : computed;
            }
          }
        );
      });
      jQuery2.each({ Height: "height", Width: "width" }, function(name, type) {
        jQuery2.each({
          padding: "inner" + name,
          content: type,
          "": "outer" + name
        }, function(defaultExtra, funcName) {
          jQuery2.fn[funcName] = function(margin, value) {
            var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"), extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
            return access(this, function(elem, type2, value2) {
              var doc;
              if (isWindow(elem)) {
                return funcName.indexOf("outer") === 0 ? elem["inner" + name] : elem.document.documentElement["client" + name];
              }
              if (elem.nodeType === 9) {
                doc = elem.documentElement;
                return Math.max(
                  elem.body["scroll" + name],
                  doc["scroll" + name],
                  elem.body["offset" + name],
                  doc["offset" + name],
                  doc["client" + name]
                );
              }
              return value2 === void 0 ? (
                // Get width or height on the element, requesting but not forcing parseFloat
                jQuery2.css(elem, type2, extra)
              ) : (
                // Set width or height on the element
                jQuery2.style(elem, type2, value2, extra)
              );
            }, type, chainable ? margin : void 0, chainable);
          };
        });
      });
      jQuery2.each([
        "ajaxStart",
        "ajaxStop",
        "ajaxComplete",
        "ajaxError",
        "ajaxSuccess",
        "ajaxSend"
      ], function(_i, type) {
        jQuery2.fn[type] = function(fn) {
          return this.on(type, fn);
        };
      });
      jQuery2.fn.extend({
        bind: function(types, data, fn) {
          return this.on(types, null, data, fn);
        },
        unbind: function(types, fn) {
          return this.off(types, null, fn);
        },
        delegate: function(selector, types, data, fn) {
          return this.on(types, selector, data, fn);
        },
        undelegate: function(selector, types, fn) {
          return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
        },
        hover: function(fnOver, fnOut) {
          return this.on("mouseenter", fnOver).on("mouseleave", fnOut || fnOver);
        }
      });
      jQuery2.each(
        "blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),
        function(_i, name) {
          jQuery2.fn[name] = function(data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
          };
        }
      );
      var rtrim = /^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;
      jQuery2.proxy = function(fn, context) {
        var tmp, args, proxy;
        if (typeof context === "string") {
          tmp = fn[context];
          context = fn;
          fn = tmp;
        }
        if (!isFunction(fn)) {
          return void 0;
        }
        args = slice.call(arguments, 2);
        proxy = function() {
          return fn.apply(context || this, args.concat(slice.call(arguments)));
        };
        proxy.guid = fn.guid = fn.guid || jQuery2.guid++;
        return proxy;
      };
      jQuery2.holdReady = function(hold) {
        if (hold) {
          jQuery2.readyWait++;
        } else {
          jQuery2.ready(true);
        }
      };
      jQuery2.isArray = Array.isArray;
      jQuery2.parseJSON = JSON.parse;
      jQuery2.nodeName = nodeName;
      jQuery2.isFunction = isFunction;
      jQuery2.isWindow = isWindow;
      jQuery2.camelCase = camelCase;
      jQuery2.type = toType;
      jQuery2.now = Date.now;
      jQuery2.isNumeric = function(obj) {
        var type = jQuery2.type(obj);
        return (type === "number" || type === "string") && // parseFloat NaNs numeric-cast false positives ("")
        // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
        // subtraction forces infinities to NaN
        !isNaN(obj - parseFloat(obj));
      };
      jQuery2.trim = function(text) {
        return text == null ? "" : (text + "").replace(rtrim, "$1");
      };
      if (typeof define === "function" && define.amd) {
        define("jquery", [], function() {
          return jQuery2;
        });
      }
      var _jQuery = window2.jQuery, _$ = window2.$;
      jQuery2.noConflict = function(deep) {
        if (window2.$ === jQuery2) {
          window2.$ = _$;
        }
        if (deep && window2.jQuery === jQuery2) {
          window2.jQuery = _jQuery;
        }
        return jQuery2;
      };
      if (typeof noGlobal === "undefined") {
        window2.jQuery = window2.$ = jQuery2;
      }
      return jQuery2;
    });
  }
});

// node_modules/toastr/toastr.js
var require_toastr = __commonJS({
  "node_modules/toastr/toastr.js"(exports, module) {
    (function(define2) {
      define2(["jquery"], function($3) {
        return /* @__PURE__ */ function() {
          var $container;
          var listener;
          var toastId = 0;
          var toastType = {
            error: "error",
            info: "info",
            success: "success",
            warning: "warning"
          };
          var toastr3 = {
            clear,
            remove,
            error: error2,
            getContainer,
            info,
            options: {},
            subscribe,
            success,
            version: "2.1.4",
            warning
          };
          var previousToast;
          return toastr3;
          function error2(message, title, optionsOverride) {
            return notify({
              type: toastType.error,
              iconClass: getOptions().iconClasses.error,
              message,
              optionsOverride,
              title
            });
          }
          function getContainer(options, create) {
            if (!options) {
              options = getOptions();
            }
            $container = $3("#" + options.containerId);
            if ($container.length) {
              return $container;
            }
            if (create) {
              $container = createContainer(options);
            }
            return $container;
          }
          function info(message, title, optionsOverride) {
            return notify({
              type: toastType.info,
              iconClass: getOptions().iconClasses.info,
              message,
              optionsOverride,
              title
            });
          }
          function subscribe(callback) {
            listener = callback;
          }
          function success(message, title, optionsOverride) {
            return notify({
              type: toastType.success,
              iconClass: getOptions().iconClasses.success,
              message,
              optionsOverride,
              title
            });
          }
          function warning(message, title, optionsOverride) {
            return notify({
              type: toastType.warning,
              iconClass: getOptions().iconClasses.warning,
              message,
              optionsOverride,
              title
            });
          }
          function clear($toastElement, clearOptions) {
            var options = getOptions();
            if (!$container) {
              getContainer(options);
            }
            if (!clearToast($toastElement, options, clearOptions)) {
              clearContainer(options);
            }
          }
          function remove($toastElement) {
            var options = getOptions();
            if (!$container) {
              getContainer(options);
            }
            if ($toastElement && $3(":focus", $toastElement).length === 0) {
              removeToast($toastElement);
              return;
            }
            if ($container.children().length) {
              $container.remove();
            }
          }
          function clearContainer(options) {
            var toastsToClear = $container.children();
            for (var i = toastsToClear.length - 1; i >= 0; i--) {
              clearToast($3(toastsToClear[i]), options);
            }
          }
          function clearToast($toastElement, options, clearOptions) {
            var force = clearOptions && clearOptions.force ? clearOptions.force : false;
            if ($toastElement && (force || $3(":focus", $toastElement).length === 0)) {
              $toastElement[options.hideMethod]({
                duration: options.hideDuration,
                easing: options.hideEasing,
                complete: function() {
                  removeToast($toastElement);
                }
              });
              return true;
            }
            return false;
          }
          function createContainer(options) {
            $container = $3("<div/>").attr("id", options.containerId).addClass(options.positionClass);
            $container.appendTo($3(options.target));
            return $container;
          }
          function getDefaults() {
            return {
              tapToDismiss: true,
              toastClass: "toast",
              containerId: "toast-container",
              debug: false,
              showMethod: "fadeIn",
              //fadeIn, slideDown, and show are built into jQuery
              showDuration: 300,
              showEasing: "swing",
              //swing and linear are built into jQuery
              onShown: void 0,
              hideMethod: "fadeOut",
              hideDuration: 1e3,
              hideEasing: "swing",
              onHidden: void 0,
              closeMethod: false,
              closeDuration: false,
              closeEasing: false,
              closeOnHover: true,
              extendedTimeOut: 1e3,
              iconClasses: {
                error: "toast-error",
                info: "toast-info",
                success: "toast-success",
                warning: "toast-warning"
              },
              iconClass: "toast-info",
              positionClass: "toast-top-right",
              timeOut: 5e3,
              // Set timeOut and extendedTimeOut to 0 to make it sticky
              titleClass: "toast-title",
              messageClass: "toast-message",
              escapeHtml: false,
              target: "body",
              closeHtml: '<button type="button">&times;</button>',
              closeClass: "toast-close-button",
              newestOnTop: true,
              preventDuplicates: false,
              progressBar: false,
              progressClass: "toast-progress",
              rtl: false
            };
          }
          function publish(args) {
            if (!listener) {
              return;
            }
            listener(args);
          }
          function notify(map) {
            var options = getOptions();
            var iconClass = map.iconClass || options.iconClass;
            if (typeof map.optionsOverride !== "undefined") {
              options = $3.extend(options, map.optionsOverride);
              iconClass = map.optionsOverride.iconClass || iconClass;
            }
            if (shouldExit(options, map)) {
              return;
            }
            toastId++;
            $container = getContainer(options, true);
            var intervalId = null;
            var $toastElement = $3("<div/>");
            var $titleElement = $3("<div/>");
            var $messageElement = $3("<div/>");
            var $progressElement = $3("<div/>");
            var $closeElement = $3(options.closeHtml);
            var progressBar = {
              intervalId: null,
              hideEta: null,
              maxHideTime: null
            };
            var response = {
              toastId,
              state: "visible",
              startTime: /* @__PURE__ */ new Date(),
              options,
              map
            };
            personalizeToast();
            displayToast();
            handleEvents();
            publish(response);
            if (options.debug && console) {
              console.log(response);
            }
            return $toastElement;
            function escapeHtml(source) {
              if (source == null) {
                source = "";
              }
              return source.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
            function personalizeToast() {
              setIcon();
              setTitle();
              setMessage();
              setCloseButton();
              setProgressBar();
              setRTL();
              setSequence();
              setAria();
            }
            function setAria() {
              var ariaValue = "";
              switch (map.iconClass) {
                case "toast-success":
                case "toast-info":
                  ariaValue = "polite";
                  break;
                default:
                  ariaValue = "assertive";
              }
              $toastElement.attr("aria-live", ariaValue);
            }
            function handleEvents() {
              if (options.closeOnHover) {
                $toastElement.hover(stickAround, delayedHideToast);
              }
              if (!options.onclick && options.tapToDismiss) {
                $toastElement.click(hideToast);
              }
              if (options.closeButton && $closeElement) {
                $closeElement.click(function(event) {
                  if (event.stopPropagation) {
                    event.stopPropagation();
                  } else if (event.cancelBubble !== void 0 && event.cancelBubble !== true) {
                    event.cancelBubble = true;
                  }
                  if (options.onCloseClick) {
                    options.onCloseClick(event);
                  }
                  hideToast(true);
                });
              }
              if (options.onclick) {
                $toastElement.click(function(event) {
                  options.onclick(event);
                  hideToast();
                });
              }
            }
            function displayToast() {
              $toastElement.hide();
              $toastElement[options.showMethod](
                { duration: options.showDuration, easing: options.showEasing, complete: options.onShown }
              );
              if (options.timeOut > 0) {
                intervalId = setTimeout(hideToast, options.timeOut);
                progressBar.maxHideTime = parseFloat(options.timeOut);
                progressBar.hideEta = (/* @__PURE__ */ new Date()).getTime() + progressBar.maxHideTime;
                if (options.progressBar) {
                  progressBar.intervalId = setInterval(updateProgress, 10);
                }
              }
            }
            function setIcon() {
              if (map.iconClass) {
                $toastElement.addClass(options.toastClass).addClass(iconClass);
              }
            }
            function setSequence() {
              if (options.newestOnTop) {
                $container.prepend($toastElement);
              } else {
                $container.append($toastElement);
              }
            }
            function setTitle() {
              if (map.title) {
                var suffix = map.title;
                if (options.escapeHtml) {
                  suffix = escapeHtml(map.title);
                }
                $titleElement.append(suffix).addClass(options.titleClass);
                $toastElement.append($titleElement);
              }
            }
            function setMessage() {
              if (map.message) {
                var suffix = map.message;
                if (options.escapeHtml) {
                  suffix = escapeHtml(map.message);
                }
                $messageElement.append(suffix).addClass(options.messageClass);
                $toastElement.append($messageElement);
              }
            }
            function setCloseButton() {
              if (options.closeButton) {
                $closeElement.addClass(options.closeClass).attr("role", "button");
                $toastElement.prepend($closeElement);
              }
            }
            function setProgressBar() {
              if (options.progressBar) {
                $progressElement.addClass(options.progressClass);
                $toastElement.prepend($progressElement);
              }
            }
            function setRTL() {
              if (options.rtl) {
                $toastElement.addClass("rtl");
              }
            }
            function shouldExit(options2, map2) {
              if (options2.preventDuplicates) {
                if (map2.message === previousToast) {
                  return true;
                } else {
                  previousToast = map2.message;
                }
              }
              return false;
            }
            function hideToast(override) {
              var method = override && options.closeMethod !== false ? options.closeMethod : options.hideMethod;
              var duration = override && options.closeDuration !== false ? options.closeDuration : options.hideDuration;
              var easing = override && options.closeEasing !== false ? options.closeEasing : options.hideEasing;
              if ($3(":focus", $toastElement).length && !override) {
                return;
              }
              clearTimeout(progressBar.intervalId);
              return $toastElement[method]({
                duration,
                easing,
                complete: function() {
                  removeToast($toastElement);
                  clearTimeout(intervalId);
                  if (options.onHidden && response.state !== "hidden") {
                    options.onHidden();
                  }
                  response.state = "hidden";
                  response.endTime = /* @__PURE__ */ new Date();
                  publish(response);
                }
              });
            }
            function delayedHideToast() {
              if (options.timeOut > 0 || options.extendedTimeOut > 0) {
                intervalId = setTimeout(hideToast, options.extendedTimeOut);
                progressBar.maxHideTime = parseFloat(options.extendedTimeOut);
                progressBar.hideEta = (/* @__PURE__ */ new Date()).getTime() + progressBar.maxHideTime;
              }
            }
            function stickAround() {
              clearTimeout(intervalId);
              progressBar.hideEta = 0;
              $toastElement.stop(true, true)[options.showMethod](
                { duration: options.showDuration, easing: options.showEasing }
              );
            }
            function updateProgress() {
              var percentage = (progressBar.hideEta - (/* @__PURE__ */ new Date()).getTime()) / progressBar.maxHideTime * 100;
              $progressElement.width(percentage + "%");
            }
          }
          function getOptions() {
            return $3.extend({}, getDefaults(), toastr3.options);
          }
          function removeToast($toastElement) {
            if (!$container) {
              $container = getContainer();
            }
            if ($toastElement.is(":visible")) {
              return;
            }
            $toastElement.remove();
            $toastElement = null;
            if ($container.children().length === 0) {
              $container.remove();
              previousToast = void 0;
            }
          }
        }();
      });
    })(typeof define === "function" && define.amd ? define : function(deps, factory) {
      if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require_jquery());
      } else {
        window.toastr = factory(window.jQuery);
      }
    });
  }
});

// node_modules/datatables.net/js/dataTables.js
var require_dataTables = __commonJS({
  "node_modules/datatables.net/js/dataTables.js"(exports, module) {
    (function(factory) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define(["jquery"], function($3) {
          return factory($3, window, document);
        });
      } else if (typeof exports === "object") {
        var jq = require_jquery();
        if (typeof window === "undefined") {
          module.exports = function(root, $3) {
            if (!root) {
              root = window;
            }
            if (!$3) {
              $3 = jq(root);
            }
            return factory($3, root, root.document);
          };
        } else {
          module.exports = factory(jq, window, window.document);
        }
      } else {
        window.DataTable = factory(jQuery, window, document);
      }
    })(function($3, window2, document2) {
      "use strict";
      var DataTable = function(selector, options) {
        if (DataTable.factory(selector, options)) {
          return DataTable;
        }
        if (this instanceof DataTable) {
          return $3(selector).DataTable(options);
        } else {
          options = selector;
        }
        var _that = this;
        var emptyInit = options === void 0;
        var len = this.length;
        if (emptyInit) {
          options = {};
        }
        this.api = function() {
          return new _Api(this);
        };
        this.each(function() {
          var o = {};
          var oInit = len > 1 ? (
            // optimisation for single table case
            _fnExtend(o, options, true)
          ) : options;
          var i2 = 0, iLen;
          var sId = this.getAttribute("id");
          var bInitHandedOff = false;
          var defaults = DataTable.defaults;
          var $this = $3(this);
          if (this.nodeName.toLowerCase() != "table") {
            _fnLog(null, 0, "Non-table node initialisation (" + this.nodeName + ")", 2);
            return;
          }
          $3(this).trigger("options.dt", oInit);
          _fnCompatOpts(defaults);
          _fnCompatCols(defaults.column);
          _fnCamelToHungarian(defaults, defaults, true);
          _fnCamelToHungarian(defaults.column, defaults.column, true);
          _fnCamelToHungarian(defaults, $3.extend(oInit, $this.data()), true);
          var allSettings = DataTable.settings;
          for (i2 = 0, iLen = allSettings.length; i2 < iLen; i2++) {
            var s = allSettings[i2];
            if (s.nTable == this || s.nTHead && s.nTHead.parentNode == this || s.nTFoot && s.nTFoot.parentNode == this) {
              var bRetrieve = oInit.bRetrieve !== void 0 ? oInit.bRetrieve : defaults.bRetrieve;
              var bDestroy = oInit.bDestroy !== void 0 ? oInit.bDestroy : defaults.bDestroy;
              if (emptyInit || bRetrieve) {
                return s.oInstance;
              } else if (bDestroy) {
                new DataTable.Api(s).destroy();
                break;
              } else {
                _fnLog(s, 0, "Cannot reinitialise DataTable", 3);
                return;
              }
            }
            if (s.sTableId == this.id) {
              allSettings.splice(i2, 1);
              break;
            }
          }
          if (sId === null || sId === "") {
            sId = "DataTables_Table_" + DataTable.ext._unique++;
            this.id = sId;
          }
          var oSettings = $3.extend(true, {}, DataTable.models.oSettings, {
            "sDestroyWidth": $this[0].style.width,
            "sInstance": sId,
            "sTableId": sId,
            colgroup: $3("<colgroup>").prependTo(this),
            fastData: function(row, column, type) {
              return _fnGetCellData(oSettings, row, column, type);
            }
          });
          oSettings.nTable = this;
          oSettings.oInit = oInit;
          allSettings.push(oSettings);
          oSettings.api = new _Api(oSettings);
          oSettings.oInstance = _that.length === 1 ? _that : $this.dataTable();
          _fnCompatOpts(oInit);
          if (oInit.aLengthMenu && !oInit.iDisplayLength) {
            oInit.iDisplayLength = Array.isArray(oInit.aLengthMenu[0]) ? oInit.aLengthMenu[0][0] : $3.isPlainObject(oInit.aLengthMenu[0]) ? oInit.aLengthMenu[0].value : oInit.aLengthMenu[0];
          }
          oInit = _fnExtend($3.extend(true, {}, defaults), oInit);
          _fnMap(oSettings.oFeatures, oInit, [
            "bPaginate",
            "bLengthChange",
            "bFilter",
            "bSort",
            "bSortMulti",
            "bInfo",
            "bProcessing",
            "bAutoWidth",
            "bSortClasses",
            "bServerSide",
            "bDeferRender"
          ]);
          _fnMap(oSettings, oInit, [
            "ajax",
            "fnFormatNumber",
            "sServerMethod",
            "aaSorting",
            "aaSortingFixed",
            "aLengthMenu",
            "sPaginationType",
            "iStateDuration",
            "bSortCellsTop",
            "iTabIndex",
            "sDom",
            "fnStateLoadCallback",
            "fnStateSaveCallback",
            "renderer",
            "searchDelay",
            "rowId",
            "caption",
            "layout",
            ["iCookieDuration", "iStateDuration"],
            // backwards compat
            ["oSearch", "oPreviousSearch"],
            ["aoSearchCols", "aoPreSearchCols"],
            ["iDisplayLength", "_iDisplayLength"]
          ]);
          _fnMap(oSettings.oScroll, oInit, [
            ["sScrollX", "sX"],
            ["sScrollXInner", "sXInner"],
            ["sScrollY", "sY"],
            ["bScrollCollapse", "bCollapse"]
          ]);
          _fnMap(oSettings.oLanguage, oInit, "fnInfoCallback");
          _fnCallbackReg(oSettings, "aoDrawCallback", oInit.fnDrawCallback);
          _fnCallbackReg(oSettings, "aoStateSaveParams", oInit.fnStateSaveParams);
          _fnCallbackReg(oSettings, "aoStateLoadParams", oInit.fnStateLoadParams);
          _fnCallbackReg(oSettings, "aoStateLoaded", oInit.fnStateLoaded);
          _fnCallbackReg(oSettings, "aoRowCallback", oInit.fnRowCallback);
          _fnCallbackReg(oSettings, "aoRowCreatedCallback", oInit.fnCreatedRow);
          _fnCallbackReg(oSettings, "aoHeaderCallback", oInit.fnHeaderCallback);
          _fnCallbackReg(oSettings, "aoFooterCallback", oInit.fnFooterCallback);
          _fnCallbackReg(oSettings, "aoInitComplete", oInit.fnInitComplete);
          _fnCallbackReg(oSettings, "aoPreDrawCallback", oInit.fnPreDrawCallback);
          oSettings.rowIdFn = _fnGetObjectDataFn(oInit.rowId);
          _fnBrowserDetect(oSettings);
          var oClasses = oSettings.oClasses;
          $3.extend(oClasses, DataTable.ext.classes, oInit.oClasses);
          $this.addClass(oClasses.table);
          if (!oSettings.oFeatures.bPaginate) {
            oInit.iDisplayStart = 0;
          }
          if (oSettings.iInitDisplayStart === void 0) {
            oSettings.iInitDisplayStart = oInit.iDisplayStart;
            oSettings._iDisplayStart = oInit.iDisplayStart;
          }
          var oLanguage = oSettings.oLanguage;
          $3.extend(true, oLanguage, oInit.oLanguage);
          if (oLanguage.sUrl) {
            $3.ajax({
              dataType: "json",
              url: oLanguage.sUrl,
              success: function(json) {
                _fnCamelToHungarian(defaults.oLanguage, json);
                $3.extend(true, oLanguage, json, oSettings.oInit.oLanguage);
                _fnCallbackFire(oSettings, null, "i18n", [oSettings], true);
                _fnInitialise(oSettings);
              },
              error: function() {
                _fnLog(oSettings, 0, "i18n file loading error", 21);
                _fnInitialise(oSettings);
              }
            });
            bInitHandedOff = true;
          } else {
            _fnCallbackFire(oSettings, null, "i18n", [oSettings]);
          }
          var columnsInit = [];
          var thead = this.getElementsByTagName("thead");
          var initHeaderLayout = _fnDetectHeader(oSettings, thead[0]);
          if (oInit.aoColumns) {
            columnsInit = oInit.aoColumns;
          } else if (initHeaderLayout.length) {
            for (i2 = 0, iLen = initHeaderLayout[0].length; i2 < iLen; i2++) {
              columnsInit.push(null);
            }
          }
          for (i2 = 0, iLen = columnsInit.length; i2 < iLen; i2++) {
            _fnAddColumn(oSettings);
          }
          _fnApplyColumnDefs(oSettings, oInit.aoColumnDefs, columnsInit, initHeaderLayout, function(iCol, oDef) {
            _fnColumnOptions(oSettings, iCol, oDef);
          });
          var rowOne = $this.children("tbody").find("tr").eq(0);
          if (rowOne.length) {
            var a = function(cell, name) {
              return cell.getAttribute("data-" + name) !== null ? name : null;
            };
            $3(rowOne[0]).children("th, td").each(function(i3, cell) {
              var col = oSettings.aoColumns[i3];
              if (!col) {
                _fnLog(oSettings, 0, "Incorrect column count", 18);
              }
              if (col.mData === i3) {
                var sort = a(cell, "sort") || a(cell, "order");
                var filter = a(cell, "filter") || a(cell, "search");
                if (sort !== null || filter !== null) {
                  col.mData = {
                    _: i3 + ".display",
                    sort: sort !== null ? i3 + ".@data-" + sort : void 0,
                    type: sort !== null ? i3 + ".@data-" + sort : void 0,
                    filter: filter !== null ? i3 + ".@data-" + filter : void 0
                  };
                  col._isArrayHost = true;
                  _fnColumnOptions(oSettings, i3);
                }
              }
            });
          }
          var features = oSettings.oFeatures;
          var loadedInit = function() {
            if (oInit.aaSorting === void 0) {
              var sorting = oSettings.aaSorting;
              for (i2 = 0, iLen = sorting.length; i2 < iLen; i2++) {
                sorting[i2][1] = oSettings.aoColumns[i2].asSorting[0];
              }
            }
            _fnSortingClasses(oSettings);
            _fnCallbackReg(oSettings, "aoDrawCallback", function() {
              if (oSettings.bSorted || _fnDataSource(oSettings) === "ssp" || features.bDeferRender) {
                _fnSortingClasses(oSettings);
              }
            });
            var caption = $this.children("caption");
            if (oSettings.caption) {
              if (caption.length === 0) {
                caption = $3("<caption/>").appendTo($this);
              }
              caption.html(oSettings.caption);
            }
            if (caption.length) {
              caption[0]._captionSide = caption.css("caption-side");
              oSettings.captionNode = caption[0];
            }
            if (thead.length === 0) {
              thead = $3("<thead/>").appendTo($this);
            }
            oSettings.nTHead = thead[0];
            $3("tr", thead).addClass(oClasses.thead.row);
            var tbody = $this.children("tbody");
            if (tbody.length === 0) {
              tbody = $3("<tbody/>").insertAfter(thead);
            }
            oSettings.nTBody = tbody[0];
            var tfoot = $this.children("tfoot");
            if (tfoot.length === 0) {
              tfoot = $3("<tfoot/>").appendTo($this);
            }
            oSettings.nTFoot = tfoot[0];
            $3("tr", tfoot).addClass(oClasses.tfoot.row);
            if (oInit.aaData) {
              for (i2 = 0; i2 < oInit.aaData.length; i2++) {
                _fnAddData(oSettings, oInit.aaData[i2]);
              }
            } else if (_fnDataSource(oSettings) == "dom") {
              _fnAddTr(oSettings, $3(oSettings.nTBody).children("tr"));
            }
            oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
            oSettings.bInitialised = true;
            if (bInitHandedOff === false) {
              _fnInitialise(oSettings);
            }
          };
          _fnCallbackReg(oSettings, "aoDrawCallback", _fnSaveState);
          if (oInit.bStateSave) {
            features.bStateSave = true;
            _fnLoadState(oSettings, oInit, loadedInit);
          } else {
            loadedInit();
          }
        });
        _that = null;
        return this;
      };
      DataTable.ext = _ext = {
        /**
         * Buttons. For use with the Buttons extension for DataTables. This is
         * defined here so other extensions can define buttons regardless of load
         * order. It is _not_ used by DataTables core.
         *
         *  @type object
         *  @default {}
         */
        buttons: {},
        /**
         * Element class names
         *
         *  @type object
         *  @default {}
         */
        classes: {},
        /**
         * DataTables build type (expanded by the download builder)
         *
         *  @type string
         */
        builder: "-source-",
        /**
         * Error reporting.
         * 
         * How should DataTables report an error. Can take the value 'alert',
         * 'throw', 'none' or a function.
         *
         *  @type string|function
         *  @default alert
         */
        errMode: "alert",
        /**
         * Legacy so v1 plug-ins don't throw js errors on load
         */
        feature: [],
        /**
         * Feature plug-ins.
         * 
         * This is an object of callbacks which provide the features for DataTables
         * to be initialised via the `layout` option.
         */
        features: {},
        /**
         * Row searching.
         * 
         * This method of searching is complimentary to the default type based
         * searching, and a lot more comprehensive as it allows you complete control
         * over the searching logic. Each element in this array is a function
         * (parameters described below) that is called for every row in the table,
         * and your logic decides if it should be included in the searching data set
         * or not.
         *
         * Searching functions have the following input parameters:
         *
         * 1. `{object}` DataTables settings object: see
         *    {@link DataTable.models.oSettings}
         * 2. `{array|object}` Data for the row to be processed (same as the
         *    original format that was passed in as the data source, or an array
         *    from a DOM data source
         * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
         *    can be useful to retrieve the `TR` element if you need DOM interaction.
         *
         * And the following return is expected:
         *
         * * {boolean} Include the row in the searched result set (true) or not
         *   (false)
         *
         * Note that as with the main search ability in DataTables, technically this
         * is "filtering", since it is subtractive. However, for consistency in
         * naming we call it searching here.
         *
         *  @type array
         *  @default []
         *
         *  @example
         *    // The following example shows custom search being applied to the
         *    // fourth column (i.e. the data[3] index) based on two input values
         *    // from the end-user, matching the data in a certain range.
         *    $.fn.dataTable.ext.search.push(
         *      function( settings, data, dataIndex ) {
         *        var min = document.getElementById('min').value * 1;
         *        var max = document.getElementById('max').value * 1;
         *        var version = data[3] == "-" ? 0 : data[3]*1;
         *
         *        if ( min == "" && max == "" ) {
         *          return true;
         *        }
         *        else if ( min == "" && version < max ) {
         *          return true;
         *        }
         *        else if ( min < version && "" == max ) {
         *          return true;
         *        }
         *        else if ( min < version && version < max ) {
         *          return true;
         *        }
         *        return false;
         *      }
         *    );
         */
        search: [],
        /**
         * Selector extensions
         *
         * The `selector` option can be used to extend the options available for the
         * selector modifier options (`selector-modifier` object data type) that
         * each of the three built in selector types offer (row, column and cell +
         * their plural counterparts). For example the Select extension uses this
         * mechanism to provide an option to select only rows, columns and cells
         * that have been marked as selected by the end user (`{selected: true}`),
         * which can be used in conjunction with the existing built in selector
         * options.
         *
         * Each property is an array to which functions can be pushed. The functions
         * take three attributes:
         *
         * * Settings object for the host table
         * * Options object (`selector-modifier` object type)
         * * Array of selected item indexes
         *
         * The return is an array of the resulting item indexes after the custom
         * selector has been applied.
         *
         *  @type object
         */
        selector: {
          cell: [],
          column: [],
          row: []
        },
        /**
         * Legacy configuration options. Enable and disable legacy options that
         * are available in DataTables.
         *
         *  @type object
         */
        legacy: {
          /**
           * Enable / disable DataTables 1.9 compatible server-side processing
           * requests
           *
           *  @type boolean
           *  @default null
           */
          ajax: null
        },
        /**
         * Pagination plug-in methods.
         * 
         * Each entry in this object is a function and defines which buttons should
         * be shown by the pagination rendering method that is used for the table:
         * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
         * buttons are displayed in the document, while the functions here tell it
         * what buttons to display. This is done by returning an array of button
         * descriptions (what each button will do).
         *
         * Pagination types (the four built in options and any additional plug-in
         * options defined here) can be used through the `paginationType`
         * initialisation parameter.
         *
         * The functions defined take two parameters:
         *
         * 1. `{int} page` The current page index
         * 2. `{int} pages` The number of pages in the table
         *
         * Each function is expected to return an array where each element of the
         * array can be one of:
         *
         * * `first` - Jump to first page when activated
         * * `last` - Jump to last page when activated
         * * `previous` - Show previous page when activated
         * * `next` - Show next page when activated
         * * `{int}` - Show page of the index given
         * * `{array}` - A nested array containing the above elements to add a
         *   containing 'DIV' element (might be useful for styling).
         *
         * Note that DataTables v1.9- used this object slightly differently whereby
         * an object with two functions would be defined for each plug-in. That
         * ability is still supported by DataTables 1.10+ to provide backwards
         * compatibility, but this option of use is now decremented and no longer
         * documented in DataTables 1.10+.
         *
         *  @type object
         *  @default {}
         *
         *  @example
         *    // Show previous, next and current page buttons only
         *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
         *      return [ 'previous', page, 'next' ];
         *    };
         */
        pager: {},
        renderer: {
          pageButton: {},
          header: {}
        },
        /**
         * Ordering plug-ins - custom data source
         * 
         * The extension options for ordering of data available here is complimentary
         * to the default type based ordering that DataTables typically uses. It
         * allows much greater control over the the data that is being used to
         * order a column, but is necessarily therefore more complex.
         * 
         * This type of ordering is useful if you want to do ordering based on data
         * live from the DOM (for example the contents of an 'input' element) rather
         * than just the static string that DataTables knows of.
         * 
         * The way these plug-ins work is that you create an array of the values you
         * wish to be ordering for the column in question and then return that
         * array. The data in the array much be in the index order of the rows in
         * the table (not the currently ordering order!). Which order data gathering
         * function is run here depends on the `dt-init columns.orderDataType`
         * parameter that is used for the column (if any).
         *
         * The functions defined take two parameters:
         *
         * 1. `{object}` DataTables settings object: see
         *    {@link DataTable.models.oSettings}
         * 2. `{int}` Target column index
         *
         * Each function is expected to return an array:
         *
         * * `{array}` Data for the column to be ordering upon
         *
         *  @type array
         *
         *  @example
         *    // Ordering using `input` node values
         *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
         *    {
         *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
         *        return $('input', td).val();
         *      } );
         *    }
         */
        order: {},
        /**
         * Type based plug-ins.
         *
         * Each column in DataTables has a type assigned to it, either by automatic
         * detection or by direct assignment using the `type` option for the column.
         * The type of a column will effect how it is ordering and search (plug-ins
         * can also make use of the column type if required).
         *
         * @namespace
         */
        type: {
          /**
           * Automatic column class assignment
           */
          className: {},
          /**
           * Type detection functions.
           *
           * The functions defined in this object are used to automatically detect
           * a column's type, making initialisation of DataTables super easy, even
           * when complex data is in the table.
           *
           * The functions defined take two parameters:
           *
              *  1. `{*}` Data from the column cell to be analysed
              *  2. `{settings}` DataTables settings object. This can be used to
              *     perform context specific type detection - for example detection
              *     based on language settings such as using a comma for a decimal
              *     place. Generally speaking the options from the settings will not
              *     be required
           *
           * Each function is expected to return:
           *
           * * `{string|null}` Data type detected, or null if unknown (and thus
           *   pass it on to the other type detection functions.
           *
           *  @type array
           *
           *  @example
           *    // Currency type detection plug-in:
           *    $.fn.dataTable.ext.type.detect.push(
           *      function ( data, settings ) {
           *        // Check the numeric part
           *        if ( ! data.substring(1).match(/[0-9]/) ) {
           *          return null;
           *        }
           *
           *        // Check prefixed by currency
           *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
           *          return 'currency';
           *        }
           *        return null;
           *      }
           *    );
           */
          detect: [],
          /**
           * Automatic renderer assignment
           */
          render: {},
          /**
           * Type based search formatting.
           *
           * The type based searching functions can be used to pre-format the
           * data to be search on. For example, it can be used to strip HTML
           * tags or to de-format telephone numbers for numeric only searching.
           *
           * Note that is a search is not defined for a column of a given type,
           * no search formatting will be performed.
           * 
           * Pre-processing of searching data plug-ins - When you assign the sType
           * for a column (or have it automatically detected for you by DataTables
           * or a type detection plug-in), you will typically be using this for
           * custom sorting, but it can also be used to provide custom searching
           * by allowing you to pre-processing the data and returning the data in
           * the format that should be searched upon. This is done by adding
           * functions this object with a parameter name which matches the sType
           * for that target column. This is the corollary of <i>afnSortData</i>
           * for searching data.
           *
           * The functions defined take a single parameter:
           *
              *  1. `{*}` Data from the column cell to be prepared for searching
           *
           * Each function is expected to return:
           *
           * * `{string|null}` Formatted string that will be used for the searching.
           *
           *  @type object
           *  @default {}
           *
           *  @example
           *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
           *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
           *    }
           */
          search: {},
          /**
           * Type based ordering.
           *
           * The column type tells DataTables what ordering to apply to the table
           * when a column is sorted upon. The order for each type that is defined,
           * is defined by the functions available in this object.
           *
           * Each ordering option can be described by three properties added to
           * this object:
           *
           * * `{type}-pre` - Pre-formatting function
           * * `{type}-asc` - Ascending order function
           * * `{type}-desc` - Descending order function
           *
           * All three can be used together, only `{type}-pre` or only
           * `{type}-asc` and `{type}-desc` together. It is generally recommended
           * that only `{type}-pre` is used, as this provides the optimal
           * implementation in terms of speed, although the others are provided
           * for compatibility with existing Javascript sort functions.
           *
           * `{type}-pre`: Functions defined take a single parameter:
           *
              *  1. `{*}` Data from the column cell to be prepared for ordering
           *
           * And return:
           *
           * * `{*}` Data to be sorted upon
           *
           * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
           * functions, taking two parameters:
           *
              *  1. `{*}` Data to compare to the second parameter
              *  2. `{*}` Data to compare to the first parameter
           *
           * And returning:
           *
           * * `{*}` Ordering match: <0 if first parameter should be sorted lower
           *   than the second parameter, ===0 if the two parameters are equal and
           *   >0 if the first parameter should be sorted height than the second
           *   parameter.
           * 
           *  @type object
           *  @default {}
           *
           *  @example
           *    // Numeric ordering of formatted numbers with a pre-formatter
           *    $.extend( $.fn.dataTable.ext.type.order, {
           *      "string-pre": function(x) {
           *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
           *        return parseFloat( a );
           *      }
           *    } );
           *
           *  @example
           *    // Case-sensitive string ordering, with no pre-formatting method
           *    $.extend( $.fn.dataTable.ext.order, {
           *      "string-case-asc": function(x,y) {
           *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
           *      },
           *      "string-case-desc": function(x,y) {
           *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
           *      }
           *    } );
           */
          order: {}
        },
        /**
         * Unique DataTables instance counter
         *
         * @type int
         * @private
         */
        _unique: 0,
        //
        // Depreciated
        // The following properties are retained for backwards compatibility only.
        // The should not be used in new projects and will be removed in a future
        // version
        //
        /**
         * Version check function.
         *  @type function
         *  @depreciated Since 1.10
         */
        fnVersionCheck: DataTable.fnVersionCheck,
        /**
         * Index for what 'this' index API functions should use
         *  @type int
         *  @deprecated Since v1.10
         */
        iApiIndex: 0,
        /**
         * Software version
         *  @type string
         *  @deprecated Since v1.10
         */
        sVersion: DataTable.version
      };
      $3.extend(_ext, {
        afnFiltering: _ext.search,
        aTypes: _ext.type.detect,
        ofnSearch: _ext.type.search,
        oSort: _ext.type.order,
        afnSortData: _ext.order,
        aoFeatures: _ext.feature,
        oStdClasses: _ext.classes,
        oPagination: _ext.pager
      });
      $3.extend(DataTable.ext.classes, {
        container: "dt-container",
        empty: {
          row: "dt-empty"
        },
        info: {
          container: "dt-info"
        },
        length: {
          container: "dt-length",
          select: "dt-input"
        },
        order: {
          canAsc: "dt-orderable-asc",
          canDesc: "dt-orderable-desc",
          isAsc: "dt-ordering-asc",
          isDesc: "dt-ordering-desc",
          none: "dt-orderable-none",
          position: "sorting_"
        },
        processing: {
          container: "dt-processing"
        },
        scrolling: {
          body: "dt-scroll-body",
          container: "dt-scroll",
          footer: {
            self: "dt-scroll-foot",
            inner: "dt-scroll-footInner"
          },
          header: {
            self: "dt-scroll-head",
            inner: "dt-scroll-headInner"
          }
        },
        search: {
          container: "dt-search",
          input: "dt-input"
        },
        table: "dataTable",
        tbody: {
          cell: "",
          row: ""
        },
        thead: {
          cell: "",
          row: ""
        },
        tfoot: {
          cell: "",
          row: ""
        },
        paging: {
          active: "current",
          button: "dt-paging-button",
          container: "dt-paging",
          disabled: "disabled"
        }
      });
      var _ext;
      var _Api;
      var _api_register;
      var _api_registerPlural;
      var _re_dic = {};
      var _re_new_lines = /[\r\n\u2028]/g;
      var _re_html = /<([^>]*>)/g;
      var _max_str_len = Math.pow(2, 28);
      var _re_date = /^\d{2,4}[./-]\d{1,2}[./-]\d{1,2}([T ]{1}\d{1,2}[:.]\d{2}([.:]\d{2})?)?$/;
      var _re_escape_regex = new RegExp("(\\" + ["/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^", "-"].join("|\\") + ")", "g");
      var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;
      var _empty = function(d) {
        return !d || d === true || d === "-" ? true : false;
      };
      var _intVal = function(s) {
        var integer = parseInt(s, 10);
        return !isNaN(integer) && isFinite(s) ? integer : null;
      };
      var _numToDecimal = function(num2, decimalPoint) {
        if (!_re_dic[decimalPoint]) {
          _re_dic[decimalPoint] = new RegExp(_fnEscapeRegex(decimalPoint), "g");
        }
        return typeof num2 === "string" && decimalPoint !== "." ? num2.replace(/\./g, "").replace(_re_dic[decimalPoint], ".") : num2;
      };
      var _isNumber = function(d, decimalPoint, formatted) {
        var type = typeof d;
        var strType = type === "string";
        if (type === "number" || type === "bigint") {
          return true;
        }
        if (_empty(d)) {
          return true;
        }
        if (decimalPoint && strType) {
          d = _numToDecimal(d, decimalPoint);
        }
        if (formatted && strType) {
          d = d.replace(_re_formatted_numeric, "");
        }
        return !isNaN(parseFloat(d)) && isFinite(d);
      };
      var _isHtml = function(d) {
        return _empty(d) || typeof d === "string";
      };
      var _htmlNumeric = function(d, decimalPoint, formatted) {
        if (_empty(d)) {
          return true;
        }
        if (typeof d === "string" && d.match(/<(input|select)/i)) {
          return null;
        }
        var html = _isHtml(d);
        return !html ? null : _isNumber(_stripHtml(d), decimalPoint, formatted) ? true : null;
      };
      var _pluck = function(a, prop, prop2) {
        var out = [];
        var i2 = 0, ien = a.length;
        if (prop2 !== void 0) {
          for (; i2 < ien; i2++) {
            if (a[i2] && a[i2][prop]) {
              out.push(a[i2][prop][prop2]);
            }
          }
        } else {
          for (; i2 < ien; i2++) {
            if (a[i2]) {
              out.push(a[i2][prop]);
            }
          }
        }
        return out;
      };
      var _pluck_order = function(a, order, prop, prop2) {
        var out = [];
        var i2 = 0, ien = order.length;
        if (prop2 !== void 0) {
          for (; i2 < ien; i2++) {
            if (a[order[i2]][prop]) {
              out.push(a[order[i2]][prop][prop2]);
            }
          }
        } else {
          for (; i2 < ien; i2++) {
            if (a[order[i2]]) {
              out.push(a[order[i2]][prop]);
            }
          }
        }
        return out;
      };
      var _range = function(len, start3) {
        var out = [];
        var end;
        if (start3 === void 0) {
          start3 = 0;
          end = len;
        } else {
          end = start3;
          start3 = len;
        }
        for (var i2 = start3; i2 < end; i2++) {
          out.push(i2);
        }
        return out;
      };
      var _removeEmpty = function(a) {
        var out = [];
        for (var i2 = 0, ien = a.length; i2 < ien; i2++) {
          if (a[i2]) {
            out.push(a[i2]);
          }
        }
        return out;
      };
      var _stripHtml = function(input) {
        if (input.length > _max_str_len) {
          throw new Error("Exceeded max str len");
        }
        var previous;
        input = input.replace(_re_html, "");
        do {
          previous = input;
          input = input.replace(/<script/i, "");
        } while (input !== previous);
        return previous;
      };
      var _escapeHtml = function(d) {
        if (Array.isArray(d)) {
          d = d.join(",");
        }
        return typeof d === "string" ? d.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : d;
      };
      var _normalize = function(str, both) {
        if (typeof str !== "string") {
          return str;
        }
        var res = str.normalize("NFD");
        return res.length !== str.length ? (both === true ? str + " " : "") + res.replace(/[\u0300-\u036f]/g, "") : res;
      };
      var _areAllUnique = function(src) {
        if (src.length < 2) {
          return true;
        }
        var sorted = src.slice().sort();
        var last = sorted[0];
        for (var i2 = 1, ien = sorted.length; i2 < ien; i2++) {
          if (sorted[i2] === last) {
            return false;
          }
          last = sorted[i2];
        }
        return true;
      };
      var _unique = function(src) {
        if (Array.from && Set) {
          return Array.from(new Set(src));
        }
        if (_areAllUnique(src)) {
          return src.slice();
        }
        var out = [], val, i2, ien = src.length, j, k = 0;
        again:
          for (i2 = 0; i2 < ien; i2++) {
            val = src[i2];
            for (j = 0; j < k; j++) {
              if (out[j] === val) {
                continue again;
              }
            }
            out.push(val);
            k++;
          }
        return out;
      };
      var _flatten = function(out, val) {
        if (Array.isArray(val)) {
          for (var i2 = 0; i2 < val.length; i2++) {
            _flatten(out, val[i2]);
          }
        } else {
          out.push(val);
        }
        return out;
      };
      function _addClass(el, name) {
        if (name) {
          name.split(" ").forEach(function(n) {
            if (n) {
              el.classList.add(n);
            }
          });
        }
      }
      DataTable.util = {
        /**
         * Return a string with diacritic characters decomposed
         * @param {*} mixed Function or string to normalize
         * @param {*} both Return original string and the normalized string
         * @returns String or undefined
         */
        diacritics: function(mixed, both) {
          var type = typeof mixed;
          if (type !== "function") {
            return _normalize(mixed, both);
          }
          _normalize = mixed;
        },
        /**
         * Debounce a function
         *
         * @param {function} fn Function to be called
         * @param {integer} freq Call frequency in mS
         * @return {function} Wrapped function
         */
        debounce: function(fn, timeout) {
          var timer;
          return function() {
            var that = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() {
              fn.apply(that, args);
            }, timeout || 250);
          };
        },
        /**
         * Throttle the calls to a function. Arguments and context are maintained
         * for the throttled function.
         *
         * @param {function} fn Function to be called
         * @param {integer} freq Call frequency in mS
         * @return {function} Wrapped function
         */
        throttle: function(fn, freq) {
          var frequency = freq !== void 0 ? freq : 200, last, timer;
          return function() {
            var that = this, now2 = +/* @__PURE__ */ new Date(), args = arguments;
            if (last && now2 < last + frequency) {
              clearTimeout(timer);
              timer = setTimeout(function() {
                last = void 0;
                fn.apply(that, args);
              }, frequency);
            } else {
              last = now2;
              fn.apply(that, args);
            }
          };
        },
        /**
         * Escape a string such that it can be used in a regular expression
         *
         *  @param {string} val string to escape
         *  @returns {string} escaped string
         */
        escapeRegex: function(val) {
          return val.replace(_re_escape_regex, "\\$1");
        },
        /**
         * Create a function that will write to a nested object or array
         * @param {*} source JSON notation string
         * @returns Write function
         */
        set: function(source) {
          if ($3.isPlainObject(source)) {
            return DataTable.util.set(source._);
          } else if (source === null) {
            return function() {
            };
          } else if (typeof source === "function") {
            return function(data, val, meta) {
              source(data, "set", val, meta);
            };
          } else if (typeof source === "string" && (source.indexOf(".") !== -1 || source.indexOf("[") !== -1 || source.indexOf("(") !== -1)) {
            var setData2 = function(data, val, src) {
              var a = _fnSplitObjNotation(src), b;
              var aLast = a[a.length - 1];
              var arrayNotation, funcNotation, o, innerSrc;
              for (var i2 = 0, iLen = a.length - 1; i2 < iLen; i2++) {
                if (a[i2] === "__proto__" || a[i2] === "constructor") {
                  throw new Error("Cannot set prototype values");
                }
                arrayNotation = a[i2].match(__reArray);
                funcNotation = a[i2].match(__reFn);
                if (arrayNotation) {
                  a[i2] = a[i2].replace(__reArray, "");
                  data[a[i2]] = [];
                  b = a.slice();
                  b.splice(0, i2 + 1);
                  innerSrc = b.join(".");
                  if (Array.isArray(val)) {
                    for (var j = 0, jLen = val.length; j < jLen; j++) {
                      o = {};
                      setData2(o, val[j], innerSrc);
                      data[a[i2]].push(o);
                    }
                  } else {
                    data[a[i2]] = val;
                  }
                  return;
                } else if (funcNotation) {
                  a[i2] = a[i2].replace(__reFn, "");
                  data = data[a[i2]](val);
                }
                if (data[a[i2]] === null || data[a[i2]] === void 0) {
                  data[a[i2]] = {};
                }
                data = data[a[i2]];
              }
              if (aLast.match(__reFn)) {
                data = data[aLast.replace(__reFn, "")](val);
              } else {
                data[aLast.replace(__reArray, "")] = val;
              }
            };
            return function(data, val) {
              return setData2(data, val, source);
            };
          } else {
            return function(data, val) {
              data[source] = val;
            };
          }
        },
        /**
         * Create a function that will read nested objects from arrays, based on JSON notation
         * @param {*} source JSON notation string
         * @returns Value read
         */
        get: function(source) {
          if ($3.isPlainObject(source)) {
            var o = {};
            $3.each(source, function(key, val) {
              if (val) {
                o[key] = DataTable.util.get(val);
              }
            });
            return function(data, type, row, meta) {
              var t = o[type] || o._;
              return t !== void 0 ? t(data, type, row, meta) : data;
            };
          } else if (source === null) {
            return function(data) {
              return data;
            };
          } else if (typeof source === "function") {
            return function(data, type, row, meta) {
              return source(data, type, row, meta);
            };
          } else if (typeof source === "string" && (source.indexOf(".") !== -1 || source.indexOf("[") !== -1 || source.indexOf("(") !== -1)) {
            var fetchData = function(data, type, src) {
              var arrayNotation, funcNotation, out, innerSrc;
              if (src !== "") {
                var a = _fnSplitObjNotation(src);
                for (var i2 = 0, iLen = a.length; i2 < iLen; i2++) {
                  arrayNotation = a[i2].match(__reArray);
                  funcNotation = a[i2].match(__reFn);
                  if (arrayNotation) {
                    a[i2] = a[i2].replace(__reArray, "");
                    if (a[i2] !== "") {
                      data = data[a[i2]];
                    }
                    out = [];
                    a.splice(0, i2 + 1);
                    innerSrc = a.join(".");
                    if (Array.isArray(data)) {
                      for (var j = 0, jLen = data.length; j < jLen; j++) {
                        out.push(fetchData(data[j], type, innerSrc));
                      }
                    }
                    var join = arrayNotation[0].substring(1, arrayNotation[0].length - 1);
                    data = join === "" ? out : out.join(join);
                    break;
                  } else if (funcNotation) {
                    a[i2] = a[i2].replace(__reFn, "");
                    data = data[a[i2]]();
                    continue;
                  }
                  if (data === null || data[a[i2]] === null) {
                    return null;
                  } else if (data === void 0 || data[a[i2]] === void 0) {
                    return void 0;
                  }
                  data = data[a[i2]];
                }
              }
              return data;
            };
            return function(data, type) {
              return fetchData(data, type, source);
            };
          } else {
            return function(data) {
              return data[source];
            };
          }
        },
        stripHtml: function(mixed) {
          var type = typeof mixed;
          if (type === "function") {
            _stripHtml = mixed;
            return;
          } else if (type === "string") {
            return _stripHtml(mixed);
          }
          return mixed;
        },
        escapeHtml: function(mixed) {
          var type = typeof mixed;
          if (type === "function") {
            _escapeHtml = mixed;
            return;
          } else if (type === "string" || Array.isArray(mixed)) {
            return _escapeHtml(mixed);
          }
          return mixed;
        },
        unique: _unique
      };
      function _fnHungarianMap(o) {
        var hungarian = "a aa ai ao as b fn i m o s ", match, newKey, map = {};
        $3.each(o, function(key) {
          match = key.match(/^([^A-Z]+?)([A-Z])/);
          if (match && hungarian.indexOf(match[1] + " ") !== -1) {
            newKey = key.replace(match[0], match[2].toLowerCase());
            map[newKey] = key;
            if (match[1] === "o") {
              _fnHungarianMap(o[key]);
            }
          }
        });
        o._hungarianMap = map;
      }
      function _fnCamelToHungarian(src, user, force) {
        if (!src._hungarianMap) {
          _fnHungarianMap(src);
        }
        var hungarianKey;
        $3.each(user, function(key) {
          hungarianKey = src._hungarianMap[key];
          if (hungarianKey !== void 0 && (force || user[hungarianKey] === void 0)) {
            if (hungarianKey.charAt(0) === "o") {
              if (!user[hungarianKey]) {
                user[hungarianKey] = {};
              }
              $3.extend(true, user[hungarianKey], user[key]);
              _fnCamelToHungarian(src[hungarianKey], user[hungarianKey], force);
            } else {
              user[hungarianKey] = user[key];
            }
          }
        });
      }
      var _fnCompatMap = function(o, knew, old) {
        if (o[knew] !== void 0) {
          o[old] = o[knew];
        }
      };
      function _fnCompatOpts(init) {
        _fnCompatMap(init, "ordering", "bSort");
        _fnCompatMap(init, "orderMulti", "bSortMulti");
        _fnCompatMap(init, "orderClasses", "bSortClasses");
        _fnCompatMap(init, "orderCellsTop", "bSortCellsTop");
        _fnCompatMap(init, "order", "aaSorting");
        _fnCompatMap(init, "orderFixed", "aaSortingFixed");
        _fnCompatMap(init, "paging", "bPaginate");
        _fnCompatMap(init, "pagingType", "sPaginationType");
        _fnCompatMap(init, "pageLength", "iDisplayLength");
        _fnCompatMap(init, "searching", "bFilter");
        if (typeof init.sScrollX === "boolean") {
          init.sScrollX = init.sScrollX ? "100%" : "";
        }
        if (typeof init.scrollX === "boolean") {
          init.scrollX = init.scrollX ? "100%" : "";
        }
        var searchCols = init.aoSearchCols;
        if (searchCols) {
          for (var i2 = 0, ien = searchCols.length; i2 < ien; i2++) {
            if (searchCols[i2]) {
              _fnCamelToHungarian(DataTable.models.oSearch, searchCols[i2]);
            }
          }
        }
        if (init.serverSide && !init.searchDelay) {
          init.searchDelay = 400;
        }
      }
      function _fnCompatCols(init) {
        _fnCompatMap(init, "orderable", "bSortable");
        _fnCompatMap(init, "orderData", "aDataSort");
        _fnCompatMap(init, "orderSequence", "asSorting");
        _fnCompatMap(init, "orderDataType", "sortDataType");
        var dataSort = init.aDataSort;
        if (typeof dataSort === "number" && !Array.isArray(dataSort)) {
          init.aDataSort = [dataSort];
        }
      }
      function _fnBrowserDetect(settings) {
        if (!DataTable.__browser) {
          var browser = {};
          DataTable.__browser = browser;
          var n = $3("<div/>").css({
            position: "fixed",
            top: 0,
            left: -1 * window2.pageXOffset,
            // allow for scrolling
            height: 1,
            width: 1,
            overflow: "hidden"
          }).append(
            $3("<div/>").css({
              position: "absolute",
              top: 1,
              left: 1,
              width: 100,
              overflow: "scroll"
            }).append(
              $3("<div/>").css({
                width: "100%",
                height: 10
              })
            )
          ).appendTo("body");
          var outer = n.children();
          var inner = outer.children();
          browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
          browser.bScrollbarLeft = Math.round(inner.offset().left) !== 1;
          n.remove();
        }
        $3.extend(settings.oBrowser, DataTable.__browser);
        settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
      }
      function _fnAddColumn(oSettings) {
        var oDefaults = DataTable.defaults.column;
        var iCol = oSettings.aoColumns.length;
        var oCol = $3.extend({}, DataTable.models.oColumn, oDefaults, {
          "aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
          "mData": oDefaults.mData ? oDefaults.mData : iCol,
          idx: iCol,
          searchFixed: {},
          colEl: $3("<col>").attr("data-dt-column", iCol)
        });
        oSettings.aoColumns.push(oCol);
        var searchCols = oSettings.aoPreSearchCols;
        searchCols[iCol] = $3.extend({}, DataTable.models.oSearch, searchCols[iCol]);
      }
      function _fnColumnOptions(oSettings, iCol, oOptions) {
        var oCol = oSettings.aoColumns[iCol];
        if (oOptions !== void 0 && oOptions !== null) {
          _fnCompatCols(oOptions);
          _fnCamelToHungarian(DataTable.defaults.column, oOptions, true);
          if (oOptions.mDataProp !== void 0 && !oOptions.mData) {
            oOptions.mData = oOptions.mDataProp;
          }
          if (oOptions.sType) {
            oCol._sManualType = oOptions.sType;
          }
          if (oOptions.className && !oOptions.sClass) {
            oOptions.sClass = oOptions.className;
          }
          var origClass = oCol.sClass;
          $3.extend(oCol, oOptions);
          _fnMap(oCol, oOptions, "sWidth", "sWidthOrig");
          if (origClass !== oCol.sClass) {
            oCol.sClass = origClass + " " + oCol.sClass;
          }
          if (oOptions.iDataSort !== void 0) {
            oCol.aDataSort = [oOptions.iDataSort];
          }
          _fnMap(oCol, oOptions, "aDataSort");
        }
        var mDataSrc = oCol.mData;
        var mData = _fnGetObjectDataFn(mDataSrc);
        if (oCol.mRender && Array.isArray(oCol.mRender)) {
          var copy = oCol.mRender.slice();
          var name = copy.shift();
          oCol.mRender = DataTable.render[name].apply(window2, copy);
        }
        oCol._render = oCol.mRender ? _fnGetObjectDataFn(oCol.mRender) : null;
        var attrTest = function(src) {
          return typeof src === "string" && src.indexOf("@") !== -1;
        };
        oCol._bAttrSrc = $3.isPlainObject(mDataSrc) && (attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter));
        oCol._setter = null;
        oCol.fnGetData = function(rowData, type, meta) {
          var innerData = mData(rowData, type, void 0, meta);
          return oCol._render && type ? oCol._render(innerData, type, rowData, meta) : innerData;
        };
        oCol.fnSetData = function(rowData, val, meta) {
          return _fnSetObjectDataFn(mDataSrc)(rowData, val, meta);
        };
        if (typeof mDataSrc !== "number" && !oCol._isArrayHost) {
          oSettings._rowReadObject = true;
        }
        if (!oSettings.oFeatures.bSort) {
          oCol.bSortable = false;
        }
      }
      function _fnAdjustColumnSizing(settings) {
        _fnCalculateColumnWidths(settings);
        _fnColumnSizes(settings);
        var scroll = settings.oScroll;
        if (scroll.sY !== "" || scroll.sX !== "") {
          _fnScrollDraw(settings);
        }
        _fnCallbackFire(settings, null, "column-sizing", [settings]);
      }
      function _fnColumnSizes(settings) {
        var cols = settings.aoColumns;
        for (var i2 = 0; i2 < cols.length; i2++) {
          var width = _fnColumnsSumWidth(settings, [i2], false, false);
          cols[i2].colEl.css("width", width);
        }
      }
      function _fnVisibleToColumnIndex(oSettings, iMatch) {
        var aiVis = _fnGetColumns(oSettings, "bVisible");
        return typeof aiVis[iMatch] === "number" ? aiVis[iMatch] : null;
      }
      function _fnColumnIndexToVisible(oSettings, iMatch) {
        var aiVis = _fnGetColumns(oSettings, "bVisible");
        var iPos = aiVis.indexOf(iMatch);
        return iPos !== -1 ? iPos : null;
      }
      function _fnVisbleColumns(settings) {
        var layout = settings.aoHeader;
        var columns = settings.aoColumns;
        var vis = 0;
        if (layout.length) {
          for (var i2 = 0, ien = layout[0].length; i2 < ien; i2++) {
            if (columns[i2].bVisible && $3(layout[0][i2].cell).css("display") !== "none") {
              vis++;
            }
          }
        }
        return vis;
      }
      function _fnGetColumns(oSettings, sParam) {
        var a = [];
        oSettings.aoColumns.map(function(val, i2) {
          if (val[sParam]) {
            a.push(i2);
          }
        });
        return a;
      }
      function _fnColumnTypes(settings) {
        var columns = settings.aoColumns;
        var data = settings.aoData;
        var types = DataTable.ext.type.detect;
        var i2, ien, j, jen, k, ken;
        var col, detectedType, cache2;
        for (i2 = 0, ien = columns.length; i2 < ien; i2++) {
          col = columns[i2];
          cache2 = [];
          if (!col.sType && col._sManualType) {
            col.sType = col._sManualType;
          } else if (!col.sType) {
            for (j = 0, jen = types.length; j < jen; j++) {
              for (k = 0, ken = data.length; k < ken; k++) {
                if (!data[k]) {
                  continue;
                }
                if (cache2[k] === void 0) {
                  cache2[k] = _fnGetCellData(settings, k, i2, "type");
                }
                detectedType = types[j](cache2[k], settings);
                if (!detectedType && j !== types.length - 2) {
                  break;
                }
                if (detectedType === "html" && !_empty(cache2[k])) {
                  break;
                }
              }
              if (detectedType) {
                col.sType = detectedType;
                break;
              }
            }
            if (!col.sType) {
              col.sType = "string";
            }
          }
          var autoClass = _ext.type.className[col.sType];
          if (autoClass) {
            _columnAutoClass(settings.aoHeader, i2, autoClass);
            _columnAutoClass(settings.aoFooter, i2, autoClass);
          }
          var renderer = _ext.type.render[col.sType];
          if (renderer && !col._render) {
            col._render = DataTable.util.get(renderer);
            _columnAutoRender(settings, i2);
          }
        }
      }
      function _columnAutoRender(settings, colIdx) {
        var data = settings.aoData;
        for (var i2 = 0; i2 < data.length; i2++) {
          if (data[i2].nTr) {
            var display = _fnGetCellData(settings, i2, colIdx, "display");
            data[i2].displayData[colIdx] = display;
            _fnWriteCell(data[i2].anCells[colIdx], display);
          }
        }
      }
      function _columnAutoClass(container, colIdx, className) {
        container.forEach(function(row) {
          if (row[colIdx] && row[colIdx].unique) {
            _addClass(row[colIdx].cell, className);
          }
        });
      }
      function _fnApplyColumnDefs(oSettings, aoColDefs, aoCols, headerLayout, fn) {
        var i2, iLen, j, jLen, k, kLen, def;
        var columns = oSettings.aoColumns;
        if (aoCols) {
          for (i2 = 0, iLen = aoCols.length; i2 < iLen; i2++) {
            if (aoCols[i2] && aoCols[i2].name) {
              columns[i2].sName = aoCols[i2].name;
            }
          }
        }
        if (aoColDefs) {
          for (i2 = aoColDefs.length - 1; i2 >= 0; i2--) {
            def = aoColDefs[i2];
            var aTargets = def.target !== void 0 ? def.target : def.targets !== void 0 ? def.targets : def.aTargets;
            if (!Array.isArray(aTargets)) {
              aTargets = [aTargets];
            }
            for (j = 0, jLen = aTargets.length; j < jLen; j++) {
              var target = aTargets[j];
              if (typeof target === "number" && target >= 0) {
                while (columns.length <= target) {
                  _fnAddColumn(oSettings);
                }
                fn(target, def);
              } else if (typeof target === "number" && target < 0) {
                fn(columns.length + target, def);
              } else if (typeof target === "string") {
                for (k = 0, kLen = columns.length; k < kLen; k++) {
                  if (target === "_all") {
                    fn(k, def);
                  } else if (target.indexOf(":name") !== -1) {
                    if (columns[k].sName === target.replace(":name", "")) {
                      fn(k, def);
                    }
                  } else {
                    headerLayout.forEach(function(row) {
                      if (row[k]) {
                        var cell = $3(row[k].cell);
                        if (target.match(/^[a-z][\w-]*$/i)) {
                          target = "." + target;
                        }
                        if (cell.is(target)) {
                          fn(k, def);
                        }
                      }
                    });
                  }
                }
              }
            }
          }
        }
        if (aoCols) {
          for (i2 = 0, iLen = aoCols.length; i2 < iLen; i2++) {
            fn(i2, aoCols[i2]);
          }
        }
      }
      function _fnColumnsSumWidth(settings, targets, original, incVisible) {
        if (!Array.isArray(targets)) {
          targets = _fnColumnsFromHeader(targets);
        }
        var sum = 0;
        var unit;
        var columns = settings.aoColumns;
        for (var i2 = 0, ien = targets.length; i2 < ien; i2++) {
          var column = columns[targets[i2]];
          var definedWidth = original ? column.sWidthOrig : column.sWidth;
          if (!incVisible && column.bVisible === false) {
            continue;
          }
          if (definedWidth === null || definedWidth === void 0) {
            return null;
          } else if (typeof definedWidth === "number") {
            unit = "px";
            sum += definedWidth;
          } else {
            var matched = definedWidth.match(/([\d\.]+)([^\d]*)/);
            if (matched) {
              sum += matched[1] * 1;
              unit = matched.length === 3 ? matched[2] : "px";
            }
          }
        }
        return sum + unit;
      }
      function _fnColumnsFromHeader(cell) {
        var attr = $3(cell).closest("[data-dt-column]").attr("data-dt-column");
        if (!attr) {
          return [];
        }
        return attr.split(",").map(function(val) {
          return val * 1;
        });
      }
      function _fnAddData(settings, dataIn, tr, tds) {
        var rowIdx = settings.aoData.length;
        var rowModel = $3.extend(true, {}, DataTable.models.oRow, {
          src: tr ? "dom" : "data",
          idx: rowIdx
        });
        rowModel._aData = dataIn;
        settings.aoData.push(rowModel);
        var columns = settings.aoColumns;
        for (var i2 = 0, iLen = columns.length; i2 < iLen; i2++) {
          columns[i2].sType = null;
        }
        settings.aiDisplayMaster.push(rowIdx);
        var id = settings.rowIdFn(dataIn);
        if (id !== void 0) {
          settings.aIds[id] = rowModel;
        }
        if (tr || !settings.oFeatures.bDeferRender) {
          _fnCreateTr(settings, rowIdx, tr, tds);
        }
        return rowIdx;
      }
      function _fnAddTr(settings, trs) {
        var row;
        if (!(trs instanceof $3)) {
          trs = $3(trs);
        }
        return trs.map(function(i2, el) {
          row = _fnGetRowElements(settings, el);
          return _fnAddData(settings, row.data, el, row.cells);
        });
      }
      function _fnGetCellData(settings, rowIdx, colIdx, type) {
        if (type === "search") {
          type = "filter";
        } else if (type === "order") {
          type = "sort";
        }
        var row = settings.aoData[rowIdx];
        if (!row) {
          return void 0;
        }
        var draw = settings.iDraw;
        var col = settings.aoColumns[colIdx];
        var rowData = row._aData;
        var defaultContent = col.sDefaultContent;
        var cellData = col.fnGetData(rowData, type, {
          settings,
          row: rowIdx,
          col: colIdx
        });
        if (type !== "display" && cellData && typeof cellData === "object" && cellData.nodeName) {
          cellData = cellData.innerHTML;
        }
        if (cellData === void 0) {
          if (settings.iDrawError != draw && defaultContent === null) {
            _fnLog(settings, 0, "Requested unknown parameter " + (typeof col.mData == "function" ? "{function}" : "'" + col.mData + "'") + " for row " + rowIdx + ", column " + colIdx, 4);
            settings.iDrawError = draw;
          }
          return defaultContent;
        }
        if ((cellData === rowData || cellData === null) && defaultContent !== null && type !== void 0) {
          cellData = defaultContent;
        } else if (typeof cellData === "function") {
          return cellData.call(rowData);
        }
        if (cellData === null && type === "display") {
          return "";
        }
        if (type === "filter") {
          var fomatters = DataTable.ext.type.search;
          if (fomatters[col.sType]) {
            cellData = fomatters[col.sType](cellData);
          }
        }
        return cellData;
      }
      function _fnSetCellData(settings, rowIdx, colIdx, val) {
        var col = settings.aoColumns[colIdx];
        var rowData = settings.aoData[rowIdx]._aData;
        col.fnSetData(rowData, val, {
          settings,
          row: rowIdx,
          col: colIdx
        });
      }
      function _fnWriteCell(td, val) {
        if (val && typeof val === "object" && val.nodeName) {
          $3(td).empty().append(val);
        } else {
          td.innerHTML = val;
        }
      }
      var __reArray = /\[.*?\]$/;
      var __reFn = /\(\)$/;
      function _fnSplitObjNotation(str) {
        var parts = str.match(/(\\.|[^.])+/g) || [""];
        return parts.map(function(s) {
          return s.replace(/\\\./g, ".");
        });
      }
      var _fnGetObjectDataFn = DataTable.util.get;
      var _fnSetObjectDataFn = DataTable.util.set;
      function _fnGetDataMaster(settings) {
        return _pluck(settings.aoData, "_aData");
      }
      function _fnClearTable(settings) {
        settings.aoData.length = 0;
        settings.aiDisplayMaster.length = 0;
        settings.aiDisplay.length = 0;
        settings.aIds = {};
      }
      function _fnInvalidate(settings, rowIdx, src, colIdx) {
        var row = settings.aoData[rowIdx];
        var i2, ien;
        row._aSortData = null;
        row._aFilterData = null;
        row.displayData = null;
        if (src === "dom" || (!src || src === "auto") && row.src === "dom") {
          row._aData = _fnGetRowElements(
            settings,
            row,
            colIdx,
            colIdx === void 0 ? void 0 : row._aData
          ).data;
        } else {
          var cells = row.anCells;
          var display = _fnGetRowDisplay(settings, rowIdx);
          if (cells) {
            if (colIdx !== void 0) {
              _fnWriteCell(cells[colIdx], display[colIdx]);
            } else {
              for (i2 = 0, ien = cells.length; i2 < ien; i2++) {
                _fnWriteCell(cells[i2], display[i2]);
              }
            }
          }
        }
        var cols = settings.aoColumns;
        if (colIdx !== void 0) {
          cols[colIdx].sType = null;
          cols[colIdx].maxLenString = null;
        } else {
          for (i2 = 0, ien = cols.length; i2 < ien; i2++) {
            cols[i2].sType = null;
            cols[i2].maxLenString = null;
          }
          _fnRowAttributes(settings, row);
        }
      }
      function _fnGetRowElements(settings, row, colIdx, d) {
        var tds = [], td = row.firstChild, name, col, i2 = 0, contents, columns = settings.aoColumns, objectRead = settings._rowReadObject;
        d = d !== void 0 ? d : objectRead ? {} : [];
        var attr = function(str, td2) {
          if (typeof str === "string") {
            var idx = str.indexOf("@");
            if (idx !== -1) {
              var attr2 = str.substring(idx + 1);
              var setter = _fnSetObjectDataFn(str);
              setter(d, td2.getAttribute(attr2));
            }
          }
        };
        var cellProcess = function(cell) {
          if (colIdx === void 0 || colIdx === i2) {
            col = columns[i2];
            contents = cell.innerHTML.trim();
            if (col && col._bAttrSrc) {
              var setter = _fnSetObjectDataFn(col.mData._);
              setter(d, contents);
              attr(col.mData.sort, cell);
              attr(col.mData.type, cell);
              attr(col.mData.filter, cell);
            } else {
              if (objectRead) {
                if (!col._setter) {
                  col._setter = _fnSetObjectDataFn(col.mData);
                }
                col._setter(d, contents);
              } else {
                d[i2] = contents;
              }
            }
          }
          i2++;
        };
        if (td) {
          while (td) {
            name = td.nodeName.toUpperCase();
            if (name == "TD" || name == "TH") {
              cellProcess(td);
              tds.push(td);
            }
            td = td.nextSibling;
          }
        } else {
          tds = row.anCells;
          for (var j = 0, jen = tds.length; j < jen; j++) {
            cellProcess(tds[j]);
          }
        }
        var rowNode = row.firstChild ? row : row.nTr;
        if (rowNode) {
          var id = rowNode.getAttribute("id");
          if (id) {
            _fnSetObjectDataFn(settings.rowId)(d, id);
          }
        }
        return {
          data: d,
          cells: tds
        };
      }
      function _fnGetRowDisplay(settings, rowIdx) {
        let rowModal = settings.aoData[rowIdx];
        let columns = settings.aoColumns;
        if (!rowModal.displayData) {
          rowModal.displayData = [];
          for (var colIdx = 0, len = columns.length; colIdx < len; colIdx++) {
            rowModal.displayData.push(
              _fnGetCellData(settings, rowIdx, colIdx, "display")
            );
          }
        }
        return rowModal.displayData;
      }
      function _fnCreateTr(oSettings, iRow, nTrIn, anTds) {
        var row = oSettings.aoData[iRow], rowData = row._aData, cells = [], nTr, nTd, oCol, i2, iLen, create, trClass = oSettings.oClasses.tbody.row;
        if (row.nTr === null) {
          nTr = nTrIn || document2.createElement("tr");
          row.nTr = nTr;
          row.anCells = cells;
          _addClass(nTr, trClass);
          nTr._DT_RowIndex = iRow;
          _fnRowAttributes(oSettings, row);
          for (i2 = 0, iLen = oSettings.aoColumns.length; i2 < iLen; i2++) {
            oCol = oSettings.aoColumns[i2];
            create = nTrIn && anTds[i2] ? false : true;
            nTd = create ? document2.createElement(oCol.sCellType) : anTds[i2];
            if (!nTd) {
              _fnLog(oSettings, 0, "Incorrect column count", 18);
            }
            nTd._DT_CellIndex = {
              row: iRow,
              column: i2
            };
            cells.push(nTd);
            var display = _fnGetRowDisplay(oSettings, iRow);
            if (create || (oCol.mRender || oCol.mData !== i2) && (!$3.isPlainObject(oCol.mData) || oCol.mData._ !== i2 + ".display")) {
              _fnWriteCell(nTd, display[i2]);
            }
            if (oCol.bVisible && create) {
              nTr.appendChild(nTd);
            } else if (!oCol.bVisible && !create) {
              nTd.parentNode.removeChild(nTd);
            }
            if (oCol.fnCreatedCell) {
              oCol.fnCreatedCell.call(
                oSettings.oInstance,
                nTd,
                _fnGetCellData(oSettings, iRow, i2),
                rowData,
                iRow,
                i2
              );
            }
          }
          _fnCallbackFire(oSettings, "aoRowCreatedCallback", "row-created", [nTr, rowData, iRow, cells]);
        } else {
          _addClass(row.nTr, trClass);
        }
      }
      function _fnRowAttributes(settings, row) {
        var tr = row.nTr;
        var data = row._aData;
        if (tr) {
          var id = settings.rowIdFn(data);
          if (id) {
            tr.id = id;
          }
          if (data.DT_RowClass) {
            var a = data.DT_RowClass.split(" ");
            row.__rowc = row.__rowc ? _unique(row.__rowc.concat(a)) : a;
            $3(tr).removeClass(row.__rowc.join(" ")).addClass(data.DT_RowClass);
          }
          if (data.DT_RowAttr) {
            $3(tr).attr(data.DT_RowAttr);
          }
          if (data.DT_RowData) {
            $3(tr).data(data.DT_RowData);
          }
        }
      }
      function _fnBuildHead(settings, side) {
        var classes = settings.oClasses;
        var columns = settings.aoColumns;
        var i2, ien, row;
        var target = side === "header" ? settings.nTHead : settings.nTFoot;
        var titleProp = side === "header" ? "sTitle" : side;
        if (!target) {
          return;
        }
        if (side === "header" || _pluck(settings.aoColumns, titleProp).join("")) {
          row = $3("tr", target);
          if (!row.length) {
            row = $3("<tr/>").appendTo(target);
          }
          if (row.length === 1) {
            var cells = $3("td, th", row);
            for (i2 = cells.length, ien = columns.length; i2 < ien; i2++) {
              $3("<th/>").html(columns[i2][titleProp] || "").appendTo(row);
            }
          }
        }
        var detected = _fnDetectHeader(settings, target, true);
        if (side === "header") {
          settings.aoHeader = detected;
        } else {
          settings.aoFooter = detected;
        }
        $3(target).children("tr").attr("role", "row");
        $3(target).children("tr").children("th, td").each(function() {
          _fnRenderer(settings, side)(
            settings,
            $3(this),
            classes
          );
        });
      }
      function _fnHeaderLayout(settings, source, incColumns) {
        var row, column, cell;
        var local = [];
        var structure = [];
        var columns = settings.aoColumns;
        var columnCount = columns.length;
        var rowspan, colspan;
        if (!source) {
          return;
        }
        if (!incColumns) {
          incColumns = _range(columnCount).filter(function(idx) {
            return columns[idx].bVisible;
          });
        }
        for (row = 0; row < source.length; row++) {
          local[row] = source[row].slice().filter(function(cell2, i2) {
            return incColumns.includes(i2);
          });
          structure.push([]);
        }
        for (row = 0; row < local.length; row++) {
          for (column = 0; column < local[row].length; column++) {
            rowspan = 1;
            colspan = 1;
            if (structure[row][column] === void 0) {
              cell = local[row][column].cell;
              while (local[row + rowspan] !== void 0 && local[row][column].cell == local[row + rowspan][column].cell) {
                structure[row + rowspan][column] = null;
                rowspan++;
              }
              while (local[row][column + colspan] !== void 0 && local[row][column].cell == local[row][column + colspan].cell) {
                for (var k = 0; k < rowspan; k++) {
                  structure[row + k][column + colspan] = null;
                }
                colspan++;
              }
              var titleSpan = $3("span.dt-column-title", cell);
              structure[row][column] = {
                cell,
                colspan,
                rowspan,
                title: titleSpan.length ? titleSpan.html() : $3(cell).html()
              };
            }
          }
        }
        return structure;
      }
      function _fnDrawHead(settings, source) {
        var layout = _fnHeaderLayout(settings, source);
        var tr, n;
        for (var row = 0; row < source.length; row++) {
          tr = source[row].row;
          if (tr) {
            while (n = tr.firstChild) {
              tr.removeChild(n);
            }
          }
          for (var column = 0; column < layout[row].length; column++) {
            var point = layout[row][column];
            if (point) {
              $3(point.cell).appendTo(tr).attr("rowspan", point.rowspan).attr("colspan", point.colspan);
            }
          }
        }
      }
      function _fnDraw(oSettings, ajaxComplete) {
        _fnStart(oSettings);
        var aPreDraw = _fnCallbackFire(oSettings, "aoPreDrawCallback", "preDraw", [oSettings]);
        if (aPreDraw.indexOf(false) !== -1) {
          _fnProcessingDisplay(oSettings, false);
          return;
        }
        var anRows = [];
        var iRowCount = 0;
        var bServerSide = _fnDataSource(oSettings) == "ssp";
        var aiDisplay = oSettings.aiDisplay;
        var iDisplayStart = oSettings._iDisplayStart;
        var iDisplayEnd = oSettings.fnDisplayEnd();
        var columns = oSettings.aoColumns;
        var body = $3(oSettings.nTBody);
        oSettings.bDrawing = true;
        if (!bServerSide) {
          oSettings.iDraw++;
        } else if (!oSettings.bDestroying && !ajaxComplete) {
          if (oSettings.iDraw === 0) {
            body.empty().append(_emptyRow(oSettings));
          }
          _fnAjaxUpdate(oSettings);
          return;
        }
        if (aiDisplay.length !== 0) {
          var iStart = bServerSide ? 0 : iDisplayStart;
          var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
          for (var j = iStart; j < iEnd; j++) {
            var iDataIndex = aiDisplay[j];
            var aoData = oSettings.aoData[iDataIndex];
            if (aoData.nTr === null) {
              _fnCreateTr(oSettings, iDataIndex);
            }
            var nRow = aoData.nTr;
            for (var i2 = 0; i2 < columns.length; i2++) {
              var col = columns[i2];
              var td = aoData.anCells[i2];
              _addClass(td, _ext.type.className[col.sType]);
              _addClass(td, col.sClass);
              _addClass(td, oSettings.oClasses.tbody.cell);
            }
            _fnCallbackFire(
              oSettings,
              "aoRowCallback",
              null,
              [nRow, aoData._aData, iRowCount, j, iDataIndex]
            );
            anRows.push(nRow);
            iRowCount++;
          }
        } else {
          anRows[0] = _emptyRow(oSettings);
        }
        _fnCallbackFire(oSettings, "aoHeaderCallback", "header", [
          $3(oSettings.nTHead).children("tr")[0],
          _fnGetDataMaster(oSettings),
          iDisplayStart,
          iDisplayEnd,
          aiDisplay
        ]);
        _fnCallbackFire(oSettings, "aoFooterCallback", "footer", [
          $3(oSettings.nTFoot).children("tr")[0],
          _fnGetDataMaster(oSettings),
          iDisplayStart,
          iDisplayEnd,
          aiDisplay
        ]);
        if (body[0].replaceChildren) {
          body[0].replaceChildren.apply(body[0], anRows);
        } else {
          body.children().detach();
          body.append($3(anRows));
        }
        $3(oSettings.nTableWrapper).toggleClass("dt-empty-footer", $3("tr", oSettings.nTFoot).length === 0);
        _fnCallbackFire(oSettings, "aoDrawCallback", "draw", [oSettings], true);
        oSettings.bSorted = false;
        oSettings.bFiltered = false;
        oSettings.bDrawing = false;
      }
      function _fnReDraw(settings, holdPosition, recompute) {
        var features = settings.oFeatures, sort = features.bSort, filter = features.bFilter;
        if (recompute === void 0 || recompute === true) {
          if (sort) {
            _fnSort(settings);
          }
          if (filter) {
            _fnFilterComplete(settings, settings.oPreviousSearch);
          } else {
            settings.aiDisplay = settings.aiDisplayMaster.slice();
          }
        }
        if (holdPosition !== true) {
          settings._iDisplayStart = 0;
        }
        settings._drawHold = holdPosition;
        _fnDraw(settings);
        settings._drawHold = false;
      }
      function _emptyRow(settings) {
        var oLang = settings.oLanguage;
        var zero = oLang.sZeroRecords;
        var dataSrc = _fnDataSource(settings);
        if (settings.iDraw < 1 && dataSrc === "ssp" || settings.iDraw <= 1 && dataSrc === "ajax") {
          zero = oLang.sLoadingRecords;
        } else if (oLang.sEmptyTable && settings.fnRecordsTotal() === 0) {
          zero = oLang.sEmptyTable;
        }
        return $3("<tr/>").append($3("<td />", {
          "colSpan": _fnVisbleColumns(settings),
          "class": settings.oClasses.empty.row
        }).html(zero))[0];
      }
      function _layoutArray(settings, layout, side) {
        var groups = {};
        $3.each(layout, function(pos, val) {
          if (val === null) {
            return;
          }
          var splitPos = pos.replace(/([A-Z])/g, " $1").split(" ");
          if (!groups[splitPos[0]]) {
            groups[splitPos[0]] = {};
          }
          var align = splitPos.length === 1 ? "full" : splitPos[1].toLowerCase();
          var group = groups[splitPos[0]];
          var groupRun = function(contents, innerVal) {
            if ($3.isPlainObject(innerVal)) {
              Object.keys(innerVal).map(function(key) {
                contents.push({
                  feature: key,
                  opts: innerVal[key]
                });
              });
            } else {
              contents.push(innerVal);
            }
          };
          if (!group[align] || !group[align].contents) {
            group[align] = { contents: [] };
          }
          if (Array.isArray(val)) {
            for (var i3 = 0; i3 < val.length; i3++) {
              groupRun(group[align].contents, val[i3]);
            }
          } else {
            groupRun(group[align].contents, val);
          }
          if (!Array.isArray(group[align].contents)) {
            group[align].contents = [group[align].contents];
          }
        });
        var filtered = Object.keys(groups).map(function(pos) {
          if (pos.indexOf(side) !== 0) {
            return null;
          }
          return {
            name: pos,
            val: groups[pos]
          };
        }).filter(function(item) {
          return item !== null;
        });
        filtered.sort(function(a, b) {
          var order1 = a.name.replace(/[^0-9]/g, "") * 1;
          var order2 = b.name.replace(/[^0-9]/g, "") * 1;
          return order2 - order1;
        });
        if (side === "bottom") {
          filtered.reverse();
        }
        var rows = [];
        for (var i2 = 0, ien = filtered.length; i2 < ien; i2++) {
          if (filtered[i2].val.full) {
            rows.push({ full: filtered[i2].val.full });
            _layoutResolve(settings, rows[rows.length - 1]);
            delete filtered[i2].val.full;
          }
          if (Object.keys(filtered[i2].val).length) {
            rows.push(filtered[i2].val);
            _layoutResolve(settings, rows[rows.length - 1]);
          }
        }
        return rows;
      }
      function _layoutResolve(settings, row) {
        var getFeature = function(feature, opts) {
          if (!_ext.features[feature]) {
            _fnLog(settings, 0, "Unknown feature: " + feature);
          }
          return _ext.features[feature].apply(this, [settings, opts]);
        };
        var resolve = function(item) {
          var line = row[item].contents;
          for (var i2 = 0, ien = line.length; i2 < ien; i2++) {
            if (!line[i2]) {
              continue;
            } else if (typeof line[i2] === "string") {
              line[i2] = getFeature(line[i2], null);
            } else if ($3.isPlainObject(line[i2])) {
              line[i2] = getFeature(line[i2].feature, line[i2].opts);
            } else if (typeof line[i2].node === "function") {
              line[i2] = line[i2].node(settings);
            } else if (typeof line[i2] === "function") {
              var inst = line[i2](settings);
              line[i2] = typeof inst.node === "function" ? inst.node() : inst;
            }
          }
        };
        $3.each(row, function(key) {
          resolve(key);
        });
      }
      function _fnAddOptionsHtml(settings) {
        var classes = settings.oClasses;
        var table = $3(settings.nTable);
        var insert = $3("<div/>").attr({
          id: settings.sTableId + "_wrapper",
          "class": classes.container
        }).insertBefore(table);
        settings.nTableWrapper = insert[0];
        if (settings.sDom) {
          _fnLayoutDom(settings, settings.sDom, insert);
        } else {
          var top = _layoutArray(settings, settings.layout, "top");
          var bottom = _layoutArray(settings, settings.layout, "bottom");
          var renderer = _fnRenderer(settings, "layout");
          top.forEach(function(item) {
            renderer(settings, insert, item);
          });
          renderer(settings, insert, {
            full: {
              table: true,
              contents: [_fnFeatureHtmlTable(settings)]
            }
          });
          bottom.forEach(function(item) {
            renderer(settings, insert, item);
          });
        }
        _processingHtml(settings);
      }
      function _fnLayoutDom(settings, dom, insert) {
        var parts = dom.match(/(".*?")|('.*?')|./g);
        var featureNode, option, newNode, next, attr;
        for (var i2 = 0; i2 < parts.length; i2++) {
          featureNode = null;
          option = parts[i2];
          if (option == "<") {
            newNode = $3("<div/>");
            next = parts[i2 + 1];
            if (next[0] == "'" || next[0] == '"') {
              attr = next.replace(/['"]/g, "");
              var id = "", className;
              if (attr.indexOf(".") != -1) {
                var split = attr.split(".");
                id = split[0];
                className = split[1];
              } else if (attr[0] == "#") {
                id = attr;
              } else {
                className = attr;
              }
              newNode.attr("id", id.substring(1)).addClass(className);
              i2++;
            }
            insert.append(newNode);
            insert = newNode;
          } else if (option == ">") {
            insert = insert.parent();
          } else if (option == "t") {
            featureNode = _fnFeatureHtmlTable(settings);
          } else {
            DataTable.ext.feature.forEach(function(feature) {
              if (option == feature.cFeature) {
                featureNode = feature.fnInit(settings);
              }
            });
          }
          if (featureNode) {
            insert.append(featureNode);
          }
        }
      }
      function _fnDetectHeader(settings, thead, write) {
        var columns = settings.aoColumns;
        var rows = $3(thead).children("tr");
        var row, cell;
        var i2, k, l, iLen, shifted, column, colspan, rowspan;
        var isHeader = thead && thead.nodeName.toLowerCase() === "thead";
        var layout = [];
        var unique;
        var shift = function(a, i3, j) {
          var k2 = a[i3];
          while (k2[j]) {
            j++;
          }
          return j;
        };
        for (i2 = 0, iLen = rows.length; i2 < iLen; i2++) {
          layout.push([]);
        }
        for (i2 = 0, iLen = rows.length; i2 < iLen; i2++) {
          row = rows[i2];
          column = 0;
          cell = row.firstChild;
          while (cell) {
            if (cell.nodeName.toUpperCase() == "TD" || cell.nodeName.toUpperCase() == "TH") {
              var cols = [];
              colspan = cell.getAttribute("colspan") * 1;
              rowspan = cell.getAttribute("rowspan") * 1;
              colspan = !colspan || colspan === 0 || colspan === 1 ? 1 : colspan;
              rowspan = !rowspan || rowspan === 0 || rowspan === 1 ? 1 : rowspan;
              shifted = shift(layout, i2, column);
              unique = colspan === 1 ? true : false;
              if (write) {
                if (unique) {
                  _fnColumnOptions(settings, shifted, $3(cell).data());
                  var columnDef = columns[shifted];
                  var width = cell.getAttribute("width") || null;
                  var t = cell.style.width.match(/width:\s*(\d+[pxem%]+)/);
                  if (t) {
                    width = t[1];
                  }
                  columnDef.sWidthOrig = columnDef.sWidth || width;
                  if (isHeader) {
                    if (columnDef.sTitle !== null && !columnDef.autoTitle) {
                      cell.innerHTML = columnDef.sTitle;
                    }
                    if (!columnDef.sTitle && unique) {
                      columnDef.sTitle = _stripHtml(cell.innerHTML);
                      columnDef.autoTitle = true;
                    }
                  } else {
                    if (columnDef.footer) {
                      cell.innerHTML = columnDef.footer;
                    }
                  }
                  if (!columnDef.ariaTitle) {
                    columnDef.ariaTitle = $3(cell).attr("aria-label") || columnDef.sTitle;
                  }
                  if (columnDef.className) {
                    $3(cell).addClass(columnDef.className);
                  }
                }
                if ($3("span.dt-column-title", cell).length === 0) {
                  $3("<span>").addClass("dt-column-title").append(cell.childNodes).appendTo(cell);
                }
                if (isHeader && $3("span.dt-column-order", cell).length === 0) {
                  $3("<span>").addClass("dt-column-order").appendTo(cell);
                }
              }
              for (l = 0; l < colspan; l++) {
                for (k = 0; k < rowspan; k++) {
                  layout[i2 + k][shifted + l] = {
                    cell,
                    unique
                  };
                  layout[i2 + k].row = row;
                }
                cols.push(shifted + l);
              }
              cell.setAttribute("data-dt-column", _unique(cols).join(","));
            }
            cell = cell.nextSibling;
          }
        }
        return layout;
      }
      function _fnStart(oSettings) {
        var bServerSide = _fnDataSource(oSettings) == "ssp";
        var iInitDisplayStart = oSettings.iInitDisplayStart;
        if (iInitDisplayStart !== void 0 && iInitDisplayStart !== -1) {
          oSettings._iDisplayStart = bServerSide ? iInitDisplayStart : iInitDisplayStart >= oSettings.fnRecordsDisplay() ? 0 : iInitDisplayStart;
          oSettings.iInitDisplayStart = -1;
        }
      }
      function _fnBuildAjax(oSettings, data, fn) {
        var ajaxData;
        var ajax2 = oSettings.ajax;
        var instance = oSettings.oInstance;
        var callback = function(json) {
          var status = oSettings.jqXHR ? oSettings.jqXHR.status : null;
          if (json === null || typeof status === "number" && status == 204) {
            json = {};
            _fnAjaxDataSrc(oSettings, json, []);
          }
          var error2 = json.error || json.sError;
          if (error2) {
            _fnLog(oSettings, 0, error2);
          }
          oSettings.json = json;
          _fnCallbackFire(oSettings, null, "xhr", [oSettings, json, oSettings.jqXHR], true);
          fn(json);
        };
        if ($3.isPlainObject(ajax2) && ajax2.data) {
          ajaxData = ajax2.data;
          var newData = typeof ajaxData === "function" ? ajaxData(data, oSettings) : (
            // fn can manipulate data or return
            ajaxData
          );
          data = typeof ajaxData === "function" && newData ? newData : $3.extend(true, data, newData);
          delete ajax2.data;
        }
        var baseAjax = {
          "url": typeof ajax2 === "string" ? ajax2 : "",
          "data": data,
          "success": callback,
          "dataType": "json",
          "cache": false,
          "type": oSettings.sServerMethod,
          "error": function(xhr, error2) {
            var ret = _fnCallbackFire(oSettings, null, "xhr", [oSettings, null, oSettings.jqXHR], true);
            if (ret.indexOf(true) === -1) {
              if (error2 == "parsererror") {
                _fnLog(oSettings, 0, "Invalid JSON response", 1);
              } else if (xhr.readyState === 4) {
                _fnLog(oSettings, 0, "Ajax error", 7);
              }
            }
            _fnProcessingDisplay(oSettings, false);
          }
        };
        if ($3.isPlainObject(ajax2)) {
          $3.extend(baseAjax, ajax2);
        }
        oSettings.oAjaxData = data;
        _fnCallbackFire(oSettings, null, "preXhr", [oSettings, data, baseAjax], true);
        if (typeof ajax2 === "function") {
          oSettings.jqXHR = ajax2.call(instance, data, callback, oSettings);
        } else if (ajax2.url === "") {
          var empty = {};
          DataTable.util.set(ajax2.dataSrc)(empty, []);
          callback(empty);
        } else {
          oSettings.jqXHR = $3.ajax(baseAjax);
          if (ajaxData) {
            ajax2.data = ajaxData;
          }
        }
      }
      function _fnAjaxUpdate(settings) {
        settings.iDraw++;
        _fnProcessingDisplay(settings, true);
        _fnBuildAjax(
          settings,
          _fnAjaxParameters(settings),
          function(json) {
            _fnAjaxUpdateDraw(settings, json);
          }
        );
      }
      function _fnAjaxParameters(settings) {
        var columns = settings.aoColumns, features = settings.oFeatures, preSearch = settings.oPreviousSearch, preColSearch = settings.aoPreSearchCols, colData = function(idx, prop) {
          return typeof columns[idx][prop] === "function" ? "function" : columns[idx][prop];
        };
        return {
          draw: settings.iDraw,
          columns: columns.map(function(column, i2) {
            return {
              data: colData(i2, "mData"),
              name: column.sName,
              searchable: column.bSearchable,
              orderable: column.bSortable,
              search: {
                value: preColSearch[i2].search,
                regex: preColSearch[i2].regex,
                fixed: Object.keys(column.searchFixed).map(function(name) {
                  return {
                    name,
                    term: column.searchFixed[name].toString()
                  };
                })
              }
            };
          }),
          order: _fnSortFlatten(settings).map(function(val) {
            return {
              column: val.col,
              dir: val.dir,
              name: colData(val.col, "sName")
            };
          }),
          start: settings._iDisplayStart,
          length: features.bPaginate ? settings._iDisplayLength : -1,
          search: {
            value: preSearch.search,
            regex: preSearch.regex,
            fixed: Object.keys(settings.searchFixed).map(function(name) {
              return {
                name,
                term: settings.searchFixed[name].toString()
              };
            })
          }
        };
      }
      function _fnAjaxUpdateDraw(settings, json) {
        var data = _fnAjaxDataSrc(settings, json);
        var draw = _fnAjaxDataSrcParam(settings, "draw", json);
        var recordsTotal = _fnAjaxDataSrcParam(settings, "recordsTotal", json);
        var recordsFiltered = _fnAjaxDataSrcParam(settings, "recordsFiltered", json);
        if (draw !== void 0) {
          if (draw * 1 < settings.iDraw) {
            return;
          }
          settings.iDraw = draw * 1;
        }
        if (!data) {
          data = [];
        }
        _fnClearTable(settings);
        settings._iRecordsTotal = parseInt(recordsTotal, 10);
        settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
        for (var i2 = 0, ien = data.length; i2 < ien; i2++) {
          _fnAddData(settings, data[i2]);
        }
        settings.aiDisplay = settings.aiDisplayMaster.slice();
        _fnDraw(settings, true);
        _fnInitComplete(settings);
        _fnProcessingDisplay(settings, false);
      }
      function _fnAjaxDataSrc(settings, json, write) {
        var dataProp = "data";
        if ($3.isPlainObject(settings.ajax) && settings.ajax.dataSrc !== void 0) {
          var dataSrc = settings.ajax.dataSrc;
          if (typeof dataSrc === "string" || typeof dataSrc === "function") {
            dataProp = dataSrc;
          } else if (dataSrc.data !== void 0) {
            dataProp = dataSrc.data;
          }
        }
        if (!write) {
          if (dataProp === "data") {
            return json.aaData || json[dataProp];
          }
          return dataProp !== "" ? _fnGetObjectDataFn(dataProp)(json) : json;
        }
        _fnSetObjectDataFn(dataProp)(json, write);
      }
      function _fnAjaxDataSrcParam(settings, param, json) {
        var dataSrc = $3.isPlainObject(settings.ajax) ? settings.ajax.dataSrc : null;
        if (dataSrc && dataSrc[param]) {
          return _fnGetObjectDataFn(dataSrc[param])(json);
        }
        var old = "";
        if (param === "draw") {
          old = "sEcho";
        } else if (param === "recordsTotal") {
          old = "iTotalRecords";
        } else if (param === "recordsFiltered") {
          old = "iTotalDisplayRecords";
        }
        return json[old] !== void 0 ? json[old] : json[param];
      }
      function _fnFilterComplete(settings, input) {
        var columnsSearch = settings.aoPreSearchCols;
        _fnColumnTypes(settings);
        if (_fnDataSource(settings) != "ssp") {
          _fnFilterData(settings);
          settings.aiDisplay = settings.aiDisplayMaster.slice();
          _fnFilter(settings.aiDisplay, settings, input.search, input);
          $3.each(settings.searchFixed, function(name, term) {
            _fnFilter(settings.aiDisplay, settings, term, {});
          });
          for (var i2 = 0; i2 < columnsSearch.length; i2++) {
            var col = columnsSearch[i2];
            _fnFilter(
              settings.aiDisplay,
              settings,
              col.search,
              col,
              i2
            );
            $3.each(settings.aoColumns[i2].searchFixed, function(name, term) {
              _fnFilter(settings.aiDisplay, settings, term, {}, i2);
            });
          }
          _fnFilterCustom(settings);
        }
        settings.bFiltered = true;
        _fnCallbackFire(settings, null, "search", [settings]);
      }
      function _fnFilterCustom(settings) {
        var filters = DataTable.ext.search;
        var displayRows = settings.aiDisplay;
        var row, rowIdx;
        for (var i2 = 0, ien = filters.length; i2 < ien; i2++) {
          var rows = [];
          for (var j = 0, jen = displayRows.length; j < jen; j++) {
            rowIdx = displayRows[j];
            row = settings.aoData[rowIdx];
            if (filters[i2](settings, row._aFilterData, rowIdx, row._aData, j)) {
              rows.push(rowIdx);
            }
          }
          displayRows.length = 0;
          displayRows.push.apply(displayRows, rows);
        }
      }
      function _fnFilter(searchRows, settings, input, options, column) {
        if (input === "") {
          return;
        }
        var i2 = 0;
        var matched = [];
        var searchFunc = typeof input === "function" ? input : null;
        var rpSearch = input instanceof RegExp ? input : searchFunc ? null : _fnFilterCreateSearch(input, options);
        for (i2 = 0; i2 < searchRows.length; i2++) {
          var row = settings.aoData[searchRows[i2]];
          var data = column === void 0 ? row._sFilterRow : row._aFilterData[column];
          if (searchFunc && searchFunc(data, row._aData, searchRows[i2], column) || rpSearch && rpSearch.test(data)) {
            matched.push(searchRows[i2]);
          }
        }
        searchRows.length = matched.length;
        for (i2 = 0; i2 < matched.length; i2++) {
          searchRows[i2] = matched[i2];
        }
      }
      function _fnFilterCreateSearch(search, inOpts) {
        var not = [];
        var options = $3.extend({}, {
          boundary: false,
          caseInsensitive: true,
          exact: false,
          regex: false,
          smart: true
        }, inOpts);
        if (typeof search !== "string") {
          search = search.toString();
        }
        search = _normalize(search);
        if (options.exact) {
          return new RegExp(
            "^" + _fnEscapeRegex(search) + "$",
            options.caseInsensitive ? "i" : ""
          );
        }
        search = options.regex ? search : _fnEscapeRegex(search);
        if (options.smart) {
          var parts = search.match(/!?["\u201C][^"\u201D]+["\u201D]|[^ ]+/g) || [""];
          var a = parts.map(function(word) {
            var negative = false;
            var m2;
            if (word.charAt(0) === "!") {
              negative = true;
              word = word.substring(1);
            }
            if (word.charAt(0) === '"') {
              m2 = word.match(/^"(.*)"$/);
              word = m2 ? m2[1] : word;
            } else if (word.charAt(0) === "\u201C") {
              m2 = word.match(/^\u201C(.*)\u201D$/);
              word = m2 ? m2[1] : word;
            }
            if (negative) {
              if (word.length > 1) {
                not.push("(?!" + word + ")");
              }
              word = "";
            }
            return word.replace(/"/g, "");
          });
          var match = not.length ? not.join("") : "";
          var boundary = options.boundary ? "\\b" : "";
          search = "^(?=.*?" + boundary + a.join(")(?=.*?" + boundary) + ")(" + match + ".)*$";
        }
        return new RegExp(search, options.caseInsensitive ? "i" : "");
      }
      var _fnEscapeRegex = DataTable.util.escapeRegex;
      var __filter_div = $3("<div>")[0];
      var __filter_div_textContent = __filter_div.textContent !== void 0;
      function _fnFilterData(settings) {
        var columns = settings.aoColumns;
        var data = settings.aoData;
        var column;
        var j, jen, filterData, cellData, row;
        var wasInvalidated = false;
        for (var rowIdx = 0; rowIdx < data.length; rowIdx++) {
          if (!data[rowIdx]) {
            continue;
          }
          row = data[rowIdx];
          if (!row._aFilterData) {
            filterData = [];
            for (j = 0, jen = columns.length; j < jen; j++) {
              column = columns[j];
              if (column.bSearchable) {
                cellData = _fnGetCellData(settings, rowIdx, j, "filter");
                if (cellData === null) {
                  cellData = "";
                }
                if (typeof cellData !== "string" && cellData.toString) {
                  cellData = cellData.toString();
                }
              } else {
                cellData = "";
              }
              if (cellData.indexOf && cellData.indexOf("&") !== -1) {
                __filter_div.innerHTML = cellData;
                cellData = __filter_div_textContent ? __filter_div.textContent : __filter_div.innerText;
              }
              if (cellData.replace) {
                cellData = cellData.replace(/[\r\n\u2028]/g, "");
              }
              filterData.push(cellData);
            }
            row._aFilterData = filterData;
            row._sFilterRow = filterData.join("  ");
            wasInvalidated = true;
          }
        }
        return wasInvalidated;
      }
      function _fnInitialise(settings) {
        var i2, iAjaxStart = settings.iInitDisplayStart;
        if (!settings.bInitialised) {
          setTimeout(function() {
            _fnInitialise(settings);
          }, 200);
          return;
        }
        _fnBuildHead(settings, "header");
        _fnBuildHead(settings, "footer");
        _fnDrawHead(settings, settings.aoHeader);
        _fnDrawHead(settings, settings.aoFooter);
        _fnAddOptionsHtml(settings);
        _fnSortInit(settings);
        _colGroup(settings);
        _fnProcessingDisplay(settings, true);
        _fnCallbackFire(settings, null, "preInit", [settings], true);
        _fnReDraw(settings);
        var dataSrc = _fnDataSource(settings);
        if (dataSrc != "ssp") {
          if (dataSrc == "ajax") {
            _fnBuildAjax(settings, {}, function(json) {
              var aData = _fnAjaxDataSrc(settings, json);
              for (i2 = 0; i2 < aData.length; i2++) {
                _fnAddData(settings, aData[i2]);
              }
              settings.iInitDisplayStart = iAjaxStart;
              _fnReDraw(settings);
              _fnProcessingDisplay(settings, false);
              _fnInitComplete(settings);
            }, settings);
          } else {
            _fnInitComplete(settings);
            _fnProcessingDisplay(settings, false);
          }
        }
      }
      function _fnInitComplete(settings) {
        if (settings._bInitComplete) {
          return;
        }
        var args = [settings, settings.json];
        settings._bInitComplete = true;
        _fnAdjustColumnSizing(settings);
        _fnCallbackFire(settings, null, "plugin-init", args, true);
        _fnCallbackFire(settings, "aoInitComplete", "init", args, true);
      }
      function _fnLengthChange(settings, val) {
        var len = parseInt(val, 10);
        settings._iDisplayLength = len;
        _fnLengthOverflow(settings);
        _fnCallbackFire(settings, null, "length", [settings, len]);
      }
      function _fnPageChange(settings, action, redraw) {
        var start3 = settings._iDisplayStart, len = settings._iDisplayLength, records = settings.fnRecordsDisplay();
        if (records === 0 || len === -1) {
          start3 = 0;
        } else if (typeof action === "number") {
          start3 = action * len;
          if (start3 > records) {
            start3 = 0;
          }
        } else if (action == "first") {
          start3 = 0;
        } else if (action == "previous") {
          start3 = len >= 0 ? start3 - len : 0;
          if (start3 < 0) {
            start3 = 0;
          }
        } else if (action == "next") {
          if (start3 + len < records) {
            start3 += len;
          }
        } else if (action == "last") {
          start3 = Math.floor((records - 1) / len) * len;
        } else if (action === "ellipsis") {
          return;
        } else {
          _fnLog(settings, 0, "Unknown paging action: " + action, 5);
        }
        var changed = settings._iDisplayStart !== start3;
        settings._iDisplayStart = start3;
        _fnCallbackFire(settings, null, changed ? "page" : "page-nc", [settings]);
        if (changed && redraw) {
          _fnDraw(settings);
        }
        return changed;
      }
      function _processingHtml(settings) {
        var table = settings.nTable;
        var scrolling = settings.oScroll.sX !== "" || settings.oScroll.sY !== "";
        if (settings.oFeatures.bProcessing) {
          var n = $3("<div/>", {
            "id": settings.sTableId + "_processing",
            "class": settings.oClasses.processing.container,
            "role": "status"
          }).html(settings.oLanguage.sProcessing).append("<div><div></div><div></div><div></div><div></div></div>");
          if (scrolling) {
            n.prependTo($3("div.dt-scroll", settings.nTableWrapper));
          } else {
            n.insertBefore(table);
          }
          $3(table).on("processing.dt.DT", function(e, s, show) {
            n.css("display", show ? "block" : "none");
          });
        }
      }
      function _fnProcessingDisplay(settings, show) {
        _fnCallbackFire(settings, null, "processing", [settings, show]);
      }
      function _fnFeatureHtmlTable(settings) {
        var table = $3(settings.nTable);
        var scroll = settings.oScroll;
        if (scroll.sX === "" && scroll.sY === "") {
          return settings.nTable;
        }
        var scrollX = scroll.sX;
        var scrollY = scroll.sY;
        var classes = settings.oClasses.scrolling;
        var caption = settings.captionNode;
        var captionSide = caption ? caption._captionSide : null;
        var headerClone = $3(table[0].cloneNode(false));
        var footerClone = $3(table[0].cloneNode(false));
        var footer = table.children("tfoot");
        var _div = "<div/>";
        var size = function(s) {
          return !s ? null : _fnStringToCss(s);
        };
        if (!footer.length) {
          footer = null;
        }
        var scroller = $3(_div, { "class": classes.container }).append(
          $3(_div, { "class": classes.header.self }).css({
            overflow: "hidden",
            position: "relative",
            border: 0,
            width: scrollX ? size(scrollX) : "100%"
          }).append(
            $3(_div, { "class": classes.header.inner }).css({
              "box-sizing": "content-box",
              width: scroll.sXInner || "100%"
            }).append(
              headerClone.removeAttr("id").css("margin-left", 0).append(captionSide === "top" ? caption : null).append(
                table.children("thead")
              )
            )
          )
        ).append(
          $3(_div, { "class": classes.body }).css({
            position: "relative",
            overflow: "auto",
            width: size(scrollX)
          }).append(table)
        );
        if (footer) {
          scroller.append(
            $3(_div, { "class": classes.footer.self }).css({
              overflow: "hidden",
              border: 0,
              width: scrollX ? size(scrollX) : "100%"
            }).append(
              $3(_div, { "class": classes.footer.inner }).append(
                footerClone.removeAttr("id").css("margin-left", 0).append(captionSide === "bottom" ? caption : null).append(
                  table.children("tfoot")
                )
              )
            )
          );
        }
        var children = scroller.children();
        var scrollHead = children[0];
        var scrollBody = children[1];
        var scrollFoot = footer ? children[2] : null;
        $3(scrollBody).on("scroll.DT", function() {
          var scrollLeft = this.scrollLeft;
          scrollHead.scrollLeft = scrollLeft;
          if (footer) {
            scrollFoot.scrollLeft = scrollLeft;
          }
        });
        $3("th, td", scrollHead).on("focus", function() {
          var scrollLeft = scrollHead.scrollLeft;
          scrollBody.scrollLeft = scrollLeft;
          if (footer) {
            scrollBody.scrollLeft = scrollLeft;
          }
        });
        $3(scrollBody).css("max-height", scrollY);
        if (!scroll.bCollapse) {
          $3(scrollBody).css("height", scrollY);
        }
        settings.nScrollHead = scrollHead;
        settings.nScrollBody = scrollBody;
        settings.nScrollFoot = scrollFoot;
        settings.aoDrawCallback.push(_fnScrollDraw);
        return scroller[0];
      }
      function _fnScrollDraw(settings) {
        var scroll = settings.oScroll, barWidth = scroll.iBarWidth, divHeader = $3(settings.nScrollHead), divHeaderInner = divHeader.children("div"), divHeaderTable = divHeaderInner.children("table"), divBodyEl = settings.nScrollBody, divBody = $3(divBodyEl), divFooter = $3(settings.nScrollFoot), divFooterInner = divFooter.children("div"), divFooterTable = divFooterInner.children("table"), header = $3(settings.nTHead), table = $3(settings.nTable), footer = settings.nTFoot && $3("th, td", settings.nTFoot).length ? $3(settings.nTFoot) : null, browser = settings.oBrowser, headerCopy, footerCopy;
        var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
        if (settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== void 0) {
          settings.scrollBarVis = scrollBarVis;
          _fnAdjustColumnSizing(settings);
          return;
        } else {
          settings.scrollBarVis = scrollBarVis;
        }
        table.children("thead, tfoot").remove();
        headerCopy = header.clone().prependTo(table);
        headerCopy.find("th, td").removeAttr("tabindex");
        headerCopy.find("[id]").removeAttr("id");
        if (footer) {
          footerCopy = footer.clone().prependTo(table);
          footerCopy.find("[id]").removeAttr("id");
        }
        if (settings.aiDisplay.length) {
          var colSizes = table.children("tbody").eq(0).children("tr").eq(0).children("th, td").map(function(vis) {
            return {
              idx: _fnVisibleToColumnIndex(settings, vis),
              width: $3(this).outerWidth()
            };
          });
          for (var i2 = 0; i2 < colSizes.length; i2++) {
            var colEl = settings.aoColumns[colSizes[i2].idx].colEl[0];
            var colWidth = colEl.style.width.replace("px", "");
            if (colWidth !== colSizes[i2].width) {
              colEl.style.width = colSizes[i2].width + "px";
            }
          }
        }
        divHeaderTable.find("colgroup").remove();
        divHeaderTable.append(settings.colgroup.clone());
        if (footer) {
          divFooterTable.find("colgroup").remove();
          divFooterTable.append(settings.colgroup.clone());
        }
        $3("th, td", headerCopy).each(function() {
          $3(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
        });
        if (footer) {
          $3("th, td", footerCopy).each(function() {
            $3(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
          });
        }
        var isScrolling = Math.floor(table.height()) > divBodyEl.clientHeight || divBody.css("overflow-y") == "scroll";
        var paddingSide = "padding" + (browser.bScrollbarLeft ? "Left" : "Right");
        var outerWidth = table.outerWidth();
        divHeaderTable.css("width", _fnStringToCss(outerWidth));
        divHeaderInner.css("width", _fnStringToCss(outerWidth)).css(paddingSide, isScrolling ? barWidth + "px" : "0px");
        if (footer) {
          divFooterTable.css("width", _fnStringToCss(outerWidth));
          divFooterInner.css("width", _fnStringToCss(outerWidth)).css(paddingSide, isScrolling ? barWidth + "px" : "0px");
        }
        table.children("colgroup").prependTo(table);
        divBody.trigger("scroll");
        if ((settings.bSorted || settings.bFiltered) && !settings._drawHold) {
          divBodyEl.scrollTop = 0;
        }
      }
      function _fnCalculateColumnWidths(settings) {
        if (!settings.oFeatures.bAutoWidth) {
          return;
        }
        var table = settings.nTable, columns = settings.aoColumns, scroll = settings.oScroll, scrollY = scroll.sY, scrollX = scroll.sX, scrollXInner = scroll.sXInner, visibleColumns = _fnGetColumns(settings, "bVisible"), tableWidthAttr = table.getAttribute("width"), tableContainer = table.parentNode, i2, column, columnIdx;
        var styleWidth = table.style.width;
        if (styleWidth && styleWidth.indexOf("%") !== -1) {
          tableWidthAttr = styleWidth;
        }
        _fnCallbackFire(
          settings,
          null,
          "column-calc",
          { visible: visibleColumns },
          false
        );
        var tmpTable = $3(table.cloneNode()).css("visibility", "hidden").removeAttr("id");
        tmpTable.append("<tbody>");
        var tr = $3("<tr/>").appendTo(tmpTable.find("tbody"));
        tmpTable.append($3(settings.nTHead).clone()).append($3(settings.nTFoot).clone());
        tmpTable.find("tfoot th, tfoot td").css("width", "");
        tmpTable.find("thead th, thead td").each(function() {
          var width = _fnColumnsSumWidth(settings, this, true, false);
          if (width) {
            this.style.width = width;
            if (scrollX) {
              $3(this).append($3("<div/>").css({
                width,
                margin: 0,
                padding: 0,
                border: 0,
                height: 1
              }));
            }
          } else {
            this.style.width = "";
          }
        });
        for (i2 = 0; i2 < visibleColumns.length; i2++) {
          columnIdx = visibleColumns[i2];
          column = columns[columnIdx];
          var longest = _fnGetMaxLenString(settings, columnIdx);
          var autoClass = _ext.type.className[column.sType];
          var text = longest + column.sContentPadding;
          var insert = longest.indexOf("<") === -1 ? document2.createTextNode(text) : text;
          $3("<td/>").addClass(autoClass).addClass(column.sClass).append(insert).appendTo(tr);
        }
        $3("[name]", tmpTable).removeAttr("name");
        var holder = $3("<div/>").css(
          scrollX || scrollY ? {
            position: "absolute",
            top: 0,
            left: 0,
            height: 1,
            right: 0,
            overflow: "hidden"
          } : {}
        ).append(tmpTable).appendTo(tableContainer);
        if (scrollX && scrollXInner) {
          tmpTable.width(scrollXInner);
        } else if (scrollX) {
          tmpTable.css("width", "auto");
          tmpTable.removeAttr("width");
          if (tmpTable.width() < tableContainer.clientWidth && tableWidthAttr) {
            tmpTable.width(tableContainer.clientWidth);
          }
        } else if (scrollY) {
          tmpTable.width(tableContainer.clientWidth);
        } else if (tableWidthAttr) {
          tmpTable.width(tableWidthAttr);
        }
        var total = 0;
        var bodyCells = tmpTable.find("tbody tr").eq(0).children();
        for (i2 = 0; i2 < visibleColumns.length; i2++) {
          var bounding = bodyCells[i2].getBoundingClientRect().width;
          total += bounding;
          columns[visibleColumns[i2]].sWidth = _fnStringToCss(bounding);
        }
        table.style.width = _fnStringToCss(total);
        holder.remove();
        if (tableWidthAttr) {
          table.style.width = _fnStringToCss(tableWidthAttr);
        }
        if ((tableWidthAttr || scrollX) && !settings._reszEvt) {
          var bindResize = function() {
            $3(window2).on("resize.DT-" + settings.sInstance, DataTable.util.throttle(function() {
              if (!settings.bDestroying) {
                _fnAdjustColumnSizing(settings);
              }
            }));
          };
          bindResize();
          settings._reszEvt = true;
        }
      }
      function _fnGetMaxLenString(settings, colIdx) {
        var column = settings.aoColumns[colIdx];
        if (!column.maxLenString) {
          var s, max = "", maxLen = -1;
          for (var i2 = 0, ien = settings.aiDisplayMaster.length; i2 < ien; i2++) {
            var rowIdx = settings.aiDisplayMaster[i2];
            var data = _fnGetRowDisplay(settings, rowIdx)[colIdx];
            var cellString = data && typeof data === "object" && data.nodeType ? data.innerHTML : data + "";
            cellString = cellString.replace(/id=".*?"/g, "").replace(/name=".*?"/g, "");
            s = _stripHtml(cellString).replace(/&nbsp;/g, " ");
            if (s.length > maxLen) {
              max = cellString;
              maxLen = s.length;
            }
          }
          column.maxLenString = max;
        }
        return column.maxLenString;
      }
      function _fnStringToCss(s) {
        if (s === null) {
          return "0px";
        }
        if (typeof s == "number") {
          return s < 0 ? "0px" : s + "px";
        }
        return s.match(/\d$/) ? s + "px" : s;
      }
      function _colGroup(settings) {
        var cols = settings.aoColumns;
        settings.colgroup.empty();
        for (i = 0; i < cols.length; i++) {
          if (cols[i].bVisible) {
            settings.colgroup.append(cols[i].colEl);
          }
        }
      }
      function _fnSortInit(settings) {
        var target = settings.nTHead;
        var headerRows = target.querySelectorAll("tr");
        var legacyTop = settings.bSortCellsTop;
        var notSelector = ':not([data-dt-order="disable"]):not([data-dt-order="icon-only"])';
        if (legacyTop === true) {
          target = headerRows[0];
        } else if (legacyTop === false) {
          target = headerRows[headerRows.length - 1];
        }
        _fnSortAttachListener(
          settings,
          target,
          target === settings.nTHead ? "tr" + notSelector + " th" + notSelector + ", tr" + notSelector + " td" + notSelector : "th" + notSelector + ", td" + notSelector
        );
        var order = [];
        _fnSortResolve(settings, order, settings.aaSorting);
        settings.aaSorting = order;
      }
      function _fnSortAttachListener(settings, node, selector, column, callback) {
        _fnBindAction(node, selector, function(e) {
          var run = false;
          var columns = column === void 0 ? _fnColumnsFromHeader(e.target) : [column];
          if (columns.length) {
            for (var i2 = 0, ien = columns.length; i2 < ien; i2++) {
              var ret = _fnSortAdd(settings, columns[i2], i2, e.shiftKey);
              if (ret !== false) {
                run = true;
              }
              if (settings.aaSorting.length === 1 && settings.aaSorting[0][1] === "") {
                break;
              }
            }
            if (run) {
              _fnProcessingDisplay(settings, true);
              setTimeout(function() {
                _fnSort(settings);
                _fnSortDisplay(settings, settings.aiDisplay);
                _fnProcessingDisplay(settings, false);
                _fnReDraw(settings, false, false);
                if (callback) {
                  callback();
                }
              }, 0);
            }
          }
        });
      }
      function _fnSortDisplay(settings, display) {
        if (display.length < 2) {
          return;
        }
        var master = settings.aiDisplayMaster;
        var masterMap = {};
        var map = {};
        var i2;
        for (i2 = 0; i2 < master.length; i2++) {
          masterMap[master[i2]] = i2;
        }
        for (i2 = 0; i2 < display.length; i2++) {
          map[display[i2]] = masterMap[display[i2]];
        }
        display.sort(function(a, b) {
          return map[a] - map[b];
        });
      }
      function _fnSortResolve(settings, nestedSort, sort) {
        var push = function(a) {
          if ($3.isPlainObject(a)) {
            if (a.idx !== void 0) {
              nestedSort.push([a.idx, a.dir]);
            } else if (a.name) {
              var cols = _pluck(settings.aoColumns, "sName");
              var idx = cols.indexOf(a.name);
              if (idx !== -1) {
                nestedSort.push([idx, a.dir]);
              }
            }
          } else {
            nestedSort.push(a);
          }
        };
        if ($3.isPlainObject(sort)) {
          push(sort);
        } else if (sort.length && typeof sort[0] === "number") {
          push(sort);
        } else if (sort.length) {
          for (var z = 0; z < sort.length; z++) {
            push(sort[z]);
          }
        }
      }
      function _fnSortFlatten(settings) {
        var i2, k, kLen, aSort = [], extSort = DataTable.ext.type.order, aoColumns = settings.aoColumns, aDataSort, iCol, sType, srcCol, fixed = settings.aaSortingFixed, fixedObj = $3.isPlainObject(fixed), nestedSort = [];
        if (!settings.oFeatures.bSort) {
          return aSort;
        }
        if (Array.isArray(fixed)) {
          _fnSortResolve(settings, nestedSort, fixed);
        }
        if (fixedObj && fixed.pre) {
          _fnSortResolve(settings, nestedSort, fixed.pre);
        }
        _fnSortResolve(settings, nestedSort, settings.aaSorting);
        if (fixedObj && fixed.post) {
          _fnSortResolve(settings, nestedSort, fixed.post);
        }
        for (i2 = 0; i2 < nestedSort.length; i2++) {
          srcCol = nestedSort[i2][0];
          if (aoColumns[srcCol]) {
            aDataSort = aoColumns[srcCol].aDataSort;
            for (k = 0, kLen = aDataSort.length; k < kLen; k++) {
              iCol = aDataSort[k];
              sType = aoColumns[iCol].sType || "string";
              if (nestedSort[i2]._idx === void 0) {
                nestedSort[i2]._idx = aoColumns[iCol].asSorting.indexOf(nestedSort[i2][1]);
              }
              if (nestedSort[i2][1]) {
                aSort.push({
                  src: srcCol,
                  col: iCol,
                  dir: nestedSort[i2][1],
                  index: nestedSort[i2]._idx,
                  type: sType,
                  formatter: extSort[sType + "-pre"],
                  sorter: extSort[sType + "-" + nestedSort[i2][1]]
                });
              }
            }
          }
        }
        return aSort;
      }
      function _fnSort(oSettings, col, dir) {
        var i2, ien, iLen, aiOrig = [], extSort = DataTable.ext.type.order, aoData = oSettings.aoData, sortCol, displayMaster = oSettings.aiDisplayMaster, aSort;
        _fnColumnTypes(oSettings);
        if (col !== void 0) {
          var srcCol = oSettings.aoColumns[col];
          aSort = [{
            src: col,
            col,
            dir,
            index: 0,
            type: srcCol.sType,
            formatter: extSort[srcCol.sType + "-pre"],
            sorter: extSort[srcCol.sType + "-" + dir]
          }];
          displayMaster = displayMaster.slice();
        } else {
          aSort = _fnSortFlatten(oSettings);
        }
        for (i2 = 0, ien = aSort.length; i2 < ien; i2++) {
          sortCol = aSort[i2];
          _fnSortData(oSettings, sortCol.col);
        }
        if (_fnDataSource(oSettings) != "ssp" && aSort.length !== 0) {
          for (i2 = 0, iLen = displayMaster.length; i2 < iLen; i2++) {
            aiOrig[i2] = i2;
          }
          if (aSort.length && aSort[0].dir === "desc") {
            aiOrig.reverse();
          }
          displayMaster.sort(function(a, b) {
            var x, y, k, test, sort, len = aSort.length, dataA = aoData[a]._aSortData, dataB = aoData[b]._aSortData;
            for (k = 0; k < len; k++) {
              sort = aSort[k];
              x = dataA[sort.col];
              y = dataB[sort.col];
              if (sort.sorter) {
                test = sort.sorter(x, y);
                if (test !== 0) {
                  return test;
                }
              } else {
                test = x < y ? -1 : x > y ? 1 : 0;
                if (test !== 0) {
                  return sort.dir === "asc" ? test : -test;
                }
              }
            }
            x = aiOrig[a];
            y = aiOrig[b];
            return x < y ? -1 : x > y ? 1 : 0;
          });
        } else if (aSort.length === 0) {
          displayMaster.sort(function(x, y) {
            return x < y ? -1 : x > y ? 1 : 0;
          });
        }
        if (col === void 0) {
          oSettings.bSorted = true;
          _fnCallbackFire(oSettings, null, "order", [oSettings, aSort]);
        }
        return displayMaster;
      }
      function _fnSortAdd(settings, colIdx, addIndex, shift) {
        var col = settings.aoColumns[colIdx];
        var sorting = settings.aaSorting;
        var asSorting = col.asSorting;
        var nextSortIdx;
        var next = function(a, overflow) {
          var idx = a._idx;
          if (idx === void 0) {
            idx = asSorting.indexOf(a[1]);
          }
          return idx + 1 < asSorting.length ? idx + 1 : overflow ? null : 0;
        };
        if (!col.bSortable) {
          return false;
        }
        if (typeof sorting[0] === "number") {
          sorting = settings.aaSorting = [sorting];
        }
        if ((shift || addIndex) && settings.oFeatures.bSortMulti) {
          var sortIdx = _pluck(sorting, "0").indexOf(colIdx);
          if (sortIdx !== -1) {
            nextSortIdx = next(sorting[sortIdx], true);
            if (nextSortIdx === null && sorting.length === 1) {
              nextSortIdx = 0;
            }
            if (nextSortIdx === null) {
              sorting.splice(sortIdx, 1);
            } else {
              sorting[sortIdx][1] = asSorting[nextSortIdx];
              sorting[sortIdx]._idx = nextSortIdx;
            }
          } else if (shift) {
            sorting.push([colIdx, asSorting[0], 0]);
            sorting[sorting.length - 1]._idx = 0;
          } else {
            sorting.push([colIdx, sorting[0][1], 0]);
            sorting[sorting.length - 1]._idx = 0;
          }
        } else if (sorting.length && sorting[0][0] == colIdx) {
          nextSortIdx = next(sorting[0]);
          sorting.length = 1;
          sorting[0][1] = asSorting[nextSortIdx];
          sorting[0]._idx = nextSortIdx;
        } else {
          sorting.length = 0;
          sorting.push([colIdx, asSorting[0]]);
          sorting[0]._idx = 0;
        }
      }
      function _fnSortingClasses(settings) {
        var oldSort = settings.aLastSort;
        var sortClass = settings.oClasses.order.position;
        var sort = _fnSortFlatten(settings);
        var features = settings.oFeatures;
        var i2, ien, colIdx;
        if (features.bSort && features.bSortClasses) {
          for (i2 = 0, ien = oldSort.length; i2 < ien; i2++) {
            colIdx = oldSort[i2].src;
            $3(_pluck(settings.aoData, "anCells", colIdx)).removeClass(sortClass + (i2 < 2 ? i2 + 1 : 3));
          }
          for (i2 = 0, ien = sort.length; i2 < ien; i2++) {
            colIdx = sort[i2].src;
            $3(_pluck(settings.aoData, "anCells", colIdx)).addClass(sortClass + (i2 < 2 ? i2 + 1 : 3));
          }
        }
        settings.aLastSort = sort;
      }
      function _fnSortData(settings, colIdx) {
        var column = settings.aoColumns[colIdx];
        var customSort = DataTable.ext.order[column.sSortDataType];
        var customData;
        if (customSort) {
          customData = customSort.call(
            settings.oInstance,
            settings,
            colIdx,
            _fnColumnIndexToVisible(settings, colIdx)
          );
        }
        var row, cellData;
        var formatter = DataTable.ext.type.order[column.sType + "-pre"];
        var data = settings.aoData;
        for (var rowIdx = 0; rowIdx < data.length; rowIdx++) {
          if (!data[rowIdx]) {
            continue;
          }
          row = data[rowIdx];
          if (!row._aSortData) {
            row._aSortData = [];
          }
          if (!row._aSortData[colIdx] || customSort) {
            cellData = customSort ? customData[rowIdx] : (
              // If there was a custom sort function, use data from there
              _fnGetCellData(settings, rowIdx, colIdx, "sort")
            );
            row._aSortData[colIdx] = formatter ? formatter(cellData, settings) : cellData;
          }
        }
      }
      function _fnSaveState(settings) {
        if (settings._bLoadingState) {
          return;
        }
        var state = {
          time: +/* @__PURE__ */ new Date(),
          start: settings._iDisplayStart,
          length: settings._iDisplayLength,
          order: $3.extend(true, [], settings.aaSorting),
          search: $3.extend({}, settings.oPreviousSearch),
          columns: settings.aoColumns.map(function(col, i2) {
            return {
              visible: col.bVisible,
              search: $3.extend({}, settings.aoPreSearchCols[i2])
            };
          })
        };
        settings.oSavedState = state;
        _fnCallbackFire(settings, "aoStateSaveParams", "stateSaveParams", [settings, state]);
        if (settings.oFeatures.bStateSave && !settings.bDestroying) {
          settings.fnStateSaveCallback.call(settings.oInstance, settings, state);
        }
      }
      function _fnLoadState(settings, init, callback) {
        if (!settings.oFeatures.bStateSave) {
          callback();
          return;
        }
        var loaded = function(state2) {
          _fnImplementState(settings, state2, callback);
        };
        var state = settings.fnStateLoadCallback.call(settings.oInstance, settings, loaded);
        if (state !== void 0) {
          _fnImplementState(settings, state, callback);
        }
        return true;
      }
      function _fnImplementState(settings, s, callback) {
        var i2, ien;
        var columns = settings.aoColumns;
        settings._bLoadingState = true;
        var api = settings._bInitComplete ? new DataTable.Api(settings) : null;
        if (!s || !s.time) {
          settings._bLoadingState = false;
          callback();
          return;
        }
        var duration = settings.iStateDuration;
        if (duration > 0 && s.time < +/* @__PURE__ */ new Date() - duration * 1e3) {
          settings._bLoadingState = false;
          callback();
          return;
        }
        var abStateLoad = _fnCallbackFire(settings, "aoStateLoadParams", "stateLoadParams", [settings, s]);
        if (abStateLoad.indexOf(false) !== -1) {
          settings._bLoadingState = false;
          callback();
          return;
        }
        if (s.columns && columns.length !== s.columns.length) {
          settings._bLoadingState = false;
          callback();
          return;
        }
        settings.oLoadedState = $3.extend(true, {}, s);
        _fnCallbackFire(settings, null, "stateLoadInit", [settings, s], true);
        if (s.length !== void 0) {
          if (api) {
            api.page.len(s.length);
          } else {
            settings._iDisplayLength = s.length;
          }
        }
        if (s.start !== void 0) {
          if (api === null) {
            settings._iDisplayStart = s.start;
            settings.iInitDisplayStart = s.start;
          } else {
            _fnPageChange(settings, s.start / settings._iDisplayLength);
          }
        }
        if (s.order !== void 0) {
          settings.aaSorting = [];
          $3.each(s.order, function(i3, col2) {
            settings.aaSorting.push(
              col2[0] >= columns.length ? [0, col2[1]] : col2
            );
          });
        }
        if (s.search !== void 0) {
          $3.extend(settings.oPreviousSearch, s.search);
        }
        if (s.columns) {
          for (i2 = 0, ien = s.columns.length; i2 < ien; i2++) {
            var col = s.columns[i2];
            if (col.visible !== void 0) {
              if (api) {
                api.column(i2).visible(col.visible, false);
              } else {
                columns[i2].bVisible = col.visible;
              }
            }
            if (col.search !== void 0) {
              $3.extend(settings.aoPreSearchCols[i2], col.search);
            }
          }
          if (api) {
            api.columns.adjust();
          }
        }
        settings._bLoadingState = false;
        _fnCallbackFire(settings, "aoStateLoaded", "stateLoaded", [settings, s]);
        callback();
      }
      function _fnLog(settings, level, msg, tn) {
        msg = "DataTables warning: " + (settings ? "table id=" + settings.sTableId + " - " : "") + msg;
        if (tn) {
          msg += ". For more information about this error, please see https://datatables.net/tn/" + tn;
        }
        if (!level) {
          var ext = DataTable.ext;
          var type = ext.sErrMode || ext.errMode;
          if (settings) {
            _fnCallbackFire(settings, null, "dt-error", [settings, tn, msg], true);
          }
          if (type == "alert") {
            alert(msg);
          } else if (type == "throw") {
            throw new Error(msg);
          } else if (typeof type == "function") {
            type(settings, tn, msg);
          }
        } else if (window2.console && console.log) {
          console.log(msg);
        }
      }
      function _fnMap(ret, src, name, mappedName) {
        if (Array.isArray(name)) {
          $3.each(name, function(i2, val) {
            if (Array.isArray(val)) {
              _fnMap(ret, src, val[0], val[1]);
            } else {
              _fnMap(ret, src, val);
            }
          });
          return;
        }
        if (mappedName === void 0) {
          mappedName = name;
        }
        if (src[name] !== void 0) {
          ret[mappedName] = src[name];
        }
      }
      function _fnExtend(out, extender, breakRefs) {
        var val;
        for (var prop in extender) {
          if (Object.prototype.hasOwnProperty.call(extender, prop)) {
            val = extender[prop];
            if ($3.isPlainObject(val)) {
              if (!$3.isPlainObject(out[prop])) {
                out[prop] = {};
              }
              $3.extend(true, out[prop], val);
            } else if (breakRefs && prop !== "data" && prop !== "aaData" && Array.isArray(val)) {
              out[prop] = val.slice();
            } else {
              out[prop] = val;
            }
          }
        }
        return out;
      }
      function _fnBindAction(n, selector, fn) {
        $3(n).on("click.DT", selector, function(e) {
          fn(e);
        }).on("keypress.DT", selector, function(e) {
          if (e.which === 13) {
            e.preventDefault();
            fn(e);
          }
        }).on("selectstart.DT", selector, function() {
          return false;
        });
      }
      function _fnCallbackReg(settings, store, fn) {
        if (fn) {
          settings[store].push(fn);
        }
      }
      function _fnCallbackFire(settings, callbackArr, eventName, args, bubbles) {
        var ret = [];
        if (callbackArr) {
          ret = settings[callbackArr].slice().reverse().map(function(val) {
            return val.apply(settings.oInstance, args);
          });
        }
        if (eventName !== null) {
          var e = $3.Event(eventName + ".dt");
          var table = $3(settings.nTable);
          e.dt = settings.api;
          table[bubbles ? "trigger" : "triggerHandler"](e, args);
          if (bubbles && table.parents("body").length === 0) {
            $3("body").trigger(e, args);
          }
          ret.push(e.result);
        }
        return ret;
      }
      function _fnLengthOverflow(settings) {
        var start3 = settings._iDisplayStart, end = settings.fnDisplayEnd(), len = settings._iDisplayLength;
        if (start3 >= end) {
          start3 = end - len;
        }
        start3 -= start3 % len;
        if (len === -1 || start3 < 0) {
          start3 = 0;
        }
        settings._iDisplayStart = start3;
      }
      function _fnRenderer(settings, type) {
        var renderer = settings.renderer;
        var host = DataTable.ext.renderer[type];
        if ($3.isPlainObject(renderer) && renderer[type]) {
          return host[renderer[type]] || host._;
        } else if (typeof renderer === "string") {
          return host[renderer] || host._;
        }
        return host._;
      }
      function _fnDataSource(settings) {
        if (settings.oFeatures.bServerSide) {
          return "ssp";
        } else if (settings.ajax) {
          return "ajax";
        }
        return "dom";
      }
      function _fnMacros(settings, str, entries) {
        var formatter = settings.fnFormatNumber, start3 = settings._iDisplayStart + 1, len = settings._iDisplayLength, vis = settings.fnRecordsDisplay(), max = settings.fnRecordsTotal(), all = len === -1;
        return str.replace(/_START_/g, formatter.call(settings, start3)).replace(/_END_/g, formatter.call(settings, settings.fnDisplayEnd())).replace(/_MAX_/g, formatter.call(settings, max)).replace(/_TOTAL_/g, formatter.call(settings, vis)).replace(/_PAGE_/g, formatter.call(settings, all ? 1 : Math.ceil(start3 / len))).replace(/_PAGES_/g, formatter.call(settings, all ? 1 : Math.ceil(vis / len))).replace(/_ENTRIES_/g, settings.api.i18n("entries", "", entries)).replace(/_ENTRIES-MAX_/g, settings.api.i18n("entries", "", max)).replace(/_ENTRIES-TOTAL_/g, settings.api.i18n("entries", "", vis));
      }
      var __apiStruct = [];
      var __arrayProto = Array.prototype;
      var _toSettings = function(mixed) {
        var idx, jq;
        var settings = DataTable.settings;
        var tables = _pluck(settings, "nTable");
        if (!mixed) {
          return [];
        } else if (mixed.nTable && mixed.oFeatures) {
          return [mixed];
        } else if (mixed.nodeName && mixed.nodeName.toLowerCase() === "table") {
          idx = tables.indexOf(mixed);
          return idx !== -1 ? [settings[idx]] : null;
        } else if (mixed && typeof mixed.settings === "function") {
          return mixed.settings().toArray();
        } else if (typeof mixed === "string") {
          jq = $3(mixed).get();
        } else if (mixed instanceof $3) {
          jq = mixed.get();
        }
        if (jq) {
          return settings.filter(function(v, idx2) {
            return jq.includes(tables[idx2]);
          });
        }
      };
      _Api = function(context, data) {
        if (!(this instanceof _Api)) {
          return new _Api(context, data);
        }
        var settings = [];
        var ctxSettings = function(o) {
          var a = _toSettings(o);
          if (a) {
            settings.push.apply(settings, a);
          }
        };
        if (Array.isArray(context)) {
          for (var i2 = 0, ien = context.length; i2 < ien; i2++) {
            ctxSettings(context[i2]);
          }
        } else {
          ctxSettings(context);
        }
        this.context = settings.length > 1 ? _unique(settings) : settings;
        if (data) {
          this.push.apply(this, data);
        }
        this.selector = {
          rows: null,
          cols: null,
          opts: null
        };
        _Api.extend(this, this, __apiStruct);
      };
      DataTable.Api = _Api;
      $3.extend(_Api.prototype, {
        any: function() {
          return this.count() !== 0;
        },
        context: [],
        // array of table settings objects
        count: function() {
          return this.flatten().length;
        },
        each: function(fn) {
          for (var i2 = 0, ien = this.length; i2 < ien; i2++) {
            fn.call(this, this[i2], i2, this);
          }
          return this;
        },
        eq: function(idx) {
          var ctx = this.context;
          return ctx.length > idx ? new _Api(ctx[idx], this[idx]) : null;
        },
        filter: function(fn) {
          var a = __arrayProto.filter.call(this, fn, this);
          return new _Api(this.context, a);
        },
        flatten: function() {
          var a = [];
          return new _Api(this.context, a.concat.apply(a, this.toArray()));
        },
        get: function(idx) {
          return this[idx];
        },
        join: __arrayProto.join,
        includes: function(find) {
          return this.indexOf(find) === -1 ? false : true;
        },
        indexOf: __arrayProto.indexOf,
        iterator: function(flatten, type, fn, alwaysNew) {
          var a = [], ret, i2, ien, j, jen, context = this.context, rows, items, item, selector = this.selector;
          if (typeof flatten === "string") {
            alwaysNew = fn;
            fn = type;
            type = flatten;
            flatten = false;
          }
          for (i2 = 0, ien = context.length; i2 < ien; i2++) {
            var apiInst = new _Api(context[i2]);
            if (type === "table") {
              ret = fn.call(apiInst, context[i2], i2);
              if (ret !== void 0) {
                a.push(ret);
              }
            } else if (type === "columns" || type === "rows") {
              ret = fn.call(apiInst, context[i2], this[i2], i2);
              if (ret !== void 0) {
                a.push(ret);
              }
            } else if (type === "every" || type === "column" || type === "column-rows" || type === "row" || type === "cell") {
              items = this[i2];
              if (type === "column-rows") {
                rows = _selector_row_indexes(context[i2], selector.opts);
              }
              for (j = 0, jen = items.length; j < jen; j++) {
                item = items[j];
                if (type === "cell") {
                  ret = fn.call(apiInst, context[i2], item.row, item.column, i2, j);
                } else {
                  ret = fn.call(apiInst, context[i2], item, i2, j, rows);
                }
                if (ret !== void 0) {
                  a.push(ret);
                }
              }
            }
          }
          if (a.length || alwaysNew) {
            var api = new _Api(context, flatten ? a.concat.apply([], a) : a);
            var apiSelector = api.selector;
            apiSelector.rows = selector.rows;
            apiSelector.cols = selector.cols;
            apiSelector.opts = selector.opts;
            return api;
          }
          return this;
        },
        lastIndexOf: __arrayProto.lastIndexOf,
        length: 0,
        map: function(fn) {
          var a = __arrayProto.map.call(this, fn, this);
          return new _Api(this.context, a);
        },
        pluck: function(prop) {
          var fn = DataTable.util.get(prop);
          return this.map(function(el) {
            return fn(el);
          });
        },
        pop: __arrayProto.pop,
        push: __arrayProto.push,
        reduce: __arrayProto.reduce,
        reduceRight: __arrayProto.reduceRight,
        reverse: __arrayProto.reverse,
        // Object with rows, columns and opts
        selector: null,
        shift: __arrayProto.shift,
        slice: function() {
          return new _Api(this.context, this);
        },
        sort: __arrayProto.sort,
        splice: __arrayProto.splice,
        toArray: function() {
          return __arrayProto.slice.call(this);
        },
        to$: function() {
          return $3(this);
        },
        toJQuery: function() {
          return $3(this);
        },
        unique: function() {
          return new _Api(this.context, _unique(this.toArray()));
        },
        unshift: __arrayProto.unshift
      });
      function _api_scope(scope, fn, struc) {
        return function() {
          var ret = fn.apply(scope || this, arguments);
          _Api.extend(ret, ret, struc.methodExt);
          return ret;
        };
      }
      function _api_find(src, name) {
        for (var i2 = 0, ien = src.length; i2 < ien; i2++) {
          if (src[i2].name === name) {
            return src[i2];
          }
        }
        return null;
      }
      window2.__apiStruct = __apiStruct;
      _Api.extend = function(scope, obj, ext) {
        if (!ext.length || !obj || !(obj instanceof _Api) && !obj.__dt_wrapper) {
          return;
        }
        var i2, ien, struct;
        for (i2 = 0, ien = ext.length; i2 < ien; i2++) {
          struct = ext[i2];
          if (struct.name === "__proto__") {
            continue;
          }
          obj[struct.name] = struct.type === "function" ? _api_scope(scope, struct.val, struct) : struct.type === "object" ? {} : struct.val;
          obj[struct.name].__dt_wrapper = true;
          _Api.extend(scope, obj[struct.name], struct.propExt);
        }
      };
      _Api.register = _api_register = function(name, val) {
        if (Array.isArray(name)) {
          for (var j = 0, jen = name.length; j < jen; j++) {
            _Api.register(name[j], val);
          }
          return;
        }
        var i2, ien, heir = name.split("."), struct = __apiStruct, key, method;
        for (i2 = 0, ien = heir.length; i2 < ien; i2++) {
          method = heir[i2].indexOf("()") !== -1;
          key = method ? heir[i2].replace("()", "") : heir[i2];
          var src = _api_find(struct, key);
          if (!src) {
            src = {
              name: key,
              val: {},
              methodExt: [],
              propExt: [],
              type: "object"
            };
            struct.push(src);
          }
          if (i2 === ien - 1) {
            src.val = val;
            src.type = typeof val === "function" ? "function" : $3.isPlainObject(val) ? "object" : "other";
          } else {
            struct = method ? src.methodExt : src.propExt;
          }
        }
      };
      _Api.registerPlural = _api_registerPlural = function(pluralName, singularName, val) {
        _Api.register(pluralName, val);
        _Api.register(singularName, function() {
          var ret = val.apply(this, arguments);
          if (ret === this) {
            return this;
          } else if (ret instanceof _Api) {
            return ret.length ? Array.isArray(ret[0]) ? new _Api(ret.context, ret[0]) : (
              // Array results are 'enhanced'
              ret[0]
            ) : void 0;
          }
          return ret;
        });
      };
      var __table_selector = function(selector, a) {
        if (Array.isArray(selector)) {
          var result = [];
          selector.forEach(function(sel) {
            var inner = __table_selector(sel, a);
            result.push.apply(result, inner);
          });
          return result.filter(function(item) {
            return item;
          });
        }
        if (typeof selector === "number") {
          return [a[selector]];
        }
        var nodes = a.map(function(el) {
          return el.nTable;
        });
        return $3(nodes).filter(selector).map(function() {
          var idx = nodes.indexOf(this);
          return a[idx];
        }).toArray();
      };
      _api_register("tables()", function(selector) {
        return selector !== void 0 && selector !== null ? new _Api(__table_selector(selector, this.context)) : this;
      });
      _api_register("table()", function(selector) {
        var tables = this.tables(selector);
        var ctx = tables.context;
        return ctx.length ? new _Api(ctx[0]) : tables;
      });
      [
        ["nodes", "node", "nTable"],
        ["body", "body", "nTBody"],
        ["header", "header", "nTHead"],
        ["footer", "footer", "nTFoot"]
      ].forEach(function(item) {
        _api_registerPlural(
          "tables()." + item[0] + "()",
          "table()." + item[1] + "()",
          function() {
            return this.iterator("table", function(ctx) {
              return ctx[item[2]];
            }, 1);
          }
        );
      });
      [
        ["header", "aoHeader"],
        ["footer", "aoFooter"]
      ].forEach(function(item) {
        _api_register("table()." + item[0] + ".structure()", function(selector) {
          var indexes = this.columns(selector).indexes().flatten();
          var ctx = this.context[0];
          return _fnHeaderLayout(ctx, ctx[item[1]], indexes);
        });
      });
      _api_registerPlural("tables().containers()", "table().container()", function() {
        return this.iterator("table", function(ctx) {
          return ctx.nTableWrapper;
        }, 1);
      });
      _api_register("tables().every()", function(fn) {
        var that = this;
        return this.iterator("table", function(s, i2) {
          fn.call(that.table(i2), i2);
        });
      });
      _api_register("caption()", function(value, side) {
        var context = this.context;
        if (value === void 0) {
          var caption = context[0].captionNode;
          return caption && context.length ? caption.innerHTML : null;
        }
        return this.iterator("table", function(ctx) {
          var table = $3(ctx.nTable);
          var caption2 = $3(ctx.captionNode);
          var container = $3(ctx.nTableWrapper);
          if (!caption2.length) {
            caption2 = $3("<caption/>").html(value);
            ctx.captionNode = caption2[0];
            if (!side) {
              table.prepend(caption2);
              side = caption2.css("caption-side");
            }
          }
          caption2.html(value);
          if (side) {
            caption2.css("caption-side", side);
            caption2[0]._captionSide = side;
          }
          if (container.find("div.dataTables_scroll").length) {
            var selector = side === "top" ? "Head" : "Foot";
            container.find("div.dataTables_scroll" + selector + " table").prepend(caption2);
          } else {
            table.prepend(caption2);
          }
        }, 1);
      });
      _api_register("caption.node()", function() {
        var ctx = this.context;
        return ctx.length ? ctx[0].captionNode : null;
      });
      _api_register("draw()", function(paging) {
        return this.iterator("table", function(settings) {
          if (paging === "page") {
            _fnDraw(settings);
          } else {
            if (typeof paging === "string") {
              paging = paging === "full-hold" ? false : true;
            }
            _fnReDraw(settings, paging === false);
          }
        });
      });
      _api_register("page()", function(action) {
        if (action === void 0) {
          return this.page.info().page;
        }
        return this.iterator("table", function(settings) {
          _fnPageChange(settings, action);
        });
      });
      _api_register("page.info()", function() {
        if (this.context.length === 0) {
          return void 0;
        }
        var settings = this.context[0], start3 = settings._iDisplayStart, len = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1, visRecords = settings.fnRecordsDisplay(), all = len === -1;
        return {
          "page": all ? 0 : Math.floor(start3 / len),
          "pages": all ? 1 : Math.ceil(visRecords / len),
          "start": start3,
          "end": settings.fnDisplayEnd(),
          "length": len,
          "recordsTotal": settings.fnRecordsTotal(),
          "recordsDisplay": visRecords,
          "serverSide": _fnDataSource(settings) === "ssp"
        };
      });
      _api_register("page.len()", function(len) {
        if (len === void 0) {
          return this.context.length !== 0 ? this.context[0]._iDisplayLength : void 0;
        }
        return this.iterator("table", function(settings) {
          _fnLengthChange(settings, len);
        });
      });
      var __reload = function(settings, holdPosition, callback) {
        if (callback) {
          var api = new _Api(settings);
          api.one("draw", function() {
            callback(api.ajax.json());
          });
        }
        if (_fnDataSource(settings) == "ssp") {
          _fnReDraw(settings, holdPosition);
        } else {
          _fnProcessingDisplay(settings, true);
          var xhr = settings.jqXHR;
          if (xhr && xhr.readyState !== 4) {
            xhr.abort();
          }
          _fnBuildAjax(settings, {}, function(json) {
            _fnClearTable(settings);
            var data = _fnAjaxDataSrc(settings, json);
            for (var i2 = 0, ien = data.length; i2 < ien; i2++) {
              _fnAddData(settings, data[i2]);
            }
            _fnReDraw(settings, holdPosition);
            _fnInitComplete(settings);
            _fnProcessingDisplay(settings, false);
          });
        }
      };
      _api_register("ajax.json()", function() {
        var ctx = this.context;
        if (ctx.length > 0) {
          return ctx[0].json;
        }
      });
      _api_register("ajax.params()", function() {
        var ctx = this.context;
        if (ctx.length > 0) {
          return ctx[0].oAjaxData;
        }
      });
      _api_register("ajax.reload()", function(callback, resetPaging) {
        return this.iterator("table", function(settings) {
          __reload(settings, resetPaging === false, callback);
        });
      });
      _api_register("ajax.url()", function(url) {
        var ctx = this.context;
        if (url === void 0) {
          if (ctx.length === 0) {
            return void 0;
          }
          ctx = ctx[0];
          return $3.isPlainObject(ctx.ajax) ? ctx.ajax.url : ctx.ajax;
        }
        return this.iterator("table", function(settings) {
          if ($3.isPlainObject(settings.ajax)) {
            settings.ajax.url = url;
          } else {
            settings.ajax = url;
          }
        });
      });
      _api_register("ajax.url().load()", function(callback, resetPaging) {
        return this.iterator("table", function(ctx) {
          __reload(ctx, resetPaging === false, callback);
        });
      });
      var _selector_run = function(type, selector, selectFn, settings, opts) {
        var out = [], res, a, i2, ien, j, jen, selectorType = typeof selector;
        if (!selector || selectorType === "string" || selectorType === "function" || selector.length === void 0) {
          selector = [selector];
        }
        for (i2 = 0, ien = selector.length; i2 < ien; i2++) {
          a = selector[i2] && selector[i2].split && !selector[i2].match(/[[(:]/) ? selector[i2].split(",") : [selector[i2]];
          for (j = 0, jen = a.length; j < jen; j++) {
            res = selectFn(typeof a[j] === "string" ? a[j].trim() : a[j]);
            res = res.filter(function(item) {
              return item !== null && item !== void 0;
            });
            if (res && res.length) {
              out = out.concat(res);
            }
          }
        }
        var ext = _ext.selector[type];
        if (ext.length) {
          for (i2 = 0, ien = ext.length; i2 < ien; i2++) {
            out = ext[i2](settings, opts, out);
          }
        }
        return _unique(out);
      };
      var _selector_opts = function(opts) {
        if (!opts) {
          opts = {};
        }
        if (opts.filter && opts.search === void 0) {
          opts.search = opts.filter;
        }
        return $3.extend({
          search: "none",
          order: "current",
          page: "all"
        }, opts);
      };
      var _selector_first = function(old) {
        let inst = new _Api(old.context[0]);
        if (old.length) {
          inst.push(old[0]);
        }
        inst.selector = old.selector;
        if (inst.length && inst[0].length > 1) {
          inst[0].splice(1);
        }
        return inst;
      };
      var _selector_row_indexes = function(settings, opts) {
        var i2, ien, tmp, a = [], displayFiltered = settings.aiDisplay, displayMaster = settings.aiDisplayMaster;
        var search = opts.search, order = opts.order, page = opts.page;
        if (_fnDataSource(settings) == "ssp") {
          return search === "removed" ? [] : _range(0, displayMaster.length);
        }
        if (page == "current") {
          for (i2 = settings._iDisplayStart, ien = settings.fnDisplayEnd(); i2 < ien; i2++) {
            a.push(displayFiltered[i2]);
          }
        } else if (order == "current" || order == "applied") {
          if (search == "none") {
            a = displayMaster.slice();
          } else if (search == "applied") {
            a = displayFiltered.slice();
          } else if (search == "removed") {
            var displayFilteredMap = {};
            for (i2 = 0, ien = displayFiltered.length; i2 < ien; i2++) {
              displayFilteredMap[displayFiltered[i2]] = null;
            }
            displayMaster.forEach(function(item) {
              if (!Object.prototype.hasOwnProperty.call(displayFilteredMap, item)) {
                a.push(item);
              }
            });
          }
        } else if (order == "index" || order == "original") {
          for (i2 = 0, ien = settings.aoData.length; i2 < ien; i2++) {
            if (!settings.aoData[i2]) {
              continue;
            }
            if (search == "none") {
              a.push(i2);
            } else {
              tmp = displayFiltered.indexOf(i2);
              if (tmp === -1 && search == "removed" || tmp >= 0 && search == "applied") {
                a.push(i2);
              }
            }
          }
        } else if (typeof order === "number") {
          var ordered = _fnSort(settings, order, "asc");
          if (search === "none") {
            a = ordered;
          } else {
            for (i2 = 0; i2 < ordered.length; i2++) {
              tmp = displayFiltered.indexOf(ordered[i2]);
              if (tmp === -1 && search == "removed" || tmp >= 0 && search == "applied") {
                a.push(ordered[i2]);
              }
            }
          }
        }
        return a;
      };
      var __row_selector = function(settings, selector, opts) {
        var rows;
        var run = function(sel) {
          var selInt = _intVal(sel);
          var aoData = settings.aoData;
          if (selInt !== null && !opts) {
            return [selInt];
          }
          if (!rows) {
            rows = _selector_row_indexes(settings, opts);
          }
          if (selInt !== null && rows.indexOf(selInt) !== -1) {
            return [selInt];
          } else if (sel === null || sel === void 0 || sel === "") {
            return rows;
          }
          if (typeof sel === "function") {
            return rows.map(function(idx) {
              var row = aoData[idx];
              return sel(idx, row._aData, row.nTr) ? idx : null;
            });
          }
          if (sel.nodeName) {
            var rowIdx = sel._DT_RowIndex;
            var cellIdx = sel._DT_CellIndex;
            if (rowIdx !== void 0) {
              return aoData[rowIdx] && aoData[rowIdx].nTr === sel ? [rowIdx] : [];
            } else if (cellIdx) {
              return aoData[cellIdx.row] && aoData[cellIdx.row].nTr === sel.parentNode ? [cellIdx.row] : [];
            } else {
              var host = $3(sel).closest("*[data-dt-row]");
              return host.length ? [host.data("dt-row")] : [];
            }
          }
          if (typeof sel === "string" && sel.charAt(0) === "#") {
            var rowObj = settings.aIds[sel.replace(/^#/, "")];
            if (rowObj !== void 0) {
              return [rowObj.idx];
            }
          }
          var nodes = _removeEmpty(
            _pluck_order(settings.aoData, rows, "nTr")
          );
          return $3(nodes).filter(sel).map(function() {
            return this._DT_RowIndex;
          }).toArray();
        };
        var matched = _selector_run("row", selector, run, settings, opts);
        if (opts.order === "current" || opts.order === "applied") {
          _fnSortDisplay(settings, matched);
        }
        return matched;
      };
      _api_register("rows()", function(selector, opts) {
        if (selector === void 0) {
          selector = "";
        } else if ($3.isPlainObject(selector)) {
          opts = selector;
          selector = "";
        }
        opts = _selector_opts(opts);
        var inst = this.iterator("table", function(settings) {
          return __row_selector(settings, selector, opts);
        }, 1);
        inst.selector.rows = selector;
        inst.selector.opts = opts;
        return inst;
      });
      _api_register("rows().nodes()", function() {
        return this.iterator("row", function(settings, row) {
          return settings.aoData[row].nTr || void 0;
        }, 1);
      });
      _api_register("rows().data()", function() {
        return this.iterator(true, "rows", function(settings, rows) {
          return _pluck_order(settings.aoData, rows, "_aData");
        }, 1);
      });
      _api_registerPlural("rows().cache()", "row().cache()", function(type) {
        return this.iterator("row", function(settings, row) {
          var r = settings.aoData[row];
          return type === "search" ? r._aFilterData : r._aSortData;
        }, 1);
      });
      _api_registerPlural("rows().invalidate()", "row().invalidate()", function(src) {
        return this.iterator("row", function(settings, row) {
          _fnInvalidate(settings, row, src);
        });
      });
      _api_registerPlural("rows().indexes()", "row().index()", function() {
        return this.iterator("row", function(settings, row) {
          return row;
        }, 1);
      });
      _api_registerPlural("rows().ids()", "row().id()", function(hash) {
        var a = [];
        var context = this.context;
        for (var i2 = 0, ien = context.length; i2 < ien; i2++) {
          for (var j = 0, jen = this[i2].length; j < jen; j++) {
            var id = context[i2].rowIdFn(context[i2].aoData[this[i2][j]]._aData);
            a.push((hash === true ? "#" : "") + id);
          }
        }
        return new _Api(context, a);
      });
      _api_registerPlural("rows().remove()", "row().remove()", function() {
        this.iterator("row", function(settings, row) {
          var data = settings.aoData;
          var rowData = data[row];
          var idx = settings.aiDisplayMaster.indexOf(row);
          if (idx !== -1) {
            settings.aiDisplayMaster.splice(idx, 1);
          }
          if (settings._iRecordsDisplay > 0) {
            settings._iRecordsDisplay--;
          }
          _fnLengthOverflow(settings);
          var id = settings.rowIdFn(rowData._aData);
          if (id !== void 0) {
            delete settings.aIds[id];
          }
          data[row] = null;
        });
        return this;
      });
      _api_register("rows.add()", function(rows) {
        var newRows = this.iterator("table", function(settings) {
          var row, i2, ien;
          var out = [];
          for (i2 = 0, ien = rows.length; i2 < ien; i2++) {
            row = rows[i2];
            if (row.nodeName && row.nodeName.toUpperCase() === "TR") {
              out.push(_fnAddTr(settings, row)[0]);
            } else {
              out.push(_fnAddData(settings, row));
            }
          }
          return out;
        }, 1);
        var modRows = this.rows(-1);
        modRows.pop();
        modRows.push.apply(modRows, newRows);
        return modRows;
      });
      _api_register("row()", function(selector, opts) {
        return _selector_first(this.rows(selector, opts));
      });
      _api_register("row().data()", function(data) {
        var ctx = this.context;
        if (data === void 0) {
          return ctx.length && this.length && this[0].length ? ctx[0].aoData[this[0]]._aData : void 0;
        }
        var row = ctx[0].aoData[this[0]];
        row._aData = data;
        if (Array.isArray(data) && row.nTr && row.nTr.id) {
          _fnSetObjectDataFn(ctx[0].rowId)(data, row.nTr.id);
        }
        _fnInvalidate(ctx[0], this[0], "data");
        return this;
      });
      _api_register("row().node()", function() {
        var ctx = this.context;
        if (ctx.length && this.length && this[0].length) {
          var row = ctx[0].aoData[this[0]];
          if (row && row.nTr) {
            return row.nTr;
          }
        }
        return null;
      });
      _api_register("row.add()", function(row) {
        if (row instanceof $3 && row.length) {
          row = row[0];
        }
        var rows = this.iterator("table", function(settings) {
          if (row.nodeName && row.nodeName.toUpperCase() === "TR") {
            return _fnAddTr(settings, row)[0];
          }
          return _fnAddData(settings, row);
        });
        return this.row(rows[0]);
      });
      $3(document2).on("plugin-init.dt", function(e, context) {
        var api = new _Api(context);
        api.on("stateSaveParams.DT", function(e2, settings, d) {
          var idFn = settings.rowIdFn;
          var rows = settings.aiDisplayMaster;
          var ids = [];
          for (var i2 = 0; i2 < rows.length; i2++) {
            var rowIdx = rows[i2];
            var data = settings.aoData[rowIdx];
            if (data._detailsShow) {
              ids.push("#" + idFn(data._aData));
            }
          }
          d.childRows = ids;
        });
        api.on("stateLoaded.DT", function(e2, settings, state) {
          __details_state_load(api, state);
        });
        __details_state_load(api, api.state.loaded());
      });
      var __details_state_load = function(api, state) {
        if (state && state.childRows) {
          api.rows(state.childRows.map(function(id) {
            return id.replace(/([^:\\]*(?:\\.[^:\\]*)*):/g, "$1\\:");
          })).every(function() {
            _fnCallbackFire(api.settings()[0], null, "requestChild", [this]);
          });
        }
      };
      var __details_add = function(ctx, row, data, klass) {
        var rows = [];
        var addRow = function(r, k) {
          if (Array.isArray(r) || r instanceof $3) {
            for (var i2 = 0, ien = r.length; i2 < ien; i2++) {
              addRow(r[i2], k);
            }
            return;
          }
          if (r.nodeName && r.nodeName.toLowerCase() === "tr") {
            r.setAttribute("data-dt-row", row.idx);
            rows.push(r);
          } else {
            var created = $3("<tr><td></td></tr>").attr("data-dt-row", row.idx).addClass(k);
            $3("td", created).addClass(k).html(r)[0].colSpan = _fnVisbleColumns(ctx);
            rows.push(created[0]);
          }
        };
        addRow(data, klass);
        if (row._details) {
          row._details.detach();
        }
        row._details = $3(rows);
        if (row._detailsShow) {
          row._details.insertAfter(row.nTr);
        }
      };
      var __details_state = DataTable.util.throttle(
        function(ctx) {
          _fnSaveState(ctx[0]);
        },
        500
      );
      var __details_remove = function(api, idx) {
        var ctx = api.context;
        if (ctx.length) {
          var row = ctx[0].aoData[idx !== void 0 ? idx : api[0]];
          if (row && row._details) {
            row._details.remove();
            row._detailsShow = void 0;
            row._details = void 0;
            $3(row.nTr).removeClass("dt-hasChild");
            __details_state(ctx);
          }
        }
      };
      var __details_display = function(api, show) {
        var ctx = api.context;
        if (ctx.length && api.length) {
          var row = ctx[0].aoData[api[0]];
          if (row._details) {
            row._detailsShow = show;
            if (show) {
              row._details.insertAfter(row.nTr);
              $3(row.nTr).addClass("dt-hasChild");
            } else {
              row._details.detach();
              $3(row.nTr).removeClass("dt-hasChild");
            }
            _fnCallbackFire(ctx[0], null, "childRow", [show, api.row(api[0])]);
            __details_events(ctx[0]);
            __details_state(ctx);
          }
        }
      };
      var __details_events = function(settings) {
        var api = new _Api(settings);
        var namespace = ".dt.DT_details";
        var drawEvent = "draw" + namespace;
        var colvisEvent = "column-sizing" + namespace;
        var destroyEvent = "destroy" + namespace;
        var data = settings.aoData;
        api.off(drawEvent + " " + colvisEvent + " " + destroyEvent);
        if (_pluck(data, "_details").length > 0) {
          api.on(drawEvent, function(e, ctx) {
            if (settings !== ctx) {
              return;
            }
            api.rows({ page: "current" }).eq(0).each(function(idx) {
              var row = data[idx];
              if (row._detailsShow) {
                row._details.insertAfter(row.nTr);
              }
            });
          });
          api.on(colvisEvent, function(e, ctx) {
            if (settings !== ctx) {
              return;
            }
            var row, visible = _fnVisbleColumns(ctx);
            for (var i2 = 0, ien = data.length; i2 < ien; i2++) {
              row = data[i2];
              if (row && row._details) {
                row._details.each(function() {
                  var el = $3(this).children("td");
                  if (el.length == 1) {
                    el.attr("colspan", visible);
                  }
                });
              }
            }
          });
          api.on(destroyEvent, function(e, ctx) {
            if (settings !== ctx) {
              return;
            }
            for (var i2 = 0, ien = data.length; i2 < ien; i2++) {
              if (data[i2] && data[i2]._details) {
                __details_remove(api, i2);
              }
            }
          });
        }
      };
      var _emp = "";
      var _child_obj = _emp + "row().child";
      var _child_mth = _child_obj + "()";
      _api_register(_child_mth, function(data, klass) {
        var ctx = this.context;
        if (data === void 0) {
          return ctx.length && this.length && ctx[0].aoData[this[0]] ? ctx[0].aoData[this[0]]._details : void 0;
        } else if (data === true) {
          this.child.show();
        } else if (data === false) {
          __details_remove(this);
        } else if (ctx.length && this.length) {
          __details_add(ctx[0], ctx[0].aoData[this[0]], data, klass);
        }
        return this;
      });
      _api_register([
        _child_obj + ".show()",
        _child_mth + ".show()"
        // only when `child()` was called with parameters (without
      ], function() {
        __details_display(this, true);
        return this;
      });
      _api_register([
        _child_obj + ".hide()",
        _child_mth + ".hide()"
        // only when `child()` was called with parameters (without
      ], function() {
        __details_display(this, false);
        return this;
      });
      _api_register([
        _child_obj + ".remove()",
        _child_mth + ".remove()"
        // only when `child()` was called with parameters (without
      ], function() {
        __details_remove(this);
        return this;
      });
      _api_register(_child_obj + ".isShown()", function() {
        var ctx = this.context;
        if (ctx.length && this.length && ctx[0].aoData[this[0]]) {
          return ctx[0].aoData[this[0]]._detailsShow || false;
        }
        return false;
      });
      var __re_column_selector = /^([^:]+)?:(name|title|visIdx|visible)$/;
      var __columnData = function(settings, column, r1, r2, rows, type) {
        var a = [];
        for (var row = 0, ien = rows.length; row < ien; row++) {
          a.push(_fnGetCellData(settings, rows[row], column, type));
        }
        return a;
      };
      var __column_header = function(settings, column, row) {
        var header = settings.aoHeader;
        var target = row !== void 0 ? row : settings.bSortCellsTop ? 0 : header.length - 1;
        return header[target][column].cell;
      };
      var __column_selector = function(settings, selector, opts) {
        var columns = settings.aoColumns, names = _pluck(columns, "sName"), titles = _pluck(columns, "sTitle"), cells = DataTable.util.get("[].[].cell")(settings.aoHeader), nodes = _unique(_flatten([], cells));
        var run = function(s) {
          var selInt = _intVal(s);
          if (s === "") {
            return _range(columns.length);
          }
          if (selInt !== null) {
            return [
              selInt >= 0 ? selInt : (
                // Count from left
                columns.length + selInt
              )
              // Count from right (+ because its a negative value)
            ];
          }
          if (typeof s === "function") {
            var rows = _selector_row_indexes(settings, opts);
            return columns.map(function(col, idx2) {
              return s(
                idx2,
                __columnData(settings, idx2, 0, 0, rows),
                __column_header(settings, idx2)
              ) ? idx2 : null;
            });
          }
          var match = typeof s === "string" ? s.match(__re_column_selector) : "";
          if (match) {
            switch (match[2]) {
              case "visIdx":
              case "visible":
                if (match[1]) {
                  var idx = parseInt(match[1], 10);
                  if (idx < 0) {
                    var visColumns = columns.map(function(col, i2) {
                      return col.bVisible ? i2 : null;
                    });
                    return [visColumns[visColumns.length + idx]];
                  }
                  return [_fnVisibleToColumnIndex(settings, idx)];
                }
                return columns.map(function(col, i2) {
                  return col.bVisible ? i2 : null;
                });
              case "name":
                return names.map(function(name, i2) {
                  return name === match[1] ? i2 : null;
                });
              case "title":
                return titles.map(function(title, i2) {
                  return title === match[1] ? i2 : null;
                });
              default:
                return [];
            }
          }
          if (s.nodeName && s._DT_CellIndex) {
            return [s._DT_CellIndex.column];
          }
          var jqResult = $3(nodes).filter(s).map(function() {
            return _fnColumnsFromHeader(this);
          }).toArray();
          if (jqResult.length || !s.nodeName) {
            return jqResult;
          }
          var host = $3(s).closest("*[data-dt-column]");
          return host.length ? [host.data("dt-column")] : [];
        };
        return _selector_run("column", selector, run, settings, opts);
      };
      var __setColumnVis = function(settings, column, vis) {
        var cols = settings.aoColumns, col = cols[column], data = settings.aoData, cells, i2, ien, tr;
        if (vis === void 0) {
          return col.bVisible;
        }
        if (col.bVisible === vis) {
          return false;
        }
        if (vis) {
          var insertBefore = _pluck(cols, "bVisible").indexOf(true, column + 1);
          for (i2 = 0, ien = data.length; i2 < ien; i2++) {
            if (data[i2]) {
              tr = data[i2].nTr;
              cells = data[i2].anCells;
              if (tr) {
                tr.insertBefore(cells[column], cells[insertBefore] || null);
              }
            }
          }
        } else {
          $3(_pluck(settings.aoData, "anCells", column)).detach();
        }
        col.bVisible = vis;
        _colGroup(settings);
        return true;
      };
      _api_register("columns()", function(selector, opts) {
        if (selector === void 0) {
          selector = "";
        } else if ($3.isPlainObject(selector)) {
          opts = selector;
          selector = "";
        }
        opts = _selector_opts(opts);
        var inst = this.iterator("table", function(settings) {
          return __column_selector(settings, selector, opts);
        }, 1);
        inst.selector.cols = selector;
        inst.selector.opts = opts;
        return inst;
      });
      _api_registerPlural("columns().header()", "column().header()", function(row) {
        return this.iterator("column", function(settings, column) {
          return __column_header(settings, column, row);
        }, 1);
      });
      _api_registerPlural("columns().footer()", "column().footer()", function(row) {
        return this.iterator("column", function(settings, column) {
          var footer = settings.aoFooter;
          if (!footer.length) {
            return null;
          }
          return settings.aoFooter[row !== void 0 ? row : 0][column].cell;
        }, 1);
      });
      _api_registerPlural("columns().data()", "column().data()", function() {
        return this.iterator("column-rows", __columnData, 1);
      });
      _api_registerPlural("columns().render()", "column().render()", function(type) {
        return this.iterator("column-rows", function(settings, column, i2, j, rows) {
          return __columnData(settings, column, i2, j, rows, type);
        }, 1);
      });
      _api_registerPlural("columns().dataSrc()", "column().dataSrc()", function() {
        return this.iterator("column", function(settings, column) {
          return settings.aoColumns[column].mData;
        }, 1);
      });
      _api_registerPlural("columns().cache()", "column().cache()", function(type) {
        return this.iterator("column-rows", function(settings, column, i2, j, rows) {
          return _pluck_order(
            settings.aoData,
            rows,
            type === "search" ? "_aFilterData" : "_aSortData",
            column
          );
        }, 1);
      });
      _api_registerPlural("columns().init()", "column().init()", function() {
        return this.iterator("column", function(settings, column) {
          return settings.aoColumns[column];
        }, 1);
      });
      _api_registerPlural("columns().nodes()", "column().nodes()", function() {
        return this.iterator("column-rows", function(settings, column, i2, j, rows) {
          return _pluck_order(settings.aoData, rows, "anCells", column);
        }, 1);
      });
      _api_registerPlural("columns().titles()", "column().title()", function(title, row) {
        return this.iterator("column", function(settings, column) {
          if (typeof title === "number") {
            row = title;
            title = void 0;
          }
          var span = $3("span.dt-column-title", this.column(column).header(row));
          if (title !== void 0) {
            span.html(title);
            return this;
          }
          return span.html();
        }, 1);
      });
      _api_registerPlural("columns().types()", "column().type()", function() {
        return this.iterator("column", function(settings, column) {
          var type = settings.aoColumns[column].sType;
          if (!type) {
            _fnColumnTypes(settings);
          }
          return type;
        }, 1);
      });
      _api_registerPlural("columns().visible()", "column().visible()", function(vis, calc) {
        var that = this;
        var changed = [];
        var ret = this.iterator("column", function(settings, column) {
          if (vis === void 0) {
            return settings.aoColumns[column].bVisible;
          }
          if (__setColumnVis(settings, column, vis)) {
            changed.push(column);
          }
        });
        if (vis !== void 0) {
          this.iterator("table", function(settings) {
            _fnDrawHead(settings, settings.aoHeader);
            _fnDrawHead(settings, settings.aoFooter);
            if (!settings.aiDisplay.length) {
              $3(settings.nTBody).find("td[colspan]").attr("colspan", _fnVisbleColumns(settings));
            }
            _fnSaveState(settings);
            that.iterator("column", function(settings2, column) {
              if (changed.includes(column)) {
                _fnCallbackFire(settings2, null, "column-visibility", [settings2, column, vis, calc]);
              }
            });
            if (changed.length && (calc === void 0 || calc)) {
              that.columns.adjust();
            }
          });
        }
        return ret;
      });
      _api_registerPlural("columns().widths()", "column().width()", function() {
        var columns = this.columns(":visible").count();
        var row = $3("<tr>").html("<td>" + Array(columns).join("</td><td>") + "</td>");
        $3(this.table().body()).append(row);
        var widths = row.children().map(function() {
          return $3(this).outerWidth();
        });
        row.remove();
        return this.iterator("column", function(settings, column) {
          var visIdx = _fnColumnIndexToVisible(settings, column);
          return visIdx !== null ? widths[visIdx] : 0;
        }, 1);
      });
      _api_registerPlural("columns().indexes()", "column().index()", function(type) {
        return this.iterator("column", function(settings, column) {
          return type === "visible" ? _fnColumnIndexToVisible(settings, column) : column;
        }, 1);
      });
      _api_register("columns.adjust()", function() {
        return this.iterator("table", function(settings) {
          _fnAdjustColumnSizing(settings);
        }, 1);
      });
      _api_register("column.index()", function(type, idx) {
        if (this.context.length !== 0) {
          var ctx = this.context[0];
          if (type === "fromVisible" || type === "toData") {
            return _fnVisibleToColumnIndex(ctx, idx);
          } else if (type === "fromData" || type === "toVisible") {
            return _fnColumnIndexToVisible(ctx, idx);
          }
        }
      });
      _api_register("column()", function(selector, opts) {
        return _selector_first(this.columns(selector, opts));
      });
      var __cell_selector = function(settings, selector, opts) {
        var data = settings.aoData;
        var rows = _selector_row_indexes(settings, opts);
        var cells = _removeEmpty(_pluck_order(data, rows, "anCells"));
        var allCells = $3(_flatten([], cells));
        var row;
        var columns = settings.aoColumns.length;
        var a, i2, ien, j, o, host;
        var run = function(s) {
          var fnSelector = typeof s === "function";
          if (s === null || s === void 0 || fnSelector) {
            a = [];
            for (i2 = 0, ien = rows.length; i2 < ien; i2++) {
              row = rows[i2];
              for (j = 0; j < columns; j++) {
                o = {
                  row,
                  column: j
                };
                if (fnSelector) {
                  host = data[row];
                  if (s(o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null)) {
                    a.push(o);
                  }
                } else {
                  a.push(o);
                }
              }
            }
            return a;
          }
          if ($3.isPlainObject(s)) {
            return s.column !== void 0 && s.row !== void 0 && rows.indexOf(s.row) !== -1 ? [s] : [];
          }
          var jqResult = allCells.filter(s).map(function(i3, el) {
            return {
              // use a new object, in case someone changes the values
              row: el._DT_CellIndex.row,
              column: el._DT_CellIndex.column
            };
          }).toArray();
          if (jqResult.length || !s.nodeName) {
            return jqResult;
          }
          host = $3(s).closest("*[data-dt-row]");
          return host.length ? [{
            row: host.data("dt-row"),
            column: host.data("dt-column")
          }] : [];
        };
        return _selector_run("cell", selector, run, settings, opts);
      };
      _api_register("cells()", function(rowSelector, columnSelector, opts) {
        if ($3.isPlainObject(rowSelector)) {
          if (rowSelector.row === void 0) {
            opts = rowSelector;
            rowSelector = null;
          } else {
            opts = columnSelector;
            columnSelector = null;
          }
        }
        if ($3.isPlainObject(columnSelector)) {
          opts = columnSelector;
          columnSelector = null;
        }
        if (columnSelector === null || columnSelector === void 0) {
          return this.iterator("table", function(settings) {
            return __cell_selector(settings, rowSelector, _selector_opts(opts));
          });
        }
        var internalOpts = opts ? {
          page: opts.page,
          order: opts.order,
          search: opts.search
        } : {};
        var columns = this.columns(columnSelector, internalOpts);
        var rows = this.rows(rowSelector, internalOpts);
        var i2, ien, j, jen;
        var cellsNoOpts = this.iterator("table", function(settings, idx) {
          var a = [];
          for (i2 = 0, ien = rows[idx].length; i2 < ien; i2++) {
            for (j = 0, jen = columns[idx].length; j < jen; j++) {
              a.push({
                row: rows[idx][i2],
                column: columns[idx][j]
              });
            }
          }
          return a;
        }, 1);
        var cells = opts && opts.selected ? this.cells(cellsNoOpts, opts) : cellsNoOpts;
        $3.extend(cells.selector, {
          cols: columnSelector,
          rows: rowSelector,
          opts
        });
        return cells;
      });
      _api_registerPlural("cells().nodes()", "cell().node()", function() {
        return this.iterator("cell", function(settings, row, column) {
          var data = settings.aoData[row];
          return data && data.anCells ? data.anCells[column] : void 0;
        }, 1);
      });
      _api_register("cells().data()", function() {
        return this.iterator("cell", function(settings, row, column) {
          return _fnGetCellData(settings, row, column);
        }, 1);
      });
      _api_registerPlural("cells().cache()", "cell().cache()", function(type) {
        type = type === "search" ? "_aFilterData" : "_aSortData";
        return this.iterator("cell", function(settings, row, column) {
          return settings.aoData[row][type][column];
        }, 1);
      });
      _api_registerPlural("cells().render()", "cell().render()", function(type) {
        return this.iterator("cell", function(settings, row, column) {
          return _fnGetCellData(settings, row, column, type);
        }, 1);
      });
      _api_registerPlural("cells().indexes()", "cell().index()", function() {
        return this.iterator("cell", function(settings, row, column) {
          return {
            row,
            column,
            columnVisible: _fnColumnIndexToVisible(settings, column)
          };
        }, 1);
      });
      _api_registerPlural("cells().invalidate()", "cell().invalidate()", function(src) {
        return this.iterator("cell", function(settings, row, column) {
          _fnInvalidate(settings, row, src, column);
        });
      });
      _api_register("cell()", function(rowSelector, columnSelector, opts) {
        return _selector_first(this.cells(rowSelector, columnSelector, opts));
      });
      _api_register("cell().data()", function(data) {
        var ctx = this.context;
        var cell = this[0];
        if (data === void 0) {
          return ctx.length && cell.length ? _fnGetCellData(ctx[0], cell[0].row, cell[0].column) : void 0;
        }
        _fnSetCellData(ctx[0], cell[0].row, cell[0].column, data);
        _fnInvalidate(ctx[0], cell[0].row, "data", cell[0].column);
        return this;
      });
      _api_register("order()", function(order, dir) {
        var ctx = this.context;
        var args = Array.prototype.slice.call(arguments);
        if (order === void 0) {
          return ctx.length !== 0 ? ctx[0].aaSorting : void 0;
        }
        if (typeof order === "number") {
          order = [[order, dir]];
        } else if (args.length > 1) {
          order = args;
        }
        return this.iterator("table", function(settings) {
          settings.aaSorting = Array.isArray(order) ? order.slice() : order;
        });
      });
      _api_register("order.listener()", function(node, column, callback) {
        return this.iterator("table", function(settings) {
          _fnSortAttachListener(settings, node, {}, column, callback);
        });
      });
      _api_register("order.fixed()", function(set) {
        if (!set) {
          var ctx = this.context;
          var fixed = ctx.length ? ctx[0].aaSortingFixed : void 0;
          return Array.isArray(fixed) ? { pre: fixed } : fixed;
        }
        return this.iterator("table", function(settings) {
          settings.aaSortingFixed = $3.extend(true, {}, set);
        });
      });
      _api_register([
        "columns().order()",
        "column().order()"
      ], function(dir) {
        var that = this;
        if (!dir) {
          return this.iterator("column", function(settings, idx) {
            var sort = _fnSortFlatten(settings);
            for (var i2 = 0, ien = sort.length; i2 < ien; i2++) {
              if (sort[i2].col === idx) {
                return sort[i2].dir;
              }
            }
            return null;
          }, 1);
        } else {
          return this.iterator("table", function(settings, i2) {
            settings.aaSorting = that[i2].map(function(col) {
              return [col, dir];
            });
          });
        }
      });
      _api_registerPlural("columns().orderable()", "column().orderable()", function(directions) {
        return this.iterator("column", function(settings, idx) {
          var col = settings.aoColumns[idx];
          return directions ? col.asSorting : col.bSortable;
        }, 1);
      });
      _api_register("processing()", function(show) {
        return this.iterator("table", function(ctx) {
          _fnProcessingDisplay(ctx, show);
        });
      });
      _api_register("search()", function(input, regex, smart, caseInsen) {
        var ctx = this.context;
        if (input === void 0) {
          return ctx.length !== 0 ? ctx[0].oPreviousSearch.search : void 0;
        }
        return this.iterator("table", function(settings) {
          if (!settings.oFeatures.bFilter) {
            return;
          }
          if (typeof regex === "object") {
            _fnFilterComplete(settings, $3.extend(settings.oPreviousSearch, regex, {
              search: input
            }));
          } else {
            _fnFilterComplete(settings, $3.extend(settings.oPreviousSearch, {
              search: input,
              regex: regex === null ? false : regex,
              smart: smart === null ? true : smart,
              caseInsensitive: caseInsen === null ? true : caseInsen
            }));
          }
        });
      });
      _api_register("search.fixed()", function(name, search) {
        var ret = this.iterator(true, "table", function(settings) {
          var fixed = settings.searchFixed;
          if (!name) {
            return Object.keys(fixed);
          } else if (search === void 0) {
            return fixed[name];
          } else if (search === null) {
            delete fixed[name];
          } else {
            fixed[name] = search;
          }
          return this;
        });
        return name !== void 0 && search === void 0 ? ret[0] : ret;
      });
      _api_registerPlural(
        "columns().search()",
        "column().search()",
        function(input, regex, smart, caseInsen) {
          return this.iterator("column", function(settings, column) {
            var preSearch = settings.aoPreSearchCols;
            if (input === void 0) {
              return preSearch[column].search;
            }
            if (!settings.oFeatures.bFilter) {
              return;
            }
            if (typeof regex === "object") {
              $3.extend(preSearch[column], regex, {
                search: input
              });
            } else {
              $3.extend(preSearch[column], {
                search: input,
                regex: regex === null ? false : regex,
                smart: smart === null ? true : smart,
                caseInsensitive: caseInsen === null ? true : caseInsen
              });
            }
            _fnFilterComplete(settings, settings.oPreviousSearch);
          });
        }
      );
      _api_register(
        [
          "columns().search.fixed()",
          "column().search.fixed()"
        ],
        function(name, search) {
          var ret = this.iterator(true, "column", function(settings, colIdx) {
            var fixed = settings.aoColumns[colIdx].searchFixed;
            if (!name) {
              return Object.keys(fixed);
            } else if (search === void 0) {
              return fixed[name];
            } else if (search === null) {
              delete fixed[name];
            } else {
              fixed[name] = search;
            }
            return this;
          });
          return name !== void 0 && search === void 0 ? ret[0] : ret;
        }
      );
      _api_register("state()", function(set, ignoreTime) {
        if (!set) {
          return this.context.length ? this.context[0].oSavedState : null;
        }
        var setMutate = $3.extend(true, {}, set);
        return this.iterator("table", function(settings) {
          if (ignoreTime !== false) {
            setMutate.time = +/* @__PURE__ */ new Date() + 100;
          }
          _fnImplementState(settings, setMutate, function() {
          });
        });
      });
      _api_register("state.clear()", function() {
        return this.iterator("table", function(settings) {
          settings.fnStateSaveCallback.call(settings.oInstance, settings, {});
        });
      });
      _api_register("state.loaded()", function() {
        return this.context.length ? this.context[0].oLoadedState : null;
      });
      _api_register("state.save()", function() {
        return this.iterator("table", function(settings) {
          _fnSaveState(settings);
        });
      });
      DataTable.use = function(module2, type) {
        if (type === "lib" || module2.fn) {
          $3 = module2;
        } else if (type == "win" || module2.document) {
          window2 = module2;
          document2 = module2.document;
        } else if (type === "datetime" || module2.type === "DateTime") {
          DataTable.DateTime = module2;
        }
      };
      DataTable.factory = function(root, jq) {
        var is = false;
        if (root && root.document) {
          window2 = root;
          document2 = root.document;
        }
        if (jq && jq.fn && jq.fn.jquery) {
          $3 = jq;
          is = true;
        }
        return is;
      };
      DataTable.versionCheck = function(version, version2) {
        var aThis = version2 ? version2.split(".") : DataTable.version.split(".");
        var aThat = version.split(".");
        var iThis, iThat;
        for (var i2 = 0, iLen = aThat.length; i2 < iLen; i2++) {
          iThis = parseInt(aThis[i2], 10) || 0;
          iThat = parseInt(aThat[i2], 10) || 0;
          if (iThis === iThat) {
            continue;
          }
          return iThis > iThat;
        }
        return true;
      };
      DataTable.isDataTable = function(table) {
        var t = $3(table).get(0);
        var is = false;
        if (table instanceof DataTable.Api) {
          return true;
        }
        $3.each(DataTable.settings, function(i2, o) {
          var head = o.nScrollHead ? $3("table", o.nScrollHead)[0] : null;
          var foot = o.nScrollFoot ? $3("table", o.nScrollFoot)[0] : null;
          if (o.nTable === t || head === t || foot === t) {
            is = true;
          }
        });
        return is;
      };
      DataTable.tables = function(visible) {
        var api = false;
        if ($3.isPlainObject(visible)) {
          api = visible.api;
          visible = visible.visible;
        }
        var a = DataTable.settings.filter(function(o) {
          return !visible || visible && $3(o.nTable).is(":visible") ? true : false;
        }).map(function(o) {
          return o.nTable;
        });
        return api ? new _Api(a) : a;
      };
      DataTable.camelToHungarian = _fnCamelToHungarian;
      _api_register("$()", function(selector, opts) {
        var rows = this.rows(opts).nodes(), jqRows = $3(rows);
        return $3([].concat(
          jqRows.filter(selector).toArray(),
          jqRows.find(selector).toArray()
        ));
      });
      $3.each(["on", "one", "off"], function(i2, key) {
        _api_register(key + "()", function() {
          var args = Array.prototype.slice.call(arguments);
          args[0] = args[0].split(/\s/).map(function(e) {
            return !e.match(/\.dt\b/) ? e + ".dt" : e;
          }).join(" ");
          var inst = $3(this.tables().nodes());
          inst[key].apply(inst, args);
          return this;
        });
      });
      _api_register("clear()", function() {
        return this.iterator("table", function(settings) {
          _fnClearTable(settings);
        });
      });
      _api_register("error()", function(msg) {
        return this.iterator("table", function(settings) {
          _fnLog(settings, 0, msg);
        });
      });
      _api_register("settings()", function() {
        return new _Api(this.context, this.context);
      });
      _api_register("init()", function() {
        var ctx = this.context;
        return ctx.length ? ctx[0].oInit : null;
      });
      _api_register("data()", function() {
        return this.iterator("table", function(settings) {
          return _pluck(settings.aoData, "_aData");
        }).flatten();
      });
      _api_register("trigger()", function(name, args, bubbles) {
        return this.iterator("table", function(settings) {
          return _fnCallbackFire(settings, null, name, args, bubbles);
        }).flatten();
      });
      _api_register("ready()", function(fn) {
        var ctx = this.context;
        if (!fn) {
          return ctx.length ? ctx[0]._bInitComplete || false : null;
        }
        return this.tables().every(function() {
          if (this.context[0]._bInitComplete) {
            fn.call(this);
          } else {
            this.on("init", function() {
              fn.call(this);
            });
          }
        });
      });
      _api_register("destroy()", function(remove) {
        remove = remove || false;
        return this.iterator("table", function(settings) {
          var classes = settings.oClasses;
          var table = settings.nTable;
          var tbody = settings.nTBody;
          var thead = settings.nTHead;
          var tfoot = settings.nTFoot;
          var jqTable = $3(table);
          var jqTbody = $3(tbody);
          var jqWrapper = $3(settings.nTableWrapper);
          var rows = settings.aoData.map(function(r) {
            return r ? r.nTr : null;
          });
          var orderClasses = classes.order;
          settings.bDestroying = true;
          _fnCallbackFire(settings, "aoDestroyCallback", "destroy", [settings], true);
          if (!remove) {
            new _Api(settings).columns().visible(true);
          }
          jqWrapper.off(".DT").find(":not(tbody *)").off(".DT");
          $3(window2).off(".DT-" + settings.sInstance);
          if (table != thead.parentNode) {
            jqTable.children("thead").detach();
            jqTable.append(thead);
          }
          if (tfoot && table != tfoot.parentNode) {
            jqTable.children("tfoot").detach();
            jqTable.append(tfoot);
          }
          settings.colgroup.remove();
          settings.aaSorting = [];
          settings.aaSortingFixed = [];
          _fnSortingClasses(settings);
          $3("th, td", thead).removeClass(
            orderClasses.canAsc + " " + orderClasses.canDesc + " " + orderClasses.isAsc + " " + orderClasses.isDesc
          ).css("width", "");
          jqTbody.children().detach();
          jqTbody.append(rows);
          var orig = settings.nTableWrapper.parentNode;
          var insertBefore = settings.nTableWrapper.nextSibling;
          var removedMethod = remove ? "remove" : "detach";
          jqTable[removedMethod]();
          jqWrapper[removedMethod]();
          if (!remove && orig) {
            orig.insertBefore(table, insertBefore);
            jqTable.css("width", settings.sDestroyWidth).removeClass(classes.table);
          }
          var idx = DataTable.settings.indexOf(settings);
          if (idx !== -1) {
            DataTable.settings.splice(idx, 1);
          }
        });
      });
      $3.each(["column", "row", "cell"], function(i2, type) {
        _api_register(type + "s().every()", function(fn) {
          var opts = this.selector.opts;
          var api = this;
          var inst;
          var counter = 0;
          return this.iterator("every", function(settings, selectedIdx, tableIdx) {
            inst = api[type](selectedIdx, opts);
            if (type === "cell") {
              fn.call(inst, inst[0][0].row, inst[0][0].column, tableIdx, counter);
            } else {
              fn.call(inst, selectedIdx, tableIdx, counter);
            }
            counter++;
          });
        });
      });
      _api_register("i18n()", function(token, def, plural) {
        var ctx = this.context[0];
        var resolved = _fnGetObjectDataFn(token)(ctx.oLanguage);
        if (resolved === void 0) {
          resolved = def;
        }
        if ($3.isPlainObject(resolved)) {
          resolved = plural !== void 0 && resolved[plural] !== void 0 ? resolved[plural] : resolved._;
        }
        return typeof resolved === "string" ? resolved.replace("%d", plural) : resolved;
      });
      DataTable.version = "2.0.8";
      DataTable.settings = [];
      DataTable.models = {};
      DataTable.models.oSearch = {
        /**
         * Flag to indicate if the filtering should be case insensitive or not
         */
        "caseInsensitive": true,
        /**
         * Applied search term
         */
        "search": "",
        /**
         * Flag to indicate if the search term should be interpreted as a
         * regular expression (true) or not (false) and therefore and special
         * regex characters escaped.
         */
        "regex": false,
        /**
         * Flag to indicate if DataTables is to use its smart filtering or not.
         */
        "smart": true,
        /**
         * Flag to indicate if DataTables should only trigger a search when
         * the return key is pressed.
         */
        "return": false
      };
      DataTable.models.oRow = {
        /**
         * TR element for the row
         */
        "nTr": null,
        /**
         * Array of TD elements for each row. This is null until the row has been
         * created.
         */
        "anCells": null,
        /**
         * Data object from the original data source for the row. This is either
         * an array if using the traditional form of DataTables, or an object if
         * using mData options. The exact type will depend on the passed in
         * data from the data source, or will be an array if using DOM a data
         * source.
         */
        "_aData": [],
        /**
         * Sorting data cache - this array is ostensibly the same length as the
         * number of columns (although each index is generated only as it is
         * needed), and holds the data that is used for sorting each column in the
         * row. We do this cache generation at the start of the sort in order that
         * the formatting of the sort data need be done only once for each cell
         * per sort. This array should not be read from or written to by anything
         * other than the master sorting methods.
         */
        "_aSortData": null,
        /**
         * Per cell filtering data cache. As per the sort data cache, used to
         * increase the performance of the filtering in DataTables
         */
        "_aFilterData": null,
        /**
         * Filtering data cache. This is the same as the cell filtering cache, but
         * in this case a string rather than an array. This is easily computed with
         * a join on `_aFilterData`, but is provided as a cache so the join isn't
         * needed on every search (memory traded for performance)
         */
        "_sFilterRow": null,
        /**
         * Denote if the original data source was from the DOM, or the data source
         * object. This is used for invalidating data, so DataTables can
         * automatically read data from the original source, unless uninstructed
         * otherwise.
         */
        "src": null,
        /**
         * Index in the aoData array. This saves an indexOf lookup when we have the
         * object, but want to know the index
         */
        "idx": -1,
        /**
         * Cached display value
         */
        displayData: null
      };
      DataTable.models.oColumn = {
        /**
         * Column index.
         */
        "idx": null,
        /**
         * A list of the columns that sorting should occur on when this column
         * is sorted. That this property is an array allows multi-column sorting
         * to be defined for a column (for example first name / last name columns
         * would benefit from this). The values are integers pointing to the
         * columns to be sorted on (typically it will be a single integer pointing
         * at itself, but that doesn't need to be the case).
         */
        "aDataSort": null,
        /**
         * Define the sorting directions that are applied to the column, in sequence
         * as the column is repeatedly sorted upon - i.e. the first value is used
         * as the sorting direction when the column if first sorted (clicked on).
         * Sort it again (click again) and it will move on to the next index.
         * Repeat until loop.
         */
        "asSorting": null,
        /**
         * Flag to indicate if the column is searchable, and thus should be included
         * in the filtering or not.
         */
        "bSearchable": null,
        /**
         * Flag to indicate if the column is sortable or not.
         */
        "bSortable": null,
        /**
         * Flag to indicate if the column is currently visible in the table or not
         */
        "bVisible": null,
        /**
         * Store for manual type assignment using the `column.type` option. This
         * is held in store so we can manipulate the column's `sType` property.
         */
        "_sManualType": null,
        /**
         * Flag to indicate if HTML5 data attributes should be used as the data
         * source for filtering or sorting. True is either are.
         */
        "_bAttrSrc": false,
        /**
         * Developer definable function that is called whenever a cell is created (Ajax source,
         * etc) or processed for input (DOM source). This can be used as a compliment to mRender
         * allowing you to modify the DOM element (add background colour for example) when the
         * element is available.
         */
        "fnCreatedCell": null,
        /**
         * Function to get data from a cell in a column. You should <b>never</b>
         * access data directly through _aData internally in DataTables - always use
         * the method attached to this property. It allows mData to function as
         * required. This function is automatically assigned by the column
         * initialisation method
         */
        "fnGetData": null,
        /**
         * Function to set data for a cell in the column. You should <b>never</b>
         * set the data directly to _aData internally in DataTables - always use
         * this method. It allows mData to function as required. This function
         * is automatically assigned by the column initialisation method
         */
        "fnSetData": null,
        /**
         * Property to read the value for the cells in the column from the data
         * source array / object. If null, then the default content is used, if a
         * function is given then the return from the function is used.
         */
        "mData": null,
        /**
         * Partner property to mData which is used (only when defined) to get
         * the data - i.e. it is basically the same as mData, but without the
         * 'set' option, and also the data fed to it is the result from mData.
         * This is the rendering method to match the data method of mData.
         */
        "mRender": null,
        /**
         * The class to apply to all TD elements in the table's TBODY for the column
         */
        "sClass": null,
        /**
         * When DataTables calculates the column widths to assign to each column,
         * it finds the longest string in each column and then constructs a
         * temporary table and reads the widths from that. The problem with this
         * is that "mmm" is much wider then "iiii", but the latter is a longer
         * string - thus the calculation can go wrong (doing it properly and putting
         * it into an DOM object and measuring that is horribly(!) slow). Thus as
         * a "work around" we provide this option. It will append its value to the
         * text that is found to be the longest string for the column - i.e. padding.
         */
        "sContentPadding": null,
        /**
         * Allows a default value to be given for a column's data, and will be used
         * whenever a null data source is encountered (this can be because mData
         * is set to null, or because the data source itself is null).
         */
        "sDefaultContent": null,
        /**
         * Name for the column, allowing reference to the column by name as well as
         * by index (needs a lookup to work by name).
         */
        "sName": null,
        /**
         * Custom sorting data type - defines which of the available plug-ins in
         * afnSortData the custom sorting will use - if any is defined.
         */
        "sSortDataType": "std",
        /**
         * Class to be applied to the header element when sorting on this column
         */
        "sSortingClass": null,
        /**
         * Title of the column - what is seen in the TH element (nTh).
         */
        "sTitle": null,
        /**
         * Column sorting and filtering type
         */
        "sType": null,
        /**
         * Width of the column
         */
        "sWidth": null,
        /**
         * Width of the column when it was first "encountered"
         */
        "sWidthOrig": null,
        /** Cached string which is the longest in the column */
        maxLenString: null,
        /**
         * Store for named searches
         */
        searchFixed: null
      };
      DataTable.defaults = {
        /**
         * An array of data to use for the table, passed in at initialisation which
         * will be used in preference to any data which is already in the DOM. This is
         * particularly useful for constructing tables purely in Javascript, for
         * example with a custom Ajax call.
         */
        "aaData": null,
        /**
         * If ordering is enabled, then DataTables will perform a first pass sort on
         * initialisation. You can define which column(s) the sort is performed
         * upon, and the sorting direction, with this variable. The `sorting` array
         * should contain an array for each column to be sorted initially containing
         * the column's index and a direction string ('asc' or 'desc').
         */
        "aaSorting": [[0, "asc"]],
        /**
         * This parameter is basically identical to the `sorting` parameter, but
         * cannot be overridden by user interaction with the table. What this means
         * is that you could have a column (visible or hidden) which the sorting
         * will always be forced on first - any sorting after that (from the user)
         * will then be performed as required. This can be useful for grouping rows
         * together.
         */
        "aaSortingFixed": [],
        /**
         * DataTables can be instructed to load data to display in the table from a
         * Ajax source. This option defines how that Ajax call is made and where to.
         *
         * The `ajax` property has three different modes of operation, depending on
         * how it is defined. These are:
         *
         * * `string` - Set the URL from where the data should be loaded from.
         * * `object` - Define properties for `jQuery.ajax`.
         * * `function` - Custom data get function
         *
         * `string`
         * --------
         *
         * As a string, the `ajax` property simply defines the URL from which
         * DataTables will load data.
         *
         * `object`
         * --------
         *
         * As an object, the parameters in the object are passed to
         * [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) allowing fine control
         * of the Ajax request. DataTables has a number of default parameters which
         * you can override using this option. Please refer to the jQuery
         * documentation for a full description of the options available, although
         * the following parameters provide additional options in DataTables or
         * require special consideration:
         *
         * * `data` - As with jQuery, `data` can be provided as an object, but it
         *   can also be used as a function to manipulate the data DataTables sends
         *   to the server. The function takes a single parameter, an object of
         *   parameters with the values that DataTables has readied for sending. An
         *   object may be returned which will be merged into the DataTables
         *   defaults, or you can add the items to the object that was passed in and
         *   not return anything from the function. This supersedes `fnServerParams`
         *   from DataTables 1.9-.
         *
         * * `dataSrc` - By default DataTables will look for the property `data` (or
         *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
         *   from an Ajax source or for server-side processing - this parameter
         *   allows that property to be changed. You can use Javascript dotted
         *   object notation to get a data source for multiple levels of nesting, or
         *   it my be used as a function. As a function it takes a single parameter,
         *   the JSON returned from the server, which can be manipulated as
         *   required, with the returned value being that used by DataTables as the
         *   data source for the table.
         *
         * * `success` - Should not be overridden it is used internally in
         *   DataTables. To manipulate / transform the data returned by the server
         *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
         *
         * `function`
         * ----------
         *
         * As a function, making the Ajax call is left up to yourself allowing
         * complete control of the Ajax request. Indeed, if desired, a method other
         * than Ajax could be used to obtain the required data, such as Web storage
         * or an AIR database.
         *
         * The function is given four parameters and no return is required. The
         * parameters are:
         *
         * 1. _object_ - Data to send to the server
         * 2. _function_ - Callback function that must be executed when the required
         *    data has been obtained. That data should be passed into the callback
         *    as the only parameter
         * 3. _object_ - DataTables settings object for the table
         */
        "ajax": null,
        /**
         * This parameter allows you to readily specify the entries in the length drop
         * down menu that DataTables shows when pagination is enabled. It can be
         * either a 1D array of options which will be used for both the displayed
         * option and the value, or a 2D array which will use the array in the first
         * position as the value, and the array in the second position as the
         * displayed options (useful for language strings such as 'All').
         *
         * Note that the `pageLength` property will be automatically set to the
         * first value given in this array, unless `pageLength` is also provided.
         */
        "aLengthMenu": [10, 25, 50, 100],
        /**
         * The `columns` option in the initialisation parameter allows you to define
         * details about the way individual columns behave. For a full list of
         * column options that can be set, please see
         * {@link DataTable.defaults.column}. Note that if you use `columns` to
         * define your columns, you must have an entry in the array for every single
         * column that you have in your table (these can be null if you don't which
         * to specify any options).
         */
        "aoColumns": null,
        /**
         * Very similar to `columns`, `columnDefs` allows you to target a specific
         * column, multiple columns, or all columns, using the `targets` property of
         * each object in the array. This allows great flexibility when creating
         * tables, as the `columnDefs` arrays can be of any length, targeting the
         * columns you specifically want. `columnDefs` may use any of the column
         * options available: {@link DataTable.defaults.column}, but it _must_
         * have `targets` defined in each object in the array. Values in the `targets`
         * array may be:
         *   <ul>
         *     <li>a string - class name will be matched on the TH for the column</li>
         *     <li>0 or a positive integer - column index counting from the left</li>
         *     <li>a negative integer - column index counting from the right</li>
         *     <li>the string "_all" - all columns (i.e. assign a default)</li>
         *   </ul>
         */
        "aoColumnDefs": null,
        /**
         * Basically the same as `search`, this parameter defines the individual column
         * filtering state at initialisation time. The array must be of the same size
         * as the number of columns, and each element be an object with the parameters
         * `search` and `escapeRegex` (the latter is optional). 'null' is also
         * accepted and the default will be used.
         */
        "aoSearchCols": [],
        /**
         * Enable or disable automatic column width calculation. This can be disabled
         * as an optimisation (it takes some time to calculate the widths) if the
         * tables widths are passed in using `columns`.
         */
        "bAutoWidth": true,
        /**
         * Deferred rendering can provide DataTables with a huge speed boost when you
         * are using an Ajax or JS data source for the table. This option, when set to
         * true, will cause DataTables to defer the creation of the table elements for
         * each row until they are needed for a draw - saving a significant amount of
         * time.
         */
        "bDeferRender": true,
        /**
         * Replace a DataTable which matches the given selector and replace it with
         * one which has the properties of the new initialisation object passed. If no
         * table matches the selector, then the new DataTable will be constructed as
         * per normal.
         */
        "bDestroy": false,
        /**
         * Enable or disable filtering of data. Filtering in DataTables is "smart" in
         * that it allows the end user to input multiple words (space separated) and
         * will match a row containing those words, even if not in the order that was
         * specified (this allow matching across multiple columns). Note that if you
         * wish to use filtering in DataTables this must remain 'true' - to remove the
         * default filtering input box and retain filtering abilities, please use
         * {@link DataTable.defaults.dom}.
         */
        "bFilter": true,
        /**
         * Used only for compatiblity with DT1
         * @deprecated
         */
        "bInfo": true,
        /**
         * Used only for compatiblity with DT1
         * @deprecated
         */
        "bLengthChange": true,
        /**
         * Enable or disable pagination.
         */
        "bPaginate": true,
        /**
         * Enable or disable the display of a 'processing' indicator when the table is
         * being processed (e.g. a sort). This is particularly useful for tables with
         * large amounts of data where it can take a noticeable amount of time to sort
         * the entries.
         */
        "bProcessing": false,
        /**
         * Retrieve the DataTables object for the given selector. Note that if the
         * table has already been initialised, this parameter will cause DataTables
         * to simply return the object that has already been set up - it will not take
         * account of any changes you might have made to the initialisation object
         * passed to DataTables (setting this parameter to true is an acknowledgement
         * that you understand this). `destroy` can be used to reinitialise a table if
         * you need.
         */
        "bRetrieve": false,
        /**
         * When vertical (y) scrolling is enabled, DataTables will force the height of
         * the table's viewport to the given height at all times (useful for layout).
         * However, this can look odd when filtering data down to a small data set,
         * and the footer is left "floating" further down. This parameter (when
         * enabled) will cause DataTables to collapse the table's viewport down when
         * the result set will fit within the given Y height.
         */
        "bScrollCollapse": false,
        /**
         * Configure DataTables to use server-side processing. Note that the
         * `ajax` parameter must also be given in order to give DataTables a
         * source to obtain the required data for each draw.
         */
        "bServerSide": false,
        /**
         * Enable or disable sorting of columns. Sorting of individual columns can be
         * disabled by the `sortable` option for each column.
         */
        "bSort": true,
        /**
         * Enable or display DataTables' ability to sort multiple columns at the
         * same time (activated by shift-click by the user).
         */
        "bSortMulti": true,
        /**
         * Allows control over whether DataTables should use the top (true) unique
         * cell that is found for a single column, or the bottom (false - default).
         * This is useful when using complex headers.
         */
        "bSortCellsTop": null,
        /**
         * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
         * `sorting\_3` to the columns which are currently being sorted on. This is
         * presented as a feature switch as it can increase processing time (while
         * classes are removed and added) so for large data sets you might want to
         * turn this off.
         */
        "bSortClasses": true,
        /**
         * Enable or disable state saving. When enabled HTML5 `localStorage` will be
         * used to save table display information such as pagination information,
         * display length, filtering and sorting. As such when the end user reloads
         * the page the display display will match what thy had previously set up.
         */
        "bStateSave": false,
        /**
         * This function is called when a TR element is created (and all TD child
         * elements have been inserted), or registered if using a DOM source, allowing
         * manipulation of the TR element (adding classes etc).
         */
        "fnCreatedRow": null,
        /**
         * This function is called on every 'draw' event, and allows you to
         * dynamically modify any aspect you want about the created DOM.
         */
        "fnDrawCallback": null,
        /**
         * Identical to fnHeaderCallback() but for the table footer this function
         * allows you to modify the table footer on every 'draw' event.
         */
        "fnFooterCallback": null,
        /**
         * When rendering large numbers in the information element for the table
         * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
         * to have a comma separator for the 'thousands' units (e.g. 1 million is
         * rendered as "1,000,000") to help readability for the end user. This
         * function will override the default method DataTables uses.
         */
        "fnFormatNumber": function(toFormat) {
          return toFormat.toString().replace(
            /\B(?=(\d{3})+(?!\d))/g,
            this.oLanguage.sThousands
          );
        },
        /**
         * This function is called on every 'draw' event, and allows you to
         * dynamically modify the header row. This can be used to calculate and
         * display useful information about the table.
         */
        "fnHeaderCallback": null,
        /**
         * The information element can be used to convey information about the current
         * state of the table. Although the internationalisation options presented by
         * DataTables are quite capable of dealing with most customisations, there may
         * be times where you wish to customise the string further. This callback
         * allows you to do exactly that.
         */
        "fnInfoCallback": null,
        /**
         * Called when the table has been initialised. Normally DataTables will
         * initialise sequentially and there will be no need for this function,
         * however, this does not hold true when using external language information
         * since that is obtained using an async XHR call.
         */
        "fnInitComplete": null,
        /**
         * Called at the very start of each table draw and can be used to cancel the
         * draw by returning false, any other return (including undefined) results in
         * the full draw occurring).
         */
        "fnPreDrawCallback": null,
        /**
         * This function allows you to 'post process' each row after it have been
         * generated for each table draw, but before it is rendered on screen. This
         * function might be used for setting the row class name etc.
         */
        "fnRowCallback": null,
        /**
         * Load the table state. With this function you can define from where, and how, the
         * state of a table is loaded. By default DataTables will load from `localStorage`
         * but you might wish to use a server-side database or cookies.
         */
        "fnStateLoadCallback": function(settings) {
          try {
            return JSON.parse(
              (settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
                "DataTables_" + settings.sInstance + "_" + location.pathname
              )
            );
          } catch (e) {
            return {};
          }
        },
        /**
         * Callback which allows modification of the saved state prior to loading that state.
         * This callback is called when the table is loading state from the stored data, but
         * prior to the settings object being modified by the saved state. Note that for
         * plug-in authors, you should use the `stateLoadParams` event to load parameters for
         * a plug-in.
         */
        "fnStateLoadParams": null,
        /**
         * Callback that is called when the state has been loaded from the state saving method
         * and the DataTables settings object has been modified as a result of the loaded state.
         */
        "fnStateLoaded": null,
        /**
         * Save the table state. This function allows you to define where and how the state
         * information for the table is stored By default DataTables will use `localStorage`
         * but you might wish to use a server-side database or cookies.
         */
        "fnStateSaveCallback": function(settings, data) {
          try {
            (settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
              "DataTables_" + settings.sInstance + "_" + location.pathname,
              JSON.stringify(data)
            );
          } catch (e) {
          }
        },
        /**
         * Callback which allows modification of the state to be saved. Called when the table
         * has changed state a new state save is required. This method allows modification of
         * the state saving object prior to actually doing the save, including addition or
         * other state properties or modification. Note that for plug-in authors, you should
         * use the `stateSaveParams` event to save parameters for a plug-in.
         */
        "fnStateSaveParams": null,
        /**
         * Duration for which the saved state information is considered valid. After this period
         * has elapsed the state will be returned to the default.
         * Value is given in seconds.
         */
        "iStateDuration": 7200,
        /**
         * Number of rows to display on a single page when using pagination. If
         * feature enabled (`lengthChange`) then the end user will be able to override
         * this to a custom setting using a pop-up menu.
         */
        "iDisplayLength": 10,
        /**
         * Define the starting point for data display when using DataTables with
         * pagination. Note that this parameter is the number of records, rather than
         * the page number, so if you have 10 records per page and want to start on
         * the third page, it should be "20".
         */
        "iDisplayStart": 0,
        /**
         * By default DataTables allows keyboard navigation of the table (sorting, paging,
         * and filtering) by adding a `tabindex` attribute to the required elements. This
         * allows you to tab through the controls and press the enter key to activate them.
         * The tabindex is default 0, meaning that the tab follows the flow of the document.
         * You can overrule this using this parameter if you wish. Use a value of -1 to
         * disable built-in keyboard navigation.
         */
        "iTabIndex": 0,
        /**
         * Classes that DataTables assigns to the various components and features
         * that it adds to the HTML table. This allows classes to be configured
         * during initialisation in addition to through the static
         * {@link DataTable.ext.oStdClasses} object).
         */
        "oClasses": {},
        /**
         * All strings that DataTables uses in the user interface that it creates
         * are defined in this object, allowing you to modified them individually or
         * completely replace them all as required.
         */
        "oLanguage": {
          /**
           * Strings that are used for WAI-ARIA labels and controls only (these are not
           * actually visible on the page, but will be read by screenreaders, and thus
           * must be internationalised as well).
           */
          "oAria": {
            /**
             * ARIA label that is added to the table headers when the column may be sorted
             */
            "orderable": ": Activate to sort",
            /**
             * ARIA label that is added to the table headers when the column is currently being sorted
             */
            "orderableReverse": ": Activate to invert sorting",
            /**
             * ARIA label that is added to the table headers when the column is currently being 
             * sorted and next step is to remove sorting
             */
            "orderableRemove": ": Activate to remove sorting",
            paginate: {
              first: "First",
              last: "Last",
              next: "Next",
              previous: "Previous"
            }
          },
          /**
           * Pagination string used by DataTables for the built-in pagination
           * control types.
           */
          "oPaginate": {
            /**
             * Label and character for first page button («)
             */
            "sFirst": "\xAB",
            /**
             * Last page button (»)
             */
            "sLast": "\xBB",
            /**
             * Next page button (›)
             */
            "sNext": "\u203A",
            /**
             * Previous page button (‹)
             */
            "sPrevious": "\u2039"
          },
          /**
           * Plural object for the data type the table is showing
           */
          entries: {
            _: "entries",
            1: "entry"
          },
          /**
           * This string is shown in preference to `zeroRecords` when the table is
           * empty of data (regardless of filtering). Note that this is an optional
           * parameter - if it is not given, the value of `zeroRecords` will be used
           * instead (either the default or given value).
           */
          "sEmptyTable": "No data available in table",
          /**
           * This string gives information to the end user about the information
           * that is current on display on the page. The following tokens can be
           * used in the string and will be dynamically replaced as the table
           * display updates. This tokens can be placed anywhere in the string, or
           * removed as needed by the language requires:
           *
           * * `\_START\_` - Display index of the first record on the current page
           * * `\_END\_` - Display index of the last record on the current page
           * * `\_TOTAL\_` - Number of records in the table after filtering
           * * `\_MAX\_` - Number of records in the table without filtering
           * * `\_PAGE\_` - Current page number
           * * `\_PAGES\_` - Total number of pages of data in the table
           */
          "sInfo": "Showing _START_ to _END_ of _TOTAL_ _ENTRIES-TOTAL_",
          /**
           * Display information string for when the table is empty. Typically the
           * format of this string should match `info`.
           */
          "sInfoEmpty": "Showing 0 to 0 of 0 _ENTRIES-TOTAL_",
          /**
           * When a user filters the information in a table, this string is appended
           * to the information (`info`) to give an idea of how strong the filtering
           * is. The variable _MAX_ is dynamically updated.
           */
          "sInfoFiltered": "(filtered from _MAX_ total _ENTRIES-MAX_)",
          /**
           * If can be useful to append extra information to the info string at times,
           * and this variable does exactly that. This information will be appended to
           * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
           * being used) at all times.
           */
          "sInfoPostFix": "",
          /**
           * This decimal place operator is a little different from the other
           * language options since DataTables doesn't output floating point
           * numbers, so it won't ever use this for display of a number. Rather,
           * what this parameter does is modify the sort methods of the table so
           * that numbers which are in a format which has a character other than
           * a period (`.`) as a decimal place will be sorted numerically.
           *
           * Note that numbers with different decimal places cannot be shown in
           * the same table and still be sortable, the table must be consistent.
           * However, multiple different tables on the page can use different
           * decimal place characters.
           */
          "sDecimal": "",
          /**
           * DataTables has a build in number formatter (`formatNumber`) which is
           * used to format large numbers that are used in the table information.
           * By default a comma is used, but this can be trivially changed to any
           * character you wish with this parameter.
           */
          "sThousands": ",",
          /**
           * Detail the action that will be taken when the drop down menu for the
           * pagination length option is changed. The '_MENU_' variable is replaced
           * with a default select list of 10, 25, 50 and 100, and can be replaced
           * with a custom select box if required.
           */
          "sLengthMenu": "_MENU_ _ENTRIES_ per page",
          /**
           * When using Ajax sourced data and during the first draw when DataTables is
           * gathering the data, this message is shown in an empty row in the table to
           * indicate to the end user the the data is being loaded. Note that this
           * parameter is not used when loading data by server-side processing, just
           * Ajax sourced data with client-side processing.
           */
          "sLoadingRecords": "Loading...",
          /**
           * Text which is displayed when the table is processing a user action
           * (usually a sort command or similar).
           */
          "sProcessing": "",
          /**
           * Details the actions that will be taken when the user types into the
           * filtering input text box. The variable "_INPUT_", if used in the string,
           * is replaced with the HTML text box for the filtering input allowing
           * control over where it appears in the string. If "_INPUT_" is not given
           * then the input box is appended to the string automatically.
           */
          "sSearch": "Search:",
          /**
           * Assign a `placeholder` attribute to the search `input` element
           *  @type string
           *  @default 
           *
           *  @dtopt Language
           *  @name DataTable.defaults.language.searchPlaceholder
           */
          "sSearchPlaceholder": "",
          /**
           * All of the language information can be stored in a file on the
           * server-side, which DataTables will look up if this parameter is passed.
           * It must store the URL of the language file, which is in a JSON format,
           * and the object has the same properties as the oLanguage object in the
           * initialiser object (i.e. the above parameters). Please refer to one of
           * the example language files to see how this works in action.
           */
          "sUrl": "",
          /**
           * Text shown inside the table records when the is no information to be
           * displayed after filtering. `emptyTable` is shown when there is simply no
           * information in the table at all (regardless of filtering).
           */
          "sZeroRecords": "No matching records found"
        },
        /**
         * This parameter allows you to have define the global filtering state at
         * initialisation time. As an object the `search` parameter must be
         * defined, but all other parameters are optional. When `regex` is true,
         * the search string will be treated as a regular expression, when false
         * (default) it will be treated as a straight string. When `smart`
         * DataTables will use it's smart filtering methods (to word match at
         * any point in the data), when false this will not be done.
         */
        "oSearch": $3.extend({}, DataTable.models.oSearch),
        /**
         * Table and control layout. This replaces the legacy `dom` option.
         */
        layout: {
          topStart: "pageLength",
          topEnd: "search",
          bottomStart: "info",
          bottomEnd: "paging"
        },
        /**
         * Legacy DOM layout option
         */
        "sDom": null,
        /**
         * Search delay option. This will throttle full table searches that use the
         * DataTables provided search input element (it does not effect calls to
         * `dt-api search()`, providing a delay before the search is made.
         */
        "searchDelay": null,
        /**
         * DataTables features six different built-in options for the buttons to
         * display for pagination control:
         *
         * * `numbers` - Page number buttons only
         * * `simple` - 'Previous' and 'Next' buttons only
         * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
         * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
         * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
         * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
         */
        "sPaginationType": "full_numbers",
        /**
         * Enable horizontal scrolling. When a table is too wide to fit into a
         * certain layout, or you have a large number of columns in the table, you
         * can enable x-scrolling to show the table in a viewport, which can be
         * scrolled. This property can be `true` which will allow the table to
         * scroll horizontally when needed, or any CSS unit, or a number (in which
         * case it will be treated as a pixel measurement). Setting as simply `true`
         * is recommended.
         */
        "sScrollX": "",
        /**
         * This property can be used to force a DataTable to use more width than it
         * might otherwise do when x-scrolling is enabled. For example if you have a
         * table which requires to be well spaced, this parameter is useful for
         * "over-sizing" the table, and thus forcing scrolling. This property can by
         * any CSS unit, or a number (in which case it will be treated as a pixel
         * measurement).
         */
        "sScrollXInner": "",
        /**
         * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
         * to the given height, and enable scrolling for any data which overflows the
         * current viewport. This can be used as an alternative to paging to display
         * a lot of data in a small area (although paging and scrolling can both be
         * enabled at the same time). This property can be any CSS unit, or a number
         * (in which case it will be treated as a pixel measurement).
         */
        "sScrollY": "",
        /**
         * __Deprecated__ The functionality provided by this parameter has now been
         * superseded by that provided through `ajax`, which should be used instead.
         *
         * Set the HTTP method that is used to make the Ajax call for server-side
         * processing or Ajax sourced data.
         */
        "sServerMethod": "GET",
        /**
         * DataTables makes use of renderers when displaying HTML elements for
         * a table. These renderers can be added or modified by plug-ins to
         * generate suitable mark-up for a site. For example the Bootstrap
         * integration plug-in for DataTables uses a paging button renderer to
         * display pagination buttons in the mark-up required by Bootstrap.
         *
         * For further information about the renderers available see
         * DataTable.ext.renderer
         */
        "renderer": null,
        /**
         * Set the data property name that DataTables should use to get a row's id
         * to set as the `id` property in the node.
         */
        "rowId": "DT_RowId",
        /**
         * Caption value
         */
        "caption": null
      };
      _fnHungarianMap(DataTable.defaults);
      DataTable.defaults.column = {
        /**
         * Define which column(s) an order will occur on for this column. This
         * allows a column's ordering to take multiple columns into account when
         * doing a sort or use the data from a different column. For example first
         * name / last name columns make sense to do a multi-column sort over the
         * two columns.
         */
        "aDataSort": null,
        "iDataSort": -1,
        ariaTitle: "",
        /**
         * You can control the default ordering direction, and even alter the
         * behaviour of the sort handler (i.e. only allow ascending ordering etc)
         * using this parameter.
         */
        "asSorting": ["asc", "desc", ""],
        /**
         * Enable or disable filtering on the data in this column.
         */
        "bSearchable": true,
        /**
         * Enable or disable ordering on this column.
         */
        "bSortable": true,
        /**
         * Enable or disable the display of this column.
         */
        "bVisible": true,
        /**
         * Developer definable function that is called whenever a cell is created (Ajax source,
         * etc) or processed for input (DOM source). This can be used as a compliment to mRender
         * allowing you to modify the DOM element (add background colour for example) when the
         * element is available.
         */
        "fnCreatedCell": null,
        /**
         * This property can be used to read data from any data source property,
         * including deeply nested objects / properties. `data` can be given in a
         * number of different ways which effect its behaviour:
         *
         * * `integer` - treated as an array index for the data source. This is the
         *   default that DataTables uses (incrementally increased for each column).
         * * `string` - read an object property from the data source. There are
         *   three 'special' options that can be used in the string to alter how
         *   DataTables reads the data from the source object:
         *    * `.` - Dotted Javascript notation. Just as you use a `.` in
         *      Javascript to read from nested objects, so to can the options
         *      specified in `data`. For example: `browser.version` or
         *      `browser.name`. If your object parameter name contains a period, use
         *      `\\` to escape it - i.e. `first\\.name`.
         *    * `[]` - Array notation. DataTables can automatically combine data
         *      from and array source, joining the data with the characters provided
         *      between the two brackets. For example: `name[, ]` would provide a
         *      comma-space separated list from the source array. If no characters
         *      are provided between the brackets, the original array source is
         *      returned.
         *    * `()` - Function notation. Adding `()` to the end of a parameter will
         *      execute a function of the name given. For example: `browser()` for a
         *      simple function on the data source, `browser.version()` for a
         *      function in a nested property or even `browser().version` to get an
         *      object property if the function called returns an object. Note that
         *      function notation is recommended for use in `render` rather than
         *      `data` as it is much simpler to use as a renderer.
         * * `null` - use the original data source for the row rather than plucking
         *   data directly from it. This action has effects on two other
         *   initialisation options:
         *    * `defaultContent` - When null is given as the `data` option and
         *      `defaultContent` is specified for the column, the value defined by
         *      `defaultContent` will be used for the cell.
         *    * `render` - When null is used for the `data` option and the `render`
         *      option is specified for the column, the whole data source for the
         *      row is used for the renderer.
         * * `function` - the function given will be executed whenever DataTables
         *   needs to set or get the data for a cell in the column. The function
         *   takes three parameters:
         *    * Parameters:
         *      * `{array|object}` The data source for the row
         *      * `{string}` The type call data requested - this will be 'set' when
         *        setting data or 'filter', 'display', 'type', 'sort' or undefined
         *        when gathering data. Note that when `undefined` is given for the
         *        type DataTables expects to get the raw data for the object back<
         *      * `{*}` Data to set when the second parameter is 'set'.
         *    * Return:
         *      * The return value from the function is not required when 'set' is
         *        the type of call, but otherwise the return is what will be used
         *        for the data requested.
         *
         * Note that `data` is a getter and setter option. If you just require
         * formatting of data for output, you will likely want to use `render` which
         * is simply a getter and thus simpler to use.
         *
         * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
         * name change reflects the flexibility of this property and is consistent
         * with the naming of mRender. If 'mDataProp' is given, then it will still
         * be used by DataTables, as it automatically maps the old name to the new
         * if required.
         */
        "mData": null,
        /**
         * This property is the rendering partner to `data` and it is suggested that
         * when you want to manipulate data for display (including filtering,
         * sorting etc) without altering the underlying data for the table, use this
         * property. `render` can be considered to be the the read only companion to
         * `data` which is read / write (then as such more complex). Like `data`
         * this option can be given in a number of different ways to effect its
         * behaviour:
         *
         * * `integer` - treated as an array index for the data source. This is the
         *   default that DataTables uses (incrementally increased for each column).
         * * `string` - read an object property from the data source. There are
         *   three 'special' options that can be used in the string to alter how
         *   DataTables reads the data from the source object:
         *    * `.` - Dotted Javascript notation. Just as you use a `.` in
         *      Javascript to read from nested objects, so to can the options
         *      specified in `data`. For example: `browser.version` or
         *      `browser.name`. If your object parameter name contains a period, use
         *      `\\` to escape it - i.e. `first\\.name`.
         *    * `[]` - Array notation. DataTables can automatically combine data
         *      from and array source, joining the data with the characters provided
         *      between the two brackets. For example: `name[, ]` would provide a
         *      comma-space separated list from the source array. If no characters
         *      are provided between the brackets, the original array source is
         *      returned.
         *    * `()` - Function notation. Adding `()` to the end of a parameter will
         *      execute a function of the name given. For example: `browser()` for a
         *      simple function on the data source, `browser.version()` for a
         *      function in a nested property or even `browser().version` to get an
         *      object property if the function called returns an object.
         * * `object` - use different data for the different data types requested by
         *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
         *   of the object is the data type the property refers to and the value can
         *   defined using an integer, string or function using the same rules as
         *   `render` normally does. Note that an `_` option _must_ be specified.
         *   This is the default value to use if you haven't specified a value for
         *   the data type requested by DataTables.
         * * `function` - the function given will be executed whenever DataTables
         *   needs to set or get the data for a cell in the column. The function
         *   takes three parameters:
         *    * Parameters:
         *      * {array|object} The data source for the row (based on `data`)
         *      * {string} The type call data requested - this will be 'filter',
         *        'display', 'type' or 'sort'.
         *      * {array|object} The full data source for the row (not based on
         *        `data`)
         *    * Return:
         *      * The return value from the function is what will be used for the
         *        data requested.
         */
        "mRender": null,
        /**
         * Change the cell type created for the column - either TD cells or TH cells. This
         * can be useful as TH cells have semantic meaning in the table body, allowing them
         * to act as a header for a row (you may wish to add scope='row' to the TH elements).
         */
        "sCellType": "td",
        /**
         * Class to give to each cell in this column.
         */
        "sClass": "",
        /**
         * When DataTables calculates the column widths to assign to each column,
         * it finds the longest string in each column and then constructs a
         * temporary table and reads the widths from that. The problem with this
         * is that "mmm" is much wider then "iiii", but the latter is a longer
         * string - thus the calculation can go wrong (doing it properly and putting
         * it into an DOM object and measuring that is horribly(!) slow). Thus as
         * a "work around" we provide this option. It will append its value to the
         * text that is found to be the longest string for the column - i.e. padding.
         * Generally you shouldn't need this!
         */
        "sContentPadding": "",
        /**
         * Allows a default value to be given for a column's data, and will be used
         * whenever a null data source is encountered (this can be because `data`
         * is set to null, or because the data source itself is null).
         */
        "sDefaultContent": null,
        /**
         * This parameter is only used in DataTables' server-side processing. It can
         * be exceptionally useful to know what columns are being displayed on the
         * client side, and to map these to database fields. When defined, the names
         * also allow DataTables to reorder information from the server if it comes
         * back in an unexpected order (i.e. if you switch your columns around on the
         * client-side, your server-side code does not also need updating).
         */
        "sName": "",
        /**
         * Defines a data source type for the ordering which can be used to read
         * real-time information from the table (updating the internally cached
         * version) prior to ordering. This allows ordering to occur on user
         * editable elements such as form inputs.
         */
        "sSortDataType": "std",
        /**
         * The title of this column.
         */
        "sTitle": null,
        /**
         * The type allows you to specify how the data for this column will be
         * ordered. Four types (string, numeric, date and html (which will strip
         * HTML tags before ordering)) are currently available. Note that only date
         * formats understood by Javascript's Date() object will be accepted as type
         * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
         * 'numeric', 'date' or 'html' (by default). Further types can be adding
         * through plug-ins.
         */
        "sType": null,
        /**
         * Defining the width of the column, this parameter may take any CSS value
         * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
         * been given a specific width through this interface ensuring that the table
         * remains readable.
         */
        "sWidth": null
      };
      _fnHungarianMap(DataTable.defaults.column);
      DataTable.models.oSettings = {
        /**
         * Primary features of DataTables and their enablement state.
         */
        "oFeatures": {
          /**
           * Flag to say if DataTables should automatically try to calculate the
           * optimum table and columns widths (true) or not (false).
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bAutoWidth": null,
          /**
           * Delay the creation of TR and TD elements until they are actually
           * needed by a driven page draw. This can give a significant speed
           * increase for Ajax source and Javascript source data, but makes no
           * difference at all for DOM and server-side processing tables.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bDeferRender": null,
          /**
           * Enable filtering on the table or not. Note that if this is disabled
           * then there is no filtering at all on the table, including fnFilter.
           * To just remove the filtering input use sDom and remove the 'f' option.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bFilter": null,
          /**
           * Used only for compatiblity with DT1
           * @deprecated
           */
          "bInfo": true,
          /**
           * Used only for compatiblity with DT1
           * @deprecated
           */
          "bLengthChange": true,
          /**
           * Pagination enabled or not. Note that if this is disabled then length
           * changing must also be disabled.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bPaginate": null,
          /**
           * Processing indicator enable flag whenever DataTables is enacting a
           * user request - typically an Ajax request for server-side processing.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bProcessing": null,
          /**
           * Server-side processing enabled flag - when enabled DataTables will
           * get all data from the server for every draw - there is no filtering,
           * sorting or paging done on the client-side.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bServerSide": null,
          /**
           * Sorting enablement flag.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bSort": null,
          /**
           * Multi-column sorting
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bSortMulti": null,
          /**
           * Apply a class to the columns which are being sorted to provide a
           * visual highlight or not. This can slow things down when enabled since
           * there is a lot of DOM interaction.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bSortClasses": null,
          /**
           * State saving enablement flag.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bStateSave": null
        },
        /**
         * Scrolling settings for a table.
         */
        "oScroll": {
          /**
           * When the table is shorter in height than sScrollY, collapse the
           * table container down to the height of the table (when true).
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "bCollapse": null,
          /**
           * Width of the scrollbar for the web-browser's platform. Calculated
           * during table initialisation.
           */
          "iBarWidth": 0,
          /**
           * Viewport width for horizontal scrolling. Horizontal scrolling is
           * disabled if an empty string.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "sX": null,
          /**
           * Width to expand the table to when using x-scrolling. Typically you
           * should not need to use this.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           *  @deprecated
           */
          "sXInner": null,
          /**
           * Viewport height for vertical scrolling. Vertical scrolling is disabled
           * if an empty string.
           * Note that this parameter will be set by the initialisation routine. To
           * set a default use {@link DataTable.defaults}.
           */
          "sY": null
        },
        /**
         * Language information for the table.
         */
        "oLanguage": {
          /**
           * Information callback function. See
           * {@link DataTable.defaults.fnInfoCallback}
           */
          "fnInfoCallback": null
        },
        /**
         * Browser support parameters
         */
        "oBrowser": {
          /**
           * Determine if the vertical scrollbar is on the right or left of the
           * scrolling container - needed for rtl language layout, although not
           * all browsers move the scrollbar (Safari).
           */
          "bScrollbarLeft": false,
          /**
           * Browser scrollbar width
           */
          "barWidth": 0
        },
        "ajax": null,
        /**
         * Array referencing the nodes which are used for the features. The
         * parameters of this object match what is allowed by sDom - i.e.
         *   <ul>
         *     <li>'l' - Length changing</li>
         *     <li>'f' - Filtering input</li>
         *     <li>'t' - The table!</li>
         *     <li>'i' - Information</li>
         *     <li>'p' - Pagination</li>
         *     <li>'r' - pRocessing</li>
         *   </ul>
         */
        "aanFeatures": [],
        /**
         * Store data information - see {@link DataTable.models.oRow} for detailed
         * information.
         */
        "aoData": [],
        /**
         * Array of indexes which are in the current display (after filtering etc)
         */
        "aiDisplay": [],
        /**
         * Array of indexes for display - no filtering
         */
        "aiDisplayMaster": [],
        /**
         * Map of row ids to data indexes
         */
        "aIds": {},
        /**
         * Store information about each column that is in use
         */
        "aoColumns": [],
        /**
         * Store information about the table's header
         */
        "aoHeader": [],
        /**
         * Store information about the table's footer
         */
        "aoFooter": [],
        /**
         * Store the applied global search information in case we want to force a
         * research or compare the old search to a new one.
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "oPreviousSearch": {},
        /**
         * Store for named searches
         */
        searchFixed: {},
        /**
         * Store the applied search for each column - see
         * {@link DataTable.models.oSearch} for the format that is used for the
         * filtering information for each column.
         */
        "aoPreSearchCols": [],
        /**
         * Sorting that is applied to the table. Note that the inner arrays are
         * used in the following manner:
         * <ul>
         *   <li>Index 0 - column number</li>
         *   <li>Index 1 - current sorting direction</li>
         * </ul>
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "aaSorting": null,
        /**
         * Sorting that is always applied to the table (i.e. prefixed in front of
         * aaSorting).
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "aaSortingFixed": [],
        /**
         * If restoring a table - we should restore its width
         */
        "sDestroyWidth": 0,
        /**
         * Callback functions array for every time a row is inserted (i.e. on a draw).
         */
        "aoRowCallback": [],
        /**
         * Callback functions for the header on each draw.
         */
        "aoHeaderCallback": [],
        /**
         * Callback function for the footer on each draw.
         */
        "aoFooterCallback": [],
        /**
         * Array of callback functions for draw callback functions
         */
        "aoDrawCallback": [],
        /**
         * Array of callback functions for row created function
         */
        "aoRowCreatedCallback": [],
        /**
         * Callback functions for just before the table is redrawn. A return of
         * false will be used to cancel the draw.
         */
        "aoPreDrawCallback": [],
        /**
         * Callback functions for when the table has been initialised.
         */
        "aoInitComplete": [],
        /**
         * Callbacks for modifying the settings to be stored for state saving, prior to
         * saving state.
         */
        "aoStateSaveParams": [],
        /**
         * Callbacks for modifying the settings that have been stored for state saving
         * prior to using the stored values to restore the state.
         */
        "aoStateLoadParams": [],
        /**
         * Callbacks for operating on the settings object once the saved state has been
         * loaded
         */
        "aoStateLoaded": [],
        /**
         * Cache the table ID for quick access
         */
        "sTableId": "",
        /**
         * The TABLE node for the main table
         */
        "nTable": null,
        /**
         * Permanent ref to the thead element
         */
        "nTHead": null,
        /**
         * Permanent ref to the tfoot element - if it exists
         */
        "nTFoot": null,
        /**
         * Permanent ref to the tbody element
         */
        "nTBody": null,
        /**
         * Cache the wrapper node (contains all DataTables controlled elements)
         */
        "nTableWrapper": null,
        /**
         * Indicate if all required information has been read in
         */
        "bInitialised": false,
        /**
         * Information about open rows. Each object in the array has the parameters
         * 'nTr' and 'nParent'
         */
        "aoOpenRows": [],
        /**
         * Dictate the positioning of DataTables' control elements - see
         * {@link DataTable.model.oInit.sDom}.
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "sDom": null,
        /**
         * Search delay (in mS)
         */
        "searchDelay": null,
        /**
         * Which type of pagination should be used.
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "sPaginationType": "two_button",
        /**
         * Number of paging controls on the page. Only used for backwards compatibility
         */
        pagingControls: 0,
        /**
         * The state duration (for `stateSave`) in seconds.
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "iStateDuration": 0,
        /**
         * Array of callback functions for state saving. Each array element is an
         * object with the following parameters:
         *   <ul>
         *     <li>function:fn - function to call. Takes two parameters, oSettings
         *       and the JSON string to save that has been thus far created. Returns
         *       a JSON string to be inserted into a json object
         *       (i.e. '"param": [ 0, 1, 2]')</li>
         *     <li>string:sName - name of callback</li>
         *   </ul>
         */
        "aoStateSave": [],
        /**
         * Array of callback functions for state loading. Each array element is an
         * object with the following parameters:
         *   <ul>
         *     <li>function:fn - function to call. Takes two parameters, oSettings
         *       and the object stored. May return false to cancel state loading</li>
         *     <li>string:sName - name of callback</li>
         *   </ul>
         */
        "aoStateLoad": [],
        /**
         * State that was saved. Useful for back reference
         */
        "oSavedState": null,
        /**
         * State that was loaded. Useful for back reference
         */
        "oLoadedState": null,
        /**
         * Note if draw should be blocked while getting data
         */
        "bAjaxDataGet": true,
        /**
         * The last jQuery XHR object that was used for server-side data gathering.
         * This can be used for working with the XHR information in one of the
         * callbacks
         */
        "jqXHR": null,
        /**
         * JSON returned from the server in the last Ajax request
         */
        "json": void 0,
        /**
         * Data submitted as part of the last Ajax request
         */
        "oAjaxData": void 0,
        /**
         * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
         * required).
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "sServerMethod": null,
        /**
         * Format numbers for display.
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "fnFormatNumber": null,
        /**
         * List of options that can be used for the user selectable length menu.
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "aLengthMenu": null,
        /**
         * Counter for the draws that the table does. Also used as a tracker for
         * server-side processing
         */
        "iDraw": 0,
        /**
         * Indicate if a redraw is being done - useful for Ajax
         */
        "bDrawing": false,
        /**
         * Draw index (iDraw) of the last error when parsing the returned data
         */
        "iDrawError": -1,
        /**
         * Paging display length
         */
        "_iDisplayLength": 10,
        /**
         * Paging start point - aiDisplay index
         */
        "_iDisplayStart": 0,
        /**
         * Server-side processing - number of records in the result set
         * (i.e. before filtering), Use fnRecordsTotal rather than
         * this property to get the value of the number of records, regardless of
         * the server-side processing setting.
         */
        "_iRecordsTotal": 0,
        /**
         * Server-side processing - number of records in the current display set
         * (i.e. after filtering). Use fnRecordsDisplay rather than
         * this property to get the value of the number of records, regardless of
         * the server-side processing setting.
         */
        "_iRecordsDisplay": 0,
        /**
         * The classes to use for the table
         */
        "oClasses": {},
        /**
         * Flag attached to the settings object so you can check in the draw
         * callback if filtering has been done in the draw. Deprecated in favour of
         * events.
         *  @deprecated
         */
        "bFiltered": false,
        /**
         * Flag attached to the settings object so you can check in the draw
         * callback if sorting has been done in the draw. Deprecated in favour of
         * events.
         *  @deprecated
         */
        "bSorted": false,
        /**
         * Indicate that if multiple rows are in the header and there is more than
         * one unique cell per column, if the top one (true) or bottom one (false)
         * should be used for sorting / title by DataTables.
         * Note that this parameter will be set by the initialisation routine. To
         * set a default use {@link DataTable.defaults}.
         */
        "bSortCellsTop": null,
        /**
         * Initialisation object that is used for the table
         */
        "oInit": null,
        /**
         * Destroy callback functions - for plug-ins to attach themselves to the
         * destroy so they can clean up markup and events.
         */
        "aoDestroyCallback": [],
        /**
         * Get the number of records in the current record set, before filtering
         */
        "fnRecordsTotal": function() {
          return _fnDataSource(this) == "ssp" ? this._iRecordsTotal * 1 : this.aiDisplayMaster.length;
        },
        /**
         * Get the number of records in the current record set, after filtering
         */
        "fnRecordsDisplay": function() {
          return _fnDataSource(this) == "ssp" ? this._iRecordsDisplay * 1 : this.aiDisplay.length;
        },
        /**
         * Get the display end point - aiDisplay index
         */
        "fnDisplayEnd": function() {
          var len = this._iDisplayLength, start3 = this._iDisplayStart, calc = start3 + len, records = this.aiDisplay.length, features = this.oFeatures, paginate = features.bPaginate;
          if (features.bServerSide) {
            return paginate === false || len === -1 ? start3 + records : Math.min(start3 + len, this._iRecordsDisplay);
          } else {
            return !paginate || calc > records || len === -1 ? records : calc;
          }
        },
        /**
         * The DataTables object for this table
         */
        "oInstance": null,
        /**
         * Unique identifier for each instance of the DataTables object. If there
         * is an ID on the table node, then it takes that value, otherwise an
         * incrementing internal counter is used.
         */
        "sInstance": null,
        /**
         * tabindex attribute value that is added to DataTables control elements, allowing
         * keyboard navigation of the table and its controls.
         */
        "iTabIndex": 0,
        /**
         * DIV container for the footer scrolling table if scrolling
         */
        "nScrollHead": null,
        /**
         * DIV container for the footer scrolling table if scrolling
         */
        "nScrollFoot": null,
        /**
         * Last applied sort
         */
        "aLastSort": [],
        /**
         * Stored plug-in instances
         */
        "oPlugins": {},
        /**
         * Function used to get a row's id from the row's data
         */
        "rowIdFn": null,
        /**
         * Data location where to store a row's id
         */
        "rowId": null,
        caption: "",
        captionNode: null,
        colgroup: null
      };
      var extPagination = DataTable.ext.pager;
      $3.extend(extPagination, {
        simple: function() {
          return ["previous", "next"];
        },
        full: function() {
          return ["first", "previous", "next", "last"];
        },
        numbers: function() {
          return ["numbers"];
        },
        simple_numbers: function() {
          return ["previous", "numbers", "next"];
        },
        full_numbers: function() {
          return ["first", "previous", "numbers", "next", "last"];
        },
        first_last: function() {
          return ["first", "last"];
        },
        first_last_numbers: function() {
          return ["first", "numbers", "last"];
        },
        // For testing and plug-ins to use
        _numbers: _pagingNumbers,
        // Number of number buttons - legacy, use `numbers` option for paging feature
        numbers_length: 7
      });
      $3.extend(true, DataTable.ext.renderer, {
        pagingButton: {
          _: function(settings, buttonType, content, active, disabled) {
            var classes = settings.oClasses.paging;
            var btnClasses = [classes.button];
            var btn;
            if (active) {
              btnClasses.push(classes.active);
            }
            if (disabled) {
              btnClasses.push(classes.disabled);
            }
            if (buttonType === "ellipsis") {
              btn = $3('<span class="ellipsis"></span>').html(content)[0];
            } else {
              btn = $3("<button>", {
                class: btnClasses.join(" "),
                role: "link",
                type: "button"
              }).html(content);
            }
            return {
              display: btn,
              clicker: btn
            };
          }
        },
        pagingContainer: {
          _: function(settings, buttons) {
            return buttons;
          }
        }
      });
      var _filterString = function(stripHtml, normalize) {
        return function(str) {
          if (_empty(str) || typeof str !== "string") {
            return str;
          }
          str = str.replace(_re_new_lines, " ");
          if (stripHtml) {
            str = _stripHtml(str);
          }
          if (normalize) {
            str = _normalize(str, false);
          }
          return str;
        };
      };
      function __mldFnName(name) {
        return name.replace(/[\W]/g, "_");
      }
      function __mld(dt, momentFn, luxonFn, dateFn, arg1) {
        if (window2.moment) {
          return dt[momentFn](arg1);
        } else if (window2.luxon) {
          return dt[luxonFn](arg1);
        }
        return dateFn ? dt[dateFn](arg1) : dt;
      }
      var __mlWarning = false;
      function __mldObj(d, format, locale) {
        var dt;
        if (window2.moment) {
          dt = window2.moment.utc(d, format, locale, true);
          if (!dt.isValid()) {
            return null;
          }
        } else if (window2.luxon) {
          dt = format && typeof d === "string" ? window2.luxon.DateTime.fromFormat(d, format) : window2.luxon.DateTime.fromISO(d);
          if (!dt.isValid) {
            return null;
          }
          dt.setLocale(locale);
        } else if (!format) {
          dt = new Date(d);
        } else {
          if (!__mlWarning) {
            alert("DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17");
          }
          __mlWarning = true;
        }
        return dt;
      }
      function __mlHelper(localeString) {
        return function(from, to, locale, def) {
          if (arguments.length === 0) {
            locale = "en";
            to = null;
            from = null;
          } else if (arguments.length === 1) {
            locale = "en";
            to = from;
            from = null;
          } else if (arguments.length === 2) {
            locale = to;
            to = from;
            from = null;
          }
          var typeName = "datetime" + (to ? "-" + __mldFnName(to) : "");
          if (!DataTable.ext.type.order[typeName]) {
            DataTable.type(typeName, {
              detect: function(d) {
                return d === typeName ? typeName : false;
              },
              order: {
                pre: function(d) {
                  return d.valueOf();
                }
              },
              className: "dt-right"
            });
          }
          return function(d, type) {
            if (d === null || d === void 0) {
              if (def === "--now") {
                var local = /* @__PURE__ */ new Date();
                d = new Date(Date.UTC(
                  local.getFullYear(),
                  local.getMonth(),
                  local.getDate(),
                  local.getHours(),
                  local.getMinutes(),
                  local.getSeconds()
                ));
              } else {
                d = "";
              }
            }
            if (type === "type") {
              return typeName;
            }
            if (d === "") {
              return type !== "sort" ? "" : __mldObj("0000-01-01 00:00:00", null, locale);
            }
            if (to !== null && from === to && type !== "sort" && type !== "type" && !(d instanceof Date)) {
              return d;
            }
            var dt = __mldObj(d, from, locale);
            if (dt === null) {
              return d;
            }
            if (type === "sort") {
              return dt;
            }
            var formatted = to === null ? __mld(dt, "toDate", "toJSDate", "")[localeString]() : __mld(dt, "format", "toFormat", "toISOString", to);
            return type === "display" ? _escapeHtml(formatted) : formatted;
          };
        };
      }
      var __thousands = ",";
      var __decimal = ".";
      if (window2.Intl !== void 0) {
        try {
          var num = new Intl.NumberFormat().formatToParts(100000.1);
          for (var i = 0; i < num.length; i++) {
            if (num[i].type === "group") {
              __thousands = num[i].value;
            } else if (num[i].type === "decimal") {
              __decimal = num[i].value;
            }
          }
        } catch (e) {
        }
      }
      DataTable.datetime = function(format, locale) {
        var typeName = "datetime-detect-" + __mldFnName(format);
        if (!locale) {
          locale = "en";
        }
        if (!DataTable.ext.type.order[typeName]) {
          DataTable.type(typeName, {
            detect: function(d) {
              var dt = __mldObj(d, format, locale);
              return d === "" || dt ? typeName : false;
            },
            order: {
              pre: function(d) {
                return __mldObj(d, format, locale) || 0;
              }
            },
            className: "dt-right"
          });
        }
      };
      DataTable.render = {
        date: __mlHelper("toLocaleDateString"),
        datetime: __mlHelper("toLocaleString"),
        time: __mlHelper("toLocaleTimeString"),
        number: function(thousands, decimal, precision, prefix, postfix) {
          if (thousands === null || thousands === void 0) {
            thousands = __thousands;
          }
          if (decimal === null || decimal === void 0) {
            decimal = __decimal;
          }
          return {
            display: function(d) {
              if (typeof d !== "number" && typeof d !== "string") {
                return d;
              }
              if (d === "" || d === null) {
                return d;
              }
              var negative = d < 0 ? "-" : "";
              var flo = parseFloat(d);
              var abs = Math.abs(flo);
              if (abs >= 1e11 || abs < 1e-4 && abs !== 0) {
                var exp = flo.toExponential(precision).split(/e\+?/);
                return exp[0] + " x 10<sup>" + exp[1] + "</sup>";
              }
              if (isNaN(flo)) {
                return _escapeHtml(d);
              }
              flo = flo.toFixed(precision);
              d = Math.abs(flo);
              var intPart = parseInt(d, 10);
              var floatPart = precision ? decimal + (d - intPart).toFixed(precision).substring(2) : "";
              if (intPart === 0 && parseFloat(floatPart) === 0) {
                negative = "";
              }
              return negative + (prefix || "") + intPart.toString().replace(
                /\B(?=(\d{3})+(?!\d))/g,
                thousands
              ) + floatPart + (postfix || "");
            }
          };
        },
        text: function() {
          return {
            display: _escapeHtml,
            filter: _escapeHtml
          };
        }
      };
      var _extTypes = DataTable.ext.type;
      DataTable.type = function(name, prop, val) {
        if (!prop) {
          return {
            className: _extTypes.className[name],
            detect: _extTypes.detect.find(function(fn) {
              return fn.name === name;
            }),
            order: {
              pre: _extTypes.order[name + "-pre"],
              asc: _extTypes.order[name + "-asc"],
              desc: _extTypes.order[name + "-desc"]
            },
            render: _extTypes.render[name],
            search: _extTypes.search[name]
          };
        }
        var setProp = function(prop2, propVal) {
          _extTypes[prop2][name] = propVal;
        };
        var setDetect = function(fn) {
          var cb = function(d, s) {
            var ret = fn(d, s);
            return ret === true ? name : ret;
          };
          Object.defineProperty(cb, "name", { value: name });
          var idx = _extTypes.detect.findIndex(function(fn2) {
            return fn2.name === name;
          });
          if (idx === -1) {
            _extTypes.detect.unshift(cb);
          } else {
            _extTypes.detect.splice(idx, 1, cb);
          }
        };
        var setOrder = function(obj) {
          _extTypes.order[name + "-pre"] = obj.pre;
          _extTypes.order[name + "-asc"] = obj.asc;
          _extTypes.order[name + "-desc"] = obj.desc;
        };
        if (val === void 0) {
          val = prop;
          prop = null;
        }
        if (prop === "className") {
          setProp("className", val);
        } else if (prop === "detect") {
          setDetect(val);
        } else if (prop === "order") {
          setOrder(val);
        } else if (prop === "render") {
          setProp("render", val);
        } else if (prop === "search") {
          setProp("search", val);
        } else if (!prop) {
          if (val.className) {
            setProp("className", val.className);
          }
          if (val.detect !== void 0) {
            setDetect(val.detect);
          }
          if (val.order) {
            setOrder(val.order);
          }
          if (val.render !== void 0) {
            setProp("render", val.render);
          }
          if (val.search !== void 0) {
            setProp("search", val.search);
          }
        }
      };
      DataTable.types = function() {
        return _extTypes.detect.map(function(fn) {
          return fn.name;
        });
      };
      DataTable.type("string", {
        detect: function() {
          return "string";
        },
        order: {
          pre: function(a) {
            return _empty(a) ? "" : typeof a === "string" ? a.toLowerCase() : !a.toString ? "" : a.toString();
          }
        },
        search: _filterString(false, true)
      });
      DataTable.type("html", {
        detect: function(d) {
          return _empty(d) || typeof d === "string" && d.indexOf("<") !== -1 ? "html" : null;
        },
        order: {
          pre: function(a) {
            return _empty(a) ? "" : a.replace ? _stripHtml(a).trim().toLowerCase() : a + "";
          }
        },
        search: _filterString(true, true)
      });
      DataTable.type("date", {
        className: "dt-type-date",
        detect: function(d) {
          if (d && !(d instanceof Date) && !_re_date.test(d)) {
            return null;
          }
          var parsed = Date.parse(d);
          return parsed !== null && !isNaN(parsed) || _empty(d) ? "date" : null;
        },
        order: {
          pre: function(d) {
            var ts = Date.parse(d);
            return isNaN(ts) ? -Infinity : ts;
          }
        }
      });
      DataTable.type("html-num-fmt", {
        className: "dt-type-numeric",
        detect: function(d, settings) {
          var decimal = settings.oLanguage.sDecimal;
          return _htmlNumeric(d, decimal, true) ? "html-num-fmt" : null;
        },
        order: {
          pre: function(d, s) {
            var dp = s.oLanguage.sDecimal;
            return __numericReplace(d, dp, _re_html, _re_formatted_numeric);
          }
        },
        search: _filterString(true, true)
      });
      DataTable.type("html-num", {
        className: "dt-type-numeric",
        detect: function(d, settings) {
          var decimal = settings.oLanguage.sDecimal;
          return _htmlNumeric(d, decimal) ? "html-num" : null;
        },
        order: {
          pre: function(d, s) {
            var dp = s.oLanguage.sDecimal;
            return __numericReplace(d, dp, _re_html);
          }
        },
        search: _filterString(true, true)
      });
      DataTable.type("num-fmt", {
        className: "dt-type-numeric",
        detect: function(d, settings) {
          var decimal = settings.oLanguage.sDecimal;
          return _isNumber(d, decimal, true) ? "num-fmt" : null;
        },
        order: {
          pre: function(d, s) {
            var dp = s.oLanguage.sDecimal;
            return __numericReplace(d, dp, _re_formatted_numeric);
          }
        }
      });
      DataTable.type("num", {
        className: "dt-type-numeric",
        detect: function(d, settings) {
          var decimal = settings.oLanguage.sDecimal;
          return _isNumber(d, decimal) ? "num" : null;
        },
        order: {
          pre: function(d, s) {
            var dp = s.oLanguage.sDecimal;
            return __numericReplace(d, dp);
          }
        }
      });
      var __numericReplace = function(d, decimalPlace, re1, re2) {
        if (d !== 0 && (!d || d === "-")) {
          return -Infinity;
        }
        var type = typeof d;
        if (type === "number" || type === "bigint") {
          return d;
        }
        if (decimalPlace) {
          d = _numToDecimal(d, decimalPlace);
        }
        if (d.replace) {
          if (re1) {
            d = d.replace(re1, "");
          }
          if (re2) {
            d = d.replace(re2, "");
          }
        }
        return d * 1;
      };
      $3.extend(true, DataTable.ext.renderer, {
        footer: {
          _: function(settings, cell, classes) {
            cell.addClass(classes.tfoot.cell);
          }
        },
        header: {
          _: function(settings, cell, classes) {
            cell.addClass(classes.thead.cell);
            if (!settings.oFeatures.bSort) {
              cell.addClass(classes.order.none);
            }
            var legacyTop = settings.bSortCellsTop;
            var headerRows = cell.closest("thead").find("tr");
            var rowIdx = cell.parent().index();
            if (
              // Cells and rows which have the attribute to disable the icons
              cell.attr("data-dt-order") === "disable" || cell.parent().attr("data-dt-order") === "disable" || // Legacy support for `orderCellsTop`. If it is set, then cells
              // which are not in the top or bottom row of the header (depending
              // on the value) do not get the sorting classes applied to them
              legacyTop === true && rowIdx !== 0 || legacyTop === false && rowIdx !== headerRows.length - 1
            ) {
              return;
            }
            $3(settings.nTable).on("order.dt.DT", function(e, ctx, sorting) {
              if (settings !== ctx) {
                return;
              }
              var orderClasses = classes.order;
              var columns = ctx.api.columns(cell);
              var col = settings.aoColumns[columns.flatten()[0]];
              var orderable = columns.orderable().includes(true);
              var ariaType = "";
              var indexes = columns.indexes();
              var sortDirs = columns.orderable(true).flatten();
              var orderedColumns = "," + sorting.map(function(val) {
                return val.col;
              }).join(",") + ",";
              cell.removeClass(
                orderClasses.isAsc + " " + orderClasses.isDesc
              ).toggleClass(orderClasses.none, !orderable).toggleClass(orderClasses.canAsc, orderable && sortDirs.includes("asc")).toggleClass(orderClasses.canDesc, orderable && sortDirs.includes("desc"));
              var sortIdx = orderedColumns.indexOf("," + indexes.toArray().join(",") + ",");
              if (sortIdx !== -1) {
                var orderDirs = columns.order();
                cell.addClass(
                  orderDirs.includes("asc") ? orderClasses.isAsc : "" + orderDirs.includes("desc") ? orderClasses.isDesc : ""
                );
              }
              if (sortIdx === 0) {
                var firstSort = sorting[0];
                var sortOrder = col.asSorting;
                cell.attr("aria-sort", firstSort.dir === "asc" ? "ascending" : "descending");
                ariaType = !sortOrder[firstSort.index + 1] ? "Remove" : "Reverse";
              } else {
                cell.removeAttr("aria-sort");
              }
              cell.attr(
                "aria-label",
                orderable ? col.ariaTitle + ctx.api.i18n("oAria.orderable" + ariaType) : col.ariaTitle
              );
              if (orderable) {
                cell.find(".dt-column-title").attr("role", "button");
                cell.attr("tabindex", 0);
              }
            });
          }
        },
        layout: {
          _: function(settings, container, items) {
            var row = $3("<div/>").addClass("dt-layout-row").appendTo(container);
            $3.each(items, function(key, val) {
              var klass = !val.table ? "dt-" + key + " " : "";
              if (val.table) {
                row.addClass("dt-layout-table");
              }
              $3("<div/>").attr({
                id: val.id || null,
                "class": "dt-layout-cell " + klass + (val.className || "")
              }).append(val.contents).appendTo(row);
            });
          }
        }
      });
      DataTable.feature = {};
      DataTable.feature.register = function(name, cb, legacy) {
        DataTable.ext.features[name] = cb;
        if (legacy) {
          _ext.feature.push({
            cFeature: legacy,
            fnInit: cb
          });
        }
      };
      DataTable.feature.register("info", function(settings, opts) {
        if (!settings.oFeatures.bInfo) {
          return null;
        }
        var lang = settings.oLanguage, tid = settings.sTableId, n = $3("<div/>", {
          "class": settings.oClasses.info.container
        });
        opts = $3.extend({
          callback: lang.fnInfoCallback,
          empty: lang.sInfoEmpty,
          postfix: lang.sInfoPostFix,
          search: lang.sInfoFiltered,
          text: lang.sInfo
        }, opts);
        settings.aoDrawCallback.push(function(s) {
          _fnUpdateInfo(s, opts, n);
        });
        if (!settings._infoEl) {
          n.attr({
            "aria-live": "polite",
            id: tid + "_info",
            role: "status"
          });
          $3(settings.nTable).attr("aria-describedby", tid + "_info");
          settings._infoEl = n;
        }
        return n;
      }, "i");
      function _fnUpdateInfo(settings, opts, node) {
        var start3 = settings._iDisplayStart + 1, end = settings.fnDisplayEnd(), max = settings.fnRecordsTotal(), total = settings.fnRecordsDisplay(), out = total ? opts.text : opts.empty;
        if (total !== max) {
          out += " " + opts.search;
        }
        out += opts.postfix;
        out = _fnMacros(settings, out);
        if (opts.callback) {
          out = opts.callback.call(
            settings.oInstance,
            settings,
            start3,
            end,
            max,
            total,
            out
          );
        }
        node.html(out);
        _fnCallbackFire(settings, null, "info", [settings, node[0], out]);
      }
      var __searchCounter = 0;
      DataTable.feature.register("search", function(settings, opts) {
        if (!settings.oFeatures.bFilter) {
          return null;
        }
        var classes = settings.oClasses.search;
        var tableId = settings.sTableId;
        var language = settings.oLanguage;
        var previousSearch = settings.oPreviousSearch;
        var input = '<input type="search" class="' + classes.input + '"/>';
        opts = $3.extend({
          placeholder: language.sSearchPlaceholder,
          text: language.sSearch
        }, opts);
        if (opts.text.indexOf("_INPUT_") === -1) {
          opts.text += "_INPUT_";
        }
        opts.text = _fnMacros(settings, opts.text);
        var end = opts.text.match(/_INPUT_$/);
        var start3 = opts.text.match(/^_INPUT_/);
        var removed = opts.text.replace(/_INPUT_/, "");
        var str = "<label>" + opts.text + "</label>";
        if (start3) {
          str = "_INPUT_<label>" + removed + "</label>";
        } else if (end) {
          str = "<label>" + removed + "</label>_INPUT_";
        }
        var filter = $3("<div>").addClass(classes.container).append(str.replace(/_INPUT_/, input));
        filter.find("label").attr("for", "dt-search-" + __searchCounter);
        filter.find("input").attr("id", "dt-search-" + __searchCounter);
        __searchCounter++;
        var searchFn = function(event) {
          var val = this.value;
          if (previousSearch.return && event.key !== "Enter") {
            return;
          }
          if (val != previousSearch.search) {
            previousSearch.search = val;
            _fnFilterComplete(settings, previousSearch);
            settings._iDisplayStart = 0;
            _fnDraw(settings);
          }
        };
        var searchDelay = settings.searchDelay !== null ? settings.searchDelay : 0;
        var jqFilter = $3("input", filter).val(previousSearch.search).attr("placeholder", opts.placeholder).on(
          "keyup.DT search.DT input.DT paste.DT cut.DT",
          searchDelay ? DataTable.util.debounce(searchFn, searchDelay) : searchFn
        ).on("mouseup.DT", function(e) {
          setTimeout(function() {
            searchFn.call(jqFilter[0], e);
          }, 10);
        }).on("keypress.DT", function(e) {
          if (e.keyCode == 13) {
            return false;
          }
        }).attr("aria-controls", tableId);
        $3(settings.nTable).on("search.dt.DT", function(ev, s) {
          if (settings === s && jqFilter[0] !== document2.activeElement) {
            jqFilter.val(
              typeof previousSearch.search !== "function" ? previousSearch.search : ""
            );
          }
        });
        return filter;
      }, "f");
      DataTable.feature.register("paging", function(settings, opts) {
        if (!settings.oFeatures.bPaginate) {
          return null;
        }
        opts = $3.extend({
          buttons: DataTable.ext.pager.numbers_length,
          type: settings.sPaginationType,
          boundaryNumbers: true
        }, opts);
        if (opts.numbers) {
          opts.buttons = opts.numbers;
        }
        var host = $3("<div/>").addClass(settings.oClasses.paging.container + " paging_" + opts.type);
        var draw = function() {
          _pagingDraw(settings, host, opts);
        };
        settings.aoDrawCallback.push(draw);
        $3(settings.nTable).on("column-sizing.dt.DT", draw);
        return host;
      }, "p");
      function _pagingDraw(settings, host, opts) {
        if (!settings._bInitComplete) {
          return;
        }
        var plugin = DataTable.ext.pager[opts.type], aria = settings.oLanguage.oAria.paginate || {}, start3 = settings._iDisplayStart, len = settings._iDisplayLength, visRecords = settings.fnRecordsDisplay(), all = len === -1, page = all ? 0 : Math.ceil(start3 / len), pages = all ? 1 : Math.ceil(visRecords / len), buttons = plugin().map(function(val) {
          return val === "numbers" ? _pagingNumbers(page, pages, opts.buttons, opts.boundaryNumbers) : val;
        }).flat();
        var buttonEls = [];
        for (var i2 = 0; i2 < buttons.length; i2++) {
          var button = buttons[i2];
          var btnInfo = _pagingButtonInfo(settings, button, page, pages);
          var btn = _fnRenderer(settings, "pagingButton")(
            settings,
            button,
            btnInfo.display,
            btnInfo.active,
            btnInfo.disabled
          );
          $3(btn.clicker).attr({
            "aria-controls": settings.sTableId,
            "aria-disabled": btnInfo.disabled ? "true" : null,
            "aria-current": btnInfo.active ? "page" : null,
            "aria-label": aria[button],
            "data-dt-idx": button,
            "tabIndex": btnInfo.disabled ? -1 : settings.iTabIndex
          });
          if (typeof button !== "number") {
            $3(btn.clicker).addClass(button);
          }
          _fnBindAction(
            btn.clicker,
            { action: button },
            function(e) {
              e.preventDefault();
              _fnPageChange(settings, e.data.action, true);
            }
          );
          buttonEls.push(btn.display);
        }
        var wrapped = _fnRenderer(settings, "pagingContainer")(
          settings,
          buttonEls
        );
        var activeEl = host.find(document2.activeElement).data("dt-idx");
        host.empty().append(wrapped);
        if (activeEl !== void 0) {
          host.find("[data-dt-idx=" + activeEl + "]").trigger("focus");
        }
        if (buttonEls.length && // any buttons
        opts.numbers > 1 && // prevent infinite
        $3(host).height() >= $3(buttonEls[0]).outerHeight() * 2 - 10) {
          _pagingDraw(settings, host, $3.extend({}, opts, { numbers: opts.numbers - 2 }));
        }
      }
      function _pagingButtonInfo(settings, button, page, pages) {
        var lang = settings.oLanguage.oPaginate;
        var o = {
          display: "",
          active: false,
          disabled: false
        };
        switch (button) {
          case "ellipsis":
            o.display = "&#x2026;";
            o.disabled = true;
            break;
          case "first":
            o.display = lang.sFirst;
            if (page === 0) {
              o.disabled = true;
            }
            break;
          case "previous":
            o.display = lang.sPrevious;
            if (page === 0) {
              o.disabled = true;
            }
            break;
          case "next":
            o.display = lang.sNext;
            if (pages === 0 || page === pages - 1) {
              o.disabled = true;
            }
            break;
          case "last":
            o.display = lang.sLast;
            if (pages === 0 || page === pages - 1) {
              o.disabled = true;
            }
            break;
          default:
            if (typeof button === "number") {
              o.display = settings.fnFormatNumber(button + 1);
              if (page === button) {
                o.active = true;
              }
            }
            break;
        }
        return o;
      }
      function _pagingNumbers(page, pages, buttons, addFirstLast) {
        var numbers = [], half = Math.floor(buttons / 2), before = addFirstLast ? 2 : 1, after = addFirstLast ? 1 : 0;
        if (pages <= buttons) {
          numbers = _range(0, pages);
        } else if (buttons === 1) {
          numbers = [page];
        } else if (buttons === 3) {
          if (page <= 1) {
            numbers = [0, 1, "ellipsis"];
          } else if (page >= pages - 2) {
            numbers = _range(pages - 2, pages);
            numbers.unshift("ellipsis");
          } else {
            numbers = ["ellipsis", page, "ellipsis"];
          }
        } else if (page <= half) {
          numbers = _range(0, buttons - before);
          numbers.push("ellipsis");
          if (addFirstLast) {
            numbers.push(pages - 1);
          }
        } else if (page >= pages - 1 - half) {
          numbers = _range(pages - (buttons - before), pages);
          numbers.unshift("ellipsis");
          if (addFirstLast) {
            numbers.unshift(0);
          }
        } else {
          numbers = _range(page - half + before, page + half - after);
          numbers.push("ellipsis");
          numbers.unshift("ellipsis");
          if (addFirstLast) {
            numbers.push(pages - 1);
            numbers.unshift(0);
          }
        }
        return numbers;
      }
      var __lengthCounter = 0;
      DataTable.feature.register("pageLength", function(settings, opts) {
        var features = settings.oFeatures;
        if (!features.bPaginate || !features.bLengthChange) {
          return null;
        }
        opts = $3.extend({
          menu: settings.aLengthMenu,
          text: settings.oLanguage.sLengthMenu
        }, opts);
        var classes = settings.oClasses.length, tableId = settings.sTableId, menu = opts.menu, lengths = [], language = [], i2;
        if (Array.isArray(menu[0])) {
          lengths = menu[0];
          language = menu[1];
        } else {
          for (i2 = 0; i2 < menu.length; i2++) {
            if ($3.isPlainObject(menu[i2])) {
              lengths.push(menu[i2].value);
              language.push(menu[i2].label);
            } else {
              lengths.push(menu[i2]);
              language.push(menu[i2]);
            }
          }
        }
        var end = opts.text.match(/_MENU_$/);
        var start3 = opts.text.match(/^_MENU_/);
        var removed = opts.text.replace(/_MENU_/, "");
        var str = "<label>" + opts.text + "</label>";
        if (start3) {
          str = "_MENU_<label>" + removed + "</label>";
        } else if (end) {
          str = "<label>" + removed + "</label>_MENU_";
        }
        var div = $3("<div/>").addClass(classes.container).append(
          str.replace("_MENU_", "<span></span>")
        );
        var textNodes = [];
        div.find("label")[0].childNodes.forEach(function(el) {
          if (el.nodeType === Node.TEXT_NODE) {
            textNodes.push({
              el,
              text: el.textContent
            });
          }
        });
        var updateEntries = function(len) {
          textNodes.forEach(function(node) {
            node.el.textContent = _fnMacros(settings, node.text, len);
          });
        };
        var select = $3("<select/>", {
          "name": tableId + "_length",
          "aria-controls": tableId,
          "class": classes.select
        });
        for (i2 = 0; i2 < lengths.length; i2++) {
          select[0][i2] = new Option(
            typeof language[i2] === "number" ? settings.fnFormatNumber(language[i2]) : language[i2],
            lengths[i2]
          );
        }
        div.find("label").attr("for", "dt-length-" + __lengthCounter);
        select.attr("id", "dt-length-" + __lengthCounter);
        __lengthCounter++;
        div.find("span").replaceWith(select);
        $3("select", div).val(settings._iDisplayLength).on("change.DT", function() {
          _fnLengthChange(settings, $3(this).val());
          _fnDraw(settings);
        });
        $3(settings.nTable).on("length.dt.DT", function(e, s, len) {
          if (settings === s) {
            $3("select", div).val(len);
            updateEntries(len);
          }
        });
        updateEntries(settings._iDisplayLength);
        return div;
      }, "l");
      $3.fn.dataTable = DataTable;
      DataTable.$ = $3;
      $3.fn.dataTableSettings = DataTable.settings;
      $3.fn.dataTableExt = DataTable.ext;
      $3.fn.DataTable = function(opts) {
        return $3(this).dataTable(opts).api();
      };
      $3.each(DataTable, function(prop, val) {
        $3.fn.DataTable[prop] = val;
      });
      return DataTable;
    });
  }
});

// node_modules/datatables.net-buttons/js/dataTables.buttons.js
var require_dataTables_buttons = __commonJS({
  "node_modules/datatables.net-buttons/js/dataTables.buttons.js"(exports, module) {
    (function(factory) {
      if (typeof define === "function" && define.amd) {
        define(["jquery", "datatables.net"], function($3) {
          return factory($3, window, document);
        });
      } else if (typeof exports === "object") {
        var jq = require_jquery();
        var cjsRequires = function(root, $3) {
          if (!$3.fn.dataTable) {
            require_dataTables()(root, $3);
          }
        };
        if (typeof window === "undefined") {
          module.exports = function(root, $3) {
            if (!root) {
              root = window;
            }
            if (!$3) {
              $3 = jq(root);
            }
            cjsRequires(root, $3);
            return factory($3, root, root.document);
          };
        } else {
          cjsRequires(window, jq);
          module.exports = factory(jq, window, window.document);
        }
      } else {
        factory(jQuery, window, document);
      }
    })(function($3, window2, document2) {
      "use strict";
      var DataTable = $3.fn.dataTable;
      var _instCounter = 0;
      var _buttonCounter = 0;
      var _dtButtons = DataTable.ext.buttons;
      var _entityDecoder = null;
      function _fadeIn(el, duration, fn) {
        if ($3.fn.animate) {
          el.stop().fadeIn(duration, fn);
        } else {
          el.css("display", "block");
          if (fn) {
            fn.call(el);
          }
        }
      }
      function _fadeOut(el, duration, fn) {
        if ($3.fn.animate) {
          el.stop().fadeOut(duration, fn);
        } else {
          el.css("display", "none");
          if (fn) {
            fn.call(el);
          }
        }
      }
      var Buttons = function(dt, config) {
        if (!DataTable.versionCheck("2")) {
          throw "Warning: Buttons requires DataTables 2 or newer";
        }
        if (!(this instanceof Buttons)) {
          return function(settings) {
            return new Buttons(settings, dt).container();
          };
        }
        if (typeof config === "undefined") {
          config = {};
        }
        if (config === true) {
          config = {};
        }
        if (Array.isArray(config)) {
          config = { buttons: config };
        }
        this.c = $3.extend(true, {}, Buttons.defaults, config);
        if (config.buttons) {
          this.c.buttons = config.buttons;
        }
        this.s = {
          dt: new DataTable.Api(dt),
          buttons: [],
          listenKeys: "",
          namespace: "dtb" + _instCounter++
        };
        this.dom = {
          container: $3("<" + this.c.dom.container.tag + "/>").addClass(
            this.c.dom.container.className
          )
        };
        this._constructor();
      };
      $3.extend(Buttons.prototype, {
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Public methods
         */
        /**
         * Get the action of a button
         * @param  {int|string} Button index
         * @return {function}
         */
        /**
        * Set the action of a button
        * @param  {node} node Button element
        * @param  {function} action Function to set
        * @return {Buttons} Self for chaining
        */
        action: function(node, action) {
          var button = this._nodeToButton(node);
          if (action === void 0) {
            return button.conf.action;
          }
          button.conf.action = action;
          return this;
        },
        /**
         * Add an active class to the button to make to look active or get current
         * active state.
         * @param  {node} node Button element
         * @param  {boolean} [flag] Enable / disable flag
         * @return {Buttons} Self for chaining or boolean for getter
         */
        active: function(node, flag) {
          var button = this._nodeToButton(node);
          var klass = this.c.dom.button.active;
          var jqNode = $3(button.node);
          if (button.inCollection && this.c.dom.collection.button && this.c.dom.collection.button.active !== void 0) {
            klass = this.c.dom.collection.button.active;
          }
          if (flag === void 0) {
            return jqNode.hasClass(klass);
          }
          jqNode.toggleClass(klass, flag === void 0 ? true : flag);
          return this;
        },
        /**
         * Add a new button
         * @param {object} config Button configuration object, base string name or function
         * @param {int|string} [idx] Button index for where to insert the button
         * @param {boolean} [draw=true] Trigger a draw. Set a false when adding
         *   lots of buttons, until the last button.
         * @return {Buttons} Self for chaining
         */
        add: function(config, idx, draw) {
          var buttons = this.s.buttons;
          if (typeof idx === "string") {
            var split = idx.split("-");
            var base = this.s;
            for (var i = 0, ien = split.length - 1; i < ien; i++) {
              base = base.buttons[split[i] * 1];
            }
            buttons = base.buttons;
            idx = split[split.length - 1] * 1;
          }
          this._expandButton(
            buttons,
            config,
            config !== void 0 ? config.split : void 0,
            (config === void 0 || config.split === void 0 || config.split.length === 0) && base !== void 0,
            false,
            idx
          );
          if (draw === void 0 || draw === true) {
            this._draw();
          }
          return this;
        },
        /**
         * Clear buttons from a collection and then insert new buttons
         */
        collectionRebuild: function(node, newButtons) {
          var button = this._nodeToButton(node);
          if (newButtons !== void 0) {
            var i;
            for (i = button.buttons.length - 1; i >= 0; i--) {
              this.remove(button.buttons[i].node);
            }
            if (button.conf.prefixButtons) {
              newButtons.unshift.apply(newButtons, button.conf.prefixButtons);
            }
            if (button.conf.postfixButtons) {
              newButtons.push.apply(newButtons, button.conf.postfixButtons);
            }
            for (i = 0; i < newButtons.length; i++) {
              var newBtn = newButtons[i];
              this._expandButton(
                button.buttons,
                newBtn,
                newBtn !== void 0 && newBtn.config !== void 0 && newBtn.config.split !== void 0,
                true,
                newBtn.parentConf !== void 0 && newBtn.parentConf.split !== void 0,
                null,
                newBtn.parentConf
              );
            }
          }
          this._draw(button.collection, button.buttons);
        },
        /**
         * Get the container node for the buttons
         * @return {jQuery} Buttons node
         */
        container: function() {
          return this.dom.container;
        },
        /**
         * Disable a button
         * @param  {node} node Button node
         * @return {Buttons} Self for chaining
         */
        disable: function(node) {
          var button = this._nodeToButton(node);
          $3(button.node).addClass(this.c.dom.button.disabled).prop("disabled", true);
          return this;
        },
        /**
         * Destroy the instance, cleaning up event handlers and removing DOM
         * elements
         * @return {Buttons} Self for chaining
         */
        destroy: function() {
          $3("body").off("keyup." + this.s.namespace);
          var buttons = this.s.buttons.slice();
          var i, ien;
          for (i = 0, ien = buttons.length; i < ien; i++) {
            this.remove(buttons[i].node);
          }
          this.dom.container.remove();
          var buttonInsts = this.s.dt.settings()[0];
          for (i = 0, ien = buttonInsts.length; i < ien; i++) {
            if (buttonInsts.inst === this) {
              buttonInsts.splice(i, 1);
              break;
            }
          }
          return this;
        },
        /**
         * Enable / disable a button
         * @param  {node} node Button node
         * @param  {boolean} [flag=true] Enable / disable flag
         * @return {Buttons} Self for chaining
         */
        enable: function(node, flag) {
          if (flag === false) {
            return this.disable(node);
          }
          var button = this._nodeToButton(node);
          $3(button.node).removeClass(this.c.dom.button.disabled).prop("disabled", false);
          return this;
        },
        /**
         * Get a button's index
         *
         * This is internally recursive
         * @param {element} node Button to get the index of
         * @return {string} Button index
         */
        index: function(node, nested, buttons) {
          if (!nested) {
            nested = "";
            buttons = this.s.buttons;
          }
          for (var i = 0, ien = buttons.length; i < ien; i++) {
            var inner = buttons[i].buttons;
            if (buttons[i].node === node) {
              return nested + i;
            }
            if (inner && inner.length) {
              var match = this.index(node, i + "-", inner);
              if (match !== null) {
                return match;
              }
            }
          }
          return null;
        },
        /**
         * Get the instance name for the button set selector
         * @return {string} Instance name
         */
        name: function() {
          return this.c.name;
        },
        /**
         * Get a button's node of the buttons container if no button is given
         * @param  {node} [node] Button node
         * @return {jQuery} Button element, or container
         */
        node: function(node) {
          if (!node) {
            return this.dom.container;
          }
          var button = this._nodeToButton(node);
          return $3(button.node);
        },
        /**
         * Set / get a processing class on the selected button
         * @param {element} node Triggering button node
         * @param  {boolean} flag true to add, false to remove, undefined to get
         * @return {boolean|Buttons} Getter value or this if a setter.
         */
        processing: function(node, flag) {
          var dt = this.s.dt;
          var button = this._nodeToButton(node);
          if (flag === void 0) {
            return $3(button.node).hasClass("processing");
          }
          $3(button.node).toggleClass("processing", flag);
          $3(dt.table().node()).triggerHandler("buttons-processing.dt", [
            flag,
            dt.button(node),
            dt,
            $3(node),
            button.conf
          ]);
          return this;
        },
        /**
         * Remove a button.
         * @param  {node} node Button node
         * @return {Buttons} Self for chaining
         */
        remove: function(node) {
          var button = this._nodeToButton(node);
          var host = this._nodeToHost(node);
          var dt = this.s.dt;
          if (button.buttons.length) {
            for (var i = button.buttons.length - 1; i >= 0; i--) {
              this.remove(button.buttons[i].node);
            }
          }
          button.conf.destroying = true;
          if (button.conf.destroy) {
            button.conf.destroy.call(dt.button(node), dt, $3(node), button.conf);
          }
          this._removeKey(button.conf);
          $3(button.node).remove();
          var idx = $3.inArray(button, host);
          host.splice(idx, 1);
          return this;
        },
        /**
         * Get the text for a button
         * @param  {int|string} node Button index
         * @return {string} Button text
         */
        /**
        * Set the text for a button
        * @param  {int|string|function} node Button index
        * @param  {string} label Text
        * @return {Buttons} Self for chaining
        */
        text: function(node, label) {
          var button = this._nodeToButton(node);
          var textNode = button.textNode;
          var dt = this.s.dt;
          var jqNode = $3(button.node);
          var text = function(opt) {
            return typeof opt === "function" ? opt(dt, jqNode, button.conf) : opt;
          };
          if (label === void 0) {
            return text(button.conf.text);
          }
          button.conf.text = label;
          textNode.html(text(label));
          return this;
        },
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Constructor
         */
        /**
         * Buttons constructor
         * @private
         */
        _constructor: function() {
          var that = this;
          var dt = this.s.dt;
          var dtSettings = dt.settings()[0];
          var buttons = this.c.buttons;
          if (!dtSettings._buttons) {
            dtSettings._buttons = [];
          }
          dtSettings._buttons.push({
            inst: this,
            name: this.c.name
          });
          for (var i = 0, ien = buttons.length; i < ien; i++) {
            this.add(buttons[i]);
          }
          dt.on("destroy", function(e, settings) {
            if (settings === dtSettings) {
              that.destroy();
            }
          });
          $3("body").on("keyup." + this.s.namespace, function(e) {
            if (!document2.activeElement || document2.activeElement === document2.body) {
              var character = String.fromCharCode(e.keyCode).toLowerCase();
              if (that.s.listenKeys.toLowerCase().indexOf(character) !== -1) {
                that._keypress(character, e);
              }
            }
          });
        },
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * Private methods
         */
        /**
         * Add a new button to the key press listener
         * @param {object} conf Resolved button configuration object
         * @private
         */
        _addKey: function(conf) {
          if (conf.key) {
            this.s.listenKeys += $3.isPlainObject(conf.key) ? conf.key.key : conf.key;
          }
        },
        /**
         * Insert the buttons into the container. Call without parameters!
         * @param  {node} [container] Recursive only - Insert point
         * @param  {array} [buttons] Recursive only - Buttons array
         * @private
         */
        _draw: function(container, buttons) {
          if (!container) {
            container = this.dom.container;
            buttons = this.s.buttons;
          }
          container.children().detach();
          for (var i = 0, ien = buttons.length; i < ien; i++) {
            container.append(buttons[i].inserter);
            container.append(" ");
            if (buttons[i].buttons && buttons[i].buttons.length) {
              this._draw(buttons[i].collection, buttons[i].buttons);
            }
          }
        },
        /**
         * Create buttons from an array of buttons
         * @param  {array} attachTo Buttons array to attach to
         * @param  {object} button Button definition
         * @param  {boolean} inCollection true if the button is in a collection
         * @private
         */
        _expandButton: function(attachTo, button, split, inCollection, inSplit, attachPoint, parentConf) {
          var dt = this.s.dt;
          var isSplit = false;
          var domCollection = this.c.dom.collection;
          var buttons = !Array.isArray(button) ? [button] : button;
          if (button === void 0) {
            buttons = !Array.isArray(split) ? [split] : split;
          }
          for (var i = 0, ien = buttons.length; i < ien; i++) {
            var conf = this._resolveExtends(buttons[i]);
            if (!conf) {
              continue;
            }
            isSplit = conf.config && conf.config.split ? true : false;
            if (Array.isArray(conf)) {
              this._expandButton(
                attachTo,
                conf,
                built !== void 0 && built.conf !== void 0 ? built.conf.split : void 0,
                inCollection,
                parentConf !== void 0 && parentConf.split !== void 0,
                attachPoint,
                parentConf
              );
              continue;
            }
            var built = this._buildButton(
              conf,
              inCollection,
              conf.split !== void 0 || conf.config !== void 0 && conf.config.split !== void 0,
              inSplit
            );
            if (!built) {
              continue;
            }
            if (attachPoint !== void 0 && attachPoint !== null) {
              attachTo.splice(attachPoint, 0, built);
              attachPoint++;
            } else {
              attachTo.push(built);
            }
            if (built.conf.buttons) {
              built.collection = $3(
                "<" + domCollection.container.content.tag + "/>"
              );
              built.conf._collection = built.collection;
              $3(built.node).append(domCollection.action.dropHtml);
              this._expandButton(
                built.buttons,
                built.conf.buttons,
                built.conf.split,
                !isSplit,
                isSplit,
                attachPoint,
                built.conf
              );
            }
            if (built.conf.split) {
              built.collection = $3("<" + domCollection.container.tag + "/>");
              built.conf._collection = built.collection;
              for (var j = 0; j < built.conf.split.length; j++) {
                var item = built.conf.split[j];
                if (typeof item === "object") {
                  item.parent = parentConf;
                  if (item.collectionLayout === void 0) {
                    item.collectionLayout = built.conf.collectionLayout;
                  }
                  if (item.dropup === void 0) {
                    item.dropup = built.conf.dropup;
                  }
                  if (item.fade === void 0) {
                    item.fade = built.conf.fade;
                  }
                }
              }
              this._expandButton(
                built.buttons,
                built.conf.buttons,
                built.conf.split,
                !isSplit,
                isSplit,
                attachPoint,
                built.conf
              );
            }
            built.conf.parent = parentConf;
            if (conf.init) {
              conf.init.call(dt.button(built.node), dt, $3(built.node), conf);
            }
          }
        },
        /**
         * Create an individual button
         * @param  {object} config            Resolved button configuration
         * @param  {boolean} inCollection `true` if a collection button
         * @return {object} Completed button description object
         * @private
         */
        _buildButton: function(config, inCollection, isSplit, inSplit) {
          var that = this;
          var configDom = this.c.dom;
          var textNode;
          var dt = this.s.dt;
          var text = function(opt) {
            return typeof opt === "function" ? opt(dt, button, config) : opt;
          };
          var dom = $3.extend(true, {}, configDom.button);
          if (inCollection && isSplit && configDom.collection.split) {
            $3.extend(true, dom, configDom.collection.split.action);
          } else if (inSplit || inCollection) {
            $3.extend(true, dom, configDom.collection.button);
          } else if (isSplit) {
            $3.extend(true, dom, configDom.split.button);
          }
          if (config.spacer) {
            var spacer = $3("<" + dom.spacer.tag + "/>").addClass(
              "dt-button-spacer " + config.style + " " + dom.spacer.className
            ).html(text(config.text));
            return {
              conf: config,
              node: spacer,
              inserter: spacer,
              buttons: [],
              inCollection,
              isSplit,
              collection: null,
              textNode: spacer
            };
          }
          if (config.available && !config.available(dt, config) && !config.html) {
            return false;
          }
          var button;
          if (!config.html) {
            var run = function(e, dt2, button2, config2, done) {
              config2.action.call(dt2.button(button2), e, dt2, button2, config2, done);
              $3(dt2.table().node()).triggerHandler("buttons-action.dt", [
                dt2.button(button2),
                dt2,
                button2,
                config2
              ]);
            };
            var action = function(e, dt2, button2, config2) {
              if (config2.async) {
                that.processing(button2[0], true);
                setTimeout(function() {
                  run(e, dt2, button2, config2, function() {
                    that.processing(button2[0], false);
                  });
                }, config2.async);
              } else {
                run(e, dt2, button2, config2, function() {
                });
              }
            };
            var tag = config.tag || dom.tag;
            var clickBlurs = config.clickBlurs === void 0 ? true : config.clickBlurs;
            button = $3("<" + tag + "/>").addClass(dom.className).attr("tabindex", this.s.dt.settings()[0].iTabIndex).attr("aria-controls", this.s.dt.table().node().id).on("click.dtb", function(e) {
              e.preventDefault();
              if (!button.hasClass(dom.disabled) && config.action) {
                action(e, dt, button, config);
              }
              if (clickBlurs) {
                button.trigger("blur");
              }
            }).on("keypress.dtb", function(e) {
              if (e.keyCode === 13) {
                e.preventDefault();
                if (!button.hasClass(dom.disabled) && config.action) {
                  action(e, dt, button, config);
                }
              }
            });
            if (tag.toLowerCase() === "a") {
              button.attr("href", "#");
            }
            if (tag.toLowerCase() === "button") {
              button.attr("type", "button");
            }
            if (dom.liner.tag) {
              var liner = $3("<" + dom.liner.tag + "/>").html(text(config.text)).addClass(dom.liner.className);
              if (dom.liner.tag.toLowerCase() === "a") {
                liner.attr("href", "#");
              }
              button.append(liner);
              textNode = liner;
            } else {
              button.html(text(config.text));
              textNode = button;
            }
            if (config.enabled === false) {
              button.addClass(dom.disabled);
            }
            if (config.className) {
              button.addClass(config.className);
            }
            if (config.titleAttr) {
              button.attr("title", text(config.titleAttr));
            }
            if (config.attr) {
              button.attr(config.attr);
            }
            if (!config.namespace) {
              config.namespace = ".dt-button-" + _buttonCounter++;
            }
            if (config.config !== void 0 && config.config.split) {
              config.split = config.config.split;
            }
          } else {
            button = $3(config.html);
          }
          var buttonContainer = this.c.dom.buttonContainer;
          var inserter;
          if (buttonContainer && buttonContainer.tag) {
            inserter = $3("<" + buttonContainer.tag + "/>").addClass(buttonContainer.className).append(button);
          } else {
            inserter = button;
          }
          this._addKey(config);
          if (this.c.buttonCreated) {
            inserter = this.c.buttonCreated(config, inserter);
          }
          var splitDiv;
          if (isSplit) {
            var dropdownConf = inCollection ? $3.extend(true, this.c.dom.split, this.c.dom.collection.split) : this.c.dom.split;
            var wrapperConf = dropdownConf.wrapper;
            splitDiv = $3("<" + wrapperConf.tag + "/>").addClass(wrapperConf.className).append(button);
            var dropButtonConfig = $3.extend(config, {
              align: dropdownConf.dropdown.align,
              attr: {
                "aria-haspopup": "dialog",
                "aria-expanded": false
              },
              className: dropdownConf.dropdown.className,
              closeButton: false,
              splitAlignClass: dropdownConf.dropdown.splitAlignClass,
              text: dropdownConf.dropdown.text
            });
            this._addKey(dropButtonConfig);
            var splitAction = function(e, dt2, button2, config2) {
              _dtButtons.split.action.call(
                dt2.button(splitDiv),
                e,
                dt2,
                button2,
                config2
              );
              $3(dt2.table().node()).triggerHandler("buttons-action.dt", [
                dt2.button(button2),
                dt2,
                button2,
                config2
              ]);
              button2.attr("aria-expanded", true);
            };
            var dropButton = $3(
              '<button class="' + dropdownConf.dropdown.className + ' dt-button"></button>'
            ).html(dropdownConf.dropdown.dropHtml).on("click.dtb", function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (!dropButton.hasClass(dom.disabled)) {
                splitAction(e, dt, dropButton, dropButtonConfig);
              }
              if (clickBlurs) {
                dropButton.trigger("blur");
              }
            }).on("keypress.dtb", function(e) {
              if (e.keyCode === 13) {
                e.preventDefault();
                if (!dropButton.hasClass(dom.disabled)) {
                  splitAction(e, dt, dropButton, dropButtonConfig);
                }
              }
            });
            if (config.split.length === 0) {
              dropButton.addClass("dtb-hide-drop");
            }
            splitDiv.append(dropButton).attr(dropButtonConfig.attr);
          }
          return {
            conf: config,
            node: isSplit ? splitDiv.get(0) : button.get(0),
            inserter: isSplit ? splitDiv : inserter,
            buttons: [],
            inCollection,
            isSplit,
            inSplit,
            collection: null,
            textNode
          };
        },
        /**
         * Get the button object from a node (recursive)
         * @param  {node} node Button node
         * @param  {array} [buttons] Button array, uses base if not defined
         * @return {object} Button object
         * @private
         */
        _nodeToButton: function(node, buttons) {
          if (!buttons) {
            buttons = this.s.buttons;
          }
          for (var i = 0, ien = buttons.length; i < ien; i++) {
            if (buttons[i].node === node) {
              return buttons[i];
            }
            if (buttons[i].buttons.length) {
              var ret = this._nodeToButton(node, buttons[i].buttons);
              if (ret) {
                return ret;
              }
            }
          }
        },
        /**
         * Get container array for a button from a button node (recursive)
         * @param  {node} node Button node
         * @param  {array} [buttons] Button array, uses base if not defined
         * @return {array} Button's host array
         * @private
         */
        _nodeToHost: function(node, buttons) {
          if (!buttons) {
            buttons = this.s.buttons;
          }
          for (var i = 0, ien = buttons.length; i < ien; i++) {
            if (buttons[i].node === node) {
              return buttons;
            }
            if (buttons[i].buttons.length) {
              var ret = this._nodeToHost(node, buttons[i].buttons);
              if (ret) {
                return ret;
              }
            }
          }
        },
        /**
         * Handle a key press - determine if any button's key configured matches
         * what was typed and trigger the action if so.
         * @param  {string} character The character pressed
         * @param  {object} e Key event that triggered this call
         * @private
         */
        _keypress: function(character, e) {
          if (e._buttonsHandled) {
            return;
          }
          var run = function(conf, node) {
            if (!conf.key) {
              return;
            }
            if (conf.key === character) {
              e._buttonsHandled = true;
              $3(node).click();
            } else if ($3.isPlainObject(conf.key)) {
              if (conf.key.key !== character) {
                return;
              }
              if (conf.key.shiftKey && !e.shiftKey) {
                return;
              }
              if (conf.key.altKey && !e.altKey) {
                return;
              }
              if (conf.key.ctrlKey && !e.ctrlKey) {
                return;
              }
              if (conf.key.metaKey && !e.metaKey) {
                return;
              }
              e._buttonsHandled = true;
              $3(node).click();
            }
          };
          var recurse = function(a) {
            for (var i = 0, ien = a.length; i < ien; i++) {
              run(a[i].conf, a[i].node);
              if (a[i].buttons.length) {
                recurse(a[i].buttons);
              }
            }
          };
          recurse(this.s.buttons);
        },
        /**
         * Remove a key from the key listener for this instance (to be used when a
         * button is removed)
         * @param  {object} conf Button configuration
         * @private
         */
        _removeKey: function(conf) {
          if (conf.key) {
            var character = $3.isPlainObject(conf.key) ? conf.key.key : conf.key;
            var a = this.s.listenKeys.split("");
            var idx = $3.inArray(character, a);
            a.splice(idx, 1);
            this.s.listenKeys = a.join("");
          }
        },
        /**
         * Resolve a button configuration
         * @param  {string|function|object} conf Button config to resolve
         * @return {object} Button configuration
         * @private
         */
        _resolveExtends: function(conf) {
          var that = this;
          var dt = this.s.dt;
          var i, ien;
          var toConfObject = function(base) {
            var loop = 0;
            while (!$3.isPlainObject(base) && !Array.isArray(base)) {
              if (base === void 0) {
                return;
              }
              if (typeof base === "function") {
                base = base.call(that, dt, conf);
                if (!base) {
                  return false;
                }
              } else if (typeof base === "string") {
                if (!_dtButtons[base]) {
                  return { html: base };
                }
                base = _dtButtons[base];
              }
              loop++;
              if (loop > 30) {
                throw "Buttons: Too many iterations";
              }
            }
            return Array.isArray(base) ? base : $3.extend({}, base);
          };
          conf = toConfObject(conf);
          while (conf && conf.extend) {
            if (!_dtButtons[conf.extend]) {
              throw "Cannot extend unknown button type: " + conf.extend;
            }
            var objArray = toConfObject(_dtButtons[conf.extend]);
            if (Array.isArray(objArray)) {
              return objArray;
            } else if (!objArray) {
              return false;
            }
            var originalClassName = objArray.className;
            if (conf.config !== void 0 && objArray.config !== void 0) {
              conf.config = $3.extend({}, objArray.config, conf.config);
            }
            conf = $3.extend({}, objArray, conf);
            if (originalClassName && conf.className !== originalClassName) {
              conf.className = originalClassName + " " + conf.className;
            }
            conf.extend = objArray.extend;
          }
          var postfixButtons = conf.postfixButtons;
          if (postfixButtons) {
            if (!conf.buttons) {
              conf.buttons = [];
            }
            for (i = 0, ien = postfixButtons.length; i < ien; i++) {
              conf.buttons.push(postfixButtons[i]);
            }
          }
          var prefixButtons = conf.prefixButtons;
          if (prefixButtons) {
            if (!conf.buttons) {
              conf.buttons = [];
            }
            for (i = 0, ien = prefixButtons.length; i < ien; i++) {
              conf.buttons.splice(i, 0, prefixButtons[i]);
            }
          }
          return conf;
        },
        /**
         * Display (and replace if there is an existing one) a popover attached to a button
         * @param {string|node} content Content to show
         * @param {DataTable.Api} hostButton DT API instance of the button
         * @param {object} inOpts Options (see object below for all options)
         */
        _popover: function(content, hostButton, inOpts) {
          var dt = hostButton;
          var c = this.c;
          var closed = false;
          var options = $3.extend(
            {
              align: "button-left",
              // button-right, dt-container, split-left, split-right
              autoClose: false,
              background: true,
              backgroundClassName: "dt-button-background",
              closeButton: true,
              containerClassName: c.dom.collection.container.className,
              contentClassName: c.dom.collection.container.content.className,
              collectionLayout: "",
              collectionTitle: "",
              dropup: false,
              fade: 400,
              popoverTitle: "",
              rightAlignClassName: "dt-button-right",
              tag: c.dom.collection.container.tag
            },
            inOpts
          );
          var containerSelector = options.tag + "." + options.containerClassName.replace(/ /g, ".");
          var hostNode = hostButton.node();
          var close = function() {
            closed = true;
            _fadeOut($3(containerSelector), options.fade, function() {
              $3(this).detach();
            });
            $3(
              dt.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes()
            ).attr("aria-expanded", "false");
            $3("div.dt-button-background").off("click.dtb-collection");
            Buttons.background(
              false,
              options.backgroundClassName,
              options.fade,
              hostNode
            );
            $3(window2).off("resize.resize.dtb-collection");
            $3("body").off(".dtb-collection");
            dt.off("buttons-action.b-internal");
            dt.off("destroy");
          };
          if (content === false) {
            close();
            return;
          }
          var existingExpanded = $3(
            dt.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes()
          );
          if (existingExpanded.length) {
            if (hostNode.closest(containerSelector).length) {
              hostNode = existingExpanded.eq(0);
            }
            close();
          }
          var cnt = $3(".dt-button", content).length;
          var mod = "";
          if (cnt === 3) {
            mod = "dtb-b3";
          } else if (cnt === 2) {
            mod = "dtb-b2";
          } else if (cnt === 1) {
            mod = "dtb-b1";
          }
          var display = $3("<" + options.tag + "/>").addClass(options.containerClassName).addClass(options.collectionLayout).addClass(options.splitAlignClass).addClass(mod).css("display", "none").attr({
            "aria-modal": true,
            role: "dialog"
          });
          content = $3(content).addClass(options.contentClassName).attr("role", "menu").appendTo(display);
          hostNode.attr("aria-expanded", "true");
          if (hostNode.parents("body")[0] !== document2.body) {
            hostNode = document2.body.lastChild;
          }
          if (options.popoverTitle) {
            display.prepend(
              '<div class="dt-button-collection-title">' + options.popoverTitle + "</div>"
            );
          } else if (options.collectionTitle) {
            display.prepend(
              '<div class="dt-button-collection-title">' + options.collectionTitle + "</div>"
            );
          }
          if (options.closeButton) {
            display.prepend('<div class="dtb-popover-close">&times;</div>').addClass("dtb-collection-closeable");
          }
          _fadeIn(display.insertAfter(hostNode), options.fade);
          var tableContainer = $3(hostButton.table().container());
          var position = display.css("position");
          if (options.span === "container" || options.align === "dt-container") {
            hostNode = hostNode.parent();
            display.css("width", tableContainer.width());
          }
          if (position === "absolute") {
            var offsetParent = $3(hostNode[0].offsetParent);
            var buttonPosition = hostNode.position();
            var buttonOffset = hostNode.offset();
            var tableSizes = offsetParent.offset();
            var containerPosition = offsetParent.position();
            var computed = window2.getComputedStyle(offsetParent[0]);
            tableSizes.height = offsetParent.outerHeight();
            tableSizes.width = offsetParent.width() + parseFloat(computed.paddingLeft);
            tableSizes.right = tableSizes.left + tableSizes.width;
            tableSizes.bottom = tableSizes.top + tableSizes.height;
            var top = buttonPosition.top + hostNode.outerHeight();
            var left = buttonPosition.left;
            display.css({
              top,
              left
            });
            computed = window2.getComputedStyle(display[0]);
            var popoverSizes = display.offset();
            popoverSizes.height = display.outerHeight();
            popoverSizes.width = display.outerWidth();
            popoverSizes.right = popoverSizes.left + popoverSizes.width;
            popoverSizes.bottom = popoverSizes.top + popoverSizes.height;
            popoverSizes.marginTop = parseFloat(computed.marginTop);
            popoverSizes.marginBottom = parseFloat(computed.marginBottom);
            if (options.dropup) {
              top = buttonPosition.top - popoverSizes.height - popoverSizes.marginTop - popoverSizes.marginBottom;
            }
            if (options.align === "button-right" || display.hasClass(options.rightAlignClassName)) {
              left = buttonPosition.left - popoverSizes.width + hostNode.outerWidth();
            }
            if (options.align === "dt-container" || options.align === "container") {
              if (left < buttonPosition.left) {
                left = -buttonPosition.left;
              }
            }
            if (containerPosition.left + left + popoverSizes.width > $3(window2).width()) {
              left = $3(window2).width() - popoverSizes.width - containerPosition.left;
            }
            if (buttonOffset.left + left < 0) {
              left = -buttonOffset.left;
            }
            if (containerPosition.top + top + popoverSizes.height > $3(window2).height() + $3(window2).scrollTop()) {
              top = buttonPosition.top - popoverSizes.height - popoverSizes.marginTop - popoverSizes.marginBottom;
            }
            if (containerPosition.top + top < $3(window2).scrollTop()) {
              top = buttonPosition.top + hostNode.outerHeight();
            }
            display.css({
              top,
              left
            });
          } else {
            var place = function() {
              var half = $3(window2).height() / 2;
              var top2 = display.height() / 2;
              if (top2 > half) {
                top2 = half;
              }
              display.css("marginTop", top2 * -1);
            };
            place();
            $3(window2).on("resize.dtb-collection", function() {
              place();
            });
          }
          if (options.background) {
            Buttons.background(
              true,
              options.backgroundClassName,
              options.fade,
              options.backgroundHost || hostNode
            );
          }
          $3("div.dt-button-background").on(
            "click.dtb-collection",
            function() {
            }
          );
          if (options.autoClose) {
            setTimeout(function() {
              dt.on("buttons-action.b-internal", function(e, btn, dt2, node) {
                if (node[0] === hostNode[0]) {
                  return;
                }
                close();
              });
            }, 0);
          }
          $3(display).trigger("buttons-popover.dt");
          dt.on("destroy", close);
          setTimeout(function() {
            closed = false;
            $3("body").on("click.dtb-collection", function(e) {
              if (closed) {
                return;
              }
              var back = $3.fn.addBack ? "addBack" : "andSelf";
              var parent = $3(e.target).parent()[0];
              if (!$3(e.target).parents()[back]().filter(content).length && !$3(parent).hasClass("dt-buttons") || $3(e.target).hasClass("dt-button-background")) {
                close();
              }
            }).on("keyup.dtb-collection", function(e) {
              if (e.keyCode === 27) {
                close();
              }
            }).on("keydown.dtb-collection", function(e) {
              var elements = $3("a, button", content);
              var active = document2.activeElement;
              if (e.keyCode !== 9) {
                return;
              }
              if (elements.index(active) === -1) {
                elements.first().focus();
                e.preventDefault();
              } else if (e.shiftKey) {
                if (active === elements[0]) {
                  elements.last().focus();
                  e.preventDefault();
                }
              } else {
                if (active === elements.last()[0]) {
                  elements.first().focus();
                  e.preventDefault();
                }
              }
            });
          }, 0);
        }
      });
      Buttons.background = function(show, className, fade, insertPoint) {
        if (fade === void 0) {
          fade = 400;
        }
        if (!insertPoint) {
          insertPoint = document2.body;
        }
        if (show) {
          _fadeIn(
            $3("<div/>").addClass(className).css("display", "none").insertAfter(insertPoint),
            fade
          );
        } else {
          _fadeOut($3("div." + className), fade, function() {
            $3(this).removeClass(className).remove();
          });
        }
      };
      Buttons.instanceSelector = function(group, buttons) {
        if (group === void 0 || group === null) {
          return $3.map(buttons, function(v) {
            return v.inst;
          });
        }
        var ret = [];
        var names = $3.map(buttons, function(v) {
          return v.name;
        });
        var process = function(input) {
          if (Array.isArray(input)) {
            for (var i = 0, ien = input.length; i < ien; i++) {
              process(input[i]);
            }
            return;
          }
          if (typeof input === "string") {
            if (input.indexOf(",") !== -1) {
              process(input.split(","));
            } else {
              var idx = $3.inArray(input.trim(), names);
              if (idx !== -1) {
                ret.push(buttons[idx].inst);
              }
            }
          } else if (typeof input === "number") {
            ret.push(buttons[input].inst);
          } else if (typeof input === "object" && input.nodeName) {
            for (var j = 0; j < buttons.length; j++) {
              if (buttons[j].inst.dom.container[0] === input) {
                ret.push(buttons[j].inst);
              }
            }
          } else if (typeof input === "object") {
            ret.push(input);
          }
        };
        process(group);
        return ret;
      };
      Buttons.buttonSelector = function(insts, selector) {
        var ret = [];
        var nodeBuilder = function(a, buttons, baseIdx) {
          var button;
          var idx;
          for (var i2 = 0, ien2 = buttons.length; i2 < ien2; i2++) {
            button = buttons[i2];
            if (button) {
              idx = baseIdx !== void 0 ? baseIdx + i2 : i2 + "";
              a.push({
                node: button.node,
                name: button.conf.name,
                idx
              });
              if (button.buttons) {
                nodeBuilder(a, button.buttons, idx + "-");
              }
            }
          }
        };
        var run = function(selector2, inst2) {
          var i2, ien2;
          var buttons = [];
          nodeBuilder(buttons, inst2.s.buttons);
          var nodes = $3.map(buttons, function(v) {
            return v.node;
          });
          if (Array.isArray(selector2) || selector2 instanceof $3) {
            for (i2 = 0, ien2 = selector2.length; i2 < ien2; i2++) {
              run(selector2[i2], inst2);
            }
            return;
          }
          if (selector2 === null || selector2 === void 0 || selector2 === "*") {
            for (i2 = 0, ien2 = buttons.length; i2 < ien2; i2++) {
              ret.push({
                inst: inst2,
                node: buttons[i2].node
              });
            }
          } else if (typeof selector2 === "number") {
            if (inst2.s.buttons[selector2]) {
              ret.push({
                inst: inst2,
                node: inst2.s.buttons[selector2].node
              });
            }
          } else if (typeof selector2 === "string") {
            if (selector2.indexOf(",") !== -1) {
              var a = selector2.split(",");
              for (i2 = 0, ien2 = a.length; i2 < ien2; i2++) {
                run(a[i2].trim(), inst2);
              }
            } else if (selector2.match(/^\d+(\-\d+)*$/)) {
              var indexes = $3.map(buttons, function(v) {
                return v.idx;
              });
              ret.push({
                inst: inst2,
                node: buttons[$3.inArray(selector2, indexes)].node
              });
            } else if (selector2.indexOf(":name") !== -1) {
              var name = selector2.replace(":name", "");
              for (i2 = 0, ien2 = buttons.length; i2 < ien2; i2++) {
                if (buttons[i2].name === name) {
                  ret.push({
                    inst: inst2,
                    node: buttons[i2].node
                  });
                }
              }
            } else {
              $3(nodes).filter(selector2).each(function() {
                ret.push({
                  inst: inst2,
                  node: this
                });
              });
            }
          } else if (typeof selector2 === "object" && selector2.nodeName) {
            var idx = $3.inArray(selector2, nodes);
            if (idx !== -1) {
              ret.push({
                inst: inst2,
                node: nodes[idx]
              });
            }
          }
        };
        for (var i = 0, ien = insts.length; i < ien; i++) {
          var inst = insts[i];
          run(selector, inst);
        }
        return ret;
      };
      Buttons.stripData = function(str, config) {
        if (typeof str !== "string") {
          return str;
        }
        str = Buttons.stripHtmlScript(str);
        str = Buttons.stripHtmlComments(str);
        if (!config || config.stripHtml) {
          str = DataTable.util.stripHtml(str);
        }
        if (!config || config.trim) {
          str = str.trim();
        }
        if (!config || config.stripNewlines) {
          str = str.replace(/\n/g, " ");
        }
        if (!config || config.decodeEntities) {
          if (_entityDecoder) {
            str = _entityDecoder(str);
          } else {
            _exportTextarea.innerHTML = str;
            str = _exportTextarea.value;
          }
        }
        return str;
      };
      Buttons.entityDecoder = function(fn) {
        _entityDecoder = fn;
      };
      Buttons.stripHtmlComments = function(input) {
        var previous;
        do {
          previous = input;
          input = input.replace(/(<!--.*?--!?>)|(<!--[\S\s]+?--!?>)|(<!--[\S\s]*?$)/g, "");
        } while (input !== previous);
        return input;
      };
      Buttons.stripHtmlScript = function(input) {
        var previous;
        do {
          previous = input;
          input = input.replace(/<script\b[^<]*(?:(?!<\/script[^>]*>)<[^<]*)*<\/script[^>]*>/gi, "");
        } while (input !== previous);
        return input;
      };
      Buttons.defaults = {
        buttons: ["copy", "excel", "csv", "pdf", "print"],
        name: "main",
        tabIndex: 0,
        dom: {
          container: {
            tag: "div",
            className: "dt-buttons"
          },
          collection: {
            action: {
              // action button
              dropHtml: '<span class="dt-button-down-arrow">&#x25BC;</span>'
            },
            container: {
              // The element used for the dropdown
              className: "dt-button-collection",
              content: {
                className: "",
                tag: "div"
              },
              tag: "div"
            }
            // optionally
            // , button: IButton - buttons inside the collection container
            // , split: ISplit - splits inside the collection container
          },
          button: {
            tag: "button",
            className: "dt-button",
            active: "dt-button-active",
            // class name
            disabled: "disabled",
            // class name
            spacer: {
              className: "dt-button-spacer",
              tag: "span"
            },
            liner: {
              tag: "span",
              className: ""
            }
          },
          split: {
            action: {
              // action button
              className: "dt-button-split-drop-button dt-button",
              tag: "button"
            },
            dropdown: {
              // button to trigger the dropdown
              align: "split-right",
              className: "dt-button-split-drop",
              dropHtml: '<span class="dt-button-down-arrow">&#x25BC;</span>',
              splitAlignClass: "dt-button-split-left",
              tag: "button"
            },
            wrapper: {
              // wrap around both
              className: "dt-button-split",
              tag: "div"
            }
          }
        }
      };
      Buttons.version = "3.0.2";
      $3.extend(_dtButtons, {
        collection: {
          text: function(dt) {
            return dt.i18n("buttons.collection", "Collection");
          },
          className: "buttons-collection",
          closeButton: false,
          init: function(dt, button) {
            button.attr("aria-expanded", false);
          },
          action: function(e, dt, button, config) {
            if (config._collection.parents("body").length) {
              this.popover(false, config);
            } else {
              this.popover(config._collection, config);
            }
            if (e.type === "keypress") {
              $3("a, button", config._collection).eq(0).focus();
            }
          },
          attr: {
            "aria-haspopup": "dialog"
          }
          // Also the popover options, defined in Buttons.popover
        },
        split: {
          text: function(dt) {
            return dt.i18n("buttons.split", "Split");
          },
          className: "buttons-split",
          closeButton: false,
          init: function(dt, button) {
            return button.attr("aria-expanded", false);
          },
          action: function(e, dt, button, config) {
            this.popover(config._collection, config);
          },
          attr: {
            "aria-haspopup": "dialog"
          }
          // Also the popover options, defined in Buttons.popover
        },
        copy: function() {
          if (_dtButtons.copyHtml5) {
            return "copyHtml5";
          }
        },
        csv: function(dt, conf) {
          if (_dtButtons.csvHtml5 && _dtButtons.csvHtml5.available(dt, conf)) {
            return "csvHtml5";
          }
        },
        excel: function(dt, conf) {
          if (_dtButtons.excelHtml5 && _dtButtons.excelHtml5.available(dt, conf)) {
            return "excelHtml5";
          }
        },
        pdf: function(dt, conf) {
          if (_dtButtons.pdfHtml5 && _dtButtons.pdfHtml5.available(dt, conf)) {
            return "pdfHtml5";
          }
        },
        pageLength: function(dt) {
          var lengthMenu = dt.settings()[0].aLengthMenu;
          var vals = [];
          var lang = [];
          var text = function(dt2) {
            return dt2.i18n(
              "buttons.pageLength",
              {
                "-1": "Show all rows",
                _: "Show %d rows"
              },
              dt2.page.len()
            );
          };
          if (Array.isArray(lengthMenu[0])) {
            vals = lengthMenu[0];
            lang = lengthMenu[1];
          } else {
            for (var i = 0; i < lengthMenu.length; i++) {
              var option = lengthMenu[i];
              if ($3.isPlainObject(option)) {
                vals.push(option.value);
                lang.push(option.label);
              } else {
                vals.push(option);
                lang.push(option);
              }
            }
          }
          return {
            extend: "collection",
            text,
            className: "buttons-page-length",
            autoClose: true,
            buttons: $3.map(vals, function(val, i2) {
              return {
                text: lang[i2],
                className: "button-page-length",
                action: function(e, dt2) {
                  dt2.page.len(val).draw();
                },
                init: function(dt2, node, conf) {
                  var that = this;
                  var fn = function() {
                    that.active(dt2.page.len() === val);
                  };
                  dt2.on("length.dt" + conf.namespace, fn);
                  fn();
                },
                destroy: function(dt2, node, conf) {
                  dt2.off("length.dt" + conf.namespace);
                }
              };
            }),
            init: function(dt2, node, conf) {
              var that = this;
              dt2.on("length.dt" + conf.namespace, function() {
                that.text(conf.text);
              });
            },
            destroy: function(dt2, node, conf) {
              dt2.off("length.dt" + conf.namespace);
            }
          };
        },
        spacer: {
          style: "empty",
          spacer: true,
          text: function(dt) {
            return dt.i18n("buttons.spacer", "");
          }
        }
      });
      DataTable.Api.register("buttons()", function(group, selector) {
        if (selector === void 0) {
          selector = group;
          group = void 0;
        }
        this.selector.buttonGroup = group;
        var res = this.iterator(
          true,
          "table",
          function(ctx) {
            if (ctx._buttons) {
              return Buttons.buttonSelector(
                Buttons.instanceSelector(group, ctx._buttons),
                selector
              );
            }
          },
          true
        );
        res._groupSelector = group;
        return res;
      });
      DataTable.Api.register("button()", function(group, selector) {
        var buttons = this.buttons(group, selector);
        if (buttons.length > 1) {
          buttons.splice(1, buttons.length);
        }
        return buttons;
      });
      DataTable.Api.registerPlural(
        "buttons().active()",
        "button().active()",
        function(flag) {
          if (flag === void 0) {
            return this.map(function(set) {
              return set.inst.active(set.node);
            });
          }
          return this.each(function(set) {
            set.inst.active(set.node, flag);
          });
        }
      );
      DataTable.Api.registerPlural(
        "buttons().action()",
        "button().action()",
        function(action) {
          if (action === void 0) {
            return this.map(function(set) {
              return set.inst.action(set.node);
            });
          }
          return this.each(function(set) {
            set.inst.action(set.node, action);
          });
        }
      );
      DataTable.Api.registerPlural(
        "buttons().collectionRebuild()",
        "button().collectionRebuild()",
        function(buttons) {
          return this.each(function(set) {
            for (var i = 0; i < buttons.length; i++) {
              if (typeof buttons[i] === "object") {
                buttons[i].parentConf = set;
              }
            }
            set.inst.collectionRebuild(set.node, buttons);
          });
        }
      );
      DataTable.Api.register(
        ["buttons().enable()", "button().enable()"],
        function(flag) {
          return this.each(function(set) {
            set.inst.enable(set.node, flag);
          });
        }
      );
      DataTable.Api.register(
        ["buttons().disable()", "button().disable()"],
        function() {
          return this.each(function(set) {
            set.inst.disable(set.node);
          });
        }
      );
      DataTable.Api.register("button().index()", function() {
        var idx = null;
        this.each(function(set) {
          var res = set.inst.index(set.node);
          if (res !== null) {
            idx = res;
          }
        });
        return idx;
      });
      DataTable.Api.registerPlural(
        "buttons().nodes()",
        "button().node()",
        function() {
          var jq = $3();
          $3(
            this.each(function(set) {
              jq = jq.add(set.inst.node(set.node));
            })
          );
          return jq;
        }
      );
      DataTable.Api.registerPlural(
        "buttons().processing()",
        "button().processing()",
        function(flag) {
          if (flag === void 0) {
            return this.map(function(set) {
              return set.inst.processing(set.node);
            });
          }
          return this.each(function(set) {
            set.inst.processing(set.node, flag);
          });
        }
      );
      DataTable.Api.registerPlural(
        "buttons().text()",
        "button().text()",
        function(label) {
          if (label === void 0) {
            return this.map(function(set) {
              return set.inst.text(set.node);
            });
          }
          return this.each(function(set) {
            set.inst.text(set.node, label);
          });
        }
      );
      DataTable.Api.registerPlural(
        "buttons().trigger()",
        "button().trigger()",
        function() {
          return this.each(function(set) {
            set.inst.node(set.node).trigger("click");
          });
        }
      );
      DataTable.Api.register("button().popover()", function(content, options) {
        return this.map(function(set) {
          return set.inst._popover(content, this.button(this[0].node), options);
        });
      });
      DataTable.Api.register("buttons().containers()", function() {
        var jq = $3();
        var groupSelector = this._groupSelector;
        this.iterator(true, "table", function(ctx) {
          if (ctx._buttons) {
            var insts = Buttons.instanceSelector(groupSelector, ctx._buttons);
            for (var i = 0, ien = insts.length; i < ien; i++) {
              jq = jq.add(insts[i].container());
            }
          }
        });
        return jq;
      });
      DataTable.Api.register("buttons().container()", function() {
        return this.containers().eq(0);
      });
      DataTable.Api.register("button().add()", function(idx, conf, draw) {
        var ctx = this.context;
        if (ctx.length) {
          var inst = Buttons.instanceSelector(
            this._groupSelector,
            ctx[0]._buttons
          );
          if (inst.length) {
            inst[0].add(conf, idx, draw);
          }
        }
        return this.button(this._groupSelector, idx);
      });
      DataTable.Api.register("buttons().destroy()", function() {
        this.pluck("inst").unique().each(function(inst) {
          inst.destroy();
        });
        return this;
      });
      DataTable.Api.registerPlural(
        "buttons().remove()",
        "buttons().remove()",
        function() {
          this.each(function(set) {
            set.inst.remove(set.node);
          });
          return this;
        }
      );
      var _infoTimer;
      DataTable.Api.register("buttons.info()", function(title, message, time) {
        var that = this;
        if (title === false) {
          this.off("destroy.btn-info");
          _fadeOut($3("#datatables_buttons_info"), 400, function() {
            $3(this).remove();
          });
          clearTimeout(_infoTimer);
          _infoTimer = null;
          return this;
        }
        if (_infoTimer) {
          clearTimeout(_infoTimer);
        }
        if ($3("#datatables_buttons_info").length) {
          $3("#datatables_buttons_info").remove();
        }
        title = title ? "<h2>" + title + "</h2>" : "";
        _fadeIn(
          $3('<div id="datatables_buttons_info" class="dt-button-info"/>').html(title).append(
            $3("<div/>")[typeof message === "string" ? "html" : "append"](
              message
            )
          ).css("display", "none").appendTo("body")
        );
        if (time !== void 0 && time !== 0) {
          _infoTimer = setTimeout(function() {
            that.buttons.info(false);
          }, time);
        }
        this.on("destroy.btn-info", function() {
          that.buttons.info(false);
        });
        return this;
      });
      DataTable.Api.register("buttons.exportData()", function(options) {
        if (this.context.length) {
          return _exportData(new DataTable.Api(this.context[0]), options);
        }
      });
      DataTable.Api.register("buttons.exportInfo()", function(conf) {
        if (!conf) {
          conf = {};
        }
        return {
          filename: _filename(conf, this),
          title: _title(conf, this),
          messageTop: _message(this, conf, conf.message || conf.messageTop, "top"),
          messageBottom: _message(this, conf, conf.messageBottom, "bottom")
        };
      });
      var _filename = function(config, dt) {
        var filename = config.filename === "*" && config.title !== "*" && config.title !== void 0 && config.title !== null && config.title !== "" ? config.title : config.filename;
        if (typeof filename === "function") {
          filename = filename(config, dt);
        }
        if (filename === void 0 || filename === null) {
          return null;
        }
        if (filename.indexOf("*") !== -1) {
          filename = filename.replace(/\*/g, $3("head > title").text()).trim();
        }
        filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "");
        var extension = _stringOrFunction(config.extension, config, dt);
        if (!extension) {
          extension = "";
        }
        return filename + extension;
      };
      var _stringOrFunction = function(option, config, dt) {
        if (option === null || option === void 0) {
          return null;
        } else if (typeof option === "function") {
          return option(config, dt);
        }
        return option;
      };
      var _title = function(config, dt) {
        var title = _stringOrFunction(config.title, config, dt);
        return title === null ? null : title.indexOf("*") !== -1 ? title.replace(/\*/g, $3("head > title").text() || "Exported data") : title;
      };
      var _message = function(dt, config, option, position) {
        var message = _stringOrFunction(option, config, dt);
        if (message === null) {
          return null;
        }
        var caption = $3("caption", dt.table().container()).eq(0);
        if (message === "*") {
          var side = caption.css("caption-side");
          if (side !== position) {
            return null;
          }
          return caption.length ? caption.text() : "";
        }
        return message;
      };
      var _exportTextarea = $3("<textarea/>")[0];
      var _exportData = function(dt, inOpts) {
        var config = $3.extend(
          true,
          {},
          {
            rows: null,
            columns: "",
            modifier: {
              search: "applied",
              order: "applied"
            },
            orthogonal: "display",
            stripHtml: true,
            stripNewlines: true,
            decodeEntities: true,
            trim: true,
            format: {
              header: function(d) {
                return Buttons.stripData(d, config);
              },
              footer: function(d) {
                return Buttons.stripData(d, config);
              },
              body: function(d) {
                return Buttons.stripData(d, config);
              }
            },
            customizeData: null,
            customizeZip: null
          },
          inOpts
        );
        var header = dt.columns(config.columns).indexes().map(function(idx) {
          var col = dt.column(idx);
          return config.format.header(col.title(), idx, col.header());
        }).toArray();
        var footer = dt.table().footer() ? dt.columns(config.columns).indexes().map(function(idx) {
          var el = dt.column(idx).footer();
          var val = "";
          if (el) {
            var inner = $3(".dt-column-title", el);
            val = inner.length ? inner.html() : $3(el).html();
          }
          return config.format.footer(val, idx, el);
        }).toArray() : null;
        var modifier = $3.extend({}, config.modifier);
        if (dt.select && typeof dt.select.info === "function" && modifier.selected === void 0) {
          if (dt.rows(config.rows, $3.extend({ selected: true }, modifier)).any()) {
            $3.extend(modifier, { selected: true });
          }
        }
        var rowIndexes = dt.rows(config.rows, modifier).indexes().toArray();
        var selectedCells = dt.cells(rowIndexes, config.columns, {
          order: modifier.order
        });
        var cells = selectedCells.render(config.orthogonal).toArray();
        var cellNodes = selectedCells.nodes().toArray();
        var cellIndexes = selectedCells.indexes().toArray();
        var columns = dt.columns(config.columns).count();
        var rows = columns > 0 ? cells.length / columns : 0;
        var body = [];
        var cellCounter = 0;
        for (var i = 0, ien = rows; i < ien; i++) {
          var row = [columns];
          for (var j = 0; j < columns; j++) {
            row[j] = config.format.body(
              cells[cellCounter],
              cellIndexes[cellCounter].row,
              cellIndexes[cellCounter].column,
              cellNodes[cellCounter]
            );
            cellCounter++;
          }
          body[i] = row;
        }
        var data = {
          header,
          headerStructure: _headerFormatter(
            config.format.header,
            dt.table().header.structure(config.columns)
          ),
          footer,
          footerStructure: _headerFormatter(
            config.format.footer,
            dt.table().footer.structure(config.columns)
          ),
          body
        };
        if (config.customizeData) {
          config.customizeData(data);
        }
        return data;
      };
      function _headerFormatter(formatter, struct) {
        for (var i = 0; i < struct.length; i++) {
          for (var j = 0; j < struct[i].length; j++) {
            var item = struct[i][j];
            if (item) {
              item.title = formatter(
                item.title,
                j,
                item.cell
              );
            }
          }
        }
        return struct;
      }
      $3.fn.dataTable.Buttons = Buttons;
      $3.fn.DataTable.Buttons = Buttons;
      $3(document2).on("init.dt plugin-init.dt", function(e, settings) {
        if (e.namespace !== "dt") {
          return;
        }
        var opts = settings.oInit.buttons || DataTable.defaults.buttons;
        if (opts && !settings._buttons) {
          new Buttons(settings, opts).container();
        }
      });
      function _init(settings, options) {
        var api = new DataTable.Api(settings);
        var opts = options ? options : api.init().buttons || DataTable.defaults.buttons;
        return new Buttons(api, opts).container();
      }
      DataTable.ext.feature.push({
        fnInit: _init,
        cFeature: "B"
      });
      if (DataTable.feature) {
        DataTable.feature.register("buttons", _init);
      }
      return DataTable;
    });
  }
});

// node_modules/datatables.net-buttons/js/buttons.html5.js
var require_buttons_html5 = __commonJS({
  "node_modules/datatables.net-buttons/js/buttons.html5.js"(exports, module) {
    (function(factory) {
      if (typeof define === "function" && define.amd) {
        define(["jquery", "datatables.net", "datatables.net-buttons"], function($3) {
          return factory($3, window, document);
        });
      } else if (typeof exports === "object") {
        var jq = require_jquery();
        var cjsRequires = function(root, $3) {
          if (!$3.fn.dataTable) {
            require_dataTables()(root, $3);
          }
          if (!$3.fn.dataTable.Buttons) {
            require_dataTables_buttons()(root, $3);
          }
        };
        if (typeof window === "undefined") {
          module.exports = function(root, $3) {
            if (!root) {
              root = window;
            }
            if (!$3) {
              $3 = jq(root);
            }
            cjsRequires(root, $3);
            return factory($3, root, root.document);
          };
        } else {
          cjsRequires(window, jq);
          module.exports = factory(jq, window, window.document);
        }
      } else {
        factory(jQuery, window, document);
      }
    })(function($3, window2, document2) {
      "use strict";
      var DataTable = $3.fn.dataTable;
      var useJszip;
      var usePdfmake;
      function _jsZip() {
        return useJszip || window2.JSZip;
      }
      function _pdfMake() {
        return usePdfmake || window2.pdfMake;
      }
      DataTable.Buttons.pdfMake = function(_) {
        if (!_) {
          return _pdfMake();
        }
        usePdfmake = _;
      };
      DataTable.Buttons.jszip = function(_) {
        if (!_) {
          return _jsZip();
        }
        useJszip = _;
      };
      var _saveAs = function(view) {
        "use strict";
        if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
          return;
        }
        var doc = view.document, get_URL = function() {
          return view.URL || view.webkitURL || view;
        }, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"), can_use_save_link = "download" in save_link, click = function(node) {
          var event = new MouseEvent("click");
          node.dispatchEvent(event);
        }, is_safari = /constructor/i.test(view.HTMLElement) || view.safari, is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent), throw_outside = function(ex) {
          (view.setImmediate || view.setTimeout)(function() {
            throw ex;
          }, 0);
        }, force_saveable_type = "application/octet-stream", arbitrary_revoke_timeout = 1e3 * 40, revoke = function(file) {
          var revoker = function() {
            if (typeof file === "string") {
              get_URL().revokeObjectURL(file);
            } else {
              file.remove();
            }
          };
          setTimeout(revoker, arbitrary_revoke_timeout);
        }, dispatch2 = function(filesaver, event_types, event) {
          event_types = [].concat(event_types);
          var i = event_types.length;
          while (i--) {
            var listener = filesaver["on" + event_types[i]];
            if (typeof listener === "function") {
              try {
                listener.call(filesaver, event || filesaver);
              } catch (ex) {
                throw_outside(ex);
              }
            }
          }
        }, auto_bom = function(blob) {
          if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
            blob.type
          )) {
            return new Blob([String.fromCharCode(65279), blob], {
              type: blob.type
            });
          }
          return blob;
        }, FileSaver = function(blob, name, no_auto_bom) {
          if (!no_auto_bom) {
            blob = auto_bom(blob);
          }
          var filesaver = this, type = blob.type, force = type === force_saveable_type, object_url, dispatch_all = function() {
            dispatch2(
              filesaver,
              "writestart progress write writeend".split(" ")
            );
          }, fs_error = function() {
            if ((is_chrome_ios || force && is_safari) && view.FileReader) {
              var reader = new FileReader();
              reader.onloadend = function() {
                var url = is_chrome_ios ? reader.result : reader.result.replace(
                  /^data:[^;]*;/,
                  "data:attachment/file;"
                );
                var popup = view.open(url, "_blank");
                if (!popup)
                  view.location.href = url;
                url = void 0;
                filesaver.readyState = filesaver.DONE;
                dispatch_all();
              };
              reader.readAsDataURL(blob);
              filesaver.readyState = filesaver.INIT;
              return;
            }
            if (!object_url) {
              object_url = get_URL().createObjectURL(blob);
            }
            if (force) {
              view.location.href = object_url;
            } else {
              var opened = view.open(object_url, "_blank");
              if (!opened) {
                view.location.href = object_url;
              }
            }
            filesaver.readyState = filesaver.DONE;
            dispatch_all();
            revoke(object_url);
          };
          filesaver.readyState = filesaver.INIT;
          if (can_use_save_link) {
            object_url = get_URL().createObjectURL(blob);
            setTimeout(function() {
              save_link.href = object_url;
              save_link.download = name;
              click(save_link);
              dispatch_all();
              revoke(object_url);
              filesaver.readyState = filesaver.DONE;
            });
            return;
          }
          fs_error();
        }, FS_proto = FileSaver.prototype, saveAs = function(blob, name, no_auto_bom) {
          return new FileSaver(
            blob,
            name || blob.name || "download",
            no_auto_bom
          );
        };
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
          return function(blob, name, no_auto_bom) {
            name = name || blob.name || "download";
            if (!no_auto_bom) {
              blob = auto_bom(blob);
            }
            return navigator.msSaveOrOpenBlob(blob, name);
          };
        }
        FS_proto.abort = function() {
        };
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;
        FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;
        return saveAs;
      }(
        typeof self !== "undefined" && self || typeof window2 !== "undefined" && window2 || this.content
      );
      DataTable.fileSave = _saveAs;
      var _sheetname = function(config) {
        var sheetName = "Sheet1";
        if (config.sheetName) {
          sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, "");
        }
        return sheetName;
      };
      var _newLine = function(config) {
        return config.newline ? config.newline : navigator.userAgent.match(/Windows/) ? "\r\n" : "\n";
      };
      var _exportData = function(dt, config) {
        var newLine = _newLine(config);
        var data = dt.buttons.exportData(config.exportOptions);
        var boundary = config.fieldBoundary;
        var separator = config.fieldSeparator;
        var reBoundary = new RegExp(boundary, "g");
        var escapeChar = config.escapeChar !== void 0 ? config.escapeChar : "\\";
        var join = function(a) {
          var s = "";
          for (var i2 = 0, ien2 = a.length; i2 < ien2; i2++) {
            if (i2 > 0) {
              s += separator;
            }
            s += boundary ? boundary + ("" + a[i2]).replace(reBoundary, escapeChar + boundary) + boundary : a[i2];
          }
          return s;
        };
        var header = "";
        var footer = "";
        var body = [];
        if (config.header) {
          header = data.headerStructure.map(function(row) {
            return join(
              row.map(function(cell) {
                return cell ? cell.title : "";
              })
            );
          }).join(newLine) + newLine;
        }
        if (config.footer && data.footer) {
          footer = data.footerStructure.map(function(row) {
            return join(
              row.map(function(cell) {
                return cell ? cell.title : "";
              })
            );
          }).join(newLine) + newLine;
        }
        for (var i = 0, ien = data.body.length; i < ien; i++) {
          body.push(join(data.body[i]));
        }
        return {
          str: header + body.join(newLine) + newLine + footer,
          rows: body.length
        };
      };
      var _isDuffSafari = function() {
        var safari = navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("Chrome") === -1 && navigator.userAgent.indexOf("Opera") === -1;
        if (!safari) {
          return false;
        }
        var version = navigator.userAgent.match(/AppleWebKit\/(\d+\.\d+)/);
        if (version && version.length > 1 && version[1] * 1 < 603.1) {
          return true;
        }
        return false;
      };
      function createCellPos(n) {
        var ordA = "A".charCodeAt(0);
        var ordZ = "Z".charCodeAt(0);
        var len = ordZ - ordA + 1;
        var s = "";
        while (n >= 0) {
          s = String.fromCharCode(n % len + ordA) + s;
          n = Math.floor(n / len) - 1;
        }
        return s;
      }
      try {
        var _serialiser = new XMLSerializer();
        var _ieExcel;
      } catch (t) {
      }
      function _addToZip(zip2, obj) {
        if (_ieExcel === void 0) {
          _ieExcel = _serialiser.serializeToString(
            new window2.DOMParser().parseFromString(
              excelStrings["xl/worksheets/sheet1.xml"],
              "text/xml"
            )
          ).indexOf("xmlns:r") === -1;
        }
        $3.each(obj, function(name, val) {
          if ($3.isPlainObject(val)) {
            var newDir = zip2.folder(name);
            _addToZip(newDir, val);
          } else {
            if (_ieExcel) {
              var worksheet = val.childNodes[0];
              var i, ien;
              var attrs = [];
              for (i = worksheet.attributes.length - 1; i >= 0; i--) {
                var attrName = worksheet.attributes[i].nodeName;
                var attrValue = worksheet.attributes[i].nodeValue;
                if (attrName.indexOf(":") !== -1) {
                  attrs.push({ name: attrName, value: attrValue });
                  worksheet.removeAttribute(attrName);
                }
              }
              for (i = 0, ien = attrs.length; i < ien; i++) {
                var attr = val.createAttribute(
                  attrs[i].name.replace(":", "_dt_b_namespace_token_")
                );
                attr.value = attrs[i].value;
                worksheet.setAttributeNode(attr);
              }
            }
            var str = _serialiser.serializeToString(val);
            if (_ieExcel) {
              if (str.indexOf("<?xml") === -1) {
                str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + str;
              }
              str = str.replace(/_dt_b_namespace_token_/g, ":");
              str = str.replace(/xmlns:NS[\d]+="" NS[\d]+:/g, "");
            }
            str = str.replace(/<([^<>]*?) xmlns=""([^<>]*?)>/g, "<$1 $2>");
            zip2.file(name, str);
          }
        });
      }
      function _createNode(doc, nodeName, opts) {
        var tempNode = doc.createElement(nodeName);
        if (opts) {
          if (opts.attr) {
            $3(tempNode).attr(opts.attr);
          }
          if (opts.children) {
            $3.each(opts.children, function(key, value) {
              tempNode.appendChild(value);
            });
          }
          if (opts.text !== null && opts.text !== void 0) {
            tempNode.appendChild(doc.createTextNode(opts.text));
          }
        }
        return tempNode;
      }
      function _excelColWidth(data, col) {
        var max = data.header[col].length;
        var len, lineSplit, str;
        if (data.footer && data.footer[col] && data.footer[col].length > max) {
          max = data.footer[col].length;
        }
        for (var i = 0, ien = data.body.length; i < ien; i++) {
          var point = data.body[i][col];
          str = point !== null && point !== void 0 ? point.toString() : "";
          if (str.indexOf("\n") !== -1) {
            lineSplit = str.split("\n");
            lineSplit.sort(function(a, b) {
              return b.length - a.length;
            });
            len = lineSplit[0].length;
          } else {
            len = str.length;
          }
          if (len > max) {
            max = len;
          }
          if (max > 40) {
            return 54;
          }
        }
        max *= 1.35;
        return max > 6 ? max : 6;
      }
      var excelStrings = {
        "_rels/.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
        "xl/_rels/workbook.xml.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
        "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml" /><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" /><Default Extension="jpeg" ContentType="image/jpeg" /><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" /><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" /><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" /></Types>',
        "xl/workbook.xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/><workbookPr showInkAnnotation="0" autoCompressPictures="0"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><definedNames/></workbook>',
        "xl/worksheets/sheet1.xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><sheetData/><mergeCells count="0"/></worksheet>',
        "xl/styles.xml": '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><numFmts count="6"><numFmt numFmtId="164" formatCode="[$$-409]#,##0.00;-[$$-409]#,##0.00"/><numFmt numFmtId="165" formatCode="&quot;\xA3&quot;#,##0.00"/><numFmt numFmtId="166" formatCode="[$\u20AC-2] #,##0.00"/><numFmt numFmtId="167" formatCode="0.0%"/><numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/><numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/></numFmts><fonts count="5" x14ac:knownFonts="1"><font><sz val="11" /><name val="Calibri" /></font><font><sz val="11" /><name val="Calibri" /><color rgb="FFFFFFFF" /></font><font><sz val="11" /><name val="Calibri" /><b /></font><font><sz val="11" /><name val="Calibri" /><i /></font><font><sz val="11" /><name val="Calibri" /><u /></font></fonts><fills count="6"><fill><patternFill patternType="none" /></fill><fill><patternFill patternType="none" /></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9D9D9" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD99795" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="ffc6efce" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="ffc6cfef" /><bgColor indexed="64" /></patternFill></fill></fills><borders count="2"><border><left /><right /><top /><bottom /><diagonal /></border><border diagonalUp="false" diagonalDown="false"><left style="thin"><color auto="1" /></left><right style="thin"><color auto="1" /></right><top style="thin"><color auto="1" /></top><bottom style="thin"><color auto="1" /></bottom><diagonal /></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" /></cellStyleXfs><cellXfs count="68"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="left"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="fill"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment textRotation="90"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment wrapText="1"/></xf><xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="14" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0" /></cellStyles><dxfs count="0" /><tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" /></styleSheet>'
      };
      var _excelSpecials = [
        {
          match: /^\-?\d+\.\d%$/,
          style: 60,
          fmt: function(d) {
            return d / 100;
          }
        },
        // Percent with d.p.
        {
          match: /^\-?\d+\.?\d*%$/,
          style: 56,
          fmt: function(d) {
            return d / 100;
          }
        },
        // Percent
        { match: /^\-?\$[\d,]+.?\d*$/, style: 57 },
        // Dollars
        { match: /^\-?£[\d,]+.?\d*$/, style: 58 },
        // Pounds
        { match: /^\-?€[\d,]+.?\d*$/, style: 59 },
        // Euros
        { match: /^\-?\d+$/, style: 65 },
        // Numbers without thousand separators
        { match: /^\-?\d+\.\d{2}$/, style: 66 },
        // Numbers 2 d.p. without thousands separators
        {
          match: /^\([\d,]+\)$/,
          style: 61,
          fmt: function(d) {
            return -1 * d.replace(/[\(\)]/g, "");
          }
        },
        // Negative numbers indicated by brackets
        {
          match: /^\([\d,]+\.\d{2}\)$/,
          style: 62,
          fmt: function(d) {
            return -1 * d.replace(/[\(\)]/g, "");
          }
        },
        // Negative numbers indicated by brackets - 2d.p.
        { match: /^\-?[\d,]+$/, style: 63 },
        // Numbers with thousand separators
        { match: /^\-?[\d,]+\.\d{2}$/, style: 64 },
        {
          match: /^[\d]{4}\-[01][\d]\-[0123][\d]$/,
          style: 67,
          fmt: function(d) {
            return Math.round(25569 + Date.parse(d) / (86400 * 1e3));
          }
        }
        //Date yyyy-mm-dd
      ];
      var _excelMergeCells = function(rels, row, column, rowspan, colspan) {
        var mergeCells = $3("mergeCells", rels);
        mergeCells[0].appendChild(
          _createNode(rels, "mergeCell", {
            attr: {
              ref: createCellPos(column) + row + ":" + createCellPos(column + colspan - 1) + (row + rowspan - 1)
            }
          })
        );
        mergeCells.attr("count", parseFloat(mergeCells.attr("count")) + 1);
      };
      DataTable.ext.buttons.copyHtml5 = {
        className: "buttons-copy buttons-html5",
        text: function(dt) {
          return dt.i18n("buttons.copy", "Copy");
        },
        action: function(e, dt, button, config, cb) {
          var exportData = _exportData(dt, config);
          var info = dt.buttons.exportInfo(config);
          var newline = _newLine(config);
          var output = exportData.str;
          var hiddenDiv = $3("<div/>").css({
            height: 1,
            width: 1,
            overflow: "hidden",
            position: "fixed",
            top: 0,
            left: 0
          });
          if (info.title) {
            output = info.title + newline + newline + output;
          }
          if (info.messageTop) {
            output = info.messageTop + newline + newline + output;
          }
          if (info.messageBottom) {
            output = output + newline + newline + info.messageBottom;
          }
          if (config.customize) {
            output = config.customize(output, config, dt);
          }
          var textarea = $3("<textarea readonly/>").val(output).appendTo(hiddenDiv);
          if (document2.queryCommandSupported("copy")) {
            hiddenDiv.appendTo(dt.table().container());
            textarea[0].focus();
            textarea[0].select();
            try {
              var successful = document2.execCommand("copy");
              hiddenDiv.remove();
              if (successful) {
                dt.buttons.info(
                  dt.i18n("buttons.copyTitle", "Copy to clipboard"),
                  dt.i18n(
                    "buttons.copySuccess",
                    {
                      1: "Copied one row to clipboard",
                      _: "Copied %d rows to clipboard"
                    },
                    exportData.rows
                  ),
                  2e3
                );
                cb();
                return;
              }
            } catch (t) {
            }
          }
          var message = $3(
            "<span>" + dt.i18n(
              "buttons.copyKeys",
              "Press <i>ctrl</i> or <i>\u2318</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>To cancel, click this message or press escape."
            ) + "</span>"
          ).append(hiddenDiv);
          dt.buttons.info(
            dt.i18n("buttons.copyTitle", "Copy to clipboard"),
            message,
            0
          );
          textarea[0].focus();
          textarea[0].select();
          var container = $3(message).closest(".dt-button-info");
          var close = function() {
            container.off("click.buttons-copy");
            $3(document2).off(".buttons-copy");
            dt.buttons.info(false);
          };
          container.on("click.buttons-copy", close);
          $3(document2).on("keydown.buttons-copy", function(e2) {
            if (e2.keyCode === 27) {
              close();
              cb();
            }
          }).on("copy.buttons-copy cut.buttons-copy", function() {
            close();
            cb();
          });
        },
        async: 100,
        exportOptions: {},
        fieldSeparator: "	",
        fieldBoundary: "",
        header: true,
        footer: true,
        title: "*",
        messageTop: "*",
        messageBottom: "*"
      };
      DataTable.ext.buttons.csvHtml5 = {
        bom: false,
        className: "buttons-csv buttons-html5",
        available: function() {
          return window2.FileReader !== void 0 && window2.Blob;
        },
        text: function(dt) {
          return dt.i18n("buttons.csv", "CSV");
        },
        action: function(e, dt, button, config, cb) {
          var output = _exportData(dt, config).str;
          var info = dt.buttons.exportInfo(config);
          var charset = config.charset;
          if (config.customize) {
            output = config.customize(output, config, dt);
          }
          if (charset !== false) {
            if (!charset) {
              charset = document2.characterSet || document2.charset;
            }
            if (charset) {
              charset = ";charset=" + charset;
            }
          } else {
            charset = "";
          }
          if (config.bom) {
            output = String.fromCharCode(65279) + output;
          }
          _saveAs(
            new Blob([output], { type: "text/csv" + charset }),
            info.filename,
            true
          );
          cb();
        },
        async: 100,
        filename: "*",
        extension: ".csv",
        exportOptions: {},
        fieldSeparator: ",",
        fieldBoundary: '"',
        escapeChar: '"',
        charset: null,
        header: true,
        footer: true
      };
      DataTable.ext.buttons.excelHtml5 = {
        className: "buttons-excel buttons-html5",
        available: function() {
          return window2.FileReader !== void 0 && _jsZip() !== void 0 && !_isDuffSafari() && _serialiser;
        },
        text: function(dt) {
          return dt.i18n("buttons.excel", "Excel");
        },
        action: function(e, dt, button, config, cb) {
          var rowPos = 0;
          var dataStartRow, dataEndRow;
          var getXml = function(type) {
            var str = excelStrings[type];
            return $3.parseXML(str);
          };
          var rels = getXml("xl/worksheets/sheet1.xml");
          var relsGet = rels.getElementsByTagName("sheetData")[0];
          var xlsx = {
            _rels: {
              ".rels": getXml("_rels/.rels")
            },
            xl: {
              _rels: {
                "workbook.xml.rels": getXml("xl/_rels/workbook.xml.rels")
              },
              "workbook.xml": getXml("xl/workbook.xml"),
              "styles.xml": getXml("xl/styles.xml"),
              worksheets: {
                "sheet1.xml": rels
              }
            },
            "[Content_Types].xml": getXml("[Content_Types].xml")
          };
          var data = dt.buttons.exportData(config.exportOptions);
          var currentRow, rowNode;
          var addRow = function(row) {
            currentRow = rowPos + 1;
            rowNode = _createNode(rels, "row", { attr: { r: currentRow } });
            for (var i2 = 0, ien2 = row.length; i2 < ien2; i2++) {
              var cellId = createCellPos(i2) + "" + currentRow;
              var cell = null;
              if (row[i2] === null || row[i2] === void 0 || row[i2] === "") {
                if (config.createEmptyCells === true) {
                  row[i2] = "";
                } else {
                  continue;
                }
              }
              var originalContent = row[i2];
              row[i2] = typeof row[i2].trim === "function" ? row[i2].trim() : row[i2];
              for (var j = 0, jen = _excelSpecials.length; j < jen; j++) {
                var special = _excelSpecials[j];
                if (row[i2].match && !row[i2].match(/^0\d+/) && row[i2].match(special.match)) {
                  var val = row[i2].replace(/[^\d\.\-]/g, "");
                  if (special.fmt) {
                    val = special.fmt(val);
                  }
                  cell = _createNode(rels, "c", {
                    attr: {
                      r: cellId,
                      s: special.style
                    },
                    children: [_createNode(rels, "v", { text: val })]
                  });
                  break;
                }
              }
              if (!cell) {
                if (typeof row[i2] === "number" || row[i2].match && row[i2].match(/^-?\d+(\.\d+)?([eE]\-?\d+)?$/) && // Includes exponential format
                !row[i2].match(/^0\d+/)) {
                  cell = _createNode(rels, "c", {
                    attr: {
                      t: "n",
                      r: cellId
                    },
                    children: [_createNode(rels, "v", { text: row[i2] })]
                  });
                } else {
                  var text = !originalContent.replace ? originalContent : originalContent.replace(
                    /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,
                    ""
                  );
                  cell = _createNode(rels, "c", {
                    attr: {
                      t: "inlineStr",
                      r: cellId
                    },
                    children: {
                      row: _createNode(rels, "is", {
                        children: {
                          row: _createNode(rels, "t", {
                            text,
                            attr: {
                              "xml:space": "preserve"
                            }
                          })
                        }
                      })
                    }
                  });
                }
              }
              rowNode.appendChild(cell);
            }
            relsGet.appendChild(rowNode);
            rowPos++;
          };
          var addHeader = function(structure) {
            structure.forEach(function(row) {
              addRow(
                row.map(function(cell) {
                  return cell ? cell.title : "";
                }),
                rowPos
              );
              $3("row:last c", rels).attr("s", "2");
              row.forEach(function(cell, columnCounter) {
                if (cell && (cell.colSpan > 1 || cell.rowSpan > 1)) {
                  _excelMergeCells(
                    rels,
                    rowPos,
                    columnCounter,
                    cell.rowSpan,
                    cell.colSpan
                  );
                }
              });
            });
          };
          if (config.customizeData) {
            config.customizeData(data);
          }
          var exportInfo = dt.buttons.exportInfo(config);
          if (exportInfo.title) {
            addRow([exportInfo.title], rowPos);
            _excelMergeCells(rels, rowPos, 0, 1, data.header.length);
            $3("row:last c", rels).attr("s", "51");
          }
          if (exportInfo.messageTop) {
            addRow([exportInfo.messageTop], rowPos);
            _excelMergeCells(rels, rowPos, 0, 1, data.header.length);
          }
          if (config.header) {
            addHeader(data.headerStructure);
          }
          dataStartRow = rowPos;
          for (var n = 0, ie = data.body.length; n < ie; n++) {
            addRow(data.body[n], rowPos);
          }
          dataEndRow = rowPos;
          if (config.footer && data.footer) {
            addHeader(data.footerStructure);
          }
          if (exportInfo.messageBottom) {
            addRow([exportInfo.messageBottom], rowPos);
            _excelMergeCells(rels, rowPos, 0, 1, data.header.length);
          }
          var cols = _createNode(rels, "cols");
          $3("worksheet", rels).prepend(cols);
          for (var i = 0, ien = data.header.length; i < ien; i++) {
            cols.appendChild(
              _createNode(rels, "col", {
                attr: {
                  min: i + 1,
                  max: i + 1,
                  width: _excelColWidth(data, i),
                  customWidth: 1
                }
              })
            );
          }
          var workbook = xlsx.xl["workbook.xml"];
          $3("sheets sheet", workbook).attr("name", _sheetname(config));
          if (config.autoFilter) {
            $3("mergeCells", rels).before(
              _createNode(rels, "autoFilter", {
                attr: {
                  ref: "A" + dataStartRow + ":" + createCellPos(data.header.length - 1) + dataEndRow
                }
              })
            );
            $3("definedNames", workbook).append(
              _createNode(workbook, "definedName", {
                attr: {
                  name: "_xlnm._FilterDatabase",
                  localSheetId: "0",
                  hidden: 1
                },
                text: "'" + _sheetname(config).replace(/'/g, "''") + "'!$A$" + dataStartRow + ":" + createCellPos(data.header.length - 1) + dataEndRow
              })
            );
          }
          if (config.customize) {
            config.customize(xlsx, config, dt);
          }
          if ($3("mergeCells", rels).children().length === 0) {
            $3("mergeCells", rels).remove();
          }
          var jszip = _jsZip();
          var zip2 = new jszip();
          var zipConfig = {
            compression: "DEFLATE",
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          };
          _addToZip(zip2, xlsx);
          var filename = exportInfo.filename;
          if (filename > 175) {
            filename = filename.substr(0, 175);
          }
          if (config.customizeZip) {
            config.customizeZip(zip2, data, filename);
          }
          if (zip2.generateAsync) {
            zip2.generateAsync(zipConfig).then(function(blob) {
              _saveAs(blob, filename);
              cb();
            });
          } else {
            _saveAs(zip2.generate(zipConfig), filename);
            cb();
          }
        },
        async: 100,
        filename: "*",
        extension: ".xlsx",
        exportOptions: {},
        header: true,
        footer: true,
        title: "*",
        messageTop: "*",
        messageBottom: "*",
        createEmptyCells: false,
        autoFilter: false,
        sheetName: ""
      };
      DataTable.ext.buttons.pdfHtml5 = {
        className: "buttons-pdf buttons-html5",
        available: function() {
          return window2.FileReader !== void 0 && _pdfMake();
        },
        text: function(dt) {
          return dt.i18n("buttons.pdf", "PDF");
        },
        action: function(e, dt, button, config, cb) {
          var data = dt.buttons.exportData(config.exportOptions);
          var info = dt.buttons.exportInfo(config);
          var rows = [];
          if (config.header) {
            data.headerStructure.forEach(function(row) {
              rows.push(
                row.map(function(cell) {
                  return cell ? {
                    text: cell.title,
                    colSpan: cell.colspan,
                    rowSpan: cell.rowspan,
                    style: "tableHeader"
                  } : {};
                })
              );
            });
          }
          for (var i = 0, ien = data.body.length; i < ien; i++) {
            rows.push(
              data.body[i].map(function(d) {
                return {
                  text: d === null || d === void 0 ? "" : typeof d === "string" ? d : d.toString()
                };
              })
            );
          }
          if (config.footer) {
            data.footerStructure.forEach(function(row) {
              rows.push(
                row.map(function(cell) {
                  return cell ? {
                    text: cell.title,
                    colSpan: cell.colspan,
                    rowSpan: cell.rowspan,
                    style: "tableHeader"
                  } : {};
                })
              );
            });
          }
          var doc = {
            pageSize: config.pageSize,
            pageOrientation: config.orientation,
            content: [
              {
                style: "table",
                table: {
                  headerRows: data.headerStructure.length,
                  footerRows: data.footerStructure.length,
                  // Used for styling, doesn't do anything in pdfmake
                  body: rows
                },
                layout: {
                  hLineWidth: function(i2, node) {
                    if (i2 === 0 || i2 === node.table.body.length) {
                      return 0;
                    }
                    return 0.5;
                  },
                  vLineWidth: function() {
                    return 0;
                  },
                  hLineColor: function(i2, node) {
                    return i2 === node.table.headerRows || i2 === node.table.body.length - node.table.footerRows ? "#333" : "#ddd";
                  },
                  fillColor: function(rowIndex) {
                    if (rowIndex < data.headerStructure.length) {
                      return "#fff";
                    }
                    return rowIndex % 2 === 0 ? "#f3f3f3" : null;
                  },
                  paddingTop: function() {
                    return 5;
                  },
                  paddingBottom: function() {
                    return 5;
                  }
                }
              }
            ],
            styles: {
              tableHeader: {
                bold: true,
                fontSize: 11,
                alignment: "center"
              },
              tableFooter: {
                bold: true,
                fontSize: 11
              },
              table: {
                margin: [0, 5, 0, 5]
              },
              title: {
                alignment: "center",
                fontSize: 13
              },
              message: {}
            },
            defaultStyle: {
              fontSize: 10
            }
          };
          if (info.messageTop) {
            doc.content.unshift({
              text: info.messageTop,
              style: "message",
              margin: [0, 0, 0, 12]
            });
          }
          if (info.messageBottom) {
            doc.content.push({
              text: info.messageBottom,
              style: "message",
              margin: [0, 0, 0, 12]
            });
          }
          if (info.title) {
            doc.content.unshift({
              text: info.title,
              style: "title",
              margin: [0, 0, 0, 12]
            });
          }
          if (config.customize) {
            config.customize(doc, config, dt);
          }
          var pdf = _pdfMake().createPdf(doc);
          if (config.download === "open" && !_isDuffSafari()) {
            pdf.open();
          } else {
            pdf.download(info.filename);
          }
          cb();
        },
        async: 100,
        title: "*",
        filename: "*",
        extension: ".pdf",
        exportOptions: {},
        orientation: "portrait",
        // This isn't perfect, but it is close
        pageSize: navigator.language === "en-US" || navigator.language === "en-CA" ? "LETTER" : "A4",
        header: true,
        footer: true,
        messageTop: "*",
        messageBottom: "*",
        customize: null,
        download: "download"
      };
      return DataTable;
    });
  }
});

// node_modules/datatables.net-buttons/js/buttons.print.js
var require_buttons_print = __commonJS({
  "node_modules/datatables.net-buttons/js/buttons.print.js"(exports, module) {
    (function(factory) {
      if (typeof define === "function" && define.amd) {
        define(["jquery", "datatables.net", "datatables.net-buttons"], function($3) {
          return factory($3, window, document);
        });
      } else if (typeof exports === "object") {
        var jq = require_jquery();
        var cjsRequires = function(root, $3) {
          if (!$3.fn.dataTable) {
            require_dataTables()(root, $3);
          }
          if (!$3.fn.dataTable.Buttons) {
            require_dataTables_buttons()(root, $3);
          }
        };
        if (typeof window === "undefined") {
          module.exports = function(root, $3) {
            if (!root) {
              root = window;
            }
            if (!$3) {
              $3 = jq(root);
            }
            cjsRequires(root, $3);
            return factory($3, root, root.document);
          };
        } else {
          cjsRequires(window, jq);
          module.exports = factory(jq, window, window.document);
        }
      } else {
        factory(jQuery, window, document);
      }
    })(function($3, window2, document2) {
      "use strict";
      var DataTable = $3.fn.dataTable;
      var _link = document2.createElement("a");
      var _styleToAbs = function(el) {
        var clone = $3(el).clone()[0];
        if (clone.nodeName.toLowerCase() === "link") {
          clone.href = _relToAbs(clone.href);
        }
        return clone.outerHTML;
      };
      var _relToAbs = function(href2) {
        _link.href = href2;
        var linkHost = _link.host;
        if (linkHost.indexOf("/") === -1 && _link.pathname.indexOf("/") !== 0) {
          linkHost += "/";
        }
        return _link.protocol + "//" + linkHost + _link.pathname + _link.search;
      };
      DataTable.ext.buttons.print = {
        className: "buttons-print",
        text: function(dt) {
          return dt.i18n("buttons.print", "Print");
        },
        action: function(e, dt, button, config, cb) {
          var data = dt.buttons.exportData(
            $3.extend({ decodeEntities: false }, config.exportOptions)
            // XSS protection
          );
          var exportInfo = dt.buttons.exportInfo(config);
          var columnClasses = dt.columns(config.exportOptions.columns).nodes().map(function(n) {
            return n.className;
          }).toArray();
          var addRow = function(d, tag) {
            var str = "<tr>";
            for (var i2 = 0, ien2 = d.length; i2 < ien2; i2++) {
              var dataOut = d[i2] === null || d[i2] === void 0 ? "" : d[i2];
              var classAttr = columnClasses[i2] ? 'class="' + columnClasses[i2] + '"' : "";
              str += "<" + tag + " " + classAttr + ">" + dataOut + "</" + tag + ">";
            }
            return str + "</tr>";
          };
          var html = '<table class="' + dt.table().node().className + '">';
          if (config.header) {
            var headerRows = data.headerStructure.map(function(row) {
              return "<tr>" + row.map(function(cell) {
                return cell ? '<th colspan="' + cell.colspan + '" rowspan="' + cell.rowspan + '">' + cell.title + "</th>" : "";
              }).join("") + "</tr>";
            });
            html += "<thead>" + headerRows.join("") + "</thead>";
          }
          html += "<tbody>";
          for (var i = 0, ien = data.body.length; i < ien; i++) {
            html += addRow(data.body[i], "td");
          }
          html += "</tbody>";
          if (config.footer && data.footer) {
            var footerRows = data.footerStructure.map(function(row) {
              return "<tr>" + row.map(function(cell) {
                return cell ? '<th colspan="' + cell.colspan + '" rowspan="' + cell.rowspan + '">' + cell.title + "</th>" : "";
              }).join("") + "</tr>";
            });
            html += "<tfoot>" + footerRows.join("") + "</tfoot>";
          }
          html += "</table>";
          var win = window2.open("", "");
          if (!win) {
            dt.buttons.info(
              dt.i18n("buttons.printErrorTitle", "Unable to open print view"),
              dt.i18n(
                "buttons.printErrorMsg",
                "Please allow popups in your browser for this site to be able to view the print view."
              ),
              5e3
            );
            return;
          }
          win.document.close();
          var head = "<title>" + exportInfo.title + "</title>";
          $3("style, link").each(function() {
            head += _styleToAbs(this);
          });
          try {
            win.document.head.innerHTML = head;
          } catch (e2) {
            $3(win.document.head).html(head);
          }
          win.document.body.innerHTML = "<h1>" + exportInfo.title + "</h1><div>" + (exportInfo.messageTop || "") + "</div>" + html + "<div>" + (exportInfo.messageBottom || "") + "</div>";
          $3(win.document.body).addClass("dt-print-view");
          $3("img", win.document.body).each(function(i2, img) {
            img.setAttribute("src", _relToAbs(img.getAttribute("src")));
          });
          if (config.customize) {
            config.customize(win, config, dt);
          }
          var autoPrint = function() {
            if (config.autoPrint) {
              win.print();
              win.close();
            }
          };
          win.setTimeout(autoPrint, 1e3);
          cb();
        },
        async: 100,
        title: "*",
        messageTop: "*",
        messageBottom: "*",
        exportOptions: {},
        header: true,
        footer: true,
        autoPrint: true,
        customize: null
      };
      return DataTable;
    });
  }
});

// node_modules/@rails/activestorage/app/assets/javascripts/activestorage.js
var require_activestorage = __commonJS({
  "node_modules/@rails/activestorage/app/assets/javascripts/activestorage.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.ActiveStorage = {}));
    })(exports, function(exports2) {
      "use strict";
      var sparkMd5 = {
        exports: {}
      };
      (function(module2, exports3) {
        (function(factory) {
          {
            module2.exports = factory();
          }
        })(function(undefined$1) {
          var hex_chr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
          function md5cycle(x, k) {
            var a = x[0], b = x[1], c = x[2], d = x[3];
            a += (b & c | ~b & d) + k[0] - 680876936 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[1] - 389564586 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[2] + 606105819 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[4] - 176418897 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[7] - 45705983 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[10] - 42063 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[13] - 40341101 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & d | c & ~d) + k[1] - 165796510 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[11] + 643717713 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[0] - 373897302 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[5] - 701558691 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[10] + 38016083 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[15] - 660478335 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[4] - 405537848 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[9] + 568446438 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[3] - 187363961 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[2] - 51403784 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b ^ c ^ d) + k[5] - 378558 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[14] - 35309556 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[7] - 155497632 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[13] + 681279174 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[0] - 358537222 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[3] - 722521979 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[6] + 76029189 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[9] - 640364487 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[12] - 421815835 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[15] + 530742520 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[2] - 995338651 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            x[0] = a + x[0] | 0;
            x[1] = b + x[1] | 0;
            x[2] = c + x[2] | 0;
            x[3] = d + x[3] | 0;
          }
          function md5blk(s) {
            var md5blks = [], i;
            for (i = 0; i < 64; i += 4) {
              md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
            }
            return md5blks;
          }
          function md5blk_array(a) {
            var md5blks = [], i;
            for (i = 0; i < 64; i += 4) {
              md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
            }
            return md5blks;
          }
          function md51(s) {
            var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i, length, tail, tmp, lo, hi;
            for (i = 64; i <= n; i += 64) {
              md5cycle(state, md5blk(s.substring(i - 64, i)));
            }
            s = s.substring(i - 64);
            length = s.length;
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (i = 0; i < length; i += 1) {
              tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
            }
            tail[i >> 2] |= 128 << (i % 4 << 3);
            if (i > 55) {
              md5cycle(state, tail);
              for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
              }
            }
            tmp = n * 8;
            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
            lo = parseInt(tmp[2], 16);
            hi = parseInt(tmp[1], 16) || 0;
            tail[14] = lo;
            tail[15] = hi;
            md5cycle(state, tail);
            return state;
          }
          function md51_array(a) {
            var n = a.length, state = [1732584193, -271733879, -1732584194, 271733878], i, length, tail, tmp, lo, hi;
            for (i = 64; i <= n; i += 64) {
              md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
            }
            a = i - 64 < n ? a.subarray(i - 64) : new Uint8Array(0);
            length = a.length;
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (i = 0; i < length; i += 1) {
              tail[i >> 2] |= a[i] << (i % 4 << 3);
            }
            tail[i >> 2] |= 128 << (i % 4 << 3);
            if (i > 55) {
              md5cycle(state, tail);
              for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
              }
            }
            tmp = n * 8;
            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
            lo = parseInt(tmp[2], 16);
            hi = parseInt(tmp[1], 16) || 0;
            tail[14] = lo;
            tail[15] = hi;
            md5cycle(state, tail);
            return state;
          }
          function rhex(n) {
            var s = "", j;
            for (j = 0; j < 4; j += 1) {
              s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
            }
            return s;
          }
          function hex(x) {
            var i;
            for (i = 0; i < x.length; i += 1) {
              x[i] = rhex(x[i]);
            }
            return x.join("");
          }
          if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592")
            ;
          if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
            (function() {
              function clamp(val, length) {
                val = val | 0 || 0;
                if (val < 0) {
                  return Math.max(val + length, 0);
                }
                return Math.min(val, length);
              }
              ArrayBuffer.prototype.slice = function(from, to) {
                var length = this.byteLength, begin = clamp(from, length), end = length, num, target, targetArray, sourceArray;
                if (to !== undefined$1) {
                  end = clamp(to, length);
                }
                if (begin > end) {
                  return new ArrayBuffer(0);
                }
                num = end - begin;
                target = new ArrayBuffer(num);
                targetArray = new Uint8Array(target);
                sourceArray = new Uint8Array(this, begin, num);
                targetArray.set(sourceArray);
                return target;
              };
            })();
          }
          function toUtf8(str) {
            if (/[\u0080-\uFFFF]/.test(str)) {
              str = unescape(encodeURIComponent(str));
            }
            return str;
          }
          function utf8Str2ArrayBuffer(str, returnUInt8Array) {
            var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i;
            for (i = 0; i < length; i += 1) {
              arr[i] = str.charCodeAt(i);
            }
            return returnUInt8Array ? arr : buff;
          }
          function arrayBuffer2Utf8Str(buff) {
            return String.fromCharCode.apply(null, new Uint8Array(buff));
          }
          function concatenateArrayBuffers(first, second, returnUInt8Array) {
            var result = new Uint8Array(first.byteLength + second.byteLength);
            result.set(new Uint8Array(first));
            result.set(new Uint8Array(second), first.byteLength);
            return returnUInt8Array ? result : result.buffer;
          }
          function hexToBinaryString(hex2) {
            var bytes = [], length = hex2.length, x;
            for (x = 0; x < length - 1; x += 2) {
              bytes.push(parseInt(hex2.substr(x, 2), 16));
            }
            return String.fromCharCode.apply(String, bytes);
          }
          function SparkMD52() {
            this.reset();
          }
          SparkMD52.prototype.append = function(str) {
            this.appendBinary(toUtf8(str));
            return this;
          };
          SparkMD52.prototype.appendBinary = function(contents) {
            this._buff += contents;
            this._length += contents.length;
            var length = this._buff.length, i;
            for (i = 64; i <= length; i += 64) {
              md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
            }
            this._buff = this._buff.substring(i - 64);
            return this;
          };
          SparkMD52.prototype.end = function(raw) {
            var buff = this._buff, length = buff.length, i, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ret;
            for (i = 0; i < length; i += 1) {
              tail[i >> 2] |= buff.charCodeAt(i) << (i % 4 << 3);
            }
            this._finish(tail, length);
            ret = hex(this._hash);
            if (raw) {
              ret = hexToBinaryString(ret);
            }
            this.reset();
            return ret;
          };
          SparkMD52.prototype.reset = function() {
            this._buff = "";
            this._length = 0;
            this._hash = [1732584193, -271733879, -1732584194, 271733878];
            return this;
          };
          SparkMD52.prototype.getState = function() {
            return {
              buff: this._buff,
              length: this._length,
              hash: this._hash.slice()
            };
          };
          SparkMD52.prototype.setState = function(state) {
            this._buff = state.buff;
            this._length = state.length;
            this._hash = state.hash;
            return this;
          };
          SparkMD52.prototype.destroy = function() {
            delete this._hash;
            delete this._buff;
            delete this._length;
          };
          SparkMD52.prototype._finish = function(tail, length) {
            var i = length, tmp, lo, hi;
            tail[i >> 2] |= 128 << (i % 4 << 3);
            if (i > 55) {
              md5cycle(this._hash, tail);
              for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
              }
            }
            tmp = this._length * 8;
            tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
            lo = parseInt(tmp[2], 16);
            hi = parseInt(tmp[1], 16) || 0;
            tail[14] = lo;
            tail[15] = hi;
            md5cycle(this._hash, tail);
          };
          SparkMD52.hash = function(str, raw) {
            return SparkMD52.hashBinary(toUtf8(str), raw);
          };
          SparkMD52.hashBinary = function(content, raw) {
            var hash = md51(content), ret = hex(hash);
            return raw ? hexToBinaryString(ret) : ret;
          };
          SparkMD52.ArrayBuffer = function() {
            this.reset();
          };
          SparkMD52.ArrayBuffer.prototype.append = function(arr) {
            var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i;
            this._length += arr.byteLength;
            for (i = 64; i <= length; i += 64) {
              md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
            }
            this._buff = i - 64 < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);
            return this;
          };
          SparkMD52.ArrayBuffer.prototype.end = function(raw) {
            var buff = this._buff, length = buff.length, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i, ret;
            for (i = 0; i < length; i += 1) {
              tail[i >> 2] |= buff[i] << (i % 4 << 3);
            }
            this._finish(tail, length);
            ret = hex(this._hash);
            if (raw) {
              ret = hexToBinaryString(ret);
            }
            this.reset();
            return ret;
          };
          SparkMD52.ArrayBuffer.prototype.reset = function() {
            this._buff = new Uint8Array(0);
            this._length = 0;
            this._hash = [1732584193, -271733879, -1732584194, 271733878];
            return this;
          };
          SparkMD52.ArrayBuffer.prototype.getState = function() {
            var state = SparkMD52.prototype.getState.call(this);
            state.buff = arrayBuffer2Utf8Str(state.buff);
            return state;
          };
          SparkMD52.ArrayBuffer.prototype.setState = function(state) {
            state.buff = utf8Str2ArrayBuffer(state.buff, true);
            return SparkMD52.prototype.setState.call(this, state);
          };
          SparkMD52.ArrayBuffer.prototype.destroy = SparkMD52.prototype.destroy;
          SparkMD52.ArrayBuffer.prototype._finish = SparkMD52.prototype._finish;
          SparkMD52.ArrayBuffer.hash = function(arr, raw) {
            var hash = md51_array(new Uint8Array(arr)), ret = hex(hash);
            return raw ? hexToBinaryString(ret) : ret;
          };
          return SparkMD52;
        });
      })(sparkMd5);
      var SparkMD5 = sparkMd5.exports;
      const fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      class FileChecksum {
        static create(file, callback) {
          const instance = new FileChecksum(file);
          instance.create(callback);
        }
        constructor(file) {
          this.file = file;
          this.chunkSize = 2097152;
          this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
          this.chunkIndex = 0;
        }
        create(callback) {
          this.callback = callback;
          this.md5Buffer = new SparkMD5.ArrayBuffer();
          this.fileReader = new FileReader();
          this.fileReader.addEventListener("load", (event) => this.fileReaderDidLoad(event));
          this.fileReader.addEventListener("error", (event) => this.fileReaderDidError(event));
          this.readNextChunk();
        }
        fileReaderDidLoad(event) {
          this.md5Buffer.append(event.target.result);
          if (!this.readNextChunk()) {
            const binaryDigest = this.md5Buffer.end(true);
            const base64digest = btoa(binaryDigest);
            this.callback(null, base64digest);
          }
        }
        fileReaderDidError(event) {
          this.callback(`Error reading ${this.file.name}`);
        }
        readNextChunk() {
          if (this.chunkIndex < this.chunkCount || this.chunkIndex == 0 && this.chunkCount == 0) {
            const start4 = this.chunkIndex * this.chunkSize;
            const end = Math.min(start4 + this.chunkSize, this.file.size);
            const bytes = fileSlice.call(this.file, start4, end);
            this.fileReader.readAsArrayBuffer(bytes);
            this.chunkIndex++;
            return true;
          } else {
            return false;
          }
        }
      }
      function getMetaValue(name) {
        const element = findElement(document.head, `meta[name="${name}"]`);
        if (element) {
          return element.getAttribute("content");
        }
      }
      function findElements(root, selector) {
        if (typeof root == "string") {
          selector = root;
          root = document;
        }
        const elements = root.querySelectorAll(selector);
        return toArray2(elements);
      }
      function findElement(root, selector) {
        if (typeof root == "string") {
          selector = root;
          root = document;
        }
        return root.querySelector(selector);
      }
      function dispatchEvent2(element, type, eventInit = {}) {
        const { disabled } = element;
        const { bubbles, cancelable, detail } = eventInit;
        const event = document.createEvent("Event");
        event.initEvent(type, bubbles || true, cancelable || true);
        event.detail = detail || {};
        try {
          element.disabled = false;
          element.dispatchEvent(event);
        } finally {
          element.disabled = disabled;
        }
        return event;
      }
      function toArray2(value) {
        if (Array.isArray(value)) {
          return value;
        } else if (Array.from) {
          return Array.from(value);
        } else {
          return [].slice.call(value);
        }
      }
      class BlobRecord {
        constructor(file, checksum, url, customHeaders = {}) {
          this.file = file;
          this.attributes = {
            filename: file.name,
            content_type: file.type || "application/octet-stream",
            byte_size: file.size,
            checksum
          };
          this.xhr = new XMLHttpRequest();
          this.xhr.open("POST", url, true);
          this.xhr.responseType = "json";
          this.xhr.setRequestHeader("Content-Type", "application/json");
          this.xhr.setRequestHeader("Accept", "application/json");
          this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          Object.keys(customHeaders).forEach((headerKey) => {
            this.xhr.setRequestHeader(headerKey, customHeaders[headerKey]);
          });
          const csrfToken2 = getMetaValue("csrf-token");
          if (csrfToken2 != void 0) {
            this.xhr.setRequestHeader("X-CSRF-Token", csrfToken2);
          }
          this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
          this.xhr.addEventListener("error", (event) => this.requestDidError(event));
        }
        get status() {
          return this.xhr.status;
        }
        get response() {
          const { responseType, response } = this.xhr;
          if (responseType == "json") {
            return response;
          } else {
            return JSON.parse(response);
          }
        }
        create(callback) {
          this.callback = callback;
          this.xhr.send(JSON.stringify({
            blob: this.attributes
          }));
        }
        requestDidLoad(event) {
          if (this.status >= 200 && this.status < 300) {
            const { response } = this;
            const { direct_upload } = response;
            delete response.direct_upload;
            this.attributes = response;
            this.directUploadData = direct_upload;
            this.callback(null, this.toJSON());
          } else {
            this.requestDidError(event);
          }
        }
        requestDidError(event) {
          this.callback(`Error creating Blob for "${this.file.name}". Status: ${this.status}`);
        }
        toJSON() {
          const result = {};
          for (const key in this.attributes) {
            result[key] = this.attributes[key];
          }
          return result;
        }
      }
      class BlobUpload {
        constructor(blob) {
          this.blob = blob;
          this.file = blob.file;
          const { url, headers } = blob.directUploadData;
          this.xhr = new XMLHttpRequest();
          this.xhr.open("PUT", url, true);
          this.xhr.responseType = "text";
          for (const key in headers) {
            this.xhr.setRequestHeader(key, headers[key]);
          }
          this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
          this.xhr.addEventListener("error", (event) => this.requestDidError(event));
        }
        create(callback) {
          this.callback = callback;
          this.xhr.send(this.file.slice());
        }
        requestDidLoad(event) {
          const { status, response } = this.xhr;
          if (status >= 200 && status < 300) {
            this.callback(null, response);
          } else {
            this.requestDidError(event);
          }
        }
        requestDidError(event) {
          this.callback(`Error storing "${this.file.name}". Status: ${this.xhr.status}`);
        }
      }
      let id = 0;
      class DirectUpload {
        constructor(file, url, delegate2, customHeaders = {}) {
          this.id = ++id;
          this.file = file;
          this.url = url;
          this.delegate = delegate2;
          this.customHeaders = customHeaders;
        }
        create(callback) {
          FileChecksum.create(this.file, (error2, checksum) => {
            if (error2) {
              callback(error2);
              return;
            }
            const blob = new BlobRecord(this.file, checksum, this.url, this.customHeaders);
            notify(this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr);
            blob.create((error3) => {
              if (error3) {
                callback(error3);
              } else {
                const upload = new BlobUpload(blob);
                notify(this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr);
                upload.create((error4) => {
                  if (error4) {
                    callback(error4);
                  } else {
                    callback(null, blob.toJSON());
                  }
                });
              }
            });
          });
        }
      }
      function notify(object, methodName, ...messages) {
        if (object && typeof object[methodName] == "function") {
          return object[methodName](...messages);
        }
      }
      class DirectUploadController {
        constructor(input, file) {
          this.input = input;
          this.file = file;
          this.directUpload = new DirectUpload(this.file, this.url, this);
          this.dispatch("initialize");
        }
        start(callback) {
          const hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.name = this.input.name;
          this.input.insertAdjacentElement("beforebegin", hiddenInput);
          this.dispatch("start");
          this.directUpload.create((error2, attributes) => {
            if (error2) {
              hiddenInput.parentNode.removeChild(hiddenInput);
              this.dispatchError(error2);
            } else {
              hiddenInput.value = attributes.signed_id;
            }
            this.dispatch("end");
            callback(error2);
          });
        }
        uploadRequestDidProgress(event) {
          const progress = event.loaded / event.total * 100;
          if (progress) {
            this.dispatch("progress", {
              progress
            });
          }
        }
        get url() {
          return this.input.getAttribute("data-direct-upload-url");
        }
        dispatch(name, detail = {}) {
          detail.file = this.file;
          detail.id = this.directUpload.id;
          return dispatchEvent2(this.input, `direct-upload:${name}`, {
            detail
          });
        }
        dispatchError(error2) {
          const event = this.dispatch("error", {
            error: error2
          });
          if (!event.defaultPrevented) {
            alert(error2);
          }
        }
        directUploadWillCreateBlobWithXHR(xhr) {
          this.dispatch("before-blob-request", {
            xhr
          });
        }
        directUploadWillStoreFileWithXHR(xhr) {
          this.dispatch("before-storage-request", {
            xhr
          });
          xhr.upload.addEventListener("progress", (event) => this.uploadRequestDidProgress(event));
        }
      }
      const inputSelector = "input[type=file][data-direct-upload-url]:not([disabled])";
      class DirectUploadsController {
        constructor(form) {
          this.form = form;
          this.inputs = findElements(form, inputSelector).filter((input) => input.files.length);
        }
        start(callback) {
          const controllers = this.createDirectUploadControllers();
          const startNextController = () => {
            const controller = controllers.shift();
            if (controller) {
              controller.start((error2) => {
                if (error2) {
                  callback(error2);
                  this.dispatch("end");
                } else {
                  startNextController();
                }
              });
            } else {
              callback();
              this.dispatch("end");
            }
          };
          this.dispatch("start");
          startNextController();
        }
        createDirectUploadControllers() {
          const controllers = [];
          this.inputs.forEach((input) => {
            toArray2(input.files).forEach((file) => {
              const controller = new DirectUploadController(input, file);
              controllers.push(controller);
            });
          });
          return controllers;
        }
        dispatch(name, detail = {}) {
          return dispatchEvent2(this.form, `direct-uploads:${name}`, {
            detail
          });
        }
      }
      const processingAttribute = "data-direct-uploads-processing";
      const submitButtonsByForm = /* @__PURE__ */ new WeakMap();
      let started = false;
      function start3() {
        if (!started) {
          started = true;
          document.addEventListener("click", didClick, true);
          document.addEventListener("submit", didSubmitForm, true);
          document.addEventListener("ajax:before", didSubmitRemoteElement);
        }
      }
      function didClick(event) {
        const button = event.target.closest("button, input");
        if (button && button.type === "submit" && button.form) {
          submitButtonsByForm.set(button.form, button);
        }
      }
      function didSubmitForm(event) {
        handleFormSubmissionEvent(event);
      }
      function didSubmitRemoteElement(event) {
        if (event.target.tagName == "FORM") {
          handleFormSubmissionEvent(event);
        }
      }
      function handleFormSubmissionEvent(event) {
        const form = event.target;
        if (form.hasAttribute(processingAttribute)) {
          event.preventDefault();
          return;
        }
        const controller = new DirectUploadsController(form);
        const { inputs } = controller;
        if (inputs.length) {
          event.preventDefault();
          form.setAttribute(processingAttribute, "");
          inputs.forEach(disable);
          controller.start((error2) => {
            form.removeAttribute(processingAttribute);
            if (error2) {
              inputs.forEach(enable);
            } else {
              submitForm(form);
            }
          });
        }
      }
      function submitForm(form) {
        let button = submitButtonsByForm.get(form) || findElement(form, "input[type=submit], button[type=submit]");
        if (button) {
          const { disabled } = button;
          button.disabled = false;
          button.focus();
          button.click();
          button.disabled = disabled;
        } else {
          button = document.createElement("input");
          button.type = "submit";
          button.style.display = "none";
          form.appendChild(button);
          button.click();
          form.removeChild(button);
        }
        submitButtonsByForm.delete(form);
      }
      function disable(input) {
        input.disabled = true;
      }
      function enable(input) {
        input.disabled = false;
      }
      function autostart() {
        if (window.ActiveStorage) {
          start3();
        }
      }
      setTimeout(autostart, 1);
      exports2.DirectUpload = DirectUpload;
      exports2.DirectUploadController = DirectUploadController;
      exports2.DirectUploadsController = DirectUploadsController;
      exports2.start = start3;
      Object.defineProperty(exports2, "__esModule", {
        value: true
      });
    });
  }
});

// node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
(function() {
  if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
    return;
  }
  const BuiltInHTMLElement = HTMLElement;
  const wrapperForTheName = {
    HTMLElement: function HTMLElement2() {
      return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
    }
  };
  window.HTMLElement = wrapperForTheName["HTMLElement"];
  HTMLElement.prototype = BuiltInHTMLElement.prototype;
  HTMLElement.prototype.constructor = HTMLElement;
  Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
})();
(function(prototype) {
  if (typeof prototype.requestSubmit == "function")
    return;
  prototype.requestSubmit = function(submitter) {
    if (submitter) {
      validateSubmitter(submitter, this);
      submitter.click();
    } else {
      submitter = document.createElement("input");
      submitter.type = "submit";
      submitter.hidden = true;
      this.appendChild(submitter);
      submitter.click();
      this.removeChild(submitter);
    }
  };
  function validateSubmitter(submitter, form) {
    submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
    submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
    submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
  }
  function raise(errorConstructor, message, name) {
    throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
  }
})(HTMLFormElement.prototype);
var submittersByForm = /* @__PURE__ */ new WeakMap();
function findSubmitterFromClickTarget(target) {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  const candidate = element ? element.closest("input, button") : null;
  return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
}
function clickCaptured(event) {
  const submitter = findSubmitterFromClickTarget(event.target);
  if (submitter && submitter.form) {
    submittersByForm.set(submitter.form, submitter);
  }
}
(function() {
  if ("submitter" in Event.prototype)
    return;
  let prototype = window.Event.prototype;
  if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
    prototype = window.SubmitEvent.prototype;
  } else if ("SubmitEvent" in window) {
    return;
  }
  addEventListener("click", clickCaptured, true);
  Object.defineProperty(prototype, "submitter", {
    get() {
      if (this.type == "submit" && this.target instanceof HTMLFormElement) {
        return submittersByForm.get(this.target);
      }
    }
  });
})();
var FrameLoadingStyle;
(function(FrameLoadingStyle2) {
  FrameLoadingStyle2["eager"] = "eager";
  FrameLoadingStyle2["lazy"] = "lazy";
})(FrameLoadingStyle || (FrameLoadingStyle = {}));
var FrameElement = class _FrameElement extends HTMLElement {
  static get observedAttributes() {
    return ["disabled", "complete", "loading", "src"];
  }
  constructor() {
    super();
    this.loaded = Promise.resolve();
    this.delegate = new _FrameElement.delegateConstructor(this);
  }
  connectedCallback() {
    this.delegate.connect();
  }
  disconnectedCallback() {
    this.delegate.disconnect();
  }
  reload() {
    return this.delegate.sourceURLReloaded();
  }
  attributeChangedCallback(name) {
    if (name == "loading") {
      this.delegate.loadingStyleChanged();
    } else if (name == "complete") {
      this.delegate.completeChanged();
    } else if (name == "src") {
      this.delegate.sourceURLChanged();
    } else {
      this.delegate.disabledChanged();
    }
  }
  get src() {
    return this.getAttribute("src");
  }
  set src(value) {
    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
  }
  get loading() {
    return frameLoadingStyleFromString(this.getAttribute("loading") || "");
  }
  set loading(value) {
    if (value) {
      this.setAttribute("loading", value);
    } else {
      this.removeAttribute("loading");
    }
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  get autoscroll() {
    return this.hasAttribute("autoscroll");
  }
  set autoscroll(value) {
    if (value) {
      this.setAttribute("autoscroll", "");
    } else {
      this.removeAttribute("autoscroll");
    }
  }
  get complete() {
    return !this.delegate.isLoading;
  }
  get isActive() {
    return this.ownerDocument === document && !this.isPreview;
  }
  get isPreview() {
    var _a, _b;
    return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
  }
};
function frameLoadingStyleFromString(style) {
  switch (style.toLowerCase()) {
    case "lazy":
      return FrameLoadingStyle.lazy;
    default:
      return FrameLoadingStyle.eager;
  }
}
function expandURL(locatable) {
  return new URL(locatable.toString(), document.baseURI);
}
function getAnchor(url) {
  let anchorMatch;
  if (url.hash) {
    return url.hash.slice(1);
  } else if (anchorMatch = url.href.match(/#(.*)$/)) {
    return anchorMatch[1];
  }
}
function getAction(form, submitter) {
  const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) || form.getAttribute("action") || form.action;
  return expandURL(action);
}
function getExtension(url) {
  return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
}
function isHTML(url) {
  return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
}
function isPrefixedBy(baseURL, url) {
  const prefix = getPrefix(url);
  return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
}
function locationIsVisitable(location2, rootLocation) {
  return isPrefixedBy(location2, rootLocation) && isHTML(location2);
}
function getRequestURL(url) {
  const anchor = getAnchor(url);
  return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
}
function toCacheKey(url) {
  return getRequestURL(url);
}
function urlsAreEqual(left, right) {
  return expandURL(left).href == expandURL(right).href;
}
function getPathComponents(url) {
  return url.pathname.split("/").slice(1);
}
function getLastPathComponent(url) {
  return getPathComponents(url).slice(-1)[0];
}
function getPrefix(url) {
  return addTrailingSlash(url.origin + url.pathname);
}
function addTrailingSlash(value) {
  return value.endsWith("/") ? value : value + "/";
}
var FetchResponse = class {
  constructor(response) {
    this.response = response;
  }
  get succeeded() {
    return this.response.ok;
  }
  get failed() {
    return !this.succeeded;
  }
  get clientError() {
    return this.statusCode >= 400 && this.statusCode <= 499;
  }
  get serverError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
  get redirected() {
    return this.response.redirected;
  }
  get location() {
    return expandURL(this.response.url);
  }
  get isHTML() {
    return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
  }
  get statusCode() {
    return this.response.status;
  }
  get contentType() {
    return this.header("Content-Type");
  }
  get responseText() {
    return this.response.clone().text();
  }
  get responseHTML() {
    if (this.isHTML) {
      return this.response.clone().text();
    } else {
      return Promise.resolve(void 0);
    }
  }
  header(name) {
    return this.response.headers.get(name);
  }
};
function activateScriptElement(element) {
  if (element.getAttribute("data-turbo-eval") == "false") {
    return element;
  } else {
    const createdScriptElement = document.createElement("script");
    const cspNonce2 = getMetaContent("csp-nonce");
    if (cspNonce2) {
      createdScriptElement.nonce = cspNonce2;
    }
    createdScriptElement.textContent = element.textContent;
    createdScriptElement.async = false;
    copyElementAttributes(createdScriptElement, element);
    return createdScriptElement;
  }
}
function copyElementAttributes(destinationElement, sourceElement) {
  for (const { name, value } of sourceElement.attributes) {
    destinationElement.setAttribute(name, value);
  }
}
function createDocumentFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}
function dispatch(eventName, { target, cancelable, detail } = {}) {
  const event = new CustomEvent(eventName, {
    cancelable,
    bubbles: true,
    composed: true,
    detail
  });
  if (target && target.isConnected) {
    target.dispatchEvent(event);
  } else {
    document.documentElement.dispatchEvent(event);
  }
  return event;
}
function nextAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
function nextEventLoopTick() {
  return new Promise((resolve) => setTimeout(() => resolve(), 0));
}
function nextMicrotask() {
  return Promise.resolve();
}
function parseHTMLDocument(html = "") {
  return new DOMParser().parseFromString(html, "text/html");
}
function unindent(strings, ...values) {
  const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
  const match = lines[0].match(/^\s+/);
  const indent = match ? match[0].length : 0;
  return lines.map((line) => line.slice(indent)).join("\n");
}
function interpolate(strings, values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] == void 0 ? "" : values[i];
    return result + string + value;
  }, "");
}
function uuid() {
  return Array.from({ length: 36 }).map((_, i) => {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      return "-";
    } else if (i == 14) {
      return "4";
    } else if (i == 19) {
      return (Math.floor(Math.random() * 4) + 8).toString(16);
    } else {
      return Math.floor(Math.random() * 15).toString(16);
    }
  }).join("");
}
function getAttribute(attributeName, ...elements) {
  for (const value of elements.map((element) => element === null || element === void 0 ? void 0 : element.getAttribute(attributeName))) {
    if (typeof value == "string")
      return value;
  }
  return null;
}
function hasAttribute(attributeName, ...elements) {
  return elements.some((element) => element && element.hasAttribute(attributeName));
}
function markAsBusy(...elements) {
  for (const element of elements) {
    if (element.localName == "turbo-frame") {
      element.setAttribute("busy", "");
    }
    element.setAttribute("aria-busy", "true");
  }
}
function clearBusyState(...elements) {
  for (const element of elements) {
    if (element.localName == "turbo-frame") {
      element.removeAttribute("busy");
    }
    element.removeAttribute("aria-busy");
  }
}
function waitForLoad(element, timeoutInMilliseconds = 2e3) {
  return new Promise((resolve) => {
    const onComplete = () => {
      element.removeEventListener("error", onComplete);
      element.removeEventListener("load", onComplete);
      resolve();
    };
    element.addEventListener("load", onComplete, { once: true });
    element.addEventListener("error", onComplete, { once: true });
    setTimeout(resolve, timeoutInMilliseconds);
  });
}
function getHistoryMethodForAction(action) {
  switch (action) {
    case "replace":
      return history.replaceState;
    case "advance":
    case "restore":
      return history.pushState;
  }
}
function isAction(action) {
  return action == "advance" || action == "replace" || action == "restore";
}
function getVisitAction(...elements) {
  const action = getAttribute("data-turbo-action", ...elements);
  return isAction(action) ? action : null;
}
function getMetaElement(name) {
  return document.querySelector(`meta[name="${name}"]`);
}
function getMetaContent(name) {
  const element = getMetaElement(name);
  return element && element.content;
}
function setMetaContent(name, content) {
  let element = getMetaElement(name);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  return element;
}
function findClosestRecursively(element, selector) {
  var _a;
  if (element instanceof Element) {
    return element.closest(selector) || findClosestRecursively(element.assignedSlot || ((_a = element.getRootNode()) === null || _a === void 0 ? void 0 : _a.host), selector);
  }
}
var FetchMethod;
(function(FetchMethod2) {
  FetchMethod2[FetchMethod2["get"] = 0] = "get";
  FetchMethod2[FetchMethod2["post"] = 1] = "post";
  FetchMethod2[FetchMethod2["put"] = 2] = "put";
  FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
  FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
})(FetchMethod || (FetchMethod = {}));
function fetchMethodFromString(method) {
  switch (method.toLowerCase()) {
    case "get":
      return FetchMethod.get;
    case "post":
      return FetchMethod.post;
    case "put":
      return FetchMethod.put;
    case "patch":
      return FetchMethod.patch;
    case "delete":
      return FetchMethod.delete;
  }
}
var FetchRequest = class {
  constructor(delegate2, method, location2, body = new URLSearchParams(), target = null) {
    this.abortController = new AbortController();
    this.resolveRequestPromise = (_value) => {
    };
    this.delegate = delegate2;
    this.method = method;
    this.headers = this.defaultHeaders;
    this.body = body;
    this.url = location2;
    this.target = target;
  }
  get location() {
    return this.url;
  }
  get params() {
    return this.url.searchParams;
  }
  get entries() {
    return this.body ? Array.from(this.body.entries()) : [];
  }
  cancel() {
    this.abortController.abort();
  }
  async perform() {
    const { fetchOptions } = this;
    this.delegate.prepareRequest(this);
    await this.allowRequestToBeIntercepted(fetchOptions);
    try {
      this.delegate.requestStarted(this);
      const response = await fetch(this.url.href, fetchOptions);
      return await this.receive(response);
    } catch (error2) {
      if (error2.name !== "AbortError") {
        if (this.willDelegateErrorHandling(error2)) {
          this.delegate.requestErrored(this, error2);
        }
        throw error2;
      }
    } finally {
      this.delegate.requestFinished(this);
    }
  }
  async receive(response) {
    const fetchResponse = new FetchResponse(response);
    const event = dispatch("turbo:before-fetch-response", {
      cancelable: true,
      detail: { fetchResponse },
      target: this.target
    });
    if (event.defaultPrevented) {
      this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
    } else if (fetchResponse.succeeded) {
      this.delegate.requestSucceededWithResponse(this, fetchResponse);
    } else {
      this.delegate.requestFailedWithResponse(this, fetchResponse);
    }
    return fetchResponse;
  }
  get fetchOptions() {
    var _a;
    return {
      method: FetchMethod[this.method].toUpperCase(),
      credentials: "same-origin",
      headers: this.headers,
      redirect: "follow",
      body: this.isSafe ? null : this.body,
      signal: this.abortSignal,
      referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
    };
  }
  get defaultHeaders() {
    return {
      Accept: "text/html, application/xhtml+xml"
    };
  }
  get isSafe() {
    return this.method === FetchMethod.get;
  }
  get abortSignal() {
    return this.abortController.signal;
  }
  acceptResponseType(mimeType) {
    this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
  }
  async allowRequestToBeIntercepted(fetchOptions) {
    const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
    const event = dispatch("turbo:before-fetch-request", {
      cancelable: true,
      detail: {
        fetchOptions,
        url: this.url,
        resume: this.resolveRequestPromise
      },
      target: this.target
    });
    if (event.defaultPrevented)
      await requestInterception;
  }
  willDelegateErrorHandling(error2) {
    const event = dispatch("turbo:fetch-request-error", {
      target: this.target,
      cancelable: true,
      detail: { request: this, error: error2 }
    });
    return !event.defaultPrevented;
  }
};
var AppearanceObserver = class {
  constructor(delegate2, element) {
    this.started = false;
    this.intersect = (entries) => {
      const lastEntry = entries.slice(-1)[0];
      if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
        this.delegate.elementAppearedInViewport(this.element);
      }
    };
    this.delegate = delegate2;
    this.element = element;
    this.intersectionObserver = new IntersectionObserver(this.intersect);
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.intersectionObserver.observe(this.element);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.intersectionObserver.unobserve(this.element);
    }
  }
};
var StreamMessage = class {
  static wrap(message) {
    if (typeof message == "string") {
      return new this(createDocumentFragment(message));
    } else {
      return message;
    }
  }
  constructor(fragment) {
    this.fragment = importStreamElements(fragment);
  }
};
StreamMessage.contentType = "text/vnd.turbo-stream.html";
function importStreamElements(fragment) {
  for (const element of fragment.querySelectorAll("turbo-stream")) {
    const streamElement = document.importNode(element, true);
    for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
      inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
    }
    element.replaceWith(streamElement);
  }
  return fragment;
}
var FormSubmissionState;
(function(FormSubmissionState2) {
  FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
  FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
  FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
  FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
  FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
  FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
})(FormSubmissionState || (FormSubmissionState = {}));
var FormEnctype;
(function(FormEnctype2) {
  FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
  FormEnctype2["multipart"] = "multipart/form-data";
  FormEnctype2["plain"] = "text/plain";
})(FormEnctype || (FormEnctype = {}));
function formEnctypeFromString(encoding) {
  switch (encoding.toLowerCase()) {
    case FormEnctype.multipart:
      return FormEnctype.multipart;
    case FormEnctype.plain:
      return FormEnctype.plain;
    default:
      return FormEnctype.urlEncoded;
  }
}
var FormSubmission = class _FormSubmission {
  static confirmMethod(message, _element, _submitter) {
    return Promise.resolve(confirm(message));
  }
  constructor(delegate2, formElement, submitter, mustRedirect = false) {
    this.state = FormSubmissionState.initialized;
    this.delegate = delegate2;
    this.formElement = formElement;
    this.submitter = submitter;
    this.formData = buildFormData(formElement, submitter);
    this.location = expandURL(this.action);
    if (this.method == FetchMethod.get) {
      mergeFormDataEntries(this.location, [...this.body.entries()]);
    }
    this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body, this.formElement);
    this.mustRedirect = mustRedirect;
  }
  get method() {
    var _a;
    const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
    return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
  }
  get action() {
    var _a;
    const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
    if ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.hasAttribute("formaction")) {
      return this.submitter.getAttribute("formaction") || "";
    } else {
      return this.formElement.getAttribute("action") || formElementAction || "";
    }
  }
  get body() {
    if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
      return new URLSearchParams(this.stringFormData);
    } else {
      return this.formData;
    }
  }
  get enctype() {
    var _a;
    return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
  }
  get isSafe() {
    return this.fetchRequest.isSafe;
  }
  get stringFormData() {
    return [...this.formData].reduce((entries, [name, value]) => {
      return entries.concat(typeof value == "string" ? [[name, value]] : []);
    }, []);
  }
  async start() {
    const { initialized, requesting } = FormSubmissionState;
    const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
    if (typeof confirmationMessage === "string") {
      const answer = await _FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
      if (!answer) {
        return;
      }
    }
    if (this.state == initialized) {
      this.state = requesting;
      return this.fetchRequest.perform();
    }
  }
  stop() {
    const { stopping, stopped } = FormSubmissionState;
    if (this.state != stopping && this.state != stopped) {
      this.state = stopping;
      this.fetchRequest.cancel();
      return true;
    }
  }
  prepareRequest(request) {
    if (!request.isSafe) {
      const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
      if (token) {
        request.headers["X-CSRF-Token"] = token;
      }
    }
    if (this.requestAcceptsTurboStreamResponse(request)) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted(_request) {
    var _a;
    this.state = FormSubmissionState.waiting;
    (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "");
    this.setSubmitsWith();
    dispatch("turbo:submit-start", {
      target: this.formElement,
      detail: { formSubmission: this }
    });
    this.delegate.formSubmissionStarted(this);
  }
  requestPreventedHandlingResponse(request, response) {
    this.result = { success: response.succeeded, fetchResponse: response };
  }
  requestSucceededWithResponse(request, response) {
    if (response.clientError || response.serverError) {
      this.delegate.formSubmissionFailedWithResponse(this, response);
    } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
      const error2 = new Error("Form responses must redirect to another location");
      this.delegate.formSubmissionErrored(this, error2);
    } else {
      this.state = FormSubmissionState.receiving;
      this.result = { success: true, fetchResponse: response };
      this.delegate.formSubmissionSucceededWithResponse(this, response);
    }
  }
  requestFailedWithResponse(request, response) {
    this.result = { success: false, fetchResponse: response };
    this.delegate.formSubmissionFailedWithResponse(this, response);
  }
  requestErrored(request, error2) {
    this.result = { success: false, error: error2 };
    this.delegate.formSubmissionErrored(this, error2);
  }
  requestFinished(_request) {
    var _a;
    this.state = FormSubmissionState.stopped;
    (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
    this.resetSubmitterText();
    dispatch("turbo:submit-end", {
      target: this.formElement,
      detail: Object.assign({ formSubmission: this }, this.result)
    });
    this.delegate.formSubmissionFinished(this);
  }
  setSubmitsWith() {
    if (!this.submitter || !this.submitsWith)
      return;
    if (this.submitter.matches("button")) {
      this.originalSubmitText = this.submitter.innerHTML;
      this.submitter.innerHTML = this.submitsWith;
    } else if (this.submitter.matches("input")) {
      const input = this.submitter;
      this.originalSubmitText = input.value;
      input.value = this.submitsWith;
    }
  }
  resetSubmitterText() {
    if (!this.submitter || !this.originalSubmitText)
      return;
    if (this.submitter.matches("button")) {
      this.submitter.innerHTML = this.originalSubmitText;
    } else if (this.submitter.matches("input")) {
      const input = this.submitter;
      input.value = this.originalSubmitText;
    }
  }
  requestMustRedirect(request) {
    return !request.isSafe && this.mustRedirect;
  }
  requestAcceptsTurboStreamResponse(request) {
    return !request.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
  }
  get submitsWith() {
    var _a;
    return (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("data-turbo-submits-with");
  }
};
function buildFormData(formElement, submitter) {
  const formData = new FormData(formElement);
  const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
  const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
  if (name) {
    formData.append(name, value || "");
  }
  return formData;
}
function getCookieValue(cookieName) {
  if (cookieName != null) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
    if (cookie) {
      const value = cookie.split("=").slice(1).join("=");
      return value ? decodeURIComponent(value) : void 0;
    }
  }
}
function responseSucceededWithoutRedirect(response) {
  return response.statusCode == 200 && !response.redirected;
}
function mergeFormDataEntries(url, entries) {
  const searchParams = new URLSearchParams();
  for (const [name, value] of entries) {
    if (value instanceof File)
      continue;
    searchParams.append(name, value);
  }
  url.search = searchParams.toString();
  return url;
}
var Snapshot = class {
  constructor(element) {
    this.element = element;
  }
  get activeElement() {
    return this.element.ownerDocument.activeElement;
  }
  get children() {
    return [...this.element.children];
  }
  hasAnchor(anchor) {
    return this.getElementForAnchor(anchor) != null;
  }
  getElementForAnchor(anchor) {
    return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
  }
  get isConnected() {
    return this.element.isConnected;
  }
  get firstAutofocusableElement() {
    const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
    for (const element of this.element.querySelectorAll("[autofocus]")) {
      if (element.closest(inertDisabledOrHidden) == null)
        return element;
      else
        continue;
    }
    return null;
  }
  get permanentElements() {
    return queryPermanentElementsAll(this.element);
  }
  getPermanentElementById(id) {
    return getPermanentElementById(this.element, id);
  }
  getPermanentElementMapForSnapshot(snapshot) {
    const permanentElementMap = {};
    for (const currentPermanentElement of this.permanentElements) {
      const { id } = currentPermanentElement;
      const newPermanentElement = snapshot.getPermanentElementById(id);
      if (newPermanentElement) {
        permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
      }
    }
    return permanentElementMap;
  }
};
function getPermanentElementById(node, id) {
  return node.querySelector(`#${id}[data-turbo-permanent]`);
}
function queryPermanentElementsAll(node) {
  return node.querySelectorAll("[id][data-turbo-permanent]");
}
var FormSubmitObserver = class {
  constructor(delegate2, eventTarget) {
    this.started = false;
    this.submitCaptured = () => {
      this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
      this.eventTarget.addEventListener("submit", this.submitBubbled, false);
    };
    this.submitBubbled = (event) => {
      if (!event.defaultPrevented) {
        const form = event.target instanceof HTMLFormElement ? event.target : void 0;
        const submitter = event.submitter || void 0;
        if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.delegate.formSubmitted(form, submitter);
        }
      }
    };
    this.delegate = delegate2;
    this.eventTarget = eventTarget;
  }
  start() {
    if (!this.started) {
      this.eventTarget.addEventListener("submit", this.submitCaptured, true);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
      this.started = false;
    }
  }
};
function submissionDoesNotDismissDialog(form, submitter) {
  const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method");
  return method != "dialog";
}
function submissionDoesNotTargetIFrame(form, submitter) {
  if ((submitter === null || submitter === void 0 ? void 0 : submitter.hasAttribute("formtarget")) || form.hasAttribute("target")) {
    const target = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formtarget")) || form.target;
    for (const element of document.getElementsByName(target)) {
      if (element instanceof HTMLIFrameElement)
        return false;
    }
    return true;
  } else {
    return true;
  }
}
var View = class {
  constructor(delegate2, element) {
    this.resolveRenderPromise = (_value) => {
    };
    this.resolveInterceptionPromise = (_value) => {
    };
    this.delegate = delegate2;
    this.element = element;
  }
  scrollToAnchor(anchor) {
    const element = this.snapshot.getElementForAnchor(anchor);
    if (element) {
      this.scrollToElement(element);
      this.focusElement(element);
    } else {
      this.scrollToPosition({ x: 0, y: 0 });
    }
  }
  scrollToAnchorFromLocation(location2) {
    this.scrollToAnchor(getAnchor(location2));
  }
  scrollToElement(element) {
    element.scrollIntoView();
  }
  focusElement(element) {
    if (element instanceof HTMLElement) {
      if (element.hasAttribute("tabindex")) {
        element.focus();
      } else {
        element.setAttribute("tabindex", "-1");
        element.focus();
        element.removeAttribute("tabindex");
      }
    }
  }
  scrollToPosition({ x, y }) {
    this.scrollRoot.scrollTo(x, y);
  }
  scrollToTop() {
    this.scrollToPosition({ x: 0, y: 0 });
  }
  get scrollRoot() {
    return window;
  }
  async render(renderer) {
    const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
    if (shouldRender) {
      try {
        this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
        this.renderer = renderer;
        await this.prepareToRenderSnapshot(renderer);
        const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
        const options = { resume: this.resolveInterceptionPromise, render: this.renderer.renderElement };
        const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
        if (!immediateRender)
          await renderInterception;
        await this.renderSnapshot(renderer);
        this.delegate.viewRenderedSnapshot(snapshot, isPreview);
        this.delegate.preloadOnLoadLinksForView(this.element);
        this.finishRenderingSnapshot(renderer);
      } finally {
        delete this.renderer;
        this.resolveRenderPromise(void 0);
        delete this.renderPromise;
      }
    } else {
      this.invalidate(renderer.reloadReason);
    }
  }
  invalidate(reason) {
    this.delegate.viewInvalidated(reason);
  }
  async prepareToRenderSnapshot(renderer) {
    this.markAsPreview(renderer.isPreview);
    await renderer.prepareToRender();
  }
  markAsPreview(isPreview) {
    if (isPreview) {
      this.element.setAttribute("data-turbo-preview", "");
    } else {
      this.element.removeAttribute("data-turbo-preview");
    }
  }
  async renderSnapshot(renderer) {
    await renderer.render();
  }
  finishRenderingSnapshot(renderer) {
    renderer.finishRendering();
  }
};
var FrameView = class extends View {
  missing() {
    this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
  }
  get snapshot() {
    return new Snapshot(this.element);
  }
};
var LinkInterceptor = class {
  constructor(delegate2, element) {
    this.clickBubbled = (event) => {
      if (this.respondsToEventTarget(event.target)) {
        this.clickEvent = event;
      } else {
        delete this.clickEvent;
      }
    };
    this.linkClicked = (event) => {
      if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
        if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
          this.clickEvent.preventDefault();
          event.preventDefault();
          this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
        }
      }
      delete this.clickEvent;
    };
    this.willVisit = (_event) => {
      delete this.clickEvent;
    };
    this.delegate = delegate2;
    this.element = element;
  }
  start() {
    this.element.addEventListener("click", this.clickBubbled);
    document.addEventListener("turbo:click", this.linkClicked);
    document.addEventListener("turbo:before-visit", this.willVisit);
  }
  stop() {
    this.element.removeEventListener("click", this.clickBubbled);
    document.removeEventListener("turbo:click", this.linkClicked);
    document.removeEventListener("turbo:before-visit", this.willVisit);
  }
  respondsToEventTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    return element && element.closest("turbo-frame, html") == this.element;
  }
};
var LinkClickObserver = class {
  constructor(delegate2, eventTarget) {
    this.started = false;
    this.clickCaptured = () => {
      this.eventTarget.removeEventListener("click", this.clickBubbled, false);
      this.eventTarget.addEventListener("click", this.clickBubbled, false);
    };
    this.clickBubbled = (event) => {
      if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
        const target = event.composedPath && event.composedPath()[0] || event.target;
        const link = this.findLinkFromClickTarget(target);
        if (link && doesNotTargetIFrame(link)) {
          const location2 = this.getLocationForLink(link);
          if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
            event.preventDefault();
            this.delegate.followedLinkToLocation(link, location2);
          }
        }
      }
    };
    this.delegate = delegate2;
    this.eventTarget = eventTarget;
  }
  start() {
    if (!this.started) {
      this.eventTarget.addEventListener("click", this.clickCaptured, true);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.eventTarget.removeEventListener("click", this.clickCaptured, true);
      this.started = false;
    }
  }
  clickEventIsSignificant(event) {
    return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
  }
  findLinkFromClickTarget(target) {
    return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
  }
  getLocationForLink(link) {
    return expandURL(link.getAttribute("href") || "");
  }
};
function doesNotTargetIFrame(anchor) {
  if (anchor.hasAttribute("target")) {
    for (const element of document.getElementsByName(anchor.target)) {
      if (element instanceof HTMLIFrameElement)
        return false;
    }
    return true;
  } else {
    return true;
  }
}
var FormLinkClickObserver = class {
  constructor(delegate2, element) {
    this.delegate = delegate2;
    this.linkInterceptor = new LinkClickObserver(this, element);
  }
  start() {
    this.linkInterceptor.start();
  }
  stop() {
    this.linkInterceptor.stop();
  }
  willFollowLinkToLocation(link, location2, originalEvent) {
    return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && link.hasAttribute("data-turbo-method");
  }
  followedLinkToLocation(link, location2) {
    const form = document.createElement("form");
    const type = "hidden";
    for (const [name, value] of location2.searchParams) {
      form.append(Object.assign(document.createElement("input"), { type, name, value }));
    }
    const action = Object.assign(location2, { search: "" });
    form.setAttribute("data-turbo", "true");
    form.setAttribute("action", action.href);
    form.setAttribute("hidden", "");
    const method = link.getAttribute("data-turbo-method");
    if (method)
      form.setAttribute("method", method);
    const turboFrame = link.getAttribute("data-turbo-frame");
    if (turboFrame)
      form.setAttribute("data-turbo-frame", turboFrame);
    const turboAction = getVisitAction(link);
    if (turboAction)
      form.setAttribute("data-turbo-action", turboAction);
    const turboConfirm = link.getAttribute("data-turbo-confirm");
    if (turboConfirm)
      form.setAttribute("data-turbo-confirm", turboConfirm);
    const turboStream = link.hasAttribute("data-turbo-stream");
    if (turboStream)
      form.setAttribute("data-turbo-stream", "");
    this.delegate.submittedFormLinkToLocation(link, location2, form);
    document.body.appendChild(form);
    form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
    requestAnimationFrame(() => form.requestSubmit());
  }
};
var Bardo = class {
  static async preservingPermanentElements(delegate2, permanentElementMap, callback) {
    const bardo = new this(delegate2, permanentElementMap);
    bardo.enter();
    await callback();
    bardo.leave();
  }
  constructor(delegate2, permanentElementMap) {
    this.delegate = delegate2;
    this.permanentElementMap = permanentElementMap;
  }
  enter() {
    for (const id in this.permanentElementMap) {
      const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
      this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
      this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
    }
  }
  leave() {
    for (const id in this.permanentElementMap) {
      const [currentPermanentElement] = this.permanentElementMap[id];
      this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
      this.replacePlaceholderWithPermanentElement(currentPermanentElement);
      this.delegate.leavingBardo(currentPermanentElement);
    }
  }
  replaceNewPermanentElementWithPlaceholder(permanentElement) {
    const placeholder = createPlaceholderForPermanentElement(permanentElement);
    permanentElement.replaceWith(placeholder);
  }
  replaceCurrentPermanentElementWithClone(permanentElement) {
    const clone = permanentElement.cloneNode(true);
    permanentElement.replaceWith(clone);
  }
  replacePlaceholderWithPermanentElement(permanentElement) {
    const placeholder = this.getPlaceholderById(permanentElement.id);
    placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
  }
  getPlaceholderById(id) {
    return this.placeholders.find((element) => element.content == id);
  }
  get placeholders() {
    return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
  }
};
function createPlaceholderForPermanentElement(permanentElement) {
  const element = document.createElement("meta");
  element.setAttribute("name", "turbo-permanent-placeholder");
  element.setAttribute("content", permanentElement.id);
  return element;
}
var Renderer = class {
  constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
    this.activeElement = null;
    this.currentSnapshot = currentSnapshot;
    this.newSnapshot = newSnapshot;
    this.isPreview = isPreview;
    this.willRender = willRender;
    this.renderElement = renderElement;
    this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
  }
  get shouldRender() {
    return true;
  }
  get reloadReason() {
    return;
  }
  prepareToRender() {
    return;
  }
  finishRendering() {
    if (this.resolvingFunctions) {
      this.resolvingFunctions.resolve();
      delete this.resolvingFunctions;
    }
  }
  async preservingPermanentElements(callback) {
    await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
  }
  focusFirstAutofocusableElement() {
    const element = this.connectedSnapshot.firstAutofocusableElement;
    if (elementIsFocusable(element)) {
      element.focus();
    }
  }
  enteringBardo(currentPermanentElement) {
    if (this.activeElement)
      return;
    if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
      this.activeElement = this.currentSnapshot.activeElement;
    }
  }
  leavingBardo(currentPermanentElement) {
    if (currentPermanentElement.contains(this.activeElement) && this.activeElement instanceof HTMLElement) {
      this.activeElement.focus();
      this.activeElement = null;
    }
  }
  get connectedSnapshot() {
    return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
  }
  get currentElement() {
    return this.currentSnapshot.element;
  }
  get newElement() {
    return this.newSnapshot.element;
  }
  get permanentElementMap() {
    return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
  }
};
function elementIsFocusable(element) {
  return element && typeof element.focus == "function";
}
var FrameRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    var _a;
    const destinationRange = document.createRange();
    destinationRange.selectNodeContents(currentElement);
    destinationRange.deleteContents();
    const frameElement = newElement;
    const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
    if (sourceRange) {
      sourceRange.selectNodeContents(frameElement);
      currentElement.appendChild(sourceRange.extractContents());
    }
  }
  constructor(delegate2, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
    super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
    this.delegate = delegate2;
  }
  get shouldRender() {
    return true;
  }
  async render() {
    await nextAnimationFrame();
    this.preservingPermanentElements(() => {
      this.loadFrameElement();
    });
    this.scrollFrameIntoView();
    await nextAnimationFrame();
    this.focusFirstAutofocusableElement();
    await nextAnimationFrame();
    this.activateScriptElements();
  }
  loadFrameElement() {
    this.delegate.willRenderFrame(this.currentElement, this.newElement);
    this.renderElement(this.currentElement, this.newElement);
  }
  scrollFrameIntoView() {
    if (this.currentElement.autoscroll || this.newElement.autoscroll) {
      const element = this.currentElement.firstElementChild;
      const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
      const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
      if (element) {
        element.scrollIntoView({ block, behavior });
        return true;
      }
    }
    return false;
  }
  activateScriptElements() {
    for (const inertScriptElement of this.newScriptElements) {
      const activatedScriptElement = activateScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }
  get newScriptElements() {
    return this.currentElement.querySelectorAll("script");
  }
};
function readScrollLogicalPosition(value, defaultValue) {
  if (value == "end" || value == "start" || value == "center" || value == "nearest") {
    return value;
  } else {
    return defaultValue;
  }
}
function readScrollBehavior(value, defaultValue) {
  if (value == "auto" || value == "smooth") {
    return value;
  } else {
    return defaultValue;
  }
}
var ProgressBar = class _ProgressBar {
  static get defaultCSS() {
    return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${_ProgressBar.animationDuration}ms ease-out,
          opacity ${_ProgressBar.animationDuration / 2}ms ${_ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
  }
  constructor() {
    this.hiding = false;
    this.value = 0;
    this.visible = false;
    this.trickle = () => {
      this.setValue(this.value + Math.random() / 100);
    };
    this.stylesheetElement = this.createStylesheetElement();
    this.progressElement = this.createProgressElement();
    this.installStylesheetElement();
    this.setValue(0);
  }
  show() {
    if (!this.visible) {
      this.visible = true;
      this.installProgressElement();
      this.startTrickling();
    }
  }
  hide() {
    if (this.visible && !this.hiding) {
      this.hiding = true;
      this.fadeProgressElement(() => {
        this.uninstallProgressElement();
        this.stopTrickling();
        this.visible = false;
        this.hiding = false;
      });
    }
  }
  setValue(value) {
    this.value = value;
    this.refresh();
  }
  installStylesheetElement() {
    document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
  }
  installProgressElement() {
    this.progressElement.style.width = "0";
    this.progressElement.style.opacity = "1";
    document.documentElement.insertBefore(this.progressElement, document.body);
    this.refresh();
  }
  fadeProgressElement(callback) {
    this.progressElement.style.opacity = "0";
    setTimeout(callback, _ProgressBar.animationDuration * 1.5);
  }
  uninstallProgressElement() {
    if (this.progressElement.parentNode) {
      document.documentElement.removeChild(this.progressElement);
    }
  }
  startTrickling() {
    if (!this.trickleInterval) {
      this.trickleInterval = window.setInterval(this.trickle, _ProgressBar.animationDuration);
    }
  }
  stopTrickling() {
    window.clearInterval(this.trickleInterval);
    delete this.trickleInterval;
  }
  refresh() {
    requestAnimationFrame(() => {
      this.progressElement.style.width = `${10 + this.value * 90}%`;
    });
  }
  createStylesheetElement() {
    const element = document.createElement("style");
    element.type = "text/css";
    element.textContent = _ProgressBar.defaultCSS;
    if (this.cspNonce) {
      element.nonce = this.cspNonce;
    }
    return element;
  }
  createProgressElement() {
    const element = document.createElement("div");
    element.className = "turbo-progress-bar";
    return element;
  }
  get cspNonce() {
    return getMetaContent("csp-nonce");
  }
};
ProgressBar.animationDuration = 300;
var HeadSnapshot = class extends Snapshot {
  constructor() {
    super(...arguments);
    this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
      const { outerHTML } = element;
      const details = outerHTML in result ? result[outerHTML] : {
        type: elementType(element),
        tracked: elementIsTracked(element),
        elements: []
      };
      return Object.assign(Object.assign({}, result), { [outerHTML]: Object.assign(Object.assign({}, details), { elements: [...details.elements, element] }) });
    }, {});
  }
  get trackedElementSignature() {
    return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
  }
  getScriptElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
  }
  getStylesheetElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
  }
  getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
    return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
  }
  get provisionalElements() {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
      if (type == null && !tracked) {
        return [...result, ...elements];
      } else if (elements.length > 1) {
        return [...result, ...elements.slice(1)];
      } else {
        return result;
      }
    }, []);
  }
  getMetaValue(name) {
    const element = this.findMetaElementByName(name);
    return element ? element.getAttribute("content") : null;
  }
  findMetaElementByName(name) {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
      return elementIsMetaElementWithName(element, name) ? element : result;
    }, void 0);
  }
};
function elementType(element) {
  if (elementIsScript(element)) {
    return "script";
  } else if (elementIsStylesheet(element)) {
    return "stylesheet";
  }
}
function elementIsTracked(element) {
  return element.getAttribute("data-turbo-track") == "reload";
}
function elementIsScript(element) {
  const tagName = element.localName;
  return tagName == "script";
}
function elementIsNoscript(element) {
  const tagName = element.localName;
  return tagName == "noscript";
}
function elementIsStylesheet(element) {
  const tagName = element.localName;
  return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
}
function elementIsMetaElementWithName(element, name) {
  const tagName = element.localName;
  return tagName == "meta" && element.getAttribute("name") == name;
}
function elementWithoutNonce(element) {
  if (element.hasAttribute("nonce")) {
    element.setAttribute("nonce", "");
  }
  return element;
}
var PageSnapshot = class _PageSnapshot extends Snapshot {
  static fromHTMLString(html = "") {
    return this.fromDocument(parseHTMLDocument(html));
  }
  static fromElement(element) {
    return this.fromDocument(element.ownerDocument);
  }
  static fromDocument({ head, body }) {
    return new this(body, new HeadSnapshot(head));
  }
  constructor(element, headSnapshot) {
    super(element);
    this.headSnapshot = headSnapshot;
  }
  clone() {
    const clonedElement = this.element.cloneNode(true);
    const selectElements = this.element.querySelectorAll("select");
    const clonedSelectElements = clonedElement.querySelectorAll("select");
    for (const [index, source] of selectElements.entries()) {
      const clone = clonedSelectElements[index];
      for (const option of clone.selectedOptions)
        option.selected = false;
      for (const option of source.selectedOptions)
        clone.options[option.index].selected = true;
    }
    for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
      clonedPasswordInput.value = "";
    }
    return new _PageSnapshot(clonedElement, this.headSnapshot);
  }
  get headElement() {
    return this.headSnapshot.element;
  }
  get rootLocation() {
    var _a;
    const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
    return expandURL(root);
  }
  get cacheControlValue() {
    return this.getSetting("cache-control");
  }
  get isPreviewable() {
    return this.cacheControlValue != "no-preview";
  }
  get isCacheable() {
    return this.cacheControlValue != "no-cache";
  }
  get isVisitable() {
    return this.getSetting("visit-control") != "reload";
  }
  getSetting(name) {
    return this.headSnapshot.getMetaValue(`turbo-${name}`);
  }
};
var TimingMetric;
(function(TimingMetric2) {
  TimingMetric2["visitStart"] = "visitStart";
  TimingMetric2["requestStart"] = "requestStart";
  TimingMetric2["requestEnd"] = "requestEnd";
  TimingMetric2["visitEnd"] = "visitEnd";
})(TimingMetric || (TimingMetric = {}));
var VisitState;
(function(VisitState2) {
  VisitState2["initialized"] = "initialized";
  VisitState2["started"] = "started";
  VisitState2["canceled"] = "canceled";
  VisitState2["failed"] = "failed";
  VisitState2["completed"] = "completed";
})(VisitState || (VisitState = {}));
var defaultOptions = {
  action: "advance",
  historyChanged: false,
  visitCachedSnapshot: () => {
  },
  willRender: true,
  updateHistory: true,
  shouldCacheSnapshot: true,
  acceptsStreamResponse: false
};
var SystemStatusCode;
(function(SystemStatusCode2) {
  SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
  SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
  SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
})(SystemStatusCode || (SystemStatusCode = {}));
var Visit = class {
  constructor(delegate2, location2, restorationIdentifier, options = {}) {
    this.identifier = uuid();
    this.timingMetrics = {};
    this.followedRedirect = false;
    this.historyChanged = false;
    this.scrolled = false;
    this.shouldCacheSnapshot = true;
    this.acceptsStreamResponse = false;
    this.snapshotCached = false;
    this.state = VisitState.initialized;
    this.delegate = delegate2;
    this.location = location2;
    this.restorationIdentifier = restorationIdentifier || uuid();
    const { action, historyChanged, referrer, snapshot, snapshotHTML, response, visitCachedSnapshot, willRender, updateHistory, shouldCacheSnapshot, acceptsStreamResponse } = Object.assign(Object.assign({}, defaultOptions), options);
    this.action = action;
    this.historyChanged = historyChanged;
    this.referrer = referrer;
    this.snapshot = snapshot;
    this.snapshotHTML = snapshotHTML;
    this.response = response;
    this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
    this.visitCachedSnapshot = visitCachedSnapshot;
    this.willRender = willRender;
    this.updateHistory = updateHistory;
    this.scrolled = !willRender;
    this.shouldCacheSnapshot = shouldCacheSnapshot;
    this.acceptsStreamResponse = acceptsStreamResponse;
  }
  get adapter() {
    return this.delegate.adapter;
  }
  get view() {
    return this.delegate.view;
  }
  get history() {
    return this.delegate.history;
  }
  get restorationData() {
    return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
  }
  get silent() {
    return this.isSamePage;
  }
  start() {
    if (this.state == VisitState.initialized) {
      this.recordTimingMetric(TimingMetric.visitStart);
      this.state = VisitState.started;
      this.adapter.visitStarted(this);
      this.delegate.visitStarted(this);
    }
  }
  cancel() {
    if (this.state == VisitState.started) {
      if (this.request) {
        this.request.cancel();
      }
      this.cancelRender();
      this.state = VisitState.canceled;
    }
  }
  complete() {
    if (this.state == VisitState.started) {
      this.recordTimingMetric(TimingMetric.visitEnd);
      this.state = VisitState.completed;
      this.followRedirect();
      if (!this.followedRedirect) {
        this.adapter.visitCompleted(this);
        this.delegate.visitCompleted(this);
      }
    }
  }
  fail() {
    if (this.state == VisitState.started) {
      this.state = VisitState.failed;
      this.adapter.visitFailed(this);
    }
  }
  changeHistory() {
    var _a;
    if (!this.historyChanged && this.updateHistory) {
      const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
      const method = getHistoryMethodForAction(actionForHistory);
      this.history.update(method, this.location, this.restorationIdentifier);
      this.historyChanged = true;
    }
  }
  issueRequest() {
    if (this.hasPreloadedResponse()) {
      this.simulateRequest();
    } else if (this.shouldIssueRequest() && !this.request) {
      this.request = new FetchRequest(this, FetchMethod.get, this.location);
      this.request.perform();
    }
  }
  simulateRequest() {
    if (this.response) {
      this.startRequest();
      this.recordResponse();
      this.finishRequest();
    }
  }
  startRequest() {
    this.recordTimingMetric(TimingMetric.requestStart);
    this.adapter.visitRequestStarted(this);
  }
  recordResponse(response = this.response) {
    this.response = response;
    if (response) {
      const { statusCode } = response;
      if (isSuccessful(statusCode)) {
        this.adapter.visitRequestCompleted(this);
      } else {
        this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
      }
    }
  }
  finishRequest() {
    this.recordTimingMetric(TimingMetric.requestEnd);
    this.adapter.visitRequestFinished(this);
  }
  loadResponse() {
    if (this.response) {
      const { statusCode, responseHTML } = this.response;
      this.render(async () => {
        if (this.shouldCacheSnapshot)
          this.cacheSnapshot();
        if (this.view.renderPromise)
          await this.view.renderPromise;
        if (isSuccessful(statusCode) && responseHTML != null) {
          await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML), false, this.willRender, this);
          this.performScroll();
          this.adapter.visitRendered(this);
          this.complete();
        } else {
          await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
          this.adapter.visitRendered(this);
          this.fail();
        }
      });
    }
  }
  getCachedSnapshot() {
    const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
    if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
      if (this.action == "restore" || snapshot.isPreviewable) {
        return snapshot;
      }
    }
  }
  getPreloadedSnapshot() {
    if (this.snapshotHTML) {
      return PageSnapshot.fromHTMLString(this.snapshotHTML);
    }
  }
  hasCachedSnapshot() {
    return this.getCachedSnapshot() != null;
  }
  loadCachedSnapshot() {
    const snapshot = this.getCachedSnapshot();
    if (snapshot) {
      const isPreview = this.shouldIssueRequest();
      this.render(async () => {
        this.cacheSnapshot();
        if (this.isSamePage) {
          this.adapter.visitRendered(this);
        } else {
          if (this.view.renderPromise)
            await this.view.renderPromise;
          await this.view.renderPage(snapshot, isPreview, this.willRender, this);
          this.performScroll();
          this.adapter.visitRendered(this);
          if (!isPreview) {
            this.complete();
          }
        }
      });
    }
  }
  followRedirect() {
    var _a;
    if (this.redirectedToLocation && !this.followedRedirect && ((_a = this.response) === null || _a === void 0 ? void 0 : _a.redirected)) {
      this.adapter.visitProposedToLocation(this.redirectedToLocation, {
        action: "replace",
        response: this.response,
        shouldCacheSnapshot: false,
        willRender: false
      });
      this.followedRedirect = true;
    }
  }
  goToSamePageAnchor() {
    if (this.isSamePage) {
      this.render(async () => {
        this.cacheSnapshot();
        this.performScroll();
        this.changeHistory();
        this.adapter.visitRendered(this);
      });
    }
  }
  prepareRequest(request) {
    if (this.acceptsStreamResponse) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted() {
    this.startRequest();
  }
  requestPreventedHandlingResponse(_request, _response) {
  }
  async requestSucceededWithResponse(request, response) {
    const responseHTML = await response.responseHTML;
    const { redirected, statusCode } = response;
    if (responseHTML == void 0) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch,
        redirected
      });
    } else {
      this.redirectedToLocation = response.redirected ? response.location : void 0;
      this.recordResponse({ statusCode, responseHTML, redirected });
    }
  }
  async requestFailedWithResponse(request, response) {
    const responseHTML = await response.responseHTML;
    const { redirected, statusCode } = response;
    if (responseHTML == void 0) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch,
        redirected
      });
    } else {
      this.recordResponse({ statusCode, responseHTML, redirected });
    }
  }
  requestErrored(_request, _error) {
    this.recordResponse({
      statusCode: SystemStatusCode.networkFailure,
      redirected: false
    });
  }
  requestFinished() {
    this.finishRequest();
  }
  performScroll() {
    if (!this.scrolled && !this.view.forceReloaded) {
      if (this.action == "restore") {
        this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
      } else {
        this.scrollToAnchor() || this.view.scrollToTop();
      }
      if (this.isSamePage) {
        this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
      }
      this.scrolled = true;
    }
  }
  scrollToRestoredPosition() {
    const { scrollPosition } = this.restorationData;
    if (scrollPosition) {
      this.view.scrollToPosition(scrollPosition);
      return true;
    }
  }
  scrollToAnchor() {
    const anchor = getAnchor(this.location);
    if (anchor != null) {
      this.view.scrollToAnchor(anchor);
      return true;
    }
  }
  recordTimingMetric(metric) {
    this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
  }
  getTimingMetrics() {
    return Object.assign({}, this.timingMetrics);
  }
  getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  hasPreloadedResponse() {
    return typeof this.response == "object";
  }
  shouldIssueRequest() {
    if (this.isSamePage) {
      return false;
    } else if (this.action == "restore") {
      return !this.hasCachedSnapshot();
    } else {
      return this.willRender;
    }
  }
  cacheSnapshot() {
    if (!this.snapshotCached) {
      this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
      this.snapshotCached = true;
    }
  }
  async render(callback) {
    this.cancelRender();
    await new Promise((resolve) => {
      this.frame = requestAnimationFrame(() => resolve());
    });
    await callback();
    delete this.frame;
  }
  cancelRender() {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      delete this.frame;
    }
  }
};
function isSuccessful(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}
var BrowserAdapter = class {
  constructor(session2) {
    this.progressBar = new ProgressBar();
    this.showProgressBar = () => {
      this.progressBar.show();
    };
    this.session = session2;
  }
  visitProposedToLocation(location2, options) {
    this.navigator.startVisit(location2, (options === null || options === void 0 ? void 0 : options.restorationIdentifier) || uuid(), options);
  }
  visitStarted(visit2) {
    this.location = visit2.location;
    visit2.loadCachedSnapshot();
    visit2.issueRequest();
    visit2.goToSamePageAnchor();
  }
  visitRequestStarted(visit2) {
    this.progressBar.setValue(0);
    if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
      this.showVisitProgressBarAfterDelay();
    } else {
      this.showProgressBar();
    }
  }
  visitRequestCompleted(visit2) {
    visit2.loadResponse();
  }
  visitRequestFailedWithStatusCode(visit2, statusCode) {
    switch (statusCode) {
      case SystemStatusCode.networkFailure:
      case SystemStatusCode.timeoutFailure:
      case SystemStatusCode.contentTypeMismatch:
        return this.reload({
          reason: "request_failed",
          context: {
            statusCode
          }
        });
      default:
        return visit2.loadResponse();
    }
  }
  visitRequestFinished(_visit) {
    this.progressBar.setValue(1);
    this.hideVisitProgressBar();
  }
  visitCompleted(_visit) {
  }
  pageInvalidated(reason) {
    this.reload(reason);
  }
  visitFailed(_visit) {
  }
  visitRendered(_visit) {
  }
  formSubmissionStarted(_formSubmission) {
    this.progressBar.setValue(0);
    this.showFormProgressBarAfterDelay();
  }
  formSubmissionFinished(_formSubmission) {
    this.progressBar.setValue(1);
    this.hideFormProgressBar();
  }
  showVisitProgressBarAfterDelay() {
    this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
  }
  hideVisitProgressBar() {
    this.progressBar.hide();
    if (this.visitProgressBarTimeout != null) {
      window.clearTimeout(this.visitProgressBarTimeout);
      delete this.visitProgressBarTimeout;
    }
  }
  showFormProgressBarAfterDelay() {
    if (this.formProgressBarTimeout == null) {
      this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
  }
  hideFormProgressBar() {
    this.progressBar.hide();
    if (this.formProgressBarTimeout != null) {
      window.clearTimeout(this.formProgressBarTimeout);
      delete this.formProgressBarTimeout;
    }
  }
  reload(reason) {
    var _a;
    dispatch("turbo:reload", { detail: reason });
    window.location.href = ((_a = this.location) === null || _a === void 0 ? void 0 : _a.toString()) || window.location.href;
  }
  get navigator() {
    return this.session.navigator;
  }
};
var CacheObserver = class {
  constructor() {
    this.selector = "[data-turbo-temporary]";
    this.deprecatedSelector = "[data-turbo-cache=false]";
    this.started = false;
    this.removeTemporaryElements = (_event) => {
      for (const element of this.temporaryElements) {
        element.remove();
      }
    };
  }
  start() {
    if (!this.started) {
      this.started = true;
      addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
    }
  }
  get temporaryElements() {
    return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
  }
  get temporaryElementsWithDeprecation() {
    const elements = document.querySelectorAll(this.deprecatedSelector);
    if (elements.length) {
      console.warn(`The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`);
    }
    return [...elements];
  }
};
var FrameRedirector = class {
  constructor(session2, element) {
    this.session = session2;
    this.element = element;
    this.linkInterceptor = new LinkInterceptor(this, element);
    this.formSubmitObserver = new FormSubmitObserver(this, element);
  }
  start() {
    this.linkInterceptor.start();
    this.formSubmitObserver.start();
  }
  stop() {
    this.linkInterceptor.stop();
    this.formSubmitObserver.stop();
  }
  shouldInterceptLinkClick(element, _location, _event) {
    return this.shouldRedirect(element);
  }
  linkClickIntercepted(element, url, event) {
    const frame = this.findFrameElement(element);
    if (frame) {
      frame.delegate.linkClickIntercepted(element, url, event);
    }
  }
  willSubmitForm(element, submitter) {
    return element.closest("turbo-frame") == null && this.shouldSubmit(element, submitter) && this.shouldRedirect(element, submitter);
  }
  formSubmitted(element, submitter) {
    const frame = this.findFrameElement(element, submitter);
    if (frame) {
      frame.delegate.formSubmitted(element, submitter);
    }
  }
  shouldSubmit(form, submitter) {
    var _a;
    const action = getAction(form, submitter);
    const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
    const rootLocation = expandURL((_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/");
    return this.shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
  }
  shouldRedirect(element, submitter) {
    const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
    if (isNavigatable) {
      const frame = this.findFrameElement(element, submitter);
      return frame ? frame != element.closest("turbo-frame") : false;
    } else {
      return false;
    }
  }
  findFrameElement(element, submitter) {
    const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
    if (id && id != "_top") {
      const frame = this.element.querySelector(`#${id}:not([disabled])`);
      if (frame instanceof FrameElement) {
        return frame;
      }
    }
  }
};
var History = class {
  constructor(delegate2) {
    this.restorationIdentifier = uuid();
    this.restorationData = {};
    this.started = false;
    this.pageLoaded = false;
    this.onPopState = (event) => {
      if (this.shouldHandlePopState()) {
        const { turbo } = event.state || {};
        if (turbo) {
          this.location = new URL(window.location.href);
          const { restorationIdentifier } = turbo;
          this.restorationIdentifier = restorationIdentifier;
          this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
        }
      }
    };
    this.onPageLoad = async (_event) => {
      await nextMicrotask();
      this.pageLoaded = true;
    };
    this.delegate = delegate2;
  }
  start() {
    if (!this.started) {
      addEventListener("popstate", this.onPopState, false);
      addEventListener("load", this.onPageLoad, false);
      this.started = true;
      this.replace(new URL(window.location.href));
    }
  }
  stop() {
    if (this.started) {
      removeEventListener("popstate", this.onPopState, false);
      removeEventListener("load", this.onPageLoad, false);
      this.started = false;
    }
  }
  push(location2, restorationIdentifier) {
    this.update(history.pushState, location2, restorationIdentifier);
  }
  replace(location2, restorationIdentifier) {
    this.update(history.replaceState, location2, restorationIdentifier);
  }
  update(method, location2, restorationIdentifier = uuid()) {
    const state = { turbo: { restorationIdentifier } };
    method.call(history, state, "", location2.href);
    this.location = location2;
    this.restorationIdentifier = restorationIdentifier;
  }
  getRestorationDataForIdentifier(restorationIdentifier) {
    return this.restorationData[restorationIdentifier] || {};
  }
  updateRestorationData(additionalData) {
    const { restorationIdentifier } = this;
    const restorationData = this.restorationData[restorationIdentifier];
    this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
  }
  assumeControlOfScrollRestoration() {
    var _a;
    if (!this.previousScrollRestoration) {
      this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
      history.scrollRestoration = "manual";
    }
  }
  relinquishControlOfScrollRestoration() {
    if (this.previousScrollRestoration) {
      history.scrollRestoration = this.previousScrollRestoration;
      delete this.previousScrollRestoration;
    }
  }
  shouldHandlePopState() {
    return this.pageIsLoaded();
  }
  pageIsLoaded() {
    return this.pageLoaded || document.readyState == "complete";
  }
};
var Navigator = class {
  constructor(delegate2) {
    this.delegate = delegate2;
  }
  proposeVisit(location2, options = {}) {
    if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
      if (locationIsVisitable(location2, this.view.snapshot.rootLocation)) {
        this.delegate.visitProposedToLocation(location2, options);
      } else {
        window.location.href = location2.toString();
      }
    }
  }
  startVisit(locatable, restorationIdentifier, options = {}) {
    this.stop();
    this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({ referrer: this.location }, options));
    this.currentVisit.start();
  }
  submitForm(form, submitter) {
    this.stop();
    this.formSubmission = new FormSubmission(this, form, submitter, true);
    this.formSubmission.start();
  }
  stop() {
    if (this.formSubmission) {
      this.formSubmission.stop();
      delete this.formSubmission;
    }
    if (this.currentVisit) {
      this.currentVisit.cancel();
      delete this.currentVisit;
    }
  }
  get adapter() {
    return this.delegate.adapter;
  }
  get view() {
    return this.delegate.view;
  }
  get history() {
    return this.delegate.history;
  }
  formSubmissionStarted(formSubmission) {
    if (typeof this.adapter.formSubmissionStarted === "function") {
      this.adapter.formSubmissionStarted(formSubmission);
    }
  }
  async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
    if (formSubmission == this.formSubmission) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const shouldCacheSnapshot = formSubmission.isSafe;
        if (!shouldCacheSnapshot) {
          this.view.clearSnapshotCache();
        }
        const { statusCode, redirected } = fetchResponse;
        const action = this.getActionForFormSubmission(formSubmission);
        const visitOptions = {
          action,
          shouldCacheSnapshot,
          response: { statusCode, responseHTML, redirected }
        };
        this.proposeVisit(fetchResponse.location, visitOptions);
      }
    }
  }
  async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    const responseHTML = await fetchResponse.responseHTML;
    if (responseHTML) {
      const snapshot = PageSnapshot.fromHTMLString(responseHTML);
      if (fetchResponse.serverError) {
        await this.view.renderError(snapshot, this.currentVisit);
      } else {
        await this.view.renderPage(snapshot, false, true, this.currentVisit);
      }
      this.view.scrollToTop();
      this.view.clearSnapshotCache();
    }
  }
  formSubmissionErrored(formSubmission, error2) {
    console.error(error2);
  }
  formSubmissionFinished(formSubmission) {
    if (typeof this.adapter.formSubmissionFinished === "function") {
      this.adapter.formSubmissionFinished(formSubmission);
    }
  }
  visitStarted(visit2) {
    this.delegate.visitStarted(visit2);
  }
  visitCompleted(visit2) {
    this.delegate.visitCompleted(visit2);
  }
  locationWithActionIsSamePage(location2, action) {
    const anchor = getAnchor(location2);
    const currentAnchor = getAnchor(this.view.lastRenderedLocation);
    const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
    return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
  }
  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
  }
  get location() {
    return this.history.location;
  }
  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }
  getActionForFormSubmission({ submitter, formElement }) {
    return getVisitAction(submitter, formElement) || "advance";
  }
};
var PageStage;
(function(PageStage2) {
  PageStage2[PageStage2["initial"] = 0] = "initial";
  PageStage2[PageStage2["loading"] = 1] = "loading";
  PageStage2[PageStage2["interactive"] = 2] = "interactive";
  PageStage2[PageStage2["complete"] = 3] = "complete";
})(PageStage || (PageStage = {}));
var PageObserver = class {
  constructor(delegate2) {
    this.stage = PageStage.initial;
    this.started = false;
    this.interpretReadyState = () => {
      const { readyState } = this;
      if (readyState == "interactive") {
        this.pageIsInteractive();
      } else if (readyState == "complete") {
        this.pageIsComplete();
      }
    };
    this.pageWillUnload = () => {
      this.delegate.pageWillUnload();
    };
    this.delegate = delegate2;
  }
  start() {
    if (!this.started) {
      if (this.stage == PageStage.initial) {
        this.stage = PageStage.loading;
      }
      document.addEventListener("readystatechange", this.interpretReadyState, false);
      addEventListener("pagehide", this.pageWillUnload, false);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      document.removeEventListener("readystatechange", this.interpretReadyState, false);
      removeEventListener("pagehide", this.pageWillUnload, false);
      this.started = false;
    }
  }
  pageIsInteractive() {
    if (this.stage == PageStage.loading) {
      this.stage = PageStage.interactive;
      this.delegate.pageBecameInteractive();
    }
  }
  pageIsComplete() {
    this.pageIsInteractive();
    if (this.stage == PageStage.interactive) {
      this.stage = PageStage.complete;
      this.delegate.pageLoaded();
    }
  }
  get readyState() {
    return document.readyState;
  }
};
var ScrollObserver = class {
  constructor(delegate2) {
    this.started = false;
    this.onScroll = () => {
      this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
    };
    this.delegate = delegate2;
  }
  start() {
    if (!this.started) {
      addEventListener("scroll", this.onScroll, false);
      this.onScroll();
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      removeEventListener("scroll", this.onScroll, false);
      this.started = false;
    }
  }
  updatePosition(position) {
    this.delegate.scrollPositionChanged(position);
  }
};
var StreamMessageRenderer = class {
  render({ fragment }) {
    Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => document.documentElement.appendChild(fragment));
  }
  enteringBardo(currentPermanentElement, newPermanentElement) {
    newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
  }
  leavingBardo() {
  }
};
function getPermanentElementMapForFragment(fragment) {
  const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
  const permanentElementMap = {};
  for (const permanentElementInDocument of permanentElementsInDocument) {
    const { id } = permanentElementInDocument;
    for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
      const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
      if (elementInStream) {
        permanentElementMap[id] = [permanentElementInDocument, elementInStream];
      }
    }
  }
  return permanentElementMap;
}
var StreamObserver = class {
  constructor(delegate2) {
    this.sources = /* @__PURE__ */ new Set();
    this.started = false;
    this.inspectFetchResponse = (event) => {
      const response = fetchResponseFromEvent(event);
      if (response && fetchResponseIsStream(response)) {
        event.preventDefault();
        this.receiveMessageResponse(response);
      }
    };
    this.receiveMessageEvent = (event) => {
      if (this.started && typeof event.data == "string") {
        this.receiveMessageHTML(event.data);
      }
    };
    this.delegate = delegate2;
  }
  start() {
    if (!this.started) {
      this.started = true;
      addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }
  connectStreamSource(source) {
    if (!this.streamSourceIsConnected(source)) {
      this.sources.add(source);
      source.addEventListener("message", this.receiveMessageEvent, false);
    }
  }
  disconnectStreamSource(source) {
    if (this.streamSourceIsConnected(source)) {
      this.sources.delete(source);
      source.removeEventListener("message", this.receiveMessageEvent, false);
    }
  }
  streamSourceIsConnected(source) {
    return this.sources.has(source);
  }
  async receiveMessageResponse(response) {
    const html = await response.responseHTML;
    if (html) {
      this.receiveMessageHTML(html);
    }
  }
  receiveMessageHTML(html) {
    this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
  }
};
function fetchResponseFromEvent(event) {
  var _a;
  const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
  if (fetchResponse instanceof FetchResponse) {
    return fetchResponse;
  }
}
function fetchResponseIsStream(response) {
  var _a;
  const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
  return contentType.startsWith(StreamMessage.contentType);
}
var ErrorRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    const { documentElement, body } = document;
    documentElement.replaceChild(newElement, body);
  }
  async render() {
    this.replaceHeadAndBody();
    this.activateScriptElements();
  }
  replaceHeadAndBody() {
    const { documentElement, head } = document;
    documentElement.replaceChild(this.newHead, head);
    this.renderElement(this.currentElement, this.newElement);
  }
  activateScriptElements() {
    for (const replaceableElement of this.scriptElements) {
      const parentNode = replaceableElement.parentNode;
      if (parentNode) {
        const element = activateScriptElement(replaceableElement);
        parentNode.replaceChild(element, replaceableElement);
      }
    }
  }
  get newHead() {
    return this.newSnapshot.headSnapshot.element;
  }
  get scriptElements() {
    return document.documentElement.querySelectorAll("script");
  }
};
var PageRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    if (document.body && newElement instanceof HTMLBodyElement) {
      document.body.replaceWith(newElement);
    } else {
      document.documentElement.appendChild(newElement);
    }
  }
  get shouldRender() {
    return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
  }
  get reloadReason() {
    if (!this.newSnapshot.isVisitable) {
      return {
        reason: "turbo_visit_control_is_reload"
      };
    }
    if (!this.trackedElementsAreIdentical) {
      return {
        reason: "tracked_element_mismatch"
      };
    }
  }
  async prepareToRender() {
    await this.mergeHead();
  }
  async render() {
    if (this.willRender) {
      await this.replaceBody();
    }
  }
  finishRendering() {
    super.finishRendering();
    if (!this.isPreview) {
      this.focusFirstAutofocusableElement();
    }
  }
  get currentHeadSnapshot() {
    return this.currentSnapshot.headSnapshot;
  }
  get newHeadSnapshot() {
    return this.newSnapshot.headSnapshot;
  }
  get newElement() {
    return this.newSnapshot.element;
  }
  async mergeHead() {
    const mergedHeadElements = this.mergeProvisionalElements();
    const newStylesheetElements = this.copyNewHeadStylesheetElements();
    this.copyNewHeadScriptElements();
    await mergedHeadElements;
    await newStylesheetElements;
  }
  async replaceBody() {
    await this.preservingPermanentElements(async () => {
      this.activateNewBody();
      await this.assignNewBody();
    });
  }
  get trackedElementsAreIdentical() {
    return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
  }
  async copyNewHeadStylesheetElements() {
    const loadingElements = [];
    for (const element of this.newHeadStylesheetElements) {
      loadingElements.push(waitForLoad(element));
      document.head.appendChild(element);
    }
    await Promise.all(loadingElements);
  }
  copyNewHeadScriptElements() {
    for (const element of this.newHeadScriptElements) {
      document.head.appendChild(activateScriptElement(element));
    }
  }
  async mergeProvisionalElements() {
    const newHeadElements = [...this.newHeadProvisionalElements];
    for (const element of this.currentHeadProvisionalElements) {
      if (!this.isCurrentElementInElementList(element, newHeadElements)) {
        document.head.removeChild(element);
      }
    }
    for (const element of newHeadElements) {
      document.head.appendChild(element);
    }
  }
  isCurrentElementInElementList(element, elementList) {
    for (const [index, newElement] of elementList.entries()) {
      if (element.tagName == "TITLE") {
        if (newElement.tagName != "TITLE") {
          continue;
        }
        if (element.innerHTML == newElement.innerHTML) {
          elementList.splice(index, 1);
          return true;
        }
      }
      if (newElement.isEqualNode(element)) {
        elementList.splice(index, 1);
        return true;
      }
    }
    return false;
  }
  removeCurrentHeadProvisionalElements() {
    for (const element of this.currentHeadProvisionalElements) {
      document.head.removeChild(element);
    }
  }
  copyNewHeadProvisionalElements() {
    for (const element of this.newHeadProvisionalElements) {
      document.head.appendChild(element);
    }
  }
  activateNewBody() {
    document.adoptNode(this.newElement);
    this.activateNewBodyScriptElements();
  }
  activateNewBodyScriptElements() {
    for (const inertScriptElement of this.newBodyScriptElements) {
      const activatedScriptElement = activateScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }
  async assignNewBody() {
    await this.renderElement(this.currentElement, this.newElement);
  }
  get newHeadStylesheetElements() {
    return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
  }
  get newHeadScriptElements() {
    return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
  }
  get currentHeadProvisionalElements() {
    return this.currentHeadSnapshot.provisionalElements;
  }
  get newHeadProvisionalElements() {
    return this.newHeadSnapshot.provisionalElements;
  }
  get newBodyScriptElements() {
    return this.newElement.querySelectorAll("script");
  }
};
var SnapshotCache = class {
  constructor(size) {
    this.keys = [];
    this.snapshots = {};
    this.size = size;
  }
  has(location2) {
    return toCacheKey(location2) in this.snapshots;
  }
  get(location2) {
    if (this.has(location2)) {
      const snapshot = this.read(location2);
      this.touch(location2);
      return snapshot;
    }
  }
  put(location2, snapshot) {
    this.write(location2, snapshot);
    this.touch(location2);
    return snapshot;
  }
  clear() {
    this.snapshots = {};
  }
  read(location2) {
    return this.snapshots[toCacheKey(location2)];
  }
  write(location2, snapshot) {
    this.snapshots[toCacheKey(location2)] = snapshot;
  }
  touch(location2) {
    const key = toCacheKey(location2);
    const index = this.keys.indexOf(key);
    if (index > -1)
      this.keys.splice(index, 1);
    this.keys.unshift(key);
    this.trim();
  }
  trim() {
    for (const key of this.keys.splice(this.size)) {
      delete this.snapshots[key];
    }
  }
};
var PageView = class extends View {
  constructor() {
    super(...arguments);
    this.snapshotCache = new SnapshotCache(10);
    this.lastRenderedLocation = new URL(location.href);
    this.forceReloaded = false;
  }
  renderPage(snapshot, isPreview = false, willRender = true, visit2) {
    const renderer = new PageRenderer(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
    if (!renderer.shouldRender) {
      this.forceReloaded = true;
    } else {
      visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
    }
    return this.render(renderer);
  }
  renderError(snapshot, visit2) {
    visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
    const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
    return this.render(renderer);
  }
  clearSnapshotCache() {
    this.snapshotCache.clear();
  }
  async cacheSnapshot(snapshot = this.snapshot) {
    if (snapshot.isCacheable) {
      this.delegate.viewWillCacheSnapshot();
      const { lastRenderedLocation: location2 } = this;
      await nextEventLoopTick();
      const cachedSnapshot = snapshot.clone();
      this.snapshotCache.put(location2, cachedSnapshot);
      return cachedSnapshot;
    }
  }
  getCachedSnapshotForLocation(location2) {
    return this.snapshotCache.get(location2);
  }
  get snapshot() {
    return PageSnapshot.fromElement(this.element);
  }
};
var Preloader = class {
  constructor(delegate2) {
    this.selector = "a[data-turbo-preload]";
    this.delegate = delegate2;
  }
  get snapshotCache() {
    return this.delegate.navigator.view.snapshotCache;
  }
  start() {
    if (document.readyState === "loading") {
      return document.addEventListener("DOMContentLoaded", () => {
        this.preloadOnLoadLinksForView(document.body);
      });
    } else {
      this.preloadOnLoadLinksForView(document.body);
    }
  }
  preloadOnLoadLinksForView(element) {
    for (const link of element.querySelectorAll(this.selector)) {
      this.preloadURL(link);
    }
  }
  async preloadURL(link) {
    const location2 = new URL(link.href);
    if (this.snapshotCache.has(location2)) {
      return;
    }
    try {
      const response = await fetch(location2.toString(), { headers: { "VND.PREFETCH": "true", Accept: "text/html" } });
      const responseText = await response.text();
      const snapshot = PageSnapshot.fromHTMLString(responseText);
      this.snapshotCache.put(location2, snapshot);
    } catch (_) {
    }
  }
};
var Session = class {
  constructor() {
    this.navigator = new Navigator(this);
    this.history = new History(this);
    this.preloader = new Preloader(this);
    this.view = new PageView(this, document.documentElement);
    this.adapter = new BrowserAdapter(this);
    this.pageObserver = new PageObserver(this);
    this.cacheObserver = new CacheObserver();
    this.linkClickObserver = new LinkClickObserver(this, window);
    this.formSubmitObserver = new FormSubmitObserver(this, document);
    this.scrollObserver = new ScrollObserver(this);
    this.streamObserver = new StreamObserver(this);
    this.formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
    this.frameRedirector = new FrameRedirector(this, document.documentElement);
    this.streamMessageRenderer = new StreamMessageRenderer();
    this.drive = true;
    this.enabled = true;
    this.progressBarDelay = 500;
    this.started = false;
    this.formMode = "on";
  }
  start() {
    if (!this.started) {
      this.pageObserver.start();
      this.cacheObserver.start();
      this.formLinkClickObserver.start();
      this.linkClickObserver.start();
      this.formSubmitObserver.start();
      this.scrollObserver.start();
      this.streamObserver.start();
      this.frameRedirector.start();
      this.history.start();
      this.preloader.start();
      this.started = true;
      this.enabled = true;
    }
  }
  disable() {
    this.enabled = false;
  }
  stop() {
    if (this.started) {
      this.pageObserver.stop();
      this.cacheObserver.stop();
      this.formLinkClickObserver.stop();
      this.linkClickObserver.stop();
      this.formSubmitObserver.stop();
      this.scrollObserver.stop();
      this.streamObserver.stop();
      this.frameRedirector.stop();
      this.history.stop();
      this.started = false;
    }
  }
  registerAdapter(adapter) {
    this.adapter = adapter;
  }
  visit(location2, options = {}) {
    const frameElement = options.frame ? document.getElementById(options.frame) : null;
    if (frameElement instanceof FrameElement) {
      frameElement.src = location2.toString();
      frameElement.loaded;
    } else {
      this.navigator.proposeVisit(expandURL(location2), options);
    }
  }
  connectStreamSource(source) {
    this.streamObserver.connectStreamSource(source);
  }
  disconnectStreamSource(source) {
    this.streamObserver.disconnectStreamSource(source);
  }
  renderStreamMessage(message) {
    this.streamMessageRenderer.render(StreamMessage.wrap(message));
  }
  clearCache() {
    this.view.clearSnapshotCache();
  }
  setProgressBarDelay(delay) {
    this.progressBarDelay = delay;
  }
  setFormMode(mode) {
    this.formMode = mode;
  }
  get location() {
    return this.history.location;
  }
  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }
  historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
    if (this.enabled) {
      this.navigator.startVisit(location2, restorationIdentifier, {
        action: "restore",
        historyChanged: true
      });
    } else {
      this.adapter.pageInvalidated({
        reason: "turbo_disabled"
      });
    }
  }
  scrollPositionChanged(position) {
    this.history.updateRestorationData({ scrollPosition: position });
  }
  willSubmitFormLinkToLocation(link, location2) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
  }
  submittedFormLinkToLocation() {
  }
  willFollowLinkToLocation(link, location2, event) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
  }
  followedLinkToLocation(link, location2) {
    const action = this.getActionForLink(link);
    const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
    this.visit(location2.href, { action, acceptsStreamResponse });
  }
  allowsVisitingLocationWithAction(location2, action) {
    return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
  }
  visitProposedToLocation(location2, options) {
    extendURLWithDeprecatedProperties(location2);
    this.adapter.visitProposedToLocation(location2, options);
  }
  visitStarted(visit2) {
    if (!visit2.acceptsStreamResponse) {
      markAsBusy(document.documentElement);
    }
    extendURLWithDeprecatedProperties(visit2.location);
    if (!visit2.silent) {
      this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
    }
  }
  visitCompleted(visit2) {
    clearBusyState(document.documentElement);
    this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
  }
  locationWithActionIsSamePage(location2, action) {
    return this.navigator.locationWithActionIsSamePage(location2, action);
  }
  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
  }
  willSubmitForm(form, submitter) {
    const action = getAction(form, submitter);
    return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
  }
  formSubmitted(form, submitter) {
    this.navigator.submitForm(form, submitter);
  }
  pageBecameInteractive() {
    this.view.lastRenderedLocation = this.location;
    this.notifyApplicationAfterPageLoad();
  }
  pageLoaded() {
    this.history.assumeControlOfScrollRestoration();
  }
  pageWillUnload() {
    this.history.relinquishControlOfScrollRestoration();
  }
  receivedMessageFromStream(message) {
    this.renderStreamMessage(message);
  }
  viewWillCacheSnapshot() {
    var _a;
    if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
      this.notifyApplicationBeforeCachingSnapshot();
    }
  }
  allowsImmediateRender({ element }, options) {
    const event = this.notifyApplicationBeforeRender(element, options);
    const { defaultPrevented, detail: { render } } = event;
    if (this.view.renderer && render) {
      this.view.renderer.renderElement = render;
    }
    return !defaultPrevented;
  }
  viewRenderedSnapshot(_snapshot, _isPreview) {
    this.view.lastRenderedLocation = this.history.location;
    this.notifyApplicationAfterRender();
  }
  preloadOnLoadLinksForView(element) {
    this.preloader.preloadOnLoadLinksForView(element);
  }
  viewInvalidated(reason) {
    this.adapter.pageInvalidated(reason);
  }
  frameLoaded(frame) {
    this.notifyApplicationAfterFrameLoad(frame);
  }
  frameRendered(fetchResponse, frame) {
    this.notifyApplicationAfterFrameRender(fetchResponse, frame);
  }
  applicationAllowsFollowingLinkToLocation(link, location2, ev) {
    const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
    return !event.defaultPrevented;
  }
  applicationAllowsVisitingLocation(location2) {
    const event = this.notifyApplicationBeforeVisitingLocation(location2);
    return !event.defaultPrevented;
  }
  notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
    return dispatch("turbo:click", {
      target: link,
      detail: { url: location2.href, originalEvent: event },
      cancelable: true
    });
  }
  notifyApplicationBeforeVisitingLocation(location2) {
    return dispatch("turbo:before-visit", {
      detail: { url: location2.href },
      cancelable: true
    });
  }
  notifyApplicationAfterVisitingLocation(location2, action) {
    return dispatch("turbo:visit", { detail: { url: location2.href, action } });
  }
  notifyApplicationBeforeCachingSnapshot() {
    return dispatch("turbo:before-cache");
  }
  notifyApplicationBeforeRender(newBody, options) {
    return dispatch("turbo:before-render", {
      detail: Object.assign({ newBody }, options),
      cancelable: true
    });
  }
  notifyApplicationAfterRender() {
    return dispatch("turbo:render");
  }
  notifyApplicationAfterPageLoad(timing = {}) {
    return dispatch("turbo:load", {
      detail: { url: this.location.href, timing }
    });
  }
  notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
    dispatchEvent(new HashChangeEvent("hashchange", {
      oldURL: oldURL.toString(),
      newURL: newURL.toString()
    }));
  }
  notifyApplicationAfterFrameLoad(frame) {
    return dispatch("turbo:frame-load", { target: frame });
  }
  notifyApplicationAfterFrameRender(fetchResponse, frame) {
    return dispatch("turbo:frame-render", {
      detail: { fetchResponse },
      target: frame,
      cancelable: true
    });
  }
  submissionIsNavigatable(form, submitter) {
    if (this.formMode == "off") {
      return false;
    } else {
      const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
      if (this.formMode == "optin") {
        return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
      } else {
        return submitterIsNavigatable && this.elementIsNavigatable(form);
      }
    }
  }
  elementIsNavigatable(element) {
    const container = findClosestRecursively(element, "[data-turbo]");
    const withinFrame = findClosestRecursively(element, "turbo-frame");
    if (this.drive || withinFrame) {
      if (container) {
        return container.getAttribute("data-turbo") != "false";
      } else {
        return true;
      }
    } else {
      if (container) {
        return container.getAttribute("data-turbo") == "true";
      } else {
        return false;
      }
    }
  }
  getActionForLink(link) {
    return getVisitAction(link) || "advance";
  }
  get snapshot() {
    return this.view.snapshot;
  }
};
function extendURLWithDeprecatedProperties(url) {
  Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
}
var deprecatedLocationPropertyDescriptors = {
  absoluteURL: {
    get() {
      return this.toString();
    }
  }
};
var Cache = class {
  constructor(session2) {
    this.session = session2;
  }
  clear() {
    this.session.clearCache();
  }
  resetCacheControl() {
    this.setCacheControl("");
  }
  exemptPageFromCache() {
    this.setCacheControl("no-cache");
  }
  exemptPageFromPreview() {
    this.setCacheControl("no-preview");
  }
  setCacheControl(value) {
    setMetaContent("turbo-cache-control", value);
  }
};
var StreamActions = {
  after() {
    this.targetElements.forEach((e) => {
      var _a;
      return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
    });
  },
  append() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach((e) => e.append(this.templateContent));
  },
  before() {
    this.targetElements.forEach((e) => {
      var _a;
      return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
    });
  },
  prepend() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach((e) => e.prepend(this.templateContent));
  },
  remove() {
    this.targetElements.forEach((e) => e.remove());
  },
  replace() {
    this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
  },
  update() {
    this.targetElements.forEach((targetElement) => {
      targetElement.innerHTML = "";
      targetElement.append(this.templateContent);
    });
  }
};
var session = new Session();
var cache = new Cache(session);
var { navigator: navigator$1 } = session;
function start() {
  session.start();
}
function registerAdapter(adapter) {
  session.registerAdapter(adapter);
}
function visit(location2, options) {
  session.visit(location2, options);
}
function connectStreamSource(source) {
  session.connectStreamSource(source);
}
function disconnectStreamSource(source) {
  session.disconnectStreamSource(source);
}
function renderStreamMessage(message) {
  session.renderStreamMessage(message);
}
function clearCache() {
  console.warn("Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`");
  session.clearCache();
}
function setProgressBarDelay(delay) {
  session.setProgressBarDelay(delay);
}
function setConfirmMethod(confirmMethod) {
  FormSubmission.confirmMethod = confirmMethod;
}
function setFormMode(mode) {
  session.setFormMode(mode);
}
var Turbo = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  navigator: navigator$1,
  session,
  cache,
  PageRenderer,
  PageSnapshot,
  FrameRenderer,
  start,
  registerAdapter,
  visit,
  connectStreamSource,
  disconnectStreamSource,
  renderStreamMessage,
  clearCache,
  setProgressBarDelay,
  setConfirmMethod,
  setFormMode,
  StreamActions
});
var TurboFrameMissingError = class extends Error {
};
var FrameController = class {
  constructor(element) {
    this.fetchResponseLoaded = (_fetchResponse) => {
    };
    this.currentFetchRequest = null;
    this.resolveVisitPromise = () => {
    };
    this.connected = false;
    this.hasBeenLoaded = false;
    this.ignoredAttributes = /* @__PURE__ */ new Set();
    this.action = null;
    this.visitCachedSnapshot = ({ element: element2 }) => {
      const frame = element2.querySelector("#" + this.element.id);
      if (frame && this.previousFrameElement) {
        frame.replaceChildren(...this.previousFrameElement.children);
      }
      delete this.previousFrameElement;
    };
    this.element = element;
    this.view = new FrameView(this, this.element);
    this.appearanceObserver = new AppearanceObserver(this, this.element);
    this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
    this.linkInterceptor = new LinkInterceptor(this, this.element);
    this.restorationIdentifier = uuid();
    this.formSubmitObserver = new FormSubmitObserver(this, this.element);
  }
  connect() {
    if (!this.connected) {
      this.connected = true;
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.loadSourceURL();
      }
      this.formLinkClickObserver.start();
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
  }
  disconnect() {
    if (this.connected) {
      this.connected = false;
      this.appearanceObserver.stop();
      this.formLinkClickObserver.stop();
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
  }
  disabledChanged() {
    if (this.loadingStyle == FrameLoadingStyle.eager) {
      this.loadSourceURL();
    }
  }
  sourceURLChanged() {
    if (this.isIgnoringChangesTo("src"))
      return;
    if (this.element.isConnected) {
      this.complete = false;
    }
    if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
      this.loadSourceURL();
    }
  }
  sourceURLReloaded() {
    const { src } = this.element;
    this.ignoringChangesToAttribute("complete", () => {
      this.element.removeAttribute("complete");
    });
    this.element.src = null;
    this.element.src = src;
    return this.element.loaded;
  }
  completeChanged() {
    if (this.isIgnoringChangesTo("complete"))
      return;
    this.loadSourceURL();
  }
  loadingStyleChanged() {
    if (this.loadingStyle == FrameLoadingStyle.lazy) {
      this.appearanceObserver.start();
    } else {
      this.appearanceObserver.stop();
      this.loadSourceURL();
    }
  }
  async loadSourceURL() {
    if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
      this.element.loaded = this.visit(expandURL(this.sourceURL));
      this.appearanceObserver.stop();
      await this.element.loaded;
      this.hasBeenLoaded = true;
    }
  }
  async loadResponse(fetchResponse) {
    if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
      this.sourceURL = fetchResponse.response.url;
    }
    try {
      const html = await fetchResponse.responseHTML;
      if (html) {
        const document2 = parseHTMLDocument(html);
        const pageSnapshot = PageSnapshot.fromDocument(document2);
        if (pageSnapshot.isVisitable) {
          await this.loadFrameResponse(fetchResponse, document2);
        } else {
          await this.handleUnvisitableFrameResponse(fetchResponse);
        }
      }
    } finally {
      this.fetchResponseLoaded = () => {
      };
    }
  }
  elementAppearedInViewport(element) {
    this.proposeVisitIfNavigatedWithAction(element, element);
    this.loadSourceURL();
  }
  willSubmitFormLinkToLocation(link) {
    return this.shouldInterceptNavigation(link);
  }
  submittedFormLinkToLocation(link, _location, form) {
    const frame = this.findFrameElement(link);
    if (frame)
      form.setAttribute("data-turbo-frame", frame.id);
  }
  shouldInterceptLinkClick(element, _location, _event) {
    return this.shouldInterceptNavigation(element);
  }
  linkClickIntercepted(element, location2) {
    this.navigateFrame(element, location2);
  }
  willSubmitForm(element, submitter) {
    return element.closest("turbo-frame") == this.element && this.shouldInterceptNavigation(element, submitter);
  }
  formSubmitted(element, submitter) {
    if (this.formSubmission) {
      this.formSubmission.stop();
    }
    this.formSubmission = new FormSubmission(this, element, submitter);
    const { fetchRequest } = this.formSubmission;
    this.prepareRequest(fetchRequest);
    this.formSubmission.start();
  }
  prepareRequest(request) {
    var _a;
    request.headers["Turbo-Frame"] = this.id;
    if ((_a = this.currentNavigationElement) === null || _a === void 0 ? void 0 : _a.hasAttribute("data-turbo-stream")) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted(_request) {
    markAsBusy(this.element);
  }
  requestPreventedHandlingResponse(_request, _response) {
    this.resolveVisitPromise();
  }
  async requestSucceededWithResponse(request, response) {
    await this.loadResponse(response);
    this.resolveVisitPromise();
  }
  async requestFailedWithResponse(request, response) {
    await this.loadResponse(response);
    this.resolveVisitPromise();
  }
  requestErrored(request, error2) {
    console.error(error2);
    this.resolveVisitPromise();
  }
  requestFinished(_request) {
    clearBusyState(this.element);
  }
  formSubmissionStarted({ formElement }) {
    markAsBusy(formElement, this.findFrameElement(formElement));
  }
  formSubmissionSucceededWithResponse(formSubmission, response) {
    const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
    frame.delegate.loadResponse(response);
    if (!formSubmission.isSafe) {
      session.clearCache();
    }
  }
  formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    this.element.delegate.loadResponse(fetchResponse);
    session.clearCache();
  }
  formSubmissionErrored(formSubmission, error2) {
    console.error(error2);
  }
  formSubmissionFinished({ formElement }) {
    clearBusyState(formElement, this.findFrameElement(formElement));
  }
  allowsImmediateRender({ element: newFrame }, options) {
    const event = dispatch("turbo:before-frame-render", {
      target: this.element,
      detail: Object.assign({ newFrame }, options),
      cancelable: true
    });
    const { defaultPrevented, detail: { render } } = event;
    if (this.view.renderer && render) {
      this.view.renderer.renderElement = render;
    }
    return !defaultPrevented;
  }
  viewRenderedSnapshot(_snapshot, _isPreview) {
  }
  preloadOnLoadLinksForView(element) {
    session.preloadOnLoadLinksForView(element);
  }
  viewInvalidated() {
  }
  willRenderFrame(currentElement, _newElement) {
    this.previousFrameElement = currentElement.cloneNode(true);
  }
  async loadFrameResponse(fetchResponse, document2) {
    const newFrameElement = await this.extractForeignFrameElement(document2.body);
    if (newFrameElement) {
      const snapshot = new Snapshot(newFrameElement);
      const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
      if (this.view.renderPromise)
        await this.view.renderPromise;
      this.changeHistory();
      await this.view.render(renderer);
      this.complete = true;
      session.frameRendered(fetchResponse, this.element);
      session.frameLoaded(this.element);
      this.fetchResponseLoaded(fetchResponse);
    } else if (this.willHandleFrameMissingFromResponse(fetchResponse)) {
      this.handleFrameMissingFromResponse(fetchResponse);
    }
  }
  async visit(url) {
    var _a;
    const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
    (_a = this.currentFetchRequest) === null || _a === void 0 ? void 0 : _a.cancel();
    this.currentFetchRequest = request;
    return new Promise((resolve) => {
      this.resolveVisitPromise = () => {
        this.resolveVisitPromise = () => {
        };
        this.currentFetchRequest = null;
        resolve();
      };
      request.perform();
    });
  }
  navigateFrame(element, url, submitter) {
    const frame = this.findFrameElement(element, submitter);
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, element, submitter);
    this.withCurrentNavigationElement(element, () => {
      frame.src = url;
    });
  }
  proposeVisitIfNavigatedWithAction(frame, element, submitter) {
    this.action = getVisitAction(submitter, element, frame);
    if (this.action) {
      const pageSnapshot = PageSnapshot.fromElement(frame).clone();
      const { visitCachedSnapshot } = frame.delegate;
      frame.delegate.fetchResponseLoaded = (fetchResponse) => {
        if (frame.src) {
          const { statusCode, redirected } = fetchResponse;
          const responseHTML = frame.ownerDocument.documentElement.outerHTML;
          const response = { statusCode, redirected, responseHTML };
          const options = {
            response,
            visitCachedSnapshot,
            willRender: false,
            updateHistory: false,
            restorationIdentifier: this.restorationIdentifier,
            snapshot: pageSnapshot
          };
          if (this.action)
            options.action = this.action;
          session.visit(frame.src, options);
        }
      };
    }
  }
  changeHistory() {
    if (this.action) {
      const method = getHistoryMethodForAction(this.action);
      session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
    }
  }
  async handleUnvisitableFrameResponse(fetchResponse) {
    console.warn(`The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`);
    await this.visitResponse(fetchResponse.response);
  }
  willHandleFrameMissingFromResponse(fetchResponse) {
    this.element.setAttribute("complete", "");
    const response = fetchResponse.response;
    const visit2 = async (url, options = {}) => {
      if (url instanceof Response) {
        this.visitResponse(url);
      } else {
        session.visit(url, options);
      }
    };
    const event = dispatch("turbo:frame-missing", {
      target: this.element,
      detail: { response, visit: visit2 },
      cancelable: true
    });
    return !event.defaultPrevented;
  }
  handleFrameMissingFromResponse(fetchResponse) {
    this.view.missing();
    this.throwFrameMissingError(fetchResponse);
  }
  throwFrameMissingError(fetchResponse) {
    const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
    throw new TurboFrameMissingError(message);
  }
  async visitResponse(response) {
    const wrapped = new FetchResponse(response);
    const responseHTML = await wrapped.responseHTML;
    const { location: location2, redirected, statusCode } = wrapped;
    return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
  }
  findFrameElement(element, submitter) {
    var _a;
    const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
    return (_a = getFrameElementById(id)) !== null && _a !== void 0 ? _a : this.element;
  }
  async extractForeignFrameElement(container) {
    let element;
    const id = CSS.escape(this.id);
    try {
      element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
      if (element) {
        return element;
      }
      element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
      if (element) {
        await element.loaded;
        return await this.extractForeignFrameElement(element);
      }
    } catch (error2) {
      console.error(error2);
      return new FrameElement();
    }
    return null;
  }
  formActionIsVisitable(form, submitter) {
    const action = getAction(form, submitter);
    return locationIsVisitable(expandURL(action), this.rootLocation);
  }
  shouldInterceptNavigation(element, submitter) {
    const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
    if (element instanceof HTMLFormElement && !this.formActionIsVisitable(element, submitter)) {
      return false;
    }
    if (!this.enabled || id == "_top") {
      return false;
    }
    if (id) {
      const frameElement = getFrameElementById(id);
      if (frameElement) {
        return !frameElement.disabled;
      }
    }
    if (!session.elementIsNavigatable(element)) {
      return false;
    }
    if (submitter && !session.elementIsNavigatable(submitter)) {
      return false;
    }
    return true;
  }
  get id() {
    return this.element.id;
  }
  get enabled() {
    return !this.element.disabled;
  }
  get sourceURL() {
    if (this.element.src) {
      return this.element.src;
    }
  }
  set sourceURL(sourceURL) {
    this.ignoringChangesToAttribute("src", () => {
      this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
    });
  }
  get loadingStyle() {
    return this.element.loading;
  }
  get isLoading() {
    return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
  }
  get complete() {
    return this.element.hasAttribute("complete");
  }
  set complete(value) {
    this.ignoringChangesToAttribute("complete", () => {
      if (value) {
        this.element.setAttribute("complete", "");
      } else {
        this.element.removeAttribute("complete");
      }
    });
  }
  get isActive() {
    return this.element.isActive && this.connected;
  }
  get rootLocation() {
    var _a;
    const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
    const root = (_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/";
    return expandURL(root);
  }
  isIgnoringChangesTo(attributeName) {
    return this.ignoredAttributes.has(attributeName);
  }
  ignoringChangesToAttribute(attributeName, callback) {
    this.ignoredAttributes.add(attributeName);
    callback();
    this.ignoredAttributes.delete(attributeName);
  }
  withCurrentNavigationElement(element, callback) {
    this.currentNavigationElement = element;
    callback();
    delete this.currentNavigationElement;
  }
};
function getFrameElementById(id) {
  if (id != null) {
    const element = document.getElementById(id);
    if (element instanceof FrameElement) {
      return element;
    }
  }
}
function activateElement(element, currentURL) {
  if (element) {
    const src = element.getAttribute("src");
    if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
      throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
    }
    if (element.ownerDocument !== document) {
      element = document.importNode(element, true);
    }
    if (element instanceof FrameElement) {
      element.connectedCallback();
      element.disconnectedCallback();
      return element;
    }
  }
}
var StreamElement = class _StreamElement extends HTMLElement {
  static async renderElement(newElement) {
    await newElement.performAction();
  }
  async connectedCallback() {
    try {
      await this.render();
    } catch (error2) {
      console.error(error2);
    } finally {
      this.disconnect();
    }
  }
  async render() {
    var _a;
    return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
      const event = this.beforeRenderEvent;
      if (this.dispatchEvent(event)) {
        await nextAnimationFrame();
        await event.detail.render(this);
      }
    })();
  }
  disconnect() {
    try {
      this.remove();
    } catch (_a) {
    }
  }
  removeDuplicateTargetChildren() {
    this.duplicateChildren.forEach((c) => c.remove());
  }
  get duplicateChildren() {
    var _a;
    const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
    const newChildrenIds = [...((_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children) || []].filter((c) => !!c.id).map((c) => c.id);
    return existingChildren.filter((c) => newChildrenIds.includes(c.id));
  }
  get performAction() {
    if (this.action) {
      const actionFunction = StreamActions[this.action];
      if (actionFunction) {
        return actionFunction;
      }
      this.raise("unknown action");
    }
    this.raise("action attribute is missing");
  }
  get targetElements() {
    if (this.target) {
      return this.targetElementsById;
    } else if (this.targets) {
      return this.targetElementsByQuery;
    } else {
      this.raise("target or targets attribute is missing");
    }
  }
  get templateContent() {
    return this.templateElement.content.cloneNode(true);
  }
  get templateElement() {
    if (this.firstElementChild === null) {
      const template = this.ownerDocument.createElement("template");
      this.appendChild(template);
      return template;
    } else if (this.firstElementChild instanceof HTMLTemplateElement) {
      return this.firstElementChild;
    }
    this.raise("first child element must be a <template> element");
  }
  get action() {
    return this.getAttribute("action");
  }
  get target() {
    return this.getAttribute("target");
  }
  get targets() {
    return this.getAttribute("targets");
  }
  raise(message) {
    throw new Error(`${this.description}: ${message}`);
  }
  get description() {
    var _a, _b;
    return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
  }
  get beforeRenderEvent() {
    return new CustomEvent("turbo:before-stream-render", {
      bubbles: true,
      cancelable: true,
      detail: { newStream: this, render: _StreamElement.renderElement }
    });
  }
  get targetElementsById() {
    var _a;
    const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
    if (element !== null) {
      return [element];
    } else {
      return [];
    }
  }
  get targetElementsByQuery() {
    var _a;
    const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
    if (elements.length !== 0) {
      return Array.prototype.slice.call(elements);
    } else {
      return [];
    }
  }
};
var StreamSourceElement = class extends HTMLElement {
  constructor() {
    super(...arguments);
    this.streamSource = null;
  }
  connectedCallback() {
    this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
    connectStreamSource(this.streamSource);
  }
  disconnectedCallback() {
    if (this.streamSource) {
      disconnectStreamSource(this.streamSource);
    }
  }
  get src() {
    return this.getAttribute("src") || "";
  }
};
FrameElement.delegateConstructor = FrameController;
if (customElements.get("turbo-frame") === void 0) {
  customElements.define("turbo-frame", FrameElement);
}
if (customElements.get("turbo-stream") === void 0) {
  customElements.define("turbo-stream", StreamElement);
}
if (customElements.get("turbo-stream-source") === void 0) {
  customElements.define("turbo-stream-source", StreamSourceElement);
}
(() => {
  let element = document.currentScript;
  if (!element)
    return;
  if (element.hasAttribute("data-turbo-suppress-warning"))
    return;
  element = element.parentElement;
  while (element) {
    if (element == document.body) {
      return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
    }
    element = element.parentElement;
  }
})();
window.Turbo = Turbo;
start();

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
var consumer;
async function getConsumer() {
  return consumer || setConsumer(createConsumer2().then(setConsumer));
}
function setConsumer(newConsumer) {
  return consumer = newConsumer;
}
async function createConsumer2() {
  const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
  return createConsumer3();
}
async function subscribeTo(channel, mixin) {
  const { subscriptions } = await getConsumer();
  return subscriptions.create(channel, mixin);
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
function walk(obj) {
  if (!obj || typeof obj !== "object")
    return obj;
  if (obj instanceof Date || obj instanceof RegExp)
    return obj;
  if (Array.isArray(obj))
    return obj.map(walk);
  return Object.keys(obj).reduce(function(acc, key) {
    var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m2, x) {
      return "_" + x.toLowerCase();
    });
    acc[camel] = walk(obj[key]);
    return acc;
  }, {});
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
var TurboCableStreamSourceElement = class extends HTMLElement {
  async connectedCallback() {
    connectStreamSource(this);
    this.subscription = await subscribeTo(this.channel, {
      received: this.dispatchMessageEvent.bind(this),
      connected: this.subscriptionConnected.bind(this),
      disconnected: this.subscriptionDisconnected.bind(this)
    });
  }
  disconnectedCallback() {
    disconnectStreamSource(this);
    if (this.subscription)
      this.subscription.unsubscribe();
  }
  dispatchMessageEvent(data) {
    const event = new MessageEvent("message", { data });
    return this.dispatchEvent(event);
  }
  subscriptionConnected() {
    this.setAttribute("connected", "");
  }
  subscriptionDisconnected() {
    this.removeAttribute("connected");
  }
  get channel() {
    const channel = this.getAttribute("channel");
    const signed_stream_name = this.getAttribute("signed-stream-name");
    return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
  }
};
if (customElements.get("turbo-cable-stream-source") === void 0) {
  customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
function encodeMethodIntoRequestBody(event) {
  if (event.target instanceof HTMLFormElement) {
    const { target: form, detail: { fetchOptions } } = event;
    form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
      const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
      const method = determineFetchMethod(submitter, body, form);
      if (!/get/i.test(method)) {
        if (/post/i.test(method)) {
          body.delete("_method");
        } else {
          body.set("_method", method);
        }
        fetchOptions.method = "post";
      }
    }, { once: true });
  }
}
function determineFetchMethod(submitter, body, form) {
  const formMethod = determineFormMethod(submitter);
  const overrideMethod = body.get("_method");
  const method = form.getAttribute("method") || "get";
  if (typeof formMethod == "string") {
    return formMethod;
  } else if (typeof overrideMethod == "string") {
    return overrideMethod;
  } else {
    return method;
  }
}
function determineFormMethod(submitter) {
  if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
    if (submitter.hasAttribute("formmethod")) {
      return submitter.formMethod;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
function isBodyInit(body) {
  return body instanceof FormData || body instanceof URLSearchParams;
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

// node_modules/@hotwired/stimulus/dist/stimulus.js
var EventListener = class {
  constructor(eventTarget, eventName, eventOptions) {
    this.eventTarget = eventTarget;
    this.eventName = eventName;
    this.eventOptions = eventOptions;
    this.unorderedBindings = /* @__PURE__ */ new Set();
  }
  connect() {
    this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
  }
  disconnect() {
    this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
  }
  bindingConnected(binding) {
    this.unorderedBindings.add(binding);
  }
  bindingDisconnected(binding) {
    this.unorderedBindings.delete(binding);
  }
  handleEvent(event) {
    const extendedEvent = extendEvent(event);
    for (const binding of this.bindings) {
      if (extendedEvent.immediatePropagationStopped) {
        break;
      } else {
        binding.handleEvent(extendedEvent);
      }
    }
  }
  hasBindings() {
    return this.unorderedBindings.size > 0;
  }
  get bindings() {
    return Array.from(this.unorderedBindings).sort((left, right) => {
      const leftIndex = left.index, rightIndex = right.index;
      return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
    });
  }
};
function extendEvent(event) {
  if ("immediatePropagationStopped" in event) {
    return event;
  } else {
    const { stopImmediatePropagation } = event;
    return Object.assign(event, {
      immediatePropagationStopped: false,
      stopImmediatePropagation() {
        this.immediatePropagationStopped = true;
        stopImmediatePropagation.call(this);
      }
    });
  }
}
var Dispatcher = class {
  constructor(application2) {
    this.application = application2;
    this.eventListenerMaps = /* @__PURE__ */ new Map();
    this.started = false;
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.eventListeners.forEach((eventListener) => eventListener.connect());
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.eventListeners.forEach((eventListener) => eventListener.disconnect());
    }
  }
  get eventListeners() {
    return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
  }
  bindingConnected(binding) {
    this.fetchEventListenerForBinding(binding).bindingConnected(binding);
  }
  bindingDisconnected(binding, clearEventListeners = false) {
    this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
    if (clearEventListeners)
      this.clearEventListenersForBinding(binding);
  }
  handleError(error2, message, detail = {}) {
    this.application.handleError(error2, `Error ${message}`, detail);
  }
  clearEventListenersForBinding(binding) {
    const eventListener = this.fetchEventListenerForBinding(binding);
    if (!eventListener.hasBindings()) {
      eventListener.disconnect();
      this.removeMappedEventListenerFor(binding);
    }
  }
  removeMappedEventListenerFor(binding) {
    const { eventTarget, eventName, eventOptions } = binding;
    const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    const cacheKey = this.cacheKey(eventName, eventOptions);
    eventListenerMap.delete(cacheKey);
    if (eventListenerMap.size == 0)
      this.eventListenerMaps.delete(eventTarget);
  }
  fetchEventListenerForBinding(binding) {
    const { eventTarget, eventName, eventOptions } = binding;
    return this.fetchEventListener(eventTarget, eventName, eventOptions);
  }
  fetchEventListener(eventTarget, eventName, eventOptions) {
    const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    const cacheKey = this.cacheKey(eventName, eventOptions);
    let eventListener = eventListenerMap.get(cacheKey);
    if (!eventListener) {
      eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
      eventListenerMap.set(cacheKey, eventListener);
    }
    return eventListener;
  }
  createEventListener(eventTarget, eventName, eventOptions) {
    const eventListener = new EventListener(eventTarget, eventName, eventOptions);
    if (this.started) {
      eventListener.connect();
    }
    return eventListener;
  }
  fetchEventListenerMapForEventTarget(eventTarget) {
    let eventListenerMap = this.eventListenerMaps.get(eventTarget);
    if (!eventListenerMap) {
      eventListenerMap = /* @__PURE__ */ new Map();
      this.eventListenerMaps.set(eventTarget, eventListenerMap);
    }
    return eventListenerMap;
  }
  cacheKey(eventName, eventOptions) {
    const parts = [eventName];
    Object.keys(eventOptions).sort().forEach((key) => {
      parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
    });
    return parts.join(":");
  }
};
var defaultActionDescriptorFilters = {
  stop({ event, value }) {
    if (value)
      event.stopPropagation();
    return true;
  },
  prevent({ event, value }) {
    if (value)
      event.preventDefault();
    return true;
  },
  self({ event, value, element }) {
    if (value) {
      return element === event.target;
    } else {
      return true;
    }
  }
};
var descriptorPattern = /^(?:(?:([^.]+?)\+)?(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
function parseActionDescriptorString(descriptorString) {
  const source = descriptorString.trim();
  const matches2 = source.match(descriptorPattern) || [];
  let eventName = matches2[2];
  let keyFilter = matches2[3];
  if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
    eventName += `.${keyFilter}`;
    keyFilter = "";
  }
  return {
    eventTarget: parseEventTarget(matches2[4]),
    eventName,
    eventOptions: matches2[7] ? parseEventOptions(matches2[7]) : {},
    identifier: matches2[5],
    methodName: matches2[6],
    keyFilter: matches2[1] || keyFilter
  };
}
function parseEventTarget(eventTargetName) {
  if (eventTargetName == "window") {
    return window;
  } else if (eventTargetName == "document") {
    return document;
  }
}
function parseEventOptions(eventOptions) {
  return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
}
function stringifyEventTarget(eventTarget) {
  if (eventTarget == window) {
    return "window";
  } else if (eventTarget == document) {
    return "document";
  }
}
function camelize(value) {
  return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
}
function namespaceCamelize(value) {
  return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
}
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function dasherize(value) {
  return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
}
function tokenize(value) {
  return value.match(/[^\s]+/g) || [];
}
function isSomething(object) {
  return object !== null && object !== void 0;
}
function hasProperty(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}
var allModifiers = ["meta", "ctrl", "alt", "shift"];
var Action = class {
  constructor(element, index, descriptor, schema) {
    this.element = element;
    this.index = index;
    this.eventTarget = descriptor.eventTarget || element;
    this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
    this.eventOptions = descriptor.eventOptions || {};
    this.identifier = descriptor.identifier || error("missing identifier");
    this.methodName = descriptor.methodName || error("missing method name");
    this.keyFilter = descriptor.keyFilter || "";
    this.schema = schema;
  }
  static forToken(token, schema) {
    return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
  }
  toString() {
    const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
    const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
    return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
  }
  shouldIgnoreKeyboardEvent(event) {
    if (!this.keyFilter) {
      return false;
    }
    const filters = this.keyFilter.split("+");
    if (this.keyFilterDissatisfied(event, filters)) {
      return true;
    }
    const standardFilter = filters.filter((key) => !allModifiers.includes(key))[0];
    if (!standardFilter) {
      return false;
    }
    if (!hasProperty(this.keyMappings, standardFilter)) {
      error(`contains unknown key filter: ${this.keyFilter}`);
    }
    return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
  }
  shouldIgnoreMouseEvent(event) {
    if (!this.keyFilter) {
      return false;
    }
    const filters = [this.keyFilter];
    if (this.keyFilterDissatisfied(event, filters)) {
      return true;
    }
    return false;
  }
  get params() {
    const params = {};
    const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
    for (const { name, value } of Array.from(this.element.attributes)) {
      const match = name.match(pattern);
      const key = match && match[1];
      if (key) {
        params[camelize(key)] = typecast(value);
      }
    }
    return params;
  }
  get eventTargetName() {
    return stringifyEventTarget(this.eventTarget);
  }
  get keyMappings() {
    return this.schema.keyMappings;
  }
  keyFilterDissatisfied(event, filters) {
    const [meta, ctrl, alt, shift] = allModifiers.map((modifier) => filters.includes(modifier));
    return event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift;
  }
};
var defaultEventNames = {
  a: () => "click",
  button: () => "click",
  form: () => "submit",
  details: () => "toggle",
  input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
  select: () => "change",
  textarea: () => "input"
};
function getDefaultEventNameForElement(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName in defaultEventNames) {
    return defaultEventNames[tagName](element);
  }
}
function error(message) {
  throw new Error(message);
}
function typecast(value) {
  try {
    return JSON.parse(value);
  } catch (o_O) {
    return value;
  }
}
var Binding = class {
  constructor(context, action) {
    this.context = context;
    this.action = action;
  }
  get index() {
    return this.action.index;
  }
  get eventTarget() {
    return this.action.eventTarget;
  }
  get eventOptions() {
    return this.action.eventOptions;
  }
  get identifier() {
    return this.context.identifier;
  }
  handleEvent(event) {
    const actionEvent = this.prepareActionEvent(event);
    if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(actionEvent)) {
      this.invokeWithEvent(actionEvent);
    }
  }
  get eventName() {
    return this.action.eventName;
  }
  get method() {
    const method = this.controller[this.methodName];
    if (typeof method == "function") {
      return method;
    }
    throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
  }
  applyEventModifiers(event) {
    const { element } = this.action;
    const { actionDescriptorFilters } = this.context.application;
    const { controller } = this.context;
    let passes = true;
    for (const [name, value] of Object.entries(this.eventOptions)) {
      if (name in actionDescriptorFilters) {
        const filter = actionDescriptorFilters[name];
        passes = passes && filter({ name, value, event, element, controller });
      } else {
        continue;
      }
    }
    return passes;
  }
  prepareActionEvent(event) {
    return Object.assign(event, { params: this.action.params });
  }
  invokeWithEvent(event) {
    const { target, currentTarget } = event;
    try {
      this.method.call(this.controller, event);
      this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
    } catch (error2) {
      const { identifier, controller, element, index } = this;
      const detail = { identifier, controller, element, index, event };
      this.context.handleError(error2, `invoking action "${this.action}"`, detail);
    }
  }
  willBeInvokedByEvent(event) {
    const eventTarget = event.target;
    if (event instanceof KeyboardEvent && this.action.shouldIgnoreKeyboardEvent(event)) {
      return false;
    }
    if (event instanceof MouseEvent && this.action.shouldIgnoreMouseEvent(event)) {
      return false;
    }
    if (this.element === eventTarget) {
      return true;
    } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
      return this.scope.containsElement(eventTarget);
    } else {
      return this.scope.containsElement(this.action.element);
    }
  }
  get controller() {
    return this.context.controller;
  }
  get methodName() {
    return this.action.methodName;
  }
  get element() {
    return this.scope.element;
  }
  get scope() {
    return this.context.scope;
  }
};
var ElementObserver = class {
  constructor(element, delegate2) {
    this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
    this.element = element;
    this.started = false;
    this.delegate = delegate2;
    this.elements = /* @__PURE__ */ new Set();
    this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, this.mutationObserverInit);
      this.refresh();
    }
  }
  pause(callback) {
    if (this.started) {
      this.mutationObserver.disconnect();
      this.started = false;
    }
    callback();
    if (!this.started) {
      this.mutationObserver.observe(this.element, this.mutationObserverInit);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  }
  refresh() {
    if (this.started) {
      const matches2 = new Set(this.matchElementsInTree());
      for (const element of Array.from(this.elements)) {
        if (!matches2.has(element)) {
          this.removeElement(element);
        }
      }
      for (const element of Array.from(matches2)) {
        this.addElement(element);
      }
    }
  }
  processMutations(mutations) {
    if (this.started) {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    }
  }
  processMutation(mutation) {
    if (mutation.type == "attributes") {
      this.processAttributeChange(mutation.target, mutation.attributeName);
    } else if (mutation.type == "childList") {
      this.processRemovedNodes(mutation.removedNodes);
      this.processAddedNodes(mutation.addedNodes);
    }
  }
  processAttributeChange(element, attributeName) {
    if (this.elements.has(element)) {
      if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
        this.delegate.elementAttributeChanged(element, attributeName);
      } else {
        this.removeElement(element);
      }
    } else if (this.matchElement(element)) {
      this.addElement(element);
    }
  }
  processRemovedNodes(nodes) {
    for (const node of Array.from(nodes)) {
      const element = this.elementFromNode(node);
      if (element) {
        this.processTree(element, this.removeElement);
      }
    }
  }
  processAddedNodes(nodes) {
    for (const node of Array.from(nodes)) {
      const element = this.elementFromNode(node);
      if (element && this.elementIsActive(element)) {
        this.processTree(element, this.addElement);
      }
    }
  }
  matchElement(element) {
    return this.delegate.matchElement(element);
  }
  matchElementsInTree(tree = this.element) {
    return this.delegate.matchElementsInTree(tree);
  }
  processTree(tree, processor) {
    for (const element of this.matchElementsInTree(tree)) {
      processor.call(this, element);
    }
  }
  elementFromNode(node) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      return node;
    }
  }
  elementIsActive(element) {
    if (element.isConnected != this.element.isConnected) {
      return false;
    } else {
      return this.element.contains(element);
    }
  }
  addElement(element) {
    if (!this.elements.has(element)) {
      if (this.elementIsActive(element)) {
        this.elements.add(element);
        if (this.delegate.elementMatched) {
          this.delegate.elementMatched(element);
        }
      }
    }
  }
  removeElement(element) {
    if (this.elements.has(element)) {
      this.elements.delete(element);
      if (this.delegate.elementUnmatched) {
        this.delegate.elementUnmatched(element);
      }
    }
  }
};
var AttributeObserver = class {
  constructor(element, attributeName, delegate2) {
    this.attributeName = attributeName;
    this.delegate = delegate2;
    this.elementObserver = new ElementObserver(element, this);
  }
  get element() {
    return this.elementObserver.element;
  }
  get selector() {
    return `[${this.attributeName}]`;
  }
  start() {
    this.elementObserver.start();
  }
  pause(callback) {
    this.elementObserver.pause(callback);
  }
  stop() {
    this.elementObserver.stop();
  }
  refresh() {
    this.elementObserver.refresh();
  }
  get started() {
    return this.elementObserver.started;
  }
  matchElement(element) {
    return element.hasAttribute(this.attributeName);
  }
  matchElementsInTree(tree) {
    const match = this.matchElement(tree) ? [tree] : [];
    const matches2 = Array.from(tree.querySelectorAll(this.selector));
    return match.concat(matches2);
  }
  elementMatched(element) {
    if (this.delegate.elementMatchedAttribute) {
      this.delegate.elementMatchedAttribute(element, this.attributeName);
    }
  }
  elementUnmatched(element) {
    if (this.delegate.elementUnmatchedAttribute) {
      this.delegate.elementUnmatchedAttribute(element, this.attributeName);
    }
  }
  elementAttributeChanged(element, attributeName) {
    if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
      this.delegate.elementAttributeValueChanged(element, attributeName);
    }
  }
};
function add(map, key, value) {
  fetch2(map, key).add(value);
}
function del(map, key, value) {
  fetch2(map, key).delete(value);
  prune(map, key);
}
function fetch2(map, key) {
  let values = map.get(key);
  if (!values) {
    values = /* @__PURE__ */ new Set();
    map.set(key, values);
  }
  return values;
}
function prune(map, key) {
  const values = map.get(key);
  if (values != null && values.size == 0) {
    map.delete(key);
  }
}
var Multimap = class {
  constructor() {
    this.valuesByKey = /* @__PURE__ */ new Map();
  }
  get keys() {
    return Array.from(this.valuesByKey.keys());
  }
  get values() {
    const sets = Array.from(this.valuesByKey.values());
    return sets.reduce((values, set) => values.concat(Array.from(set)), []);
  }
  get size() {
    const sets = Array.from(this.valuesByKey.values());
    return sets.reduce((size, set) => size + set.size, 0);
  }
  add(key, value) {
    add(this.valuesByKey, key, value);
  }
  delete(key, value) {
    del(this.valuesByKey, key, value);
  }
  has(key, value) {
    const values = this.valuesByKey.get(key);
    return values != null && values.has(value);
  }
  hasKey(key) {
    return this.valuesByKey.has(key);
  }
  hasValue(value) {
    const sets = Array.from(this.valuesByKey.values());
    return sets.some((set) => set.has(value));
  }
  getValuesForKey(key) {
    const values = this.valuesByKey.get(key);
    return values ? Array.from(values) : [];
  }
  getKeysForValue(value) {
    return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
  }
};
var SelectorObserver = class {
  constructor(element, selector, delegate2, details) {
    this._selector = selector;
    this.details = details;
    this.elementObserver = new ElementObserver(element, this);
    this.delegate = delegate2;
    this.matchesByElement = new Multimap();
  }
  get started() {
    return this.elementObserver.started;
  }
  get selector() {
    return this._selector;
  }
  set selector(selector) {
    this._selector = selector;
    this.refresh();
  }
  start() {
    this.elementObserver.start();
  }
  pause(callback) {
    this.elementObserver.pause(callback);
  }
  stop() {
    this.elementObserver.stop();
  }
  refresh() {
    this.elementObserver.refresh();
  }
  get element() {
    return this.elementObserver.element;
  }
  matchElement(element) {
    const { selector } = this;
    if (selector) {
      const matches2 = element.matches(selector);
      if (this.delegate.selectorMatchElement) {
        return matches2 && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches2;
    } else {
      return false;
    }
  }
  matchElementsInTree(tree) {
    const { selector } = this;
    if (selector) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches2 = Array.from(tree.querySelectorAll(selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches2);
    } else {
      return [];
    }
  }
  elementMatched(element) {
    const { selector } = this;
    if (selector) {
      this.selectorMatched(element, selector);
    }
  }
  elementUnmatched(element) {
    const selectors = this.matchesByElement.getKeysForValue(element);
    for (const selector of selectors) {
      this.selectorUnmatched(element, selector);
    }
  }
  elementAttributeChanged(element, _attributeName) {
    const { selector } = this;
    if (selector) {
      const matches2 = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(selector, element);
      if (matches2 && !matchedBefore) {
        this.selectorMatched(element, selector);
      } else if (!matches2 && matchedBefore) {
        this.selectorUnmatched(element, selector);
      }
    }
  }
  selectorMatched(element, selector) {
    this.delegate.selectorMatched(element, selector, this.details);
    this.matchesByElement.add(selector, element);
  }
  selectorUnmatched(element, selector) {
    this.delegate.selectorUnmatched(element, selector, this.details);
    this.matchesByElement.delete(selector, element);
  }
};
var StringMapObserver = class {
  constructor(element, delegate2) {
    this.element = element;
    this.delegate = delegate2;
    this.started = false;
    this.stringMap = /* @__PURE__ */ new Map();
    this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
      this.refresh();
    }
  }
  stop() {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  }
  refresh() {
    if (this.started) {
      for (const attributeName of this.knownAttributeNames) {
        this.refreshAttribute(attributeName, null);
      }
    }
  }
  processMutations(mutations) {
    if (this.started) {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    }
  }
  processMutation(mutation) {
    const attributeName = mutation.attributeName;
    if (attributeName) {
      this.refreshAttribute(attributeName, mutation.oldValue);
    }
  }
  refreshAttribute(attributeName, oldValue) {
    const key = this.delegate.getStringMapKeyForAttribute(attributeName);
    if (key != null) {
      if (!this.stringMap.has(attributeName)) {
        this.stringMapKeyAdded(key, attributeName);
      }
      const value = this.element.getAttribute(attributeName);
      if (this.stringMap.get(attributeName) != value) {
        this.stringMapValueChanged(value, key, oldValue);
      }
      if (value == null) {
        const oldValue2 = this.stringMap.get(attributeName);
        this.stringMap.delete(attributeName);
        if (oldValue2)
          this.stringMapKeyRemoved(key, attributeName, oldValue2);
      } else {
        this.stringMap.set(attributeName, value);
      }
    }
  }
  stringMapKeyAdded(key, attributeName) {
    if (this.delegate.stringMapKeyAdded) {
      this.delegate.stringMapKeyAdded(key, attributeName);
    }
  }
  stringMapValueChanged(value, key, oldValue) {
    if (this.delegate.stringMapValueChanged) {
      this.delegate.stringMapValueChanged(value, key, oldValue);
    }
  }
  stringMapKeyRemoved(key, attributeName, oldValue) {
    if (this.delegate.stringMapKeyRemoved) {
      this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
    }
  }
  get knownAttributeNames() {
    return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
  }
  get currentAttributeNames() {
    return Array.from(this.element.attributes).map((attribute) => attribute.name);
  }
  get recordedAttributeNames() {
    return Array.from(this.stringMap.keys());
  }
};
var TokenListObserver = class {
  constructor(element, attributeName, delegate2) {
    this.attributeObserver = new AttributeObserver(element, attributeName, this);
    this.delegate = delegate2;
    this.tokensByElement = new Multimap();
  }
  get started() {
    return this.attributeObserver.started;
  }
  start() {
    this.attributeObserver.start();
  }
  pause(callback) {
    this.attributeObserver.pause(callback);
  }
  stop() {
    this.attributeObserver.stop();
  }
  refresh() {
    this.attributeObserver.refresh();
  }
  get element() {
    return this.attributeObserver.element;
  }
  get attributeName() {
    return this.attributeObserver.attributeName;
  }
  elementMatchedAttribute(element) {
    this.tokensMatched(this.readTokensForElement(element));
  }
  elementAttributeValueChanged(element) {
    const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
    this.tokensUnmatched(unmatchedTokens);
    this.tokensMatched(matchedTokens);
  }
  elementUnmatchedAttribute(element) {
    this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
  }
  tokensMatched(tokens) {
    tokens.forEach((token) => this.tokenMatched(token));
  }
  tokensUnmatched(tokens) {
    tokens.forEach((token) => this.tokenUnmatched(token));
  }
  tokenMatched(token) {
    this.delegate.tokenMatched(token);
    this.tokensByElement.add(token.element, token);
  }
  tokenUnmatched(token) {
    this.delegate.tokenUnmatched(token);
    this.tokensByElement.delete(token.element, token);
  }
  refreshTokensForElement(element) {
    const previousTokens = this.tokensByElement.getValuesForKey(element);
    const currentTokens = this.readTokensForElement(element);
    const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
    if (firstDifferingIndex == -1) {
      return [[], []];
    } else {
      return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
    }
  }
  readTokensForElement(element) {
    const attributeName = this.attributeName;
    const tokenString = element.getAttribute(attributeName) || "";
    return parseTokenString(tokenString, element, attributeName);
  }
};
function parseTokenString(tokenString, element, attributeName) {
  return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
}
function zip(left, right) {
  const length = Math.max(left.length, right.length);
  return Array.from({ length }, (_, index) => [left[index], right[index]]);
}
function tokensAreEqual(left, right) {
  return left && right && left.index == right.index && left.content == right.content;
}
var ValueListObserver = class {
  constructor(element, attributeName, delegate2) {
    this.tokenListObserver = new TokenListObserver(element, attributeName, this);
    this.delegate = delegate2;
    this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
    this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
  }
  get started() {
    return this.tokenListObserver.started;
  }
  start() {
    this.tokenListObserver.start();
  }
  stop() {
    this.tokenListObserver.stop();
  }
  refresh() {
    this.tokenListObserver.refresh();
  }
  get element() {
    return this.tokenListObserver.element;
  }
  get attributeName() {
    return this.tokenListObserver.attributeName;
  }
  tokenMatched(token) {
    const { element } = token;
    const { value } = this.fetchParseResultForToken(token);
    if (value) {
      this.fetchValuesByTokenForElement(element).set(token, value);
      this.delegate.elementMatchedValue(element, value);
    }
  }
  tokenUnmatched(token) {
    const { element } = token;
    const { value } = this.fetchParseResultForToken(token);
    if (value) {
      this.fetchValuesByTokenForElement(element).delete(token);
      this.delegate.elementUnmatchedValue(element, value);
    }
  }
  fetchParseResultForToken(token) {
    let parseResult = this.parseResultsByToken.get(token);
    if (!parseResult) {
      parseResult = this.parseToken(token);
      this.parseResultsByToken.set(token, parseResult);
    }
    return parseResult;
  }
  fetchValuesByTokenForElement(element) {
    let valuesByToken = this.valuesByTokenByElement.get(element);
    if (!valuesByToken) {
      valuesByToken = /* @__PURE__ */ new Map();
      this.valuesByTokenByElement.set(element, valuesByToken);
    }
    return valuesByToken;
  }
  parseToken(token) {
    try {
      const value = this.delegate.parseValueForToken(token);
      return { value };
    } catch (error2) {
      return { error: error2 };
    }
  }
};
var BindingObserver = class {
  constructor(context, delegate2) {
    this.context = context;
    this.delegate = delegate2;
    this.bindingsByAction = /* @__PURE__ */ new Map();
  }
  start() {
    if (!this.valueListObserver) {
      this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
      this.valueListObserver.start();
    }
  }
  stop() {
    if (this.valueListObserver) {
      this.valueListObserver.stop();
      delete this.valueListObserver;
      this.disconnectAllActions();
    }
  }
  get element() {
    return this.context.element;
  }
  get identifier() {
    return this.context.identifier;
  }
  get actionAttribute() {
    return this.schema.actionAttribute;
  }
  get schema() {
    return this.context.schema;
  }
  get bindings() {
    return Array.from(this.bindingsByAction.values());
  }
  connectAction(action) {
    const binding = new Binding(this.context, action);
    this.bindingsByAction.set(action, binding);
    this.delegate.bindingConnected(binding);
  }
  disconnectAction(action) {
    const binding = this.bindingsByAction.get(action);
    if (binding) {
      this.bindingsByAction.delete(action);
      this.delegate.bindingDisconnected(binding);
    }
  }
  disconnectAllActions() {
    this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
    this.bindingsByAction.clear();
  }
  parseValueForToken(token) {
    const action = Action.forToken(token, this.schema);
    if (action.identifier == this.identifier) {
      return action;
    }
  }
  elementMatchedValue(element, action) {
    this.connectAction(action);
  }
  elementUnmatchedValue(element, action) {
    this.disconnectAction(action);
  }
};
var ValueObserver = class {
  constructor(context, receiver) {
    this.context = context;
    this.receiver = receiver;
    this.stringMapObserver = new StringMapObserver(this.element, this);
    this.valueDescriptorMap = this.controller.valueDescriptorMap;
  }
  start() {
    this.stringMapObserver.start();
    this.invokeChangedCallbacksForDefaultValues();
  }
  stop() {
    this.stringMapObserver.stop();
  }
  get element() {
    return this.context.element;
  }
  get controller() {
    return this.context.controller;
  }
  getStringMapKeyForAttribute(attributeName) {
    if (attributeName in this.valueDescriptorMap) {
      return this.valueDescriptorMap[attributeName].name;
    }
  }
  stringMapKeyAdded(key, attributeName) {
    const descriptor = this.valueDescriptorMap[attributeName];
    if (!this.hasValue(key)) {
      this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
    }
  }
  stringMapValueChanged(value, name, oldValue) {
    const descriptor = this.valueDescriptorNameMap[name];
    if (value === null)
      return;
    if (oldValue === null) {
      oldValue = descriptor.writer(descriptor.defaultValue);
    }
    this.invokeChangedCallback(name, value, oldValue);
  }
  stringMapKeyRemoved(key, attributeName, oldValue) {
    const descriptor = this.valueDescriptorNameMap[key];
    if (this.hasValue(key)) {
      this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
    } else {
      this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
    }
  }
  invokeChangedCallbacksForDefaultValues() {
    for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
      if (defaultValue != void 0 && !this.controller.data.has(key)) {
        this.invokeChangedCallback(name, writer(defaultValue), void 0);
      }
    }
  }
  invokeChangedCallback(name, rawValue, rawOldValue) {
    const changedMethodName = `${name}Changed`;
    const changedMethod = this.receiver[changedMethodName];
    if (typeof changedMethod == "function") {
      const descriptor = this.valueDescriptorNameMap[name];
      try {
        const value = descriptor.reader(rawValue);
        let oldValue = rawOldValue;
        if (rawOldValue) {
          oldValue = descriptor.reader(rawOldValue);
        }
        changedMethod.call(this.receiver, value, oldValue);
      } catch (error2) {
        if (error2 instanceof TypeError) {
          error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
        }
        throw error2;
      }
    }
  }
  get valueDescriptors() {
    const { valueDescriptorMap } = this;
    return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
  }
  get valueDescriptorNameMap() {
    const descriptors = {};
    Object.keys(this.valueDescriptorMap).forEach((key) => {
      const descriptor = this.valueDescriptorMap[key];
      descriptors[descriptor.name] = descriptor;
    });
    return descriptors;
  }
  hasValue(attributeName) {
    const descriptor = this.valueDescriptorNameMap[attributeName];
    const hasMethodName = `has${capitalize(descriptor.name)}`;
    return this.receiver[hasMethodName];
  }
};
var TargetObserver = class {
  constructor(context, delegate2) {
    this.context = context;
    this.delegate = delegate2;
    this.targetsByName = new Multimap();
  }
  start() {
    if (!this.tokenListObserver) {
      this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
      this.tokenListObserver.start();
    }
  }
  stop() {
    if (this.tokenListObserver) {
      this.disconnectAllTargets();
      this.tokenListObserver.stop();
      delete this.tokenListObserver;
    }
  }
  tokenMatched({ element, content: name }) {
    if (this.scope.containsElement(element)) {
      this.connectTarget(element, name);
    }
  }
  tokenUnmatched({ element, content: name }) {
    this.disconnectTarget(element, name);
  }
  connectTarget(element, name) {
    var _a;
    if (!this.targetsByName.has(name, element)) {
      this.targetsByName.add(name, element);
      (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
    }
  }
  disconnectTarget(element, name) {
    var _a;
    if (this.targetsByName.has(name, element)) {
      this.targetsByName.delete(name, element);
      (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
    }
  }
  disconnectAllTargets() {
    for (const name of this.targetsByName.keys) {
      for (const element of this.targetsByName.getValuesForKey(name)) {
        this.disconnectTarget(element, name);
      }
    }
  }
  get attributeName() {
    return `data-${this.context.identifier}-target`;
  }
  get element() {
    return this.context.element;
  }
  get scope() {
    return this.context.scope;
  }
};
function readInheritableStaticArrayValues(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return Array.from(ancestors.reduce((values, constructor2) => {
    getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
    return values;
  }, /* @__PURE__ */ new Set()));
}
function readInheritableStaticObjectPairs(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return ancestors.reduce((pairs, constructor2) => {
    pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
    return pairs;
  }, []);
}
function getAncestorsForConstructor(constructor) {
  const ancestors = [];
  while (constructor) {
    ancestors.push(constructor);
    constructor = Object.getPrototypeOf(constructor);
  }
  return ancestors.reverse();
}
function getOwnStaticArrayValues(constructor, propertyName) {
  const definition = constructor[propertyName];
  return Array.isArray(definition) ? definition : [];
}
function getOwnStaticObjectPairs(constructor, propertyName) {
  const definition = constructor[propertyName];
  return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
}
var OutletObserver = class {
  constructor(context, delegate2) {
    this.started = false;
    this.context = context;
    this.delegate = delegate2;
    this.outletsByName = new Multimap();
    this.outletElementsByName = new Multimap();
    this.selectorObserverMap = /* @__PURE__ */ new Map();
    this.attributeObserverMap = /* @__PURE__ */ new Map();
  }
  start() {
    if (!this.started) {
      this.outletDefinitions.forEach((outletName) => {
        this.setupSelectorObserverForOutlet(outletName);
        this.setupAttributeObserverForOutlet(outletName);
      });
      this.started = true;
      this.dependentContexts.forEach((context) => context.refresh());
    }
  }
  refresh() {
    this.selectorObserverMap.forEach((observer) => observer.refresh());
    this.attributeObserverMap.forEach((observer) => observer.refresh());
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.disconnectAllOutlets();
      this.stopSelectorObservers();
      this.stopAttributeObservers();
    }
  }
  stopSelectorObservers() {
    if (this.selectorObserverMap.size > 0) {
      this.selectorObserverMap.forEach((observer) => observer.stop());
      this.selectorObserverMap.clear();
    }
  }
  stopAttributeObservers() {
    if (this.attributeObserverMap.size > 0) {
      this.attributeObserverMap.forEach((observer) => observer.stop());
      this.attributeObserverMap.clear();
    }
  }
  selectorMatched(element, _selector, { outletName }) {
    const outlet = this.getOutlet(element, outletName);
    if (outlet) {
      this.connectOutlet(outlet, element, outletName);
    }
  }
  selectorUnmatched(element, _selector, { outletName }) {
    const outlet = this.getOutletFromMap(element, outletName);
    if (outlet) {
      this.disconnectOutlet(outlet, element, outletName);
    }
  }
  selectorMatchElement(element, { outletName }) {
    const selector = this.selector(outletName);
    const hasOutlet = this.hasOutlet(element, outletName);
    const hasOutletController = element.matches(`[${this.schema.controllerAttribute}~=${outletName}]`);
    if (selector) {
      return hasOutlet && hasOutletController && element.matches(selector);
    } else {
      return false;
    }
  }
  elementMatchedAttribute(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  elementAttributeValueChanged(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  elementUnmatchedAttribute(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  connectOutlet(outlet, element, outletName) {
    var _a;
    if (!this.outletElementsByName.has(outletName, element)) {
      this.outletsByName.add(outletName, outlet);
      this.outletElementsByName.add(outletName, element);
      (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
    }
  }
  disconnectOutlet(outlet, element, outletName) {
    var _a;
    if (this.outletElementsByName.has(outletName, element)) {
      this.outletsByName.delete(outletName, outlet);
      this.outletElementsByName.delete(outletName, element);
      (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
    }
  }
  disconnectAllOutlets() {
    for (const outletName of this.outletElementsByName.keys) {
      for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
        for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
          this.disconnectOutlet(outlet, element, outletName);
        }
      }
    }
  }
  updateSelectorObserverForOutlet(outletName) {
    const observer = this.selectorObserverMap.get(outletName);
    if (observer) {
      observer.selector = this.selector(outletName);
    }
  }
  setupSelectorObserverForOutlet(outletName) {
    const selector = this.selector(outletName);
    const selectorObserver = new SelectorObserver(document.body, selector, this, { outletName });
    this.selectorObserverMap.set(outletName, selectorObserver);
    selectorObserver.start();
  }
  setupAttributeObserverForOutlet(outletName) {
    const attributeName = this.attributeNameForOutletName(outletName);
    const attributeObserver = new AttributeObserver(this.scope.element, attributeName, this);
    this.attributeObserverMap.set(outletName, attributeObserver);
    attributeObserver.start();
  }
  selector(outletName) {
    return this.scope.outlets.getSelectorForOutletName(outletName);
  }
  attributeNameForOutletName(outletName) {
    return this.scope.schema.outletAttributeForScope(this.identifier, outletName);
  }
  getOutletNameFromOutletAttributeName(attributeName) {
    return this.outletDefinitions.find((outletName) => this.attributeNameForOutletName(outletName) === attributeName);
  }
  get outletDependencies() {
    const dependencies = new Multimap();
    this.router.modules.forEach((module) => {
      const constructor = module.definition.controllerConstructor;
      const outlets = readInheritableStaticArrayValues(constructor, "outlets");
      outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
    });
    return dependencies;
  }
  get outletDefinitions() {
    return this.outletDependencies.getKeysForValue(this.identifier);
  }
  get dependentControllerIdentifiers() {
    return this.outletDependencies.getValuesForKey(this.identifier);
  }
  get dependentContexts() {
    const identifiers = this.dependentControllerIdentifiers;
    return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
  }
  hasOutlet(element, outletName) {
    return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
  }
  getOutlet(element, outletName) {
    return this.application.getControllerForElementAndIdentifier(element, outletName);
  }
  getOutletFromMap(element, outletName) {
    return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
  }
  get scope() {
    return this.context.scope;
  }
  get schema() {
    return this.context.schema;
  }
  get identifier() {
    return this.context.identifier;
  }
  get application() {
    return this.context.application;
  }
  get router() {
    return this.application.router;
  }
};
var Context = class {
  constructor(module, scope) {
    this.logDebugActivity = (functionName, detail = {}) => {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.logDebugActivity(this.identifier, functionName, detail);
    };
    this.module = module;
    this.scope = scope;
    this.controller = new module.controllerConstructor(this);
    this.bindingObserver = new BindingObserver(this, this.dispatcher);
    this.valueObserver = new ValueObserver(this, this.controller);
    this.targetObserver = new TargetObserver(this, this);
    this.outletObserver = new OutletObserver(this, this);
    try {
      this.controller.initialize();
      this.logDebugActivity("initialize");
    } catch (error2) {
      this.handleError(error2, "initializing controller");
    }
  }
  connect() {
    this.bindingObserver.start();
    this.valueObserver.start();
    this.targetObserver.start();
    this.outletObserver.start();
    try {
      this.controller.connect();
      this.logDebugActivity("connect");
    } catch (error2) {
      this.handleError(error2, "connecting controller");
    }
  }
  refresh() {
    this.outletObserver.refresh();
  }
  disconnect() {
    try {
      this.controller.disconnect();
      this.logDebugActivity("disconnect");
    } catch (error2) {
      this.handleError(error2, "disconnecting controller");
    }
    this.outletObserver.stop();
    this.targetObserver.stop();
    this.valueObserver.stop();
    this.bindingObserver.stop();
  }
  get application() {
    return this.module.application;
  }
  get identifier() {
    return this.module.identifier;
  }
  get schema() {
    return this.application.schema;
  }
  get dispatcher() {
    return this.application.dispatcher;
  }
  get element() {
    return this.scope.element;
  }
  get parentElement() {
    return this.element.parentElement;
  }
  handleError(error2, message, detail = {}) {
    const { identifier, controller, element } = this;
    detail = Object.assign({ identifier, controller, element }, detail);
    this.application.handleError(error2, `Error ${message}`, detail);
  }
  targetConnected(element, name) {
    this.invokeControllerMethod(`${name}TargetConnected`, element);
  }
  targetDisconnected(element, name) {
    this.invokeControllerMethod(`${name}TargetDisconnected`, element);
  }
  outletConnected(outlet, element, name) {
    this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
  }
  outletDisconnected(outlet, element, name) {
    this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
  }
  invokeControllerMethod(methodName, ...args) {
    const controller = this.controller;
    if (typeof controller[methodName] == "function") {
      controller[methodName](...args);
    }
  }
};
function bless(constructor) {
  return shadow(constructor, getBlessedProperties(constructor));
}
function shadow(constructor, properties) {
  const shadowConstructor = extend2(constructor);
  const shadowProperties = getShadowProperties(constructor.prototype, properties);
  Object.defineProperties(shadowConstructor.prototype, shadowProperties);
  return shadowConstructor;
}
function getBlessedProperties(constructor) {
  const blessings = readInheritableStaticArrayValues(constructor, "blessings");
  return blessings.reduce((blessedProperties, blessing) => {
    const properties = blessing(constructor);
    for (const key in properties) {
      const descriptor = blessedProperties[key] || {};
      blessedProperties[key] = Object.assign(descriptor, properties[key]);
    }
    return blessedProperties;
  }, {});
}
function getShadowProperties(prototype, properties) {
  return getOwnKeys(properties).reduce((shadowProperties, key) => {
    const descriptor = getShadowedDescriptor(prototype, properties, key);
    if (descriptor) {
      Object.assign(shadowProperties, { [key]: descriptor });
    }
    return shadowProperties;
  }, {});
}
function getShadowedDescriptor(prototype, properties, key) {
  const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
  const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
  if (!shadowedByValue) {
    const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
    if (shadowingDescriptor) {
      descriptor.get = shadowingDescriptor.get || descriptor.get;
      descriptor.set = shadowingDescriptor.set || descriptor.set;
    }
    return descriptor;
  }
}
var getOwnKeys = (() => {
  if (typeof Object.getOwnPropertySymbols == "function") {
    return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
  } else {
    return Object.getOwnPropertyNames;
  }
})();
var extend2 = (() => {
  function extendWithReflect(constructor) {
    function extended() {
      return Reflect.construct(constructor, arguments, new.target);
    }
    extended.prototype = Object.create(constructor.prototype, {
      constructor: { value: extended }
    });
    Reflect.setPrototypeOf(extended, constructor);
    return extended;
  }
  function testReflectExtension() {
    const a = function() {
      this.a.call(this);
    };
    const b = extendWithReflect(a);
    b.prototype.a = function() {
    };
    return new b();
  }
  try {
    testReflectExtension();
    return extendWithReflect;
  } catch (error2) {
    return (constructor) => class extended extends constructor {
    };
  }
})();
function blessDefinition(definition) {
  return {
    identifier: definition.identifier,
    controllerConstructor: bless(definition.controllerConstructor)
  };
}
var Module = class {
  constructor(application2, definition) {
    this.application = application2;
    this.definition = blessDefinition(definition);
    this.contextsByScope = /* @__PURE__ */ new WeakMap();
    this.connectedContexts = /* @__PURE__ */ new Set();
  }
  get identifier() {
    return this.definition.identifier;
  }
  get controllerConstructor() {
    return this.definition.controllerConstructor;
  }
  get contexts() {
    return Array.from(this.connectedContexts);
  }
  connectContextForScope(scope) {
    const context = this.fetchContextForScope(scope);
    this.connectedContexts.add(context);
    context.connect();
  }
  disconnectContextForScope(scope) {
    const context = this.contextsByScope.get(scope);
    if (context) {
      this.connectedContexts.delete(context);
      context.disconnect();
    }
  }
  fetchContextForScope(scope) {
    let context = this.contextsByScope.get(scope);
    if (!context) {
      context = new Context(this, scope);
      this.contextsByScope.set(scope, context);
    }
    return context;
  }
};
var ClassMap = class {
  constructor(scope) {
    this.scope = scope;
  }
  has(name) {
    return this.data.has(this.getDataKey(name));
  }
  get(name) {
    return this.getAll(name)[0];
  }
  getAll(name) {
    const tokenString = this.data.get(this.getDataKey(name)) || "";
    return tokenize(tokenString);
  }
  getAttributeName(name) {
    return this.data.getAttributeNameForKey(this.getDataKey(name));
  }
  getDataKey(name) {
    return `${name}-class`;
  }
  get data() {
    return this.scope.data;
  }
};
var DataMap = class {
  constructor(scope) {
    this.scope = scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get(key) {
    const name = this.getAttributeNameForKey(key);
    return this.element.getAttribute(name);
  }
  set(key, value) {
    const name = this.getAttributeNameForKey(key);
    this.element.setAttribute(name, value);
    return this.get(key);
  }
  has(key) {
    const name = this.getAttributeNameForKey(key);
    return this.element.hasAttribute(name);
  }
  delete(key) {
    if (this.has(key)) {
      const name = this.getAttributeNameForKey(key);
      this.element.removeAttribute(name);
      return true;
    } else {
      return false;
    }
  }
  getAttributeNameForKey(key) {
    return `data-${this.identifier}-${dasherize(key)}`;
  }
};
var Guide = class {
  constructor(logger) {
    this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
    this.logger = logger;
  }
  warn(object, key, message) {
    let warnedKeys = this.warnedKeysByObject.get(object);
    if (!warnedKeys) {
      warnedKeys = /* @__PURE__ */ new Set();
      this.warnedKeysByObject.set(object, warnedKeys);
    }
    if (!warnedKeys.has(key)) {
      warnedKeys.add(key);
      this.logger.warn(message, object);
    }
  }
};
function attributeValueContainsToken(attributeName, token) {
  return `[${attributeName}~="${token}"]`;
}
var TargetSet = class {
  constructor(scope) {
    this.scope = scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get schema() {
    return this.scope.schema;
  }
  has(targetName) {
    return this.find(targetName) != null;
  }
  find(...targetNames) {
    return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
  }
  findAll(...targetNames) {
    return targetNames.reduce((targets, targetName) => [
      ...targets,
      ...this.findAllTargets(targetName),
      ...this.findAllLegacyTargets(targetName)
    ], []);
  }
  findTarget(targetName) {
    const selector = this.getSelectorForTargetName(targetName);
    return this.scope.findElement(selector);
  }
  findAllTargets(targetName) {
    const selector = this.getSelectorForTargetName(targetName);
    return this.scope.findAllElements(selector);
  }
  getSelectorForTargetName(targetName) {
    const attributeName = this.schema.targetAttributeForScope(this.identifier);
    return attributeValueContainsToken(attributeName, targetName);
  }
  findLegacyTarget(targetName) {
    const selector = this.getLegacySelectorForTargetName(targetName);
    return this.deprecate(this.scope.findElement(selector), targetName);
  }
  findAllLegacyTargets(targetName) {
    const selector = this.getLegacySelectorForTargetName(targetName);
    return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
  }
  getLegacySelectorForTargetName(targetName) {
    const targetDescriptor = `${this.identifier}.${targetName}`;
    return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
  }
  deprecate(element, targetName) {
    if (element) {
      const { identifier } = this;
      const attributeName = this.schema.targetAttribute;
      const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
      this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
    }
    return element;
  }
  get guide() {
    return this.scope.guide;
  }
};
var OutletSet = class {
  constructor(scope, controllerElement) {
    this.scope = scope;
    this.controllerElement = controllerElement;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get schema() {
    return this.scope.schema;
  }
  has(outletName) {
    return this.find(outletName) != null;
  }
  find(...outletNames) {
    return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
  }
  findAll(...outletNames) {
    return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
  }
  getSelectorForOutletName(outletName) {
    const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
    return this.controllerElement.getAttribute(attributeName);
  }
  findOutlet(outletName) {
    const selector = this.getSelectorForOutletName(outletName);
    if (selector)
      return this.findElement(selector, outletName);
  }
  findAllOutlets(outletName) {
    const selector = this.getSelectorForOutletName(outletName);
    return selector ? this.findAllElements(selector, outletName) : [];
  }
  findElement(selector, outletName) {
    const elements = this.scope.queryElements(selector);
    return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
  }
  findAllElements(selector, outletName) {
    const elements = this.scope.queryElements(selector);
    return elements.filter((element) => this.matchesElement(element, selector, outletName));
  }
  matchesElement(element, selector, outletName) {
    const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
    return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
  }
};
var Scope = class _Scope {
  constructor(schema, element, identifier, logger) {
    this.targets = new TargetSet(this);
    this.classes = new ClassMap(this);
    this.data = new DataMap(this);
    this.containsElement = (element2) => {
      return element2.closest(this.controllerSelector) === this.element;
    };
    this.schema = schema;
    this.element = element;
    this.identifier = identifier;
    this.guide = new Guide(logger);
    this.outlets = new OutletSet(this.documentScope, element);
  }
  findElement(selector) {
    return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
  }
  findAllElements(selector) {
    return [
      ...this.element.matches(selector) ? [this.element] : [],
      ...this.queryElements(selector).filter(this.containsElement)
    ];
  }
  queryElements(selector) {
    return Array.from(this.element.querySelectorAll(selector));
  }
  get controllerSelector() {
    return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
  }
  get isDocumentScope() {
    return this.element === document.documentElement;
  }
  get documentScope() {
    return this.isDocumentScope ? this : new _Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
  }
};
var ScopeObserver = class {
  constructor(element, schema, delegate2) {
    this.element = element;
    this.schema = schema;
    this.delegate = delegate2;
    this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
    this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
    this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
  }
  start() {
    this.valueListObserver.start();
  }
  stop() {
    this.valueListObserver.stop();
  }
  get controllerAttribute() {
    return this.schema.controllerAttribute;
  }
  parseValueForToken(token) {
    const { element, content: identifier } = token;
    return this.parseValueForElementAndIdentifier(element, identifier);
  }
  parseValueForElementAndIdentifier(element, identifier) {
    const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
    let scope = scopesByIdentifier.get(identifier);
    if (!scope) {
      scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
      scopesByIdentifier.set(identifier, scope);
    }
    return scope;
  }
  elementMatchedValue(element, value) {
    const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
    this.scopeReferenceCounts.set(value, referenceCount);
    if (referenceCount == 1) {
      this.delegate.scopeConnected(value);
    }
  }
  elementUnmatchedValue(element, value) {
    const referenceCount = this.scopeReferenceCounts.get(value);
    if (referenceCount) {
      this.scopeReferenceCounts.set(value, referenceCount - 1);
      if (referenceCount == 1) {
        this.delegate.scopeDisconnected(value);
      }
    }
  }
  fetchScopesByIdentifierForElement(element) {
    let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
    if (!scopesByIdentifier) {
      scopesByIdentifier = /* @__PURE__ */ new Map();
      this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
    }
    return scopesByIdentifier;
  }
};
var Router = class {
  constructor(application2) {
    this.application = application2;
    this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
    this.scopesByIdentifier = new Multimap();
    this.modulesByIdentifier = /* @__PURE__ */ new Map();
  }
  get element() {
    return this.application.element;
  }
  get schema() {
    return this.application.schema;
  }
  get logger() {
    return this.application.logger;
  }
  get controllerAttribute() {
    return this.schema.controllerAttribute;
  }
  get modules() {
    return Array.from(this.modulesByIdentifier.values());
  }
  get contexts() {
    return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
  }
  start() {
    this.scopeObserver.start();
  }
  stop() {
    this.scopeObserver.stop();
  }
  loadDefinition(definition) {
    this.unloadIdentifier(definition.identifier);
    const module = new Module(this.application, definition);
    this.connectModule(module);
    const afterLoad = definition.controllerConstructor.afterLoad;
    if (afterLoad) {
      afterLoad.call(definition.controllerConstructor, definition.identifier, this.application);
    }
  }
  unloadIdentifier(identifier) {
    const module = this.modulesByIdentifier.get(identifier);
    if (module) {
      this.disconnectModule(module);
    }
  }
  getContextForElementAndIdentifier(element, identifier) {
    const module = this.modulesByIdentifier.get(identifier);
    if (module) {
      return module.contexts.find((context) => context.element == element);
    }
  }
  proposeToConnectScopeForElementAndIdentifier(element, identifier) {
    const scope = this.scopeObserver.parseValueForElementAndIdentifier(element, identifier);
    if (scope) {
      this.scopeObserver.elementMatchedValue(scope.element, scope);
    } else {
      console.error(`Couldn't find or create scope for identifier: "${identifier}" and element:`, element);
    }
  }
  handleError(error2, message, detail) {
    this.application.handleError(error2, message, detail);
  }
  createScopeForElementAndIdentifier(element, identifier) {
    return new Scope(this.schema, element, identifier, this.logger);
  }
  scopeConnected(scope) {
    this.scopesByIdentifier.add(scope.identifier, scope);
    const module = this.modulesByIdentifier.get(scope.identifier);
    if (module) {
      module.connectContextForScope(scope);
    }
  }
  scopeDisconnected(scope) {
    this.scopesByIdentifier.delete(scope.identifier, scope);
    const module = this.modulesByIdentifier.get(scope.identifier);
    if (module) {
      module.disconnectContextForScope(scope);
    }
  }
  connectModule(module) {
    this.modulesByIdentifier.set(module.identifier, module);
    const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach((scope) => module.connectContextForScope(scope));
  }
  disconnectModule(module) {
    this.modulesByIdentifier.delete(module.identifier);
    const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach((scope) => module.disconnectContextForScope(scope));
  }
};
var defaultSchema = {
  controllerAttribute: "data-controller",
  actionAttribute: "data-action",
  targetAttribute: "data-target",
  targetAttributeForScope: (identifier) => `data-${identifier}-target`,
  outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
  keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End", page_up: "PageUp", page_down: "PageDown" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
};
function objectFromEntries(array) {
  return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
}
var Application = class {
  constructor(element = document.documentElement, schema = defaultSchema) {
    this.logger = console;
    this.debug = false;
    this.logDebugActivity = (identifier, functionName, detail = {}) => {
      if (this.debug) {
        this.logFormattedMessage(identifier, functionName, detail);
      }
    };
    this.element = element;
    this.schema = schema;
    this.dispatcher = new Dispatcher(this);
    this.router = new Router(this);
    this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
  }
  static start(element, schema) {
    const application2 = new this(element, schema);
    application2.start();
    return application2;
  }
  async start() {
    await domReady();
    this.logDebugActivity("application", "starting");
    this.dispatcher.start();
    this.router.start();
    this.logDebugActivity("application", "start");
  }
  stop() {
    this.logDebugActivity("application", "stopping");
    this.dispatcher.stop();
    this.router.stop();
    this.logDebugActivity("application", "stop");
  }
  register(identifier, controllerConstructor) {
    this.load({ identifier, controllerConstructor });
  }
  registerActionOption(name, filter) {
    this.actionDescriptorFilters[name] = filter;
  }
  load(head, ...rest) {
    const definitions = Array.isArray(head) ? head : [head, ...rest];
    definitions.forEach((definition) => {
      if (definition.controllerConstructor.shouldLoad) {
        this.router.loadDefinition(definition);
      }
    });
  }
  unload(head, ...rest) {
    const identifiers = Array.isArray(head) ? head : [head, ...rest];
    identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
  }
  get controllers() {
    return this.router.contexts.map((context) => context.controller);
  }
  getControllerForElementAndIdentifier(element, identifier) {
    const context = this.router.getContextForElementAndIdentifier(element, identifier);
    return context ? context.controller : null;
  }
  handleError(error2, message, detail) {
    var _a;
    this.logger.error(`%s

%o

%o`, message, error2, detail);
    (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
  }
  logFormattedMessage(identifier, functionName, detail = {}) {
    detail = Object.assign({ application: this }, detail);
    this.logger.groupCollapsed(`${identifier} #${functionName}`);
    this.logger.log("details:", Object.assign({}, detail));
    this.logger.groupEnd();
  }
};
function domReady() {
  return new Promise((resolve) => {
    if (document.readyState == "loading") {
      document.addEventListener("DOMContentLoaded", () => resolve());
    } else {
      resolve();
    }
  });
}
function ClassPropertiesBlessing(constructor) {
  const classes = readInheritableStaticArrayValues(constructor, "classes");
  return classes.reduce((properties, classDefinition) => {
    return Object.assign(properties, propertiesForClassDefinition(classDefinition));
  }, {});
}
function propertiesForClassDefinition(key) {
  return {
    [`${key}Class`]: {
      get() {
        const { classes } = this;
        if (classes.has(key)) {
          return classes.get(key);
        } else {
          const attribute = classes.getAttributeName(key);
          throw new Error(`Missing attribute "${attribute}"`);
        }
      }
    },
    [`${key}Classes`]: {
      get() {
        return this.classes.getAll(key);
      }
    },
    [`has${capitalize(key)}Class`]: {
      get() {
        return this.classes.has(key);
      }
    }
  };
}
function OutletPropertiesBlessing(constructor) {
  const outlets = readInheritableStaticArrayValues(constructor, "outlets");
  return outlets.reduce((properties, outletDefinition) => {
    return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
  }, {});
}
function getOutletController(controller, element, identifier) {
  return controller.application.getControllerForElementAndIdentifier(element, identifier);
}
function getControllerAndEnsureConnectedScope(controller, element, outletName) {
  let outletController = getOutletController(controller, element, outletName);
  if (outletController)
    return outletController;
  controller.application.router.proposeToConnectScopeForElementAndIdentifier(element, outletName);
  outletController = getOutletController(controller, element, outletName);
  if (outletController)
    return outletController;
}
function propertiesForOutletDefinition(name) {
  const camelizedName = namespaceCamelize(name);
  return {
    [`${camelizedName}Outlet`]: {
      get() {
        const outletElement = this.outlets.find(name);
        const selector = this.outlets.getSelectorForOutletName(name);
        if (outletElement) {
          const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
          if (outletController)
            return outletController;
          throw new Error(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`);
        }
        throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
      }
    },
    [`${camelizedName}Outlets`]: {
      get() {
        const outlets = this.outlets.findAll(name);
        if (outlets.length > 0) {
          return outlets.map((outletElement) => {
            const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
            if (outletController)
              return outletController;
            console.warn(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`, outletElement);
          }).filter((controller) => controller);
        }
        return [];
      }
    },
    [`${camelizedName}OutletElement`]: {
      get() {
        const outletElement = this.outlets.find(name);
        const selector = this.outlets.getSelectorForOutletName(name);
        if (outletElement) {
          return outletElement;
        } else {
          throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
        }
      }
    },
    [`${camelizedName}OutletElements`]: {
      get() {
        return this.outlets.findAll(name);
      }
    },
    [`has${capitalize(camelizedName)}Outlet`]: {
      get() {
        return this.outlets.has(name);
      }
    }
  };
}
function TargetPropertiesBlessing(constructor) {
  const targets = readInheritableStaticArrayValues(constructor, "targets");
  return targets.reduce((properties, targetDefinition) => {
    return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
  }, {});
}
function propertiesForTargetDefinition(name) {
  return {
    [`${name}Target`]: {
      get() {
        const target = this.targets.find(name);
        if (target) {
          return target;
        } else {
          throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
        }
      }
    },
    [`${name}Targets`]: {
      get() {
        return this.targets.findAll(name);
      }
    },
    [`has${capitalize(name)}Target`]: {
      get() {
        return this.targets.has(name);
      }
    }
  };
}
function ValuePropertiesBlessing(constructor) {
  const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
  const propertyDescriptorMap = {
    valueDescriptorMap: {
      get() {
        return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
          const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
          const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
          return Object.assign(result, { [attributeName]: valueDescriptor });
        }, {});
      }
    }
  };
  return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
    return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
  }, propertyDescriptorMap);
}
function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
  const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
  const { key, name, reader: read, writer: write } = definition;
  return {
    [name]: {
      get() {
        const value = this.data.get(key);
        if (value !== null) {
          return read(value);
        } else {
          return definition.defaultValue;
        }
      },
      set(value) {
        if (value === void 0) {
          this.data.delete(key);
        } else {
          this.data.set(key, write(value));
        }
      }
    },
    [`has${capitalize(name)}`]: {
      get() {
        return this.data.has(key) || definition.hasCustomDefaultValue;
      }
    }
  };
}
function parseValueDefinitionPair([token, typeDefinition], controller) {
  return valueDescriptorForTokenAndTypeDefinition({
    controller,
    token,
    typeDefinition
  });
}
function parseValueTypeConstant(constant) {
  switch (constant) {
    case Array:
      return "array";
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case Object:
      return "object";
    case String:
      return "string";
  }
}
function parseValueTypeDefault(defaultValue) {
  switch (typeof defaultValue) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
  }
  if (Array.isArray(defaultValue))
    return "array";
  if (Object.prototype.toString.call(defaultValue) === "[object Object]")
    return "object";
}
function parseValueTypeObject(payload) {
  const { controller, token, typeObject } = payload;
  const hasType = isSomething(typeObject.type);
  const hasDefault = isSomething(typeObject.default);
  const fullObject = hasType && hasDefault;
  const onlyType = hasType && !hasDefault;
  const onlyDefault = !hasType && hasDefault;
  const typeFromObject = parseValueTypeConstant(typeObject.type);
  const typeFromDefaultValue = parseValueTypeDefault(payload.typeObject.default);
  if (onlyType)
    return typeFromObject;
  if (onlyDefault)
    return typeFromDefaultValue;
  if (typeFromObject !== typeFromDefaultValue) {
    const propertyPath = controller ? `${controller}.${token}` : token;
    throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${typeObject.default}" is of type "${typeFromDefaultValue}".`);
  }
  if (fullObject)
    return typeFromObject;
}
function parseValueTypeDefinition(payload) {
  const { controller, token, typeDefinition } = payload;
  const typeObject = { controller, token, typeObject: typeDefinition };
  const typeFromObject = parseValueTypeObject(typeObject);
  const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
  const typeFromConstant = parseValueTypeConstant(typeDefinition);
  const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
  if (type)
    return type;
  const propertyPath = controller ? `${controller}.${typeDefinition}` : token;
  throw new Error(`Unknown value type "${propertyPath}" for "${token}" value`);
}
function defaultValueForDefinition(typeDefinition) {
  const constant = parseValueTypeConstant(typeDefinition);
  if (constant)
    return defaultValuesByType[constant];
  const hasDefault = hasProperty(typeDefinition, "default");
  const hasType = hasProperty(typeDefinition, "type");
  const typeObject = typeDefinition;
  if (hasDefault)
    return typeObject.default;
  if (hasType) {
    const { type } = typeObject;
    const constantFromType = parseValueTypeConstant(type);
    if (constantFromType)
      return defaultValuesByType[constantFromType];
  }
  return typeDefinition;
}
function valueDescriptorForTokenAndTypeDefinition(payload) {
  const { token, typeDefinition } = payload;
  const key = `${dasherize(token)}-value`;
  const type = parseValueTypeDefinition(payload);
  return {
    type,
    key,
    name: camelize(key),
    get defaultValue() {
      return defaultValueForDefinition(typeDefinition);
    },
    get hasCustomDefaultValue() {
      return parseValueTypeDefault(typeDefinition) !== void 0;
    },
    reader: readers[type],
    writer: writers[type] || writers.default
  };
}
var defaultValuesByType = {
  get array() {
    return [];
  },
  boolean: false,
  number: 0,
  get object() {
    return {};
  },
  string: ""
};
var readers = {
  array(value) {
    const array = JSON.parse(value);
    if (!Array.isArray(array)) {
      throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
    }
    return array;
  },
  boolean(value) {
    return !(value == "0" || String(value).toLowerCase() == "false");
  },
  number(value) {
    return Number(value.replace(/_/g, ""));
  },
  object(value) {
    const object = JSON.parse(value);
    if (object === null || typeof object != "object" || Array.isArray(object)) {
      throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
    }
    return object;
  },
  string(value) {
    return value;
  }
};
var writers = {
  default: writeString,
  array: writeJSON,
  object: writeJSON
};
function writeJSON(value) {
  return JSON.stringify(value);
}
function writeString(value) {
  return `${value}`;
}
var Controller = class {
  constructor(context) {
    this.context = context;
  }
  static get shouldLoad() {
    return true;
  }
  static afterLoad(_identifier, _application) {
    return;
  }
  get application() {
    return this.context.application;
  }
  get scope() {
    return this.context.scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get targets() {
    return this.scope.targets;
  }
  get outlets() {
    return this.scope.outlets;
  }
  get classes() {
    return this.scope.classes;
  }
  get data() {
    return this.scope.data;
  }
  initialize() {
  }
  connect() {
  }
  disconnect() {
  }
  dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
    const type = prefix ? `${prefix}:${eventName}` : eventName;
    const event = new CustomEvent(type, { detail, bubbles, cancelable });
    target.dispatchEvent(event);
    return event;
  }
};
Controller.blessings = [
  ClassPropertiesBlessing,
  TargetPropertiesBlessing,
  ValuePropertiesBlessing,
  OutletPropertiesBlessing
];
Controller.targets = [];
Controller.outlets = [];
Controller.values = {};

// app/javascript/controllers/flash_controller.js
var import_toastr = __toESM(require_toastr());
var flash_controller_default = class extends Controller {
  connect() {
    const flashMessagesElement = document.getElementById("flash-messages");
    if (flashMessagesElement) {
      const flashData = JSON.parse(flashMessagesElement.dataset.flash);
      console.log("Flash data:", flashData);
      if (flashData.notice) {
        import_toastr.default.success(flashData.notice);
      }
      if (flashData.alert) {
        import_toastr.default.warning(flashData.alert);
      }
      if (flashData.error) {
        import_toastr.default.error(flashData.error);
      }
    }
  }
};

// app/javascript/controllers/index.js
var application = Application.start();
application.register("flash", flash_controller_default);

// app/javascript/application.js
var import_toastr2 = __toESM(require_toastr());
var import_datatables = __toESM(require_dataTables());
var import_datatables2 = __toESM(require_dataTables_buttons());
var import_buttons_html5 = __toESM(require_buttons_html5());
var import_buttons_print = __toESM(require_buttons_print());

// node_modules/@rails/ujs/app/assets/javascripts/rails-ujs.esm.js
var linkClickSelector = "a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]";
var buttonClickSelector = {
  selector: "button[data-remote]:not([form]), button[data-confirm]:not([form])",
  exclude: "form button"
};
var inputChangeSelector = "select[data-remote], input[data-remote], textarea[data-remote]";
var formSubmitSelector = "form:not([data-turbo=true])";
var formInputClickSelector = "form:not([data-turbo=true]) input[type=submit], form:not([data-turbo=true]) input[type=image], form:not([data-turbo=true]) button[type=submit], form:not([data-turbo=true]) button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])";
var formDisableSelector = "input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled";
var formEnableSelector = "input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled";
var fileInputSelector = "input[name][type=file]:not([disabled])";
var linkDisableSelector = "a[data-disable-with], a[data-disable]";
var buttonDisableSelector = "button[data-remote][data-disable-with], button[data-remote][data-disable]";
var nonce = null;
var loadCSPNonce = () => {
  const metaTag = document.querySelector("meta[name=csp-nonce]");
  return nonce = metaTag && metaTag.content;
};
var cspNonce = () => nonce || loadCSPNonce();
var m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
var matches = function(element, selector) {
  if (selector.exclude) {
    return m.call(element, selector.selector) && !m.call(element, selector.exclude);
  } else {
    return m.call(element, selector);
  }
};
var EXPANDO = "_ujsData";
var getData = (element, key) => element[EXPANDO] ? element[EXPANDO][key] : void 0;
var setData = function(element, key, value) {
  if (!element[EXPANDO]) {
    element[EXPANDO] = {};
  }
  return element[EXPANDO][key] = value;
};
var $ = (selector) => Array.prototype.slice.call(document.querySelectorAll(selector));
var isContentEditable = function(element) {
  var isEditable = false;
  do {
    if (element.isContentEditable) {
      isEditable = true;
      break;
    }
    element = element.parentElement;
  } while (element);
  return isEditable;
};
var csrfToken = () => {
  const meta = document.querySelector("meta[name=csrf-token]");
  return meta && meta.content;
};
var csrfParam = () => {
  const meta = document.querySelector("meta[name=csrf-param]");
  return meta && meta.content;
};
var CSRFProtection = (xhr) => {
  const token = csrfToken();
  if (token) {
    return xhr.setRequestHeader("X-CSRF-Token", token);
  }
};
var refreshCSRFTokens = () => {
  const token = csrfToken();
  const param = csrfParam();
  if (token && param) {
    return $('form input[name="' + param + '"]').forEach((input) => input.value = token);
  }
};
var AcceptHeaders = {
  "*": "*/*",
  text: "text/plain",
  html: "text/html",
  xml: "application/xml, text/xml",
  json: "application/json, text/javascript",
  script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
};
var ajax = (options) => {
  options = prepareOptions(options);
  var xhr = createXHR(options, function() {
    const response = processResponse(xhr.response != null ? xhr.response : xhr.responseText, xhr.getResponseHeader("Content-Type"));
    if (Math.floor(xhr.status / 100) === 2) {
      if (typeof options.success === "function") {
        options.success(response, xhr.statusText, xhr);
      }
    } else {
      if (typeof options.error === "function") {
        options.error(response, xhr.statusText, xhr);
      }
    }
    return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
  });
  if (options.beforeSend && !options.beforeSend(xhr, options)) {
    return false;
  }
  if (xhr.readyState === XMLHttpRequest.OPENED) {
    return xhr.send(options.data);
  }
};
var prepareOptions = function(options) {
  options.url = options.url || location.href;
  options.type = options.type.toUpperCase();
  if (options.type === "GET" && options.data) {
    if (options.url.indexOf("?") < 0) {
      options.url += "?" + options.data;
    } else {
      options.url += "&" + options.data;
    }
  }
  if (!(options.dataType in AcceptHeaders)) {
    options.dataType = "*";
  }
  options.accept = AcceptHeaders[options.dataType];
  if (options.dataType !== "*") {
    options.accept += ", */*; q=0.01";
  }
  return options;
};
var createXHR = function(options, done) {
  const xhr = new XMLHttpRequest();
  xhr.open(options.type, options.url, true);
  xhr.setRequestHeader("Accept", options.accept);
  if (typeof options.data === "string") {
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  }
  if (!options.crossDomain) {
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    CSRFProtection(xhr);
  }
  xhr.withCredentials = !!options.withCredentials;
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      return done(xhr);
    }
  };
  return xhr;
};
var processResponse = function(response, type) {
  if (typeof response === "string" && typeof type === "string") {
    if (type.match(/\bjson\b/)) {
      try {
        response = JSON.parse(response);
      } catch (error2) {
      }
    } else if (type.match(/\b(?:java|ecma)script\b/)) {
      const script = document.createElement("script");
      script.setAttribute("nonce", cspNonce());
      script.text = response;
      document.head.appendChild(script).parentNode.removeChild(script);
    } else if (type.match(/\b(xml|html|svg)\b/)) {
      const parser = new DOMParser();
      type = type.replace(/;.+/, "");
      try {
        response = parser.parseFromString(response, type);
      } catch (error1) {
      }
    }
  }
  return response;
};
var href = (element) => element.href;
var isCrossDomain = function(url) {
  const originAnchor = document.createElement("a");
  originAnchor.href = location.href;
  const urlAnchor = document.createElement("a");
  try {
    urlAnchor.href = url;
    return !((!urlAnchor.protocol || urlAnchor.protocol === ":") && !urlAnchor.host || originAnchor.protocol + "//" + originAnchor.host === urlAnchor.protocol + "//" + urlAnchor.host);
  } catch (e) {
    return true;
  }
};
var preventDefault;
var { CustomEvent: CustomEvent2 } = window;
if (typeof CustomEvent2 !== "function") {
  CustomEvent2 = function(event, params) {
    const evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };
  CustomEvent2.prototype = window.Event.prototype;
  ({ preventDefault } = CustomEvent2.prototype);
  CustomEvent2.prototype.preventDefault = function() {
    const result = preventDefault.call(this);
    if (this.cancelable && !this.defaultPrevented) {
      Object.defineProperty(this, "defaultPrevented", {
        get() {
          return true;
        }
      });
    }
    return result;
  };
}
var fire = (obj, name, data) => {
  const event = new CustomEvent2(name, {
    bubbles: true,
    cancelable: true,
    detail: data
  });
  obj.dispatchEvent(event);
  return !event.defaultPrevented;
};
var stopEverything = (e) => {
  fire(e.target, "ujs:everythingStopped");
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
};
var delegate = (element, selector, eventType, handler) => element.addEventListener(eventType, function(e) {
  let { target } = e;
  while (!!(target instanceof Element) && !matches(target, selector)) {
    target = target.parentNode;
  }
  if (target instanceof Element && handler.call(target, e) === false) {
    e.preventDefault();
    e.stopPropagation();
  }
});
var toArray = (e) => Array.prototype.slice.call(e);
var serializeElement = (element, additionalParam) => {
  let inputs = [element];
  if (matches(element, "form")) {
    inputs = toArray(element.elements);
  }
  const params = [];
  inputs.forEach(function(input) {
    if (!input.name || input.disabled) {
      return;
    }
    if (matches(input, "fieldset[disabled] *")) {
      return;
    }
    if (matches(input, "select")) {
      toArray(input.options).forEach(function(option) {
        if (option.selected) {
          params.push({
            name: input.name,
            value: option.value
          });
        }
      });
    } else if (input.checked || ["radio", "checkbox", "submit"].indexOf(input.type) === -1) {
      params.push({
        name: input.name,
        value: input.value
      });
    }
  });
  if (additionalParam) {
    params.push(additionalParam);
  }
  return params.map(function(param) {
    if (param.name) {
      return `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`;
    } else {
      return param;
    }
  }).join("&");
};
var formElements = (form, selector) => {
  if (matches(form, "form")) {
    return toArray(form.elements).filter((el) => matches(el, selector));
  } else {
    return toArray(form.querySelectorAll(selector));
  }
};
var handleConfirmWithRails = (rails) => function(e) {
  if (!allowAction(this, rails)) {
    stopEverything(e);
  }
};
var confirm2 = (message, element) => window.confirm(message);
var allowAction = function(element, rails) {
  let callback;
  const message = element.getAttribute("data-confirm");
  if (!message) {
    return true;
  }
  let answer = false;
  if (fire(element, "confirm")) {
    try {
      answer = rails.confirm(message, element);
    } catch (error2) {
    }
    callback = fire(element, "confirm:complete", [answer]);
  }
  return answer && callback;
};
var handleDisabledElement = function(e) {
  const element = this;
  if (element.disabled) {
    stopEverything(e);
  }
};
var enableElement = (e) => {
  let element;
  if (e instanceof Event) {
    if (isXhrRedirect(e)) {
      return;
    }
    element = e.target;
  } else {
    element = e;
  }
  if (isContentEditable(element)) {
    return;
  }
  if (matches(element, linkDisableSelector)) {
    return enableLinkElement(element);
  } else if (matches(element, buttonDisableSelector) || matches(element, formEnableSelector)) {
    return enableFormElement(element);
  } else if (matches(element, formSubmitSelector)) {
    return enableFormElements(element);
  }
};
var disableElement = (e) => {
  const element = e instanceof Event ? e.target : e;
  if (isContentEditable(element)) {
    return;
  }
  if (matches(element, linkDisableSelector)) {
    return disableLinkElement(element);
  } else if (matches(element, buttonDisableSelector) || matches(element, formDisableSelector)) {
    return disableFormElement(element);
  } else if (matches(element, formSubmitSelector)) {
    return disableFormElements(element);
  }
};
var disableLinkElement = function(element) {
  if (getData(element, "ujs:disabled")) {
    return;
  }
  const replacement = element.getAttribute("data-disable-with");
  if (replacement != null) {
    setData(element, "ujs:enable-with", element.innerHTML);
    element.innerHTML = replacement;
  }
  element.addEventListener("click", stopEverything);
  return setData(element, "ujs:disabled", true);
};
var enableLinkElement = function(element) {
  const originalText = getData(element, "ujs:enable-with");
  if (originalText != null) {
    element.innerHTML = originalText;
    setData(element, "ujs:enable-with", null);
  }
  element.removeEventListener("click", stopEverything);
  return setData(element, "ujs:disabled", null);
};
var disableFormElements = (form) => formElements(form, formDisableSelector).forEach(disableFormElement);
var disableFormElement = function(element) {
  if (getData(element, "ujs:disabled")) {
    return;
  }
  const replacement = element.getAttribute("data-disable-with");
  if (replacement != null) {
    if (matches(element, "button")) {
      setData(element, "ujs:enable-with", element.innerHTML);
      element.innerHTML = replacement;
    } else {
      setData(element, "ujs:enable-with", element.value);
      element.value = replacement;
    }
  }
  element.disabled = true;
  return setData(element, "ujs:disabled", true);
};
var enableFormElements = (form) => formElements(form, formEnableSelector).forEach((element) => enableFormElement(element));
var enableFormElement = function(element) {
  const originalText = getData(element, "ujs:enable-with");
  if (originalText != null) {
    if (matches(element, "button")) {
      element.innerHTML = originalText;
    } else {
      element.value = originalText;
    }
    setData(element, "ujs:enable-with", null);
  }
  element.disabled = false;
  return setData(element, "ujs:disabled", null);
};
var isXhrRedirect = function(event) {
  const xhr = event.detail ? event.detail[0] : void 0;
  return xhr && xhr.getResponseHeader("X-Xhr-Redirect");
};
var handleMethodWithRails = (rails) => function(e) {
  const link = this;
  const method = link.getAttribute("data-method");
  if (!method) {
    return;
  }
  if (isContentEditable(this)) {
    return;
  }
  const href2 = rails.href(link);
  const csrfToken$1 = csrfToken();
  const csrfParam$1 = csrfParam();
  const form = document.createElement("form");
  let formContent = `<input name='_method' value='${method}' type='hidden' />`;
  if (csrfParam$1 && csrfToken$1 && !isCrossDomain(href2)) {
    formContent += `<input name='${csrfParam$1}' value='${csrfToken$1}' type='hidden' />`;
  }
  formContent += '<input type="submit" />';
  form.method = "post";
  form.action = href2;
  form.target = link.target;
  form.innerHTML = formContent;
  form.style.display = "none";
  document.body.appendChild(form);
  form.querySelector('[type="submit"]').click();
  stopEverything(e);
};
var isRemote = function(element) {
  const value = element.getAttribute("data-remote");
  return value != null && value !== "false";
};
var handleRemoteWithRails = (rails) => function(e) {
  let data, method, url;
  const element = this;
  if (!isRemote(element)) {
    return true;
  }
  if (!fire(element, "ajax:before")) {
    fire(element, "ajax:stopped");
    return false;
  }
  if (isContentEditable(element)) {
    fire(element, "ajax:stopped");
    return false;
  }
  const withCredentials = element.getAttribute("data-with-credentials");
  const dataType = element.getAttribute("data-type") || "script";
  if (matches(element, formSubmitSelector)) {
    const button = getData(element, "ujs:submit-button");
    method = getData(element, "ujs:submit-button-formmethod") || element.getAttribute("method") || "get";
    url = getData(element, "ujs:submit-button-formaction") || element.getAttribute("action") || location.href;
    if (method.toUpperCase() === "GET") {
      url = url.replace(/\?.*$/, "");
    }
    if (element.enctype === "multipart/form-data") {
      data = new FormData(element);
      if (button != null) {
        data.append(button.name, button.value);
      }
    } else {
      data = serializeElement(element, button);
    }
    setData(element, "ujs:submit-button", null);
    setData(element, "ujs:submit-button-formmethod", null);
    setData(element, "ujs:submit-button-formaction", null);
  } else if (matches(element, buttonClickSelector) || matches(element, inputChangeSelector)) {
    method = element.getAttribute("data-method");
    url = element.getAttribute("data-url");
    data = serializeElement(element, element.getAttribute("data-params"));
  } else {
    method = element.getAttribute("data-method");
    url = rails.href(element);
    data = element.getAttribute("data-params");
  }
  ajax({
    type: method || "GET",
    url,
    data,
    dataType,
    beforeSend(xhr, options) {
      if (fire(element, "ajax:beforeSend", [xhr, options])) {
        return fire(element, "ajax:send", [xhr]);
      } else {
        fire(element, "ajax:stopped");
        return false;
      }
    },
    success(...args) {
      return fire(element, "ajax:success", args);
    },
    error(...args) {
      return fire(element, "ajax:error", args);
    },
    complete(...args) {
      return fire(element, "ajax:complete", args);
    },
    crossDomain: isCrossDomain(url),
    withCredentials: withCredentials != null && withCredentials !== "false"
  });
  stopEverything(e);
};
var formSubmitButtonClick = function(e) {
  const button = this;
  const { form } = button;
  if (!form) {
    return;
  }
  if (button.name) {
    setData(form, "ujs:submit-button", {
      name: button.name,
      value: button.value
    });
  }
  setData(form, "ujs:formnovalidate-button", button.formNoValidate);
  setData(form, "ujs:submit-button-formaction", button.getAttribute("formaction"));
  return setData(form, "ujs:submit-button-formmethod", button.getAttribute("formmethod"));
};
var preventInsignificantClick = function(e) {
  const link = this;
  const method = (link.getAttribute("data-method") || "GET").toUpperCase();
  const data = link.getAttribute("data-params");
  const metaClick = e.metaKey || e.ctrlKey;
  const insignificantMetaClick = metaClick && method === "GET" && !data;
  const nonPrimaryMouseClick = e.button != null && e.button !== 0;
  if (nonPrimaryMouseClick || insignificantMetaClick) {
    e.stopImmediatePropagation();
  }
};
var Rails = {
  $,
  ajax,
  buttonClickSelector,
  buttonDisableSelector,
  confirm: confirm2,
  cspNonce,
  csrfToken,
  csrfParam,
  CSRFProtection,
  delegate,
  disableElement,
  enableElement,
  fileInputSelector,
  fire,
  formElements,
  formEnableSelector,
  formDisableSelector,
  formInputClickSelector,
  formSubmitButtonClick,
  formSubmitSelector,
  getData,
  handleDisabledElement,
  href,
  inputChangeSelector,
  isCrossDomain,
  linkClickSelector,
  linkDisableSelector,
  loadCSPNonce,
  matches,
  preventInsignificantClick,
  refreshCSRFTokens,
  serializeElement,
  setData,
  stopEverything
};
var handleConfirm = handleConfirmWithRails(Rails);
Rails.handleConfirm = handleConfirm;
var handleMethod = handleMethodWithRails(Rails);
Rails.handleMethod = handleMethod;
var handleRemote = handleRemoteWithRails(Rails);
Rails.handleRemote = handleRemote;
var start2 = function() {
  if (window._rails_loaded) {
    throw new Error("rails-ujs has already been loaded!");
  }
  window.addEventListener("pageshow", function() {
    $(formEnableSelector).forEach(function(el) {
      if (getData(el, "ujs:disabled")) {
        enableElement(el);
      }
    });
    $(linkDisableSelector).forEach(function(el) {
      if (getData(el, "ujs:disabled")) {
        enableElement(el);
      }
    });
  });
  delegate(document, linkDisableSelector, "ajax:complete", enableElement);
  delegate(document, linkDisableSelector, "ajax:stopped", enableElement);
  delegate(document, buttonDisableSelector, "ajax:complete", enableElement);
  delegate(document, buttonDisableSelector, "ajax:stopped", enableElement);
  delegate(document, linkClickSelector, "click", preventInsignificantClick);
  delegate(document, linkClickSelector, "click", handleDisabledElement);
  delegate(document, linkClickSelector, "click", handleConfirm);
  delegate(document, linkClickSelector, "click", disableElement);
  delegate(document, linkClickSelector, "click", handleRemote);
  delegate(document, linkClickSelector, "click", handleMethod);
  delegate(document, buttonClickSelector, "click", preventInsignificantClick);
  delegate(document, buttonClickSelector, "click", handleDisabledElement);
  delegate(document, buttonClickSelector, "click", handleConfirm);
  delegate(document, buttonClickSelector, "click", disableElement);
  delegate(document, buttonClickSelector, "click", handleRemote);
  delegate(document, inputChangeSelector, "change", handleDisabledElement);
  delegate(document, inputChangeSelector, "change", handleConfirm);
  delegate(document, inputChangeSelector, "change", handleRemote);
  delegate(document, formSubmitSelector, "submit", handleDisabledElement);
  delegate(document, formSubmitSelector, "submit", handleConfirm);
  delegate(document, formSubmitSelector, "submit", handleRemote);
  delegate(document, formSubmitSelector, "submit", (e) => setTimeout(() => disableElement(e), 13));
  delegate(document, formSubmitSelector, "ajax:send", disableElement);
  delegate(document, formSubmitSelector, "ajax:complete", enableElement);
  delegate(document, formInputClickSelector, "click", preventInsignificantClick);
  delegate(document, formInputClickSelector, "click", handleDisabledElement);
  delegate(document, formInputClickSelector, "click", handleConfirm);
  delegate(document, formInputClickSelector, "click", formSubmitButtonClick);
  document.addEventListener("DOMContentLoaded", refreshCSRFTokens);
  document.addEventListener("DOMContentLoaded", loadCSPNonce);
  return window._rails_loaded = true;
};
Rails.start = start2;
if (typeof jQuery !== "undefined" && jQuery && jQuery.ajax) {
  if (jQuery.rails) {
    throw new Error("If you load both jquery_ujs and rails-ujs, use rails-ujs only.");
  }
  jQuery.rails = Rails;
  jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
    if (!options.crossDomain) {
      return CSRFProtection(xhr);
    }
  });
}

// app/javascript/application.js
var import_jquery = __toESM(require_jquery());
window.$ = window.jQuery = import_jquery.default;
Rails.start();
require_activestorage().start();
function calculatePageLength() {
  const windowHeight = (0, import_jquery.default)(window).height();
  const baseLength = 8;
  let pageLength;
  if (windowHeight < 600) {
    pageLength = Math.max(3, baseLength - 4);
  } else if (windowHeight < 800) {
    pageLength = Math.max(5, baseLength - 2);
  } else {
    pageLength = baseLength;
  }
  if (pageLength >= 7) {
    return pageLength - 1;
  } else if (pageLength >= 5) {
    return pageLength - 1;
  } else if (pageLength >= 4) {
    return pageLength - 1;
  } else {
    return pageLength;
  }
}
function initializeDataTables() {
  document.querySelectorAll(".table-datatables").forEach((table) => {
    if (!import_jquery.default.fn.DataTable.isDataTable(table)) {
      var tableInstance = (0, import_jquery.default)(table).DataTable({
        dom: "Bfrtip",
        buttons: [
          {
            extend: "csv",
            exportOptions: {
              columns: ":not(:last-child)"
              // Excluye la última columna
            }
          },
          {
            extend: "print",
            exportOptions: {
              columns: ":not(:last-child)"
              // Excluye la última columna
            }
          }
        ],
        paging: true,
        searching: true,
        info: true,
        ordering: true,
        pageLength: calculatePageLength()
      });
      window.addEventListener("resize", function() {
        tableInstance.page.len(calculatePageLength()).draw();
      });
    }
  });
}
document.addEventListener("turbo:load", () => {
  const flashMessagesElement = document.getElementById("flash-messages");
  if (flashMessagesElement) {
    const flashData = JSON.parse(flashMessagesElement.dataset.flash);
    console.log("Flash data:", flashData);
    if (flashData.notice) {
      import_toastr2.default.success(flashData.notice);
    }
    if (flashData.alert) {
      import_toastr2.default.warning(flashData.alert);
    }
    if (flashData.error) {
      import_toastr2.default.error(flashData.error);
    }
  } else {
    console.log("No flash messages element found");
  }
  initializeDataTables();
});
/*! Bundled license information:

jquery/dist/jquery.js:
  (*!
   * jQuery JavaScript Library v3.7.1
   * https://jquery.com/
   *
   * Copyright OpenJS Foundation and other contributors
   * Released under the MIT license
   * https://jquery.org/license
   *
   * Date: 2023-08-28T13:37Z
   *)

datatables.net/js/dataTables.js:
  (*! DataTables 2.0.8
   * © SpryMedia Ltd - datatables.net/license
   *)

datatables.net-buttons/js/dataTables.buttons.js:
  (*! Buttons for DataTables 3.0.2
   * © SpryMedia Ltd - datatables.net/license
   *)

datatables.net-buttons/js/buttons.html5.js:
  (*!
   * HTML5 export buttons for Buttons and DataTables.
   * © SpryMedia Ltd - datatables.net/license
   *
   * FileSaver.js (1.3.3) - MIT license
   * Copyright © 2016 Eli Grey - http://eligrey.com
   *)

datatables.net-buttons/js/buttons.print.js:
  (*!
   * Print button for Buttons and DataTables.
   * © SpryMedia Ltd - datatables.net/license
   *)
*/
//# sourceMappingURL=/assets/application.js.map
