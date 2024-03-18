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

// node_modules/xterm/lib/xterm.js
var require_xterm = __commonJS({
  "node_modules/xterm/lib/xterm.js"(exports, module) {
    !function(e, t) {
      if ("object" == typeof exports && "object" == typeof module)
        module.exports = t();
      else if ("function" == typeof define && define.amd)
        define([], t);
      else {
        var i = t();
        for (var s in i)
          ("object" == typeof exports ? exports : e)[s] = i[s];
      }
    }(self, () => (() => {
      "use strict";
      var e = { 4567: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.AccessibilityManager = void 0;
        const n = i2(9042), o = i2(6114), a = i2(9924), h = i2(844), c = i2(5596), l = i2(4725), d = i2(3656);
        let _ = t2.AccessibilityManager = class extends h.Disposable {
          constructor(e3, t3) {
            super(), this._terminal = e3, this._renderService = t3, this._liveRegionLineCount = 0, this._charsToConsume = [], this._charsToAnnounce = "", this._accessibilityContainer = document.createElement("div"), this._accessibilityContainer.classList.add("xterm-accessibility"), this._rowContainer = document.createElement("div"), this._rowContainer.setAttribute("role", "list"), this._rowContainer.classList.add("xterm-accessibility-tree"), this._rowElements = [];
            for (let e4 = 0; e4 < this._terminal.rows; e4++)
              this._rowElements[e4] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e4]);
            if (this._topBoundaryFocusListener = (e4) => this._handleBoundaryFocus(e4, 0), this._bottomBoundaryFocusListener = (e4) => this._handleBoundaryFocus(e4, 1), this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions(), this._accessibilityContainer.appendChild(this._rowContainer), this._liveRegion = document.createElement("div"), this._liveRegion.classList.add("live-region"), this._liveRegion.setAttribute("aria-live", "assertive"), this._accessibilityContainer.appendChild(this._liveRegion), this._liveRegionDebouncer = this.register(new a.TimeBasedDebouncer(this._renderRows.bind(this))), !this._terminal.element)
              throw new Error("Cannot enable accessibility before Terminal.open");
            this._terminal.element.insertAdjacentElement("afterbegin", this._accessibilityContainer), this.register(this._terminal.onResize((e4) => this._handleResize(e4.rows))), this.register(this._terminal.onRender((e4) => this._refreshRows(e4.start, e4.end))), this.register(this._terminal.onScroll(() => this._refreshRows())), this.register(this._terminal.onA11yChar((e4) => this._handleChar(e4))), this.register(this._terminal.onLineFeed(() => this._handleChar("\n"))), this.register(this._terminal.onA11yTab((e4) => this._handleTab(e4))), this.register(this._terminal.onKey((e4) => this._handleKey(e4.key))), this.register(this._terminal.onBlur(() => this._clearLiveRegion())), this.register(this._renderService.onDimensionsChange(() => this._refreshRowsDimensions())), this._screenDprMonitor = new c.ScreenDprMonitor(window), this.register(this._screenDprMonitor), this._screenDprMonitor.setListener(() => this._refreshRowsDimensions()), this.register((0, d.addDisposableDomListener)(window, "resize", () => this._refreshRowsDimensions())), this._refreshRows(), this.register((0, h.toDisposable)(() => {
              this._accessibilityContainer.remove(), this._rowElements.length = 0;
            }));
          }
          _handleTab(e3) {
            for (let t3 = 0; t3 < e3; t3++)
              this._handleChar(" ");
          }
          _handleChar(e3) {
            this._liveRegionLineCount < 21 && (this._charsToConsume.length > 0 ? this._charsToConsume.shift() !== e3 && (this._charsToAnnounce += e3) : this._charsToAnnounce += e3, "\n" === e3 && (this._liveRegionLineCount++, 21 === this._liveRegionLineCount && (this._liveRegion.textContent += n.tooMuchOutput)), o.isMac && this._liveRegion.textContent && this._liveRegion.textContent.length > 0 && !this._liveRegion.parentNode && setTimeout(() => {
              this._accessibilityContainer.appendChild(this._liveRegion);
            }, 0));
          }
          _clearLiveRegion() {
            this._liveRegion.textContent = "", this._liveRegionLineCount = 0, o.isMac && this._liveRegion.remove();
          }
          _handleKey(e3) {
            this._clearLiveRegion(), /\p{Control}/u.test(e3) || this._charsToConsume.push(e3);
          }
          _refreshRows(e3, t3) {
            this._liveRegionDebouncer.refresh(e3, t3, this._terminal.rows);
          }
          _renderRows(e3, t3) {
            const i3 = this._terminal.buffer, s3 = i3.lines.length.toString();
            for (let r2 = e3; r2 <= t3; r2++) {
              const e4 = i3.translateBufferLineToString(i3.ydisp + r2, true), t4 = (i3.ydisp + r2 + 1).toString(), n2 = this._rowElements[r2];
              n2 && (0 === e4.length ? n2.innerText = "\xA0" : n2.textContent = e4, n2.setAttribute("aria-posinset", t4), n2.setAttribute("aria-setsize", s3));
            }
            this._announceCharacters();
          }
          _announceCharacters() {
            0 !== this._charsToAnnounce.length && (this._liveRegion.textContent += this._charsToAnnounce, this._charsToAnnounce = "");
          }
          _handleBoundaryFocus(e3, t3) {
            const i3 = e3.target, s3 = this._rowElements[0 === t3 ? 1 : this._rowElements.length - 2];
            if (i3.getAttribute("aria-posinset") === (0 === t3 ? "1" : `${this._terminal.buffer.lines.length}`))
              return;
            if (e3.relatedTarget !== s3)
              return;
            let r2, n2;
            if (0 === t3 ? (r2 = i3, n2 = this._rowElements.pop(), this._rowContainer.removeChild(n2)) : (r2 = this._rowElements.shift(), n2 = i3, this._rowContainer.removeChild(r2)), r2.removeEventListener("focus", this._topBoundaryFocusListener), n2.removeEventListener("focus", this._bottomBoundaryFocusListener), 0 === t3) {
              const e4 = this._createAccessibilityTreeNode();
              this._rowElements.unshift(e4), this._rowContainer.insertAdjacentElement("afterbegin", e4);
            } else {
              const e4 = this._createAccessibilityTreeNode();
              this._rowElements.push(e4), this._rowContainer.appendChild(e4);
            }
            this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._terminal.scrollLines(0 === t3 ? -1 : 1), this._rowElements[0 === t3 ? 1 : this._rowElements.length - 2].focus(), e3.preventDefault(), e3.stopImmediatePropagation();
          }
          _handleResize(e3) {
            this._rowElements[this._rowElements.length - 1].removeEventListener("focus", this._bottomBoundaryFocusListener);
            for (let e4 = this._rowContainer.children.length; e4 < this._terminal.rows; e4++)
              this._rowElements[e4] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e4]);
            for (; this._rowElements.length > e3; )
              this._rowContainer.removeChild(this._rowElements.pop());
            this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions();
          }
          _createAccessibilityTreeNode() {
            const e3 = document.createElement("div");
            return e3.setAttribute("role", "listitem"), e3.tabIndex = -1, this._refreshRowDimensions(e3), e3;
          }
          _refreshRowsDimensions() {
            if (this._renderService.dimensions.css.cell.height) {
              this._accessibilityContainer.style.width = `${this._renderService.dimensions.css.canvas.width}px`, this._rowElements.length !== this._terminal.rows && this._handleResize(this._terminal.rows);
              for (let e3 = 0; e3 < this._terminal.rows; e3++)
                this._refreshRowDimensions(this._rowElements[e3]);
            }
          }
          _refreshRowDimensions(e3) {
            e3.style.height = `${this._renderService.dimensions.css.cell.height}px`;
          }
        };
        t2.AccessibilityManager = _ = s2([r(1, l.IRenderService)], _);
      }, 3614: (e2, t2) => {
        function i2(e3) {
          return e3.replace(/\r?\n/g, "\r");
        }
        function s2(e3, t3) {
          return t3 ? "\x1B[200~" + e3 + "\x1B[201~" : e3;
        }
        function r(e3, t3, r2, n2) {
          e3 = s2(e3 = i2(e3), r2.decPrivateModes.bracketedPasteMode && true !== n2.rawOptions.ignoreBracketedPasteMode), r2.triggerDataEvent(e3, true), t3.value = "";
        }
        function n(e3, t3, i3) {
          const s3 = i3.getBoundingClientRect(), r2 = e3.clientX - s3.left - 10, n2 = e3.clientY - s3.top - 10;
          t3.style.width = "20px", t3.style.height = "20px", t3.style.left = `${r2}px`, t3.style.top = `${n2}px`, t3.style.zIndex = "1000", t3.focus();
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.rightClickHandler = t2.moveTextAreaUnderMouseCursor = t2.paste = t2.handlePasteEvent = t2.copyHandler = t2.bracketTextForPaste = t2.prepareTextForTerminal = void 0, t2.prepareTextForTerminal = i2, t2.bracketTextForPaste = s2, t2.copyHandler = function(e3, t3) {
          e3.clipboardData && e3.clipboardData.setData("text/plain", t3.selectionText), e3.preventDefault();
        }, t2.handlePasteEvent = function(e3, t3, i3, s3) {
          e3.stopPropagation(), e3.clipboardData && r(e3.clipboardData.getData("text/plain"), t3, i3, s3);
        }, t2.paste = r, t2.moveTextAreaUnderMouseCursor = n, t2.rightClickHandler = function(e3, t3, i3, s3, r2) {
          n(e3, t3, i3), r2 && s3.rightClickSelect(e3), t3.value = s3.selectionText, t3.select();
        };
      }, 7239: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ColorContrastCache = void 0;
        const s2 = i2(1505);
        t2.ColorContrastCache = class {
          constructor() {
            this._color = new s2.TwoKeyMap(), this._css = new s2.TwoKeyMap();
          }
          setCss(e3, t3, i3) {
            this._css.set(e3, t3, i3);
          }
          getCss(e3, t3) {
            return this._css.get(e3, t3);
          }
          setColor(e3, t3, i3) {
            this._color.set(e3, t3, i3);
          }
          getColor(e3, t3) {
            return this._color.get(e3, t3);
          }
          clear() {
            this._color.clear(), this._css.clear();
          }
        };
      }, 3656: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.addDisposableDomListener = void 0, t2.addDisposableDomListener = function(e3, t3, i2, s2) {
          e3.addEventListener(t3, i2, s2);
          let r = false;
          return { dispose: () => {
            r || (r = true, e3.removeEventListener(t3, i2, s2));
          } };
        };
      }, 6465: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Linkifier2 = void 0;
        const n = i2(3656), o = i2(8460), a = i2(844), h = i2(2585);
        let c = t2.Linkifier2 = class extends a.Disposable {
          get currentLink() {
            return this._currentLink;
          }
          constructor(e3) {
            super(), this._bufferService = e3, this._linkProviders = [], this._linkCacheDisposables = [], this._isMouseOut = true, this._wasResized = false, this._activeLine = -1, this._onShowLinkUnderline = this.register(new o.EventEmitter()), this.onShowLinkUnderline = this._onShowLinkUnderline.event, this._onHideLinkUnderline = this.register(new o.EventEmitter()), this.onHideLinkUnderline = this._onHideLinkUnderline.event, this.register((0, a.getDisposeArrayDisposable)(this._linkCacheDisposables)), this.register((0, a.toDisposable)(() => {
              this._lastMouseEvent = void 0;
            })), this.register(this._bufferService.onResize(() => {
              this._clearCurrentLink(), this._wasResized = true;
            }));
          }
          registerLinkProvider(e3) {
            return this._linkProviders.push(e3), { dispose: () => {
              const t3 = this._linkProviders.indexOf(e3);
              -1 !== t3 && this._linkProviders.splice(t3, 1);
            } };
          }
          attachToDom(e3, t3, i3) {
            this._element = e3, this._mouseService = t3, this._renderService = i3, this.register((0, n.addDisposableDomListener)(this._element, "mouseleave", () => {
              this._isMouseOut = true, this._clearCurrentLink();
            })), this.register((0, n.addDisposableDomListener)(this._element, "mousemove", this._handleMouseMove.bind(this))), this.register((0, n.addDisposableDomListener)(this._element, "mousedown", this._handleMouseDown.bind(this))), this.register((0, n.addDisposableDomListener)(this._element, "mouseup", this._handleMouseUp.bind(this)));
          }
          _handleMouseMove(e3) {
            if (this._lastMouseEvent = e3, !this._element || !this._mouseService)
              return;
            const t3 = this._positionFromMouseEvent(e3, this._element, this._mouseService);
            if (!t3)
              return;
            this._isMouseOut = false;
            const i3 = e3.composedPath();
            for (let e4 = 0; e4 < i3.length; e4++) {
              const t4 = i3[e4];
              if (t4.classList.contains("xterm"))
                break;
              if (t4.classList.contains("xterm-hover"))
                return;
            }
            this._lastBufferCell && t3.x === this._lastBufferCell.x && t3.y === this._lastBufferCell.y || (this._handleHover(t3), this._lastBufferCell = t3);
          }
          _handleHover(e3) {
            if (this._activeLine !== e3.y || this._wasResized)
              return this._clearCurrentLink(), this._askForLink(e3, false), void (this._wasResized = false);
            this._currentLink && this._linkAtPosition(this._currentLink.link, e3) || (this._clearCurrentLink(), this._askForLink(e3, true));
          }
          _askForLink(e3, t3) {
            var i3, s3;
            this._activeProviderReplies && t3 || (null === (i3 = this._activeProviderReplies) || void 0 === i3 || i3.forEach((e4) => {
              null == e4 || e4.forEach((e5) => {
                e5.link.dispose && e5.link.dispose();
              });
            }), this._activeProviderReplies = /* @__PURE__ */ new Map(), this._activeLine = e3.y);
            let r2 = false;
            for (const [i4, n2] of this._linkProviders.entries())
              t3 ? (null === (s3 = this._activeProviderReplies) || void 0 === s3 ? void 0 : s3.get(i4)) && (r2 = this._checkLinkProviderResult(i4, e3, r2)) : n2.provideLinks(e3.y, (t4) => {
                var s4, n3;
                if (this._isMouseOut)
                  return;
                const o2 = null == t4 ? void 0 : t4.map((e4) => ({ link: e4 }));
                null === (s4 = this._activeProviderReplies) || void 0 === s4 || s4.set(i4, o2), r2 = this._checkLinkProviderResult(i4, e3, r2), (null === (n3 = this._activeProviderReplies) || void 0 === n3 ? void 0 : n3.size) === this._linkProviders.length && this._removeIntersectingLinks(e3.y, this._activeProviderReplies);
              });
          }
          _removeIntersectingLinks(e3, t3) {
            const i3 = /* @__PURE__ */ new Set();
            for (let s3 = 0; s3 < t3.size; s3++) {
              const r2 = t3.get(s3);
              if (r2)
                for (let t4 = 0; t4 < r2.length; t4++) {
                  const s4 = r2[t4], n2 = s4.link.range.start.y < e3 ? 0 : s4.link.range.start.x, o2 = s4.link.range.end.y > e3 ? this._bufferService.cols : s4.link.range.end.x;
                  for (let e4 = n2; e4 <= o2; e4++) {
                    if (i3.has(e4)) {
                      r2.splice(t4--, 1);
                      break;
                    }
                    i3.add(e4);
                  }
                }
            }
          }
          _checkLinkProviderResult(e3, t3, i3) {
            var s3;
            if (!this._activeProviderReplies)
              return i3;
            const r2 = this._activeProviderReplies.get(e3);
            let n2 = false;
            for (let t4 = 0; t4 < e3; t4++)
              this._activeProviderReplies.has(t4) && !this._activeProviderReplies.get(t4) || (n2 = true);
            if (!n2 && r2) {
              const e4 = r2.find((e5) => this._linkAtPosition(e5.link, t3));
              e4 && (i3 = true, this._handleNewLink(e4));
            }
            if (this._activeProviderReplies.size === this._linkProviders.length && !i3)
              for (let e4 = 0; e4 < this._activeProviderReplies.size; e4++) {
                const r3 = null === (s3 = this._activeProviderReplies.get(e4)) || void 0 === s3 ? void 0 : s3.find((e5) => this._linkAtPosition(e5.link, t3));
                if (r3) {
                  i3 = true, this._handleNewLink(r3);
                  break;
                }
              }
            return i3;
          }
          _handleMouseDown() {
            this._mouseDownLink = this._currentLink;
          }
          _handleMouseUp(e3) {
            if (!this._element || !this._mouseService || !this._currentLink)
              return;
            const t3 = this._positionFromMouseEvent(e3, this._element, this._mouseService);
            t3 && this._mouseDownLink === this._currentLink && this._linkAtPosition(this._currentLink.link, t3) && this._currentLink.link.activate(e3, this._currentLink.link.text);
          }
          _clearCurrentLink(e3, t3) {
            this._element && this._currentLink && this._lastMouseEvent && (!e3 || !t3 || this._currentLink.link.range.start.y >= e3 && this._currentLink.link.range.end.y <= t3) && (this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent), this._currentLink = void 0, (0, a.disposeArray)(this._linkCacheDisposables));
          }
          _handleNewLink(e3) {
            if (!this._element || !this._lastMouseEvent || !this._mouseService)
              return;
            const t3 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
            t3 && this._linkAtPosition(e3.link, t3) && (this._currentLink = e3, this._currentLink.state = { decorations: { underline: void 0 === e3.link.decorations || e3.link.decorations.underline, pointerCursor: void 0 === e3.link.decorations || e3.link.decorations.pointerCursor }, isHovered: true }, this._linkHover(this._element, e3.link, this._lastMouseEvent), e3.link.decorations = {}, Object.defineProperties(e3.link.decorations, { pointerCursor: { get: () => {
              var e4, t4;
              return null === (t4 = null === (e4 = this._currentLink) || void 0 === e4 ? void 0 : e4.state) || void 0 === t4 ? void 0 : t4.decorations.pointerCursor;
            }, set: (e4) => {
              var t4, i3;
              (null === (t4 = this._currentLink) || void 0 === t4 ? void 0 : t4.state) && this._currentLink.state.decorations.pointerCursor !== e4 && (this._currentLink.state.decorations.pointerCursor = e4, this._currentLink.state.isHovered && (null === (i3 = this._element) || void 0 === i3 || i3.classList.toggle("xterm-cursor-pointer", e4)));
            } }, underline: { get: () => {
              var e4, t4;
              return null === (t4 = null === (e4 = this._currentLink) || void 0 === e4 ? void 0 : e4.state) || void 0 === t4 ? void 0 : t4.decorations.underline;
            }, set: (t4) => {
              var i3, s3, r2;
              (null === (i3 = this._currentLink) || void 0 === i3 ? void 0 : i3.state) && (null === (r2 = null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) || void 0 === r2 ? void 0 : r2.decorations.underline) !== t4 && (this._currentLink.state.decorations.underline = t4, this._currentLink.state.isHovered && this._fireUnderlineEvent(e3.link, t4));
            } } }), this._renderService && this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange((e4) => {
              if (!this._currentLink)
                return;
              const t4 = 0 === e4.start ? 0 : e4.start + 1 + this._bufferService.buffer.ydisp, i3 = this._bufferService.buffer.ydisp + 1 + e4.end;
              if (this._currentLink.link.range.start.y >= t4 && this._currentLink.link.range.end.y <= i3 && (this._clearCurrentLink(t4, i3), this._lastMouseEvent && this._element)) {
                const e5 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
                e5 && this._askForLink(e5, false);
              }
            })));
          }
          _linkHover(e3, t3, i3) {
            var s3;
            (null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) && (this._currentLink.state.isHovered = true, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t3, true), this._currentLink.state.decorations.pointerCursor && e3.classList.add("xterm-cursor-pointer")), t3.hover && t3.hover(i3, t3.text);
          }
          _fireUnderlineEvent(e3, t3) {
            const i3 = e3.range, s3 = this._bufferService.buffer.ydisp, r2 = this._createLinkUnderlineEvent(i3.start.x - 1, i3.start.y - s3 - 1, i3.end.x, i3.end.y - s3 - 1, void 0);
            (t3 ? this._onShowLinkUnderline : this._onHideLinkUnderline).fire(r2);
          }
          _linkLeave(e3, t3, i3) {
            var s3;
            (null === (s3 = this._currentLink) || void 0 === s3 ? void 0 : s3.state) && (this._currentLink.state.isHovered = false, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t3, false), this._currentLink.state.decorations.pointerCursor && e3.classList.remove("xterm-cursor-pointer")), t3.leave && t3.leave(i3, t3.text);
          }
          _linkAtPosition(e3, t3) {
            const i3 = e3.range.start.y * this._bufferService.cols + e3.range.start.x, s3 = e3.range.end.y * this._bufferService.cols + e3.range.end.x, r2 = t3.y * this._bufferService.cols + t3.x;
            return i3 <= r2 && r2 <= s3;
          }
          _positionFromMouseEvent(e3, t3, i3) {
            const s3 = i3.getCoords(e3, t3, this._bufferService.cols, this._bufferService.rows);
            if (s3)
              return { x: s3[0], y: s3[1] + this._bufferService.buffer.ydisp };
          }
          _createLinkUnderlineEvent(e3, t3, i3, s3, r2) {
            return { x1: e3, y1: t3, x2: i3, y2: s3, cols: this._bufferService.cols, fg: r2 };
          }
        };
        t2.Linkifier2 = c = s2([r(0, h.IBufferService)], c);
      }, 9042: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.tooMuchOutput = t2.promptLabel = void 0, t2.promptLabel = "Terminal input", t2.tooMuchOutput = "Too much output to announce, navigate to rows manually to read";
      }, 3730: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscLinkProvider = void 0;
        const n = i2(511), o = i2(2585);
        let a = t2.OscLinkProvider = class {
          constructor(e3, t3, i3) {
            this._bufferService = e3, this._optionsService = t3, this._oscLinkService = i3;
          }
          provideLinks(e3, t3) {
            var i3;
            const s3 = this._bufferService.buffer.lines.get(e3 - 1);
            if (!s3)
              return void t3(void 0);
            const r2 = [], o2 = this._optionsService.rawOptions.linkHandler, a2 = new n.CellData(), c = s3.getTrimmedLength();
            let l = -1, d = -1, _ = false;
            for (let t4 = 0; t4 < c; t4++)
              if (-1 !== d || s3.hasContent(t4)) {
                if (s3.loadCell(t4, a2), a2.hasExtendedAttrs() && a2.extended.urlId) {
                  if (-1 === d) {
                    d = t4, l = a2.extended.urlId;
                    continue;
                  }
                  _ = a2.extended.urlId !== l;
                } else
                  -1 !== d && (_ = true);
                if (_ || -1 !== d && t4 === c - 1) {
                  const s4 = null === (i3 = this._oscLinkService.getLinkData(l)) || void 0 === i3 ? void 0 : i3.uri;
                  if (s4) {
                    const i4 = { start: { x: d + 1, y: e3 }, end: { x: t4 + (_ || t4 !== c - 1 ? 0 : 1), y: e3 } };
                    let n2 = false;
                    if (!(null == o2 ? void 0 : o2.allowNonHttpProtocols))
                      try {
                        const e4 = new URL(s4);
                        ["http:", "https:"].includes(e4.protocol) || (n2 = true);
                      } catch (e4) {
                        n2 = true;
                      }
                    n2 || r2.push({ text: s4, range: i4, activate: (e4, t5) => o2 ? o2.activate(e4, t5, i4) : h(0, t5), hover: (e4, t5) => {
                      var s5;
                      return null === (s5 = null == o2 ? void 0 : o2.hover) || void 0 === s5 ? void 0 : s5.call(o2, e4, t5, i4);
                    }, leave: (e4, t5) => {
                      var s5;
                      return null === (s5 = null == o2 ? void 0 : o2.leave) || void 0 === s5 ? void 0 : s5.call(o2, e4, t5, i4);
                    } });
                  }
                  _ = false, a2.hasExtendedAttrs() && a2.extended.urlId ? (d = t4, l = a2.extended.urlId) : (d = -1, l = -1);
                }
              }
            t3(r2);
          }
        };
        function h(e3, t3) {
          if (confirm(`Do you want to navigate to ${t3}?

WARNING: This link could potentially be dangerous`)) {
            const e4 = window.open();
            if (e4) {
              try {
                e4.opener = null;
              } catch (e5) {
              }
              e4.location.href = t3;
            } else
              console.warn("Opening link blocked as opener could not be cleared");
          }
        }
        t2.OscLinkProvider = a = s2([r(0, o.IBufferService), r(1, o.IOptionsService), r(2, o.IOscLinkService)], a);
      }, 6193: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.RenderDebouncer = void 0, t2.RenderDebouncer = class {
          constructor(e3, t3) {
            this._parentWindow = e3, this._renderCallback = t3, this._refreshCallbacks = [];
          }
          dispose() {
            this._animationFrame && (this._parentWindow.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
          }
          addRefreshCallback(e3) {
            return this._refreshCallbacks.push(e3), this._animationFrame || (this._animationFrame = this._parentWindow.requestAnimationFrame(() => this._innerRefresh())), this._animationFrame;
          }
          refresh(e3, t3, i2) {
            this._rowCount = i2, e3 = void 0 !== e3 ? e3 : 0, t3 = void 0 !== t3 ? t3 : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e3) : e3, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t3) : t3, this._animationFrame || (this._animationFrame = this._parentWindow.requestAnimationFrame(() => this._innerRefresh()));
          }
          _innerRefresh() {
            if (this._animationFrame = void 0, void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount)
              return void this._runRefreshCallbacks();
            const e3 = Math.max(this._rowStart, 0), t3 = Math.min(this._rowEnd, this._rowCount - 1);
            this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e3, t3), this._runRefreshCallbacks();
          }
          _runRefreshCallbacks() {
            for (const e3 of this._refreshCallbacks)
              e3(0);
            this._refreshCallbacks = [];
          }
        };
      }, 5596: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ScreenDprMonitor = void 0;
        const s2 = i2(844);
        class r extends s2.Disposable {
          constructor(e3) {
            super(), this._parentWindow = e3, this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this.register((0, s2.toDisposable)(() => {
              this.clearListener();
            }));
          }
          setListener(e3) {
            this._listener && this.clearListener(), this._listener = e3, this._outerListener = () => {
              this._listener && (this._listener(this._parentWindow.devicePixelRatio, this._currentDevicePixelRatio), this._updateDpr());
            }, this._updateDpr();
          }
          _updateDpr() {
            var e3;
            this._outerListener && (null === (e3 = this._resolutionMediaMatchList) || void 0 === e3 || e3.removeListener(this._outerListener), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`), this._resolutionMediaMatchList.addListener(this._outerListener));
          }
          clearListener() {
            this._resolutionMediaMatchList && this._listener && this._outerListener && (this._resolutionMediaMatchList.removeListener(this._outerListener), this._resolutionMediaMatchList = void 0, this._listener = void 0, this._outerListener = void 0);
          }
        }
        t2.ScreenDprMonitor = r;
      }, 3236: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Terminal = void 0;
        const s2 = i2(3614), r = i2(3656), n = i2(6465), o = i2(9042), a = i2(3730), h = i2(1680), c = i2(3107), l = i2(5744), d = i2(2950), _ = i2(1296), u = i2(428), f = i2(4269), v = i2(5114), p = i2(8934), g = i2(3230), m2 = i2(9312), S = i2(4725), C = i2(6731), b = i2(8055), y = i2(8969), w = i2(8460), E = i2(844), k = i2(6114), L = i2(8437), D = i2(2584), R = i2(7399), x = i2(5941), A = i2(9074), B = i2(2585), T = i2(5435), M = i2(4567), O = "undefined" != typeof window ? window.document : null;
        class P extends y.CoreTerminal {
          get onFocus() {
            return this._onFocus.event;
          }
          get onBlur() {
            return this._onBlur.event;
          }
          get onA11yChar() {
            return this._onA11yCharEmitter.event;
          }
          get onA11yTab() {
            return this._onA11yTabEmitter.event;
          }
          get onWillOpen() {
            return this._onWillOpen.event;
          }
          constructor(e3 = {}) {
            super(e3), this.browser = k, this._keyDownHandled = false, this._keyDownSeen = false, this._keyPressHandled = false, this._unprocessedDeadKey = false, this._accessibilityManager = this.register(new E.MutableDisposable()), this._onCursorMove = this.register(new w.EventEmitter()), this.onCursorMove = this._onCursorMove.event, this._onKey = this.register(new w.EventEmitter()), this.onKey = this._onKey.event, this._onRender = this.register(new w.EventEmitter()), this.onRender = this._onRender.event, this._onSelectionChange = this.register(new w.EventEmitter()), this.onSelectionChange = this._onSelectionChange.event, this._onTitleChange = this.register(new w.EventEmitter()), this.onTitleChange = this._onTitleChange.event, this._onBell = this.register(new w.EventEmitter()), this.onBell = this._onBell.event, this._onFocus = this.register(new w.EventEmitter()), this._onBlur = this.register(new w.EventEmitter()), this._onA11yCharEmitter = this.register(new w.EventEmitter()), this._onA11yTabEmitter = this.register(new w.EventEmitter()), this._onWillOpen = this.register(new w.EventEmitter()), this._setup(), this.linkifier2 = this.register(this._instantiationService.createInstance(n.Linkifier2)), this.linkifier2.registerLinkProvider(this._instantiationService.createInstance(a.OscLinkProvider)), this._decorationService = this._instantiationService.createInstance(A.DecorationService), this._instantiationService.setService(B.IDecorationService, this._decorationService), this.register(this._inputHandler.onRequestBell(() => this._onBell.fire())), this.register(this._inputHandler.onRequestRefreshRows((e4, t3) => this.refresh(e4, t3))), this.register(this._inputHandler.onRequestSendFocus(() => this._reportFocus())), this.register(this._inputHandler.onRequestReset(() => this.reset())), this.register(this._inputHandler.onRequestWindowsOptionsReport((e4) => this._reportWindowsOptions(e4))), this.register(this._inputHandler.onColor((e4) => this._handleColorEvent(e4))), this.register((0, w.forwardEvent)(this._inputHandler.onCursorMove, this._onCursorMove)), this.register((0, w.forwardEvent)(this._inputHandler.onTitleChange, this._onTitleChange)), this.register((0, w.forwardEvent)(this._inputHandler.onA11yChar, this._onA11yCharEmitter)), this.register((0, w.forwardEvent)(this._inputHandler.onA11yTab, this._onA11yTabEmitter)), this.register(this._bufferService.onResize((e4) => this._afterResize(e4.cols, e4.rows))), this.register((0, E.toDisposable)(() => {
              var e4, t3;
              this._customKeyEventHandler = void 0, null === (t3 = null === (e4 = this.element) || void 0 === e4 ? void 0 : e4.parentNode) || void 0 === t3 || t3.removeChild(this.element);
            }));
          }
          _handleColorEvent(e3) {
            if (this._themeService)
              for (const t3 of e3) {
                let e4, i3 = "";
                switch (t3.index) {
                  case 256:
                    e4 = "foreground", i3 = "10";
                    break;
                  case 257:
                    e4 = "background", i3 = "11";
                    break;
                  case 258:
                    e4 = "cursor", i3 = "12";
                    break;
                  default:
                    e4 = "ansi", i3 = "4;" + t3.index;
                }
                switch (t3.type) {
                  case 0:
                    const s3 = b.color.toColorRGB("ansi" === e4 ? this._themeService.colors.ansi[t3.index] : this._themeService.colors[e4]);
                    this.coreService.triggerDataEvent(`${D.C0.ESC}]${i3};${(0, x.toRgbString)(s3)}${D.C1_ESCAPED.ST}`);
                    break;
                  case 1:
                    if ("ansi" === e4)
                      this._themeService.modifyColors((e5) => e5.ansi[t3.index] = b.rgba.toColor(...t3.color));
                    else {
                      const i4 = e4;
                      this._themeService.modifyColors((e5) => e5[i4] = b.rgba.toColor(...t3.color));
                    }
                    break;
                  case 2:
                    this._themeService.restoreColor(t3.index);
                }
              }
          }
          _setup() {
            super._setup(), this._customKeyEventHandler = void 0;
          }
          get buffer() {
            return this.buffers.active;
          }
          focus() {
            this.textarea && this.textarea.focus({ preventScroll: true });
          }
          _handleScreenReaderModeOptionChange(e3) {
            e3 ? !this._accessibilityManager.value && this._renderService && (this._accessibilityManager.value = this._instantiationService.createInstance(M.AccessibilityManager, this)) : this._accessibilityManager.clear();
          }
          _handleTextAreaFocus(e3) {
            this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(D.C0.ESC + "[I"), this.updateCursorStyle(e3), this.element.classList.add("focus"), this._showCursor(), this._onFocus.fire();
          }
          blur() {
            var e3;
            return null === (e3 = this.textarea) || void 0 === e3 ? void 0 : e3.blur();
          }
          _handleTextAreaBlur() {
            this.textarea.value = "", this.refresh(this.buffer.y, this.buffer.y), this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(D.C0.ESC + "[O"), this.element.classList.remove("focus"), this._onBlur.fire();
          }
          _syncTextArea() {
            if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService)
              return;
            const e3 = this.buffer.ybase + this.buffer.y, t3 = this.buffer.lines.get(e3);
            if (!t3)
              return;
            const i3 = Math.min(this.buffer.x, this.cols - 1), s3 = this._renderService.dimensions.css.cell.height, r2 = t3.getWidth(i3), n2 = this._renderService.dimensions.css.cell.width * r2, o2 = this.buffer.y * this._renderService.dimensions.css.cell.height, a2 = i3 * this._renderService.dimensions.css.cell.width;
            this.textarea.style.left = a2 + "px", this.textarea.style.top = o2 + "px", this.textarea.style.width = n2 + "px", this.textarea.style.height = s3 + "px", this.textarea.style.lineHeight = s3 + "px", this.textarea.style.zIndex = "-5";
          }
          _initGlobal() {
            this._bindKeys(), this.register((0, r.addDisposableDomListener)(this.element, "copy", (e4) => {
              this.hasSelection() && (0, s2.copyHandler)(e4, this._selectionService);
            }));
            const e3 = (e4) => (0, s2.handlePasteEvent)(e4, this.textarea, this.coreService, this.optionsService);
            this.register((0, r.addDisposableDomListener)(this.textarea, "paste", e3)), this.register((0, r.addDisposableDomListener)(this.element, "paste", e3)), k.isFirefox ? this.register((0, r.addDisposableDomListener)(this.element, "mousedown", (e4) => {
              2 === e4.button && (0, s2.rightClickHandler)(e4, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            })) : this.register((0, r.addDisposableDomListener)(this.element, "contextmenu", (e4) => {
              (0, s2.rightClickHandler)(e4, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            })), k.isLinux && this.register((0, r.addDisposableDomListener)(this.element, "auxclick", (e4) => {
              1 === e4.button && (0, s2.moveTextAreaUnderMouseCursor)(e4, this.textarea, this.screenElement);
            }));
          }
          _bindKeys() {
            this.register((0, r.addDisposableDomListener)(this.textarea, "keyup", (e3) => this._keyUp(e3), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "keydown", (e3) => this._keyDown(e3), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "keypress", (e3) => this._keyPress(e3), true)), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionstart", () => this._compositionHelper.compositionstart())), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionupdate", (e3) => this._compositionHelper.compositionupdate(e3))), this.register((0, r.addDisposableDomListener)(this.textarea, "compositionend", () => this._compositionHelper.compositionend())), this.register((0, r.addDisposableDomListener)(this.textarea, "input", (e3) => this._inputEvent(e3), true)), this.register(this.onRender(() => this._compositionHelper.updateCompositionElements()));
          }
          open(e3) {
            var t3;
            if (!e3)
              throw new Error("Terminal requires a parent element.");
            e3.isConnected || this._logService.debug("Terminal.open was called on an element that was not attached to the DOM"), this._document = e3.ownerDocument, this.element = this._document.createElement("div"), this.element.dir = "ltr", this.element.classList.add("terminal"), this.element.classList.add("xterm"), e3.appendChild(this.element);
            const i3 = O.createDocumentFragment();
            this._viewportElement = O.createElement("div"), this._viewportElement.classList.add("xterm-viewport"), i3.appendChild(this._viewportElement), this._viewportScrollArea = O.createElement("div"), this._viewportScrollArea.classList.add("xterm-scroll-area"), this._viewportElement.appendChild(this._viewportScrollArea), this.screenElement = O.createElement("div"), this.screenElement.classList.add("xterm-screen"), this._helperContainer = O.createElement("div"), this._helperContainer.classList.add("xterm-helpers"), this.screenElement.appendChild(this._helperContainer), i3.appendChild(this.screenElement), this.textarea = O.createElement("textarea"), this.textarea.classList.add("xterm-helper-textarea"), this.textarea.setAttribute("aria-label", o.promptLabel), k.isChromeOS || this.textarea.setAttribute("aria-multiline", "false"), this.textarea.setAttribute("autocorrect", "off"), this.textarea.setAttribute("autocapitalize", "off"), this.textarea.setAttribute("spellcheck", "false"), this.textarea.tabIndex = 0, this._coreBrowserService = this._instantiationService.createInstance(v.CoreBrowserService, this.textarea, null !== (t3 = this._document.defaultView) && void 0 !== t3 ? t3 : window), this._instantiationService.setService(S.ICoreBrowserService, this._coreBrowserService), this.register((0, r.addDisposableDomListener)(this.textarea, "focus", (e4) => this._handleTextAreaFocus(e4))), this.register((0, r.addDisposableDomListener)(this.textarea, "blur", () => this._handleTextAreaBlur())), this._helperContainer.appendChild(this.textarea), this._charSizeService = this._instantiationService.createInstance(u.CharSizeService, this._document, this._helperContainer), this._instantiationService.setService(S.ICharSizeService, this._charSizeService), this._themeService = this._instantiationService.createInstance(C.ThemeService), this._instantiationService.setService(S.IThemeService, this._themeService), this._characterJoinerService = this._instantiationService.createInstance(f.CharacterJoinerService), this._instantiationService.setService(S.ICharacterJoinerService, this._characterJoinerService), this._renderService = this.register(this._instantiationService.createInstance(g.RenderService, this.rows, this.screenElement)), this._instantiationService.setService(S.IRenderService, this._renderService), this.register(this._renderService.onRenderedViewportChange((e4) => this._onRender.fire(e4))), this.onResize((e4) => this._renderService.resize(e4.cols, e4.rows)), this._compositionView = O.createElement("div"), this._compositionView.classList.add("composition-view"), this._compositionHelper = this._instantiationService.createInstance(d.CompositionHelper, this.textarea, this._compositionView), this._helperContainer.appendChild(this._compositionView), this.element.appendChild(i3);
            try {
              this._onWillOpen.fire(this.element);
            } catch (e4) {
            }
            this._renderService.hasRenderer() || this._renderService.setRenderer(this._createRenderer()), this._mouseService = this._instantiationService.createInstance(p.MouseService), this._instantiationService.setService(S.IMouseService, this._mouseService), this.viewport = this._instantiationService.createInstance(h.Viewport, this._viewportElement, this._viewportScrollArea), this.viewport.onRequestScrollLines((e4) => this.scrollLines(e4.amount, e4.suppressScrollEvent, 1)), this.register(this._inputHandler.onRequestSyncScrollBar(() => this.viewport.syncScrollArea())), this.register(this.viewport), this.register(this.onCursorMove(() => {
              this._renderService.handleCursorMove(), this._syncTextArea();
            })), this.register(this.onResize(() => this._renderService.handleResize(this.cols, this.rows))), this.register(this.onBlur(() => this._renderService.handleBlur())), this.register(this.onFocus(() => this._renderService.handleFocus())), this.register(this._renderService.onDimensionsChange(() => this.viewport.syncScrollArea())), this._selectionService = this.register(this._instantiationService.createInstance(m2.SelectionService, this.element, this.screenElement, this.linkifier2)), this._instantiationService.setService(S.ISelectionService, this._selectionService), this.register(this._selectionService.onRequestScrollLines((e4) => this.scrollLines(e4.amount, e4.suppressScrollEvent))), this.register(this._selectionService.onSelectionChange(() => this._onSelectionChange.fire())), this.register(this._selectionService.onRequestRedraw((e4) => this._renderService.handleSelectionChanged(e4.start, e4.end, e4.columnSelectMode))), this.register(this._selectionService.onLinuxMouseSelection((e4) => {
              this.textarea.value = e4, this.textarea.focus(), this.textarea.select();
            })), this.register(this._onScroll.event((e4) => {
              this.viewport.syncScrollArea(), this._selectionService.refresh();
            })), this.register((0, r.addDisposableDomListener)(this._viewportElement, "scroll", () => this._selectionService.refresh())), this.linkifier2.attachToDom(this.screenElement, this._mouseService, this._renderService), this.register(this._instantiationService.createInstance(c.BufferDecorationRenderer, this.screenElement)), this.register((0, r.addDisposableDomListener)(this.element, "mousedown", (e4) => this._selectionService.handleMouseDown(e4))), this.coreMouseService.areMouseEventsActive ? (this._selectionService.disable(), this.element.classList.add("enable-mouse-events")) : this._selectionService.enable(), this.options.screenReaderMode && (this._accessibilityManager.value = this._instantiationService.createInstance(M.AccessibilityManager, this)), this.register(this.optionsService.onSpecificOptionChange("screenReaderMode", (e4) => this._handleScreenReaderModeOptionChange(e4))), this.options.overviewRulerWidth && (this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(l.OverviewRulerRenderer, this._viewportElement, this.screenElement))), this.optionsService.onSpecificOptionChange("overviewRulerWidth", (e4) => {
              !this._overviewRulerRenderer && e4 && this._viewportElement && this.screenElement && (this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(l.OverviewRulerRenderer, this._viewportElement, this.screenElement)));
            }), this._charSizeService.measure(), this.refresh(0, this.rows - 1), this._initGlobal(), this.bindMouse();
          }
          _createRenderer() {
            return this._instantiationService.createInstance(_.DomRenderer, this.element, this.screenElement, this._viewportElement, this.linkifier2);
          }
          bindMouse() {
            const e3 = this, t3 = this.element;
            function i3(t4) {
              const i4 = e3._mouseService.getMouseReportCoords(t4, e3.screenElement);
              if (!i4)
                return false;
              let s4, r2;
              switch (t4.overrideType || t4.type) {
                case "mousemove":
                  r2 = 32, void 0 === t4.buttons ? (s4 = 3, void 0 !== t4.button && (s4 = t4.button < 3 ? t4.button : 3)) : s4 = 1 & t4.buttons ? 0 : 4 & t4.buttons ? 1 : 2 & t4.buttons ? 2 : 3;
                  break;
                case "mouseup":
                  r2 = 0, s4 = t4.button < 3 ? t4.button : 3;
                  break;
                case "mousedown":
                  r2 = 1, s4 = t4.button < 3 ? t4.button : 3;
                  break;
                case "wheel":
                  if (0 === e3.viewport.getLinesScrolled(t4))
                    return false;
                  r2 = t4.deltaY < 0 ? 0 : 1, s4 = 4;
                  break;
                default:
                  return false;
              }
              return !(void 0 === r2 || void 0 === s4 || s4 > 4) && e3.coreMouseService.triggerMouseEvent({ col: i4.col, row: i4.row, x: i4.x, y: i4.y, button: s4, action: r2, ctrl: t4.ctrlKey, alt: t4.altKey, shift: t4.shiftKey });
            }
            const s3 = { mouseup: null, wheel: null, mousedrag: null, mousemove: null }, n2 = { mouseup: (e4) => (i3(e4), e4.buttons || (this._document.removeEventListener("mouseup", s3.mouseup), s3.mousedrag && this._document.removeEventListener("mousemove", s3.mousedrag)), this.cancel(e4)), wheel: (e4) => (i3(e4), this.cancel(e4, true)), mousedrag: (e4) => {
              e4.buttons && i3(e4);
            }, mousemove: (e4) => {
              e4.buttons || i3(e4);
            } };
            this.register(this.coreMouseService.onProtocolChange((e4) => {
              e4 ? ("debug" === this.optionsService.rawOptions.logLevel && this._logService.debug("Binding to mouse events:", this.coreMouseService.explainEvents(e4)), this.element.classList.add("enable-mouse-events"), this._selectionService.disable()) : (this._logService.debug("Unbinding from mouse events."), this.element.classList.remove("enable-mouse-events"), this._selectionService.enable()), 8 & e4 ? s3.mousemove || (t3.addEventListener("mousemove", n2.mousemove), s3.mousemove = n2.mousemove) : (t3.removeEventListener("mousemove", s3.mousemove), s3.mousemove = null), 16 & e4 ? s3.wheel || (t3.addEventListener("wheel", n2.wheel, { passive: false }), s3.wheel = n2.wheel) : (t3.removeEventListener("wheel", s3.wheel), s3.wheel = null), 2 & e4 ? s3.mouseup || (t3.addEventListener("mouseup", n2.mouseup), s3.mouseup = n2.mouseup) : (this._document.removeEventListener("mouseup", s3.mouseup), t3.removeEventListener("mouseup", s3.mouseup), s3.mouseup = null), 4 & e4 ? s3.mousedrag || (s3.mousedrag = n2.mousedrag) : (this._document.removeEventListener("mousemove", s3.mousedrag), s3.mousedrag = null);
            })), this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol, this.register((0, r.addDisposableDomListener)(t3, "mousedown", (e4) => {
              if (e4.preventDefault(), this.focus(), this.coreMouseService.areMouseEventsActive && !this._selectionService.shouldForceSelection(e4))
                return i3(e4), s3.mouseup && this._document.addEventListener("mouseup", s3.mouseup), s3.mousedrag && this._document.addEventListener("mousemove", s3.mousedrag), this.cancel(e4);
            })), this.register((0, r.addDisposableDomListener)(t3, "wheel", (e4) => {
              if (!s3.wheel) {
                if (!this.buffer.hasScrollback) {
                  const t4 = this.viewport.getLinesScrolled(e4);
                  if (0 === t4)
                    return;
                  const i4 = D.C0.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? "O" : "[") + (e4.deltaY < 0 ? "A" : "B");
                  let s4 = "";
                  for (let e5 = 0; e5 < Math.abs(t4); e5++)
                    s4 += i4;
                  return this.coreService.triggerDataEvent(s4, true), this.cancel(e4, true);
                }
                return this.viewport.handleWheel(e4) ? this.cancel(e4) : void 0;
              }
            }, { passive: false })), this.register((0, r.addDisposableDomListener)(t3, "touchstart", (e4) => {
              if (!this.coreMouseService.areMouseEventsActive)
                return this.viewport.handleTouchStart(e4), this.cancel(e4);
            }, { passive: true })), this.register((0, r.addDisposableDomListener)(t3, "touchmove", (e4) => {
              if (!this.coreMouseService.areMouseEventsActive)
                return this.viewport.handleTouchMove(e4) ? void 0 : this.cancel(e4);
            }, { passive: false }));
          }
          refresh(e3, t3) {
            var i3;
            null === (i3 = this._renderService) || void 0 === i3 || i3.refreshRows(e3, t3);
          }
          updateCursorStyle(e3) {
            var t3;
            (null === (t3 = this._selectionService) || void 0 === t3 ? void 0 : t3.shouldColumnSelect(e3)) ? this.element.classList.add("column-select") : this.element.classList.remove("column-select");
          }
          _showCursor() {
            this.coreService.isCursorInitialized || (this.coreService.isCursorInitialized = true, this.refresh(this.buffer.y, this.buffer.y));
          }
          scrollLines(e3, t3, i3 = 0) {
            var s3;
            1 === i3 ? (super.scrollLines(e3, t3, i3), this.refresh(0, this.rows - 1)) : null === (s3 = this.viewport) || void 0 === s3 || s3.scrollLines(e3);
          }
          paste(e3) {
            (0, s2.paste)(e3, this.textarea, this.coreService, this.optionsService);
          }
          attachCustomKeyEventHandler(e3) {
            this._customKeyEventHandler = e3;
          }
          registerLinkProvider(e3) {
            return this.linkifier2.registerLinkProvider(e3);
          }
          registerCharacterJoiner(e3) {
            if (!this._characterJoinerService)
              throw new Error("Terminal must be opened first");
            const t3 = this._characterJoinerService.register(e3);
            return this.refresh(0, this.rows - 1), t3;
          }
          deregisterCharacterJoiner(e3) {
            if (!this._characterJoinerService)
              throw new Error("Terminal must be opened first");
            this._characterJoinerService.deregister(e3) && this.refresh(0, this.rows - 1);
          }
          get markers() {
            return this.buffer.markers;
          }
          registerMarker(e3) {
            return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + e3);
          }
          registerDecoration(e3) {
            return this._decorationService.registerDecoration(e3);
          }
          hasSelection() {
            return !!this._selectionService && this._selectionService.hasSelection;
          }
          select(e3, t3, i3) {
            this._selectionService.setSelection(e3, t3, i3);
          }
          getSelection() {
            return this._selectionService ? this._selectionService.selectionText : "";
          }
          getSelectionPosition() {
            if (this._selectionService && this._selectionService.hasSelection)
              return { start: { x: this._selectionService.selectionStart[0], y: this._selectionService.selectionStart[1] }, end: { x: this._selectionService.selectionEnd[0], y: this._selectionService.selectionEnd[1] } };
          }
          clearSelection() {
            var e3;
            null === (e3 = this._selectionService) || void 0 === e3 || e3.clearSelection();
          }
          selectAll() {
            var e3;
            null === (e3 = this._selectionService) || void 0 === e3 || e3.selectAll();
          }
          selectLines(e3, t3) {
            var i3;
            null === (i3 = this._selectionService) || void 0 === i3 || i3.selectLines(e3, t3);
          }
          _keyDown(e3) {
            if (this._keyDownHandled = false, this._keyDownSeen = true, this._customKeyEventHandler && false === this._customKeyEventHandler(e3))
              return false;
            const t3 = this.browser.isMac && this.options.macOptionIsMeta && e3.altKey;
            if (!t3 && !this._compositionHelper.keydown(e3))
              return this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(), false;
            t3 || "Dead" !== e3.key && "AltGraph" !== e3.key || (this._unprocessedDeadKey = true);
            const i3 = (0, R.evaluateKeyboardEvent)(e3, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
            if (this.updateCursorStyle(e3), 3 === i3.type || 2 === i3.type) {
              const t4 = this.rows - 1;
              return this.scrollLines(2 === i3.type ? -t4 : t4), this.cancel(e3, true);
            }
            return 1 === i3.type && this.selectAll(), !!this._isThirdLevelShift(this.browser, e3) || (i3.cancel && this.cancel(e3, true), !i3.key || !!(e3.key && !e3.ctrlKey && !e3.altKey && !e3.metaKey && 1 === e3.key.length && e3.key.charCodeAt(0) >= 65 && e3.key.charCodeAt(0) <= 90) || (this._unprocessedDeadKey ? (this._unprocessedDeadKey = false, true) : (i3.key !== D.C0.ETX && i3.key !== D.C0.CR || (this.textarea.value = ""), this._onKey.fire({ key: i3.key, domEvent: e3 }), this._showCursor(), this.coreService.triggerDataEvent(i3.key, true), !this.optionsService.rawOptions.screenReaderMode || e3.altKey || e3.ctrlKey ? this.cancel(e3, true) : void (this._keyDownHandled = true))));
          }
          _isThirdLevelShift(e3, t3) {
            const i3 = e3.isMac && !this.options.macOptionIsMeta && t3.altKey && !t3.ctrlKey && !t3.metaKey || e3.isWindows && t3.altKey && t3.ctrlKey && !t3.metaKey || e3.isWindows && t3.getModifierState("AltGraph");
            return "keypress" === t3.type ? i3 : i3 && (!t3.keyCode || t3.keyCode > 47);
          }
          _keyUp(e3) {
            this._keyDownSeen = false, this._customKeyEventHandler && false === this._customKeyEventHandler(e3) || (function(e4) {
              return 16 === e4.keyCode || 17 === e4.keyCode || 18 === e4.keyCode;
            }(e3) || this.focus(), this.updateCursorStyle(e3), this._keyPressHandled = false);
          }
          _keyPress(e3) {
            let t3;
            if (this._keyPressHandled = false, this._keyDownHandled)
              return false;
            if (this._customKeyEventHandler && false === this._customKeyEventHandler(e3))
              return false;
            if (this.cancel(e3), e3.charCode)
              t3 = e3.charCode;
            else if (null === e3.which || void 0 === e3.which)
              t3 = e3.keyCode;
            else {
              if (0 === e3.which || 0 === e3.charCode)
                return false;
              t3 = e3.which;
            }
            return !(!t3 || (e3.altKey || e3.ctrlKey || e3.metaKey) && !this._isThirdLevelShift(this.browser, e3) || (t3 = String.fromCharCode(t3), this._onKey.fire({ key: t3, domEvent: e3 }), this._showCursor(), this.coreService.triggerDataEvent(t3, true), this._keyPressHandled = true, this._unprocessedDeadKey = false, 0));
          }
          _inputEvent(e3) {
            if (e3.data && "insertText" === e3.inputType && (!e3.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
              if (this._keyPressHandled)
                return false;
              this._unprocessedDeadKey = false;
              const t3 = e3.data;
              return this.coreService.triggerDataEvent(t3, true), this.cancel(e3), true;
            }
            return false;
          }
          resize(e3, t3) {
            e3 !== this.cols || t3 !== this.rows ? super.resize(e3, t3) : this._charSizeService && !this._charSizeService.hasValidSize && this._charSizeService.measure();
          }
          _afterResize(e3, t3) {
            var i3, s3;
            null === (i3 = this._charSizeService) || void 0 === i3 || i3.measure(), null === (s3 = this.viewport) || void 0 === s3 || s3.syncScrollArea(true);
          }
          clear() {
            var e3;
            if (0 !== this.buffer.ybase || 0 !== this.buffer.y) {
              this.buffer.clearAllMarkers(), this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y)), this.buffer.lines.length = 1, this.buffer.ydisp = 0, this.buffer.ybase = 0, this.buffer.y = 0;
              for (let e4 = 1; e4 < this.rows; e4++)
                this.buffer.lines.push(this.buffer.getBlankLine(L.DEFAULT_ATTR_DATA));
              this._onScroll.fire({ position: this.buffer.ydisp, source: 0 }), null === (e3 = this.viewport) || void 0 === e3 || e3.reset(), this.refresh(0, this.rows - 1);
            }
          }
          reset() {
            var e3, t3;
            this.options.rows = this.rows, this.options.cols = this.cols;
            const i3 = this._customKeyEventHandler;
            this._setup(), super.reset(), null === (e3 = this._selectionService) || void 0 === e3 || e3.reset(), this._decorationService.reset(), null === (t3 = this.viewport) || void 0 === t3 || t3.reset(), this._customKeyEventHandler = i3, this.refresh(0, this.rows - 1);
          }
          clearTextureAtlas() {
            var e3;
            null === (e3 = this._renderService) || void 0 === e3 || e3.clearTextureAtlas();
          }
          _reportFocus() {
            var e3;
            (null === (e3 = this.element) || void 0 === e3 ? void 0 : e3.classList.contains("focus")) ? this.coreService.triggerDataEvent(D.C0.ESC + "[I") : this.coreService.triggerDataEvent(D.C0.ESC + "[O");
          }
          _reportWindowsOptions(e3) {
            if (this._renderService)
              switch (e3) {
                case T.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
                  const e4 = this._renderService.dimensions.css.canvas.width.toFixed(0), t3 = this._renderService.dimensions.css.canvas.height.toFixed(0);
                  this.coreService.triggerDataEvent(`${D.C0.ESC}[4;${t3};${e4}t`);
                  break;
                case T.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
                  const i3 = this._renderService.dimensions.css.cell.width.toFixed(0), s3 = this._renderService.dimensions.css.cell.height.toFixed(0);
                  this.coreService.triggerDataEvent(`${D.C0.ESC}[6;${s3};${i3}t`);
              }
          }
          cancel(e3, t3) {
            if (this.options.cancelEvents || t3)
              return e3.preventDefault(), e3.stopPropagation(), false;
          }
        }
        t2.Terminal = P;
      }, 9924: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.TimeBasedDebouncer = void 0, t2.TimeBasedDebouncer = class {
          constructor(e3, t3 = 1e3) {
            this._renderCallback = e3, this._debounceThresholdMS = t3, this._lastRefreshMs = 0, this._additionalRefreshRequested = false;
          }
          dispose() {
            this._refreshTimeoutID && clearTimeout(this._refreshTimeoutID);
          }
          refresh(e3, t3, i2) {
            this._rowCount = i2, e3 = void 0 !== e3 ? e3 : 0, t3 = void 0 !== t3 ? t3 : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e3) : e3, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t3) : t3;
            const s2 = Date.now();
            if (s2 - this._lastRefreshMs >= this._debounceThresholdMS)
              this._lastRefreshMs = s2, this._innerRefresh();
            else if (!this._additionalRefreshRequested) {
              const e4 = s2 - this._lastRefreshMs, t4 = this._debounceThresholdMS - e4;
              this._additionalRefreshRequested = true, this._refreshTimeoutID = window.setTimeout(() => {
                this._lastRefreshMs = Date.now(), this._innerRefresh(), this._additionalRefreshRequested = false, this._refreshTimeoutID = void 0;
              }, t4);
            }
          }
          _innerRefresh() {
            if (void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount)
              return;
            const e3 = Math.max(this._rowStart, 0), t3 = Math.min(this._rowEnd, this._rowCount - 1);
            this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e3, t3);
          }
        };
      }, 1680: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Viewport = void 0;
        const n = i2(3656), o = i2(4725), a = i2(8460), h = i2(844), c = i2(2585);
        let l = t2.Viewport = class extends h.Disposable {
          constructor(e3, t3, i3, s3, r2, o2, h2, c2) {
            super(), this._viewportElement = e3, this._scrollArea = t3, this._bufferService = i3, this._optionsService = s3, this._charSizeService = r2, this._renderService = o2, this._coreBrowserService = h2, this.scrollBarWidth = 0, this._currentRowHeight = 0, this._currentDeviceCellHeight = 0, this._lastRecordedBufferLength = 0, this._lastRecordedViewportHeight = 0, this._lastRecordedBufferHeight = 0, this._lastTouchY = 0, this._lastScrollTop = 0, this._wheelPartialScroll = 0, this._refreshAnimationFrame = null, this._ignoreNextScrollEvent = false, this._smoothScrollState = { startTime: 0, origin: -1, target: -1 }, this._onRequestScrollLines = this.register(new a.EventEmitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this.scrollBarWidth = this._viewportElement.offsetWidth - this._scrollArea.offsetWidth || 15, this.register((0, n.addDisposableDomListener)(this._viewportElement, "scroll", this._handleScroll.bind(this))), this._activeBuffer = this._bufferService.buffer, this.register(this._bufferService.buffers.onBufferActivate((e4) => this._activeBuffer = e4.activeBuffer)), this._renderDimensions = this._renderService.dimensions, this.register(this._renderService.onDimensionsChange((e4) => this._renderDimensions = e4)), this._handleThemeChange(c2.colors), this.register(c2.onChangeColors((e4) => this._handleThemeChange(e4))), this.register(this._optionsService.onSpecificOptionChange("scrollback", () => this.syncScrollArea())), setTimeout(() => this.syncScrollArea());
          }
          _handleThemeChange(e3) {
            this._viewportElement.style.backgroundColor = e3.background.css;
          }
          reset() {
            this._currentRowHeight = 0, this._currentDeviceCellHeight = 0, this._lastRecordedBufferLength = 0, this._lastRecordedViewportHeight = 0, this._lastRecordedBufferHeight = 0, this._lastTouchY = 0, this._lastScrollTop = 0, this._coreBrowserService.window.requestAnimationFrame(() => this.syncScrollArea());
          }
          _refresh(e3) {
            if (e3)
              return this._innerRefresh(), void (null !== this._refreshAnimationFrame && this._coreBrowserService.window.cancelAnimationFrame(this._refreshAnimationFrame));
            null === this._refreshAnimationFrame && (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh()));
          }
          _innerRefresh() {
            if (this._charSizeService.height > 0) {
              this._currentRowHeight = this._renderService.dimensions.device.cell.height / this._coreBrowserService.dpr, this._currentDeviceCellHeight = this._renderService.dimensions.device.cell.height, this._lastRecordedViewportHeight = this._viewportElement.offsetHeight;
              const e4 = Math.round(this._currentRowHeight * this._lastRecordedBufferLength) + (this._lastRecordedViewportHeight - this._renderService.dimensions.css.canvas.height);
              this._lastRecordedBufferHeight !== e4 && (this._lastRecordedBufferHeight = e4, this._scrollArea.style.height = this._lastRecordedBufferHeight + "px");
            }
            const e3 = this._bufferService.buffer.ydisp * this._currentRowHeight;
            this._viewportElement.scrollTop !== e3 && (this._ignoreNextScrollEvent = true, this._viewportElement.scrollTop = e3), this._refreshAnimationFrame = null;
          }
          syncScrollArea(e3 = false) {
            if (this._lastRecordedBufferLength !== this._bufferService.buffer.lines.length)
              return this._lastRecordedBufferLength = this._bufferService.buffer.lines.length, void this._refresh(e3);
            this._lastRecordedViewportHeight === this._renderService.dimensions.css.canvas.height && this._lastScrollTop === this._activeBuffer.ydisp * this._currentRowHeight && this._renderDimensions.device.cell.height === this._currentDeviceCellHeight || this._refresh(e3);
          }
          _handleScroll(e3) {
            if (this._lastScrollTop = this._viewportElement.scrollTop, !this._viewportElement.offsetParent)
              return;
            if (this._ignoreNextScrollEvent)
              return this._ignoreNextScrollEvent = false, void this._onRequestScrollLines.fire({ amount: 0, suppressScrollEvent: true });
            const t3 = Math.round(this._lastScrollTop / this._currentRowHeight) - this._bufferService.buffer.ydisp;
            this._onRequestScrollLines.fire({ amount: t3, suppressScrollEvent: true });
          }
          _smoothScroll() {
            if (this._isDisposed || -1 === this._smoothScrollState.origin || -1 === this._smoothScrollState.target)
              return;
            const e3 = this._smoothScrollPercent();
            this._viewportElement.scrollTop = this._smoothScrollState.origin + Math.round(e3 * (this._smoothScrollState.target - this._smoothScrollState.origin)), e3 < 1 ? this._coreBrowserService.window.requestAnimationFrame(() => this._smoothScroll()) : this._clearSmoothScrollState();
          }
          _smoothScrollPercent() {
            return this._optionsService.rawOptions.smoothScrollDuration && this._smoothScrollState.startTime ? Math.max(Math.min((Date.now() - this._smoothScrollState.startTime) / this._optionsService.rawOptions.smoothScrollDuration, 1), 0) : 1;
          }
          _clearSmoothScrollState() {
            this._smoothScrollState.startTime = 0, this._smoothScrollState.origin = -1, this._smoothScrollState.target = -1;
          }
          _bubbleScroll(e3, t3) {
            const i3 = this._viewportElement.scrollTop + this._lastRecordedViewportHeight;
            return !(t3 < 0 && 0 !== this._viewportElement.scrollTop || t3 > 0 && i3 < this._lastRecordedBufferHeight) || (e3.cancelable && e3.preventDefault(), false);
          }
          handleWheel(e3) {
            const t3 = this._getPixelsScrolled(e3);
            return 0 !== t3 && (this._optionsService.rawOptions.smoothScrollDuration ? (this._smoothScrollState.startTime = Date.now(), this._smoothScrollPercent() < 1 ? (this._smoothScrollState.origin = this._viewportElement.scrollTop, -1 === this._smoothScrollState.target ? this._smoothScrollState.target = this._viewportElement.scrollTop + t3 : this._smoothScrollState.target += t3, this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0), this._smoothScroll()) : this._clearSmoothScrollState()) : this._viewportElement.scrollTop += t3, this._bubbleScroll(e3, t3));
          }
          scrollLines(e3) {
            if (0 !== e3)
              if (this._optionsService.rawOptions.smoothScrollDuration) {
                const t3 = e3 * this._currentRowHeight;
                this._smoothScrollState.startTime = Date.now(), this._smoothScrollPercent() < 1 ? (this._smoothScrollState.origin = this._viewportElement.scrollTop, this._smoothScrollState.target = this._smoothScrollState.origin + t3, this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0), this._smoothScroll()) : this._clearSmoothScrollState();
              } else
                this._onRequestScrollLines.fire({ amount: e3, suppressScrollEvent: false });
          }
          _getPixelsScrolled(e3) {
            if (0 === e3.deltaY || e3.shiftKey)
              return 0;
            let t3 = this._applyScrollModifier(e3.deltaY, e3);
            return e3.deltaMode === WheelEvent.DOM_DELTA_LINE ? t3 *= this._currentRowHeight : e3.deltaMode === WheelEvent.DOM_DELTA_PAGE && (t3 *= this._currentRowHeight * this._bufferService.rows), t3;
          }
          getBufferElements(e3, t3) {
            var i3;
            let s3, r2 = "";
            const n2 = [], o2 = null != t3 ? t3 : this._bufferService.buffer.lines.length, a2 = this._bufferService.buffer.lines;
            for (let t4 = e3; t4 < o2; t4++) {
              const e4 = a2.get(t4);
              if (!e4)
                continue;
              const o3 = null === (i3 = a2.get(t4 + 1)) || void 0 === i3 ? void 0 : i3.isWrapped;
              if (r2 += e4.translateToString(!o3), !o3 || t4 === a2.length - 1) {
                const e5 = document.createElement("div");
                e5.textContent = r2, n2.push(e5), r2.length > 0 && (s3 = e5), r2 = "";
              }
            }
            return { bufferElements: n2, cursorElement: s3 };
          }
          getLinesScrolled(e3) {
            if (0 === e3.deltaY || e3.shiftKey)
              return 0;
            let t3 = this._applyScrollModifier(e3.deltaY, e3);
            return e3.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? (t3 /= this._currentRowHeight + 0, this._wheelPartialScroll += t3, t3 = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1), this._wheelPartialScroll %= 1) : e3.deltaMode === WheelEvent.DOM_DELTA_PAGE && (t3 *= this._bufferService.rows), t3;
          }
          _applyScrollModifier(e3, t3) {
            const i3 = this._optionsService.rawOptions.fastScrollModifier;
            return "alt" === i3 && t3.altKey || "ctrl" === i3 && t3.ctrlKey || "shift" === i3 && t3.shiftKey ? e3 * this._optionsService.rawOptions.fastScrollSensitivity * this._optionsService.rawOptions.scrollSensitivity : e3 * this._optionsService.rawOptions.scrollSensitivity;
          }
          handleTouchStart(e3) {
            this._lastTouchY = e3.touches[0].pageY;
          }
          handleTouchMove(e3) {
            const t3 = this._lastTouchY - e3.touches[0].pageY;
            return this._lastTouchY = e3.touches[0].pageY, 0 !== t3 && (this._viewportElement.scrollTop += t3, this._bubbleScroll(e3, t3));
          }
        };
        t2.Viewport = l = s2([r(2, c.IBufferService), r(3, c.IOptionsService), r(4, o.ICharSizeService), r(5, o.IRenderService), r(6, o.ICoreBrowserService), r(7, o.IThemeService)], l);
      }, 3107: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferDecorationRenderer = void 0;
        const n = i2(3656), o = i2(4725), a = i2(844), h = i2(2585);
        let c = t2.BufferDecorationRenderer = class extends a.Disposable {
          constructor(e3, t3, i3, s3) {
            super(), this._screenElement = e3, this._bufferService = t3, this._decorationService = i3, this._renderService = s3, this._decorationElements = /* @__PURE__ */ new Map(), this._altBufferIsActive = false, this._dimensionsChanged = false, this._container = document.createElement("div"), this._container.classList.add("xterm-decoration-container"), this._screenElement.appendChild(this._container), this.register(this._renderService.onRenderedViewportChange(() => this._doRefreshDecorations())), this.register(this._renderService.onDimensionsChange(() => {
              this._dimensionsChanged = true, this._queueRefresh();
            })), this.register((0, n.addDisposableDomListener)(window, "resize", () => this._queueRefresh())), this.register(this._bufferService.buffers.onBufferActivate(() => {
              this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
            })), this.register(this._decorationService.onDecorationRegistered(() => this._queueRefresh())), this.register(this._decorationService.onDecorationRemoved((e4) => this._removeDecoration(e4))), this.register((0, a.toDisposable)(() => {
              this._container.remove(), this._decorationElements.clear();
            }));
          }
          _queueRefresh() {
            void 0 === this._animationFrame && (this._animationFrame = this._renderService.addRefreshCallback(() => {
              this._doRefreshDecorations(), this._animationFrame = void 0;
            }));
          }
          _doRefreshDecorations() {
            for (const e3 of this._decorationService.decorations)
              this._renderDecoration(e3);
            this._dimensionsChanged = false;
          }
          _renderDecoration(e3) {
            this._refreshStyle(e3), this._dimensionsChanged && this._refreshXPosition(e3);
          }
          _createElement(e3) {
            var t3, i3;
            const s3 = document.createElement("div");
            s3.classList.add("xterm-decoration"), s3.classList.toggle("xterm-decoration-top-layer", "top" === (null === (t3 = null == e3 ? void 0 : e3.options) || void 0 === t3 ? void 0 : t3.layer)), s3.style.width = `${Math.round((e3.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, s3.style.height = (e3.options.height || 1) * this._renderService.dimensions.css.cell.height + "px", s3.style.top = (e3.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.css.cell.height + "px", s3.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
            const r2 = null !== (i3 = e3.options.x) && void 0 !== i3 ? i3 : 0;
            return r2 && r2 > this._bufferService.cols && (s3.style.display = "none"), this._refreshXPosition(e3, s3), s3;
          }
          _refreshStyle(e3) {
            const t3 = e3.marker.line - this._bufferService.buffers.active.ydisp;
            if (t3 < 0 || t3 >= this._bufferService.rows)
              e3.element && (e3.element.style.display = "none", e3.onRenderEmitter.fire(e3.element));
            else {
              let i3 = this._decorationElements.get(e3);
              i3 || (i3 = this._createElement(e3), e3.element = i3, this._decorationElements.set(e3, i3), this._container.appendChild(i3), e3.onDispose(() => {
                this._decorationElements.delete(e3), i3.remove();
              })), i3.style.top = t3 * this._renderService.dimensions.css.cell.height + "px", i3.style.display = this._altBufferIsActive ? "none" : "block", e3.onRenderEmitter.fire(i3);
            }
          }
          _refreshXPosition(e3, t3 = e3.element) {
            var i3;
            if (!t3)
              return;
            const s3 = null !== (i3 = e3.options.x) && void 0 !== i3 ? i3 : 0;
            "right" === (e3.options.anchor || "left") ? t3.style.right = s3 ? s3 * this._renderService.dimensions.css.cell.width + "px" : "" : t3.style.left = s3 ? s3 * this._renderService.dimensions.css.cell.width + "px" : "";
          }
          _removeDecoration(e3) {
            var t3;
            null === (t3 = this._decorationElements.get(e3)) || void 0 === t3 || t3.remove(), this._decorationElements.delete(e3), e3.dispose();
          }
        };
        t2.BufferDecorationRenderer = c = s2([r(1, h.IBufferService), r(2, h.IDecorationService), r(3, o.IRenderService)], c);
      }, 5871: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ColorZoneStore = void 0, t2.ColorZoneStore = class {
          constructor() {
            this._zones = [], this._zonePool = [], this._zonePoolIndex = 0, this._linePadding = { full: 0, left: 0, center: 0, right: 0 };
          }
          get zones() {
            return this._zonePool.length = Math.min(this._zonePool.length, this._zones.length), this._zones;
          }
          clear() {
            this._zones.length = 0, this._zonePoolIndex = 0;
          }
          addDecoration(e3) {
            if (e3.options.overviewRulerOptions) {
              for (const t3 of this._zones)
                if (t3.color === e3.options.overviewRulerOptions.color && t3.position === e3.options.overviewRulerOptions.position) {
                  if (this._lineIntersectsZone(t3, e3.marker.line))
                    return;
                  if (this._lineAdjacentToZone(t3, e3.marker.line, e3.options.overviewRulerOptions.position))
                    return void this._addLineToZone(t3, e3.marker.line);
                }
              if (this._zonePoolIndex < this._zonePool.length)
                return this._zonePool[this._zonePoolIndex].color = e3.options.overviewRulerOptions.color, this._zonePool[this._zonePoolIndex].position = e3.options.overviewRulerOptions.position, this._zonePool[this._zonePoolIndex].startBufferLine = e3.marker.line, this._zonePool[this._zonePoolIndex].endBufferLine = e3.marker.line, void this._zones.push(this._zonePool[this._zonePoolIndex++]);
              this._zones.push({ color: e3.options.overviewRulerOptions.color, position: e3.options.overviewRulerOptions.position, startBufferLine: e3.marker.line, endBufferLine: e3.marker.line }), this._zonePool.push(this._zones[this._zones.length - 1]), this._zonePoolIndex++;
            }
          }
          setPadding(e3) {
            this._linePadding = e3;
          }
          _lineIntersectsZone(e3, t3) {
            return t3 >= e3.startBufferLine && t3 <= e3.endBufferLine;
          }
          _lineAdjacentToZone(e3, t3, i2) {
            return t3 >= e3.startBufferLine - this._linePadding[i2 || "full"] && t3 <= e3.endBufferLine + this._linePadding[i2 || "full"];
          }
          _addLineToZone(e3, t3) {
            e3.startBufferLine = Math.min(e3.startBufferLine, t3), e3.endBufferLine = Math.max(e3.endBufferLine, t3);
          }
        };
      }, 5744: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OverviewRulerRenderer = void 0;
        const n = i2(5871), o = i2(3656), a = i2(4725), h = i2(844), c = i2(2585), l = { full: 0, left: 0, center: 0, right: 0 }, d = { full: 0, left: 0, center: 0, right: 0 }, _ = { full: 0, left: 0, center: 0, right: 0 };
        let u = t2.OverviewRulerRenderer = class extends h.Disposable {
          get _width() {
            return this._optionsService.options.overviewRulerWidth || 0;
          }
          constructor(e3, t3, i3, s3, r2, o2, a2) {
            var c2;
            super(), this._viewportElement = e3, this._screenElement = t3, this._bufferService = i3, this._decorationService = s3, this._renderService = r2, this._optionsService = o2, this._coreBrowseService = a2, this._colorZoneStore = new n.ColorZoneStore(), this._shouldUpdateDimensions = true, this._shouldUpdateAnchor = true, this._lastKnownBufferLength = 0, this._canvas = document.createElement("canvas"), this._canvas.classList.add("xterm-decoration-overview-ruler"), this._refreshCanvasDimensions(), null === (c2 = this._viewportElement.parentElement) || void 0 === c2 || c2.insertBefore(this._canvas, this._viewportElement);
            const l2 = this._canvas.getContext("2d");
            if (!l2)
              throw new Error("Ctx cannot be null");
            this._ctx = l2, this._registerDecorationListeners(), this._registerBufferChangeListeners(), this._registerDimensionChangeListeners(), this.register((0, h.toDisposable)(() => {
              var e4;
              null === (e4 = this._canvas) || void 0 === e4 || e4.remove();
            }));
          }
          _registerDecorationListeners() {
            this.register(this._decorationService.onDecorationRegistered(() => this._queueRefresh(void 0, true))), this.register(this._decorationService.onDecorationRemoved(() => this._queueRefresh(void 0, true)));
          }
          _registerBufferChangeListeners() {
            this.register(this._renderService.onRenderedViewportChange(() => this._queueRefresh())), this.register(this._bufferService.buffers.onBufferActivate(() => {
              this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? "none" : "block";
            })), this.register(this._bufferService.onScroll(() => {
              this._lastKnownBufferLength !== this._bufferService.buffers.normal.lines.length && (this._refreshDrawHeightConstants(), this._refreshColorZonePadding());
            }));
          }
          _registerDimensionChangeListeners() {
            this.register(this._renderService.onRender(() => {
              this._containerHeight && this._containerHeight === this._screenElement.clientHeight || (this._queueRefresh(true), this._containerHeight = this._screenElement.clientHeight);
            })), this.register(this._optionsService.onSpecificOptionChange("overviewRulerWidth", () => this._queueRefresh(true))), this.register((0, o.addDisposableDomListener)(this._coreBrowseService.window, "resize", () => this._queueRefresh(true))), this._queueRefresh(true);
          }
          _refreshDrawConstants() {
            const e3 = Math.floor(this._canvas.width / 3), t3 = Math.ceil(this._canvas.width / 3);
            d.full = this._canvas.width, d.left = e3, d.center = t3, d.right = e3, this._refreshDrawHeightConstants(), _.full = 0, _.left = 0, _.center = d.left, _.right = d.left + d.center;
          }
          _refreshDrawHeightConstants() {
            l.full = Math.round(2 * this._coreBrowseService.dpr);
            const e3 = this._canvas.height / this._bufferService.buffer.lines.length, t3 = Math.round(Math.max(Math.min(e3, 12), 6) * this._coreBrowseService.dpr);
            l.left = t3, l.center = t3, l.right = t3;
          }
          _refreshColorZonePadding() {
            this._colorZoneStore.setPadding({ full: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l.full), left: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l.left), center: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l.center), right: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * l.right) }), this._lastKnownBufferLength = this._bufferService.buffers.normal.lines.length;
          }
          _refreshCanvasDimensions() {
            this._canvas.style.width = `${this._width}px`, this._canvas.width = Math.round(this._width * this._coreBrowseService.dpr), this._canvas.style.height = `${this._screenElement.clientHeight}px`, this._canvas.height = Math.round(this._screenElement.clientHeight * this._coreBrowseService.dpr), this._refreshDrawConstants(), this._refreshColorZonePadding();
          }
          _refreshDecorations() {
            this._shouldUpdateDimensions && this._refreshCanvasDimensions(), this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height), this._colorZoneStore.clear();
            for (const e4 of this._decorationService.decorations)
              this._colorZoneStore.addDecoration(e4);
            this._ctx.lineWidth = 1;
            const e3 = this._colorZoneStore.zones;
            for (const t3 of e3)
              "full" !== t3.position && this._renderColorZone(t3);
            for (const t3 of e3)
              "full" === t3.position && this._renderColorZone(t3);
            this._shouldUpdateDimensions = false, this._shouldUpdateAnchor = false;
          }
          _renderColorZone(e3) {
            this._ctx.fillStyle = e3.color, this._ctx.fillRect(_[e3.position || "full"], Math.round((this._canvas.height - 1) * (e3.startBufferLine / this._bufferService.buffers.active.lines.length) - l[e3.position || "full"] / 2), d[e3.position || "full"], Math.round((this._canvas.height - 1) * ((e3.endBufferLine - e3.startBufferLine) / this._bufferService.buffers.active.lines.length) + l[e3.position || "full"]));
          }
          _queueRefresh(e3, t3) {
            this._shouldUpdateDimensions = e3 || this._shouldUpdateDimensions, this._shouldUpdateAnchor = t3 || this._shouldUpdateAnchor, void 0 === this._animationFrame && (this._animationFrame = this._coreBrowseService.window.requestAnimationFrame(() => {
              this._refreshDecorations(), this._animationFrame = void 0;
            }));
          }
        };
        t2.OverviewRulerRenderer = u = s2([r(2, c.IBufferService), r(3, c.IDecorationService), r(4, a.IRenderService), r(5, c.IOptionsService), r(6, a.ICoreBrowserService)], u);
      }, 2950: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CompositionHelper = void 0;
        const n = i2(4725), o = i2(2585), a = i2(2584);
        let h = t2.CompositionHelper = class {
          get isComposing() {
            return this._isComposing;
          }
          constructor(e3, t3, i3, s3, r2, n2) {
            this._textarea = e3, this._compositionView = t3, this._bufferService = i3, this._optionsService = s3, this._coreService = r2, this._renderService = n2, this._isComposing = false, this._isSendingComposition = false, this._compositionPosition = { start: 0, end: 0 }, this._dataAlreadySent = "";
          }
          compositionstart() {
            this._isComposing = true, this._compositionPosition.start = this._textarea.value.length, this._compositionView.textContent = "", this._dataAlreadySent = "", this._compositionView.classList.add("active");
          }
          compositionupdate(e3) {
            this._compositionView.textContent = e3.data, this.updateCompositionElements(), setTimeout(() => {
              this._compositionPosition.end = this._textarea.value.length;
            }, 0);
          }
          compositionend() {
            this._finalizeComposition(true);
          }
          keydown(e3) {
            if (this._isComposing || this._isSendingComposition) {
              if (229 === e3.keyCode)
                return false;
              if (16 === e3.keyCode || 17 === e3.keyCode || 18 === e3.keyCode)
                return false;
              this._finalizeComposition(false);
            }
            return 229 !== e3.keyCode || (this._handleAnyTextareaChanges(), false);
          }
          _finalizeComposition(e3) {
            if (this._compositionView.classList.remove("active"), this._isComposing = false, e3) {
              const e4 = { start: this._compositionPosition.start, end: this._compositionPosition.end };
              this._isSendingComposition = true, setTimeout(() => {
                if (this._isSendingComposition) {
                  let t3;
                  this._isSendingComposition = false, e4.start += this._dataAlreadySent.length, t3 = this._isComposing ? this._textarea.value.substring(e4.start, e4.end) : this._textarea.value.substring(e4.start), t3.length > 0 && this._coreService.triggerDataEvent(t3, true);
                }
              }, 0);
            } else {
              this._isSendingComposition = false;
              const e4 = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
              this._coreService.triggerDataEvent(e4, true);
            }
          }
          _handleAnyTextareaChanges() {
            const e3 = this._textarea.value;
            setTimeout(() => {
              if (!this._isComposing) {
                const t3 = this._textarea.value, i3 = t3.replace(e3, "");
                this._dataAlreadySent = i3, t3.length > e3.length ? this._coreService.triggerDataEvent(i3, true) : t3.length < e3.length ? this._coreService.triggerDataEvent(`${a.C0.DEL}`, true) : t3.length === e3.length && t3 !== e3 && this._coreService.triggerDataEvent(t3, true);
              }
            }, 0);
          }
          updateCompositionElements(e3) {
            if (this._isComposing) {
              if (this._bufferService.buffer.isCursorInViewport) {
                const e4 = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1), t3 = this._renderService.dimensions.css.cell.height, i3 = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height, s3 = e4 * this._renderService.dimensions.css.cell.width;
                this._compositionView.style.left = s3 + "px", this._compositionView.style.top = i3 + "px", this._compositionView.style.height = t3 + "px", this._compositionView.style.lineHeight = t3 + "px", this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + "px";
                const r2 = this._compositionView.getBoundingClientRect();
                this._textarea.style.left = s3 + "px", this._textarea.style.top = i3 + "px", this._textarea.style.width = Math.max(r2.width, 1) + "px", this._textarea.style.height = Math.max(r2.height, 1) + "px", this._textarea.style.lineHeight = r2.height + "px";
              }
              e3 || setTimeout(() => this.updateCompositionElements(true), 0);
            }
          }
        };
        t2.CompositionHelper = h = s2([r(2, o.IBufferService), r(3, o.IOptionsService), r(4, o.ICoreService), r(5, n.IRenderService)], h);
      }, 9806: (e2, t2) => {
        function i2(e3, t3, i3) {
          const s2 = i3.getBoundingClientRect(), r = e3.getComputedStyle(i3), n = parseInt(r.getPropertyValue("padding-left")), o = parseInt(r.getPropertyValue("padding-top"));
          return [t3.clientX - s2.left - n, t3.clientY - s2.top - o];
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getCoords = t2.getCoordsRelativeToElement = void 0, t2.getCoordsRelativeToElement = i2, t2.getCoords = function(e3, t3, s2, r, n, o, a, h, c) {
          if (!o)
            return;
          const l = i2(e3, t3, s2);
          return l ? (l[0] = Math.ceil((l[0] + (c ? a / 2 : 0)) / a), l[1] = Math.ceil(l[1] / h), l[0] = Math.min(Math.max(l[0], 1), r + (c ? 1 : 0)), l[1] = Math.min(Math.max(l[1], 1), n), l) : void 0;
        };
      }, 9504: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.moveToCellSequence = void 0;
        const s2 = i2(2584);
        function r(e3, t3, i3, s3) {
          const r2 = e3 - n(e3, i3), a2 = t3 - n(t3, i3), l = Math.abs(r2 - a2) - function(e4, t4, i4) {
            let s4 = 0;
            const r3 = e4 - n(e4, i4), a3 = t4 - n(t4, i4);
            for (let n2 = 0; n2 < Math.abs(r3 - a3); n2++) {
              const a4 = "A" === o(e4, t4) ? -1 : 1, h2 = i4.buffer.lines.get(r3 + a4 * n2);
              (null == h2 ? void 0 : h2.isWrapped) && s4++;
            }
            return s4;
          }(e3, t3, i3);
          return c(l, h(o(e3, t3), s3));
        }
        function n(e3, t3) {
          let i3 = 0, s3 = t3.buffer.lines.get(e3), r2 = null == s3 ? void 0 : s3.isWrapped;
          for (; r2 && e3 >= 0 && e3 < t3.rows; )
            i3++, s3 = t3.buffer.lines.get(--e3), r2 = null == s3 ? void 0 : s3.isWrapped;
          return i3;
        }
        function o(e3, t3) {
          return e3 > t3 ? "A" : "B";
        }
        function a(e3, t3, i3, s3, r2, n2) {
          let o2 = e3, a2 = t3, h2 = "";
          for (; o2 !== i3 || a2 !== s3; )
            o2 += r2 ? 1 : -1, r2 && o2 > n2.cols - 1 ? (h2 += n2.buffer.translateBufferLineToString(a2, false, e3, o2), o2 = 0, e3 = 0, a2++) : !r2 && o2 < 0 && (h2 += n2.buffer.translateBufferLineToString(a2, false, 0, e3 + 1), o2 = n2.cols - 1, e3 = o2, a2--);
          return h2 + n2.buffer.translateBufferLineToString(a2, false, e3, o2);
        }
        function h(e3, t3) {
          const i3 = t3 ? "O" : "[";
          return s2.C0.ESC + i3 + e3;
        }
        function c(e3, t3) {
          e3 = Math.floor(e3);
          let i3 = "";
          for (let s3 = 0; s3 < e3; s3++)
            i3 += t3;
          return i3;
        }
        t2.moveToCellSequence = function(e3, t3, i3, s3) {
          const o2 = i3.buffer.x, l = i3.buffer.y;
          if (!i3.buffer.hasScrollback)
            return function(e4, t4, i4, s4, o3, l2) {
              return 0 === r(t4, s4, o3, l2).length ? "" : c(a(e4, t4, e4, t4 - n(t4, o3), false, o3).length, h("D", l2));
            }(o2, l, 0, t3, i3, s3) + r(l, t3, i3, s3) + function(e4, t4, i4, s4, o3, l2) {
              let d2;
              d2 = r(t4, s4, o3, l2).length > 0 ? s4 - n(s4, o3) : t4;
              const _2 = s4, u = function(e5, t5, i5, s5, o4, a2) {
                let h2;
                return h2 = r(i5, s5, o4, a2).length > 0 ? s5 - n(s5, o4) : t5, e5 < i5 && h2 <= s5 || e5 >= i5 && h2 < s5 ? "C" : "D";
              }(e4, t4, i4, s4, o3, l2);
              return c(a(e4, d2, i4, _2, "C" === u, o3).length, h(u, l2));
            }(o2, l, e3, t3, i3, s3);
          let d;
          if (l === t3)
            return d = o2 > e3 ? "D" : "C", c(Math.abs(o2 - e3), h(d, s3));
          d = l > t3 ? "D" : "C";
          const _ = Math.abs(l - t3);
          return c(function(e4, t4) {
            return t4.cols - e4;
          }(l > t3 ? e3 : o2, i3) + (_ - 1) * i3.cols + 1 + ((l > t3 ? o2 : e3) - 1), h(d, s3));
        };
      }, 1296: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DomRenderer = void 0;
        const n = i2(3787), o = i2(2550), a = i2(2223), h = i2(6171), c = i2(4725), l = i2(8055), d = i2(8460), _ = i2(844), u = i2(2585), f = "xterm-dom-renderer-owner-", v = "xterm-rows", p = "xterm-fg-", g = "xterm-bg-", m2 = "xterm-focus", S = "xterm-selection";
        let C = 1, b = t2.DomRenderer = class extends _.Disposable {
          constructor(e3, t3, i3, s3, r2, a2, c2, l2, u2, p2) {
            super(), this._element = e3, this._screenElement = t3, this._viewportElement = i3, this._linkifier2 = s3, this._charSizeService = a2, this._optionsService = c2, this._bufferService = l2, this._coreBrowserService = u2, this._themeService = p2, this._terminalClass = C++, this._rowElements = [], this.onRequestRedraw = this.register(new d.EventEmitter()).event, this._rowContainer = document.createElement("div"), this._rowContainer.classList.add(v), this._rowContainer.style.lineHeight = "normal", this._rowContainer.setAttribute("aria-hidden", "true"), this._refreshRowElements(this._bufferService.cols, this._bufferService.rows), this._selectionContainer = document.createElement("div"), this._selectionContainer.classList.add(S), this._selectionContainer.setAttribute("aria-hidden", "true"), this.dimensions = (0, h.createRenderDimensions)(), this._updateDimensions(), this.register(this._optionsService.onOptionChange(() => this._handleOptionsChanged())), this.register(this._themeService.onChangeColors((e4) => this._injectCss(e4))), this._injectCss(this._themeService.colors), this._rowFactory = r2.createInstance(n.DomRendererRowFactory, document), this._element.classList.add(f + this._terminalClass), this._screenElement.appendChild(this._rowContainer), this._screenElement.appendChild(this._selectionContainer), this.register(this._linkifier2.onShowLinkUnderline((e4) => this._handleLinkHover(e4))), this.register(this._linkifier2.onHideLinkUnderline((e4) => this._handleLinkLeave(e4))), this.register((0, _.toDisposable)(() => {
              this._element.classList.remove(f + this._terminalClass), this._rowContainer.remove(), this._selectionContainer.remove(), this._widthCache.dispose(), this._themeStyleElement.remove(), this._dimensionsStyleElement.remove();
            })), this._widthCache = new o.WidthCache(document), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
          }
          _updateDimensions() {
            const e3 = this._coreBrowserService.dpr;
            this.dimensions.device.char.width = this._charSizeService.width * e3, this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * e3), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.left = 0, this.dimensions.device.char.top = 0, this.dimensions.device.canvas.width = this.dimensions.device.cell.width * this._bufferService.cols, this.dimensions.device.canvas.height = this.dimensions.device.cell.height * this._bufferService.rows, this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / e3), this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / e3), this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols, this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
            for (const e4 of this._rowElements)
              e4.style.width = `${this.dimensions.css.canvas.width}px`, e4.style.height = `${this.dimensions.css.cell.height}px`, e4.style.lineHeight = `${this.dimensions.css.cell.height}px`, e4.style.overflow = "hidden";
            this._dimensionsStyleElement || (this._dimensionsStyleElement = document.createElement("style"), this._screenElement.appendChild(this._dimensionsStyleElement));
            const t3 = `${this._terminalSelector} .${v} span { display: inline-block; height: 100%; vertical-align: top;}`;
            this._dimensionsStyleElement.textContent = t3, this._selectionContainer.style.height = this._viewportElement.style.height, this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
          }
          _injectCss(e3) {
            this._themeStyleElement || (this._themeStyleElement = document.createElement("style"), this._screenElement.appendChild(this._themeStyleElement));
            let t3 = `${this._terminalSelector} .${v} { color: ${e3.foreground.css}; font-family: ${this._optionsService.rawOptions.fontFamily}; font-size: ${this._optionsService.rawOptions.fontSize}px; font-kerning: none; white-space: pre}`;
            t3 += `${this._terminalSelector} .${v} .xterm-dim { color: ${l.color.multiplyOpacity(e3.foreground, 0.5).css};}`, t3 += `${this._terminalSelector} span:not(.xterm-bold) { font-weight: ${this._optionsService.rawOptions.fontWeight};}${this._terminalSelector} span.xterm-bold { font-weight: ${this._optionsService.rawOptions.fontWeightBold};}${this._terminalSelector} span.xterm-italic { font-style: italic;}`, t3 += "@keyframes blink_box_shadow_" + this._terminalClass + " { 50% {  border-bottom-style: hidden; }}", t3 += "@keyframes blink_block_" + this._terminalClass + ` { 0% {  background-color: ${e3.cursor.css};  color: ${e3.cursorAccent.css}; } 50% {  background-color: inherit;  color: ${e3.cursor.css}; }}`, t3 += `${this._terminalSelector} .${v}.${m2} .xterm-cursor.xterm-cursor-blink:not(.xterm-cursor-block) { animation: blink_box_shadow_` + this._terminalClass + ` 1s step-end infinite;}${this._terminalSelector} .${v}.${m2} .xterm-cursor.xterm-cursor-blink.xterm-cursor-block { animation: blink_block_` + this._terminalClass + ` 1s step-end infinite;}${this._terminalSelector} .${v} .xterm-cursor.xterm-cursor-block { background-color: ${e3.cursor.css}; color: ${e3.cursorAccent.css};}${this._terminalSelector} .${v} .xterm-cursor.xterm-cursor-outline { outline: 1px solid ${e3.cursor.css}; outline-offset: -1px;}${this._terminalSelector} .${v} .xterm-cursor.xterm-cursor-bar { box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${e3.cursor.css} inset;}${this._terminalSelector} .${v} .xterm-cursor.xterm-cursor-underline { border-bottom: 1px ${e3.cursor.css}; border-bottom-style: solid; height: calc(100% - 1px);}`, t3 += `${this._terminalSelector} .${S} { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;}${this._terminalSelector}.focus .${S} div { position: absolute; background-color: ${e3.selectionBackgroundOpaque.css};}${this._terminalSelector} .${S} div { position: absolute; background-color: ${e3.selectionInactiveBackgroundOpaque.css};}`;
            for (const [i3, s3] of e3.ansi.entries())
              t3 += `${this._terminalSelector} .${p}${i3} { color: ${s3.css}; }${this._terminalSelector} .${p}${i3}.xterm-dim { color: ${l.color.multiplyOpacity(s3, 0.5).css}; }${this._terminalSelector} .${g}${i3} { background-color: ${s3.css}; }`;
            t3 += `${this._terminalSelector} .${p}${a.INVERTED_DEFAULT_COLOR} { color: ${l.color.opaque(e3.background).css}; }${this._terminalSelector} .${p}${a.INVERTED_DEFAULT_COLOR}.xterm-dim { color: ${l.color.multiplyOpacity(l.color.opaque(e3.background), 0.5).css}; }${this._terminalSelector} .${g}${a.INVERTED_DEFAULT_COLOR} { background-color: ${e3.foreground.css}; }`, this._themeStyleElement.textContent = t3;
          }
          _setDefaultSpacing() {
            const e3 = this.dimensions.css.cell.width - this._widthCache.get("W", false, false);
            this._rowContainer.style.letterSpacing = `${e3}px`, this._rowFactory.defaultSpacing = e3;
          }
          handleDevicePixelRatioChange() {
            this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
          }
          _refreshRowElements(e3, t3) {
            for (let e4 = this._rowElements.length; e4 <= t3; e4++) {
              const e5 = document.createElement("div");
              this._rowContainer.appendChild(e5), this._rowElements.push(e5);
            }
            for (; this._rowElements.length > t3; )
              this._rowContainer.removeChild(this._rowElements.pop());
          }
          handleResize(e3, t3) {
            this._refreshRowElements(e3, t3), this._updateDimensions();
          }
          handleCharSizeChanged() {
            this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
          }
          handleBlur() {
            this._rowContainer.classList.remove(m2);
          }
          handleFocus() {
            this._rowContainer.classList.add(m2), this.renderRows(this._bufferService.buffer.y, this._bufferService.buffer.y);
          }
          handleSelectionChanged(e3, t3, i3) {
            if (this._selectionContainer.replaceChildren(), this._rowFactory.handleSelectionChanged(e3, t3, i3), this.renderRows(0, this._bufferService.rows - 1), !e3 || !t3)
              return;
            const s3 = e3[1] - this._bufferService.buffer.ydisp, r2 = t3[1] - this._bufferService.buffer.ydisp, n2 = Math.max(s3, 0), o2 = Math.min(r2, this._bufferService.rows - 1);
            if (n2 >= this._bufferService.rows || o2 < 0)
              return;
            const a2 = document.createDocumentFragment();
            if (i3) {
              const i4 = e3[0] > t3[0];
              a2.appendChild(this._createSelectionElement(n2, i4 ? t3[0] : e3[0], i4 ? e3[0] : t3[0], o2 - n2 + 1));
            } else {
              const i4 = s3 === n2 ? e3[0] : 0, h2 = n2 === r2 ? t3[0] : this._bufferService.cols;
              a2.appendChild(this._createSelectionElement(n2, i4, h2));
              const c2 = o2 - n2 - 1;
              if (a2.appendChild(this._createSelectionElement(n2 + 1, 0, this._bufferService.cols, c2)), n2 !== o2) {
                const e4 = r2 === o2 ? t3[0] : this._bufferService.cols;
                a2.appendChild(this._createSelectionElement(o2, 0, e4));
              }
            }
            this._selectionContainer.appendChild(a2);
          }
          _createSelectionElement(e3, t3, i3, s3 = 1) {
            const r2 = document.createElement("div");
            return r2.style.height = s3 * this.dimensions.css.cell.height + "px", r2.style.top = e3 * this.dimensions.css.cell.height + "px", r2.style.left = t3 * this.dimensions.css.cell.width + "px", r2.style.width = this.dimensions.css.cell.width * (i3 - t3) + "px", r2;
          }
          handleCursorMove() {
          }
          _handleOptionsChanged() {
            this._updateDimensions(), this._injectCss(this._themeService.colors), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
          }
          clear() {
            for (const e3 of this._rowElements)
              e3.replaceChildren();
          }
          renderRows(e3, t3) {
            const i3 = this._bufferService.buffer, s3 = i3.ybase + i3.y, r2 = Math.min(i3.x, this._bufferService.cols - 1), n2 = this._optionsService.rawOptions.cursorBlink, o2 = this._optionsService.rawOptions.cursorStyle, a2 = this._optionsService.rawOptions.cursorInactiveStyle;
            for (let h2 = e3; h2 <= t3; h2++) {
              const e4 = h2 + i3.ydisp, t4 = this._rowElements[h2], c2 = i3.lines.get(e4);
              if (!t4 || !c2)
                break;
              t4.replaceChildren(...this._rowFactory.createRow(c2, e4, e4 === s3, o2, a2, r2, n2, this.dimensions.css.cell.width, this._widthCache, -1, -1));
            }
          }
          get _terminalSelector() {
            return `.${f}${this._terminalClass}`;
          }
          _handleLinkHover(e3) {
            this._setCellUnderline(e3.x1, e3.x2, e3.y1, e3.y2, e3.cols, true);
          }
          _handleLinkLeave(e3) {
            this._setCellUnderline(e3.x1, e3.x2, e3.y1, e3.y2, e3.cols, false);
          }
          _setCellUnderline(e3, t3, i3, s3, r2, n2) {
            i3 < 0 && (e3 = 0), s3 < 0 && (t3 = 0);
            const o2 = this._bufferService.rows - 1;
            i3 = Math.max(Math.min(i3, o2), 0), s3 = Math.max(Math.min(s3, o2), 0), r2 = Math.min(r2, this._bufferService.cols);
            const a2 = this._bufferService.buffer, h2 = a2.ybase + a2.y, c2 = Math.min(a2.x, r2 - 1), l2 = this._optionsService.rawOptions.cursorBlink, d2 = this._optionsService.rawOptions.cursorStyle, _2 = this._optionsService.rawOptions.cursorInactiveStyle;
            for (let o3 = i3; o3 <= s3; ++o3) {
              const u2 = o3 + a2.ydisp, f2 = this._rowElements[o3], v2 = a2.lines.get(u2);
              if (!f2 || !v2)
                break;
              f2.replaceChildren(...this._rowFactory.createRow(v2, u2, u2 === h2, d2, _2, c2, l2, this.dimensions.css.cell.width, this._widthCache, n2 ? o3 === i3 ? e3 : 0 : -1, n2 ? (o3 === s3 ? t3 : r2) - 1 : -1));
            }
          }
        };
        t2.DomRenderer = b = s2([r(4, u.IInstantiationService), r(5, c.ICharSizeService), r(6, u.IOptionsService), r(7, u.IBufferService), r(8, c.ICoreBrowserService), r(9, c.IThemeService)], b);
      }, 3787: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DomRendererRowFactory = void 0;
        const n = i2(2223), o = i2(643), a = i2(511), h = i2(2585), c = i2(8055), l = i2(4725), d = i2(4269), _ = i2(6171), u = i2(3734);
        let f = t2.DomRendererRowFactory = class {
          constructor(e3, t3, i3, s3, r2, n2, o2) {
            this._document = e3, this._characterJoinerService = t3, this._optionsService = i3, this._coreBrowserService = s3, this._coreService = r2, this._decorationService = n2, this._themeService = o2, this._workCell = new a.CellData(), this._columnSelectMode = false, this.defaultSpacing = 0;
          }
          handleSelectionChanged(e3, t3, i3) {
            this._selectionStart = e3, this._selectionEnd = t3, this._columnSelectMode = i3;
          }
          createRow(e3, t3, i3, s3, r2, a2, h2, l2, _2, f2, p) {
            const g = [], m2 = this._characterJoinerService.getJoinedCharacters(t3), S = this._themeService.colors;
            let C, b = e3.getNoBgTrimmedLength();
            i3 && b < a2 + 1 && (b = a2 + 1);
            let y = 0, w = "", E = 0, k = 0, L = 0, D = false, R = 0, x = false, A = 0;
            const B = [], T = -1 !== f2 && -1 !== p;
            for (let M = 0; M < b; M++) {
              e3.loadCell(M, this._workCell);
              let b2 = this._workCell.getWidth();
              if (0 === b2)
                continue;
              let O = false, P = M, I = this._workCell;
              if (m2.length > 0 && M === m2[0][0]) {
                O = true;
                const t4 = m2.shift();
                I = new d.JoinedCellData(this._workCell, e3.translateToString(true, t4[0], t4[1]), t4[1] - t4[0]), P = t4[1] - 1, b2 = I.getWidth();
              }
              const H = this._isCellInSelection(M, t3), F = i3 && M === a2, W = T && M >= f2 && M <= p;
              let U = false;
              this._decorationService.forEachDecorationAtCell(M, t3, void 0, (e4) => {
                U = true;
              });
              let N = I.getChars() || o.WHITESPACE_CELL_CHAR;
              if (" " === N && (I.isUnderline() || I.isOverline()) && (N = "\xA0"), A = b2 * l2 - _2.get(N, I.isBold(), I.isItalic()), C) {
                if (y && (H && x || !H && !x && I.bg === E) && (H && x && S.selectionForeground || I.fg === k) && I.extended.ext === L && W === D && A === R && !F && !O && !U) {
                  w += N, y++;
                  continue;
                }
                y && (C.textContent = w), C = this._document.createElement("span"), y = 0, w = "";
              } else
                C = this._document.createElement("span");
              if (E = I.bg, k = I.fg, L = I.extended.ext, D = W, R = A, x = H, O && a2 >= M && a2 <= P && (a2 = M), !this._coreService.isCursorHidden && F) {
                if (B.push("xterm-cursor"), this._coreBrowserService.isFocused)
                  h2 && B.push("xterm-cursor-blink"), B.push("bar" === s3 ? "xterm-cursor-bar" : "underline" === s3 ? "xterm-cursor-underline" : "xterm-cursor-block");
                else if (r2)
                  switch (r2) {
                    case "outline":
                      B.push("xterm-cursor-outline");
                      break;
                    case "block":
                      B.push("xterm-cursor-block");
                      break;
                    case "bar":
                      B.push("xterm-cursor-bar");
                      break;
                    case "underline":
                      B.push("xterm-cursor-underline");
                  }
              }
              if (I.isBold() && B.push("xterm-bold"), I.isItalic() && B.push("xterm-italic"), I.isDim() && B.push("xterm-dim"), w = I.isInvisible() ? o.WHITESPACE_CELL_CHAR : I.getChars() || o.WHITESPACE_CELL_CHAR, I.isUnderline() && (B.push(`xterm-underline-${I.extended.underlineStyle}`), " " === w && (w = "\xA0"), !I.isUnderlineColorDefault()))
                if (I.isUnderlineColorRGB())
                  C.style.textDecorationColor = `rgb(${u.AttributeData.toColorRGB(I.getUnderlineColor()).join(",")})`;
                else {
                  let e4 = I.getUnderlineColor();
                  this._optionsService.rawOptions.drawBoldTextInBrightColors && I.isBold() && e4 < 8 && (e4 += 8), C.style.textDecorationColor = S.ansi[e4].css;
                }
              I.isOverline() && (B.push("xterm-overline"), " " === w && (w = "\xA0")), I.isStrikethrough() && B.push("xterm-strikethrough"), W && (C.style.textDecoration = "underline");
              let $2 = I.getFgColor(), j = I.getFgColorMode(), z = I.getBgColor(), K = I.getBgColorMode();
              const q = !!I.isInverse();
              if (q) {
                const e4 = $2;
                $2 = z, z = e4;
                const t4 = j;
                j = K, K = t4;
              }
              let V, G, X, J = false;
              switch (this._decorationService.forEachDecorationAtCell(M, t3, void 0, (e4) => {
                "top" !== e4.options.layer && J || (e4.backgroundColorRGB && (K = 50331648, z = e4.backgroundColorRGB.rgba >> 8 & 16777215, V = e4.backgroundColorRGB), e4.foregroundColorRGB && (j = 50331648, $2 = e4.foregroundColorRGB.rgba >> 8 & 16777215, G = e4.foregroundColorRGB), J = "top" === e4.options.layer);
              }), !J && H && (V = this._coreBrowserService.isFocused ? S.selectionBackgroundOpaque : S.selectionInactiveBackgroundOpaque, z = V.rgba >> 8 & 16777215, K = 50331648, J = true, S.selectionForeground && (j = 50331648, $2 = S.selectionForeground.rgba >> 8 & 16777215, G = S.selectionForeground)), J && B.push("xterm-decoration-top"), K) {
                case 16777216:
                case 33554432:
                  X = S.ansi[z], B.push(`xterm-bg-${z}`);
                  break;
                case 50331648:
                  X = c.rgba.toColor(z >> 16, z >> 8 & 255, 255 & z), this._addStyle(C, `background-color:#${v((z >>> 0).toString(16), "0", 6)}`);
                  break;
                default:
                  q ? (X = S.foreground, B.push(`xterm-bg-${n.INVERTED_DEFAULT_COLOR}`)) : X = S.background;
              }
              switch (V || I.isDim() && (V = c.color.multiplyOpacity(X, 0.5)), j) {
                case 16777216:
                case 33554432:
                  I.isBold() && $2 < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors && ($2 += 8), this._applyMinimumContrast(C, X, S.ansi[$2], I, V, void 0) || B.push(`xterm-fg-${$2}`);
                  break;
                case 50331648:
                  const e4 = c.rgba.toColor($2 >> 16 & 255, $2 >> 8 & 255, 255 & $2);
                  this._applyMinimumContrast(C, X, e4, I, V, G) || this._addStyle(C, `color:#${v($2.toString(16), "0", 6)}`);
                  break;
                default:
                  this._applyMinimumContrast(C, X, S.foreground, I, V, void 0) || q && B.push(`xterm-fg-${n.INVERTED_DEFAULT_COLOR}`);
              }
              B.length && (C.className = B.join(" "), B.length = 0), F || O || U ? C.textContent = w : y++, A !== this.defaultSpacing && (C.style.letterSpacing = `${A}px`), g.push(C), M = P;
            }
            return C && y && (C.textContent = w), g;
          }
          _applyMinimumContrast(e3, t3, i3, s3, r2, n2) {
            if (1 === this._optionsService.rawOptions.minimumContrastRatio || (0, _.excludeFromContrastRatioDemands)(s3.getCode()))
              return false;
            const o2 = this._getContrastCache(s3);
            let a2;
            if (r2 || n2 || (a2 = o2.getColor(t3.rgba, i3.rgba)), void 0 === a2) {
              const e4 = this._optionsService.rawOptions.minimumContrastRatio / (s3.isDim() ? 2 : 1);
              a2 = c.color.ensureContrastRatio(r2 || t3, n2 || i3, e4), o2.setColor((r2 || t3).rgba, (n2 || i3).rgba, null != a2 ? a2 : null);
            }
            return !!a2 && (this._addStyle(e3, `color:${a2.css}`), true);
          }
          _getContrastCache(e3) {
            return e3.isDim() ? this._themeService.colors.halfContrastCache : this._themeService.colors.contrastCache;
          }
          _addStyle(e3, t3) {
            e3.setAttribute("style", `${e3.getAttribute("style") || ""}${t3};`);
          }
          _isCellInSelection(e3, t3) {
            const i3 = this._selectionStart, s3 = this._selectionEnd;
            return !(!i3 || !s3) && (this._columnSelectMode ? i3[0] <= s3[0] ? e3 >= i3[0] && t3 >= i3[1] && e3 < s3[0] && t3 <= s3[1] : e3 < i3[0] && t3 >= i3[1] && e3 >= s3[0] && t3 <= s3[1] : t3 > i3[1] && t3 < s3[1] || i3[1] === s3[1] && t3 === i3[1] && e3 >= i3[0] && e3 < s3[0] || i3[1] < s3[1] && t3 === s3[1] && e3 < s3[0] || i3[1] < s3[1] && t3 === i3[1] && e3 >= i3[0]);
          }
        };
        function v(e3, t3, i3) {
          for (; e3.length < i3; )
            e3 = t3 + e3;
          return e3;
        }
        t2.DomRendererRowFactory = f = s2([r(1, l.ICharacterJoinerService), r(2, h.IOptionsService), r(3, l.ICoreBrowserService), r(4, h.ICoreService), r(5, h.IDecorationService), r(6, l.IThemeService)], f);
      }, 2550: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WidthCache = void 0, t2.WidthCache = class {
          constructor(e3) {
            this._flat = new Float32Array(256), this._font = "", this._fontSize = 0, this._weight = "normal", this._weightBold = "bold", this._measureElements = [], this._container = e3.createElement("div"), this._container.style.position = "absolute", this._container.style.top = "-50000px", this._container.style.width = "50000px", this._container.style.whiteSpace = "pre", this._container.style.fontKerning = "none";
            const t3 = e3.createElement("span"), i2 = e3.createElement("span");
            i2.style.fontWeight = "bold";
            const s2 = e3.createElement("span");
            s2.style.fontStyle = "italic";
            const r = e3.createElement("span");
            r.style.fontWeight = "bold", r.style.fontStyle = "italic", this._measureElements = [t3, i2, s2, r], this._container.appendChild(t3), this._container.appendChild(i2), this._container.appendChild(s2), this._container.appendChild(r), e3.body.appendChild(this._container), this.clear();
          }
          dispose() {
            this._container.remove(), this._measureElements.length = 0, this._holey = void 0;
          }
          clear() {
            this._flat.fill(-9999), this._holey = /* @__PURE__ */ new Map();
          }
          setFont(e3, t3, i2, s2) {
            e3 === this._font && t3 === this._fontSize && i2 === this._weight && s2 === this._weightBold || (this._font = e3, this._fontSize = t3, this._weight = i2, this._weightBold = s2, this._container.style.fontFamily = this._font, this._container.style.fontSize = `${this._fontSize}px`, this._measureElements[0].style.fontWeight = `${i2}`, this._measureElements[1].style.fontWeight = `${s2}`, this._measureElements[2].style.fontWeight = `${i2}`, this._measureElements[3].style.fontWeight = `${s2}`, this.clear());
          }
          get(e3, t3, i2) {
            let s2 = 0;
            if (!t3 && !i2 && 1 === e3.length && (s2 = e3.charCodeAt(0)) < 256)
              return -9999 !== this._flat[s2] ? this._flat[s2] : this._flat[s2] = this._measure(e3, 0);
            let r = e3;
            t3 && (r += "B"), i2 && (r += "I");
            let n = this._holey.get(r);
            if (void 0 === n) {
              let s3 = 0;
              t3 && (s3 |= 1), i2 && (s3 |= 2), n = this._measure(e3, s3), this._holey.set(r, n);
            }
            return n;
          }
          _measure(e3, t3) {
            const i2 = this._measureElements[t3];
            return i2.textContent = e3.repeat(32), i2.offsetWidth / 32;
          }
        };
      }, 2223: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.TEXT_BASELINE = t2.DIM_OPACITY = t2.INVERTED_DEFAULT_COLOR = void 0;
        const s2 = i2(6114);
        t2.INVERTED_DEFAULT_COLOR = 257, t2.DIM_OPACITY = 0.5, t2.TEXT_BASELINE = s2.isFirefox || s2.isLegacyEdge ? "bottom" : "ideographic";
      }, 6171: (e2, t2) => {
        function i2(e3) {
          return 57508 <= e3 && e3 <= 57558;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.createRenderDimensions = t2.excludeFromContrastRatioDemands = t2.isRestrictedPowerlineGlyph = t2.isPowerlineGlyph = t2.throwIfFalsy = void 0, t2.throwIfFalsy = function(e3) {
          if (!e3)
            throw new Error("value must not be falsy");
          return e3;
        }, t2.isPowerlineGlyph = i2, t2.isRestrictedPowerlineGlyph = function(e3) {
          return 57520 <= e3 && e3 <= 57527;
        }, t2.excludeFromContrastRatioDemands = function(e3) {
          return i2(e3) || function(e4) {
            return 9472 <= e4 && e4 <= 9631;
          }(e3);
        }, t2.createRenderDimensions = function() {
          return { css: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 } }, device: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 }, char: { width: 0, height: 0, left: 0, top: 0 } } };
        };
      }, 456: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SelectionModel = void 0, t2.SelectionModel = class {
          constructor(e3) {
            this._bufferService = e3, this.isSelectAllActive = false, this.selectionStartLength = 0;
          }
          clearSelection() {
            this.selectionStart = void 0, this.selectionEnd = void 0, this.isSelectAllActive = false, this.selectionStartLength = 0;
          }
          get finalSelectionStart() {
            return this.isSelectAllActive ? [0, 0] : this.selectionEnd && this.selectionStart && this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
          }
          get finalSelectionEnd() {
            if (this.isSelectAllActive)
              return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
            if (this.selectionStart) {
              if (!this.selectionEnd || this.areSelectionValuesReversed()) {
                const e3 = this.selectionStart[0] + this.selectionStartLength;
                return e3 > this._bufferService.cols ? e3 % this._bufferService.cols == 0 ? [this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols) - 1] : [e3 % this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols)] : [e3, this.selectionStart[1]];
              }
              if (this.selectionStartLength && this.selectionEnd[1] === this.selectionStart[1]) {
                const e3 = this.selectionStart[0] + this.selectionStartLength;
                return e3 > this._bufferService.cols ? [e3 % this._bufferService.cols, this.selectionStart[1] + Math.floor(e3 / this._bufferService.cols)] : [Math.max(e3, this.selectionEnd[0]), this.selectionEnd[1]];
              }
              return this.selectionEnd;
            }
          }
          areSelectionValuesReversed() {
            const e3 = this.selectionStart, t3 = this.selectionEnd;
            return !(!e3 || !t3) && (e3[1] > t3[1] || e3[1] === t3[1] && e3[0] > t3[0]);
          }
          handleTrim(e3) {
            return this.selectionStart && (this.selectionStart[1] -= e3), this.selectionEnd && (this.selectionEnd[1] -= e3), this.selectionEnd && this.selectionEnd[1] < 0 ? (this.clearSelection(), true) : (this.selectionStart && this.selectionStart[1] < 0 && (this.selectionStart[1] = 0), false);
          }
        };
      }, 428: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharSizeService = void 0;
        const n = i2(2585), o = i2(8460), a = i2(844);
        let h = t2.CharSizeService = class extends a.Disposable {
          get hasValidSize() {
            return this.width > 0 && this.height > 0;
          }
          constructor(e3, t3, i3) {
            super(), this._optionsService = i3, this.width = 0, this.height = 0, this._onCharSizeChange = this.register(new o.EventEmitter()), this.onCharSizeChange = this._onCharSizeChange.event, this._measureStrategy = new c(e3, t3, this._optionsService), this.register(this._optionsService.onMultipleOptionChange(["fontFamily", "fontSize"], () => this.measure()));
          }
          measure() {
            const e3 = this._measureStrategy.measure();
            e3.width === this.width && e3.height === this.height || (this.width = e3.width, this.height = e3.height, this._onCharSizeChange.fire());
          }
        };
        t2.CharSizeService = h = s2([r(2, n.IOptionsService)], h);
        class c {
          constructor(e3, t3, i3) {
            this._document = e3, this._parentElement = t3, this._optionsService = i3, this._result = { width: 0, height: 0 }, this._measureElement = this._document.createElement("span"), this._measureElement.classList.add("xterm-char-measure-element"), this._measureElement.textContent = "W".repeat(32), this._measureElement.setAttribute("aria-hidden", "true"), this._measureElement.style.whiteSpace = "pre", this._measureElement.style.fontKerning = "none", this._parentElement.appendChild(this._measureElement);
          }
          measure() {
            this._measureElement.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`;
            const e3 = { height: Number(this._measureElement.offsetHeight), width: Number(this._measureElement.offsetWidth) };
            return 0 !== e3.width && 0 !== e3.height && (this._result.width = e3.width / 32, this._result.height = Math.ceil(e3.height)), this._result;
          }
        }
      }, 4269: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharacterJoinerService = t2.JoinedCellData = void 0;
        const n = i2(3734), o = i2(643), a = i2(511), h = i2(2585);
        class c extends n.AttributeData {
          constructor(e3, t3, i3) {
            super(), this.content = 0, this.combinedData = "", this.fg = e3.fg, this.bg = e3.bg, this.combinedData = t3, this._width = i3;
          }
          isCombined() {
            return 2097152;
          }
          getWidth() {
            return this._width;
          }
          getChars() {
            return this.combinedData;
          }
          getCode() {
            return 2097151;
          }
          setFromCharData(e3) {
            throw new Error("not implemented");
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t2.JoinedCellData = c;
        let l = t2.CharacterJoinerService = class e3 {
          constructor(e4) {
            this._bufferService = e4, this._characterJoiners = [], this._nextCharacterJoinerId = 0, this._workCell = new a.CellData();
          }
          register(e4) {
            const t3 = { id: this._nextCharacterJoinerId++, handler: e4 };
            return this._characterJoiners.push(t3), t3.id;
          }
          deregister(e4) {
            for (let t3 = 0; t3 < this._characterJoiners.length; t3++)
              if (this._characterJoiners[t3].id === e4)
                return this._characterJoiners.splice(t3, 1), true;
            return false;
          }
          getJoinedCharacters(e4) {
            if (0 === this._characterJoiners.length)
              return [];
            const t3 = this._bufferService.buffer.lines.get(e4);
            if (!t3 || 0 === t3.length)
              return [];
            const i3 = [], s3 = t3.translateToString(true);
            let r2 = 0, n2 = 0, a2 = 0, h2 = t3.getFg(0), c2 = t3.getBg(0);
            for (let e5 = 0; e5 < t3.getTrimmedLength(); e5++)
              if (t3.loadCell(e5, this._workCell), 0 !== this._workCell.getWidth()) {
                if (this._workCell.fg !== h2 || this._workCell.bg !== c2) {
                  if (e5 - r2 > 1) {
                    const e6 = this._getJoinedRanges(s3, a2, n2, t3, r2);
                    for (let t4 = 0; t4 < e6.length; t4++)
                      i3.push(e6[t4]);
                  }
                  r2 = e5, a2 = n2, h2 = this._workCell.fg, c2 = this._workCell.bg;
                }
                n2 += this._workCell.getChars().length || o.WHITESPACE_CELL_CHAR.length;
              }
            if (this._bufferService.cols - r2 > 1) {
              const e5 = this._getJoinedRanges(s3, a2, n2, t3, r2);
              for (let t4 = 0; t4 < e5.length; t4++)
                i3.push(e5[t4]);
            }
            return i3;
          }
          _getJoinedRanges(t3, i3, s3, r2, n2) {
            const o2 = t3.substring(i3, s3);
            let a2 = [];
            try {
              a2 = this._characterJoiners[0].handler(o2);
            } catch (e4) {
              console.error(e4);
            }
            for (let t4 = 1; t4 < this._characterJoiners.length; t4++)
              try {
                const i4 = this._characterJoiners[t4].handler(o2);
                for (let t5 = 0; t5 < i4.length; t5++)
                  e3._mergeRanges(a2, i4[t5]);
              } catch (e4) {
                console.error(e4);
              }
            return this._stringRangesToCellRanges(a2, r2, n2), a2;
          }
          _stringRangesToCellRanges(e4, t3, i3) {
            let s3 = 0, r2 = false, n2 = 0, a2 = e4[s3];
            if (a2) {
              for (let h2 = i3; h2 < this._bufferService.cols; h2++) {
                const i4 = t3.getWidth(h2), c2 = t3.getString(h2).length || o.WHITESPACE_CELL_CHAR.length;
                if (0 !== i4) {
                  if (!r2 && a2[0] <= n2 && (a2[0] = h2, r2 = true), a2[1] <= n2) {
                    if (a2[1] = h2, a2 = e4[++s3], !a2)
                      break;
                    a2[0] <= n2 ? (a2[0] = h2, r2 = true) : r2 = false;
                  }
                  n2 += c2;
                }
              }
              a2 && (a2[1] = this._bufferService.cols);
            }
          }
          static _mergeRanges(e4, t3) {
            let i3 = false;
            for (let s3 = 0; s3 < e4.length; s3++) {
              const r2 = e4[s3];
              if (i3) {
                if (t3[1] <= r2[0])
                  return e4[s3 - 1][1] = t3[1], e4;
                if (t3[1] <= r2[1])
                  return e4[s3 - 1][1] = Math.max(t3[1], r2[1]), e4.splice(s3, 1), e4;
                e4.splice(s3, 1), s3--;
              } else {
                if (t3[1] <= r2[0])
                  return e4.splice(s3, 0, t3), e4;
                if (t3[1] <= r2[1])
                  return r2[0] = Math.min(t3[0], r2[0]), e4;
                t3[0] < r2[1] && (r2[0] = Math.min(t3[0], r2[0]), i3 = true);
              }
            }
            return i3 ? e4[e4.length - 1][1] = t3[1] : e4.push(t3), e4;
          }
        };
        t2.CharacterJoinerService = l = s2([r(0, h.IBufferService)], l);
      }, 5114: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreBrowserService = void 0, t2.CoreBrowserService = class {
          constructor(e3, t3) {
            this._textarea = e3, this.window = t3, this._isFocused = false, this._cachedIsFocused = void 0, this._textarea.addEventListener("focus", () => this._isFocused = true), this._textarea.addEventListener("blur", () => this._isFocused = false);
          }
          get dpr() {
            return this.window.devicePixelRatio;
          }
          get isFocused() {
            return void 0 === this._cachedIsFocused && (this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus(), queueMicrotask(() => this._cachedIsFocused = void 0)), this._cachedIsFocused;
          }
        };
      }, 8934: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.MouseService = void 0;
        const n = i2(4725), o = i2(9806);
        let a = t2.MouseService = class {
          constructor(e3, t3) {
            this._renderService = e3, this._charSizeService = t3;
          }
          getCoords(e3, t3, i3, s3, r2) {
            return (0, o.getCoords)(window, e3, t3, i3, s3, this._charSizeService.hasValidSize, this._renderService.dimensions.css.cell.width, this._renderService.dimensions.css.cell.height, r2);
          }
          getMouseReportCoords(e3, t3) {
            const i3 = (0, o.getCoordsRelativeToElement)(window, e3, t3);
            if (this._charSizeService.hasValidSize)
              return i3[0] = Math.min(Math.max(i3[0], 0), this._renderService.dimensions.css.canvas.width - 1), i3[1] = Math.min(Math.max(i3[1], 0), this._renderService.dimensions.css.canvas.height - 1), { col: Math.floor(i3[0] / this._renderService.dimensions.css.cell.width), row: Math.floor(i3[1] / this._renderService.dimensions.css.cell.height), x: Math.floor(i3[0]), y: Math.floor(i3[1]) };
          }
        };
        t2.MouseService = a = s2([r(0, n.IRenderService), r(1, n.ICharSizeService)], a);
      }, 3230: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.RenderService = void 0;
        const n = i2(3656), o = i2(6193), a = i2(5596), h = i2(4725), c = i2(8460), l = i2(844), d = i2(7226), _ = i2(2585);
        let u = t2.RenderService = class extends l.Disposable {
          get dimensions() {
            return this._renderer.value.dimensions;
          }
          constructor(e3, t3, i3, s3, r2, h2, _2, u2) {
            if (super(), this._rowCount = e3, this._charSizeService = s3, this._renderer = this.register(new l.MutableDisposable()), this._pausedResizeTask = new d.DebouncedIdleTask(), this._isPaused = false, this._needsFullRefresh = false, this._isNextRenderRedrawOnly = true, this._needsSelectionRefresh = false, this._canvasWidth = 0, this._canvasHeight = 0, this._selectionState = { start: void 0, end: void 0, columnSelectMode: false }, this._onDimensionsChange = this.register(new c.EventEmitter()), this.onDimensionsChange = this._onDimensionsChange.event, this._onRenderedViewportChange = this.register(new c.EventEmitter()), this.onRenderedViewportChange = this._onRenderedViewportChange.event, this._onRender = this.register(new c.EventEmitter()), this.onRender = this._onRender.event, this._onRefreshRequest = this.register(new c.EventEmitter()), this.onRefreshRequest = this._onRefreshRequest.event, this._renderDebouncer = new o.RenderDebouncer(_2.window, (e4, t4) => this._renderRows(e4, t4)), this.register(this._renderDebouncer), this._screenDprMonitor = new a.ScreenDprMonitor(_2.window), this._screenDprMonitor.setListener(() => this.handleDevicePixelRatioChange()), this.register(this._screenDprMonitor), this.register(h2.onResize(() => this._fullRefresh())), this.register(h2.buffers.onBufferActivate(() => {
              var e4;
              return null === (e4 = this._renderer.value) || void 0 === e4 ? void 0 : e4.clear();
            })), this.register(i3.onOptionChange(() => this._handleOptionsChanged())), this.register(this._charSizeService.onCharSizeChange(() => this.handleCharSizeChanged())), this.register(r2.onDecorationRegistered(() => this._fullRefresh())), this.register(r2.onDecorationRemoved(() => this._fullRefresh())), this.register(i3.onMultipleOptionChange(["customGlyphs", "drawBoldTextInBrightColors", "letterSpacing", "lineHeight", "fontFamily", "fontSize", "fontWeight", "fontWeightBold", "minimumContrastRatio"], () => {
              this.clear(), this.handleResize(h2.cols, h2.rows), this._fullRefresh();
            })), this.register(i3.onMultipleOptionChange(["cursorBlink", "cursorStyle"], () => this.refreshRows(h2.buffer.y, h2.buffer.y, true))), this.register((0, n.addDisposableDomListener)(_2.window, "resize", () => this.handleDevicePixelRatioChange())), this.register(u2.onChangeColors(() => this._fullRefresh())), "IntersectionObserver" in _2.window) {
              const e4 = new _2.window.IntersectionObserver((e5) => this._handleIntersectionChange(e5[e5.length - 1]), { threshold: 0 });
              e4.observe(t3), this.register({ dispose: () => e4.disconnect() });
            }
          }
          _handleIntersectionChange(e3) {
            this._isPaused = void 0 === e3.isIntersecting ? 0 === e3.intersectionRatio : !e3.isIntersecting, this._isPaused || this._charSizeService.hasValidSize || this._charSizeService.measure(), !this._isPaused && this._needsFullRefresh && (this._pausedResizeTask.flush(), this.refreshRows(0, this._rowCount - 1), this._needsFullRefresh = false);
          }
          refreshRows(e3, t3, i3 = false) {
            this._isPaused ? this._needsFullRefresh = true : (i3 || (this._isNextRenderRedrawOnly = false), this._renderDebouncer.refresh(e3, t3, this._rowCount));
          }
          _renderRows(e3, t3) {
            this._renderer.value && (e3 = Math.min(e3, this._rowCount - 1), t3 = Math.min(t3, this._rowCount - 1), this._renderer.value.renderRows(e3, t3), this._needsSelectionRefresh && (this._renderer.value.handleSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode), this._needsSelectionRefresh = false), this._isNextRenderRedrawOnly || this._onRenderedViewportChange.fire({ start: e3, end: t3 }), this._onRender.fire({ start: e3, end: t3 }), this._isNextRenderRedrawOnly = true);
          }
          resize(e3, t3) {
            this._rowCount = t3, this._fireOnCanvasResize();
          }
          _handleOptionsChanged() {
            this._renderer.value && (this.refreshRows(0, this._rowCount - 1), this._fireOnCanvasResize());
          }
          _fireOnCanvasResize() {
            this._renderer.value && (this._renderer.value.dimensions.css.canvas.width === this._canvasWidth && this._renderer.value.dimensions.css.canvas.height === this._canvasHeight || this._onDimensionsChange.fire(this._renderer.value.dimensions));
          }
          hasRenderer() {
            return !!this._renderer.value;
          }
          setRenderer(e3) {
            this._renderer.value = e3, this._renderer.value.onRequestRedraw((e4) => this.refreshRows(e4.start, e4.end, true)), this._needsSelectionRefresh = true, this._fullRefresh();
          }
          addRefreshCallback(e3) {
            return this._renderDebouncer.addRefreshCallback(e3);
          }
          _fullRefresh() {
            this._isPaused ? this._needsFullRefresh = true : this.refreshRows(0, this._rowCount - 1);
          }
          clearTextureAtlas() {
            var e3, t3;
            this._renderer.value && (null === (t3 = (e3 = this._renderer.value).clearTextureAtlas) || void 0 === t3 || t3.call(e3), this._fullRefresh());
          }
          handleDevicePixelRatioChange() {
            this._charSizeService.measure(), this._renderer.value && (this._renderer.value.handleDevicePixelRatioChange(), this.refreshRows(0, this._rowCount - 1));
          }
          handleResize(e3, t3) {
            this._renderer.value && (this._isPaused ? this._pausedResizeTask.set(() => this._renderer.value.handleResize(e3, t3)) : this._renderer.value.handleResize(e3, t3), this._fullRefresh());
          }
          handleCharSizeChanged() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleCharSizeChanged();
          }
          handleBlur() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleBlur();
          }
          handleFocus() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleFocus();
          }
          handleSelectionChanged(e3, t3, i3) {
            var s3;
            this._selectionState.start = e3, this._selectionState.end = t3, this._selectionState.columnSelectMode = i3, null === (s3 = this._renderer.value) || void 0 === s3 || s3.handleSelectionChanged(e3, t3, i3);
          }
          handleCursorMove() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.handleCursorMove();
          }
          clear() {
            var e3;
            null === (e3 = this._renderer.value) || void 0 === e3 || e3.clear();
          }
        };
        t2.RenderService = u = s2([r(2, _.IOptionsService), r(3, h.ICharSizeService), r(4, _.IDecorationService), r(5, _.IBufferService), r(6, h.ICoreBrowserService), r(7, h.IThemeService)], u);
      }, 9312: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SelectionService = void 0;
        const n = i2(9806), o = i2(9504), a = i2(456), h = i2(4725), c = i2(8460), l = i2(844), d = i2(6114), _ = i2(4841), u = i2(511), f = i2(2585), v = String.fromCharCode(160), p = new RegExp(v, "g");
        let g = t2.SelectionService = class extends l.Disposable {
          constructor(e3, t3, i3, s3, r2, n2, o2, h2, d2) {
            super(), this._element = e3, this._screenElement = t3, this._linkifier = i3, this._bufferService = s3, this._coreService = r2, this._mouseService = n2, this._optionsService = o2, this._renderService = h2, this._coreBrowserService = d2, this._dragScrollAmount = 0, this._enabled = true, this._workCell = new u.CellData(), this._mouseDownTimeStamp = 0, this._oldHasSelection = false, this._oldSelectionStart = void 0, this._oldSelectionEnd = void 0, this._onLinuxMouseSelection = this.register(new c.EventEmitter()), this.onLinuxMouseSelection = this._onLinuxMouseSelection.event, this._onRedrawRequest = this.register(new c.EventEmitter()), this.onRequestRedraw = this._onRedrawRequest.event, this._onSelectionChange = this.register(new c.EventEmitter()), this.onSelectionChange = this._onSelectionChange.event, this._onRequestScrollLines = this.register(new c.EventEmitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this._mouseMoveListener = (e4) => this._handleMouseMove(e4), this._mouseUpListener = (e4) => this._handleMouseUp(e4), this._coreService.onUserInput(() => {
              this.hasSelection && this.clearSelection();
            }), this._trimListener = this._bufferService.buffer.lines.onTrim((e4) => this._handleTrim(e4)), this.register(this._bufferService.buffers.onBufferActivate((e4) => this._handleBufferActivate(e4))), this.enable(), this._model = new a.SelectionModel(this._bufferService), this._activeSelectionMode = 0, this.register((0, l.toDisposable)(() => {
              this._removeMouseDownListeners();
            }));
          }
          reset() {
            this.clearSelection();
          }
          disable() {
            this.clearSelection(), this._enabled = false;
          }
          enable() {
            this._enabled = true;
          }
          get selectionStart() {
            return this._model.finalSelectionStart;
          }
          get selectionEnd() {
            return this._model.finalSelectionEnd;
          }
          get hasSelection() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd;
            return !(!e3 || !t3 || e3[0] === t3[0] && e3[1] === t3[1]);
          }
          get selectionText() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd;
            if (!e3 || !t3)
              return "";
            const i3 = this._bufferService.buffer, s3 = [];
            if (3 === this._activeSelectionMode) {
              if (e3[0] === t3[0])
                return "";
              const r2 = e3[0] < t3[0] ? e3[0] : t3[0], n2 = e3[0] < t3[0] ? t3[0] : e3[0];
              for (let o2 = e3[1]; o2 <= t3[1]; o2++) {
                const e4 = i3.translateBufferLineToString(o2, true, r2, n2);
                s3.push(e4);
              }
            } else {
              const r2 = e3[1] === t3[1] ? t3[0] : void 0;
              s3.push(i3.translateBufferLineToString(e3[1], true, e3[0], r2));
              for (let r3 = e3[1] + 1; r3 <= t3[1] - 1; r3++) {
                const e4 = i3.lines.get(r3), t4 = i3.translateBufferLineToString(r3, true);
                (null == e4 ? void 0 : e4.isWrapped) ? s3[s3.length - 1] += t4 : s3.push(t4);
              }
              if (e3[1] !== t3[1]) {
                const e4 = i3.lines.get(t3[1]), r3 = i3.translateBufferLineToString(t3[1], true, 0, t3[0]);
                e4 && e4.isWrapped ? s3[s3.length - 1] += r3 : s3.push(r3);
              }
            }
            return s3.map((e4) => e4.replace(p, " ")).join(d.isWindows ? "\r\n" : "\n");
          }
          clearSelection() {
            this._model.clearSelection(), this._removeMouseDownListeners(), this.refresh(), this._onSelectionChange.fire();
          }
          refresh(e3) {
            this._refreshAnimationFrame || (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._refresh())), d.isLinux && e3 && this.selectionText.length && this._onLinuxMouseSelection.fire(this.selectionText);
          }
          _refresh() {
            this._refreshAnimationFrame = void 0, this._onRedrawRequest.fire({ start: this._model.finalSelectionStart, end: this._model.finalSelectionEnd, columnSelectMode: 3 === this._activeSelectionMode });
          }
          _isClickInSelection(e3) {
            const t3 = this._getMouseBufferCoords(e3), i3 = this._model.finalSelectionStart, s3 = this._model.finalSelectionEnd;
            return !!(i3 && s3 && t3) && this._areCoordsInSelection(t3, i3, s3);
          }
          isCellInSelection(e3, t3) {
            const i3 = this._model.finalSelectionStart, s3 = this._model.finalSelectionEnd;
            return !(!i3 || !s3) && this._areCoordsInSelection([e3, t3], i3, s3);
          }
          _areCoordsInSelection(e3, t3, i3) {
            return e3[1] > t3[1] && e3[1] < i3[1] || t3[1] === i3[1] && e3[1] === t3[1] && e3[0] >= t3[0] && e3[0] < i3[0] || t3[1] < i3[1] && e3[1] === i3[1] && e3[0] < i3[0] || t3[1] < i3[1] && e3[1] === t3[1] && e3[0] >= t3[0];
          }
          _selectWordAtCursor(e3, t3) {
            var i3, s3;
            const r2 = null === (s3 = null === (i3 = this._linkifier.currentLink) || void 0 === i3 ? void 0 : i3.link) || void 0 === s3 ? void 0 : s3.range;
            if (r2)
              return this._model.selectionStart = [r2.start.x - 1, r2.start.y - 1], this._model.selectionStartLength = (0, _.getRangeLength)(r2, this._bufferService.cols), this._model.selectionEnd = void 0, true;
            const n2 = this._getMouseBufferCoords(e3);
            return !!n2 && (this._selectWordAt(n2, t3), this._model.selectionEnd = void 0, true);
          }
          selectAll() {
            this._model.isSelectAllActive = true, this.refresh(), this._onSelectionChange.fire();
          }
          selectLines(e3, t3) {
            this._model.clearSelection(), e3 = Math.max(e3, 0), t3 = Math.min(t3, this._bufferService.buffer.lines.length - 1), this._model.selectionStart = [0, e3], this._model.selectionEnd = [this._bufferService.cols, t3], this.refresh(), this._onSelectionChange.fire();
          }
          _handleTrim(e3) {
            this._model.handleTrim(e3) && this.refresh();
          }
          _getMouseBufferCoords(e3) {
            const t3 = this._mouseService.getCoords(e3, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
            if (t3)
              return t3[0]--, t3[1]--, t3[1] += this._bufferService.buffer.ydisp, t3;
          }
          _getMouseEventScrollAmount(e3) {
            let t3 = (0, n.getCoordsRelativeToElement)(this._coreBrowserService.window, e3, this._screenElement)[1];
            const i3 = this._renderService.dimensions.css.canvas.height;
            return t3 >= 0 && t3 <= i3 ? 0 : (t3 > i3 && (t3 -= i3), t3 = Math.min(Math.max(t3, -50), 50), t3 /= 50, t3 / Math.abs(t3) + Math.round(14 * t3));
          }
          shouldForceSelection(e3) {
            return d.isMac ? e3.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection : e3.shiftKey;
          }
          handleMouseDown(e3) {
            if (this._mouseDownTimeStamp = e3.timeStamp, (2 !== e3.button || !this.hasSelection) && 0 === e3.button) {
              if (!this._enabled) {
                if (!this.shouldForceSelection(e3))
                  return;
                e3.stopPropagation();
              }
              e3.preventDefault(), this._dragScrollAmount = 0, this._enabled && e3.shiftKey ? this._handleIncrementalClick(e3) : 1 === e3.detail ? this._handleSingleClick(e3) : 2 === e3.detail ? this._handleDoubleClick(e3) : 3 === e3.detail && this._handleTripleClick(e3), this._addMouseDownListeners(), this.refresh(true);
            }
          }
          _addMouseDownListeners() {
            this._screenElement.ownerDocument && (this._screenElement.ownerDocument.addEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.addEventListener("mouseup", this._mouseUpListener)), this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval(() => this._dragScroll(), 50);
          }
          _removeMouseDownListeners() {
            this._screenElement.ownerDocument && (this._screenElement.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.removeEventListener("mouseup", this._mouseUpListener)), this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer), this._dragScrollIntervalTimer = void 0;
          }
          _handleIncrementalClick(e3) {
            this._model.selectionStart && (this._model.selectionEnd = this._getMouseBufferCoords(e3));
          }
          _handleSingleClick(e3) {
            if (this._model.selectionStartLength = 0, this._model.isSelectAllActive = false, this._activeSelectionMode = this.shouldColumnSelect(e3) ? 3 : 0, this._model.selectionStart = this._getMouseBufferCoords(e3), !this._model.selectionStart)
              return;
            this._model.selectionEnd = void 0;
            const t3 = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
            t3 && t3.length !== this._model.selectionStart[0] && 0 === t3.hasWidth(this._model.selectionStart[0]) && this._model.selectionStart[0]++;
          }
          _handleDoubleClick(e3) {
            this._selectWordAtCursor(e3, true) && (this._activeSelectionMode = 1);
          }
          _handleTripleClick(e3) {
            const t3 = this._getMouseBufferCoords(e3);
            t3 && (this._activeSelectionMode = 2, this._selectLineAt(t3[1]));
          }
          shouldColumnSelect(e3) {
            return e3.altKey && !(d.isMac && this._optionsService.rawOptions.macOptionClickForcesSelection);
          }
          _handleMouseMove(e3) {
            if (e3.stopImmediatePropagation(), !this._model.selectionStart)
              return;
            const t3 = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
            if (this._model.selectionEnd = this._getMouseBufferCoords(e3), !this._model.selectionEnd)
              return void this.refresh(true);
            2 === this._activeSelectionMode ? this._model.selectionEnd[1] < this._model.selectionStart[1] ? this._model.selectionEnd[0] = 0 : this._model.selectionEnd[0] = this._bufferService.cols : 1 === this._activeSelectionMode && this._selectToWordAt(this._model.selectionEnd), this._dragScrollAmount = this._getMouseEventScrollAmount(e3), 3 !== this._activeSelectionMode && (this._dragScrollAmount > 0 ? this._model.selectionEnd[0] = this._bufferService.cols : this._dragScrollAmount < 0 && (this._model.selectionEnd[0] = 0));
            const i3 = this._bufferService.buffer;
            if (this._model.selectionEnd[1] < i3.lines.length) {
              const e4 = i3.lines.get(this._model.selectionEnd[1]);
              e4 && 0 === e4.hasWidth(this._model.selectionEnd[0]) && this._model.selectionEnd[0]++;
            }
            t3 && t3[0] === this._model.selectionEnd[0] && t3[1] === this._model.selectionEnd[1] || this.refresh(true);
          }
          _dragScroll() {
            if (this._model.selectionEnd && this._model.selectionStart && this._dragScrollAmount) {
              this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
              const e3 = this._bufferService.buffer;
              this._dragScrollAmount > 0 ? (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = this._bufferService.cols), this._model.selectionEnd[1] = Math.min(e3.ydisp + this._bufferService.rows, e3.lines.length - 1)) : (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = 0), this._model.selectionEnd[1] = e3.ydisp), this.refresh();
            }
          }
          _handleMouseUp(e3) {
            const t3 = e3.timeStamp - this._mouseDownTimeStamp;
            if (this._removeMouseDownListeners(), this.selectionText.length <= 1 && t3 < 500 && e3.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
              if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
                const t4 = this._mouseService.getCoords(e3, this._element, this._bufferService.cols, this._bufferService.rows, false);
                if (t4 && void 0 !== t4[0] && void 0 !== t4[1]) {
                  const e4 = (0, o.moveToCellSequence)(t4[0] - 1, t4[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
                  this._coreService.triggerDataEvent(e4, true);
                }
              }
            } else
              this._fireEventIfSelectionChanged();
          }
          _fireEventIfSelectionChanged() {
            const e3 = this._model.finalSelectionStart, t3 = this._model.finalSelectionEnd, i3 = !(!e3 || !t3 || e3[0] === t3[0] && e3[1] === t3[1]);
            i3 ? e3 && t3 && (this._oldSelectionStart && this._oldSelectionEnd && e3[0] === this._oldSelectionStart[0] && e3[1] === this._oldSelectionStart[1] && t3[0] === this._oldSelectionEnd[0] && t3[1] === this._oldSelectionEnd[1] || this._fireOnSelectionChange(e3, t3, i3)) : this._oldHasSelection && this._fireOnSelectionChange(e3, t3, i3);
          }
          _fireOnSelectionChange(e3, t3, i3) {
            this._oldSelectionStart = e3, this._oldSelectionEnd = t3, this._oldHasSelection = i3, this._onSelectionChange.fire();
          }
          _handleBufferActivate(e3) {
            this.clearSelection(), this._trimListener.dispose(), this._trimListener = e3.activeBuffer.lines.onTrim((e4) => this._handleTrim(e4));
          }
          _convertViewportColToCharacterIndex(e3, t3) {
            let i3 = t3;
            for (let s3 = 0; t3 >= s3; s3++) {
              const r2 = e3.loadCell(s3, this._workCell).getChars().length;
              0 === this._workCell.getWidth() ? i3-- : r2 > 1 && t3 !== s3 && (i3 += r2 - 1);
            }
            return i3;
          }
          setSelection(e3, t3, i3) {
            this._model.clearSelection(), this._removeMouseDownListeners(), this._model.selectionStart = [e3, t3], this._model.selectionStartLength = i3, this.refresh(), this._fireEventIfSelectionChanged();
          }
          rightClickSelect(e3) {
            this._isClickInSelection(e3) || (this._selectWordAtCursor(e3, false) && this.refresh(true), this._fireEventIfSelectionChanged());
          }
          _getWordAt(e3, t3, i3 = true, s3 = true) {
            if (e3[0] >= this._bufferService.cols)
              return;
            const r2 = this._bufferService.buffer, n2 = r2.lines.get(e3[1]);
            if (!n2)
              return;
            const o2 = r2.translateBufferLineToString(e3[1], false);
            let a2 = this._convertViewportColToCharacterIndex(n2, e3[0]), h2 = a2;
            const c2 = e3[0] - a2;
            let l2 = 0, d2 = 0, _2 = 0, u2 = 0;
            if (" " === o2.charAt(a2)) {
              for (; a2 > 0 && " " === o2.charAt(a2 - 1); )
                a2--;
              for (; h2 < o2.length && " " === o2.charAt(h2 + 1); )
                h2++;
            } else {
              let t4 = e3[0], i4 = e3[0];
              0 === n2.getWidth(t4) && (l2++, t4--), 2 === n2.getWidth(i4) && (d2++, i4++);
              const s4 = n2.getString(i4).length;
              for (s4 > 1 && (u2 += s4 - 1, h2 += s4 - 1); t4 > 0 && a2 > 0 && !this._isCharWordSeparator(n2.loadCell(t4 - 1, this._workCell)); ) {
                n2.loadCell(t4 - 1, this._workCell);
                const e4 = this._workCell.getChars().length;
                0 === this._workCell.getWidth() ? (l2++, t4--) : e4 > 1 && (_2 += e4 - 1, a2 -= e4 - 1), a2--, t4--;
              }
              for (; i4 < n2.length && h2 + 1 < o2.length && !this._isCharWordSeparator(n2.loadCell(i4 + 1, this._workCell)); ) {
                n2.loadCell(i4 + 1, this._workCell);
                const e4 = this._workCell.getChars().length;
                2 === this._workCell.getWidth() ? (d2++, i4++) : e4 > 1 && (u2 += e4 - 1, h2 += e4 - 1), h2++, i4++;
              }
            }
            h2++;
            let f2 = a2 + c2 - l2 + _2, v2 = Math.min(this._bufferService.cols, h2 - a2 + l2 + d2 - _2 - u2);
            if (t3 || "" !== o2.slice(a2, h2).trim()) {
              if (i3 && 0 === f2 && 32 !== n2.getCodePoint(0)) {
                const t4 = r2.lines.get(e3[1] - 1);
                if (t4 && n2.isWrapped && 32 !== t4.getCodePoint(this._bufferService.cols - 1)) {
                  const t5 = this._getWordAt([this._bufferService.cols - 1, e3[1] - 1], false, true, false);
                  if (t5) {
                    const e4 = this._bufferService.cols - t5.start;
                    f2 -= e4, v2 += e4;
                  }
                }
              }
              if (s3 && f2 + v2 === this._bufferService.cols && 32 !== n2.getCodePoint(this._bufferService.cols - 1)) {
                const t4 = r2.lines.get(e3[1] + 1);
                if ((null == t4 ? void 0 : t4.isWrapped) && 32 !== t4.getCodePoint(0)) {
                  const t5 = this._getWordAt([0, e3[1] + 1], false, false, true);
                  t5 && (v2 += t5.length);
                }
              }
              return { start: f2, length: v2 };
            }
          }
          _selectWordAt(e3, t3) {
            const i3 = this._getWordAt(e3, t3);
            if (i3) {
              for (; i3.start < 0; )
                i3.start += this._bufferService.cols, e3[1]--;
              this._model.selectionStart = [i3.start, e3[1]], this._model.selectionStartLength = i3.length;
            }
          }
          _selectToWordAt(e3) {
            const t3 = this._getWordAt(e3, true);
            if (t3) {
              let i3 = e3[1];
              for (; t3.start < 0; )
                t3.start += this._bufferService.cols, i3--;
              if (!this._model.areSelectionValuesReversed())
                for (; t3.start + t3.length > this._bufferService.cols; )
                  t3.length -= this._bufferService.cols, i3++;
              this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? t3.start : t3.start + t3.length, i3];
            }
          }
          _isCharWordSeparator(e3) {
            return 0 !== e3.getWidth() && this._optionsService.rawOptions.wordSeparator.indexOf(e3.getChars()) >= 0;
          }
          _selectLineAt(e3) {
            const t3 = this._bufferService.buffer.getWrappedRangeForLine(e3), i3 = { start: { x: 0, y: t3.first }, end: { x: this._bufferService.cols - 1, y: t3.last } };
            this._model.selectionStart = [0, t3.first], this._model.selectionEnd = void 0, this._model.selectionStartLength = (0, _.getRangeLength)(i3, this._bufferService.cols);
          }
        };
        t2.SelectionService = g = s2([r(3, f.IBufferService), r(4, f.ICoreService), r(5, h.IMouseService), r(6, f.IOptionsService), r(7, h.IRenderService), r(8, h.ICoreBrowserService)], g);
      }, 4725: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.IThemeService = t2.ICharacterJoinerService = t2.ISelectionService = t2.IRenderService = t2.IMouseService = t2.ICoreBrowserService = t2.ICharSizeService = void 0;
        const s2 = i2(8343);
        t2.ICharSizeService = (0, s2.createDecorator)("CharSizeService"), t2.ICoreBrowserService = (0, s2.createDecorator)("CoreBrowserService"), t2.IMouseService = (0, s2.createDecorator)("MouseService"), t2.IRenderService = (0, s2.createDecorator)("RenderService"), t2.ISelectionService = (0, s2.createDecorator)("SelectionService"), t2.ICharacterJoinerService = (0, s2.createDecorator)("CharacterJoinerService"), t2.IThemeService = (0, s2.createDecorator)("ThemeService");
      }, 6731: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ThemeService = t2.DEFAULT_ANSI_COLORS = void 0;
        const n = i2(7239), o = i2(8055), a = i2(8460), h = i2(844), c = i2(2585), l = o.css.toColor("#ffffff"), d = o.css.toColor("#000000"), _ = o.css.toColor("#ffffff"), u = o.css.toColor("#000000"), f = { css: "rgba(255, 255, 255, 0.3)", rgba: 4294967117 };
        t2.DEFAULT_ANSI_COLORS = Object.freeze((() => {
          const e3 = [o.css.toColor("#2e3436"), o.css.toColor("#cc0000"), o.css.toColor("#4e9a06"), o.css.toColor("#c4a000"), o.css.toColor("#3465a4"), o.css.toColor("#75507b"), o.css.toColor("#06989a"), o.css.toColor("#d3d7cf"), o.css.toColor("#555753"), o.css.toColor("#ef2929"), o.css.toColor("#8ae234"), o.css.toColor("#fce94f"), o.css.toColor("#729fcf"), o.css.toColor("#ad7fa8"), o.css.toColor("#34e2e2"), o.css.toColor("#eeeeec")], t3 = [0, 95, 135, 175, 215, 255];
          for (let i3 = 0; i3 < 216; i3++) {
            const s3 = t3[i3 / 36 % 6 | 0], r2 = t3[i3 / 6 % 6 | 0], n2 = t3[i3 % 6];
            e3.push({ css: o.channels.toCss(s3, r2, n2), rgba: o.channels.toRgba(s3, r2, n2) });
          }
          for (let t4 = 0; t4 < 24; t4++) {
            const i3 = 8 + 10 * t4;
            e3.push({ css: o.channels.toCss(i3, i3, i3), rgba: o.channels.toRgba(i3, i3, i3) });
          }
          return e3;
        })());
        let v = t2.ThemeService = class extends h.Disposable {
          get colors() {
            return this._colors;
          }
          constructor(e3) {
            super(), this._optionsService = e3, this._contrastCache = new n.ColorContrastCache(), this._halfContrastCache = new n.ColorContrastCache(), this._onChangeColors = this.register(new a.EventEmitter()), this.onChangeColors = this._onChangeColors.event, this._colors = { foreground: l, background: d, cursor: _, cursorAccent: u, selectionForeground: void 0, selectionBackgroundTransparent: f, selectionBackgroundOpaque: o.color.blend(d, f), selectionInactiveBackgroundTransparent: f, selectionInactiveBackgroundOpaque: o.color.blend(d, f), ansi: t2.DEFAULT_ANSI_COLORS.slice(), contrastCache: this._contrastCache, halfContrastCache: this._halfContrastCache }, this._updateRestoreColors(), this._setTheme(this._optionsService.rawOptions.theme), this.register(this._optionsService.onSpecificOptionChange("minimumContrastRatio", () => this._contrastCache.clear())), this.register(this._optionsService.onSpecificOptionChange("theme", () => this._setTheme(this._optionsService.rawOptions.theme)));
          }
          _setTheme(e3 = {}) {
            const i3 = this._colors;
            if (i3.foreground = p(e3.foreground, l), i3.background = p(e3.background, d), i3.cursor = p(e3.cursor, _), i3.cursorAccent = p(e3.cursorAccent, u), i3.selectionBackgroundTransparent = p(e3.selectionBackground, f), i3.selectionBackgroundOpaque = o.color.blend(i3.background, i3.selectionBackgroundTransparent), i3.selectionInactiveBackgroundTransparent = p(e3.selectionInactiveBackground, i3.selectionBackgroundTransparent), i3.selectionInactiveBackgroundOpaque = o.color.blend(i3.background, i3.selectionInactiveBackgroundTransparent), i3.selectionForeground = e3.selectionForeground ? p(e3.selectionForeground, o.NULL_COLOR) : void 0, i3.selectionForeground === o.NULL_COLOR && (i3.selectionForeground = void 0), o.color.isOpaque(i3.selectionBackgroundTransparent)) {
              const e4 = 0.3;
              i3.selectionBackgroundTransparent = o.color.opacity(i3.selectionBackgroundTransparent, e4);
            }
            if (o.color.isOpaque(i3.selectionInactiveBackgroundTransparent)) {
              const e4 = 0.3;
              i3.selectionInactiveBackgroundTransparent = o.color.opacity(i3.selectionInactiveBackgroundTransparent, e4);
            }
            if (i3.ansi = t2.DEFAULT_ANSI_COLORS.slice(), i3.ansi[0] = p(e3.black, t2.DEFAULT_ANSI_COLORS[0]), i3.ansi[1] = p(e3.red, t2.DEFAULT_ANSI_COLORS[1]), i3.ansi[2] = p(e3.green, t2.DEFAULT_ANSI_COLORS[2]), i3.ansi[3] = p(e3.yellow, t2.DEFAULT_ANSI_COLORS[3]), i3.ansi[4] = p(e3.blue, t2.DEFAULT_ANSI_COLORS[4]), i3.ansi[5] = p(e3.magenta, t2.DEFAULT_ANSI_COLORS[5]), i3.ansi[6] = p(e3.cyan, t2.DEFAULT_ANSI_COLORS[6]), i3.ansi[7] = p(e3.white, t2.DEFAULT_ANSI_COLORS[7]), i3.ansi[8] = p(e3.brightBlack, t2.DEFAULT_ANSI_COLORS[8]), i3.ansi[9] = p(e3.brightRed, t2.DEFAULT_ANSI_COLORS[9]), i3.ansi[10] = p(e3.brightGreen, t2.DEFAULT_ANSI_COLORS[10]), i3.ansi[11] = p(e3.brightYellow, t2.DEFAULT_ANSI_COLORS[11]), i3.ansi[12] = p(e3.brightBlue, t2.DEFAULT_ANSI_COLORS[12]), i3.ansi[13] = p(e3.brightMagenta, t2.DEFAULT_ANSI_COLORS[13]), i3.ansi[14] = p(e3.brightCyan, t2.DEFAULT_ANSI_COLORS[14]), i3.ansi[15] = p(e3.brightWhite, t2.DEFAULT_ANSI_COLORS[15]), e3.extendedAnsi) {
              const s3 = Math.min(i3.ansi.length - 16, e3.extendedAnsi.length);
              for (let r2 = 0; r2 < s3; r2++)
                i3.ansi[r2 + 16] = p(e3.extendedAnsi[r2], t2.DEFAULT_ANSI_COLORS[r2 + 16]);
            }
            this._contrastCache.clear(), this._halfContrastCache.clear(), this._updateRestoreColors(), this._onChangeColors.fire(this.colors);
          }
          restoreColor(e3) {
            this._restoreColor(e3), this._onChangeColors.fire(this.colors);
          }
          _restoreColor(e3) {
            if (void 0 !== e3)
              switch (e3) {
                case 256:
                  this._colors.foreground = this._restoreColors.foreground;
                  break;
                case 257:
                  this._colors.background = this._restoreColors.background;
                  break;
                case 258:
                  this._colors.cursor = this._restoreColors.cursor;
                  break;
                default:
                  this._colors.ansi[e3] = this._restoreColors.ansi[e3];
              }
            else
              for (let e4 = 0; e4 < this._restoreColors.ansi.length; ++e4)
                this._colors.ansi[e4] = this._restoreColors.ansi[e4];
          }
          modifyColors(e3) {
            e3(this._colors), this._onChangeColors.fire(this.colors);
          }
          _updateRestoreColors() {
            this._restoreColors = { foreground: this._colors.foreground, background: this._colors.background, cursor: this._colors.cursor, ansi: this._colors.ansi.slice() };
          }
        };
        function p(e3, t3) {
          if (void 0 !== e3)
            try {
              return o.css.toColor(e3);
            } catch (e4) {
            }
          return t3;
        }
        t2.ThemeService = v = s2([r(0, c.IOptionsService)], v);
      }, 6349: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CircularList = void 0;
        const s2 = i2(8460), r = i2(844);
        class n extends r.Disposable {
          constructor(e3) {
            super(), this._maxLength = e3, this.onDeleteEmitter = this.register(new s2.EventEmitter()), this.onDelete = this.onDeleteEmitter.event, this.onInsertEmitter = this.register(new s2.EventEmitter()), this.onInsert = this.onInsertEmitter.event, this.onTrimEmitter = this.register(new s2.EventEmitter()), this.onTrim = this.onTrimEmitter.event, this._array = new Array(this._maxLength), this._startIndex = 0, this._length = 0;
          }
          get maxLength() {
            return this._maxLength;
          }
          set maxLength(e3) {
            if (this._maxLength === e3)
              return;
            const t3 = new Array(e3);
            for (let i3 = 0; i3 < Math.min(e3, this.length); i3++)
              t3[i3] = this._array[this._getCyclicIndex(i3)];
            this._array = t3, this._maxLength = e3, this._startIndex = 0;
          }
          get length() {
            return this._length;
          }
          set length(e3) {
            if (e3 > this._length)
              for (let t3 = this._length; t3 < e3; t3++)
                this._array[t3] = void 0;
            this._length = e3;
          }
          get(e3) {
            return this._array[this._getCyclicIndex(e3)];
          }
          set(e3, t3) {
            this._array[this._getCyclicIndex(e3)] = t3;
          }
          push(e3) {
            this._array[this._getCyclicIndex(this._length)] = e3, this._length === this._maxLength ? (this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1)) : this._length++;
          }
          recycle() {
            if (this._length !== this._maxLength)
              throw new Error("Can only recycle when the buffer is full");
            return this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1), this._array[this._getCyclicIndex(this._length - 1)];
          }
          get isFull() {
            return this._length === this._maxLength;
          }
          pop() {
            return this._array[this._getCyclicIndex(this._length-- - 1)];
          }
          splice(e3, t3, ...i3) {
            if (t3) {
              for (let i4 = e3; i4 < this._length - t3; i4++)
                this._array[this._getCyclicIndex(i4)] = this._array[this._getCyclicIndex(i4 + t3)];
              this._length -= t3, this.onDeleteEmitter.fire({ index: e3, amount: t3 });
            }
            for (let t4 = this._length - 1; t4 >= e3; t4--)
              this._array[this._getCyclicIndex(t4 + i3.length)] = this._array[this._getCyclicIndex(t4)];
            for (let t4 = 0; t4 < i3.length; t4++)
              this._array[this._getCyclicIndex(e3 + t4)] = i3[t4];
            if (i3.length && this.onInsertEmitter.fire({ index: e3, amount: i3.length }), this._length + i3.length > this._maxLength) {
              const e4 = this._length + i3.length - this._maxLength;
              this._startIndex += e4, this._length = this._maxLength, this.onTrimEmitter.fire(e4);
            } else
              this._length += i3.length;
          }
          trimStart(e3) {
            e3 > this._length && (e3 = this._length), this._startIndex += e3, this._length -= e3, this.onTrimEmitter.fire(e3);
          }
          shiftElements(e3, t3, i3) {
            if (!(t3 <= 0)) {
              if (e3 < 0 || e3 >= this._length)
                throw new Error("start argument out of range");
              if (e3 + i3 < 0)
                throw new Error("Cannot shift elements in list beyond index 0");
              if (i3 > 0) {
                for (let s4 = t3 - 1; s4 >= 0; s4--)
                  this.set(e3 + s4 + i3, this.get(e3 + s4));
                const s3 = e3 + t3 + i3 - this._length;
                if (s3 > 0)
                  for (this._length += s3; this._length > this._maxLength; )
                    this._length--, this._startIndex++, this.onTrimEmitter.fire(1);
              } else
                for (let s3 = 0; s3 < t3; s3++)
                  this.set(e3 + s3 + i3, this.get(e3 + s3));
            }
          }
          _getCyclicIndex(e3) {
            return (this._startIndex + e3) % this._maxLength;
          }
        }
        t2.CircularList = n;
      }, 1439: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.clone = void 0, t2.clone = function e3(t3, i2 = 5) {
          if ("object" != typeof t3)
            return t3;
          const s2 = Array.isArray(t3) ? [] : {};
          for (const r in t3)
            s2[r] = i2 <= 1 ? t3[r] : t3[r] && e3(t3[r], i2 - 1);
          return s2;
        };
      }, 8055: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.contrastRatio = t2.toPaddedHex = t2.rgba = t2.rgb = t2.css = t2.color = t2.channels = t2.NULL_COLOR = void 0;
        const s2 = i2(6114);
        let r = 0, n = 0, o = 0, a = 0;
        var h, c, l, d, _;
        function u(e3) {
          const t3 = e3.toString(16);
          return t3.length < 2 ? "0" + t3 : t3;
        }
        function f(e3, t3) {
          return e3 < t3 ? (t3 + 0.05) / (e3 + 0.05) : (e3 + 0.05) / (t3 + 0.05);
        }
        t2.NULL_COLOR = { css: "#00000000", rgba: 0 }, function(e3) {
          e3.toCss = function(e4, t3, i3, s3) {
            return void 0 !== s3 ? `#${u(e4)}${u(t3)}${u(i3)}${u(s3)}` : `#${u(e4)}${u(t3)}${u(i3)}`;
          }, e3.toRgba = function(e4, t3, i3, s3 = 255) {
            return (e4 << 24 | t3 << 16 | i3 << 8 | s3) >>> 0;
          };
        }(h || (t2.channels = h = {})), function(e3) {
          function t3(e4, t4) {
            return a = Math.round(255 * t4), [r, n, o] = _.toChannels(e4.rgba), { css: h.toCss(r, n, o, a), rgba: h.toRgba(r, n, o, a) };
          }
          e3.blend = function(e4, t4) {
            if (a = (255 & t4.rgba) / 255, 1 === a)
              return { css: t4.css, rgba: t4.rgba };
            const i3 = t4.rgba >> 24 & 255, s3 = t4.rgba >> 16 & 255, c2 = t4.rgba >> 8 & 255, l2 = e4.rgba >> 24 & 255, d2 = e4.rgba >> 16 & 255, _2 = e4.rgba >> 8 & 255;
            return r = l2 + Math.round((i3 - l2) * a), n = d2 + Math.round((s3 - d2) * a), o = _2 + Math.round((c2 - _2) * a), { css: h.toCss(r, n, o), rgba: h.toRgba(r, n, o) };
          }, e3.isOpaque = function(e4) {
            return 255 == (255 & e4.rgba);
          }, e3.ensureContrastRatio = function(e4, t4, i3) {
            const s3 = _.ensureContrastRatio(e4.rgba, t4.rgba, i3);
            if (s3)
              return _.toColor(s3 >> 24 & 255, s3 >> 16 & 255, s3 >> 8 & 255);
          }, e3.opaque = function(e4) {
            const t4 = (255 | e4.rgba) >>> 0;
            return [r, n, o] = _.toChannels(t4), { css: h.toCss(r, n, o), rgba: t4 };
          }, e3.opacity = t3, e3.multiplyOpacity = function(e4, i3) {
            return a = 255 & e4.rgba, t3(e4, a * i3 / 255);
          }, e3.toColorRGB = function(e4) {
            return [e4.rgba >> 24 & 255, e4.rgba >> 16 & 255, e4.rgba >> 8 & 255];
          };
        }(c || (t2.color = c = {})), function(e3) {
          let t3, i3;
          if (!s2.isNode) {
            const e4 = document.createElement("canvas");
            e4.width = 1, e4.height = 1;
            const s3 = e4.getContext("2d", { willReadFrequently: true });
            s3 && (t3 = s3, t3.globalCompositeOperation = "copy", i3 = t3.createLinearGradient(0, 0, 1, 1));
          }
          e3.toColor = function(e4) {
            if (e4.match(/#[\da-f]{3,8}/i))
              switch (e4.length) {
                case 4:
                  return r = parseInt(e4.slice(1, 2).repeat(2), 16), n = parseInt(e4.slice(2, 3).repeat(2), 16), o = parseInt(e4.slice(3, 4).repeat(2), 16), _.toColor(r, n, o);
                case 5:
                  return r = parseInt(e4.slice(1, 2).repeat(2), 16), n = parseInt(e4.slice(2, 3).repeat(2), 16), o = parseInt(e4.slice(3, 4).repeat(2), 16), a = parseInt(e4.slice(4, 5).repeat(2), 16), _.toColor(r, n, o, a);
                case 7:
                  return { css: e4, rgba: (parseInt(e4.slice(1), 16) << 8 | 255) >>> 0 };
                case 9:
                  return { css: e4, rgba: parseInt(e4.slice(1), 16) >>> 0 };
              }
            const s3 = e4.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
            if (s3)
              return r = parseInt(s3[1]), n = parseInt(s3[2]), o = parseInt(s3[3]), a = Math.round(255 * (void 0 === s3[5] ? 1 : parseFloat(s3[5]))), _.toColor(r, n, o, a);
            if (!t3 || !i3)
              throw new Error("css.toColor: Unsupported css format");
            if (t3.fillStyle = i3, t3.fillStyle = e4, "string" != typeof t3.fillStyle)
              throw new Error("css.toColor: Unsupported css format");
            if (t3.fillRect(0, 0, 1, 1), [r, n, o, a] = t3.getImageData(0, 0, 1, 1).data, 255 !== a)
              throw new Error("css.toColor: Unsupported css format");
            return { rgba: h.toRgba(r, n, o, a), css: e4 };
          };
        }(l || (t2.css = l = {})), function(e3) {
          function t3(e4, t4, i3) {
            const s3 = e4 / 255, r2 = t4 / 255, n2 = i3 / 255;
            return 0.2126 * (s3 <= 0.03928 ? s3 / 12.92 : Math.pow((s3 + 0.055) / 1.055, 2.4)) + 0.7152 * (r2 <= 0.03928 ? r2 / 12.92 : Math.pow((r2 + 0.055) / 1.055, 2.4)) + 0.0722 * (n2 <= 0.03928 ? n2 / 12.92 : Math.pow((n2 + 0.055) / 1.055, 2.4));
          }
          e3.relativeLuminance = function(e4) {
            return t3(e4 >> 16 & 255, e4 >> 8 & 255, 255 & e4);
          }, e3.relativeLuminance2 = t3;
        }(d || (t2.rgb = d = {})), function(e3) {
          function t3(e4, t4, i4) {
            const s3 = e4 >> 24 & 255, r2 = e4 >> 16 & 255, n2 = e4 >> 8 & 255;
            let o2 = t4 >> 24 & 255, a2 = t4 >> 16 & 255, h2 = t4 >> 8 & 255, c2 = f(d.relativeLuminance2(o2, a2, h2), d.relativeLuminance2(s3, r2, n2));
            for (; c2 < i4 && (o2 > 0 || a2 > 0 || h2 > 0); )
              o2 -= Math.max(0, Math.ceil(0.1 * o2)), a2 -= Math.max(0, Math.ceil(0.1 * a2)), h2 -= Math.max(0, Math.ceil(0.1 * h2)), c2 = f(d.relativeLuminance2(o2, a2, h2), d.relativeLuminance2(s3, r2, n2));
            return (o2 << 24 | a2 << 16 | h2 << 8 | 255) >>> 0;
          }
          function i3(e4, t4, i4) {
            const s3 = e4 >> 24 & 255, r2 = e4 >> 16 & 255, n2 = e4 >> 8 & 255;
            let o2 = t4 >> 24 & 255, a2 = t4 >> 16 & 255, h2 = t4 >> 8 & 255, c2 = f(d.relativeLuminance2(o2, a2, h2), d.relativeLuminance2(s3, r2, n2));
            for (; c2 < i4 && (o2 < 255 || a2 < 255 || h2 < 255); )
              o2 = Math.min(255, o2 + Math.ceil(0.1 * (255 - o2))), a2 = Math.min(255, a2 + Math.ceil(0.1 * (255 - a2))), h2 = Math.min(255, h2 + Math.ceil(0.1 * (255 - h2))), c2 = f(d.relativeLuminance2(o2, a2, h2), d.relativeLuminance2(s3, r2, n2));
            return (o2 << 24 | a2 << 16 | h2 << 8 | 255) >>> 0;
          }
          e3.ensureContrastRatio = function(e4, s3, r2) {
            const n2 = d.relativeLuminance(e4 >> 8), o2 = d.relativeLuminance(s3 >> 8);
            if (f(n2, o2) < r2) {
              if (o2 < n2) {
                const o3 = t3(e4, s3, r2), a3 = f(n2, d.relativeLuminance(o3 >> 8));
                if (a3 < r2) {
                  const t4 = i3(e4, s3, r2);
                  return a3 > f(n2, d.relativeLuminance(t4 >> 8)) ? o3 : t4;
                }
                return o3;
              }
              const a2 = i3(e4, s3, r2), h2 = f(n2, d.relativeLuminance(a2 >> 8));
              if (h2 < r2) {
                const i4 = t3(e4, s3, r2);
                return h2 > f(n2, d.relativeLuminance(i4 >> 8)) ? a2 : i4;
              }
              return a2;
            }
          }, e3.reduceLuminance = t3, e3.increaseLuminance = i3, e3.toChannels = function(e4) {
            return [e4 >> 24 & 255, e4 >> 16 & 255, e4 >> 8 & 255, 255 & e4];
          }, e3.toColor = function(e4, t4, i4, s3) {
            return { css: h.toCss(e4, t4, i4, s3), rgba: h.toRgba(e4, t4, i4, s3) };
          };
        }(_ || (t2.rgba = _ = {})), t2.toPaddedHex = u, t2.contrastRatio = f;
      }, 8969: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreTerminal = void 0;
        const s2 = i2(844), r = i2(2585), n = i2(4348), o = i2(7866), a = i2(744), h = i2(7302), c = i2(6975), l = i2(8460), d = i2(1753), _ = i2(1480), u = i2(7994), f = i2(9282), v = i2(5435), p = i2(5981), g = i2(2660);
        let m2 = false;
        class S extends s2.Disposable {
          get onScroll() {
            return this._onScrollApi || (this._onScrollApi = this.register(new l.EventEmitter()), this._onScroll.event((e3) => {
              var t3;
              null === (t3 = this._onScrollApi) || void 0 === t3 || t3.fire(e3.position);
            })), this._onScrollApi.event;
          }
          get cols() {
            return this._bufferService.cols;
          }
          get rows() {
            return this._bufferService.rows;
          }
          get buffers() {
            return this._bufferService.buffers;
          }
          get options() {
            return this.optionsService.options;
          }
          set options(e3) {
            for (const t3 in e3)
              this.optionsService.options[t3] = e3[t3];
          }
          constructor(e3) {
            super(), this._windowsWrappingHeuristics = this.register(new s2.MutableDisposable()), this._onBinary = this.register(new l.EventEmitter()), this.onBinary = this._onBinary.event, this._onData = this.register(new l.EventEmitter()), this.onData = this._onData.event, this._onLineFeed = this.register(new l.EventEmitter()), this.onLineFeed = this._onLineFeed.event, this._onResize = this.register(new l.EventEmitter()), this.onResize = this._onResize.event, this._onWriteParsed = this.register(new l.EventEmitter()), this.onWriteParsed = this._onWriteParsed.event, this._onScroll = this.register(new l.EventEmitter()), this._instantiationService = new n.InstantiationService(), this.optionsService = this.register(new h.OptionsService(e3)), this._instantiationService.setService(r.IOptionsService, this.optionsService), this._bufferService = this.register(this._instantiationService.createInstance(a.BufferService)), this._instantiationService.setService(r.IBufferService, this._bufferService), this._logService = this.register(this._instantiationService.createInstance(o.LogService)), this._instantiationService.setService(r.ILogService, this._logService), this.coreService = this.register(this._instantiationService.createInstance(c.CoreService)), this._instantiationService.setService(r.ICoreService, this.coreService), this.coreMouseService = this.register(this._instantiationService.createInstance(d.CoreMouseService)), this._instantiationService.setService(r.ICoreMouseService, this.coreMouseService), this.unicodeService = this.register(this._instantiationService.createInstance(_.UnicodeService)), this._instantiationService.setService(r.IUnicodeService, this.unicodeService), this._charsetService = this._instantiationService.createInstance(u.CharsetService), this._instantiationService.setService(r.ICharsetService, this._charsetService), this._oscLinkService = this._instantiationService.createInstance(g.OscLinkService), this._instantiationService.setService(r.IOscLinkService, this._oscLinkService), this._inputHandler = this.register(new v.InputHandler(this._bufferService, this._charsetService, this.coreService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService)), this.register((0, l.forwardEvent)(this._inputHandler.onLineFeed, this._onLineFeed)), this.register(this._inputHandler), this.register((0, l.forwardEvent)(this._bufferService.onResize, this._onResize)), this.register((0, l.forwardEvent)(this.coreService.onData, this._onData)), this.register((0, l.forwardEvent)(this.coreService.onBinary, this._onBinary)), this.register(this.coreService.onRequestScrollToBottom(() => this.scrollToBottom())), this.register(this.coreService.onUserInput(() => this._writeBuffer.handleUserInput())), this.register(this.optionsService.onMultipleOptionChange(["windowsMode", "windowsPty"], () => this._handleWindowsPtyOptionChange())), this.register(this._bufferService.onScroll((e4) => {
              this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
            })), this.register(this._inputHandler.onScroll((e4) => {
              this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
            })), this._writeBuffer = this.register(new p.WriteBuffer((e4, t3) => this._inputHandler.parse(e4, t3))), this.register((0, l.forwardEvent)(this._writeBuffer.onWriteParsed, this._onWriteParsed));
          }
          write(e3, t3) {
            this._writeBuffer.write(e3, t3);
          }
          writeSync(e3, t3) {
            this._logService.logLevel <= r.LogLevelEnum.WARN && !m2 && (this._logService.warn("writeSync is unreliable and will be removed soon."), m2 = true), this._writeBuffer.writeSync(e3, t3);
          }
          resize(e3, t3) {
            isNaN(e3) || isNaN(t3) || (e3 = Math.max(e3, a.MINIMUM_COLS), t3 = Math.max(t3, a.MINIMUM_ROWS), this._bufferService.resize(e3, t3));
          }
          scroll(e3, t3 = false) {
            this._bufferService.scroll(e3, t3);
          }
          scrollLines(e3, t3, i3) {
            this._bufferService.scrollLines(e3, t3, i3);
          }
          scrollPages(e3) {
            this.scrollLines(e3 * (this.rows - 1));
          }
          scrollToTop() {
            this.scrollLines(-this._bufferService.buffer.ydisp);
          }
          scrollToBottom() {
            this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
          }
          scrollToLine(e3) {
            const t3 = e3 - this._bufferService.buffer.ydisp;
            0 !== t3 && this.scrollLines(t3);
          }
          registerEscHandler(e3, t3) {
            return this._inputHandler.registerEscHandler(e3, t3);
          }
          registerDcsHandler(e3, t3) {
            return this._inputHandler.registerDcsHandler(e3, t3);
          }
          registerCsiHandler(e3, t3) {
            return this._inputHandler.registerCsiHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._inputHandler.registerOscHandler(e3, t3);
          }
          _setup() {
            this._handleWindowsPtyOptionChange();
          }
          reset() {
            this._inputHandler.reset(), this._bufferService.reset(), this._charsetService.reset(), this.coreService.reset(), this.coreMouseService.reset();
          }
          _handleWindowsPtyOptionChange() {
            let e3 = false;
            const t3 = this.optionsService.rawOptions.windowsPty;
            t3 && void 0 !== t3.buildNumber && void 0 !== t3.buildNumber ? e3 = !!("conpty" === t3.backend && t3.buildNumber < 21376) : this.optionsService.rawOptions.windowsMode && (e3 = true), e3 ? this._enableWindowsWrappingHeuristics() : this._windowsWrappingHeuristics.clear();
          }
          _enableWindowsWrappingHeuristics() {
            if (!this._windowsWrappingHeuristics.value) {
              const e3 = [];
              e3.push(this.onLineFeed(f.updateWindowsModeWrappedState.bind(null, this._bufferService))), e3.push(this.registerCsiHandler({ final: "H" }, () => ((0, f.updateWindowsModeWrappedState)(this._bufferService), false))), this._windowsWrappingHeuristics.value = (0, s2.toDisposable)(() => {
                for (const t3 of e3)
                  t3.dispose();
              });
            }
          }
        }
        t2.CoreTerminal = S;
      }, 8460: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.forwardEvent = t2.EventEmitter = void 0, t2.EventEmitter = class {
          constructor() {
            this._listeners = [], this._disposed = false;
          }
          get event() {
            return this._event || (this._event = (e3) => (this._listeners.push(e3), { dispose: () => {
              if (!this._disposed) {
                for (let t3 = 0; t3 < this._listeners.length; t3++)
                  if (this._listeners[t3] === e3)
                    return void this._listeners.splice(t3, 1);
              }
            } })), this._event;
          }
          fire(e3, t3) {
            const i2 = [];
            for (let e4 = 0; e4 < this._listeners.length; e4++)
              i2.push(this._listeners[e4]);
            for (let s2 = 0; s2 < i2.length; s2++)
              i2[s2].call(void 0, e3, t3);
          }
          dispose() {
            this.clearListeners(), this._disposed = true;
          }
          clearListeners() {
            this._listeners && (this._listeners.length = 0);
          }
        }, t2.forwardEvent = function(e3, t3) {
          return e3((e4) => t3.fire(e4));
        };
      }, 5435: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.InputHandler = t2.WindowsOptionsReportType = void 0;
        const n = i2(2584), o = i2(7116), a = i2(2015), h = i2(844), c = i2(482), l = i2(8437), d = i2(8460), _ = i2(643), u = i2(511), f = i2(3734), v = i2(2585), p = i2(6242), g = i2(6351), m2 = i2(5941), S = { "(": 0, ")": 1, "*": 2, "+": 3, "-": 1, ".": 2 }, C = 131072;
        function b(e3, t3) {
          if (e3 > 24)
            return t3.setWinLines || false;
          switch (e3) {
            case 1:
              return !!t3.restoreWin;
            case 2:
              return !!t3.minimizeWin;
            case 3:
              return !!t3.setWinPosition;
            case 4:
              return !!t3.setWinSizePixels;
            case 5:
              return !!t3.raiseWin;
            case 6:
              return !!t3.lowerWin;
            case 7:
              return !!t3.refreshWin;
            case 8:
              return !!t3.setWinSizeChars;
            case 9:
              return !!t3.maximizeWin;
            case 10:
              return !!t3.fullscreenWin;
            case 11:
              return !!t3.getWinState;
            case 13:
              return !!t3.getWinPosition;
            case 14:
              return !!t3.getWinSizePixels;
            case 15:
              return !!t3.getScreenSizePixels;
            case 16:
              return !!t3.getCellSizePixels;
            case 18:
              return !!t3.getWinSizeChars;
            case 19:
              return !!t3.getScreenSizeChars;
            case 20:
              return !!t3.getIconTitle;
            case 21:
              return !!t3.getWinTitle;
            case 22:
              return !!t3.pushTitle;
            case 23:
              return !!t3.popTitle;
            case 24:
              return !!t3.setWinLines;
          }
          return false;
        }
        var y;
        !function(e3) {
          e3[e3.GET_WIN_SIZE_PIXELS = 0] = "GET_WIN_SIZE_PIXELS", e3[e3.GET_CELL_SIZE_PIXELS = 1] = "GET_CELL_SIZE_PIXELS";
        }(y || (t2.WindowsOptionsReportType = y = {}));
        let w = 0;
        class E extends h.Disposable {
          getAttrData() {
            return this._curAttrData;
          }
          constructor(e3, t3, i3, s3, r2, h2, _2, f2, v2 = new a.EscapeSequenceParser()) {
            super(), this._bufferService = e3, this._charsetService = t3, this._coreService = i3, this._logService = s3, this._optionsService = r2, this._oscLinkService = h2, this._coreMouseService = _2, this._unicodeService = f2, this._parser = v2, this._parseBuffer = new Uint32Array(4096), this._stringDecoder = new c.StringToUtf32(), this._utf8Decoder = new c.Utf8ToUtf32(), this._workCell = new u.CellData(), this._windowTitle = "", this._iconName = "", this._windowTitleStack = [], this._iconNameStack = [], this._curAttrData = l.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = l.DEFAULT_ATTR_DATA.clone(), this._onRequestBell = this.register(new d.EventEmitter()), this.onRequestBell = this._onRequestBell.event, this._onRequestRefreshRows = this.register(new d.EventEmitter()), this.onRequestRefreshRows = this._onRequestRefreshRows.event, this._onRequestReset = this.register(new d.EventEmitter()), this.onRequestReset = this._onRequestReset.event, this._onRequestSendFocus = this.register(new d.EventEmitter()), this.onRequestSendFocus = this._onRequestSendFocus.event, this._onRequestSyncScrollBar = this.register(new d.EventEmitter()), this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event, this._onRequestWindowsOptionsReport = this.register(new d.EventEmitter()), this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event, this._onA11yChar = this.register(new d.EventEmitter()), this.onA11yChar = this._onA11yChar.event, this._onA11yTab = this.register(new d.EventEmitter()), this.onA11yTab = this._onA11yTab.event, this._onCursorMove = this.register(new d.EventEmitter()), this.onCursorMove = this._onCursorMove.event, this._onLineFeed = this.register(new d.EventEmitter()), this.onLineFeed = this._onLineFeed.event, this._onScroll = this.register(new d.EventEmitter()), this.onScroll = this._onScroll.event, this._onTitleChange = this.register(new d.EventEmitter()), this.onTitleChange = this._onTitleChange.event, this._onColor = this.register(new d.EventEmitter()), this.onColor = this._onColor.event, this._parseStack = { paused: false, cursorStartX: 0, cursorStartY: 0, decodedLength: 0, position: 0 }, this._specialColors = [256, 257, 258], this.register(this._parser), this._dirtyRowTracker = new k(this._bufferService), this._activeBuffer = this._bufferService.buffer, this.register(this._bufferService.buffers.onBufferActivate((e4) => this._activeBuffer = e4.activeBuffer)), this._parser.setCsiHandlerFallback((e4, t4) => {
              this._logService.debug("Unknown CSI code: ", { identifier: this._parser.identToString(e4), params: t4.toArray() });
            }), this._parser.setEscHandlerFallback((e4) => {
              this._logService.debug("Unknown ESC code: ", { identifier: this._parser.identToString(e4) });
            }), this._parser.setExecuteHandlerFallback((e4) => {
              this._logService.debug("Unknown EXECUTE code: ", { code: e4 });
            }), this._parser.setOscHandlerFallback((e4, t4, i4) => {
              this._logService.debug("Unknown OSC code: ", { identifier: e4, action: t4, data: i4 });
            }), this._parser.setDcsHandlerFallback((e4, t4, i4) => {
              "HOOK" === t4 && (i4 = i4.toArray()), this._logService.debug("Unknown DCS code: ", { identifier: this._parser.identToString(e4), action: t4, payload: i4 });
            }), this._parser.setPrintHandler((e4, t4, i4) => this.print(e4, t4, i4)), this._parser.registerCsiHandler({ final: "@" }, (e4) => this.insertChars(e4)), this._parser.registerCsiHandler({ intermediates: " ", final: "@" }, (e4) => this.scrollLeft(e4)), this._parser.registerCsiHandler({ final: "A" }, (e4) => this.cursorUp(e4)), this._parser.registerCsiHandler({ intermediates: " ", final: "A" }, (e4) => this.scrollRight(e4)), this._parser.registerCsiHandler({ final: "B" }, (e4) => this.cursorDown(e4)), this._parser.registerCsiHandler({ final: "C" }, (e4) => this.cursorForward(e4)), this._parser.registerCsiHandler({ final: "D" }, (e4) => this.cursorBackward(e4)), this._parser.registerCsiHandler({ final: "E" }, (e4) => this.cursorNextLine(e4)), this._parser.registerCsiHandler({ final: "F" }, (e4) => this.cursorPrecedingLine(e4)), this._parser.registerCsiHandler({ final: "G" }, (e4) => this.cursorCharAbsolute(e4)), this._parser.registerCsiHandler({ final: "H" }, (e4) => this.cursorPosition(e4)), this._parser.registerCsiHandler({ final: "I" }, (e4) => this.cursorForwardTab(e4)), this._parser.registerCsiHandler({ final: "J" }, (e4) => this.eraseInDisplay(e4, false)), this._parser.registerCsiHandler({ prefix: "?", final: "J" }, (e4) => this.eraseInDisplay(e4, true)), this._parser.registerCsiHandler({ final: "K" }, (e4) => this.eraseInLine(e4, false)), this._parser.registerCsiHandler({ prefix: "?", final: "K" }, (e4) => this.eraseInLine(e4, true)), this._parser.registerCsiHandler({ final: "L" }, (e4) => this.insertLines(e4)), this._parser.registerCsiHandler({ final: "M" }, (e4) => this.deleteLines(e4)), this._parser.registerCsiHandler({ final: "P" }, (e4) => this.deleteChars(e4)), this._parser.registerCsiHandler({ final: "S" }, (e4) => this.scrollUp(e4)), this._parser.registerCsiHandler({ final: "T" }, (e4) => this.scrollDown(e4)), this._parser.registerCsiHandler({ final: "X" }, (e4) => this.eraseChars(e4)), this._parser.registerCsiHandler({ final: "Z" }, (e4) => this.cursorBackwardTab(e4)), this._parser.registerCsiHandler({ final: "`" }, (e4) => this.charPosAbsolute(e4)), this._parser.registerCsiHandler({ final: "a" }, (e4) => this.hPositionRelative(e4)), this._parser.registerCsiHandler({ final: "b" }, (e4) => this.repeatPrecedingCharacter(e4)), this._parser.registerCsiHandler({ final: "c" }, (e4) => this.sendDeviceAttributesPrimary(e4)), this._parser.registerCsiHandler({ prefix: ">", final: "c" }, (e4) => this.sendDeviceAttributesSecondary(e4)), this._parser.registerCsiHandler({ final: "d" }, (e4) => this.linePosAbsolute(e4)), this._parser.registerCsiHandler({ final: "e" }, (e4) => this.vPositionRelative(e4)), this._parser.registerCsiHandler({ final: "f" }, (e4) => this.hVPosition(e4)), this._parser.registerCsiHandler({ final: "g" }, (e4) => this.tabClear(e4)), this._parser.registerCsiHandler({ final: "h" }, (e4) => this.setMode(e4)), this._parser.registerCsiHandler({ prefix: "?", final: "h" }, (e4) => this.setModePrivate(e4)), this._parser.registerCsiHandler({ final: "l" }, (e4) => this.resetMode(e4)), this._parser.registerCsiHandler({ prefix: "?", final: "l" }, (e4) => this.resetModePrivate(e4)), this._parser.registerCsiHandler({ final: "m" }, (e4) => this.charAttributes(e4)), this._parser.registerCsiHandler({ final: "n" }, (e4) => this.deviceStatus(e4)), this._parser.registerCsiHandler({ prefix: "?", final: "n" }, (e4) => this.deviceStatusPrivate(e4)), this._parser.registerCsiHandler({ intermediates: "!", final: "p" }, (e4) => this.softReset(e4)), this._parser.registerCsiHandler({ intermediates: " ", final: "q" }, (e4) => this.setCursorStyle(e4)), this._parser.registerCsiHandler({ final: "r" }, (e4) => this.setScrollRegion(e4)), this._parser.registerCsiHandler({ final: "s" }, (e4) => this.saveCursor(e4)), this._parser.registerCsiHandler({ final: "t" }, (e4) => this.windowOptions(e4)), this._parser.registerCsiHandler({ final: "u" }, (e4) => this.restoreCursor(e4)), this._parser.registerCsiHandler({ intermediates: "'", final: "}" }, (e4) => this.insertColumns(e4)), this._parser.registerCsiHandler({ intermediates: "'", final: "~" }, (e4) => this.deleteColumns(e4)), this._parser.registerCsiHandler({ intermediates: '"', final: "q" }, (e4) => this.selectProtected(e4)), this._parser.registerCsiHandler({ intermediates: "$", final: "p" }, (e4) => this.requestMode(e4, true)), this._parser.registerCsiHandler({ prefix: "?", intermediates: "$", final: "p" }, (e4) => this.requestMode(e4, false)), this._parser.setExecuteHandler(n.C0.BEL, () => this.bell()), this._parser.setExecuteHandler(n.C0.LF, () => this.lineFeed()), this._parser.setExecuteHandler(n.C0.VT, () => this.lineFeed()), this._parser.setExecuteHandler(n.C0.FF, () => this.lineFeed()), this._parser.setExecuteHandler(n.C0.CR, () => this.carriageReturn()), this._parser.setExecuteHandler(n.C0.BS, () => this.backspace()), this._parser.setExecuteHandler(n.C0.HT, () => this.tab()), this._parser.setExecuteHandler(n.C0.SO, () => this.shiftOut()), this._parser.setExecuteHandler(n.C0.SI, () => this.shiftIn()), this._parser.setExecuteHandler(n.C1.IND, () => this.index()), this._parser.setExecuteHandler(n.C1.NEL, () => this.nextLine()), this._parser.setExecuteHandler(n.C1.HTS, () => this.tabSet()), this._parser.registerOscHandler(0, new p.OscHandler((e4) => (this.setTitle(e4), this.setIconName(e4), true))), this._parser.registerOscHandler(1, new p.OscHandler((e4) => this.setIconName(e4))), this._parser.registerOscHandler(2, new p.OscHandler((e4) => this.setTitle(e4))), this._parser.registerOscHandler(4, new p.OscHandler((e4) => this.setOrReportIndexedColor(e4))), this._parser.registerOscHandler(8, new p.OscHandler((e4) => this.setHyperlink(e4))), this._parser.registerOscHandler(10, new p.OscHandler((e4) => this.setOrReportFgColor(e4))), this._parser.registerOscHandler(11, new p.OscHandler((e4) => this.setOrReportBgColor(e4))), this._parser.registerOscHandler(12, new p.OscHandler((e4) => this.setOrReportCursorColor(e4))), this._parser.registerOscHandler(104, new p.OscHandler((e4) => this.restoreIndexedColor(e4))), this._parser.registerOscHandler(110, new p.OscHandler((e4) => this.restoreFgColor(e4))), this._parser.registerOscHandler(111, new p.OscHandler((e4) => this.restoreBgColor(e4))), this._parser.registerOscHandler(112, new p.OscHandler((e4) => this.restoreCursorColor(e4))), this._parser.registerEscHandler({ final: "7" }, () => this.saveCursor()), this._parser.registerEscHandler({ final: "8" }, () => this.restoreCursor()), this._parser.registerEscHandler({ final: "D" }, () => this.index()), this._parser.registerEscHandler({ final: "E" }, () => this.nextLine()), this._parser.registerEscHandler({ final: "H" }, () => this.tabSet()), this._parser.registerEscHandler({ final: "M" }, () => this.reverseIndex()), this._parser.registerEscHandler({ final: "=" }, () => this.keypadApplicationMode()), this._parser.registerEscHandler({ final: ">" }, () => this.keypadNumericMode()), this._parser.registerEscHandler({ final: "c" }, () => this.fullReset()), this._parser.registerEscHandler({ final: "n" }, () => this.setgLevel(2)), this._parser.registerEscHandler({ final: "o" }, () => this.setgLevel(3)), this._parser.registerEscHandler({ final: "|" }, () => this.setgLevel(3)), this._parser.registerEscHandler({ final: "}" }, () => this.setgLevel(2)), this._parser.registerEscHandler({ final: "~" }, () => this.setgLevel(1)), this._parser.registerEscHandler({ intermediates: "%", final: "@" }, () => this.selectDefaultCharset()), this._parser.registerEscHandler({ intermediates: "%", final: "G" }, () => this.selectDefaultCharset());
            for (const e4 in o.CHARSETS)
              this._parser.registerEscHandler({ intermediates: "(", final: e4 }, () => this.selectCharset("(" + e4)), this._parser.registerEscHandler({ intermediates: ")", final: e4 }, () => this.selectCharset(")" + e4)), this._parser.registerEscHandler({ intermediates: "*", final: e4 }, () => this.selectCharset("*" + e4)), this._parser.registerEscHandler({ intermediates: "+", final: e4 }, () => this.selectCharset("+" + e4)), this._parser.registerEscHandler({ intermediates: "-", final: e4 }, () => this.selectCharset("-" + e4)), this._parser.registerEscHandler({ intermediates: ".", final: e4 }, () => this.selectCharset("." + e4)), this._parser.registerEscHandler({ intermediates: "/", final: e4 }, () => this.selectCharset("/" + e4));
            this._parser.registerEscHandler({ intermediates: "#", final: "8" }, () => this.screenAlignmentPattern()), this._parser.setErrorHandler((e4) => (this._logService.error("Parsing error: ", e4), e4)), this._parser.registerDcsHandler({ intermediates: "$", final: "q" }, new g.DcsHandler((e4, t4) => this.requestStatusString(e4, t4)));
          }
          _preserveStack(e3, t3, i3, s3) {
            this._parseStack.paused = true, this._parseStack.cursorStartX = e3, this._parseStack.cursorStartY = t3, this._parseStack.decodedLength = i3, this._parseStack.position = s3;
          }
          _logSlowResolvingAsync(e3) {
            this._logService.logLevel <= v.LogLevelEnum.WARN && Promise.race([e3, new Promise((e4, t3) => setTimeout(() => t3("#SLOW_TIMEOUT"), 5e3))]).catch((e4) => {
              if ("#SLOW_TIMEOUT" !== e4)
                throw e4;
              console.warn("async parser handler taking longer than 5000 ms");
            });
          }
          _getCurrentLinkId() {
            return this._curAttrData.extended.urlId;
          }
          parse(e3, t3) {
            let i3, s3 = this._activeBuffer.x, r2 = this._activeBuffer.y, n2 = 0;
            const o2 = this._parseStack.paused;
            if (o2) {
              if (i3 = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, t3))
                return this._logSlowResolvingAsync(i3), i3;
              s3 = this._parseStack.cursorStartX, r2 = this._parseStack.cursorStartY, this._parseStack.paused = false, e3.length > C && (n2 = this._parseStack.position + C);
            }
            if (this._logService.logLevel <= v.LogLevelEnum.DEBUG && this._logService.debug("parsing data" + ("string" == typeof e3 ? ` "${e3}"` : ` "${Array.prototype.map.call(e3, (e4) => String.fromCharCode(e4)).join("")}"`), "string" == typeof e3 ? e3.split("").map((e4) => e4.charCodeAt(0)) : e3), this._parseBuffer.length < e3.length && this._parseBuffer.length < C && (this._parseBuffer = new Uint32Array(Math.min(e3.length, C))), o2 || this._dirtyRowTracker.clearRange(), e3.length > C)
              for (let t4 = n2; t4 < e3.length; t4 += C) {
                const n3 = t4 + C < e3.length ? t4 + C : e3.length, o3 = "string" == typeof e3 ? this._stringDecoder.decode(e3.substring(t4, n3), this._parseBuffer) : this._utf8Decoder.decode(e3.subarray(t4, n3), this._parseBuffer);
                if (i3 = this._parser.parse(this._parseBuffer, o3))
                  return this._preserveStack(s3, r2, o3, t4), this._logSlowResolvingAsync(i3), i3;
              }
            else if (!o2) {
              const t4 = "string" == typeof e3 ? this._stringDecoder.decode(e3, this._parseBuffer) : this._utf8Decoder.decode(e3, this._parseBuffer);
              if (i3 = this._parser.parse(this._parseBuffer, t4))
                return this._preserveStack(s3, r2, t4, 0), this._logSlowResolvingAsync(i3), i3;
            }
            this._activeBuffer.x === s3 && this._activeBuffer.y === r2 || this._onCursorMove.fire(), this._onRequestRefreshRows.fire(this._dirtyRowTracker.start, this._dirtyRowTracker.end);
          }
          print(e3, t3, i3) {
            let s3, r2;
            const n2 = this._charsetService.charset, o2 = this._optionsService.rawOptions.screenReaderMode, a2 = this._bufferService.cols, h2 = this._coreService.decPrivateModes.wraparound, l2 = this._coreService.modes.insertMode, d2 = this._curAttrData;
            let u2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._activeBuffer.x && i3 - t3 > 0 && 2 === u2.getWidth(this._activeBuffer.x - 1) && u2.setCellFromCodePoint(this._activeBuffer.x - 1, 0, 1, d2.fg, d2.bg, d2.extended);
            for (let f2 = t3; f2 < i3; ++f2) {
              if (s3 = e3[f2], r2 = this._unicodeService.wcwidth(s3), s3 < 127 && n2) {
                const e4 = n2[String.fromCharCode(s3)];
                e4 && (s3 = e4.charCodeAt(0));
              }
              if (o2 && this._onA11yChar.fire((0, c.stringFromCodePoint)(s3)), this._getCurrentLinkId() && this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y), r2 || !this._activeBuffer.x) {
                if (this._activeBuffer.x + r2 - 1 >= a2) {
                  if (h2) {
                    for (; this._activeBuffer.x < a2; )
                      u2.setCellFromCodePoint(this._activeBuffer.x++, 0, 1, d2.fg, d2.bg, d2.extended);
                    this._activeBuffer.x = 0, this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData(), true)) : (this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = true), u2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
                  } else if (this._activeBuffer.x = a2 - 1, 2 === r2)
                    continue;
                }
                if (l2 && (u2.insertCells(this._activeBuffer.x, r2, this._activeBuffer.getNullCell(d2), d2), 2 === u2.getWidth(a2 - 1) && u2.setCellFromCodePoint(a2 - 1, _.NULL_CELL_CODE, _.NULL_CELL_WIDTH, d2.fg, d2.bg, d2.extended)), u2.setCellFromCodePoint(this._activeBuffer.x++, s3, r2, d2.fg, d2.bg, d2.extended), r2 > 0)
                  for (; --r2; )
                    u2.setCellFromCodePoint(this._activeBuffer.x++, 0, 0, d2.fg, d2.bg, d2.extended);
              } else
                u2.getWidth(this._activeBuffer.x - 1) ? u2.addCodepointToCell(this._activeBuffer.x - 1, s3) : u2.addCodepointToCell(this._activeBuffer.x - 2, s3);
            }
            i3 - t3 > 0 && (u2.loadCell(this._activeBuffer.x - 1, this._workCell), 2 === this._workCell.getWidth() || this._workCell.getCode() > 65535 ? this._parser.precedingCodepoint = 0 : this._workCell.isCombined() ? this._parser.precedingCodepoint = this._workCell.getChars().charCodeAt(0) : this._parser.precedingCodepoint = this._workCell.content), this._activeBuffer.x < a2 && i3 - t3 > 0 && 0 === u2.getWidth(this._activeBuffer.x) && !u2.hasContent(this._activeBuffer.x) && u2.setCellFromCodePoint(this._activeBuffer.x, 0, 1, d2.fg, d2.bg, d2.extended), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          registerCsiHandler(e3, t3) {
            return "t" !== e3.final || e3.prefix || e3.intermediates ? this._parser.registerCsiHandler(e3, t3) : this._parser.registerCsiHandler(e3, (e4) => !b(e4.params[0], this._optionsService.rawOptions.windowOptions) || t3(e4));
          }
          registerDcsHandler(e3, t3) {
            return this._parser.registerDcsHandler(e3, new g.DcsHandler(t3));
          }
          registerEscHandler(e3, t3) {
            return this._parser.registerEscHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._parser.registerOscHandler(e3, new p.OscHandler(t3));
          }
          bell() {
            return this._onRequestBell.fire(), true;
          }
          lineFeed() {
            return this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._optionsService.rawOptions.convertEol && (this._activeBuffer.x = 0), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows ? this._activeBuffer.y = this._bufferService.rows - 1 : this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.x >= this._bufferService.cols && this._activeBuffer.x--, this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._onLineFeed.fire(), true;
          }
          carriageReturn() {
            return this._activeBuffer.x = 0, true;
          }
          backspace() {
            var e3;
            if (!this._coreService.decPrivateModes.reverseWraparound)
              return this._restrictCursor(), this._activeBuffer.x > 0 && this._activeBuffer.x--, true;
            if (this._restrictCursor(this._bufferService.cols), this._activeBuffer.x > 0)
              this._activeBuffer.x--;
            else if (0 === this._activeBuffer.x && this._activeBuffer.y > this._activeBuffer.scrollTop && this._activeBuffer.y <= this._activeBuffer.scrollBottom && (null === (e3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)) || void 0 === e3 ? void 0 : e3.isWrapped)) {
              this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.y--, this._activeBuffer.x = this._bufferService.cols - 1;
              const e4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
              e4.hasWidth(this._activeBuffer.x) && !e4.hasContent(this._activeBuffer.x) && this._activeBuffer.x--;
            }
            return this._restrictCursor(), true;
          }
          tab() {
            if (this._activeBuffer.x >= this._bufferService.cols)
              return true;
            const e3 = this._activeBuffer.x;
            return this._activeBuffer.x = this._activeBuffer.nextStop(), this._optionsService.rawOptions.screenReaderMode && this._onA11yTab.fire(this._activeBuffer.x - e3), true;
          }
          shiftOut() {
            return this._charsetService.setgLevel(1), true;
          }
          shiftIn() {
            return this._charsetService.setgLevel(0), true;
          }
          _restrictCursor(e3 = this._bufferService.cols - 1) {
            this._activeBuffer.x = Math.min(e3, Math.max(0, this._activeBuffer.x)), this._activeBuffer.y = this._coreService.decPrivateModes.origin ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y)) : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y)), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          _setCursor(e3, t3) {
            this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._coreService.decPrivateModes.origin ? (this._activeBuffer.x = e3, this._activeBuffer.y = this._activeBuffer.scrollTop + t3) : (this._activeBuffer.x = e3, this._activeBuffer.y = t3), this._restrictCursor(), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          _moveCursor(e3, t3) {
            this._restrictCursor(), this._setCursor(this._activeBuffer.x + e3, this._activeBuffer.y + t3);
          }
          cursorUp(e3) {
            const t3 = this._activeBuffer.y - this._activeBuffer.scrollTop;
            return t3 >= 0 ? this._moveCursor(0, -Math.min(t3, e3.params[0] || 1)) : this._moveCursor(0, -(e3.params[0] || 1)), true;
          }
          cursorDown(e3) {
            const t3 = this._activeBuffer.scrollBottom - this._activeBuffer.y;
            return t3 >= 0 ? this._moveCursor(0, Math.min(t3, e3.params[0] || 1)) : this._moveCursor(0, e3.params[0] || 1), true;
          }
          cursorForward(e3) {
            return this._moveCursor(e3.params[0] || 1, 0), true;
          }
          cursorBackward(e3) {
            return this._moveCursor(-(e3.params[0] || 1), 0), true;
          }
          cursorNextLine(e3) {
            return this.cursorDown(e3), this._activeBuffer.x = 0, true;
          }
          cursorPrecedingLine(e3) {
            return this.cursorUp(e3), this._activeBuffer.x = 0, true;
          }
          cursorCharAbsolute(e3) {
            return this._setCursor((e3.params[0] || 1) - 1, this._activeBuffer.y), true;
          }
          cursorPosition(e3) {
            return this._setCursor(e3.length >= 2 ? (e3.params[1] || 1) - 1 : 0, (e3.params[0] || 1) - 1), true;
          }
          charPosAbsolute(e3) {
            return this._setCursor((e3.params[0] || 1) - 1, this._activeBuffer.y), true;
          }
          hPositionRelative(e3) {
            return this._moveCursor(e3.params[0] || 1, 0), true;
          }
          linePosAbsolute(e3) {
            return this._setCursor(this._activeBuffer.x, (e3.params[0] || 1) - 1), true;
          }
          vPositionRelative(e3) {
            return this._moveCursor(0, e3.params[0] || 1), true;
          }
          hVPosition(e3) {
            return this.cursorPosition(e3), true;
          }
          tabClear(e3) {
            const t3 = e3.params[0];
            return 0 === t3 ? delete this._activeBuffer.tabs[this._activeBuffer.x] : 3 === t3 && (this._activeBuffer.tabs = {}), true;
          }
          cursorForwardTab(e3) {
            if (this._activeBuffer.x >= this._bufferService.cols)
              return true;
            let t3 = e3.params[0] || 1;
            for (; t3--; )
              this._activeBuffer.x = this._activeBuffer.nextStop();
            return true;
          }
          cursorBackwardTab(e3) {
            if (this._activeBuffer.x >= this._bufferService.cols)
              return true;
            let t3 = e3.params[0] || 1;
            for (; t3--; )
              this._activeBuffer.x = this._activeBuffer.prevStop();
            return true;
          }
          selectProtected(e3) {
            const t3 = e3.params[0];
            return 1 === t3 && (this._curAttrData.bg |= 536870912), 2 !== t3 && 0 !== t3 || (this._curAttrData.bg &= -536870913), true;
          }
          _eraseInBufferLine(e3, t3, i3, s3 = false, r2 = false) {
            const n2 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e3);
            n2.replaceCells(t3, i3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData(), r2), s3 && (n2.isWrapped = false);
          }
          _resetBufferLine(e3, t3 = false) {
            const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e3);
            i3 && (i3.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), t3), this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + e3), i3.isWrapped = false);
          }
          eraseInDisplay(e3, t3 = false) {
            let i3;
            switch (this._restrictCursor(this._bufferService.cols), e3.params[0]) {
              case 0:
                for (i3 = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i3), this._eraseInBufferLine(i3++, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t3); i3 < this._bufferService.rows; i3++)
                  this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(i3);
                break;
              case 1:
                for (i3 = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i3), this._eraseInBufferLine(i3, 0, this._activeBuffer.x + 1, true, t3), this._activeBuffer.x + 1 >= this._bufferService.cols && (this._activeBuffer.lines.get(i3 + 1).isWrapped = false); i3--; )
                  this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(0);
                break;
              case 2:
                for (i3 = this._bufferService.rows, this._dirtyRowTracker.markDirty(i3 - 1); i3--; )
                  this._resetBufferLine(i3, t3);
                this._dirtyRowTracker.markDirty(0);
                break;
              case 3:
                const e4 = this._activeBuffer.lines.length - this._bufferService.rows;
                e4 > 0 && (this._activeBuffer.lines.trimStart(e4), this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - e4, 0), this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - e4, 0), this._onScroll.fire(0));
            }
            return true;
          }
          eraseInLine(e3, t3 = false) {
            switch (this._restrictCursor(this._bufferService.cols), e3.params[0]) {
              case 0:
                this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t3);
                break;
              case 1:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, false, t3);
                break;
              case 2:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, true, t3);
            }
            return this._dirtyRowTracker.markDirty(this._activeBuffer.y), true;
          }
          insertLines(e3) {
            this._restrictCursor();
            let t3 = e3.params[0] || 1;
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop)
              return true;
            const i3 = this._activeBuffer.ybase + this._activeBuffer.y, s3 = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, r2 = this._bufferService.rows - 1 + this._activeBuffer.ybase - s3 + 1;
            for (; t3--; )
              this._activeBuffer.lines.splice(r2 - 1, 1), this._activeBuffer.lines.splice(i3, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
          }
          deleteLines(e3) {
            this._restrictCursor();
            let t3 = e3.params[0] || 1;
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop)
              return true;
            const i3 = this._activeBuffer.ybase + this._activeBuffer.y;
            let s3;
            for (s3 = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, s3 = this._bufferService.rows - 1 + this._activeBuffer.ybase - s3; t3--; )
              this._activeBuffer.lines.splice(i3, 1), this._activeBuffer.lines.splice(s3, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
          }
          insertChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.insertCells(this._activeBuffer.x, e3.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          deleteChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.deleteCells(this._activeBuffer.x, e3.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          scrollUp(e3) {
            let t3 = e3.params[0] || 1;
            for (; t3--; )
              this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollDown(e3) {
            let t3 = e3.params[0] || 1;
            for (; t3--; )
              this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(l.DEFAULT_ATTR_DATA));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollLeft(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop)
              return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.deleteCells(0, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollRight(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop)
              return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.insertCells(0, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          insertColumns(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop)
              return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.insertCells(this._activeBuffer.x, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          deleteColumns(e3) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop)
              return true;
            const t3 = e3.params[0] || 1;
            for (let e4 = this._activeBuffer.scrollTop; e4 <= this._activeBuffer.scrollBottom; ++e4) {
              const i3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
              i3.deleteCells(this._activeBuffer.x, t3, this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), i3.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          eraseChars(e3) {
            this._restrictCursor();
            const t3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t3 && (t3.replaceCells(this._activeBuffer.x, this._activeBuffer.x + (e3.params[0] || 1), this._activeBuffer.getNullCell(this._eraseAttrData()), this._eraseAttrData()), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          repeatPrecedingCharacter(e3) {
            if (!this._parser.precedingCodepoint)
              return true;
            const t3 = e3.params[0] || 1, i3 = new Uint32Array(t3);
            for (let e4 = 0; e4 < t3; ++e4)
              i3[e4] = this._parser.precedingCodepoint;
            return this.print(i3, 0, i3.length), true;
          }
          sendDeviceAttributesPrimary(e3) {
            return e3.params[0] > 0 || (this._is("xterm") || this._is("rxvt-unicode") || this._is("screen") ? this._coreService.triggerDataEvent(n.C0.ESC + "[?1;2c") : this._is("linux") && this._coreService.triggerDataEvent(n.C0.ESC + "[?6c")), true;
          }
          sendDeviceAttributesSecondary(e3) {
            return e3.params[0] > 0 || (this._is("xterm") ? this._coreService.triggerDataEvent(n.C0.ESC + "[>0;276;0c") : this._is("rxvt-unicode") ? this._coreService.triggerDataEvent(n.C0.ESC + "[>85;95;0c") : this._is("linux") ? this._coreService.triggerDataEvent(e3.params[0] + "c") : this._is("screen") && this._coreService.triggerDataEvent(n.C0.ESC + "[>83;40003;0c")), true;
          }
          _is(e3) {
            return 0 === (this._optionsService.rawOptions.termName + "").indexOf(e3);
          }
          setMode(e3) {
            for (let t3 = 0; t3 < e3.length; t3++)
              switch (e3.params[t3]) {
                case 4:
                  this._coreService.modes.insertMode = true;
                  break;
                case 20:
                  this._optionsService.options.convertEol = true;
              }
            return true;
          }
          setModePrivate(e3) {
            for (let t3 = 0; t3 < e3.length; t3++)
              switch (e3.params[t3]) {
                case 1:
                  this._coreService.decPrivateModes.applicationCursorKeys = true;
                  break;
                case 2:
                  this._charsetService.setgCharset(0, o.DEFAULT_CHARSET), this._charsetService.setgCharset(1, o.DEFAULT_CHARSET), this._charsetService.setgCharset(2, o.DEFAULT_CHARSET), this._charsetService.setgCharset(3, o.DEFAULT_CHARSET);
                  break;
                case 3:
                  this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(132, this._bufferService.rows), this._onRequestReset.fire());
                  break;
                case 6:
                  this._coreService.decPrivateModes.origin = true, this._setCursor(0, 0);
                  break;
                case 7:
                  this._coreService.decPrivateModes.wraparound = true;
                  break;
                case 12:
                  this._optionsService.options.cursorBlink = true;
                  break;
                case 45:
                  this._coreService.decPrivateModes.reverseWraparound = true;
                  break;
                case 66:
                  this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire();
                  break;
                case 9:
                  this._coreMouseService.activeProtocol = "X10";
                  break;
                case 1e3:
                  this._coreMouseService.activeProtocol = "VT200";
                  break;
                case 1002:
                  this._coreMouseService.activeProtocol = "DRAG";
                  break;
                case 1003:
                  this._coreMouseService.activeProtocol = "ANY";
                  break;
                case 1004:
                  this._coreService.decPrivateModes.sendFocus = true, this._onRequestSendFocus.fire();
                  break;
                case 1005:
                  this._logService.debug("DECSET 1005 not supported (see #2507)");
                  break;
                case 1006:
                  this._coreMouseService.activeEncoding = "SGR";
                  break;
                case 1015:
                  this._logService.debug("DECSET 1015 not supported (see #2507)");
                  break;
                case 1016:
                  this._coreMouseService.activeEncoding = "SGR_PIXELS";
                  break;
                case 25:
                  this._coreService.isCursorHidden = false;
                  break;
                case 1048:
                  this.saveCursor();
                  break;
                case 1049:
                  this.saveCursor();
                case 47:
                case 1047:
                  this._bufferService.buffers.activateAltBuffer(this._eraseAttrData()), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1), this._onRequestSyncScrollBar.fire();
                  break;
                case 2004:
                  this._coreService.decPrivateModes.bracketedPasteMode = true;
              }
            return true;
          }
          resetMode(e3) {
            for (let t3 = 0; t3 < e3.length; t3++)
              switch (e3.params[t3]) {
                case 4:
                  this._coreService.modes.insertMode = false;
                  break;
                case 20:
                  this._optionsService.options.convertEol = false;
              }
            return true;
          }
          resetModePrivate(e3) {
            for (let t3 = 0; t3 < e3.length; t3++)
              switch (e3.params[t3]) {
                case 1:
                  this._coreService.decPrivateModes.applicationCursorKeys = false;
                  break;
                case 3:
                  this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(80, this._bufferService.rows), this._onRequestReset.fire());
                  break;
                case 6:
                  this._coreService.decPrivateModes.origin = false, this._setCursor(0, 0);
                  break;
                case 7:
                  this._coreService.decPrivateModes.wraparound = false;
                  break;
                case 12:
                  this._optionsService.options.cursorBlink = false;
                  break;
                case 45:
                  this._coreService.decPrivateModes.reverseWraparound = false;
                  break;
                case 66:
                  this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire();
                  break;
                case 9:
                case 1e3:
                case 1002:
                case 1003:
                  this._coreMouseService.activeProtocol = "NONE";
                  break;
                case 1004:
                  this._coreService.decPrivateModes.sendFocus = false;
                  break;
                case 1005:
                  this._logService.debug("DECRST 1005 not supported (see #2507)");
                  break;
                case 1006:
                case 1016:
                  this._coreMouseService.activeEncoding = "DEFAULT";
                  break;
                case 1015:
                  this._logService.debug("DECRST 1015 not supported (see #2507)");
                  break;
                case 25:
                  this._coreService.isCursorHidden = true;
                  break;
                case 1048:
                  this.restoreCursor();
                  break;
                case 1049:
                case 47:
                case 1047:
                  this._bufferService.buffers.activateNormalBuffer(), 1049 === e3.params[t3] && this.restoreCursor(), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1), this._onRequestSyncScrollBar.fire();
                  break;
                case 2004:
                  this._coreService.decPrivateModes.bracketedPasteMode = false;
              }
            return true;
          }
          requestMode(e3, t3) {
            const i3 = this._coreService.decPrivateModes, { activeProtocol: s3, activeEncoding: r2 } = this._coreMouseService, o2 = this._coreService, { buffers: a2, cols: h2 } = this._bufferService, { active: c2, alt: l2 } = a2, d2 = this._optionsService.rawOptions, _2 = (e4) => e4 ? 1 : 2, u2 = e3.params[0];
            return f2 = u2, v2 = t3 ? 2 === u2 ? 4 : 4 === u2 ? _2(o2.modes.insertMode) : 12 === u2 ? 3 : 20 === u2 ? _2(d2.convertEol) : 0 : 1 === u2 ? _2(i3.applicationCursorKeys) : 3 === u2 ? d2.windowOptions.setWinLines ? 80 === h2 ? 2 : 132 === h2 ? 1 : 0 : 0 : 6 === u2 ? _2(i3.origin) : 7 === u2 ? _2(i3.wraparound) : 8 === u2 ? 3 : 9 === u2 ? _2("X10" === s3) : 12 === u2 ? _2(d2.cursorBlink) : 25 === u2 ? _2(!o2.isCursorHidden) : 45 === u2 ? _2(i3.reverseWraparound) : 66 === u2 ? _2(i3.applicationKeypad) : 67 === u2 ? 4 : 1e3 === u2 ? _2("VT200" === s3) : 1002 === u2 ? _2("DRAG" === s3) : 1003 === u2 ? _2("ANY" === s3) : 1004 === u2 ? _2(i3.sendFocus) : 1005 === u2 ? 4 : 1006 === u2 ? _2("SGR" === r2) : 1015 === u2 ? 4 : 1016 === u2 ? _2("SGR_PIXELS" === r2) : 1048 === u2 ? 1 : 47 === u2 || 1047 === u2 || 1049 === u2 ? _2(c2 === l2) : 2004 === u2 ? _2(i3.bracketedPasteMode) : 0, o2.triggerDataEvent(`${n.C0.ESC}[${t3 ? "" : "?"}${f2};${v2}$y`), true;
            var f2, v2;
          }
          _updateAttrColor(e3, t3, i3, s3, r2) {
            return 2 === t3 ? (e3 |= 50331648, e3 &= -16777216, e3 |= f.AttributeData.fromColorRGB([i3, s3, r2])) : 5 === t3 && (e3 &= -50331904, e3 |= 33554432 | 255 & i3), e3;
          }
          _extractColor(e3, t3, i3) {
            const s3 = [0, 0, -1, 0, 0, 0];
            let r2 = 0, n2 = 0;
            do {
              if (s3[n2 + r2] = e3.params[t3 + n2], e3.hasSubParams(t3 + n2)) {
                const i4 = e3.getSubParams(t3 + n2);
                let o2 = 0;
                do {
                  5 === s3[1] && (r2 = 1), s3[n2 + o2 + 1 + r2] = i4[o2];
                } while (++o2 < i4.length && o2 + n2 + 1 + r2 < s3.length);
                break;
              }
              if (5 === s3[1] && n2 + r2 >= 2 || 2 === s3[1] && n2 + r2 >= 5)
                break;
              s3[1] && (r2 = 1);
            } while (++n2 + t3 < e3.length && n2 + r2 < s3.length);
            for (let e4 = 2; e4 < s3.length; ++e4)
              -1 === s3[e4] && (s3[e4] = 0);
            switch (s3[0]) {
              case 38:
                i3.fg = this._updateAttrColor(i3.fg, s3[1], s3[3], s3[4], s3[5]);
                break;
              case 48:
                i3.bg = this._updateAttrColor(i3.bg, s3[1], s3[3], s3[4], s3[5]);
                break;
              case 58:
                i3.extended = i3.extended.clone(), i3.extended.underlineColor = this._updateAttrColor(i3.extended.underlineColor, s3[1], s3[3], s3[4], s3[5]);
            }
            return n2;
          }
          _processUnderline(e3, t3) {
            t3.extended = t3.extended.clone(), (!~e3 || e3 > 5) && (e3 = 1), t3.extended.underlineStyle = e3, t3.fg |= 268435456, 0 === e3 && (t3.fg &= -268435457), t3.updateExtended();
          }
          _processSGR0(e3) {
            e3.fg = l.DEFAULT_ATTR_DATA.fg, e3.bg = l.DEFAULT_ATTR_DATA.bg, e3.extended = e3.extended.clone(), e3.extended.underlineStyle = 0, e3.extended.underlineColor &= -67108864, e3.updateExtended();
          }
          charAttributes(e3) {
            if (1 === e3.length && 0 === e3.params[0])
              return this._processSGR0(this._curAttrData), true;
            const t3 = e3.length;
            let i3;
            const s3 = this._curAttrData;
            for (let r2 = 0; r2 < t3; r2++)
              i3 = e3.params[r2], i3 >= 30 && i3 <= 37 ? (s3.fg &= -50331904, s3.fg |= 16777216 | i3 - 30) : i3 >= 40 && i3 <= 47 ? (s3.bg &= -50331904, s3.bg |= 16777216 | i3 - 40) : i3 >= 90 && i3 <= 97 ? (s3.fg &= -50331904, s3.fg |= 16777224 | i3 - 90) : i3 >= 100 && i3 <= 107 ? (s3.bg &= -50331904, s3.bg |= 16777224 | i3 - 100) : 0 === i3 ? this._processSGR0(s3) : 1 === i3 ? s3.fg |= 134217728 : 3 === i3 ? s3.bg |= 67108864 : 4 === i3 ? (s3.fg |= 268435456, this._processUnderline(e3.hasSubParams(r2) ? e3.getSubParams(r2)[0] : 1, s3)) : 5 === i3 ? s3.fg |= 536870912 : 7 === i3 ? s3.fg |= 67108864 : 8 === i3 ? s3.fg |= 1073741824 : 9 === i3 ? s3.fg |= 2147483648 : 2 === i3 ? s3.bg |= 134217728 : 21 === i3 ? this._processUnderline(2, s3) : 22 === i3 ? (s3.fg &= -134217729, s3.bg &= -134217729) : 23 === i3 ? s3.bg &= -67108865 : 24 === i3 ? (s3.fg &= -268435457, this._processUnderline(0, s3)) : 25 === i3 ? s3.fg &= -536870913 : 27 === i3 ? s3.fg &= -67108865 : 28 === i3 ? s3.fg &= -1073741825 : 29 === i3 ? s3.fg &= 2147483647 : 39 === i3 ? (s3.fg &= -67108864, s3.fg |= 16777215 & l.DEFAULT_ATTR_DATA.fg) : 49 === i3 ? (s3.bg &= -67108864, s3.bg |= 16777215 & l.DEFAULT_ATTR_DATA.bg) : 38 === i3 || 48 === i3 || 58 === i3 ? r2 += this._extractColor(e3, r2, s3) : 53 === i3 ? s3.bg |= 1073741824 : 55 === i3 ? s3.bg &= -1073741825 : 59 === i3 ? (s3.extended = s3.extended.clone(), s3.extended.underlineColor = -1, s3.updateExtended()) : 100 === i3 ? (s3.fg &= -67108864, s3.fg |= 16777215 & l.DEFAULT_ATTR_DATA.fg, s3.bg &= -67108864, s3.bg |= 16777215 & l.DEFAULT_ATTR_DATA.bg) : this._logService.debug("Unknown SGR attribute: %d.", i3);
            return true;
          }
          deviceStatus(e3) {
            switch (e3.params[0]) {
              case 5:
                this._coreService.triggerDataEvent(`${n.C0.ESC}[0n`);
                break;
              case 6:
                const e4 = this._activeBuffer.y + 1, t3 = this._activeBuffer.x + 1;
                this._coreService.triggerDataEvent(`${n.C0.ESC}[${e4};${t3}R`);
            }
            return true;
          }
          deviceStatusPrivate(e3) {
            if (6 === e3.params[0]) {
              const e4 = this._activeBuffer.y + 1, t3 = this._activeBuffer.x + 1;
              this._coreService.triggerDataEvent(`${n.C0.ESC}[?${e4};${t3}R`);
            }
            return true;
          }
          softReset(e3) {
            return this._coreService.isCursorHidden = false, this._onRequestSyncScrollBar.fire(), this._activeBuffer.scrollTop = 0, this._activeBuffer.scrollBottom = this._bufferService.rows - 1, this._curAttrData = l.DEFAULT_ATTR_DATA.clone(), this._coreService.reset(), this._charsetService.reset(), this._activeBuffer.savedX = 0, this._activeBuffer.savedY = this._activeBuffer.ybase, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, this._coreService.decPrivateModes.origin = false, true;
          }
          setCursorStyle(e3) {
            const t3 = e3.params[0] || 1;
            switch (t3) {
              case 1:
              case 2:
                this._optionsService.options.cursorStyle = "block";
                break;
              case 3:
              case 4:
                this._optionsService.options.cursorStyle = "underline";
                break;
              case 5:
              case 6:
                this._optionsService.options.cursorStyle = "bar";
            }
            const i3 = t3 % 2 == 1;
            return this._optionsService.options.cursorBlink = i3, true;
          }
          setScrollRegion(e3) {
            const t3 = e3.params[0] || 1;
            let i3;
            return (e3.length < 2 || (i3 = e3.params[1]) > this._bufferService.rows || 0 === i3) && (i3 = this._bufferService.rows), i3 > t3 && (this._activeBuffer.scrollTop = t3 - 1, this._activeBuffer.scrollBottom = i3 - 1, this._setCursor(0, 0)), true;
          }
          windowOptions(e3) {
            if (!b(e3.params[0], this._optionsService.rawOptions.windowOptions))
              return true;
            const t3 = e3.length > 1 ? e3.params[1] : 0;
            switch (e3.params[0]) {
              case 14:
                2 !== t3 && this._onRequestWindowsOptionsReport.fire(y.GET_WIN_SIZE_PIXELS);
                break;
              case 16:
                this._onRequestWindowsOptionsReport.fire(y.GET_CELL_SIZE_PIXELS);
                break;
              case 18:
                this._bufferService && this._coreService.triggerDataEvent(`${n.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
                break;
              case 22:
                0 !== t3 && 2 !== t3 || (this._windowTitleStack.push(this._windowTitle), this._windowTitleStack.length > 10 && this._windowTitleStack.shift()), 0 !== t3 && 1 !== t3 || (this._iconNameStack.push(this._iconName), this._iconNameStack.length > 10 && this._iconNameStack.shift());
                break;
              case 23:
                0 !== t3 && 2 !== t3 || this._windowTitleStack.length && this.setTitle(this._windowTitleStack.pop()), 0 !== t3 && 1 !== t3 || this._iconNameStack.length && this.setIconName(this._iconNameStack.pop());
            }
            return true;
          }
          saveCursor(e3) {
            return this._activeBuffer.savedX = this._activeBuffer.x, this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, true;
          }
          restoreCursor(e3) {
            return this._activeBuffer.x = this._activeBuffer.savedX || 0, this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0), this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg, this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg, this._charsetService.charset = this._savedCharset, this._activeBuffer.savedCharset && (this._charsetService.charset = this._activeBuffer.savedCharset), this._restrictCursor(), true;
          }
          setTitle(e3) {
            return this._windowTitle = e3, this._onTitleChange.fire(e3), true;
          }
          setIconName(e3) {
            return this._iconName = e3, true;
          }
          setOrReportIndexedColor(e3) {
            const t3 = [], i3 = e3.split(";");
            for (; i3.length > 1; ) {
              const e4 = i3.shift(), s3 = i3.shift();
              if (/^\d+$/.exec(e4)) {
                const i4 = parseInt(e4);
                if (L(i4))
                  if ("?" === s3)
                    t3.push({ type: 0, index: i4 });
                  else {
                    const e5 = (0, m2.parseColor)(s3);
                    e5 && t3.push({ type: 1, index: i4, color: e5 });
                  }
              }
            }
            return t3.length && this._onColor.fire(t3), true;
          }
          setHyperlink(e3) {
            const t3 = e3.split(";");
            return !(t3.length < 2) && (t3[1] ? this._createHyperlink(t3[0], t3[1]) : !t3[0] && this._finishHyperlink());
          }
          _createHyperlink(e3, t3) {
            this._getCurrentLinkId() && this._finishHyperlink();
            const i3 = e3.split(":");
            let s3;
            const r2 = i3.findIndex((e4) => e4.startsWith("id="));
            return -1 !== r2 && (s3 = i3[r2].slice(3) || void 0), this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = this._oscLinkService.registerLink({ id: s3, uri: t3 }), this._curAttrData.updateExtended(), true;
          }
          _finishHyperlink() {
            return this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = 0, this._curAttrData.updateExtended(), true;
          }
          _setOrReportSpecialColor(e3, t3) {
            const i3 = e3.split(";");
            for (let e4 = 0; e4 < i3.length && !(t3 >= this._specialColors.length); ++e4, ++t3)
              if ("?" === i3[e4])
                this._onColor.fire([{ type: 0, index: this._specialColors[t3] }]);
              else {
                const s3 = (0, m2.parseColor)(i3[e4]);
                s3 && this._onColor.fire([{ type: 1, index: this._specialColors[t3], color: s3 }]);
              }
            return true;
          }
          setOrReportFgColor(e3) {
            return this._setOrReportSpecialColor(e3, 0);
          }
          setOrReportBgColor(e3) {
            return this._setOrReportSpecialColor(e3, 1);
          }
          setOrReportCursorColor(e3) {
            return this._setOrReportSpecialColor(e3, 2);
          }
          restoreIndexedColor(e3) {
            if (!e3)
              return this._onColor.fire([{ type: 2 }]), true;
            const t3 = [], i3 = e3.split(";");
            for (let e4 = 0; e4 < i3.length; ++e4)
              if (/^\d+$/.exec(i3[e4])) {
                const s3 = parseInt(i3[e4]);
                L(s3) && t3.push({ type: 2, index: s3 });
              }
            return t3.length && this._onColor.fire(t3), true;
          }
          restoreFgColor(e3) {
            return this._onColor.fire([{ type: 2, index: 256 }]), true;
          }
          restoreBgColor(e3) {
            return this._onColor.fire([{ type: 2, index: 257 }]), true;
          }
          restoreCursorColor(e3) {
            return this._onColor.fire([{ type: 2, index: 258 }]), true;
          }
          nextLine() {
            return this._activeBuffer.x = 0, this.index(), true;
          }
          keypadApplicationMode() {
            return this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire(), true;
          }
          keypadNumericMode() {
            return this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire(), true;
          }
          selectDefaultCharset() {
            return this._charsetService.setgLevel(0), this._charsetService.setgCharset(0, o.DEFAULT_CHARSET), true;
          }
          selectCharset(e3) {
            return 2 !== e3.length ? (this.selectDefaultCharset(), true) : ("/" === e3[0] || this._charsetService.setgCharset(S[e3[0]], o.CHARSETS[e3[1]] || o.DEFAULT_CHARSET), true);
          }
          index() {
            return this._restrictCursor(), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._restrictCursor(), true;
          }
          tabSet() {
            return this._activeBuffer.tabs[this._activeBuffer.x] = true, true;
          }
          reverseIndex() {
            if (this._restrictCursor(), this._activeBuffer.y === this._activeBuffer.scrollTop) {
              const e3 = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
              this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, e3, 1), this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData())), this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
            } else
              this._activeBuffer.y--, this._restrictCursor();
            return true;
          }
          fullReset() {
            return this._parser.reset(), this._onRequestReset.fire(), true;
          }
          reset() {
            this._curAttrData = l.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = l.DEFAULT_ATTR_DATA.clone();
          }
          _eraseAttrData() {
            return this._eraseAttrDataInternal.bg &= -67108864, this._eraseAttrDataInternal.bg |= 67108863 & this._curAttrData.bg, this._eraseAttrDataInternal;
          }
          setgLevel(e3) {
            return this._charsetService.setgLevel(e3), true;
          }
          screenAlignmentPattern() {
            const e3 = new u.CellData();
            e3.content = 1 << 22 | "E".charCodeAt(0), e3.fg = this._curAttrData.fg, e3.bg = this._curAttrData.bg, this._setCursor(0, 0);
            for (let t3 = 0; t3 < this._bufferService.rows; ++t3) {
              const i3 = this._activeBuffer.ybase + this._activeBuffer.y + t3, s3 = this._activeBuffer.lines.get(i3);
              s3 && (s3.fill(e3), s3.isWrapped = false);
            }
            return this._dirtyRowTracker.markAllDirty(), this._setCursor(0, 0), true;
          }
          requestStatusString(e3, t3) {
            const i3 = this._bufferService.buffer, s3 = this._optionsService.rawOptions;
            return ((e4) => (this._coreService.triggerDataEvent(`${n.C0.ESC}${e4}${n.C0.ESC}\\`), true))('"q' === e3 ? `P1$r${this._curAttrData.isProtected() ? 1 : 0}"q` : '"p' === e3 ? 'P1$r61;1"p' : "r" === e3 ? `P1$r${i3.scrollTop + 1};${i3.scrollBottom + 1}r` : "m" === e3 ? "P1$r0m" : " q" === e3 ? `P1$r${{ block: 2, underline: 4, bar: 6 }[s3.cursorStyle] - (s3.cursorBlink ? 1 : 0)} q` : "P0$r");
          }
          markRangeDirty(e3, t3) {
            this._dirtyRowTracker.markRangeDirty(e3, t3);
          }
        }
        t2.InputHandler = E;
        let k = class {
          constructor(e3) {
            this._bufferService = e3, this.clearRange();
          }
          clearRange() {
            this.start = this._bufferService.buffer.y, this.end = this._bufferService.buffer.y;
          }
          markDirty(e3) {
            e3 < this.start ? this.start = e3 : e3 > this.end && (this.end = e3);
          }
          markRangeDirty(e3, t3) {
            e3 > t3 && (w = e3, e3 = t3, t3 = w), e3 < this.start && (this.start = e3), t3 > this.end && (this.end = t3);
          }
          markAllDirty() {
            this.markRangeDirty(0, this._bufferService.rows - 1);
          }
        };
        function L(e3) {
          return 0 <= e3 && e3 < 256;
        }
        k = s2([r(0, v.IBufferService)], k);
      }, 844: (e2, t2) => {
        function i2(e3) {
          for (const t3 of e3)
            t3.dispose();
          e3.length = 0;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getDisposeArrayDisposable = t2.disposeArray = t2.toDisposable = t2.MutableDisposable = t2.Disposable = void 0, t2.Disposable = class {
          constructor() {
            this._disposables = [], this._isDisposed = false;
          }
          dispose() {
            this._isDisposed = true;
            for (const e3 of this._disposables)
              e3.dispose();
            this._disposables.length = 0;
          }
          register(e3) {
            return this._disposables.push(e3), e3;
          }
          unregister(e3) {
            const t3 = this._disposables.indexOf(e3);
            -1 !== t3 && this._disposables.splice(t3, 1);
          }
        }, t2.MutableDisposable = class {
          constructor() {
            this._isDisposed = false;
          }
          get value() {
            return this._isDisposed ? void 0 : this._value;
          }
          set value(e3) {
            var t3;
            this._isDisposed || e3 === this._value || (null === (t3 = this._value) || void 0 === t3 || t3.dispose(), this._value = e3);
          }
          clear() {
            this.value = void 0;
          }
          dispose() {
            var e3;
            this._isDisposed = true, null === (e3 = this._value) || void 0 === e3 || e3.dispose(), this._value = void 0;
          }
        }, t2.toDisposable = function(e3) {
          return { dispose: e3 };
        }, t2.disposeArray = i2, t2.getDisposeArrayDisposable = function(e3) {
          return { dispose: () => i2(e3) };
        };
      }, 1505: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.FourKeyMap = t2.TwoKeyMap = void 0;
        class i2 {
          constructor() {
            this._data = {};
          }
          set(e3, t3, i3) {
            this._data[e3] || (this._data[e3] = {}), this._data[e3][t3] = i3;
          }
          get(e3, t3) {
            return this._data[e3] ? this._data[e3][t3] : void 0;
          }
          clear() {
            this._data = {};
          }
        }
        t2.TwoKeyMap = i2, t2.FourKeyMap = class {
          constructor() {
            this._data = new i2();
          }
          set(e3, t3, s2, r, n) {
            this._data.get(e3, t3) || this._data.set(e3, t3, new i2()), this._data.get(e3, t3).set(s2, r, n);
          }
          get(e3, t3, i3, s2) {
            var r;
            return null === (r = this._data.get(e3, t3)) || void 0 === r ? void 0 : r.get(i3, s2);
          }
          clear() {
            this._data.clear();
          }
        };
      }, 6114: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.isChromeOS = t2.isLinux = t2.isWindows = t2.isIphone = t2.isIpad = t2.isMac = t2.getSafariVersion = t2.isSafari = t2.isLegacyEdge = t2.isFirefox = t2.isNode = void 0, t2.isNode = "undefined" == typeof navigator;
        const i2 = t2.isNode ? "node" : navigator.userAgent, s2 = t2.isNode ? "node" : navigator.platform;
        t2.isFirefox = i2.includes("Firefox"), t2.isLegacyEdge = i2.includes("Edge"), t2.isSafari = /^((?!chrome|android).)*safari/i.test(i2), t2.getSafariVersion = function() {
          if (!t2.isSafari)
            return 0;
          const e3 = i2.match(/Version\/(\d+)/);
          return null === e3 || e3.length < 2 ? 0 : parseInt(e3[1]);
        }, t2.isMac = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(s2), t2.isIpad = "iPad" === s2, t2.isIphone = "iPhone" === s2, t2.isWindows = ["Windows", "Win16", "Win32", "WinCE"].includes(s2), t2.isLinux = s2.indexOf("Linux") >= 0, t2.isChromeOS = /\bCrOS\b/.test(i2);
      }, 6106: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.SortedList = void 0;
        let i2 = 0;
        t2.SortedList = class {
          constructor(e3) {
            this._getKey = e3, this._array = [];
          }
          clear() {
            this._array.length = 0;
          }
          insert(e3) {
            0 !== this._array.length ? (i2 = this._search(this._getKey(e3)), this._array.splice(i2, 0, e3)) : this._array.push(e3);
          }
          delete(e3) {
            if (0 === this._array.length)
              return false;
            const t3 = this._getKey(e3);
            if (void 0 === t3)
              return false;
            if (i2 = this._search(t3), -1 === i2)
              return false;
            if (this._getKey(this._array[i2]) !== t3)
              return false;
            do {
              if (this._array[i2] === e3)
                return this._array.splice(i2, 1), true;
            } while (++i2 < this._array.length && this._getKey(this._array[i2]) === t3);
            return false;
          }
          *getKeyIterator(e3) {
            if (0 !== this._array.length && (i2 = this._search(e3), !(i2 < 0 || i2 >= this._array.length) && this._getKey(this._array[i2]) === e3))
              do {
                yield this._array[i2];
              } while (++i2 < this._array.length && this._getKey(this._array[i2]) === e3);
          }
          forEachByKey(e3, t3) {
            if (0 !== this._array.length && (i2 = this._search(e3), !(i2 < 0 || i2 >= this._array.length) && this._getKey(this._array[i2]) === e3))
              do {
                t3(this._array[i2]);
              } while (++i2 < this._array.length && this._getKey(this._array[i2]) === e3);
          }
          values() {
            return [...this._array].values();
          }
          _search(e3) {
            let t3 = 0, i3 = this._array.length - 1;
            for (; i3 >= t3; ) {
              let s2 = t3 + i3 >> 1;
              const r = this._getKey(this._array[s2]);
              if (r > e3)
                i3 = s2 - 1;
              else {
                if (!(r < e3)) {
                  for (; s2 > 0 && this._getKey(this._array[s2 - 1]) === e3; )
                    s2--;
                  return s2;
                }
                t3 = s2 + 1;
              }
            }
            return t3;
          }
        };
      }, 7226: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DebouncedIdleTask = t2.IdleTaskQueue = t2.PriorityTaskQueue = void 0;
        const s2 = i2(6114);
        class r {
          constructor() {
            this._tasks = [], this._i = 0;
          }
          enqueue(e3) {
            this._tasks.push(e3), this._start();
          }
          flush() {
            for (; this._i < this._tasks.length; )
              this._tasks[this._i]() || this._i++;
            this.clear();
          }
          clear() {
            this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
          }
          _start() {
            this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
          }
          _process(e3) {
            this._idleCallback = void 0;
            let t3 = 0, i3 = 0, s3 = e3.timeRemaining(), r2 = 0;
            for (; this._i < this._tasks.length; ) {
              if (t3 = Date.now(), this._tasks[this._i]() || this._i++, t3 = Math.max(1, Date.now() - t3), i3 = Math.max(t3, i3), r2 = e3.timeRemaining(), 1.5 * i3 > r2)
                return s3 - t3 < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(s3 - t3))}ms`), void this._start();
              s3 = r2;
            }
            this.clear();
          }
        }
        class n extends r {
          _requestCallback(e3) {
            return setTimeout(() => e3(this._createDeadline(16)));
          }
          _cancelCallback(e3) {
            clearTimeout(e3);
          }
          _createDeadline(e3) {
            const t3 = Date.now() + e3;
            return { timeRemaining: () => Math.max(0, t3 - Date.now()) };
          }
        }
        t2.PriorityTaskQueue = n, t2.IdleTaskQueue = !s2.isNode && "requestIdleCallback" in window ? class extends r {
          _requestCallback(e3) {
            return requestIdleCallback(e3);
          }
          _cancelCallback(e3) {
            cancelIdleCallback(e3);
          }
        } : n, t2.DebouncedIdleTask = class {
          constructor() {
            this._queue = new t2.IdleTaskQueue();
          }
          set(e3) {
            this._queue.clear(), this._queue.enqueue(e3);
          }
          flush() {
            this._queue.flush();
          }
        };
      }, 9282: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.updateWindowsModeWrappedState = void 0;
        const s2 = i2(643);
        t2.updateWindowsModeWrappedState = function(e3) {
          const t3 = e3.buffer.lines.get(e3.buffer.ybase + e3.buffer.y - 1), i3 = null == t3 ? void 0 : t3.get(e3.cols - 1), r = e3.buffer.lines.get(e3.buffer.ybase + e3.buffer.y);
          r && i3 && (r.isWrapped = i3[s2.CHAR_DATA_CODE_INDEX] !== s2.NULL_CELL_CODE && i3[s2.CHAR_DATA_CODE_INDEX] !== s2.WHITESPACE_CELL_CODE);
        };
      }, 3734: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ExtendedAttrs = t2.AttributeData = void 0;
        class i2 {
          constructor() {
            this.fg = 0, this.bg = 0, this.extended = new s2();
          }
          static toColorRGB(e3) {
            return [e3 >>> 16 & 255, e3 >>> 8 & 255, 255 & e3];
          }
          static fromColorRGB(e3) {
            return (255 & e3[0]) << 16 | (255 & e3[1]) << 8 | 255 & e3[2];
          }
          clone() {
            const e3 = new i2();
            return e3.fg = this.fg, e3.bg = this.bg, e3.extended = this.extended.clone(), e3;
          }
          isInverse() {
            return 67108864 & this.fg;
          }
          isBold() {
            return 134217728 & this.fg;
          }
          isUnderline() {
            return this.hasExtendedAttrs() && 0 !== this.extended.underlineStyle ? 1 : 268435456 & this.fg;
          }
          isBlink() {
            return 536870912 & this.fg;
          }
          isInvisible() {
            return 1073741824 & this.fg;
          }
          isItalic() {
            return 67108864 & this.bg;
          }
          isDim() {
            return 134217728 & this.bg;
          }
          isStrikethrough() {
            return 2147483648 & this.fg;
          }
          isProtected() {
            return 536870912 & this.bg;
          }
          isOverline() {
            return 1073741824 & this.bg;
          }
          getFgColorMode() {
            return 50331648 & this.fg;
          }
          getBgColorMode() {
            return 50331648 & this.bg;
          }
          isFgRGB() {
            return 50331648 == (50331648 & this.fg);
          }
          isBgRGB() {
            return 50331648 == (50331648 & this.bg);
          }
          isFgPalette() {
            return 16777216 == (50331648 & this.fg) || 33554432 == (50331648 & this.fg);
          }
          isBgPalette() {
            return 16777216 == (50331648 & this.bg) || 33554432 == (50331648 & this.bg);
          }
          isFgDefault() {
            return 0 == (50331648 & this.fg);
          }
          isBgDefault() {
            return 0 == (50331648 & this.bg);
          }
          isAttributeDefault() {
            return 0 === this.fg && 0 === this.bg;
          }
          getFgColor() {
            switch (50331648 & this.fg) {
              case 16777216:
              case 33554432:
                return 255 & this.fg;
              case 50331648:
                return 16777215 & this.fg;
              default:
                return -1;
            }
          }
          getBgColor() {
            switch (50331648 & this.bg) {
              case 16777216:
              case 33554432:
                return 255 & this.bg;
              case 50331648:
                return 16777215 & this.bg;
              default:
                return -1;
            }
          }
          hasExtendedAttrs() {
            return 268435456 & this.bg;
          }
          updateExtended() {
            this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
          }
          getUnderlineColor() {
            if (268435456 & this.bg && ~this.extended.underlineColor)
              switch (50331648 & this.extended.underlineColor) {
                case 16777216:
                case 33554432:
                  return 255 & this.extended.underlineColor;
                case 50331648:
                  return 16777215 & this.extended.underlineColor;
                default:
                  return this.getFgColor();
              }
            return this.getFgColor();
          }
          getUnderlineColorMode() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 & this.extended.underlineColor : this.getFgColorMode();
          }
          isUnderlineColorRGB() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 == (50331648 & this.extended.underlineColor) : this.isFgRGB();
          }
          isUnderlineColorPalette() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 16777216 == (50331648 & this.extended.underlineColor) || 33554432 == (50331648 & this.extended.underlineColor) : this.isFgPalette();
          }
          isUnderlineColorDefault() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 0 == (50331648 & this.extended.underlineColor) : this.isFgDefault();
          }
          getUnderlineStyle() {
            return 268435456 & this.fg ? 268435456 & this.bg ? this.extended.underlineStyle : 1 : 0;
          }
        }
        t2.AttributeData = i2;
        class s2 {
          get ext() {
            return this._urlId ? -469762049 & this._ext | this.underlineStyle << 26 : this._ext;
          }
          set ext(e3) {
            this._ext = e3;
          }
          get underlineStyle() {
            return this._urlId ? 5 : (469762048 & this._ext) >> 26;
          }
          set underlineStyle(e3) {
            this._ext &= -469762049, this._ext |= e3 << 26 & 469762048;
          }
          get underlineColor() {
            return 67108863 & this._ext;
          }
          set underlineColor(e3) {
            this._ext &= -67108864, this._ext |= 67108863 & e3;
          }
          get urlId() {
            return this._urlId;
          }
          set urlId(e3) {
            this._urlId = e3;
          }
          constructor(e3 = 0, t3 = 0) {
            this._ext = 0, this._urlId = 0, this._ext = e3, this._urlId = t3;
          }
          clone() {
            return new s2(this._ext, this._urlId);
          }
          isEmpty() {
            return 0 === this.underlineStyle && 0 === this._urlId;
          }
        }
        t2.ExtendedAttrs = s2;
      }, 9092: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Buffer = t2.MAX_BUFFER_SIZE = void 0;
        const s2 = i2(6349), r = i2(7226), n = i2(3734), o = i2(8437), a = i2(4634), h = i2(511), c = i2(643), l = i2(4863), d = i2(7116);
        t2.MAX_BUFFER_SIZE = 4294967295, t2.Buffer = class {
          constructor(e3, t3, i3) {
            this._hasScrollback = e3, this._optionsService = t3, this._bufferService = i3, this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.tabs = {}, this.savedY = 0, this.savedX = 0, this.savedCurAttrData = o.DEFAULT_ATTR_DATA.clone(), this.savedCharset = d.DEFAULT_CHARSET, this.markers = [], this._nullCell = h.CellData.fromCharData([0, c.NULL_CELL_CHAR, c.NULL_CELL_WIDTH, c.NULL_CELL_CODE]), this._whitespaceCell = h.CellData.fromCharData([0, c.WHITESPACE_CELL_CHAR, c.WHITESPACE_CELL_WIDTH, c.WHITESPACE_CELL_CODE]), this._isClearing = false, this._memoryCleanupQueue = new r.IdleTaskQueue(), this._memoryCleanupPosition = 0, this._cols = this._bufferService.cols, this._rows = this._bufferService.rows, this.lines = new s2.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
          }
          getNullCell(e3) {
            return e3 ? (this._nullCell.fg = e3.fg, this._nullCell.bg = e3.bg, this._nullCell.extended = e3.extended) : (this._nullCell.fg = 0, this._nullCell.bg = 0, this._nullCell.extended = new n.ExtendedAttrs()), this._nullCell;
          }
          getWhitespaceCell(e3) {
            return e3 ? (this._whitespaceCell.fg = e3.fg, this._whitespaceCell.bg = e3.bg, this._whitespaceCell.extended = e3.extended) : (this._whitespaceCell.fg = 0, this._whitespaceCell.bg = 0, this._whitespaceCell.extended = new n.ExtendedAttrs()), this._whitespaceCell;
          }
          getBlankLine(e3, t3) {
            return new o.BufferLine(this._bufferService.cols, this.getNullCell(e3), t3);
          }
          get hasScrollback() {
            return this._hasScrollback && this.lines.maxLength > this._rows;
          }
          get isCursorInViewport() {
            const e3 = this.ybase + this.y - this.ydisp;
            return e3 >= 0 && e3 < this._rows;
          }
          _getCorrectBufferLength(e3) {
            if (!this._hasScrollback)
              return e3;
            const i3 = e3 + this._optionsService.rawOptions.scrollback;
            return i3 > t2.MAX_BUFFER_SIZE ? t2.MAX_BUFFER_SIZE : i3;
          }
          fillViewportRows(e3) {
            if (0 === this.lines.length) {
              void 0 === e3 && (e3 = o.DEFAULT_ATTR_DATA);
              let t3 = this._rows;
              for (; t3--; )
                this.lines.push(this.getBlankLine(e3));
            }
          }
          clear() {
            this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.lines = new s2.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
          }
          resize(e3, t3) {
            const i3 = this.getNullCell(o.DEFAULT_ATTR_DATA);
            let s3 = 0;
            const r2 = this._getCorrectBufferLength(t3);
            if (r2 > this.lines.maxLength && (this.lines.maxLength = r2), this.lines.length > 0) {
              if (this._cols < e3)
                for (let t4 = 0; t4 < this.lines.length; t4++)
                  s3 += +this.lines.get(t4).resize(e3, i3);
              let n2 = 0;
              if (this._rows < t3)
                for (let s4 = this._rows; s4 < t3; s4++)
                  this.lines.length < t3 + this.ybase && (this._optionsService.rawOptions.windowsMode || void 0 !== this._optionsService.rawOptions.windowsPty.backend || void 0 !== this._optionsService.rawOptions.windowsPty.buildNumber ? this.lines.push(new o.BufferLine(e3, i3)) : this.ybase > 0 && this.lines.length <= this.ybase + this.y + n2 + 1 ? (this.ybase--, n2++, this.ydisp > 0 && this.ydisp--) : this.lines.push(new o.BufferLine(e3, i3)));
              else
                for (let e4 = this._rows; e4 > t3; e4--)
                  this.lines.length > t3 + this.ybase && (this.lines.length > this.ybase + this.y + 1 ? this.lines.pop() : (this.ybase++, this.ydisp++));
              if (r2 < this.lines.maxLength) {
                const e4 = this.lines.length - r2;
                e4 > 0 && (this.lines.trimStart(e4), this.ybase = Math.max(this.ybase - e4, 0), this.ydisp = Math.max(this.ydisp - e4, 0), this.savedY = Math.max(this.savedY - e4, 0)), this.lines.maxLength = r2;
              }
              this.x = Math.min(this.x, e3 - 1), this.y = Math.min(this.y, t3 - 1), n2 && (this.y += n2), this.savedX = Math.min(this.savedX, e3 - 1), this.scrollTop = 0;
            }
            if (this.scrollBottom = t3 - 1, this._isReflowEnabled && (this._reflow(e3, t3), this._cols > e3))
              for (let t4 = 0; t4 < this.lines.length; t4++)
                s3 += +this.lines.get(t4).resize(e3, i3);
            this._cols = e3, this._rows = t3, this._memoryCleanupQueue.clear(), s3 > 0.1 * this.lines.length && (this._memoryCleanupPosition = 0, this._memoryCleanupQueue.enqueue(() => this._batchedMemoryCleanup()));
          }
          _batchedMemoryCleanup() {
            let e3 = true;
            this._memoryCleanupPosition >= this.lines.length && (this._memoryCleanupPosition = 0, e3 = false);
            let t3 = 0;
            for (; this._memoryCleanupPosition < this.lines.length; )
              if (t3 += this.lines.get(this._memoryCleanupPosition++).cleanupMemory(), t3 > 100)
                return true;
            return e3;
          }
          get _isReflowEnabled() {
            const e3 = this._optionsService.rawOptions.windowsPty;
            return e3 && e3.buildNumber ? this._hasScrollback && "conpty" === e3.backend && e3.buildNumber >= 21376 : this._hasScrollback && !this._optionsService.rawOptions.windowsMode;
          }
          _reflow(e3, t3) {
            this._cols !== e3 && (e3 > this._cols ? this._reflowLarger(e3, t3) : this._reflowSmaller(e3, t3));
          }
          _reflowLarger(e3, t3) {
            const i3 = (0, a.reflowLargerGetLinesToRemove)(this.lines, this._cols, e3, this.ybase + this.y, this.getNullCell(o.DEFAULT_ATTR_DATA));
            if (i3.length > 0) {
              const s3 = (0, a.reflowLargerCreateNewLayout)(this.lines, i3);
              (0, a.reflowLargerApplyNewLayout)(this.lines, s3.layout), this._reflowLargerAdjustViewport(e3, t3, s3.countRemoved);
            }
          }
          _reflowLargerAdjustViewport(e3, t3, i3) {
            const s3 = this.getNullCell(o.DEFAULT_ATTR_DATA);
            let r2 = i3;
            for (; r2-- > 0; )
              0 === this.ybase ? (this.y > 0 && this.y--, this.lines.length < t3 && this.lines.push(new o.BufferLine(e3, s3))) : (this.ydisp === this.ybase && this.ydisp--, this.ybase--);
            this.savedY = Math.max(this.savedY - i3, 0);
          }
          _reflowSmaller(e3, t3) {
            const i3 = this.getNullCell(o.DEFAULT_ATTR_DATA), s3 = [];
            let r2 = 0;
            for (let n2 = this.lines.length - 1; n2 >= 0; n2--) {
              let h2 = this.lines.get(n2);
              if (!h2 || !h2.isWrapped && h2.getTrimmedLength() <= e3)
                continue;
              const c2 = [h2];
              for (; h2.isWrapped && n2 > 0; )
                h2 = this.lines.get(--n2), c2.unshift(h2);
              const l2 = this.ybase + this.y;
              if (l2 >= n2 && l2 < n2 + c2.length)
                continue;
              const d2 = c2[c2.length - 1].getTrimmedLength(), _ = (0, a.reflowSmallerGetNewLineLengths)(c2, this._cols, e3), u = _.length - c2.length;
              let f;
              f = 0 === this.ybase && this.y !== this.lines.length - 1 ? Math.max(0, this.y - this.lines.maxLength + u) : Math.max(0, this.lines.length - this.lines.maxLength + u);
              const v = [];
              for (let e4 = 0; e4 < u; e4++) {
                const e5 = this.getBlankLine(o.DEFAULT_ATTR_DATA, true);
                v.push(e5);
              }
              v.length > 0 && (s3.push({ start: n2 + c2.length + r2, newLines: v }), r2 += v.length), c2.push(...v);
              let p = _.length - 1, g = _[p];
              0 === g && (p--, g = _[p]);
              let m2 = c2.length - u - 1, S = d2;
              for (; m2 >= 0; ) {
                const e4 = Math.min(S, g);
                if (void 0 === c2[p])
                  break;
                if (c2[p].copyCellsFrom(c2[m2], S - e4, g - e4, e4, true), g -= e4, 0 === g && (p--, g = _[p]), S -= e4, 0 === S) {
                  m2--;
                  const e5 = Math.max(m2, 0);
                  S = (0, a.getWrappedLineTrimmedLength)(c2, e5, this._cols);
                }
              }
              for (let t4 = 0; t4 < c2.length; t4++)
                _[t4] < e3 && c2[t4].setCell(_[t4], i3);
              let C = u - f;
              for (; C-- > 0; )
                0 === this.ybase ? this.y < t3 - 1 ? (this.y++, this.lines.pop()) : (this.ybase++, this.ydisp++) : this.ybase < Math.min(this.lines.maxLength, this.lines.length + r2) - t3 && (this.ybase === this.ydisp && this.ydisp++, this.ybase++);
              this.savedY = Math.min(this.savedY + u, this.ybase + t3 - 1);
            }
            if (s3.length > 0) {
              const e4 = [], t4 = [];
              for (let e5 = 0; e5 < this.lines.length; e5++)
                t4.push(this.lines.get(e5));
              const i4 = this.lines.length;
              let n2 = i4 - 1, o2 = 0, a2 = s3[o2];
              this.lines.length = Math.min(this.lines.maxLength, this.lines.length + r2);
              let h2 = 0;
              for (let c3 = Math.min(this.lines.maxLength - 1, i4 + r2 - 1); c3 >= 0; c3--)
                if (a2 && a2.start > n2 + h2) {
                  for (let e5 = a2.newLines.length - 1; e5 >= 0; e5--)
                    this.lines.set(c3--, a2.newLines[e5]);
                  c3++, e4.push({ index: n2 + 1, amount: a2.newLines.length }), h2 += a2.newLines.length, a2 = s3[++o2];
                } else
                  this.lines.set(c3, t4[n2--]);
              let c2 = 0;
              for (let t5 = e4.length - 1; t5 >= 0; t5--)
                e4[t5].index += c2, this.lines.onInsertEmitter.fire(e4[t5]), c2 += e4[t5].amount;
              const l2 = Math.max(0, i4 + r2 - this.lines.maxLength);
              l2 > 0 && this.lines.onTrimEmitter.fire(l2);
            }
          }
          translateBufferLineToString(e3, t3, i3 = 0, s3) {
            const r2 = this.lines.get(e3);
            return r2 ? r2.translateToString(t3, i3, s3) : "";
          }
          getWrappedRangeForLine(e3) {
            let t3 = e3, i3 = e3;
            for (; t3 > 0 && this.lines.get(t3).isWrapped; )
              t3--;
            for (; i3 + 1 < this.lines.length && this.lines.get(i3 + 1).isWrapped; )
              i3++;
            return { first: t3, last: i3 };
          }
          setupTabStops(e3) {
            for (null != e3 ? this.tabs[e3] || (e3 = this.prevStop(e3)) : (this.tabs = {}, e3 = 0); e3 < this._cols; e3 += this._optionsService.rawOptions.tabStopWidth)
              this.tabs[e3] = true;
          }
          prevStop(e3) {
            for (null == e3 && (e3 = this.x); !this.tabs[--e3] && e3 > 0; )
              ;
            return e3 >= this._cols ? this._cols - 1 : e3 < 0 ? 0 : e3;
          }
          nextStop(e3) {
            for (null == e3 && (e3 = this.x); !this.tabs[++e3] && e3 < this._cols; )
              ;
            return e3 >= this._cols ? this._cols - 1 : e3 < 0 ? 0 : e3;
          }
          clearMarkers(e3) {
            this._isClearing = true;
            for (let t3 = 0; t3 < this.markers.length; t3++)
              this.markers[t3].line === e3 && (this.markers[t3].dispose(), this.markers.splice(t3--, 1));
            this._isClearing = false;
          }
          clearAllMarkers() {
            this._isClearing = true;
            for (let e3 = 0; e3 < this.markers.length; e3++)
              this.markers[e3].dispose(), this.markers.splice(e3--, 1);
            this._isClearing = false;
          }
          addMarker(e3) {
            const t3 = new l.Marker(e3);
            return this.markers.push(t3), t3.register(this.lines.onTrim((e4) => {
              t3.line -= e4, t3.line < 0 && t3.dispose();
            })), t3.register(this.lines.onInsert((e4) => {
              t3.line >= e4.index && (t3.line += e4.amount);
            })), t3.register(this.lines.onDelete((e4) => {
              t3.line >= e4.index && t3.line < e4.index + e4.amount && t3.dispose(), t3.line > e4.index && (t3.line -= e4.amount);
            })), t3.register(t3.onDispose(() => this._removeMarker(t3))), t3;
          }
          _removeMarker(e3) {
            this._isClearing || this.markers.splice(this.markers.indexOf(e3), 1);
          }
        };
      }, 8437: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferLine = t2.DEFAULT_ATTR_DATA = void 0;
        const s2 = i2(3734), r = i2(511), n = i2(643), o = i2(482);
        t2.DEFAULT_ATTR_DATA = Object.freeze(new s2.AttributeData());
        let a = 0;
        class h {
          constructor(e3, t3, i3 = false) {
            this.isWrapped = i3, this._combined = {}, this._extendedAttrs = {}, this._data = new Uint32Array(3 * e3);
            const s3 = t3 || r.CellData.fromCharData([0, n.NULL_CELL_CHAR, n.NULL_CELL_WIDTH, n.NULL_CELL_CODE]);
            for (let t4 = 0; t4 < e3; ++t4)
              this.setCell(t4, s3);
            this.length = e3;
          }
          get(e3) {
            const t3 = this._data[3 * e3 + 0], i3 = 2097151 & t3;
            return [this._data[3 * e3 + 1], 2097152 & t3 ? this._combined[e3] : i3 ? (0, o.stringFromCodePoint)(i3) : "", t3 >> 22, 2097152 & t3 ? this._combined[e3].charCodeAt(this._combined[e3].length - 1) : i3];
          }
          set(e3, t3) {
            this._data[3 * e3 + 1] = t3[n.CHAR_DATA_ATTR_INDEX], t3[n.CHAR_DATA_CHAR_INDEX].length > 1 ? (this._combined[e3] = t3[1], this._data[3 * e3 + 0] = 2097152 | e3 | t3[n.CHAR_DATA_WIDTH_INDEX] << 22) : this._data[3 * e3 + 0] = t3[n.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | t3[n.CHAR_DATA_WIDTH_INDEX] << 22;
          }
          getWidth(e3) {
            return this._data[3 * e3 + 0] >> 22;
          }
          hasWidth(e3) {
            return 12582912 & this._data[3 * e3 + 0];
          }
          getFg(e3) {
            return this._data[3 * e3 + 1];
          }
          getBg(e3) {
            return this._data[3 * e3 + 2];
          }
          hasContent(e3) {
            return 4194303 & this._data[3 * e3 + 0];
          }
          getCodePoint(e3) {
            const t3 = this._data[3 * e3 + 0];
            return 2097152 & t3 ? this._combined[e3].charCodeAt(this._combined[e3].length - 1) : 2097151 & t3;
          }
          isCombined(e3) {
            return 2097152 & this._data[3 * e3 + 0];
          }
          getString(e3) {
            const t3 = this._data[3 * e3 + 0];
            return 2097152 & t3 ? this._combined[e3] : 2097151 & t3 ? (0, o.stringFromCodePoint)(2097151 & t3) : "";
          }
          isProtected(e3) {
            return 536870912 & this._data[3 * e3 + 2];
          }
          loadCell(e3, t3) {
            return a = 3 * e3, t3.content = this._data[a + 0], t3.fg = this._data[a + 1], t3.bg = this._data[a + 2], 2097152 & t3.content && (t3.combinedData = this._combined[e3]), 268435456 & t3.bg && (t3.extended = this._extendedAttrs[e3]), t3;
          }
          setCell(e3, t3) {
            2097152 & t3.content && (this._combined[e3] = t3.combinedData), 268435456 & t3.bg && (this._extendedAttrs[e3] = t3.extended), this._data[3 * e3 + 0] = t3.content, this._data[3 * e3 + 1] = t3.fg, this._data[3 * e3 + 2] = t3.bg;
          }
          setCellFromCodePoint(e3, t3, i3, s3, r2, n2) {
            268435456 & r2 && (this._extendedAttrs[e3] = n2), this._data[3 * e3 + 0] = t3 | i3 << 22, this._data[3 * e3 + 1] = s3, this._data[3 * e3 + 2] = r2;
          }
          addCodepointToCell(e3, t3) {
            let i3 = this._data[3 * e3 + 0];
            2097152 & i3 ? this._combined[e3] += (0, o.stringFromCodePoint)(t3) : (2097151 & i3 ? (this._combined[e3] = (0, o.stringFromCodePoint)(2097151 & i3) + (0, o.stringFromCodePoint)(t3), i3 &= -2097152, i3 |= 2097152) : i3 = t3 | 1 << 22, this._data[3 * e3 + 0] = i3);
          }
          insertCells(e3, t3, i3, n2) {
            if ((e3 %= this.length) && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs()), t3 < this.length - e3) {
              const s3 = new r.CellData();
              for (let i4 = this.length - e3 - t3 - 1; i4 >= 0; --i4)
                this.setCell(e3 + t3 + i4, this.loadCell(e3 + i4, s3));
              for (let s4 = 0; s4 < t3; ++s4)
                this.setCell(e3 + s4, i3);
            } else
              for (let t4 = e3; t4 < this.length; ++t4)
                this.setCell(t4, i3);
            2 === this.getWidth(this.length - 1) && this.setCellFromCodePoint(this.length - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs());
          }
          deleteCells(e3, t3, i3, n2) {
            if (e3 %= this.length, t3 < this.length - e3) {
              const s3 = new r.CellData();
              for (let i4 = 0; i4 < this.length - e3 - t3; ++i4)
                this.setCell(e3 + i4, this.loadCell(e3 + t3 + i4, s3));
              for (let e4 = this.length - t3; e4 < this.length; ++e4)
                this.setCell(e4, i3);
            } else
              for (let t4 = e3; t4 < this.length; ++t4)
                this.setCell(t4, i3);
            e3 && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs()), 0 !== this.getWidth(e3) || this.hasContent(e3) || this.setCellFromCodePoint(e3, 0, 1, (null == n2 ? void 0 : n2.fg) || 0, (null == n2 ? void 0 : n2.bg) || 0, (null == n2 ? void 0 : n2.extended) || new s2.ExtendedAttrs());
          }
          replaceCells(e3, t3, i3, r2, n2 = false) {
            if (n2)
              for (e3 && 2 === this.getWidth(e3 - 1) && !this.isProtected(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()), t3 < this.length && 2 === this.getWidth(t3 - 1) && !this.isProtected(t3) && this.setCellFromCodePoint(t3, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()); e3 < t3 && e3 < this.length; )
                this.isProtected(e3) || this.setCell(e3, i3), e3++;
            else
              for (e3 && 2 === this.getWidth(e3 - 1) && this.setCellFromCodePoint(e3 - 1, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()), t3 < this.length && 2 === this.getWidth(t3 - 1) && this.setCellFromCodePoint(t3, 0, 1, (null == r2 ? void 0 : r2.fg) || 0, (null == r2 ? void 0 : r2.bg) || 0, (null == r2 ? void 0 : r2.extended) || new s2.ExtendedAttrs()); e3 < t3 && e3 < this.length; )
                this.setCell(e3++, i3);
          }
          resize(e3, t3) {
            if (e3 === this.length)
              return 4 * this._data.length * 2 < this._data.buffer.byteLength;
            const i3 = 3 * e3;
            if (e3 > this.length) {
              if (this._data.buffer.byteLength >= 4 * i3)
                this._data = new Uint32Array(this._data.buffer, 0, i3);
              else {
                const e4 = new Uint32Array(i3);
                e4.set(this._data), this._data = e4;
              }
              for (let i4 = this.length; i4 < e3; ++i4)
                this.setCell(i4, t3);
            } else {
              this._data = this._data.subarray(0, i3);
              const t4 = Object.keys(this._combined);
              for (let i4 = 0; i4 < t4.length; i4++) {
                const s4 = parseInt(t4[i4], 10);
                s4 >= e3 && delete this._combined[s4];
              }
              const s3 = Object.keys(this._extendedAttrs);
              for (let t5 = 0; t5 < s3.length; t5++) {
                const i4 = parseInt(s3[t5], 10);
                i4 >= e3 && delete this._extendedAttrs[i4];
              }
            }
            return this.length = e3, 4 * i3 * 2 < this._data.buffer.byteLength;
          }
          cleanupMemory() {
            if (4 * this._data.length * 2 < this._data.buffer.byteLength) {
              const e3 = new Uint32Array(this._data.length);
              return e3.set(this._data), this._data = e3, 1;
            }
            return 0;
          }
          fill(e3, t3 = false) {
            if (t3)
              for (let t4 = 0; t4 < this.length; ++t4)
                this.isProtected(t4) || this.setCell(t4, e3);
            else {
              this._combined = {}, this._extendedAttrs = {};
              for (let t4 = 0; t4 < this.length; ++t4)
                this.setCell(t4, e3);
            }
          }
          copyFrom(e3) {
            this.length !== e3.length ? this._data = new Uint32Array(e3._data) : this._data.set(e3._data), this.length = e3.length, this._combined = {};
            for (const t3 in e3._combined)
              this._combined[t3] = e3._combined[t3];
            this._extendedAttrs = {};
            for (const t3 in e3._extendedAttrs)
              this._extendedAttrs[t3] = e3._extendedAttrs[t3];
            this.isWrapped = e3.isWrapped;
          }
          clone() {
            const e3 = new h(0);
            e3._data = new Uint32Array(this._data), e3.length = this.length;
            for (const t3 in this._combined)
              e3._combined[t3] = this._combined[t3];
            for (const t3 in this._extendedAttrs)
              e3._extendedAttrs[t3] = this._extendedAttrs[t3];
            return e3.isWrapped = this.isWrapped, e3;
          }
          getTrimmedLength() {
            for (let e3 = this.length - 1; e3 >= 0; --e3)
              if (4194303 & this._data[3 * e3 + 0])
                return e3 + (this._data[3 * e3 + 0] >> 22);
            return 0;
          }
          getNoBgTrimmedLength() {
            for (let e3 = this.length - 1; e3 >= 0; --e3)
              if (4194303 & this._data[3 * e3 + 0] || 50331648 & this._data[3 * e3 + 2])
                return e3 + (this._data[3 * e3 + 0] >> 22);
            return 0;
          }
          copyCellsFrom(e3, t3, i3, s3, r2) {
            const n2 = e3._data;
            if (r2)
              for (let r3 = s3 - 1; r3 >= 0; r3--) {
                for (let e4 = 0; e4 < 3; e4++)
                  this._data[3 * (i3 + r3) + e4] = n2[3 * (t3 + r3) + e4];
                268435456 & n2[3 * (t3 + r3) + 2] && (this._extendedAttrs[i3 + r3] = e3._extendedAttrs[t3 + r3]);
              }
            else
              for (let r3 = 0; r3 < s3; r3++) {
                for (let e4 = 0; e4 < 3; e4++)
                  this._data[3 * (i3 + r3) + e4] = n2[3 * (t3 + r3) + e4];
                268435456 & n2[3 * (t3 + r3) + 2] && (this._extendedAttrs[i3 + r3] = e3._extendedAttrs[t3 + r3]);
              }
            const o2 = Object.keys(e3._combined);
            for (let s4 = 0; s4 < o2.length; s4++) {
              const r3 = parseInt(o2[s4], 10);
              r3 >= t3 && (this._combined[r3 - t3 + i3] = e3._combined[r3]);
            }
          }
          translateToString(e3 = false, t3 = 0, i3 = this.length) {
            e3 && (i3 = Math.min(i3, this.getTrimmedLength()));
            let s3 = "";
            for (; t3 < i3; ) {
              const e4 = this._data[3 * t3 + 0], i4 = 2097151 & e4;
              s3 += 2097152 & e4 ? this._combined[t3] : i4 ? (0, o.stringFromCodePoint)(i4) : n.WHITESPACE_CELL_CHAR, t3 += e4 >> 22 || 1;
            }
            return s3;
          }
        }
        t2.BufferLine = h;
      }, 4841: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getRangeLength = void 0, t2.getRangeLength = function(e3, t3) {
          if (e3.start.y > e3.end.y)
            throw new Error(`Buffer range end (${e3.end.x}, ${e3.end.y}) cannot be before start (${e3.start.x}, ${e3.start.y})`);
          return t3 * (e3.end.y - e3.start.y) + (e3.end.x - e3.start.x + 1);
        };
      }, 4634: (e2, t2) => {
        function i2(e3, t3, i3) {
          if (t3 === e3.length - 1)
            return e3[t3].getTrimmedLength();
          const s2 = !e3[t3].hasContent(i3 - 1) && 1 === e3[t3].getWidth(i3 - 1), r = 2 === e3[t3 + 1].getWidth(0);
          return s2 && r ? i3 - 1 : i3;
        }
        Object.defineProperty(t2, "__esModule", { value: true }), t2.getWrappedLineTrimmedLength = t2.reflowSmallerGetNewLineLengths = t2.reflowLargerApplyNewLayout = t2.reflowLargerCreateNewLayout = t2.reflowLargerGetLinesToRemove = void 0, t2.reflowLargerGetLinesToRemove = function(e3, t3, s2, r, n) {
          const o = [];
          for (let a = 0; a < e3.length - 1; a++) {
            let h = a, c = e3.get(++h);
            if (!c.isWrapped)
              continue;
            const l = [e3.get(a)];
            for (; h < e3.length && c.isWrapped; )
              l.push(c), c = e3.get(++h);
            if (r >= a && r < h) {
              a += l.length - 1;
              continue;
            }
            let d = 0, _ = i2(l, d, t3), u = 1, f = 0;
            for (; u < l.length; ) {
              const e4 = i2(l, u, t3), r2 = e4 - f, o2 = s2 - _, a2 = Math.min(r2, o2);
              l[d].copyCellsFrom(l[u], f, _, a2, false), _ += a2, _ === s2 && (d++, _ = 0), f += a2, f === e4 && (u++, f = 0), 0 === _ && 0 !== d && 2 === l[d - 1].getWidth(s2 - 1) && (l[d].copyCellsFrom(l[d - 1], s2 - 1, _++, 1, false), l[d - 1].setCell(s2 - 1, n));
            }
            l[d].replaceCells(_, s2, n);
            let v = 0;
            for (let e4 = l.length - 1; e4 > 0 && (e4 > d || 0 === l[e4].getTrimmedLength()); e4--)
              v++;
            v > 0 && (o.push(a + l.length - v), o.push(v)), a += l.length - 1;
          }
          return o;
        }, t2.reflowLargerCreateNewLayout = function(e3, t3) {
          const i3 = [];
          let s2 = 0, r = t3[s2], n = 0;
          for (let o = 0; o < e3.length; o++)
            if (r === o) {
              const i4 = t3[++s2];
              e3.onDeleteEmitter.fire({ index: o - n, amount: i4 }), o += i4 - 1, n += i4, r = t3[++s2];
            } else
              i3.push(o);
          return { layout: i3, countRemoved: n };
        }, t2.reflowLargerApplyNewLayout = function(e3, t3) {
          const i3 = [];
          for (let s2 = 0; s2 < t3.length; s2++)
            i3.push(e3.get(t3[s2]));
          for (let t4 = 0; t4 < i3.length; t4++)
            e3.set(t4, i3[t4]);
          e3.length = t3.length;
        }, t2.reflowSmallerGetNewLineLengths = function(e3, t3, s2) {
          const r = [], n = e3.map((s3, r2) => i2(e3, r2, t3)).reduce((e4, t4) => e4 + t4);
          let o = 0, a = 0, h = 0;
          for (; h < n; ) {
            if (n - h < s2) {
              r.push(n - h);
              break;
            }
            o += s2;
            const c = i2(e3, a, t3);
            o > c && (o -= c, a++);
            const l = 2 === e3[a].getWidth(o - 1);
            l && o--;
            const d = l ? s2 - 1 : s2;
            r.push(d), h += d;
          }
          return r;
        }, t2.getWrappedLineTrimmedLength = i2;
      }, 5295: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferSet = void 0;
        const s2 = i2(8460), r = i2(844), n = i2(9092);
        class o extends r.Disposable {
          constructor(e3, t3) {
            super(), this._optionsService = e3, this._bufferService = t3, this._onBufferActivate = this.register(new s2.EventEmitter()), this.onBufferActivate = this._onBufferActivate.event, this.reset(), this.register(this._optionsService.onSpecificOptionChange("scrollback", () => this.resize(this._bufferService.cols, this._bufferService.rows))), this.register(this._optionsService.onSpecificOptionChange("tabStopWidth", () => this.setupTabStops()));
          }
          reset() {
            this._normal = new n.Buffer(true, this._optionsService, this._bufferService), this._normal.fillViewportRows(), this._alt = new n.Buffer(false, this._optionsService, this._bufferService), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }), this.setupTabStops();
          }
          get alt() {
            return this._alt;
          }
          get active() {
            return this._activeBuffer;
          }
          get normal() {
            return this._normal;
          }
          activateNormalBuffer() {
            this._activeBuffer !== this._normal && (this._normal.x = this._alt.x, this._normal.y = this._alt.y, this._alt.clearAllMarkers(), this._alt.clear(), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }));
          }
          activateAltBuffer(e3) {
            this._activeBuffer !== this._alt && (this._alt.fillViewportRows(e3), this._alt.x = this._normal.x, this._alt.y = this._normal.y, this._activeBuffer = this._alt, this._onBufferActivate.fire({ activeBuffer: this._alt, inactiveBuffer: this._normal }));
          }
          resize(e3, t3) {
            this._normal.resize(e3, t3), this._alt.resize(e3, t3), this.setupTabStops(e3);
          }
          setupTabStops(e3) {
            this._normal.setupTabStops(e3), this._alt.setupTabStops(e3);
          }
        }
        t2.BufferSet = o;
      }, 511: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CellData = void 0;
        const s2 = i2(482), r = i2(643), n = i2(3734);
        class o extends n.AttributeData {
          constructor() {
            super(...arguments), this.content = 0, this.fg = 0, this.bg = 0, this.extended = new n.ExtendedAttrs(), this.combinedData = "";
          }
          static fromCharData(e3) {
            const t3 = new o();
            return t3.setFromCharData(e3), t3;
          }
          isCombined() {
            return 2097152 & this.content;
          }
          getWidth() {
            return this.content >> 22;
          }
          getChars() {
            return 2097152 & this.content ? this.combinedData : 2097151 & this.content ? (0, s2.stringFromCodePoint)(2097151 & this.content) : "";
          }
          getCode() {
            return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : 2097151 & this.content;
          }
          setFromCharData(e3) {
            this.fg = e3[r.CHAR_DATA_ATTR_INDEX], this.bg = 0;
            let t3 = false;
            if (e3[r.CHAR_DATA_CHAR_INDEX].length > 2)
              t3 = true;
            else if (2 === e3[r.CHAR_DATA_CHAR_INDEX].length) {
              const i3 = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
              if (55296 <= i3 && i3 <= 56319) {
                const s3 = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                56320 <= s3 && s3 <= 57343 ? this.content = 1024 * (i3 - 55296) + s3 - 56320 + 65536 | e3[r.CHAR_DATA_WIDTH_INDEX] << 22 : t3 = true;
              } else
                t3 = true;
            } else
              this.content = e3[r.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | e3[r.CHAR_DATA_WIDTH_INDEX] << 22;
            t3 && (this.combinedData = e3[r.CHAR_DATA_CHAR_INDEX], this.content = 2097152 | e3[r.CHAR_DATA_WIDTH_INDEX] << 22);
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t2.CellData = o;
      }, 643: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WHITESPACE_CELL_CODE = t2.WHITESPACE_CELL_WIDTH = t2.WHITESPACE_CELL_CHAR = t2.NULL_CELL_CODE = t2.NULL_CELL_WIDTH = t2.NULL_CELL_CHAR = t2.CHAR_DATA_CODE_INDEX = t2.CHAR_DATA_WIDTH_INDEX = t2.CHAR_DATA_CHAR_INDEX = t2.CHAR_DATA_ATTR_INDEX = t2.DEFAULT_EXT = t2.DEFAULT_ATTR = t2.DEFAULT_COLOR = void 0, t2.DEFAULT_COLOR = 0, t2.DEFAULT_ATTR = 256 | t2.DEFAULT_COLOR << 9, t2.DEFAULT_EXT = 0, t2.CHAR_DATA_ATTR_INDEX = 0, t2.CHAR_DATA_CHAR_INDEX = 1, t2.CHAR_DATA_WIDTH_INDEX = 2, t2.CHAR_DATA_CODE_INDEX = 3, t2.NULL_CELL_CHAR = "", t2.NULL_CELL_WIDTH = 1, t2.NULL_CELL_CODE = 0, t2.WHITESPACE_CELL_CHAR = " ", t2.WHITESPACE_CELL_WIDTH = 1, t2.WHITESPACE_CELL_CODE = 32;
      }, 4863: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Marker = void 0;
        const s2 = i2(8460), r = i2(844);
        class n {
          get id() {
            return this._id;
          }
          constructor(e3) {
            this.line = e3, this.isDisposed = false, this._disposables = [], this._id = n._nextId++, this._onDispose = this.register(new s2.EventEmitter()), this.onDispose = this._onDispose.event;
          }
          dispose() {
            this.isDisposed || (this.isDisposed = true, this.line = -1, this._onDispose.fire(), (0, r.disposeArray)(this._disposables), this._disposables.length = 0);
          }
          register(e3) {
            return this._disposables.push(e3), e3;
          }
        }
        t2.Marker = n, n._nextId = 1;
      }, 7116: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DEFAULT_CHARSET = t2.CHARSETS = void 0, t2.CHARSETS = {}, t2.DEFAULT_CHARSET = t2.CHARSETS.B, t2.CHARSETS[0] = { "`": "\u25C6", a: "\u2592", b: "\u2409", c: "\u240C", d: "\u240D", e: "\u240A", f: "\xB0", g: "\xB1", h: "\u2424", i: "\u240B", j: "\u2518", k: "\u2510", l: "\u250C", m: "\u2514", n: "\u253C", o: "\u23BA", p: "\u23BB", q: "\u2500", r: "\u23BC", s: "\u23BD", t: "\u251C", u: "\u2524", v: "\u2534", w: "\u252C", x: "\u2502", y: "\u2264", z: "\u2265", "{": "\u03C0", "|": "\u2260", "}": "\xA3", "~": "\xB7" }, t2.CHARSETS.A = { "#": "\xA3" }, t2.CHARSETS.B = void 0, t2.CHARSETS[4] = { "#": "\xA3", "@": "\xBE", "[": "ij", "\\": "\xBD", "]": "|", "{": "\xA8", "|": "f", "}": "\xBC", "~": "\xB4" }, t2.CHARSETS.C = t2.CHARSETS[5] = { "[": "\xC4", "\\": "\xD6", "]": "\xC5", "^": "\xDC", "`": "\xE9", "{": "\xE4", "|": "\xF6", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS.R = { "#": "\xA3", "@": "\xE0", "[": "\xB0", "\\": "\xE7", "]": "\xA7", "{": "\xE9", "|": "\xF9", "}": "\xE8", "~": "\xA8" }, t2.CHARSETS.Q = { "@": "\xE0", "[": "\xE2", "\\": "\xE7", "]": "\xEA", "^": "\xEE", "`": "\xF4", "{": "\xE9", "|": "\xF9", "}": "\xE8", "~": "\xFB" }, t2.CHARSETS.K = { "@": "\xA7", "[": "\xC4", "\\": "\xD6", "]": "\xDC", "{": "\xE4", "|": "\xF6", "}": "\xFC", "~": "\xDF" }, t2.CHARSETS.Y = { "#": "\xA3", "@": "\xA7", "[": "\xB0", "\\": "\xE7", "]": "\xE9", "`": "\xF9", "{": "\xE0", "|": "\xF2", "}": "\xE8", "~": "\xEC" }, t2.CHARSETS.E = t2.CHARSETS[6] = { "@": "\xC4", "[": "\xC6", "\\": "\xD8", "]": "\xC5", "^": "\xDC", "`": "\xE4", "{": "\xE6", "|": "\xF8", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS.Z = { "#": "\xA3", "@": "\xA7", "[": "\xA1", "\\": "\xD1", "]": "\xBF", "{": "\xB0", "|": "\xF1", "}": "\xE7" }, t2.CHARSETS.H = t2.CHARSETS[7] = { "@": "\xC9", "[": "\xC4", "\\": "\xD6", "]": "\xC5", "^": "\xDC", "`": "\xE9", "{": "\xE4", "|": "\xF6", "}": "\xE5", "~": "\xFC" }, t2.CHARSETS["="] = { "#": "\xF9", "@": "\xE0", "[": "\xE9", "\\": "\xE7", "]": "\xEA", "^": "\xEE", _: "\xE8", "`": "\xF4", "{": "\xE4", "|": "\xF6", "}": "\xFC", "~": "\xFB" };
      }, 2584: (e2, t2) => {
        var i2, s2, r;
        Object.defineProperty(t2, "__esModule", { value: true }), t2.C1_ESCAPED = t2.C1 = t2.C0 = void 0, function(e3) {
          e3.NUL = "\0", e3.SOH = "", e3.STX = "", e3.ETX = "", e3.EOT = "", e3.ENQ = "", e3.ACK = "", e3.BEL = "\x07", e3.BS = "\b", e3.HT = "	", e3.LF = "\n", e3.VT = "\v", e3.FF = "\f", e3.CR = "\r", e3.SO = "", e3.SI = "", e3.DLE = "", e3.DC1 = "", e3.DC2 = "", e3.DC3 = "", e3.DC4 = "", e3.NAK = "", e3.SYN = "", e3.ETB = "", e3.CAN = "", e3.EM = "", e3.SUB = "", e3.ESC = "\x1B", e3.FS = "", e3.GS = "", e3.RS = "", e3.US = "", e3.SP = " ", e3.DEL = "\x7F";
        }(i2 || (t2.C0 = i2 = {})), function(e3) {
          e3.PAD = "\x80", e3.HOP = "\x81", e3.BPH = "\x82", e3.NBH = "\x83", e3.IND = "\x84", e3.NEL = "\x85", e3.SSA = "\x86", e3.ESA = "\x87", e3.HTS = "\x88", e3.HTJ = "\x89", e3.VTS = "\x8A", e3.PLD = "\x8B", e3.PLU = "\x8C", e3.RI = "\x8D", e3.SS2 = "\x8E", e3.SS3 = "\x8F", e3.DCS = "\x90", e3.PU1 = "\x91", e3.PU2 = "\x92", e3.STS = "\x93", e3.CCH = "\x94", e3.MW = "\x95", e3.SPA = "\x96", e3.EPA = "\x97", e3.SOS = "\x98", e3.SGCI = "\x99", e3.SCI = "\x9A", e3.CSI = "\x9B", e3.ST = "\x9C", e3.OSC = "\x9D", e3.PM = "\x9E", e3.APC = "\x9F";
        }(s2 || (t2.C1 = s2 = {})), function(e3) {
          e3.ST = `${i2.ESC}\\`;
        }(r || (t2.C1_ESCAPED = r = {}));
      }, 7399: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.evaluateKeyboardEvent = void 0;
        const s2 = i2(2584), r = { 48: ["0", ")"], 49: ["1", "!"], 50: ["2", "@"], 51: ["3", "#"], 52: ["4", "$"], 53: ["5", "%"], 54: ["6", "^"], 55: ["7", "&"], 56: ["8", "*"], 57: ["9", "("], 186: [";", ":"], 187: ["=", "+"], 188: [",", "<"], 189: ["-", "_"], 190: [".", ">"], 191: ["/", "?"], 192: ["`", "~"], 219: ["[", "{"], 220: ["\\", "|"], 221: ["]", "}"], 222: ["'", '"'] };
        t2.evaluateKeyboardEvent = function(e3, t3, i3, n) {
          const o = { type: 0, cancel: false, key: void 0 }, a = (e3.shiftKey ? 1 : 0) | (e3.altKey ? 2 : 0) | (e3.ctrlKey ? 4 : 0) | (e3.metaKey ? 8 : 0);
          switch (e3.keyCode) {
            case 0:
              "UIKeyInputUpArrow" === e3.key ? o.key = t3 ? s2.C0.ESC + "OA" : s2.C0.ESC + "[A" : "UIKeyInputLeftArrow" === e3.key ? o.key = t3 ? s2.C0.ESC + "OD" : s2.C0.ESC + "[D" : "UIKeyInputRightArrow" === e3.key ? o.key = t3 ? s2.C0.ESC + "OC" : s2.C0.ESC + "[C" : "UIKeyInputDownArrow" === e3.key && (o.key = t3 ? s2.C0.ESC + "OB" : s2.C0.ESC + "[B");
              break;
            case 8:
              if (e3.altKey) {
                o.key = s2.C0.ESC + s2.C0.DEL;
                break;
              }
              o.key = s2.C0.DEL;
              break;
            case 9:
              if (e3.shiftKey) {
                o.key = s2.C0.ESC + "[Z";
                break;
              }
              o.key = s2.C0.HT, o.cancel = true;
              break;
            case 13:
              o.key = e3.altKey ? s2.C0.ESC + s2.C0.CR : s2.C0.CR, o.cancel = true;
              break;
            case 27:
              o.key = s2.C0.ESC, e3.altKey && (o.key = s2.C0.ESC + s2.C0.ESC), o.cancel = true;
              break;
            case 37:
              if (e3.metaKey)
                break;
              a ? (o.key = s2.C0.ESC + "[1;" + (a + 1) + "D", o.key === s2.C0.ESC + "[1;3D" && (o.key = s2.C0.ESC + (i3 ? "b" : "[1;5D"))) : o.key = t3 ? s2.C0.ESC + "OD" : s2.C0.ESC + "[D";
              break;
            case 39:
              if (e3.metaKey)
                break;
              a ? (o.key = s2.C0.ESC + "[1;" + (a + 1) + "C", o.key === s2.C0.ESC + "[1;3C" && (o.key = s2.C0.ESC + (i3 ? "f" : "[1;5C"))) : o.key = t3 ? s2.C0.ESC + "OC" : s2.C0.ESC + "[C";
              break;
            case 38:
              if (e3.metaKey)
                break;
              a ? (o.key = s2.C0.ESC + "[1;" + (a + 1) + "A", i3 || o.key !== s2.C0.ESC + "[1;3A" || (o.key = s2.C0.ESC + "[1;5A")) : o.key = t3 ? s2.C0.ESC + "OA" : s2.C0.ESC + "[A";
              break;
            case 40:
              if (e3.metaKey)
                break;
              a ? (o.key = s2.C0.ESC + "[1;" + (a + 1) + "B", i3 || o.key !== s2.C0.ESC + "[1;3B" || (o.key = s2.C0.ESC + "[1;5B")) : o.key = t3 ? s2.C0.ESC + "OB" : s2.C0.ESC + "[B";
              break;
            case 45:
              e3.shiftKey || e3.ctrlKey || (o.key = s2.C0.ESC + "[2~");
              break;
            case 46:
              o.key = a ? s2.C0.ESC + "[3;" + (a + 1) + "~" : s2.C0.ESC + "[3~";
              break;
            case 36:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "H" : t3 ? s2.C0.ESC + "OH" : s2.C0.ESC + "[H";
              break;
            case 35:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "F" : t3 ? s2.C0.ESC + "OF" : s2.C0.ESC + "[F";
              break;
            case 33:
              e3.shiftKey ? o.type = 2 : e3.ctrlKey ? o.key = s2.C0.ESC + "[5;" + (a + 1) + "~" : o.key = s2.C0.ESC + "[5~";
              break;
            case 34:
              e3.shiftKey ? o.type = 3 : e3.ctrlKey ? o.key = s2.C0.ESC + "[6;" + (a + 1) + "~" : o.key = s2.C0.ESC + "[6~";
              break;
            case 112:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "P" : s2.C0.ESC + "OP";
              break;
            case 113:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "Q" : s2.C0.ESC + "OQ";
              break;
            case 114:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "R" : s2.C0.ESC + "OR";
              break;
            case 115:
              o.key = a ? s2.C0.ESC + "[1;" + (a + 1) + "S" : s2.C0.ESC + "OS";
              break;
            case 116:
              o.key = a ? s2.C0.ESC + "[15;" + (a + 1) + "~" : s2.C0.ESC + "[15~";
              break;
            case 117:
              o.key = a ? s2.C0.ESC + "[17;" + (a + 1) + "~" : s2.C0.ESC + "[17~";
              break;
            case 118:
              o.key = a ? s2.C0.ESC + "[18;" + (a + 1) + "~" : s2.C0.ESC + "[18~";
              break;
            case 119:
              o.key = a ? s2.C0.ESC + "[19;" + (a + 1) + "~" : s2.C0.ESC + "[19~";
              break;
            case 120:
              o.key = a ? s2.C0.ESC + "[20;" + (a + 1) + "~" : s2.C0.ESC + "[20~";
              break;
            case 121:
              o.key = a ? s2.C0.ESC + "[21;" + (a + 1) + "~" : s2.C0.ESC + "[21~";
              break;
            case 122:
              o.key = a ? s2.C0.ESC + "[23;" + (a + 1) + "~" : s2.C0.ESC + "[23~";
              break;
            case 123:
              o.key = a ? s2.C0.ESC + "[24;" + (a + 1) + "~" : s2.C0.ESC + "[24~";
              break;
            default:
              if (!e3.ctrlKey || e3.shiftKey || e3.altKey || e3.metaKey)
                if (i3 && !n || !e3.altKey || e3.metaKey)
                  !i3 || e3.altKey || e3.ctrlKey || e3.shiftKey || !e3.metaKey ? e3.key && !e3.ctrlKey && !e3.altKey && !e3.metaKey && e3.keyCode >= 48 && 1 === e3.key.length ? o.key = e3.key : e3.key && e3.ctrlKey && ("_" === e3.key && (o.key = s2.C0.US), "@" === e3.key && (o.key = s2.C0.NUL)) : 65 === e3.keyCode && (o.type = 1);
                else {
                  const t4 = r[e3.keyCode], i4 = null == t4 ? void 0 : t4[e3.shiftKey ? 1 : 0];
                  if (i4)
                    o.key = s2.C0.ESC + i4;
                  else if (e3.keyCode >= 65 && e3.keyCode <= 90) {
                    const t5 = e3.ctrlKey ? e3.keyCode - 64 : e3.keyCode + 32;
                    let i5 = String.fromCharCode(t5);
                    e3.shiftKey && (i5 = i5.toUpperCase()), o.key = s2.C0.ESC + i5;
                  } else if (32 === e3.keyCode)
                    o.key = s2.C0.ESC + (e3.ctrlKey ? s2.C0.NUL : " ");
                  else if ("Dead" === e3.key && e3.code.startsWith("Key")) {
                    let t5 = e3.code.slice(3, 4);
                    e3.shiftKey || (t5 = t5.toLowerCase()), o.key = s2.C0.ESC + t5, o.cancel = true;
                  }
                }
              else
                e3.keyCode >= 65 && e3.keyCode <= 90 ? o.key = String.fromCharCode(e3.keyCode - 64) : 32 === e3.keyCode ? o.key = s2.C0.NUL : e3.keyCode >= 51 && e3.keyCode <= 55 ? o.key = String.fromCharCode(e3.keyCode - 51 + 27) : 56 === e3.keyCode ? o.key = s2.C0.DEL : 219 === e3.keyCode ? o.key = s2.C0.ESC : 220 === e3.keyCode ? o.key = s2.C0.FS : 221 === e3.keyCode && (o.key = s2.C0.GS);
          }
          return o;
        };
      }, 482: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Utf8ToUtf32 = t2.StringToUtf32 = t2.utf32ToString = t2.stringFromCodePoint = void 0, t2.stringFromCodePoint = function(e3) {
          return e3 > 65535 ? (e3 -= 65536, String.fromCharCode(55296 + (e3 >> 10)) + String.fromCharCode(e3 % 1024 + 56320)) : String.fromCharCode(e3);
        }, t2.utf32ToString = function(e3, t3 = 0, i2 = e3.length) {
          let s2 = "";
          for (let r = t3; r < i2; ++r) {
            let t4 = e3[r];
            t4 > 65535 ? (t4 -= 65536, s2 += String.fromCharCode(55296 + (t4 >> 10)) + String.fromCharCode(t4 % 1024 + 56320)) : s2 += String.fromCharCode(t4);
          }
          return s2;
        }, t2.StringToUtf32 = class {
          constructor() {
            this._interim = 0;
          }
          clear() {
            this._interim = 0;
          }
          decode(e3, t3) {
            const i2 = e3.length;
            if (!i2)
              return 0;
            let s2 = 0, r = 0;
            if (this._interim) {
              const i3 = e3.charCodeAt(r++);
              56320 <= i3 && i3 <= 57343 ? t3[s2++] = 1024 * (this._interim - 55296) + i3 - 56320 + 65536 : (t3[s2++] = this._interim, t3[s2++] = i3), this._interim = 0;
            }
            for (let n = r; n < i2; ++n) {
              const r2 = e3.charCodeAt(n);
              if (55296 <= r2 && r2 <= 56319) {
                if (++n >= i2)
                  return this._interim = r2, s2;
                const o = e3.charCodeAt(n);
                56320 <= o && o <= 57343 ? t3[s2++] = 1024 * (r2 - 55296) + o - 56320 + 65536 : (t3[s2++] = r2, t3[s2++] = o);
              } else
                65279 !== r2 && (t3[s2++] = r2);
            }
            return s2;
          }
        }, t2.Utf8ToUtf32 = class {
          constructor() {
            this.interim = new Uint8Array(3);
          }
          clear() {
            this.interim.fill(0);
          }
          decode(e3, t3) {
            const i2 = e3.length;
            if (!i2)
              return 0;
            let s2, r, n, o, a = 0, h = 0, c = 0;
            if (this.interim[0]) {
              let s3 = false, r2 = this.interim[0];
              r2 &= 192 == (224 & r2) ? 31 : 224 == (240 & r2) ? 15 : 7;
              let n2, o2 = 0;
              for (; (n2 = 63 & this.interim[++o2]) && o2 < 4; )
                r2 <<= 6, r2 |= n2;
              const h2 = 192 == (224 & this.interim[0]) ? 2 : 224 == (240 & this.interim[0]) ? 3 : 4, l2 = h2 - o2;
              for (; c < l2; ) {
                if (c >= i2)
                  return 0;
                if (n2 = e3[c++], 128 != (192 & n2)) {
                  c--, s3 = true;
                  break;
                }
                this.interim[o2++] = n2, r2 <<= 6, r2 |= 63 & n2;
              }
              s3 || (2 === h2 ? r2 < 128 ? c-- : t3[a++] = r2 : 3 === h2 ? r2 < 2048 || r2 >= 55296 && r2 <= 57343 || 65279 === r2 || (t3[a++] = r2) : r2 < 65536 || r2 > 1114111 || (t3[a++] = r2)), this.interim.fill(0);
            }
            const l = i2 - 4;
            let d = c;
            for (; d < i2; ) {
              for (; !(!(d < l) || 128 & (s2 = e3[d]) || 128 & (r = e3[d + 1]) || 128 & (n = e3[d + 2]) || 128 & (o = e3[d + 3])); )
                t3[a++] = s2, t3[a++] = r, t3[a++] = n, t3[a++] = o, d += 4;
              if (s2 = e3[d++], s2 < 128)
                t3[a++] = s2;
              else if (192 == (224 & s2)) {
                if (d >= i2)
                  return this.interim[0] = s2, a;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (h = (31 & s2) << 6 | 63 & r, h < 128) {
                  d--;
                  continue;
                }
                t3[a++] = h;
              } else if (224 == (240 & s2)) {
                if (d >= i2)
                  return this.interim[0] = s2, a;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (d >= i2)
                  return this.interim[0] = s2, this.interim[1] = r, a;
                if (n = e3[d++], 128 != (192 & n)) {
                  d--;
                  continue;
                }
                if (h = (15 & s2) << 12 | (63 & r) << 6 | 63 & n, h < 2048 || h >= 55296 && h <= 57343 || 65279 === h)
                  continue;
                t3[a++] = h;
              } else if (240 == (248 & s2)) {
                if (d >= i2)
                  return this.interim[0] = s2, a;
                if (r = e3[d++], 128 != (192 & r)) {
                  d--;
                  continue;
                }
                if (d >= i2)
                  return this.interim[0] = s2, this.interim[1] = r, a;
                if (n = e3[d++], 128 != (192 & n)) {
                  d--;
                  continue;
                }
                if (d >= i2)
                  return this.interim[0] = s2, this.interim[1] = r, this.interim[2] = n, a;
                if (o = e3[d++], 128 != (192 & o)) {
                  d--;
                  continue;
                }
                if (h = (7 & s2) << 18 | (63 & r) << 12 | (63 & n) << 6 | 63 & o, h < 65536 || h > 1114111)
                  continue;
                t3[a++] = h;
              }
            }
            return a;
          }
        };
      }, 225: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeV6 = void 0;
        const i2 = [[768, 879], [1155, 1158], [1160, 1161], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1536, 1539], [1552, 1557], [1611, 1630], [1648, 1648], [1750, 1764], [1767, 1768], [1770, 1773], [1807, 1807], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2305, 2306], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2388], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2672, 2673], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2883], [2893, 2893], [2902, 2902], [2946, 2946], [3008, 3008], [3021, 3021], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3393, 3395], [3405, 3405], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3769], [3771, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3984, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4146], [4150, 4151], [4153, 4153], [4184, 4185], [4448, 4607], [4959, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6157], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7616, 7626], [7678, 7679], [8203, 8207], [8234, 8238], [8288, 8291], [8298, 8303], [8400, 8431], [12330, 12335], [12441, 12442], [43014, 43014], [43019, 43019], [43045, 43046], [64286, 64286], [65024, 65039], [65056, 65059], [65279, 65279], [65529, 65531]], s2 = [[68097, 68099], [68101, 68102], [68108, 68111], [68152, 68154], [68159, 68159], [119143, 119145], [119155, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [917505, 917505], [917536, 917631], [917760, 917999]];
        let r;
        t2.UnicodeV6 = class {
          constructor() {
            if (this.version = "6", !r) {
              r = new Uint8Array(65536), r.fill(1), r[0] = 0, r.fill(0, 1, 32), r.fill(0, 127, 160), r.fill(2, 4352, 4448), r[9001] = 2, r[9002] = 2, r.fill(2, 11904, 42192), r[12351] = 1, r.fill(2, 44032, 55204), r.fill(2, 63744, 64256), r.fill(2, 65040, 65050), r.fill(2, 65072, 65136), r.fill(2, 65280, 65377), r.fill(2, 65504, 65511);
              for (let e3 = 0; e3 < i2.length; ++e3)
                r.fill(0, i2[e3][0], i2[e3][1] + 1);
            }
          }
          wcwidth(e3) {
            return e3 < 32 ? 0 : e3 < 127 ? 1 : e3 < 65536 ? r[e3] : function(e4, t3) {
              let i3, s3 = 0, r2 = t3.length - 1;
              if (e4 < t3[0][0] || e4 > t3[r2][1])
                return false;
              for (; r2 >= s3; )
                if (i3 = s3 + r2 >> 1, e4 > t3[i3][1])
                  s3 = i3 + 1;
                else {
                  if (!(e4 < t3[i3][0]))
                    return true;
                  r2 = i3 - 1;
                }
              return false;
            }(e3, s2) ? 0 : e3 >= 131072 && e3 <= 196605 || e3 >= 196608 && e3 <= 262141 ? 2 : 1;
          }
        };
      }, 5981: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.WriteBuffer = void 0;
        const s2 = i2(8460), r = i2(844);
        class n extends r.Disposable {
          constructor(e3) {
            super(), this._action = e3, this._writeBuffer = [], this._callbacks = [], this._pendingData = 0, this._bufferOffset = 0, this._isSyncWriting = false, this._syncCalls = 0, this._didUserInput = false, this._onWriteParsed = this.register(new s2.EventEmitter()), this.onWriteParsed = this._onWriteParsed.event;
          }
          handleUserInput() {
            this._didUserInput = true;
          }
          writeSync(e3, t3) {
            if (void 0 !== t3 && this._syncCalls > t3)
              return void (this._syncCalls = 0);
            if (this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(void 0), this._syncCalls++, this._isSyncWriting)
              return;
            let i3;
            for (this._isSyncWriting = true; i3 = this._writeBuffer.shift(); ) {
              this._action(i3);
              const e4 = this._callbacks.shift();
              e4 && e4();
            }
            this._pendingData = 0, this._bufferOffset = 2147483647, this._isSyncWriting = false, this._syncCalls = 0;
          }
          write(e3, t3) {
            if (this._pendingData > 5e7)
              throw new Error("write data discarded, use flow control to avoid losing data");
            if (!this._writeBuffer.length) {
              if (this._bufferOffset = 0, this._didUserInput)
                return this._didUserInput = false, this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(t3), void this._innerWrite();
              setTimeout(() => this._innerWrite());
            }
            this._pendingData += e3.length, this._writeBuffer.push(e3), this._callbacks.push(t3);
          }
          _innerWrite(e3 = 0, t3 = true) {
            const i3 = e3 || Date.now();
            for (; this._writeBuffer.length > this._bufferOffset; ) {
              const e4 = this._writeBuffer[this._bufferOffset], s3 = this._action(e4, t3);
              if (s3) {
                const e5 = (e6) => Date.now() - i3 >= 12 ? setTimeout(() => this._innerWrite(0, e6)) : this._innerWrite(i3, e6);
                return void s3.catch((e6) => (queueMicrotask(() => {
                  throw e6;
                }), Promise.resolve(false))).then(e5);
              }
              const r2 = this._callbacks[this._bufferOffset];
              if (r2 && r2(), this._bufferOffset++, this._pendingData -= e4.length, Date.now() - i3 >= 12)
                break;
            }
            this._writeBuffer.length > this._bufferOffset ? (this._bufferOffset > 50 && (this._writeBuffer = this._writeBuffer.slice(this._bufferOffset), this._callbacks = this._callbacks.slice(this._bufferOffset), this._bufferOffset = 0), setTimeout(() => this._innerWrite())) : (this._writeBuffer.length = 0, this._callbacks.length = 0, this._pendingData = 0, this._bufferOffset = 0), this._onWriteParsed.fire();
          }
        }
        t2.WriteBuffer = n;
      }, 5941: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.toRgbString = t2.parseColor = void 0;
        const i2 = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/, s2 = /^[\da-f]+$/;
        function r(e3, t3) {
          const i3 = e3.toString(16), s3 = i3.length < 2 ? "0" + i3 : i3;
          switch (t3) {
            case 4:
              return i3[0];
            case 8:
              return s3;
            case 12:
              return (s3 + s3).slice(0, 3);
            default:
              return s3 + s3;
          }
        }
        t2.parseColor = function(e3) {
          if (!e3)
            return;
          let t3 = e3.toLowerCase();
          if (0 === t3.indexOf("rgb:")) {
            t3 = t3.slice(4);
            const e4 = i2.exec(t3);
            if (e4) {
              const t4 = e4[1] ? 15 : e4[4] ? 255 : e4[7] ? 4095 : 65535;
              return [Math.round(parseInt(e4[1] || e4[4] || e4[7] || e4[10], 16) / t4 * 255), Math.round(parseInt(e4[2] || e4[5] || e4[8] || e4[11], 16) / t4 * 255), Math.round(parseInt(e4[3] || e4[6] || e4[9] || e4[12], 16) / t4 * 255)];
            }
          } else if (0 === t3.indexOf("#") && (t3 = t3.slice(1), s2.exec(t3) && [3, 6, 9, 12].includes(t3.length))) {
            const e4 = t3.length / 3, i3 = [0, 0, 0];
            for (let s3 = 0; s3 < 3; ++s3) {
              const r2 = parseInt(t3.slice(e4 * s3, e4 * s3 + e4), 16);
              i3[s3] = 1 === e4 ? r2 << 4 : 2 === e4 ? r2 : 3 === e4 ? r2 >> 4 : r2 >> 8;
            }
            return i3;
          }
        }, t2.toRgbString = function(e3, t3 = 16) {
          const [i3, s3, n] = e3;
          return `rgb:${r(i3, t3)}/${r(s3, t3)}/${r(n, t3)}`;
        };
      }, 5770: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.PAYLOAD_LIMIT = void 0, t2.PAYLOAD_LIMIT = 1e7;
      }, 6351: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DcsHandler = t2.DcsParser = void 0;
        const s2 = i2(482), r = i2(8742), n = i2(5770), o = [];
        t2.DcsParser = class {
          constructor() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._active = o, this._ident = 0, this._handlerFb = () => {
            }, this._stack = { paused: false, loopPosition: 0, fallThrough: false };
          }
          dispose() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._active = o;
          }
          registerHandler(e3, t3) {
            void 0 === this._handlers[e3] && (this._handlers[e3] = []);
            const i3 = this._handlers[e3];
            return i3.push(t3), { dispose: () => {
              const e4 = i3.indexOf(t3);
              -1 !== e4 && i3.splice(e4, 1);
            } };
          }
          clearHandler(e3) {
            this._handlers[e3] && delete this._handlers[e3];
          }
          setHandlerFallback(e3) {
            this._handlerFb = e3;
          }
          reset() {
            if (this._active.length)
              for (let e3 = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e3 >= 0; --e3)
                this._active[e3].unhook(false);
            this._stack.paused = false, this._active = o, this._ident = 0;
          }
          hook(e3, t3) {
            if (this.reset(), this._ident = e3, this._active = this._handlers[e3] || o, this._active.length)
              for (let e4 = this._active.length - 1; e4 >= 0; e4--)
                this._active[e4].hook(t3);
            else
              this._handlerFb(this._ident, "HOOK", t3);
          }
          put(e3, t3, i3) {
            if (this._active.length)
              for (let s3 = this._active.length - 1; s3 >= 0; s3--)
                this._active[s3].put(e3, t3, i3);
            else
              this._handlerFb(this._ident, "PUT", (0, s2.utf32ToString)(e3, t3, i3));
          }
          unhook(e3, t3 = true) {
            if (this._active.length) {
              let i3 = false, s3 = this._active.length - 1, r2 = false;
              if (this._stack.paused && (s3 = this._stack.loopPosition - 1, i3 = t3, r2 = this._stack.fallThrough, this._stack.paused = false), !r2 && false === i3) {
                for (; s3 >= 0 && (i3 = this._active[s3].unhook(e3), true !== i3); s3--)
                  if (i3 instanceof Promise)
                    return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = false, i3;
                s3--;
              }
              for (; s3 >= 0; s3--)
                if (i3 = this._active[s3].unhook(false), i3 instanceof Promise)
                  return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = true, i3;
            } else
              this._handlerFb(this._ident, "UNHOOK", e3);
            this._active = o, this._ident = 0;
          }
        };
        const a = new r.Params();
        a.addParam(0), t2.DcsHandler = class {
          constructor(e3) {
            this._handler = e3, this._data = "", this._params = a, this._hitLimit = false;
          }
          hook(e3) {
            this._params = e3.length > 1 || e3.params[0] ? e3.clone() : a, this._data = "", this._hitLimit = false;
          }
          put(e3, t3, i3) {
            this._hitLimit || (this._data += (0, s2.utf32ToString)(e3, t3, i3), this._data.length > n.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = true));
          }
          unhook(e3) {
            let t3 = false;
            if (this._hitLimit)
              t3 = false;
            else if (e3 && (t3 = this._handler(this._data, this._params), t3 instanceof Promise))
              return t3.then((e4) => (this._params = a, this._data = "", this._hitLimit = false, e4));
            return this._params = a, this._data = "", this._hitLimit = false, t3;
          }
        };
      }, 2015: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.EscapeSequenceParser = t2.VT500_TRANSITION_TABLE = t2.TransitionTable = void 0;
        const s2 = i2(844), r = i2(8742), n = i2(6242), o = i2(6351);
        class a {
          constructor(e3) {
            this.table = new Uint8Array(e3);
          }
          setDefault(e3, t3) {
            this.table.fill(e3 << 4 | t3);
          }
          add(e3, t3, i3, s3) {
            this.table[t3 << 8 | e3] = i3 << 4 | s3;
          }
          addMany(e3, t3, i3, s3) {
            for (let r2 = 0; r2 < e3.length; r2++)
              this.table[t3 << 8 | e3[r2]] = i3 << 4 | s3;
          }
        }
        t2.TransitionTable = a;
        const h = 160;
        t2.VT500_TRANSITION_TABLE = function() {
          const e3 = new a(4095), t3 = Array.apply(null, Array(256)).map((e4, t4) => t4), i3 = (e4, i4) => t3.slice(e4, i4), s3 = i3(32, 127), r2 = i3(0, 24);
          r2.push(25), r2.push.apply(r2, i3(28, 32));
          const n2 = i3(0, 14);
          let o2;
          for (o2 in e3.setDefault(1, 0), e3.addMany(s3, 0, 2, 0), n2)
            e3.addMany([24, 26, 153, 154], o2, 3, 0), e3.addMany(i3(128, 144), o2, 3, 0), e3.addMany(i3(144, 152), o2, 3, 0), e3.add(156, o2, 0, 0), e3.add(27, o2, 11, 1), e3.add(157, o2, 4, 8), e3.addMany([152, 158, 159], o2, 0, 7), e3.add(155, o2, 11, 3), e3.add(144, o2, 11, 9);
          return e3.addMany(r2, 0, 3, 0), e3.addMany(r2, 1, 3, 1), e3.add(127, 1, 0, 1), e3.addMany(r2, 8, 0, 8), e3.addMany(r2, 3, 3, 3), e3.add(127, 3, 0, 3), e3.addMany(r2, 4, 3, 4), e3.add(127, 4, 0, 4), e3.addMany(r2, 6, 3, 6), e3.addMany(r2, 5, 3, 5), e3.add(127, 5, 0, 5), e3.addMany(r2, 2, 3, 2), e3.add(127, 2, 0, 2), e3.add(93, 1, 4, 8), e3.addMany(s3, 8, 5, 8), e3.add(127, 8, 5, 8), e3.addMany([156, 27, 24, 26, 7], 8, 6, 0), e3.addMany(i3(28, 32), 8, 0, 8), e3.addMany([88, 94, 95], 1, 0, 7), e3.addMany(s3, 7, 0, 7), e3.addMany(r2, 7, 0, 7), e3.add(156, 7, 0, 0), e3.add(127, 7, 0, 7), e3.add(91, 1, 11, 3), e3.addMany(i3(64, 127), 3, 7, 0), e3.addMany(i3(48, 60), 3, 8, 4), e3.addMany([60, 61, 62, 63], 3, 9, 4), e3.addMany(i3(48, 60), 4, 8, 4), e3.addMany(i3(64, 127), 4, 7, 0), e3.addMany([60, 61, 62, 63], 4, 0, 6), e3.addMany(i3(32, 64), 6, 0, 6), e3.add(127, 6, 0, 6), e3.addMany(i3(64, 127), 6, 0, 0), e3.addMany(i3(32, 48), 3, 9, 5), e3.addMany(i3(32, 48), 5, 9, 5), e3.addMany(i3(48, 64), 5, 0, 6), e3.addMany(i3(64, 127), 5, 7, 0), e3.addMany(i3(32, 48), 4, 9, 5), e3.addMany(i3(32, 48), 1, 9, 2), e3.addMany(i3(32, 48), 2, 9, 2), e3.addMany(i3(48, 127), 2, 10, 0), e3.addMany(i3(48, 80), 1, 10, 0), e3.addMany(i3(81, 88), 1, 10, 0), e3.addMany([89, 90, 92], 1, 10, 0), e3.addMany(i3(96, 127), 1, 10, 0), e3.add(80, 1, 11, 9), e3.addMany(r2, 9, 0, 9), e3.add(127, 9, 0, 9), e3.addMany(i3(28, 32), 9, 0, 9), e3.addMany(i3(32, 48), 9, 9, 12), e3.addMany(i3(48, 60), 9, 8, 10), e3.addMany([60, 61, 62, 63], 9, 9, 10), e3.addMany(r2, 11, 0, 11), e3.addMany(i3(32, 128), 11, 0, 11), e3.addMany(i3(28, 32), 11, 0, 11), e3.addMany(r2, 10, 0, 10), e3.add(127, 10, 0, 10), e3.addMany(i3(28, 32), 10, 0, 10), e3.addMany(i3(48, 60), 10, 8, 10), e3.addMany([60, 61, 62, 63], 10, 0, 11), e3.addMany(i3(32, 48), 10, 9, 12), e3.addMany(r2, 12, 0, 12), e3.add(127, 12, 0, 12), e3.addMany(i3(28, 32), 12, 0, 12), e3.addMany(i3(32, 48), 12, 9, 12), e3.addMany(i3(48, 64), 12, 0, 11), e3.addMany(i3(64, 127), 12, 12, 13), e3.addMany(i3(64, 127), 10, 12, 13), e3.addMany(i3(64, 127), 9, 12, 13), e3.addMany(r2, 13, 13, 13), e3.addMany(s3, 13, 13, 13), e3.add(127, 13, 0, 13), e3.addMany([27, 156, 24, 26], 13, 14, 0), e3.add(h, 0, 2, 0), e3.add(h, 8, 5, 8), e3.add(h, 6, 0, 6), e3.add(h, 11, 0, 11), e3.add(h, 13, 13, 13), e3;
        }();
        class c extends s2.Disposable {
          constructor(e3 = t2.VT500_TRANSITION_TABLE) {
            super(), this._transitions = e3, this._parseStack = { state: 0, handlers: [], handlerPos: 0, transition: 0, chunkPos: 0 }, this.initialState = 0, this.currentState = this.initialState, this._params = new r.Params(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0, this._printHandlerFb = (e4, t3, i3) => {
            }, this._executeHandlerFb = (e4) => {
            }, this._csiHandlerFb = (e4, t3) => {
            }, this._escHandlerFb = (e4) => {
            }, this._errorHandlerFb = (e4) => e4, this._printHandler = this._printHandlerFb, this._executeHandlers = /* @__PURE__ */ Object.create(null), this._csiHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null), this.register((0, s2.toDisposable)(() => {
              this._csiHandlers = /* @__PURE__ */ Object.create(null), this._executeHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null);
            })), this._oscParser = this.register(new n.OscParser()), this._dcsParser = this.register(new o.DcsParser()), this._errorHandler = this._errorHandlerFb, this.registerEscHandler({ final: "\\" }, () => true);
          }
          _identifier(e3, t3 = [64, 126]) {
            let i3 = 0;
            if (e3.prefix) {
              if (e3.prefix.length > 1)
                throw new Error("only one byte as prefix supported");
              if (i3 = e3.prefix.charCodeAt(0), i3 && 60 > i3 || i3 > 63)
                throw new Error("prefix must be in range 0x3c .. 0x3f");
            }
            if (e3.intermediates) {
              if (e3.intermediates.length > 2)
                throw new Error("only two bytes as intermediates are supported");
              for (let t4 = 0; t4 < e3.intermediates.length; ++t4) {
                const s4 = e3.intermediates.charCodeAt(t4);
                if (32 > s4 || s4 > 47)
                  throw new Error("intermediate must be in range 0x20 .. 0x2f");
                i3 <<= 8, i3 |= s4;
              }
            }
            if (1 !== e3.final.length)
              throw new Error("final must be a single byte");
            const s3 = e3.final.charCodeAt(0);
            if (t3[0] > s3 || s3 > t3[1])
              throw new Error(`final must be in range ${t3[0]} .. ${t3[1]}`);
            return i3 <<= 8, i3 |= s3, i3;
          }
          identToString(e3) {
            const t3 = [];
            for (; e3; )
              t3.push(String.fromCharCode(255 & e3)), e3 >>= 8;
            return t3.reverse().join("");
          }
          setPrintHandler(e3) {
            this._printHandler = e3;
          }
          clearPrintHandler() {
            this._printHandler = this._printHandlerFb;
          }
          registerEscHandler(e3, t3) {
            const i3 = this._identifier(e3, [48, 126]);
            void 0 === this._escHandlers[i3] && (this._escHandlers[i3] = []);
            const s3 = this._escHandlers[i3];
            return s3.push(t3), { dispose: () => {
              const e4 = s3.indexOf(t3);
              -1 !== e4 && s3.splice(e4, 1);
            } };
          }
          clearEscHandler(e3) {
            this._escHandlers[this._identifier(e3, [48, 126])] && delete this._escHandlers[this._identifier(e3, [48, 126])];
          }
          setEscHandlerFallback(e3) {
            this._escHandlerFb = e3;
          }
          setExecuteHandler(e3, t3) {
            this._executeHandlers[e3.charCodeAt(0)] = t3;
          }
          clearExecuteHandler(e3) {
            this._executeHandlers[e3.charCodeAt(0)] && delete this._executeHandlers[e3.charCodeAt(0)];
          }
          setExecuteHandlerFallback(e3) {
            this._executeHandlerFb = e3;
          }
          registerCsiHandler(e3, t3) {
            const i3 = this._identifier(e3);
            void 0 === this._csiHandlers[i3] && (this._csiHandlers[i3] = []);
            const s3 = this._csiHandlers[i3];
            return s3.push(t3), { dispose: () => {
              const e4 = s3.indexOf(t3);
              -1 !== e4 && s3.splice(e4, 1);
            } };
          }
          clearCsiHandler(e3) {
            this._csiHandlers[this._identifier(e3)] && delete this._csiHandlers[this._identifier(e3)];
          }
          setCsiHandlerFallback(e3) {
            this._csiHandlerFb = e3;
          }
          registerDcsHandler(e3, t3) {
            return this._dcsParser.registerHandler(this._identifier(e3), t3);
          }
          clearDcsHandler(e3) {
            this._dcsParser.clearHandler(this._identifier(e3));
          }
          setDcsHandlerFallback(e3) {
            this._dcsParser.setHandlerFallback(e3);
          }
          registerOscHandler(e3, t3) {
            return this._oscParser.registerHandler(e3, t3);
          }
          clearOscHandler(e3) {
            this._oscParser.clearHandler(e3);
          }
          setOscHandlerFallback(e3) {
            this._oscParser.setHandlerFallback(e3);
          }
          setErrorHandler(e3) {
            this._errorHandler = e3;
          }
          clearErrorHandler() {
            this._errorHandler = this._errorHandlerFb;
          }
          reset() {
            this.currentState = this.initialState, this._oscParser.reset(), this._dcsParser.reset(), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0, 0 !== this._parseStack.state && (this._parseStack.state = 2, this._parseStack.handlers = []);
          }
          _preserveStack(e3, t3, i3, s3, r2) {
            this._parseStack.state = e3, this._parseStack.handlers = t3, this._parseStack.handlerPos = i3, this._parseStack.transition = s3, this._parseStack.chunkPos = r2;
          }
          parse(e3, t3, i3) {
            let s3, r2 = 0, n2 = 0, o2 = 0;
            if (this._parseStack.state)
              if (2 === this._parseStack.state)
                this._parseStack.state = 0, o2 = this._parseStack.chunkPos + 1;
              else {
                if (void 0 === i3 || 1 === this._parseStack.state)
                  throw this._parseStack.state = 1, new Error("improper continuation due to previous async handler, giving up parsing");
                const t4 = this._parseStack.handlers;
                let n3 = this._parseStack.handlerPos - 1;
                switch (this._parseStack.state) {
                  case 3:
                    if (false === i3 && n3 > -1) {
                      for (; n3 >= 0 && (s3 = t4[n3](this._params), true !== s3); n3--)
                        if (s3 instanceof Promise)
                          return this._parseStack.handlerPos = n3, s3;
                    }
                    this._parseStack.handlers = [];
                    break;
                  case 4:
                    if (false === i3 && n3 > -1) {
                      for (; n3 >= 0 && (s3 = t4[n3](), true !== s3); n3--)
                        if (s3 instanceof Promise)
                          return this._parseStack.handlerPos = n3, s3;
                    }
                    this._parseStack.handlers = [];
                    break;
                  case 6:
                    if (r2 = e3[this._parseStack.chunkPos], s3 = this._dcsParser.unhook(24 !== r2 && 26 !== r2, i3), s3)
                      return s3;
                    27 === r2 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
                    break;
                  case 5:
                    if (r2 = e3[this._parseStack.chunkPos], s3 = this._oscParser.end(24 !== r2 && 26 !== r2, i3), s3)
                      return s3;
                    27 === r2 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
                }
                this._parseStack.state = 0, o2 = this._parseStack.chunkPos + 1, this.precedingCodepoint = 0, this.currentState = 15 & this._parseStack.transition;
              }
            for (let i4 = o2; i4 < t3; ++i4) {
              switch (r2 = e3[i4], n2 = this._transitions.table[this.currentState << 8 | (r2 < 160 ? r2 : h)], n2 >> 4) {
                case 2:
                  for (let s4 = i4 + 1; ; ++s4) {
                    if (s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                    if (++s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 126 && r2 < h) {
                      this._printHandler(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                  }
                  break;
                case 3:
                  this._executeHandlers[r2] ? this._executeHandlers[r2]() : this._executeHandlerFb(r2), this.precedingCodepoint = 0;
                  break;
                case 0:
                  break;
                case 1:
                  if (this._errorHandler({ position: i4, code: r2, currentState: this.currentState, collect: this._collect, params: this._params, abort: false }).abort)
                    return;
                  break;
                case 7:
                  const o3 = this._csiHandlers[this._collect << 8 | r2];
                  let a2 = o3 ? o3.length - 1 : -1;
                  for (; a2 >= 0 && (s3 = o3[a2](this._params), true !== s3); a2--)
                    if (s3 instanceof Promise)
                      return this._preserveStack(3, o3, a2, n2, i4), s3;
                  a2 < 0 && this._csiHandlerFb(this._collect << 8 | r2, this._params), this.precedingCodepoint = 0;
                  break;
                case 8:
                  do {
                    switch (r2) {
                      case 59:
                        this._params.addParam(0);
                        break;
                      case 58:
                        this._params.addSubParam(-1);
                        break;
                      default:
                        this._params.addDigit(r2 - 48);
                    }
                  } while (++i4 < t3 && (r2 = e3[i4]) > 47 && r2 < 60);
                  i4--;
                  break;
                case 9:
                  this._collect <<= 8, this._collect |= r2;
                  break;
                case 10:
                  const c2 = this._escHandlers[this._collect << 8 | r2];
                  let l = c2 ? c2.length - 1 : -1;
                  for (; l >= 0 && (s3 = c2[l](), true !== s3); l--)
                    if (s3 instanceof Promise)
                      return this._preserveStack(4, c2, l, n2, i4), s3;
                  l < 0 && this._escHandlerFb(this._collect << 8 | r2), this.precedingCodepoint = 0;
                  break;
                case 11:
                  this._params.reset(), this._params.addParam(0), this._collect = 0;
                  break;
                case 12:
                  this._dcsParser.hook(this._collect << 8 | r2, this._params);
                  break;
                case 13:
                  for (let s4 = i4 + 1; ; ++s4)
                    if (s4 >= t3 || 24 === (r2 = e3[s4]) || 26 === r2 || 27 === r2 || r2 > 127 && r2 < h) {
                      this._dcsParser.put(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                  break;
                case 14:
                  if (s3 = this._dcsParser.unhook(24 !== r2 && 26 !== r2), s3)
                    return this._preserveStack(6, [], 0, n2, i4), s3;
                  27 === r2 && (n2 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0;
                  break;
                case 4:
                  this._oscParser.start();
                  break;
                case 5:
                  for (let s4 = i4 + 1; ; s4++)
                    if (s4 >= t3 || (r2 = e3[s4]) < 32 || r2 > 127 && r2 < h) {
                      this._oscParser.put(e3, i4, s4), i4 = s4 - 1;
                      break;
                    }
                  break;
                case 6:
                  if (s3 = this._oscParser.end(24 !== r2 && 26 !== r2), s3)
                    return this._preserveStack(5, [], 0, n2, i4), s3;
                  27 === r2 && (n2 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingCodepoint = 0;
              }
              this.currentState = 15 & n2;
            }
          }
        }
        t2.EscapeSequenceParser = c;
      }, 6242: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscHandler = t2.OscParser = void 0;
        const s2 = i2(5770), r = i2(482), n = [];
        t2.OscParser = class {
          constructor() {
            this._state = 0, this._active = n, this._id = -1, this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._stack = { paused: false, loopPosition: 0, fallThrough: false };
          }
          registerHandler(e3, t3) {
            void 0 === this._handlers[e3] && (this._handlers[e3] = []);
            const i3 = this._handlers[e3];
            return i3.push(t3), { dispose: () => {
              const e4 = i3.indexOf(t3);
              -1 !== e4 && i3.splice(e4, 1);
            } };
          }
          clearHandler(e3) {
            this._handlers[e3] && delete this._handlers[e3];
          }
          setHandlerFallback(e3) {
            this._handlerFb = e3;
          }
          dispose() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._active = n;
          }
          reset() {
            if (2 === this._state)
              for (let e3 = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e3 >= 0; --e3)
                this._active[e3].end(false);
            this._stack.paused = false, this._active = n, this._id = -1, this._state = 0;
          }
          _start() {
            if (this._active = this._handlers[this._id] || n, this._active.length)
              for (let e3 = this._active.length - 1; e3 >= 0; e3--)
                this._active[e3].start();
            else
              this._handlerFb(this._id, "START");
          }
          _put(e3, t3, i3) {
            if (this._active.length)
              for (let s3 = this._active.length - 1; s3 >= 0; s3--)
                this._active[s3].put(e3, t3, i3);
            else
              this._handlerFb(this._id, "PUT", (0, r.utf32ToString)(e3, t3, i3));
          }
          start() {
            this.reset(), this._state = 1;
          }
          put(e3, t3, i3) {
            if (3 !== this._state) {
              if (1 === this._state)
                for (; t3 < i3; ) {
                  const i4 = e3[t3++];
                  if (59 === i4) {
                    this._state = 2, this._start();
                    break;
                  }
                  if (i4 < 48 || 57 < i4)
                    return void (this._state = 3);
                  -1 === this._id && (this._id = 0), this._id = 10 * this._id + i4 - 48;
                }
              2 === this._state && i3 - t3 > 0 && this._put(e3, t3, i3);
            }
          }
          end(e3, t3 = true) {
            if (0 !== this._state) {
              if (3 !== this._state)
                if (1 === this._state && this._start(), this._active.length) {
                  let i3 = false, s3 = this._active.length - 1, r2 = false;
                  if (this._stack.paused && (s3 = this._stack.loopPosition - 1, i3 = t3, r2 = this._stack.fallThrough, this._stack.paused = false), !r2 && false === i3) {
                    for (; s3 >= 0 && (i3 = this._active[s3].end(e3), true !== i3); s3--)
                      if (i3 instanceof Promise)
                        return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = false, i3;
                    s3--;
                  }
                  for (; s3 >= 0; s3--)
                    if (i3 = this._active[s3].end(false), i3 instanceof Promise)
                      return this._stack.paused = true, this._stack.loopPosition = s3, this._stack.fallThrough = true, i3;
                } else
                  this._handlerFb(this._id, "END", e3);
              this._active = n, this._id = -1, this._state = 0;
            }
          }
        }, t2.OscHandler = class {
          constructor(e3) {
            this._handler = e3, this._data = "", this._hitLimit = false;
          }
          start() {
            this._data = "", this._hitLimit = false;
          }
          put(e3, t3, i3) {
            this._hitLimit || (this._data += (0, r.utf32ToString)(e3, t3, i3), this._data.length > s2.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = true));
          }
          end(e3) {
            let t3 = false;
            if (this._hitLimit)
              t3 = false;
            else if (e3 && (t3 = this._handler(this._data), t3 instanceof Promise))
              return t3.then((e4) => (this._data = "", this._hitLimit = false, e4));
            return this._data = "", this._hitLimit = false, t3;
          }
        };
      }, 8742: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.Params = void 0;
        const i2 = 2147483647;
        class s2 {
          static fromArray(e3) {
            const t3 = new s2();
            if (!e3.length)
              return t3;
            for (let i3 = Array.isArray(e3[0]) ? 1 : 0; i3 < e3.length; ++i3) {
              const s3 = e3[i3];
              if (Array.isArray(s3))
                for (let e4 = 0; e4 < s3.length; ++e4)
                  t3.addSubParam(s3[e4]);
              else
                t3.addParam(s3);
            }
            return t3;
          }
          constructor(e3 = 32, t3 = 32) {
            if (this.maxLength = e3, this.maxSubParamsLength = t3, t3 > 256)
              throw new Error("maxSubParamsLength must not be greater than 256");
            this.params = new Int32Array(e3), this.length = 0, this._subParams = new Int32Array(t3), this._subParamsLength = 0, this._subParamsIdx = new Uint16Array(e3), this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
          }
          clone() {
            const e3 = new s2(this.maxLength, this.maxSubParamsLength);
            return e3.params.set(this.params), e3.length = this.length, e3._subParams.set(this._subParams), e3._subParamsLength = this._subParamsLength, e3._subParamsIdx.set(this._subParamsIdx), e3._rejectDigits = this._rejectDigits, e3._rejectSubDigits = this._rejectSubDigits, e3._digitIsSub = this._digitIsSub, e3;
          }
          toArray() {
            const e3 = [];
            for (let t3 = 0; t3 < this.length; ++t3) {
              e3.push(this.params[t3]);
              const i3 = this._subParamsIdx[t3] >> 8, s3 = 255 & this._subParamsIdx[t3];
              s3 - i3 > 0 && e3.push(Array.prototype.slice.call(this._subParams, i3, s3));
            }
            return e3;
          }
          reset() {
            this.length = 0, this._subParamsLength = 0, this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
          }
          addParam(e3) {
            if (this._digitIsSub = false, this.length >= this.maxLength)
              this._rejectDigits = true;
            else {
              if (e3 < -1)
                throw new Error("values lesser than -1 are not allowed");
              this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength, this.params[this.length++] = e3 > i2 ? i2 : e3;
            }
          }
          addSubParam(e3) {
            if (this._digitIsSub = true, this.length)
              if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength)
                this._rejectSubDigits = true;
              else {
                if (e3 < -1)
                  throw new Error("values lesser than -1 are not allowed");
                this._subParams[this._subParamsLength++] = e3 > i2 ? i2 : e3, this._subParamsIdx[this.length - 1]++;
              }
          }
          hasSubParams(e3) {
            return (255 & this._subParamsIdx[e3]) - (this._subParamsIdx[e3] >> 8) > 0;
          }
          getSubParams(e3) {
            const t3 = this._subParamsIdx[e3] >> 8, i3 = 255 & this._subParamsIdx[e3];
            return i3 - t3 > 0 ? this._subParams.subarray(t3, i3) : null;
          }
          getSubParamsAll() {
            const e3 = {};
            for (let t3 = 0; t3 < this.length; ++t3) {
              const i3 = this._subParamsIdx[t3] >> 8, s3 = 255 & this._subParamsIdx[t3];
              s3 - i3 > 0 && (e3[t3] = this._subParams.slice(i3, s3));
            }
            return e3;
          }
          addDigit(e3) {
            let t3;
            if (this._rejectDigits || !(t3 = this._digitIsSub ? this._subParamsLength : this.length) || this._digitIsSub && this._rejectSubDigits)
              return;
            const s3 = this._digitIsSub ? this._subParams : this.params, r = s3[t3 - 1];
            s3[t3 - 1] = ~r ? Math.min(10 * r + e3, i2) : e3;
          }
        }
        t2.Params = s2;
      }, 5741: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.AddonManager = void 0, t2.AddonManager = class {
          constructor() {
            this._addons = [];
          }
          dispose() {
            for (let e3 = this._addons.length - 1; e3 >= 0; e3--)
              this._addons[e3].instance.dispose();
          }
          loadAddon(e3, t3) {
            const i2 = { instance: t3, dispose: t3.dispose, isDisposed: false };
            this._addons.push(i2), t3.dispose = () => this._wrappedAddonDispose(i2), t3.activate(e3);
          }
          _wrappedAddonDispose(e3) {
            if (e3.isDisposed)
              return;
            let t3 = -1;
            for (let i2 = 0; i2 < this._addons.length; i2++)
              if (this._addons[i2] === e3) {
                t3 = i2;
                break;
              }
            if (-1 === t3)
              throw new Error("Could not dispose an addon that has not been loaded");
            e3.isDisposed = true, e3.dispose.apply(e3.instance), this._addons.splice(t3, 1);
          }
        };
      }, 8771: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferApiView = void 0;
        const s2 = i2(3785), r = i2(511);
        t2.BufferApiView = class {
          constructor(e3, t3) {
            this._buffer = e3, this.type = t3;
          }
          init(e3) {
            return this._buffer = e3, this;
          }
          get cursorY() {
            return this._buffer.y;
          }
          get cursorX() {
            return this._buffer.x;
          }
          get viewportY() {
            return this._buffer.ydisp;
          }
          get baseY() {
            return this._buffer.ybase;
          }
          get length() {
            return this._buffer.lines.length;
          }
          getLine(e3) {
            const t3 = this._buffer.lines.get(e3);
            if (t3)
              return new s2.BufferLineApiView(t3);
          }
          getNullCell() {
            return new r.CellData();
          }
        };
      }, 3785: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferLineApiView = void 0;
        const s2 = i2(511);
        t2.BufferLineApiView = class {
          constructor(e3) {
            this._line = e3;
          }
          get isWrapped() {
            return this._line.isWrapped;
          }
          get length() {
            return this._line.length;
          }
          getCell(e3, t3) {
            if (!(e3 < 0 || e3 >= this._line.length))
              return t3 ? (this._line.loadCell(e3, t3), t3) : this._line.loadCell(e3, new s2.CellData());
          }
          translateToString(e3, t3, i3) {
            return this._line.translateToString(e3, t3, i3);
          }
        };
      }, 8285: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferNamespaceApi = void 0;
        const s2 = i2(8771), r = i2(8460), n = i2(844);
        class o extends n.Disposable {
          constructor(e3) {
            super(), this._core = e3, this._onBufferChange = this.register(new r.EventEmitter()), this.onBufferChange = this._onBufferChange.event, this._normal = new s2.BufferApiView(this._core.buffers.normal, "normal"), this._alternate = new s2.BufferApiView(this._core.buffers.alt, "alternate"), this._core.buffers.onBufferActivate(() => this._onBufferChange.fire(this.active));
          }
          get active() {
            if (this._core.buffers.active === this._core.buffers.normal)
              return this.normal;
            if (this._core.buffers.active === this._core.buffers.alt)
              return this.alternate;
            throw new Error("Active buffer is neither normal nor alternate");
          }
          get normal() {
            return this._normal.init(this._core.buffers.normal);
          }
          get alternate() {
            return this._alternate.init(this._core.buffers.alt);
          }
        }
        t2.BufferNamespaceApi = o;
      }, 7975: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.ParserApi = void 0, t2.ParserApi = class {
          constructor(e3) {
            this._core = e3;
          }
          registerCsiHandler(e3, t3) {
            return this._core.registerCsiHandler(e3, (e4) => t3(e4.toArray()));
          }
          addCsiHandler(e3, t3) {
            return this.registerCsiHandler(e3, t3);
          }
          registerDcsHandler(e3, t3) {
            return this._core.registerDcsHandler(e3, (e4, i2) => t3(e4, i2.toArray()));
          }
          addDcsHandler(e3, t3) {
            return this.registerDcsHandler(e3, t3);
          }
          registerEscHandler(e3, t3) {
            return this._core.registerEscHandler(e3, t3);
          }
          addEscHandler(e3, t3) {
            return this.registerEscHandler(e3, t3);
          }
          registerOscHandler(e3, t3) {
            return this._core.registerOscHandler(e3, t3);
          }
          addOscHandler(e3, t3) {
            return this.registerOscHandler(e3, t3);
          }
        };
      }, 7090: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeApi = void 0, t2.UnicodeApi = class {
          constructor(e3) {
            this._core = e3;
          }
          register(e3) {
            this._core.unicodeService.register(e3);
          }
          get versions() {
            return this._core.unicodeService.versions;
          }
          get activeVersion() {
            return this._core.unicodeService.activeVersion;
          }
          set activeVersion(e3) {
            this._core.unicodeService.activeVersion = e3;
          }
        };
      }, 744: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.BufferService = t2.MINIMUM_ROWS = t2.MINIMUM_COLS = void 0;
        const n = i2(8460), o = i2(844), a = i2(5295), h = i2(2585);
        t2.MINIMUM_COLS = 2, t2.MINIMUM_ROWS = 1;
        let c = t2.BufferService = class extends o.Disposable {
          get buffer() {
            return this.buffers.active;
          }
          constructor(e3) {
            super(), this.isUserScrolling = false, this._onResize = this.register(new n.EventEmitter()), this.onResize = this._onResize.event, this._onScroll = this.register(new n.EventEmitter()), this.onScroll = this._onScroll.event, this.cols = Math.max(e3.rawOptions.cols || 0, t2.MINIMUM_COLS), this.rows = Math.max(e3.rawOptions.rows || 0, t2.MINIMUM_ROWS), this.buffers = this.register(new a.BufferSet(e3, this));
          }
          resize(e3, t3) {
            this.cols = e3, this.rows = t3, this.buffers.resize(e3, t3), this._onResize.fire({ cols: e3, rows: t3 });
          }
          reset() {
            this.buffers.reset(), this.isUserScrolling = false;
          }
          scroll(e3, t3 = false) {
            const i3 = this.buffer;
            let s3;
            s3 = this._cachedBlankLine, s3 && s3.length === this.cols && s3.getFg(0) === e3.fg && s3.getBg(0) === e3.bg || (s3 = i3.getBlankLine(e3, t3), this._cachedBlankLine = s3), s3.isWrapped = t3;
            const r2 = i3.ybase + i3.scrollTop, n2 = i3.ybase + i3.scrollBottom;
            if (0 === i3.scrollTop) {
              const e4 = i3.lines.isFull;
              n2 === i3.lines.length - 1 ? e4 ? i3.lines.recycle().copyFrom(s3) : i3.lines.push(s3.clone()) : i3.lines.splice(n2 + 1, 0, s3.clone()), e4 ? this.isUserScrolling && (i3.ydisp = Math.max(i3.ydisp - 1, 0)) : (i3.ybase++, this.isUserScrolling || i3.ydisp++);
            } else {
              const e4 = n2 - r2 + 1;
              i3.lines.shiftElements(r2 + 1, e4 - 1, -1), i3.lines.set(n2, s3.clone());
            }
            this.isUserScrolling || (i3.ydisp = i3.ybase), this._onScroll.fire(i3.ydisp);
          }
          scrollLines(e3, t3, i3) {
            const s3 = this.buffer;
            if (e3 < 0) {
              if (0 === s3.ydisp)
                return;
              this.isUserScrolling = true;
            } else
              e3 + s3.ydisp >= s3.ybase && (this.isUserScrolling = false);
            const r2 = s3.ydisp;
            s3.ydisp = Math.max(Math.min(s3.ydisp + e3, s3.ybase), 0), r2 !== s3.ydisp && (t3 || this._onScroll.fire(s3.ydisp));
          }
        };
        t2.BufferService = c = s2([r(0, h.IOptionsService)], c);
      }, 7994: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CharsetService = void 0, t2.CharsetService = class {
          constructor() {
            this.glevel = 0, this._charsets = [];
          }
          reset() {
            this.charset = void 0, this._charsets = [], this.glevel = 0;
          }
          setgLevel(e3) {
            this.glevel = e3, this.charset = this._charsets[e3];
          }
          setgCharset(e3, t3) {
            this._charsets[e3] = t3, this.glevel === e3 && (this.charset = t3);
          }
        };
      }, 1753: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreMouseService = void 0;
        const n = i2(2585), o = i2(8460), a = i2(844), h = { NONE: { events: 0, restrict: () => false }, X10: { events: 1, restrict: (e3) => 4 !== e3.button && 1 === e3.action && (e3.ctrl = false, e3.alt = false, e3.shift = false, true) }, VT200: { events: 19, restrict: (e3) => 32 !== e3.action }, DRAG: { events: 23, restrict: (e3) => 32 !== e3.action || 3 !== e3.button }, ANY: { events: 31, restrict: (e3) => true } };
        function c(e3, t3) {
          let i3 = (e3.ctrl ? 16 : 0) | (e3.shift ? 4 : 0) | (e3.alt ? 8 : 0);
          return 4 === e3.button ? (i3 |= 64, i3 |= e3.action) : (i3 |= 3 & e3.button, 4 & e3.button && (i3 |= 64), 8 & e3.button && (i3 |= 128), 32 === e3.action ? i3 |= 32 : 0 !== e3.action || t3 || (i3 |= 3)), i3;
        }
        const l = String.fromCharCode, d = { DEFAULT: (e3) => {
          const t3 = [c(e3, false) + 32, e3.col + 32, e3.row + 32];
          return t3[0] > 255 || t3[1] > 255 || t3[2] > 255 ? "" : `\x1B[M${l(t3[0])}${l(t3[1])}${l(t3[2])}`;
        }, SGR: (e3) => {
          const t3 = 0 === e3.action && 4 !== e3.button ? "m" : "M";
          return `\x1B[<${c(e3, true)};${e3.col};${e3.row}${t3}`;
        }, SGR_PIXELS: (e3) => {
          const t3 = 0 === e3.action && 4 !== e3.button ? "m" : "M";
          return `\x1B[<${c(e3, true)};${e3.x};${e3.y}${t3}`;
        } };
        let _ = t2.CoreMouseService = class extends a.Disposable {
          constructor(e3, t3) {
            super(), this._bufferService = e3, this._coreService = t3, this._protocols = {}, this._encodings = {}, this._activeProtocol = "", this._activeEncoding = "", this._lastEvent = null, this._onProtocolChange = this.register(new o.EventEmitter()), this.onProtocolChange = this._onProtocolChange.event;
            for (const e4 of Object.keys(h))
              this.addProtocol(e4, h[e4]);
            for (const e4 of Object.keys(d))
              this.addEncoding(e4, d[e4]);
            this.reset();
          }
          addProtocol(e3, t3) {
            this._protocols[e3] = t3;
          }
          addEncoding(e3, t3) {
            this._encodings[e3] = t3;
          }
          get activeProtocol() {
            return this._activeProtocol;
          }
          get areMouseEventsActive() {
            return 0 !== this._protocols[this._activeProtocol].events;
          }
          set activeProtocol(e3) {
            if (!this._protocols[e3])
              throw new Error(`unknown protocol "${e3}"`);
            this._activeProtocol = e3, this._onProtocolChange.fire(this._protocols[e3].events);
          }
          get activeEncoding() {
            return this._activeEncoding;
          }
          set activeEncoding(e3) {
            if (!this._encodings[e3])
              throw new Error(`unknown encoding "${e3}"`);
            this._activeEncoding = e3;
          }
          reset() {
            this.activeProtocol = "NONE", this.activeEncoding = "DEFAULT", this._lastEvent = null;
          }
          triggerMouseEvent(e3) {
            if (e3.col < 0 || e3.col >= this._bufferService.cols || e3.row < 0 || e3.row >= this._bufferService.rows)
              return false;
            if (4 === e3.button && 32 === e3.action)
              return false;
            if (3 === e3.button && 32 !== e3.action)
              return false;
            if (4 !== e3.button && (2 === e3.action || 3 === e3.action))
              return false;
            if (e3.col++, e3.row++, 32 === e3.action && this._lastEvent && this._equalEvents(this._lastEvent, e3, "SGR_PIXELS" === this._activeEncoding))
              return false;
            if (!this._protocols[this._activeProtocol].restrict(e3))
              return false;
            const t3 = this._encodings[this._activeEncoding](e3);
            return t3 && ("DEFAULT" === this._activeEncoding ? this._coreService.triggerBinaryEvent(t3) : this._coreService.triggerDataEvent(t3, true)), this._lastEvent = e3, true;
          }
          explainEvents(e3) {
            return { down: !!(1 & e3), up: !!(2 & e3), drag: !!(4 & e3), move: !!(8 & e3), wheel: !!(16 & e3) };
          }
          _equalEvents(e3, t3, i3) {
            if (i3) {
              if (e3.x !== t3.x)
                return false;
              if (e3.y !== t3.y)
                return false;
            } else {
              if (e3.col !== t3.col)
                return false;
              if (e3.row !== t3.row)
                return false;
            }
            return e3.button === t3.button && e3.action === t3.action && e3.ctrl === t3.ctrl && e3.alt === t3.alt && e3.shift === t3.shift;
          }
        };
        t2.CoreMouseService = _ = s2([r(0, n.IBufferService), r(1, n.ICoreService)], _);
      }, 6975: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.CoreService = void 0;
        const n = i2(1439), o = i2(8460), a = i2(844), h = i2(2585), c = Object.freeze({ insertMode: false }), l = Object.freeze({ applicationCursorKeys: false, applicationKeypad: false, bracketedPasteMode: false, origin: false, reverseWraparound: false, sendFocus: false, wraparound: true });
        let d = t2.CoreService = class extends a.Disposable {
          constructor(e3, t3, i3) {
            super(), this._bufferService = e3, this._logService = t3, this._optionsService = i3, this.isCursorInitialized = false, this.isCursorHidden = false, this._onData = this.register(new o.EventEmitter()), this.onData = this._onData.event, this._onUserInput = this.register(new o.EventEmitter()), this.onUserInput = this._onUserInput.event, this._onBinary = this.register(new o.EventEmitter()), this.onBinary = this._onBinary.event, this._onRequestScrollToBottom = this.register(new o.EventEmitter()), this.onRequestScrollToBottom = this._onRequestScrollToBottom.event, this.modes = (0, n.clone)(c), this.decPrivateModes = (0, n.clone)(l);
          }
          reset() {
            this.modes = (0, n.clone)(c), this.decPrivateModes = (0, n.clone)(l);
          }
          triggerDataEvent(e3, t3 = false) {
            if (this._optionsService.rawOptions.disableStdin)
              return;
            const i3 = this._bufferService.buffer;
            t3 && this._optionsService.rawOptions.scrollOnUserInput && i3.ybase !== i3.ydisp && this._onRequestScrollToBottom.fire(), t3 && this._onUserInput.fire(), this._logService.debug(`sending data "${e3}"`, () => e3.split("").map((e4) => e4.charCodeAt(0))), this._onData.fire(e3);
          }
          triggerBinaryEvent(e3) {
            this._optionsService.rawOptions.disableStdin || (this._logService.debug(`sending binary "${e3}"`, () => e3.split("").map((e4) => e4.charCodeAt(0))), this._onBinary.fire(e3));
          }
        };
        t2.CoreService = d = s2([r(0, h.IBufferService), r(1, h.ILogService), r(2, h.IOptionsService)], d);
      }, 9074: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.DecorationService = void 0;
        const s2 = i2(8055), r = i2(8460), n = i2(844), o = i2(6106);
        let a = 0, h = 0;
        class c extends n.Disposable {
          get decorations() {
            return this._decorations.values();
          }
          constructor() {
            super(), this._decorations = new o.SortedList((e3) => null == e3 ? void 0 : e3.marker.line), this._onDecorationRegistered = this.register(new r.EventEmitter()), this.onDecorationRegistered = this._onDecorationRegistered.event, this._onDecorationRemoved = this.register(new r.EventEmitter()), this.onDecorationRemoved = this._onDecorationRemoved.event, this.register((0, n.toDisposable)(() => this.reset()));
          }
          registerDecoration(e3) {
            if (e3.marker.isDisposed)
              return;
            const t3 = new l(e3);
            if (t3) {
              const e4 = t3.marker.onDispose(() => t3.dispose());
              t3.onDispose(() => {
                t3 && (this._decorations.delete(t3) && this._onDecorationRemoved.fire(t3), e4.dispose());
              }), this._decorations.insert(t3), this._onDecorationRegistered.fire(t3);
            }
            return t3;
          }
          reset() {
            for (const e3 of this._decorations.values())
              e3.dispose();
            this._decorations.clear();
          }
          *getDecorationsAtCell(e3, t3, i3) {
            var s3, r2, n2;
            let o2 = 0, a2 = 0;
            for (const h2 of this._decorations.getKeyIterator(t3))
              o2 = null !== (s3 = h2.options.x) && void 0 !== s3 ? s3 : 0, a2 = o2 + (null !== (r2 = h2.options.width) && void 0 !== r2 ? r2 : 1), e3 >= o2 && e3 < a2 && (!i3 || (null !== (n2 = h2.options.layer) && void 0 !== n2 ? n2 : "bottom") === i3) && (yield h2);
          }
          forEachDecorationAtCell(e3, t3, i3, s3) {
            this._decorations.forEachByKey(t3, (t4) => {
              var r2, n2, o2;
              a = null !== (r2 = t4.options.x) && void 0 !== r2 ? r2 : 0, h = a + (null !== (n2 = t4.options.width) && void 0 !== n2 ? n2 : 1), e3 >= a && e3 < h && (!i3 || (null !== (o2 = t4.options.layer) && void 0 !== o2 ? o2 : "bottom") === i3) && s3(t4);
            });
          }
        }
        t2.DecorationService = c;
        class l extends n.Disposable {
          get isDisposed() {
            return this._isDisposed;
          }
          get backgroundColorRGB() {
            return null === this._cachedBg && (this.options.backgroundColor ? this._cachedBg = s2.css.toColor(this.options.backgroundColor) : this._cachedBg = void 0), this._cachedBg;
          }
          get foregroundColorRGB() {
            return null === this._cachedFg && (this.options.foregroundColor ? this._cachedFg = s2.css.toColor(this.options.foregroundColor) : this._cachedFg = void 0), this._cachedFg;
          }
          constructor(e3) {
            super(), this.options = e3, this.onRenderEmitter = this.register(new r.EventEmitter()), this.onRender = this.onRenderEmitter.event, this._onDispose = this.register(new r.EventEmitter()), this.onDispose = this._onDispose.event, this._cachedBg = null, this._cachedFg = null, this.marker = e3.marker, this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position && (this.options.overviewRulerOptions.position = "full");
          }
          dispose() {
            this._onDispose.fire(), super.dispose();
          }
        }
      }, 4348: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.InstantiationService = t2.ServiceCollection = void 0;
        const s2 = i2(2585), r = i2(8343);
        class n {
          constructor(...e3) {
            this._entries = /* @__PURE__ */ new Map();
            for (const [t3, i3] of e3)
              this.set(t3, i3);
          }
          set(e3, t3) {
            const i3 = this._entries.get(e3);
            return this._entries.set(e3, t3), i3;
          }
          forEach(e3) {
            for (const [t3, i3] of this._entries.entries())
              e3(t3, i3);
          }
          has(e3) {
            return this._entries.has(e3);
          }
          get(e3) {
            return this._entries.get(e3);
          }
        }
        t2.ServiceCollection = n, t2.InstantiationService = class {
          constructor() {
            this._services = new n(), this._services.set(s2.IInstantiationService, this);
          }
          setService(e3, t3) {
            this._services.set(e3, t3);
          }
          getService(e3) {
            return this._services.get(e3);
          }
          createInstance(e3, ...t3) {
            const i3 = (0, r.getServiceDependencies)(e3).sort((e4, t4) => e4.index - t4.index), s3 = [];
            for (const t4 of i3) {
              const i4 = this._services.get(t4.id);
              if (!i4)
                throw new Error(`[createInstance] ${e3.name} depends on UNKNOWN service ${t4.id}.`);
              s3.push(i4);
            }
            const n2 = i3.length > 0 ? i3[0].index : t3.length;
            if (t3.length !== n2)
              throw new Error(`[createInstance] First service dependency of ${e3.name} at position ${n2 + 1} conflicts with ${t3.length} static arguments`);
            return new e3(...[...t3, ...s3]);
          }
        };
      }, 7866: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a2 = e3.length - 1; a2 >= 0; a2--)
              (r2 = e3[a2]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.traceCall = t2.setTraceLogger = t2.LogService = void 0;
        const n = i2(844), o = i2(2585), a = { trace: o.LogLevelEnum.TRACE, debug: o.LogLevelEnum.DEBUG, info: o.LogLevelEnum.INFO, warn: o.LogLevelEnum.WARN, error: o.LogLevelEnum.ERROR, off: o.LogLevelEnum.OFF };
        let h, c = t2.LogService = class extends n.Disposable {
          get logLevel() {
            return this._logLevel;
          }
          constructor(e3) {
            super(), this._optionsService = e3, this._logLevel = o.LogLevelEnum.OFF, this._updateLogLevel(), this.register(this._optionsService.onSpecificOptionChange("logLevel", () => this._updateLogLevel())), h = this;
          }
          _updateLogLevel() {
            this._logLevel = a[this._optionsService.rawOptions.logLevel];
          }
          _evalLazyOptionalParams(e3) {
            for (let t3 = 0; t3 < e3.length; t3++)
              "function" == typeof e3[t3] && (e3[t3] = e3[t3]());
          }
          _log(e3, t3, i3) {
            this._evalLazyOptionalParams(i3), e3.call(console, (this._optionsService.options.logger ? "" : "xterm.js: ") + t3, ...i3);
          }
          trace(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.TRACE && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.trace.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.log, e3, t3);
          }
          debug(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.DEBUG && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.debug.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.log, e3, t3);
          }
          info(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.INFO && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.info.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.info, e3, t3);
          }
          warn(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.WARN && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.warn.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.warn, e3, t3);
          }
          error(e3, ...t3) {
            var i3, s3;
            this._logLevel <= o.LogLevelEnum.ERROR && this._log(null !== (s3 = null === (i3 = this._optionsService.options.logger) || void 0 === i3 ? void 0 : i3.error.bind(this._optionsService.options.logger)) && void 0 !== s3 ? s3 : console.error, e3, t3);
          }
        };
        t2.LogService = c = s2([r(0, o.IOptionsService)], c), t2.setTraceLogger = function(e3) {
          h = e3;
        }, t2.traceCall = function(e3, t3, i3) {
          if ("function" != typeof i3.value)
            throw new Error("not supported");
          const s3 = i3.value;
          i3.value = function(...e4) {
            if (h.logLevel !== o.LogLevelEnum.TRACE)
              return s3.apply(this, e4);
            h.trace(`GlyphRenderer#${s3.name}(${e4.map((e5) => JSON.stringify(e5)).join(", ")})`);
            const t4 = s3.apply(this, e4);
            return h.trace(`GlyphRenderer#${s3.name} return`, t4), t4;
          };
        };
      }, 7302: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OptionsService = t2.DEFAULT_OPTIONS = void 0;
        const s2 = i2(8460), r = i2(844), n = i2(6114);
        t2.DEFAULT_OPTIONS = { cols: 80, rows: 24, cursorBlink: false, cursorStyle: "block", cursorWidth: 1, cursorInactiveStyle: "outline", customGlyphs: true, drawBoldTextInBrightColors: true, fastScrollModifier: "alt", fastScrollSensitivity: 5, fontFamily: "courier-new, courier, monospace", fontSize: 15, fontWeight: "normal", fontWeightBold: "bold", ignoreBracketedPasteMode: false, lineHeight: 1, letterSpacing: 0, linkHandler: null, logLevel: "info", logger: null, scrollback: 1e3, scrollOnUserInput: true, scrollSensitivity: 1, screenReaderMode: false, smoothScrollDuration: 0, macOptionIsMeta: false, macOptionClickForcesSelection: false, minimumContrastRatio: 1, disableStdin: false, allowProposedApi: false, allowTransparency: false, tabStopWidth: 8, theme: {}, rightClickSelectsWord: n.isMac, windowOptions: {}, windowsMode: false, windowsPty: {}, wordSeparator: " ()[]{}',\"`", altClickMovesCursor: true, convertEol: false, termName: "xterm", cancelEvents: false, overviewRulerWidth: 0 };
        const o = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
        class a extends r.Disposable {
          constructor(e3) {
            super(), this._onOptionChange = this.register(new s2.EventEmitter()), this.onOptionChange = this._onOptionChange.event;
            const i3 = Object.assign({}, t2.DEFAULT_OPTIONS);
            for (const t3 in e3)
              if (t3 in i3)
                try {
                  const s3 = e3[t3];
                  i3[t3] = this._sanitizeAndValidateOption(t3, s3);
                } catch (e4) {
                  console.error(e4);
                }
            this.rawOptions = i3, this.options = Object.assign({}, i3), this._setupOptions();
          }
          onSpecificOptionChange(e3, t3) {
            return this.onOptionChange((i3) => {
              i3 === e3 && t3(this.rawOptions[e3]);
            });
          }
          onMultipleOptionChange(e3, t3) {
            return this.onOptionChange((i3) => {
              -1 !== e3.indexOf(i3) && t3();
            });
          }
          _setupOptions() {
            const e3 = (e4) => {
              if (!(e4 in t2.DEFAULT_OPTIONS))
                throw new Error(`No option with key "${e4}"`);
              return this.rawOptions[e4];
            }, i3 = (e4, i4) => {
              if (!(e4 in t2.DEFAULT_OPTIONS))
                throw new Error(`No option with key "${e4}"`);
              i4 = this._sanitizeAndValidateOption(e4, i4), this.rawOptions[e4] !== i4 && (this.rawOptions[e4] = i4, this._onOptionChange.fire(e4));
            };
            for (const t3 in this.rawOptions) {
              const s3 = { get: e3.bind(this, t3), set: i3.bind(this, t3) };
              Object.defineProperty(this.options, t3, s3);
            }
          }
          _sanitizeAndValidateOption(e3, i3) {
            switch (e3) {
              case "cursorStyle":
                if (i3 || (i3 = t2.DEFAULT_OPTIONS[e3]), !/* @__PURE__ */ function(e4) {
                  return "block" === e4 || "underline" === e4 || "bar" === e4;
                }(i3))
                  throw new Error(`"${i3}" is not a valid value for ${e3}`);
                break;
              case "wordSeparator":
                i3 || (i3 = t2.DEFAULT_OPTIONS[e3]);
                break;
              case "fontWeight":
              case "fontWeightBold":
                if ("number" == typeof i3 && 1 <= i3 && i3 <= 1e3)
                  break;
                i3 = o.includes(i3) ? i3 : t2.DEFAULT_OPTIONS[e3];
                break;
              case "cursorWidth":
                i3 = Math.floor(i3);
              case "lineHeight":
              case "tabStopWidth":
                if (i3 < 1)
                  throw new Error(`${e3} cannot be less than 1, value: ${i3}`);
                break;
              case "minimumContrastRatio":
                i3 = Math.max(1, Math.min(21, Math.round(10 * i3) / 10));
                break;
              case "scrollback":
                if ((i3 = Math.min(i3, 4294967295)) < 0)
                  throw new Error(`${e3} cannot be less than 0, value: ${i3}`);
                break;
              case "fastScrollSensitivity":
              case "scrollSensitivity":
                if (i3 <= 0)
                  throw new Error(`${e3} cannot be less than or equal to 0, value: ${i3}`);
                break;
              case "rows":
              case "cols":
                if (!i3 && 0 !== i3)
                  throw new Error(`${e3} must be numeric, value: ${i3}`);
                break;
              case "windowsPty":
                i3 = null != i3 ? i3 : {};
            }
            return i3;
          }
        }
        t2.OptionsService = a;
      }, 2660: function(e2, t2, i2) {
        var s2 = this && this.__decorate || function(e3, t3, i3, s3) {
          var r2, n2 = arguments.length, o2 = n2 < 3 ? t3 : null === s3 ? s3 = Object.getOwnPropertyDescriptor(t3, i3) : s3;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
            o2 = Reflect.decorate(e3, t3, i3, s3);
          else
            for (var a = e3.length - 1; a >= 0; a--)
              (r2 = e3[a]) && (o2 = (n2 < 3 ? r2(o2) : n2 > 3 ? r2(t3, i3, o2) : r2(t3, i3)) || o2);
          return n2 > 3 && o2 && Object.defineProperty(t3, i3, o2), o2;
        }, r = this && this.__param || function(e3, t3) {
          return function(i3, s3) {
            t3(i3, s3, e3);
          };
        };
        Object.defineProperty(t2, "__esModule", { value: true }), t2.OscLinkService = void 0;
        const n = i2(2585);
        let o = t2.OscLinkService = class {
          constructor(e3) {
            this._bufferService = e3, this._nextId = 1, this._entriesWithId = /* @__PURE__ */ new Map(), this._dataByLinkId = /* @__PURE__ */ new Map();
          }
          registerLink(e3) {
            const t3 = this._bufferService.buffer;
            if (void 0 === e3.id) {
              const i4 = t3.addMarker(t3.ybase + t3.y), s4 = { data: e3, id: this._nextId++, lines: [i4] };
              return i4.onDispose(() => this._removeMarkerFromLink(s4, i4)), this._dataByLinkId.set(s4.id, s4), s4.id;
            }
            const i3 = e3, s3 = this._getEntryIdKey(i3), r2 = this._entriesWithId.get(s3);
            if (r2)
              return this.addLineToLink(r2.id, t3.ybase + t3.y), r2.id;
            const n2 = t3.addMarker(t3.ybase + t3.y), o2 = { id: this._nextId++, key: this._getEntryIdKey(i3), data: i3, lines: [n2] };
            return n2.onDispose(() => this._removeMarkerFromLink(o2, n2)), this._entriesWithId.set(o2.key, o2), this._dataByLinkId.set(o2.id, o2), o2.id;
          }
          addLineToLink(e3, t3) {
            const i3 = this._dataByLinkId.get(e3);
            if (i3 && i3.lines.every((e4) => e4.line !== t3)) {
              const e4 = this._bufferService.buffer.addMarker(t3);
              i3.lines.push(e4), e4.onDispose(() => this._removeMarkerFromLink(i3, e4));
            }
          }
          getLinkData(e3) {
            var t3;
            return null === (t3 = this._dataByLinkId.get(e3)) || void 0 === t3 ? void 0 : t3.data;
          }
          _getEntryIdKey(e3) {
            return `${e3.id};;${e3.uri}`;
          }
          _removeMarkerFromLink(e3, t3) {
            const i3 = e3.lines.indexOf(t3);
            -1 !== i3 && (e3.lines.splice(i3, 1), 0 === e3.lines.length && (void 0 !== e3.data.id && this._entriesWithId.delete(e3.key), this._dataByLinkId.delete(e3.id)));
          }
        };
        t2.OscLinkService = o = s2([r(0, n.IBufferService)], o);
      }, 8343: (e2, t2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.createDecorator = t2.getServiceDependencies = t2.serviceRegistry = void 0;
        const i2 = "di$target", s2 = "di$dependencies";
        t2.serviceRegistry = /* @__PURE__ */ new Map(), t2.getServiceDependencies = function(e3) {
          return e3[s2] || [];
        }, t2.createDecorator = function(e3) {
          if (t2.serviceRegistry.has(e3))
            return t2.serviceRegistry.get(e3);
          const r = function(e4, t3, n) {
            if (3 !== arguments.length)
              throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
            !function(e5, t4, r2) {
              t4[i2] === t4 ? t4[s2].push({ id: e5, index: r2 }) : (t4[s2] = [{ id: e5, index: r2 }], t4[i2] = t4);
            }(r, e4, n);
          };
          return r.toString = () => e3, t2.serviceRegistry.set(e3, r), r;
        };
      }, 2585: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.IDecorationService = t2.IUnicodeService = t2.IOscLinkService = t2.IOptionsService = t2.ILogService = t2.LogLevelEnum = t2.IInstantiationService = t2.ICharsetService = t2.ICoreService = t2.ICoreMouseService = t2.IBufferService = void 0;
        const s2 = i2(8343);
        var r;
        t2.IBufferService = (0, s2.createDecorator)("BufferService"), t2.ICoreMouseService = (0, s2.createDecorator)("CoreMouseService"), t2.ICoreService = (0, s2.createDecorator)("CoreService"), t2.ICharsetService = (0, s2.createDecorator)("CharsetService"), t2.IInstantiationService = (0, s2.createDecorator)("InstantiationService"), function(e3) {
          e3[e3.TRACE = 0] = "TRACE", e3[e3.DEBUG = 1] = "DEBUG", e3[e3.INFO = 2] = "INFO", e3[e3.WARN = 3] = "WARN", e3[e3.ERROR = 4] = "ERROR", e3[e3.OFF = 5] = "OFF";
        }(r || (t2.LogLevelEnum = r = {})), t2.ILogService = (0, s2.createDecorator)("LogService"), t2.IOptionsService = (0, s2.createDecorator)("OptionsService"), t2.IOscLinkService = (0, s2.createDecorator)("OscLinkService"), t2.IUnicodeService = (0, s2.createDecorator)("UnicodeService"), t2.IDecorationService = (0, s2.createDecorator)("DecorationService");
      }, 1480: (e2, t2, i2) => {
        Object.defineProperty(t2, "__esModule", { value: true }), t2.UnicodeService = void 0;
        const s2 = i2(8460), r = i2(225);
        t2.UnicodeService = class {
          constructor() {
            this._providers = /* @__PURE__ */ Object.create(null), this._active = "", this._onChange = new s2.EventEmitter(), this.onChange = this._onChange.event;
            const e3 = new r.UnicodeV6();
            this.register(e3), this._active = e3.version, this._activeProvider = e3;
          }
          dispose() {
            this._onChange.dispose();
          }
          get versions() {
            return Object.keys(this._providers);
          }
          get activeVersion() {
            return this._active;
          }
          set activeVersion(e3) {
            if (!this._providers[e3])
              throw new Error(`unknown Unicode version "${e3}"`);
            this._active = e3, this._activeProvider = this._providers[e3], this._onChange.fire(e3);
          }
          register(e3) {
            this._providers[e3.version] = e3;
          }
          wcwidth(e3) {
            return this._activeProvider.wcwidth(e3);
          }
          getStringCellWidth(e3) {
            let t3 = 0;
            const i3 = e3.length;
            for (let s3 = 0; s3 < i3; ++s3) {
              let r2 = e3.charCodeAt(s3);
              if (55296 <= r2 && r2 <= 56319) {
                if (++s3 >= i3)
                  return t3 + this.wcwidth(r2);
                const n = e3.charCodeAt(s3);
                56320 <= n && n <= 57343 ? r2 = 1024 * (r2 - 55296) + n - 56320 + 65536 : t3 += this.wcwidth(n);
              }
              t3 += this.wcwidth(r2);
            }
            return t3;
          }
        };
      } }, t = {};
      function i(s2) {
        var r = t[s2];
        if (void 0 !== r)
          return r.exports;
        var n = t[s2] = { exports: {} };
        return e[s2].call(n.exports, n, n.exports, i), n.exports;
      }
      var s = {};
      return (() => {
        var e2 = s;
        Object.defineProperty(e2, "__esModule", { value: true }), e2.Terminal = void 0;
        const t2 = i(9042), r = i(3236), n = i(844), o = i(5741), a = i(8285), h = i(7975), c = i(7090), l = ["cols", "rows"];
        class d extends n.Disposable {
          constructor(e3) {
            super(), this._core = this.register(new r.Terminal(e3)), this._addonManager = this.register(new o.AddonManager()), this._publicOptions = Object.assign({}, this._core.options);
            const t3 = (e4) => this._core.options[e4], i2 = (e4, t4) => {
              this._checkReadonlyOptions(e4), this._core.options[e4] = t4;
            };
            for (const e4 in this._core.options) {
              const s2 = { get: t3.bind(this, e4), set: i2.bind(this, e4) };
              Object.defineProperty(this._publicOptions, e4, s2);
            }
          }
          _checkReadonlyOptions(e3) {
            if (l.includes(e3))
              throw new Error(`Option "${e3}" can only be set in the constructor`);
          }
          _checkProposedApi() {
            if (!this._core.optionsService.rawOptions.allowProposedApi)
              throw new Error("You must set the allowProposedApi option to true to use proposed API");
          }
          get onBell() {
            return this._core.onBell;
          }
          get onBinary() {
            return this._core.onBinary;
          }
          get onCursorMove() {
            return this._core.onCursorMove;
          }
          get onData() {
            return this._core.onData;
          }
          get onKey() {
            return this._core.onKey;
          }
          get onLineFeed() {
            return this._core.onLineFeed;
          }
          get onRender() {
            return this._core.onRender;
          }
          get onResize() {
            return this._core.onResize;
          }
          get onScroll() {
            return this._core.onScroll;
          }
          get onSelectionChange() {
            return this._core.onSelectionChange;
          }
          get onTitleChange() {
            return this._core.onTitleChange;
          }
          get onWriteParsed() {
            return this._core.onWriteParsed;
          }
          get element() {
            return this._core.element;
          }
          get parser() {
            return this._parser || (this._parser = new h.ParserApi(this._core)), this._parser;
          }
          get unicode() {
            return this._checkProposedApi(), new c.UnicodeApi(this._core);
          }
          get textarea() {
            return this._core.textarea;
          }
          get rows() {
            return this._core.rows;
          }
          get cols() {
            return this._core.cols;
          }
          get buffer() {
            return this._buffer || (this._buffer = this.register(new a.BufferNamespaceApi(this._core))), this._buffer;
          }
          get markers() {
            return this._checkProposedApi(), this._core.markers;
          }
          get modes() {
            const e3 = this._core.coreService.decPrivateModes;
            let t3 = "none";
            switch (this._core.coreMouseService.activeProtocol) {
              case "X10":
                t3 = "x10";
                break;
              case "VT200":
                t3 = "vt200";
                break;
              case "DRAG":
                t3 = "drag";
                break;
              case "ANY":
                t3 = "any";
            }
            return { applicationCursorKeysMode: e3.applicationCursorKeys, applicationKeypadMode: e3.applicationKeypad, bracketedPasteMode: e3.bracketedPasteMode, insertMode: this._core.coreService.modes.insertMode, mouseTrackingMode: t3, originMode: e3.origin, reverseWraparoundMode: e3.reverseWraparound, sendFocusMode: e3.sendFocus, wraparoundMode: e3.wraparound };
          }
          get options() {
            return this._publicOptions;
          }
          set options(e3) {
            for (const t3 in e3)
              this._publicOptions[t3] = e3[t3];
          }
          blur() {
            this._core.blur();
          }
          focus() {
            this._core.focus();
          }
          resize(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.resize(e3, t3);
          }
          open(e3) {
            this._core.open(e3);
          }
          attachCustomKeyEventHandler(e3) {
            this._core.attachCustomKeyEventHandler(e3);
          }
          registerLinkProvider(e3) {
            return this._core.registerLinkProvider(e3);
          }
          registerCharacterJoiner(e3) {
            return this._checkProposedApi(), this._core.registerCharacterJoiner(e3);
          }
          deregisterCharacterJoiner(e3) {
            this._checkProposedApi(), this._core.deregisterCharacterJoiner(e3);
          }
          registerMarker(e3 = 0) {
            return this._verifyIntegers(e3), this._core.registerMarker(e3);
          }
          registerDecoration(e3) {
            var t3, i2, s2;
            return this._checkProposedApi(), this._verifyPositiveIntegers(null !== (t3 = e3.x) && void 0 !== t3 ? t3 : 0, null !== (i2 = e3.width) && void 0 !== i2 ? i2 : 0, null !== (s2 = e3.height) && void 0 !== s2 ? s2 : 0), this._core.registerDecoration(e3);
          }
          hasSelection() {
            return this._core.hasSelection();
          }
          select(e3, t3, i2) {
            this._verifyIntegers(e3, t3, i2), this._core.select(e3, t3, i2);
          }
          getSelection() {
            return this._core.getSelection();
          }
          getSelectionPosition() {
            return this._core.getSelectionPosition();
          }
          clearSelection() {
            this._core.clearSelection();
          }
          selectAll() {
            this._core.selectAll();
          }
          selectLines(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.selectLines(e3, t3);
          }
          dispose() {
            super.dispose();
          }
          scrollLines(e3) {
            this._verifyIntegers(e3), this._core.scrollLines(e3);
          }
          scrollPages(e3) {
            this._verifyIntegers(e3), this._core.scrollPages(e3);
          }
          scrollToTop() {
            this._core.scrollToTop();
          }
          scrollToBottom() {
            this._core.scrollToBottom();
          }
          scrollToLine(e3) {
            this._verifyIntegers(e3), this._core.scrollToLine(e3);
          }
          clear() {
            this._core.clear();
          }
          write(e3, t3) {
            this._core.write(e3, t3);
          }
          writeln(e3, t3) {
            this._core.write(e3), this._core.write("\r\n", t3);
          }
          paste(e3) {
            this._core.paste(e3);
          }
          refresh(e3, t3) {
            this._verifyIntegers(e3, t3), this._core.refresh(e3, t3);
          }
          reset() {
            this._core.reset();
          }
          clearTextureAtlas() {
            this._core.clearTextureAtlas();
          }
          loadAddon(e3) {
            this._addonManager.loadAddon(this, e3);
          }
          static get strings() {
            return t2;
          }
          _verifyIntegers(...e3) {
            for (const t3 of e3)
              if (t3 === 1 / 0 || isNaN(t3) || t3 % 1 != 0)
                throw new Error("This API only accepts integers");
          }
          _verifyPositiveIntegers(...e3) {
            for (const t3 of e3)
              if (t3 && (t3 === 1 / 0 || isNaN(t3) || t3 % 1 != 0 || t3 < 0))
                throw new Error("This API only accepts positive integers");
          }
        }
        e2.Terminal = d;
      })(), s;
    })());
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

// app/javascript/controllers/application.js
var application = Application.start();
application.debug = false;
window.Stimulus = application;

// app/javascript/controllers/hello_controller.js
var hello_controller_default = class extends Controller {
  connect() {
    this.element.textContent = "Hello World!";
  }
};

// app/javascript/controllers/index.js
application.register("hello", hello_controller_default);

// app/javascript/application.js
var import_xterm = __toESM(require_xterm());

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
Rails.start();
require_activestorage().start();
document.addEventListener("DOMContentLoaded", () => {
  const terminal = new import_xterm.Terminal();
  terminal.open(document.getElementById("terminal-container"));
  terminal.write("Bienvenido a tu Terminal\n");
});
//# sourceMappingURL=/assets/application.js.map
