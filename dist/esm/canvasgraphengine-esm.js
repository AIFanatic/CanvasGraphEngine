// src/Utils.ts
var Utils = class {
  static isPointInsideRect(position, size, point) {
    return point.x > position.x && point.x < position.x + size.w && point.y > position.y && point.y < position.y + size.h;
  }
  static isPointInsideCircle(point, center, radius) {
    return Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2) <= radius * radius;
  }
  static pointsDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  static pointsMidPoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }
  static lerp(a, b, t) {
    return a * (1 - t) + b * t;
  }
  static scaleCanvas(canvas, context, width, height) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    const ratio = devicePixelRatio / backingStoreRatio;
    if (devicePixelRatio !== backingStoreRatio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    } else {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "";
      canvas.style.height = "";
    }
    context.scale(ratio, ratio);
    return ratio;
  }
  static uuid() {
    return "xxxxxxxx".replace(/[x]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
};

// src/interfaces/IMouseEvent.ts
var MouseEventTypes;
(function(MouseEventTypes2) {
  MouseEventTypes2[MouseEventTypes2["DOWN"] = 0] = "DOWN";
  MouseEventTypes2[MouseEventTypes2["UP"] = 1] = "UP";
  MouseEventTypes2[MouseEventTypes2["MOVE"] = 2] = "MOVE";
  MouseEventTypes2[MouseEventTypes2["WHEEL"] = 3] = "WHEEL";
})(MouseEventTypes || (MouseEventTypes = {}));
var MouseButton;
(function(MouseButton2) {
  MouseButton2[MouseButton2["LEFT"] = 0] = "LEFT";
  MouseButton2[MouseButton2["MIDDLE"] = 1] = "MIDDLE";
  MouseButton2[MouseButton2["RIGHT"] = 2] = "RIGHT";
  MouseButton2[MouseButton2["BACK"] = 3] = "BACK";
  MouseButton2[MouseButton2["FORWARD"] = 4] = "FORWARD";
})(MouseButton || (MouseButton = {}));

// src/GraphPanAndZoom.ts
var GraphPanAndZoom = class {
  constructor(ctx, scaleFactor = 1.1) {
    this.ctx = ctx;
    this.scaleFactor = scaleFactor;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.transform = svg.createSVGMatrix();
    this._point = svg.createSVGPoint();
  }
  transformedPoint(x, y) {
    this._point.x = x;
    this._point.y = y;
    this._point = this._point.matrixTransform(this.transform.inverse());
    return { x: this._point.x, y: this._point.y };
  }
  onMouseDown(event) {
    if (event.button == MouseButton.RIGHT)
      return;
    this.dragStart = event.position;
  }
  onMouseUp(event) {
    this.dragStart = null;
    this.lastTouchDistance = null;
  }
  onMouseMove(event) {
    if (event.rawEvent instanceof TouchEvent && event.rawEvent.touches.length == 2) {
      if (!this.lastTouchDistance) {
        const touch12 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
        const touch22 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
        this.lastTouchDistance = Math.sqrt(Math.pow(touch22.x - touch12.x, 2) + Math.pow(touch22.y - touch12.y, 2));
        return;
      }
      const touch1 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
      const touch2 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
      const pointsMiddle = Utils.pointsMidPoint({ x: touch1.x, y: touch1.y }, { x: touch2.x, y: touch2.y });
      const currentDistance = Math.sqrt(Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2));
      const distanceDelta = this.lastTouchDistance - currentDistance;
      event.wheelDelta = distanceDelta;
      event.position = this.transformedPoint(pointsMiddle.x, pointsMiddle.y);
      this.onMouseWheel(event);
      this.lastTouchDistance = currentDistance;
    } else {
      if (this.dragStart) {
        const dx = event.position.x - this.dragStart.x;
        const dy = event.position.y - this.dragStart.y;
        this.transform = this.transform.translate(dx, dy);
        this.ctx.translate(dx, dy);
      }
    }
  }
  onMouseWheel(event) {
    var delta = -event.wheelDelta / 40;
    if (delta) {
      const factor = Math.pow(this.scaleFactor, delta);
      const pt = event.position;
      this.ctx.translate(pt.x, pt.y);
      this.ctx.scale(factor, factor);
      this.ctx.translate(-pt.x, -pt.y);
      this.transform = this.transform.translate(pt.x, pt.y);
      this.transform = this.transform.scaleNonUniform(factor, factor);
      this.transform = this.transform.translate(-pt.x, -pt.y);
    }
  }
};

// src/defaults/NodeConnectionProperties.ts
var NodeConnectionProperties = class {
  static default() {
    return {
      color: "inherit",
      thickness: 3
    };
  }
};

