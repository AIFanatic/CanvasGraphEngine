import { Utils } from "./Utils";
import { GraphNode } from "./node/GraphNode";
import { GraphPanAndZoom } from "./GraphPanAndZoom";
import { GraphSelection } from "./GraphSelection";
import { GraphSerializer } from "./GraphSerializer";
import { IGraphSerializeNode } from "./GraphSerializer";
import { IMouseEvent, MouseEventTypes } from "./interfaces/IMouseEvent";

export class Graph {
    public nodes: GraphNode[] = [];
    public dirtyCanvas: boolean = true;
    public panAndZoomEnabled: boolean = true;
    public nodeSelectionEnabled: boolean = true;

    public canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private graphPanAndZoom: GraphPanAndZoom;
    private graphSelection: GraphSelection;

    private nodeTypes: Map<string, typeof GraphNode>;

    constructor(canvas: HTMLCanvasElement) {
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

        requestAnimationFrame(() => { this.draw(this.ctx) });

        this.onResize(null);
    }

    public registerNode(path: string, node: typeof GraphNode) {
        this.nodeTypes.set(path, node);
    }
    
    public unregisterNode(path: string) {
        this.nodeTypes.delete(path);
    }

    public clearNodes() {
        for (let node of this.nodes) {
            node.onRemoved();
        }
        this.nodes = [];
        this.dirtyCanvas = true;
    }

    public createNode(path: string, title: string = ""): GraphNode {
        if (this.nodeTypes.has(path)) {
            const Node = this.nodeTypes.get(path);
            const nodeInstance = new Node(this, path, title);
            this.nodes.push(nodeInstance);
            nodeInstance.onAdded();
            return nodeInstance;
        }
        return null;
    }

    private draw(ctx: CanvasRenderingContext2D) {
        if (this.dirtyCanvas) {
            this.dirtyCanvas = false;

            // Clear the entire canvas
            var p1 = this.graphPanAndZoom.transformedPoint(0,0);
            var p2 = this.graphPanAndZoom.transformedPoint(ctx.canvas.width, ctx.canvas.height);
            ctx.clearRect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);
    
            // Connections first so they stay in background, not efficient.
            for (let node of this.nodes) {
                node.drawConnections(ctx);
            }
            for (let node of this.nodes) {
                node.draw(ctx);
            }
    
            this.graphSelection.draw(ctx);
        }

        requestAnimationFrame(() => { this.draw(this.ctx) });
    }

    private processMouseOrTouchEvent(event: MouseEvent | TouchEvent | WheelEvent, type: MouseEventTypes): IMouseEvent {
        let mouseEvent: IMouseEvent = {position: {x: 0, y: 0}, button: 0, rawEvent: event};

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

    private onMouseWheel(event: WheelEvent) {
        const mouseEvent: IMouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.WHEEL);
        if (this.panAndZoomEnabled) this.graphPanAndZoom.onMouseWheel(mouseEvent);
        event.preventDefault()
    }

    private onMouseOrTouchUp(event: MouseEvent | TouchEvent) {
        const mouseEvent: IMouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.UP);
        this.graphPanAndZoom.onMouseUp(mouseEvent);
        this.graphSelection.onMouseUp(mouseEvent);
        event.preventDefault();
    }

    private onMouseOrTouchDown(event: MouseEvent | TouchEvent) {
        const mouseEvent: IMouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.DOWN);

        if (this.panAndZoomEnabled) this.graphPanAndZoom.onMouseDown(mouseEvent);
        if (this.nodeSelectionEnabled) this.graphSelection.onMouseDown(mouseEvent);
        event.preventDefault();
    }

    private onMouseOrTouchMove(event: MouseEvent | TouchEvent) {
        const mouseEvent: IMouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.MOVE);
        const graphSelectionBubble = this.graphSelection.onMouseMove(mouseEvent);

        if (graphSelectionBubble) {
            this.graphPanAndZoom.onMouseMove(mouseEvent);
        }
        event.preventDefault();
    }

    private onResize(event: UIEvent) {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        Utils.scaleCanvas(this.canvas, this.ctx, this.canvas.width, this.canvas.height);

        this.graphPanAndZoom = new GraphPanAndZoom(this.ctx);
        this.dirtyCanvas = true;
    }

    public toJSON(): IGraphSerializeNode[] {
        return GraphSerializer.toJSON(this);
    }

    public fromJSON(serialized: IGraphSerializeNode[]) {
        GraphSerializer.fromJSON(this, serialized);
    }
}