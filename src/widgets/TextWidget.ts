import { NodeWidgetProperties } from "../defaults/NodeWidgetProperties";
import { IMouseEvent } from "../interfaces/IMouseEvent";
import { INodeWidget } from "../interfaces/INodeWidget";
import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";
import { GraphNode } from "../node/GraphNode";
import { Utils } from "../Utils";

export class TextWidget implements INodeWidget {
    public properties: INodeWidgetProperties;

    public onChange() {};

    public node: GraphNode;
    public color = "#222222";
    private ele: HTMLInputElement;

    constructor(node: GraphNode) {
        this.node = node;

        this.properties = NodeWidgetProperties.default();
        this.properties.name = "Label";
        this.properties.value = "Text";

        this.properties.size.h = 20;

        document.body.addEventListener("keydown", (event) => {this.onKeyDown(event)});
    }

    private onKeyDown(event: KeyboardEvent) {
        if (this.ele) {
            if (event.key == "Shift" || event.key == "Meta") return;

            if (event.key == "Backspace") {
                this.properties.value = this.properties.value.substr(0, this.properties.value.length-1);
            }
            else if (event.key == "Enter" || event.key == "Escape") {
                // this.properties.value += "\n";
                this.doneEditing();
            }
            else {
                this.properties.value += event.key;
            }
            this.node.graph.dirtyCanvas = true;
        }
    }

    private doneEditing() {
        this.color = "#222222"
        if (this.ele) {
            document.body.removeChild(this.ele);
            this.ele = null;

            this.node.graph.panAndZoomEnabled = true;
            this.node.graph.nodeSelectionEnabled = true;

            this.onChange();
        }
    }

    public onMouseDown(event: IMouseEvent) {
        const selected = Utils.isPointInsideRect(this.properties.position, this.properties.size, event.position);

        if (!selected && this.ele) {
            this.doneEditing();
            return;
        }
        else if (selected) {
            this.node.graph.panAndZoomEnabled = false;
            this.node.graph.nodeSelectionEnabled = false;
            
            this.color = "#4d4d4d";
            
            this.ele = document.createElement("input");
            this.ele.style.position = "absolute";
            this.ele.style.top = this.properties.position.y + "px";
            this.ele.style.left = "-1000px";
            this.ele.style.zIndex = "-999999";
            this.ele.setAttribute("autocomplete", "off")
            document.body.appendChild(this.ele);
            
            // @ts-ignore
            this.node.graph.canvas.addEventListener("click", () => {
    
                this.ele.focus();
    
            }, {once: true})
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.strokeStyle = "gray";
        ctx.fillStyle = this.color;
        ctx.strokeRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y , this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);
        ctx.fillRect(this.properties.position.x + this.properties.sideMargin, this.properties.position.y , this.properties.size.w - this.properties.sideMargin * 2, this.properties.size.h);

        // ctx.font = "8pt Arial";

        // Label
        const labelSize = ctx.measureText(this.properties.name);
        ctx.fillStyle = "gray";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle"
        ctx.fillText(this.properties.name, this.properties.position.x + this.properties.sideMargin + 10, this.properties.position.y + 1 + (this.properties.size.h) / 2);

        // Text
        ctx.rect(this.properties.position.x + labelSize.width + this.properties.sideMargin + 10 + 5, this.properties.position.y, this.properties.size.w, this.properties.size.w);
        ctx.clip();
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle"
        ctx.fillText(this.properties.value, this.properties.position.x + this.properties.size.w - this.properties.sideMargin - 10, this.properties.position.y + 1 + (this.properties.size.h) / 2);

        ctx.restore();
    }
}