// src/GraphSelection.ts
var GraphSelection = class {
  constructor(graph) {
    this.slotRadiusMultiplier = 2;
    this.graph = graph;
    this.connectionProperties = NodeConnectionProperties.default();
    this.mousePosition = { x: 0, y: 0 };
  }
  draw(ctx) {
    ctx.save();
    if (this.selectedNode && !this.selectedSlotFrom) {
      ctx.strokeStyle = "#949494";
      ctx.strokeRect(this.selectedNode.properties.position.x, this.selectedNode.properties.position.y, this.selectedNode.properties.size.w, this.selectedNode.properties.size.h);
    }
    if (this.selectedSlotFrom) {
      ctx.strokeStyle = this.connectionProperties.color == "inherit" ? this.selectedSlotFrom.properties.slotColor : this.connectionProperties.color;
      ctx.lineWidth = this.connectionProperties.thickness;
      ctx.beginPath();
      ctx.moveTo(this.selectedSlotFrom.slotCenter.x, this.selectedSlotFrom.slotCenter.y);
      ctx.lineTo(this.mousePosition.x, this.mousePosition.y);
      ctx.stroke();
    }
    ctx.restore();
  }
  bringNodeToForeground(node) {
    const nodeIndex = this.graph.nodes.indexOf(node);
    if (nodeIndex != -1) {
      const foregroundNode = this.graph.nodes.splice(nodeIndex, 1)[0];
      this.graph.nodes.push(foregroundNode);
    }
  }
  onMouseDown(event) {
    if (event.button == MouseButton.RIGHT)
      return;
    if (event.rawEvent instanceof TouchEvent && event.rawEvent.touches.length > 1) {
      this.selectedNode = null;
      return;
    }
    this.mousePosition = event.position;
    this.isMouseDown = true;
    if (this.selectedNode) {
      if (!Utils.isPointInsideRect(this.selectedNode.properties.position, this.selectedNode.properties.size, event.position)) {
        this.selectedNode = null;
      }
    }
    for (let node of this.graph.nodes) {
      if (Utils.isPointInsideRect(node.properties.position, node.properties.size, event.position)) {
        this.selectedNode = node;
        this.selectedNodePositionOffset = { x: event.position.x - this.selectedNode.properties.position.x, y: event.position.y - this.selectedNode.properties.position.y };
        this.bringNodeToForeground(this.selectedNode);
        for (let output of node.outputs) {
          const isSlotSelected = Utils.isPointInsideCircle(event.position, output.slotCenter, output.properties.slotRadius * this.slotRadiusMultiplier);
          if (isSlotSelected) {
            this.selectedSlotFrom = output;
            break;
          }
        }
        for (let input of node.inputs) {
          if (input.connection) {
            const isSlotSelected = Utils.isPointInsideCircle(event.position, input.slotCenter, input.properties.slotRadius * this.slotRadiusMultiplier);
            if (isSlotSelected) {
              input.node.removeConnection(input.connection);
              break;
            }
          }
        }
      }
    }
  }
  onMouseUp(event) {
    this.mousePosition = event.position;
    this.isMouseDown = false;
    if (this.selectedNode && this.selectedSlotFrom && this.selectedSlotTo) {
      this.selectedSlotTo.isHighlighted = false;
      this.selectedNode.connectInputToOutput(this.selectedSlotFrom, this.selectedSlotTo);
    }
    this.selectedSlotFrom = null;
    this.selectedSlotTo = null;
  }
  onMouseMove(event) {
    this.mousePosition = event.position;
    this.selectedSlotTo = null;
    if (this.selectedSlotFrom) {
      for (let node of this.graph.nodes) {
        if (node == this.selectedNode)
          continue;
        if (Utils.isPointInsideRect(node.properties.position, node.properties.size, event.position)) {
          document.body.style.cursor = "pointer";
          for (let input of node.inputs) {
            input.isHighlighted = false;
            const isMouseInsideSlot = Utils.isPointInsideCircle(event.position, input.slotCenter, input.properties.slotRadius * this.slotRadiusMultiplier);
            if (isMouseInsideSlot) {
              if (this.selectedNode.isValidConnection(input, this.selectedSlotFrom)) {
                input.isHighlighted = true;
                this.selectedSlotTo = input;
                break;
              }
            }
          }
        }
      }
    }
    if (this.selectedNode && !this.selectedSlotFrom && this.isMouseDown) {
      this.selectedNode.properties.position.x = event.position.x - this.selectedNodePositionOffset.x;
      this.selectedNode.properties.position.y = event.position.y - this.selectedNodePositionOffset.y;
    }
    if (this.selectedNode || this.selectedSlotFrom || this.selectedSlotTo) {
      return false;
    }
    return true;
  }
};

// src/GraphSerializer.ts
var GraphSerializer = class {
  static serializeNodeInputs(inputs) {
    let json = [];
    for (let input of inputs) {
      json.push(input.properties);
    }
    return json;
  }
  static serializeNodeOutputs(outputs) {
    let json = [];
    for (let output of outputs) {
      let obj = { properties: output.properties, connections: [] };
      for (let connection of output.connections) {
        obj.connections.push(connection.properties);
      }
      json.push(obj);
    }
    return json;
  }
  static serializeWidgets(widgets) {
    let json = [];
    for (let widget of widgets)
      json.push(widget.properties);
    return json;
  }
  static serializeNode(node) {
    return {
      node: node.properties,
      header: node.header.properties,
      inputs: this.serializeNodeInputs(node.inputs),
      outputs: this.serializeNodeOutputs(node.outputs),
      widgets: this.serializeWidgets(node.widgets)
    };
  }
  static toJSON(graph) {
    let json = [];
    for (let node of graph.nodes) {
      node.onSerialize();
      json.push(GraphSerializer.serializeNode(node));
    }
    return JSON.parse(JSON.stringify(json));
  }
  static fromJSON(graph, serialized) {
    graph.clearNodes();
    let nodes = new Map();
    let inputs = new Map();
    let outputs = new Map();
    for (let nodeEntry of serialized) {
      const nodeInstance = graph.createNode(nodeEntry.node.path);
      if (nodeInstance) {
        nodeInstance.properties = nodeEntry.node;
        nodeInstance.header.properties = nodeEntry.header;
        for (let i = 0; i < nodeEntry.inputs.length; i++) {
          const inputEntry = nodeEntry.inputs[i];
          const inputInstance = nodeInstance.inputs[i] ? nodeInstance.inputs[i] : nodeInstance.addInput(inputEntry.name, inputEntry.type);
          inputInstance.properties = inputEntry;
          inputs.set(inputInstance.properties.uuid, inputInstance);
        }
        for (let i = 0; i < nodeEntry.outputs.length; i++) {
          const outputEntry = nodeEntry.outputs[i];
          const outputInstance = nodeInstance.outputs[i] ? nodeInstance.outputs[i] : nodeInstance.addOutput(outputEntry.properties.name, outputEntry.properties.type);
          outputInstance.properties = outputEntry.properties;
          outputs.set(outputInstance.properties.uuid, outputInstance);
        }
        nodes.set(nodeInstance.properties.uuid, nodeInstance);
      }
    }
    for (let nodeEntry of serialized) {
      const nodeInstance = nodes.get(nodeEntry.node.uuid);
      for (let output of nodeEntry.outputs) {
        for (let connection of output.connections) {
          const inputInstance = inputs.get(connection.to_slot);
          const outputInstance = outputs.get(connection.from_slot);
          nodeInstance.connectInputToOutput(outputInstance, inputInstance);
        }
      }
      nodeInstance.onDeserialized();
    }
  }
};

