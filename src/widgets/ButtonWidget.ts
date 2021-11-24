import { NodeWidgetProperties } from "../defaults/NodeWidgetProperties";
import { IMouseEvent } from "../interfaces/IMouseEvent";
import { INodeWidget } from "../interfaces/INodeWidget";
import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";
import { GraphNode } from "../node/GraphNode";
import { Utils } from "../Utils";

export class ButtonWidget implements INodeWidget {
    public properties: INodeWidgetProperties;

    private node: GraphNode;
    private color = "#222222";
    private isMouseInside: boolean;

    private callback: () => void;
    
    constructor(node: GraphNode, callback: () => void) {
        this.properties = NodeWidgetProperties.default();
        this.properties.name = "Button";

        this.node = node;
        this.callback = callback;
    }

    public onMouseDown(event: IMouseEvent) {
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

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.strokeStyle = "gray";
        ctx.fillStyle = this.color;
        ctx.strokeRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y , this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);
        ctx.fillRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y , this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);

        ctx.fillStyle = "white";
        ctx.font = "8pt Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"
        ctx.fillText(this.properties.name, this.properties.position.x + this.properties.size.w / 2, this.properties.position.y + this.properties.size.h / 2);

        ctx.restore();
    }
}