// src/Graph.ts
var Graph = class {
  constructor(canvas) {
    this.nodes = [];
    this.dirtyCanvas = true;
    this.panAndZoomEnabled = true;
    this.nodeSelectionEnabled = true;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    canvas.addEventListener("mousedown", (event) => this.onMouseOrTouchDown(event));
    canvas.addEventListener("mouseup", (event) => this.onMouseOrTouchUp(event));
    canvas.addEventListener("mousemove", (event) => this.onMouseOrTouchMove(event));
    canvas.addEventListener("wheel", (event) => this.onMouseWheel(event));
    canvas.addEventListener("touchstart", (event) => this.onMouseOrTouchDown(event));
    canvas.addEventListener("touchend", (event) => this.onMouseOrTouchUp(event));
    canvas.addEventListener("touchmove", (event) => this.onMouseOrTouchMove(event));
    window.addEventListener("resize", (event) => this.onResize(event));
    this.graphPanAndZoom = new GraphPanAndZoom(this.ctx);
    this.graphSelection = new GraphSelection(this);
    this.nodeTypes = new Map();
    requestAnimationFrame(() => {
      this.draw(this.ctx);
    });
    this.onResize(null);
  }
  registerNode(path, node) {
    this.nodeTypes.set(path, node);
  }
  unregisterNode(path) {
    this.nodeTypes.delete(path);
  }
  clearNodes() {
    for (let node of this.nodes) {
      node.onRemoved();
    }
    this.nodes = [];
    this.dirtyCanvas = true;
  }
  createNode(path, title = "") {
    if (this.nodeTypes.has(path)) {
      const Node = this.nodeTypes.get(path);
      const nodeInstance = new Node(this, path, title);
      this.nodes.push(nodeInstance);
      nodeInstance.onAdded();
      return nodeInstance;
    }
    return null;
  }
  draw(ctx) {
    if (this.dirtyCanvas) {
      this.dirtyCanvas = false;
      var p1 = this.graphPanAndZoom.transformedPoint(0, 0);
      var p2 = this.graphPanAndZoom.transformedPoint(ctx.canvas.width, ctx.canvas.height);
      ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      for (let node of this.nodes) {
        node.drawConnections(ctx);
      }
      for (let node of this.nodes) {
        node.draw(ctx);
      }
      this.graphSelection.draw(ctx);
    }
    requestAnimationFrame(() => {
      this.draw(this.ctx);
    });
  }
  processMouseOrTouchEvent(event, type) {
    let mouseEvent = { position: { x: 0, y: 0 }, button: 0, rawEvent: event };
    if (event instanceof MouseEvent) {
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.offsetX, event.offsetY);
      mouseEvent.button = event.button;
    }
    if (event instanceof TouchEvent) {
      const canvasBoundingRect = this.canvas.getBoundingClientRect();
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.changedTouches[0].clientX - canvasBoundingRect.x, event.changedTouches[0].clientY - canvasBoundingRect.y);
    }
    if (event instanceof WheelEvent) {
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.offsetX, event.offsetY);
      mouseEvent.button = event.button;
      mouseEvent.wheelDelta = event.deltaY;
    }
    this.dirtyCanvas = true;
    for (let node of this.nodes) {
      node.onMouseEvent(mouseEvent, type);
    }
    return mouseEvent;
  }
  onMouseWheel(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.WHEEL);
    if (this.panAndZoomEnabled)
      this.graphPanAndZoom.onMouseWheel(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchUp(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.UP);
    this.graphPanAndZoom.onMouseUp(mouseEvent);
    this.graphSelection.onMouseUp(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchDown(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.DOWN);
    if (this.panAndZoomEnabled)
      this.graphPanAndZoom.onMouseDown(mouseEvent);
    if (this.nodeSelectionEnabled)
      this.graphSelection.onMouseDown(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchMove(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.MOVE);
    const graphSelectionBubble = this.graphSelection.onMouseMove(mouseEvent);
    if (graphSelectionBubble) {
      this.graphPanAndZoom.onMouseMove(mouseEvent);
    }
    event.preventDefault();
  }
  onResize(event) {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
    Utils.scaleCanvas(this.canvas, this.ctx, this.canvas.width, this.canvas.height);
    this.graphPanAndZoom = new GraphPanAndZoom(this.ctx);
    this.dirtyCanvas = true;
  }
  toJSON() {
    return GraphSerializer.toJSON(this);
  }
  fromJSON(serialized) {
    GraphSerializer.fromJSON(this, serialized);
  }
};

// src/defaults/NodeProperties.ts
var NodeProperties = class {
  static default() {
    return {
      uuid: Utils.uuid(),
      path: "",
      color: "#353535",
      position: { x: 0, y: 0 },
      size: { w: 200, h: 50 },
      horizontalSlots: false
    };
  }
};

// src/node/GraphNodeConnection.ts
var GraphNodeConnection = class {
  constructor(input, output) {
    this.dashOffset = 0;
    this.input = input;
    this.output = output;
    const propertiesDefaults = NodeConnectionProperties.default();
    this.properties = {
      color: propertiesDefaults.color,
      thickness: propertiesDefaults.thickness,
      from_node: this.output.node.properties.uuid,
      from_slot: this.output.properties.uuid,
      to_node: this.input.node.properties.uuid,
      to_slot: this.input.properties.uuid
    };
  }
  trigger() {
    if (this.hasTriggered)
      return;
    this.hasTriggered = true;
    this.dashOffset = 0;
    const interval = setInterval(() => {
      this.output.node.graph.dirtyCanvas = true;
      this.dashOffset--;
    }, 100);
    setTimeout(() => {
      this.hasTriggered = false;
      clearInterval(interval);
    }, 1e3);
  }
  draw(ctx) {
    if (this.input.slotCenter.x == 0 && this.input.slotCenter.y == 0 || this.output.slotCenter.x == 0 && this.output.slotCenter.y == 0) {
      this.output.node.graph.dirtyCanvas = true;
      return;
    }
    ctx.save();
    ctx.strokeStyle = this.properties.color == "inherit" ? this.input.properties.slotColor : this.properties.color;
    if (this.hasTriggered) {
      ctx.strokeStyle = "white";
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = this.dashOffset;
    }
    ctx.lineWidth = this.properties.thickness;
    ctx.beginPath();
    ctx.moveTo(this.output.slotCenter.x, this.output.slotCenter.y);
    const outputIsVertical = this.output.node.properties.horizontalSlots;
    const inputIsVertical = this.input.node.properties.horizontalSlots;
    if (outputIsVertical && inputIsVertical) {
      ctx.lineTo(this.output.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
      ctx.lineTo(this.input.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
    } else if (!outputIsVertical && inputIsVertical) {
      ctx.lineTo(this.input.slotCenter.x, this.output.slotCenter.y);
      ctx.lineTo(this.input.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
    } else if (outputIsVertical && !inputIsVertical) {
      ctx.lineTo(this.output.slotCenter.x, (this.output.slotCenter.y + this.input.slotCenter.y) * 0.5);
      ctx.lineTo(this.output.slotCenter.x, this.input.slotCenter.y);
    } else if (!outputIsVertical && !inputIsVertical) {
      ctx.lineTo((this.output.slotCenter.x + this.input.slotCenter.x) * 0.5, this.output.slotCenter.y);
      ctx.lineTo((this.output.slotCenter.x + this.input.slotCenter.x) * 0.5, this.input.slotCenter.y);
    }
    ctx.lineTo(this.input.slotCenter.x, this.input.slotCenter.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
};

// src/defaults/NodeSlotProperties.ts
var NodeSlotProperties = class {
  static default() {
    return {
      uuid: Utils.uuid(),
      position: { x: 0, y: 0 },
      size: { w: 200, h: 20 },
      name: "",
      value: "",
      type: "",
      slotColor: "#949494",
      slotRadius: 4,
      textColor: "#949494",
      margin: 10
    };
  }
};

// src/node/slot/GraphNodeInput.ts
var GraphNodeInput = class {
  constructor(node) {
    this.connection = null;
    this.properties = NodeSlotProperties.default();
    this.properties.name = "input";
    this.slotCenter = { x: 0, y: 0 };
    this.node = node;
  }
  removeConnection() {
    this.connection = null;
  }
  setConnection(connection) {
    this.connection = connection;
  }
  draw(ctx) {
    ctx.save();
    const margin = this.node.properties.horizontalSlots ? 0 : this.properties.margin;
    this.slotCenter = { x: this.properties.position.x + margin, y: this.properties.position.y + this.properties.size.h / 2 };
    if (this.isHighlighted) {
      ctx.fillStyle = "white";
      ctx.strokeStyle = "white";
    } else {
      ctx.fillStyle = this.properties.slotColor;
      ctx.strokeStyle = this.properties.slotColor;
    }
    ctx.beginPath();
    ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    if (this.connection) {
      ctx.beginPath();
      ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius - 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
    ctx.fillStyle = this.properties.textColor;
    ctx.font = "9pt Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(this.properties.name, this.slotCenter.x + 10, this.slotCenter.y);
    ctx.restore();
  }
};

// src/node/slot/GraphNodeOutput.ts
var GraphNodeOutput = class {
  constructor(node) {
    this.connections = [];
    this.properties = NodeSlotProperties.default();
    this.properties.name = "output";
    this.slotCenter = { x: 0, y: 0 };
    this.node = node;
  }
  removeConnection(connection) {
    const connectionIndex = this.connections.indexOf(connection);
    if (connectionIndex != -1) {
      this.connections.splice(connectionIndex, 1);
    }
  }
  addConnection(connection) {
    this.connections.push(connection);
  }
  draw(ctx) {
    ctx.save();
    const margin = this.node.properties.horizontalSlots ? 0 : this.properties.margin;
    this.slotCenter = { x: this.properties.position.x - margin + this.properties.size.w, y: this.properties.position.y + this.properties.size.h / 2 };
    if (this.isHighlighted) {
      ctx.fillStyle = "white";
      ctx.strokeStyle = "white";
    } else {
      ctx.fillStyle = this.properties.slotColor;
      ctx.strokeStyle = this.properties.slotColor;
    }
    ctx.beginPath();
    ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    if (this.connections.length > 0) {
      ctx.beginPath();
      ctx.arc(this.slotCenter.x, this.slotCenter.y, this.properties.slotRadius - 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
    ctx.fillStyle = this.properties.textColor;
    ctx.font = "9pt Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(this.properties.name, this.slotCenter.x - 10, this.slotCenter.y);
    ctx.restore();
  }
};

// src/defaults/NodeWidgetProperties.ts
var NodeWidgetProperties = class {
  static default() {
    return {
      position: { x: 0, y: 0 },
      size: { w: 200, h: 20 },
      color: "#333333",
      name: "",
      value: "",
      topMargin: 5,
      sideMargin: 5
    };
  }
};

// src/widgets/NodeHeaderWidget.ts
var NodeHeaderWidget = class {
  constructor(title) {
    this.properties = NodeWidgetProperties.default();
    this.properties.statusColor = "#999999";
    this.properties.name = title;
    this.properties.size.h = 30;
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.properties.color;
    ctx.fillRect(this.properties.position.x, this.properties.position.y, this.properties.size.w, this.properties.size.h);
    ctx.fillStyle = this.properties.statusColor;
    ctx.beginPath();
    ctx.arc(this.properties.position.x + 10, this.properties.position.y + this.properties.size.h / 2, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "#999999";
    ctx.font = "10pt Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(this.properties.name, this.properties.position.x + 10 * 2, this.properties.position.y + this.properties.size.h / 2 + 1);
    ctx.strokeStyle = "#262626";
    ctx.beginPath();
    ctx.moveTo(this.properties.position.x, this.properties.position.y + this.properties.size.h);
    ctx.lineTo(this.properties.position.x + this.properties.size.w, this.properties.position.y + this.properties.size.h);
    ctx.stroke();
    ctx.restore();
  }
};

// src/node/GraphNode.ts
var GraphNode = class {
  constructor(graph, path, title) {
    this.inputs = [];
    this.outputs = [];
    this.widgets = [];
    this.onMouseEvent = (event, type) => {
      if (type == MouseEventTypes.UP && this.onMouseUp)
        this.onMouseUp(event);
      else if (type == MouseEventTypes.DOWN && this.onMouseDown)
        this.onMouseDown(event);
      else if (type == MouseEventTypes.MOVE && this.onMouseMove)
        this.onMouseMove(event);
      else if (type == MouseEventTypes.WHEEL && this.onMouseWheel)
        this.onMouseWheel(event);
      for (let widget of this.widgets) {
        if (type == MouseEventTypes.UP && widget.onMouseUp)
          widget.onMouseUp(event);
        else if (type == MouseEventTypes.DOWN && widget.onMouseDown)
          widget.onMouseDown(event);
        else if (type == MouseEventTypes.MOVE && widget.onMouseMove)
          widget.onMouseMove(event);
        else if (type == MouseEventTypes.WHEEL && widget.onMouseWheel)
          widget.onMouseWheel(event);
      }
    };
    this.graph = graph;
    this.properties = NodeProperties.default();
    this.properties.path = path;
    this.header = new NodeHeaderWidget(title ? title : "");
  }
  onTrigger(from) {
  }
  onConnectionsChange(from, to) {
  }
  onAdded() {
  }
  onRemoved() {
  }
  onSerialize() {
  }
  onDeserialized() {
  }
  onMouseUp(event) {
  }
  onMouseDown(event) {
  }
  onMouseMove(event) {
  }
  onMouseWheel(event) {
  }
  addInput(name, type) {
    const input = new GraphNodeInput(this);
    input.properties.name = name;
    input.properties.type = type;
    this.inputs.push(input);
    this.graph.dirtyCanvas = true;
    return input;
  }
  addOutput(name, type) {
    const output = new GraphNodeOutput(this);
    output.properties.name = name;
    output.properties.type = type;
    this.outputs.push(output);
    this.graph.dirtyCanvas = true;
    return output;
  }
  removeInput(input) {
    for (let i = 0; i < this.inputs.length; i++) {
      if (input == this.inputs[i]) {
        this.inputs.splice(i, 1);
        this.graph.dirtyCanvas = true;
        break;
      }
    }
  }
  removeOutput(output) {
    for (let i = 0; i < this.outputs.length; i++) {
      if (output == this.outputs[i]) {
        this.outputs.splice(i, 1);
        this.graph.dirtyCanvas = true;
        break;
      }
    }
  }
  getInputByUuid(uuid) {
    for (let input of this.inputs) {
      if (input.properties.uuid == uuid)
        return input;
    }
    return null;
  }
  getOutputByUuid(uuid) {
    for (let output of this.outputs) {
      if (output.properties.uuid == uuid)
        return output;
    }
    return null;
  }
  addWidget(widget) {
    this.widgets.push(widget);
    this.graph.dirtyCanvas = true;
    return widget;
  }
  removeWidget(widget) {
    for (let i = 0; i < this.widgets.length; i++) {
      if (widget == this.widgets[i]) {
        this.widgets.splice(i, 1);
        this.graph.dirtyCanvas = true;
        break;
      }
    }
  }
  triggerOutput(index) {
    if (this.outputs.length >= index) {
      const output = this.outputs[index];
      for (let connection of output.connections) {
        if (connection.output == output) {
          connection.input.properties.value = connection.output.properties.value;
          connection.input.node.onTrigger(connection);
          connection.trigger();
        }
      }
    }
  }
  getInputData(index) {
    if (this.inputs.length >= index)
      return this.inputs[index].properties.value;
  }
  getOutputData(index) {
    if (this.outputs.length >= index)
      return this.outputs[index].properties.value;
  }
  setOutputData(index, data) {
    if (this.outputs.length >= index)
      this.outputs[index].properties.value = data;
  }
  connectInputToOutput(from, to) {
    if (!this.isValidConnection(to, from))
      return null;
    if (to.connection)
      to.node.removeConnection(to.connection);
    const connection = new GraphNodeConnection(to, from);
    to.setConnection(connection);
    from.addConnection(connection);
    from.node.onConnectionsChange(from, to);
    to.node.onConnectionsChange(from, to);
    return connection;
  }
  connect(outputIndex, targetNode, inputIndex) {
    if (targetNode.inputs.length < inputIndex || this.outputs.length < outputIndex)
      return null;
    const input = targetNode.inputs[inputIndex];
    const output = this.outputs[outputIndex];
    return this.connectInputToOutput(output, input);
  }
  isValidConnection(to, from) {
    if (!to || !from)
      return false;
    if (to.properties.type != from.properties.type)
      return false;
    if (to.node == from.node)
      return false;
    return true;
  }
  removeConnection(connection) {
    connection.input.removeConnection();
    connection.output.removeConnection(connection);
  }
  disconnectInput(index) {
    if (this.inputs.length < index)
      return;
    if (this.inputs[index].connection) {
      this.removeConnection(this.inputs[index].connection);
    }
  }
  disconnectOutput(index, targetNode) {
    if (this.outputs.length < index)
      return;
    for (let connection of this.outputs[index].connections) {
      if (targetNode && connection.input.node == targetNode) {
        this.removeConnection(connection);
        break;
      } else {
        this.removeConnection(connection);
      }
    }
  }
  calculateNodeSize() {
    const headerSize = this.header.properties.size;
    const slotsSize = this.calculateSlotsSize();
    const widgetsSize = this.calculateWidgetsSize();
    let nodeSize = { w: 0, h: headerSize.h + slotsSize.h + widgetsSize.h + 5 };
    if (headerSize.w > nodeSize.w)
      nodeSize.w = headerSize.w;
    if (slotsSize.w > nodeSize.w)
      nodeSize.w = slotsSize.w;
    if (widgetsSize.w > nodeSize.w)
      nodeSize.w = widgetsSize.w;
    return { header: headerSize, slots: slotsSize, widgets: widgetsSize, node: nodeSize };
  }
  calculateSlotsSize() {
    let inputsSize = { w: 0, h: 0 };
    if (!this.properties.horizontalSlots) {
      for (let input of this.inputs) {
        if (input.properties.size.w > inputsSize.w)
          inputsSize.w = input.properties.size.w;
        inputsSize.h += input.properties.size.h;
      }
    }
    let outputsSize = { w: 0, h: 0 };
    if (!this.properties.horizontalSlots) {
      for (let output of this.outputs) {
        if (output.properties.size.w > outputsSize.w)
          outputsSize.w = output.properties.size.w;
        outputsSize.h += output.properties.size.h;
      }
    }
    return { w: inputsSize.w > outputsSize.w ? inputsSize.w : outputsSize.w, h: inputsSize.h > outputsSize.h ? inputsSize.h : outputsSize.h };
  }
  calculateWidgetsSize() {
    let widgetsSize = { w: 0, h: 0 };
    for (let widget of this.widgets) {
      if (widget.properties.size.w > widgetsSize.w)
        widgetsSize.w = widget.properties.size.w;
      widgetsSize.h += widget.properties.size.h + widget.properties.topMargin;
    }
    return widgetsSize;
  }
  drawConnections(ctx) {
    for (let output of this.outputs) {
      for (let connection of output.connections) {
        connection.draw(ctx);
      }
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.properties.color;
    const sizes = this.calculateNodeSize();
    this.properties.size = sizes.node;
    ctx.fillRect(this.properties.position.x, this.properties.position.y, this.properties.size.w, this.properties.size.h);
    this.header.properties.size.w = sizes.node.w;
    this.header.properties.position = { x: this.properties.position.x, y: this.properties.position.y };
    this.header.draw(ctx);
    const nodeContentPosition = { x: this.properties.position.x, y: this.properties.position.y + this.header.properties.size.h };
    let inputsY = nodeContentPosition.y;
    for (let i = 0; i < this.inputs.length; i++) {
      if (this.properties.horizontalSlots) {
        this.inputs[i].properties.position = { x: this.properties.position.x + (i + 0.5) * (this.properties.size.w / this.inputs.length), y: this.properties.position.y - 10 };
      } else {
        this.inputs[i].properties.position = { x: this.properties.position.x, y: inputsY };
        this.inputs[i].draw(ctx);
        inputsY += this.inputs[i].properties.size.h;
      }
      this.inputs[i].draw(ctx);
    }
    let outputsY = nodeContentPosition.y;
    for (let i = 0; i < this.outputs.length; i++) {
      if (this.properties.horizontalSlots) {
        const x = (i + 0.5) * (this.properties.size.w / this.outputs.length);
        this.outputs[i].properties.position = { x: this.properties.position.x - this.properties.size.w + x, y: this.properties.position.y + this.properties.size.h - 10 };
      } else {
        this.outputs[i].properties.position = { x: this.properties.position.x, y: outputsY };
        this.outputs[i].draw(ctx);
        outputsY += this.outputs[i].properties.size.h;
      }
      this.outputs[i].draw(ctx);
    }
    let widgetsY = nodeContentPosition.y + sizes.slots.h;
    for (let i = 0; i < this.widgets.length; i++) {
      this.widgets[i].properties.position = { x: this.properties.position.x, y: widgetsY + this.widgets[i].properties.topMargin };
      if (this.widgets[i].draw)
        this.widgets[i].draw(ctx);
      widgetsY += this.widgets[i].properties.size.h + this.widgets[i].properties.topMargin;
    }
    ctx.restore();
  }
};

// src/widgets/ButtonWidget.ts
var ButtonWidget = class {
  constructor(node, callback) {
    this.color = "#222222";
    this.properties = NodeWidgetProperties.default();
    this.properties.name = "Button";
    this.node = node;
    this.callback = callback;
  }
  onMouseDown(event) {
    this.isMouseInside = Utils.isPointInsideRect(this.properties.position, this.properties.size, event.position);
    if (this.isMouseInside) {
      this.node.graph.panAndZoomEnabled = false;
      this.node.graph.nodeSelectionEnabled = false;
      this.color = "#4d4d4d";
      this.node.graph.dirtyCanvas = true;
      setTimeout(() => {
        this.node.graph.panAndZoomEnabled = true;
        this.node.graph.nodeSelectionEnabled = true;
        this.color = "#222222";
        this.node.graph.dirtyCanvas = true;
      }, 100);
      this.callback();
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "gray";
    ctx.fillStyle = this.color;
    ctx.strokeRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y, this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);
    ctx.fillRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y, this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);
    ctx.fillStyle = "white";
    ctx.font = "8pt Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.properties.name, this.properties.position.x + this.properties.size.w / 2, this.properties.position.y + this.properties.size.h / 2);
    ctx.restore();
  }
};

// src/widgets/TextWidget.ts
var TextWidget = class {
  constructor(node) {
    this.color = "#222222";
    this.node = node;
    this.properties = NodeWidgetProperties.default();
    this.properties.name = "Label";
    this.properties.value = "Text";
    this.properties.size.h = 20;
    document.body.addEventListener("keydown", (event) => {
      this.onKeyDown(event);
    });
  }
  onChange() {
  }
  onKeyDown(event) {
    if (this.ele) {
      if (event.key == "Shift" || event.key == "Meta")
        return;
      if (event.key == "Backspace") {
        this.properties.value = this.properties.value.substr(0, this.properties.value.length - 1);
      } else if (event.key == "Enter" || event.key == "Escape") {
        this.doneEditing();
      } else {
        this.properties.value += event.key;
      }
      this.node.graph.dirtyCanvas = true;
    }
  }
  doneEditing() {
    this.color = "#222222";
    if (this.ele) {
      document.body.removeChild(this.ele);
      this.ele = null;
      this.node.graph.panAndZoomEnabled = true;
      this.node.graph.nodeSelectionEnabled = true;
      this.onChange();
    }
  }
  onMouseDown(event) {
    const selected = Utils.isPointInsideRect(this.properties.position, this.properties.size, event.position);
    if (!selected && this.ele) {
      this.doneEditing();
      return;
    } else if (selected) {
      this.node.graph.panAndZoomEnabled = false;
      this.node.graph.nodeSelectionEnabled = false;
      this.color = "#4d4d4d";
      this.ele = document.createElement("input");
      this.ele.style.position = "absolute";
      this.ele.style.top = this.properties.position.y + "px";
      this.ele.style.left = "-1000px";
      this.ele.style.zIndex = "-999999";
      this.ele.setAttribute("autocomplete", "off");
      document.body.appendChild(this.ele);
      this.node.graph.canvas.addEventListener("click", () => {
        this.ele.focus();
      }, { once: true });
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "gray";
    ctx.fillStyle = this.color;
    ctx.strokeRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y, this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);
    ctx.fillRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y, this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);
    const labelSize = ctx.measureText(this.properties.name);
    ctx.fillStyle = "gray";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(this.properties.name, this.properties.position.x + this.properties.sideMargin + 10, this.properties.position.y + 1 + this.properties.size.h / 2);
    ctx.rect(this.properties.position.x + labelSize.width + this.properties.sideMargin + 10 + 5, this.properties.position.y, this.properties.size.w, this.properties.size.w);
    ctx.clip();
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(this.properties.value, this.properties.position.x + this.properties.size.w - this.properties.sideMargin - 10, this.properties.position.y + 1 + this.properties.size.h / 2);
    ctx.restore();
  }
};

// src/widgets/SelectWidget.ts
var SelectWidget = class extends TextWidget {
  constructor(node) {
    super(node);
    this.onChanged = (selectedIndex) => {
    };
    this.currentSelectedIndex = 0;
    this.leftArrowColor = "white";
    this.rightArrowColor = "white";
    this.properties.options = [];
    this.properties.sideMargin = 15;
  }
  setOptions(options) {
    this.properties.options = options;
    setTimeout(() => {
      this.node.graph.dirtyCanvas = true;
    }, 50);
  }
  onMouseDown(event) {
    if (this.properties.options.length == 0)
      return;
    if (event.button != MouseButton.LEFT)
      return;
    const leftArrowPosition = { x: this.properties.position.x, y: this.properties.position.y };
    const leftArrowSize = { w: this.properties.sideMargin, h: this.properties.size.h };
    const rightArrowPosition = { x: this.properties.position.x + this.properties.size.w - this.properties.sideMargin, y: this.properties.position.y };
    const rightArrowSize = { w: this.properties.sideMargin, h: this.properties.size.h };
    let clickedArrow = "none";
    if (Utils.isPointInsideRect(leftArrowPosition, leftArrowSize, event.position)) {
      if (this.currentSelectedIndex == 0)
        this.currentSelectedIndex = this.properties.options.length - 1;
      else
        this.currentSelectedIndex--;
      clickedArrow = "left";
    } else if (Utils.isPointInsideRect(rightArrowPosition, rightArrowSize, event.position)) {
      if (this.currentSelectedIndex == this.properties.options.length - 1)
        this.currentSelectedIndex = 0;
      else
        this.currentSelectedIndex++;
      clickedArrow = "right";
    }
    if (clickedArrow != "none") {
      this.onChanged(this.currentSelectedIndex);
      this.node.graph.panAndZoomEnabled = false;
      this.node.graph.nodeSelectionEnabled = false;
      if (clickedArrow == "left")
        this.leftArrowColor = "#4d4d4d";
      else if (clickedArrow == "right")
        this.rightArrowColor = "#4d4d4d";
      setTimeout(() => {
        this.node.graph.panAndZoomEnabled = true;
        this.node.graph.nodeSelectionEnabled = true;
        this.leftArrowColor = "white";
        this.rightArrowColor = "white";
        this.node.graph.dirtyCanvas = true;
      }, 100);
    }
  }
  draw(ctx) {
    super.draw(ctx);
    ctx.save();
    ctx.fillStyle = this.leftArrowColor;
    ctx.fillText("\u140A", this.properties.position.x + 3, this.properties.position.y + 5 + this.properties.size.h / 2);
    if (this.properties.options.length != 0) {
      this.properties.value = this.properties.options[this.currentSelectedIndex];
    }
    ctx.fillStyle = this.rightArrowColor;
    ctx.fillText("\u1405", this.properties.position.x - 11 + this.properties.size.w, this.properties.position.y + 5 + this.properties.size.h / 2);
    ctx.restore();
  }
};

// src/subgraph/SubgraphInput.ts
var SubgraphInput = class extends GraphNode {
  onInputAdded(output) {
  }
  onInputRemoved(output) {
  }
  constructor(graph, path) {
    super(graph, path, "Subgraph Inputs");
    this.addBtn = new ButtonWidget(this, () => {
      this.onAddBtn();
    });
    this.addBtn.properties.name = "Add new";
    this.addWidget(this.addBtn);
    this.removeBtn = new ButtonWidget(this, () => {
      this.onRemoveBtn();
    });
    this.removeBtn.properties.name = "Remove last";
    this.addWidget(this.removeBtn);
  }
  onAddBtn() {
    const name = prompt("Input name");
    const type = prompt("Input type");
    const input = this.addInput(name, type);
    const output = this.addOutput(name, type);
    this.onInputAdded(input);
  }
  onRemoveBtn() {
    if (this.outputs.length == 0)
      return;
    if (this.inputs.length == 0)
      return;
    const input = this.inputs[this.inputs.length - 1];
    const output = this.outputs[this.outputs.length - 1];
    this.removeInput(input);
    this.removeOutput(output);
    this.onInputRemoved(input);
  }
};

// src/subgraph/SubgraphOutput.ts
var SubgraphOutput = class extends GraphNode {
  onOutputAdded(output) {
  }
  onOutputRemoved(output) {
  }
  onOutputTrigger(output) {
  }
  constructor(graph, path) {
    super(graph, path, "Subgraph Outputs");
    this.addBtn = new ButtonWidget(this, () => {
      this.onAddBtn();
    });
    this.addBtn.properties.name = "Add new";
    this.addWidget(this.addBtn);
    this.removeBtn = new ButtonWidget(this, () => {
      this.onRemoveBtn();
    });
    this.removeBtn.properties.name = "Remove last";
    this.addWidget(this.removeBtn);
  }
  onAddBtn() {
    const name = prompt("Output name");
    const type = prompt("Output type");
    const input = this.addInput(name, type);
    const output = this.addOutput(name, type);
    this.onOutputAdded(output);
  }
  onRemoveBtn() {
    if (this.inputs.length == 0)
      return;
    if (this.outputs.length == 0)
      return;
    const input = this.inputs[this.inputs.length - 1];
    const output = this.outputs[this.outputs.length - 1];
    this.removeInput(input);
    this.removeOutput(output);
    this.onOutputRemoved(output);
  }
  onTrigger(from) {
    for (let i = 0; i < this.inputs.length; i++) {
      if (this.inputs[i] === from.input) {
        this.outputs[i].properties.value = this.inputs[i].properties.value;
        this.onOutputTrigger(this.outputs[i]);
        break;
      }
    }
  }
};

// src/subgraph/Subgraph.ts
var Subgraph = class extends GraphNode {
  constructor(graph, path) {
    super(graph, path, "Subgraph");
    this.subgraphInputToLocalInput = new Map();
    this.subgraphOutputToLocalOutput = new Map();
    this.openSubgraph = new ButtonWidget(this, () => this.onOpenSubgraph());
    this.openSubgraph.properties.name = "Open";
    this.addWidget(this.openSubgraph);
    this.subgraphCanvas = document.createElement("canvas");
    this.subgraphCanvas.style.display = "none";
    this.subgraphCanvas.style.backgroundColor = "#202020";
    this.graph.canvas.parentElement.appendChild(this.subgraphCanvas);
    this.closeSubgraphBtn = document.createElement("button");
    this.closeSubgraphBtn.textContent = "Close subgraph";
    this.closeSubgraphBtn.style.position = "absolute";
    this.closeSubgraphBtn.style.top = "0";
    this.closeSubgraphBtn.style.left = "0";
    this.closeSubgraphBtn.style.fontSize = "20px";
    this.closeSubgraphBtn.style.borderBottomRightRadius = "10px";
    this.closeSubgraphBtn.addEventListener("click", (event) => {
      this.onCloseSubgraph();
    });
    this.subgraph = new Graph(this.subgraphCanvas);
    this.subgraph.registerNode("SubgraphInput", SubgraphInput);
    this.subgraph.registerNode("SubgraphOutput", SubgraphOutput);
    for (let nodeTypeMap of this.graph.nodeTypes) {
      this.subgraph.registerNode(nodeTypeMap[0], nodeTypeMap[1]);
    }
    this.subgraphInputNode = this.subgraph.createNode("SubgraphInput");
    this.subgraphOutputNode = this.subgraph.createNode("SubgraphOutput");
    this.setupSlotEvents();
  }
  setupSlotEvents() {
    if (this.subgraphInputNode) {
      this.subgraphInputNode.onInputAdded = (input) => {
        this.onSubgraphInputSlotAdded(input);
      };
      this.subgraphInputNode.onInputRemoved = (input) => {
        this.onSubgraphInputSlotRemoved(input);
      };
    }
    if (this.subgraphOutputNode) {
      this.subgraphOutputNode.onOutputAdded = (output) => {
        this.onSubgraphOutputSlotAdded(output);
      };
      this.subgraphOutputNode.onOutputRemoved = (output) => {
        this.onSubgraphOutputSlotRemoved(output);
      };
      this.subgraphOutputNode.onOutputTrigger = (output) => {
        this.onSubgraphOutputTrigger(output);
      };
    }
  }
  onOpenSubgraph() {
    this.graph.canvas.style.display = "none";
    this.subgraphCanvas.style.display = "";
    document.body.appendChild(this.closeSubgraphBtn);
  }
  onCloseSubgraph() {
    this.graph.canvas.style.display = "";
    this.subgraphCanvas.style.display = "none";
    if (document.body.contains(this.closeSubgraphBtn)) {
      document.body.removeChild(this.closeSubgraphBtn);
    }
    this.graph.dirtyCanvas = true;
  }
  onSubgraphOutputSlotAdded(output) {
    if (this.subgraphOutputToLocalOutput.has(output))
      return;
    const localOutput = this.addOutput(output.properties.name, output.properties.type);
    this.subgraphOutputToLocalOutput.set(output, localOutput);
    this.graph.dirtyCanvas = true;
  }
  onSubgraphOutputSlotRemoved(output) {
    if (!this.subgraphOutputToLocalOutput.has(output))
      return;
    const localOutput = this.subgraphOutputToLocalOutput.get(output);
    this.removeOutput(localOutput);
    this.subgraphOutputToLocalOutput.delete(output);
    this.graph.dirtyCanvas = true;
  }
  onSubgraphInputSlotAdded(input) {
    if (this.subgraphInputToLocalInput.has(input))
      return;
    const localInput = this.addInput(input.properties.name, input.properties.type);
    this.subgraphInputToLocalInput.set(input, localInput);
    this.graph.dirtyCanvas = true;
  }
  onSubgraphInputSlotRemoved(input) {
    if (!this.subgraphInputToLocalInput.has(input))
      return;
    const localInput = this.subgraphInputToLocalInput.get(input);
    this.removeInput(localInput);
    this.subgraphInputToLocalInput.delete(input);
    this.graph.dirtyCanvas = true;
  }
  onConnectionsChange(from, to) {
  }
  onTrigger(connection) {
    let inputIndex = 0;
    this.subgraphInputToLocalInput.forEach((localInput, subgraphInput) => {
      if (connection.input === localInput) {
        subgraphInput.node.setOutputData(inputIndex, localInput.properties.value);
        subgraphInput.node.triggerOutput(inputIndex);
      }
      inputIndex++;
    });
  }
  onSubgraphOutputTrigger(output) {
    if (!this.subgraphOutputToLocalOutput.has(output))
      return;
    const localOutput = this.subgraphOutputToLocalOutput.get(output);
    const localOutputIndex = this.outputs.indexOf(localOutput);
    if (localOutputIndex != -1) {
      this.setOutputData(localOutputIndex, output.properties.value);
      this.triggerOutput(localOutputIndex);
    }
  }
  onRemoved() {
    this.onCloseSubgraph();
    if (this.graph.canvas.parentElement.contains(this.subgraphCanvas)) {
      this.graph.canvas.parentElement.removeChild(this.subgraphCanvas);
    }
  }
  onSerialize() {
    console.log("onSerialize");
    this.properties.graphJSON = this.subgraph.toJSON();
  }
  onDeserialized() {
    console.log("onDeserialized");
    console.log(this.properties);
    if (this.properties.graphJSON) {
      this.subgraph.fromJSON(this.properties.graphJSON);
    }
    for (let node of this.subgraph.nodes) {
      if (node.properties.path == "SubgraphInput")
        this.subgraphInputNode = node;
      else if (node.properties.path == "SubgraphOutput")
        this.subgraphOutputNode = node;
    }
    this.setupSlotEvents();
    if (this.subgraphInputNode.inputs.length == this.inputs.length) {
      for (let i = 0; i < this.subgraphInputNode.inputs.length; i++) {
        this.subgraphInputToLocalInput.set(this.subgraphInputNode.inputs[i], this.inputs[i]);
      }
    }
    if (this.subgraphOutputNode.outputs.length == this.outputs.length) {
      console.log("here");
      for (let i = 0; i < this.subgraphOutputNode.outputs.length; i++) {
        this.subgraphOutputToLocalOutput.set(this.subgraphOutputNode.outputs[i], this.outputs[i]);
      }
    }
    console.log(this);
  }
};
export {
  ButtonWidget,
  Graph,
  GraphNode,
  GraphNodeInput,
  GraphNodeOutput,
  SelectWidget,
  Subgraph,
  TextWidget,
  Utils
};
