import { TextWidget } from "..";
import { IMouseEvent, MouseButton } from "../interfaces/IMouseEvent";
import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";
import { IPosition } from "../interfaces/IPosition";
import { ISize } from "../interfaces/ISize";
import { GraphNode } from "../node/GraphNode";
import { Utils } from "../Utils";

interface ISelectWidgetProperties extends INodeWidgetProperties {
    options?: string[]
}

export class SelectWidget extends TextWidget {
    public properties: ISelectWidgetProperties;
    public onChanged = (selectedIndex: number) => {};

    private currentSelectedIndex: number = 0;
    private leftArrowColor = "white";
    private rightArrowColor = "white";

    
    constructor(node: GraphNode) {
        super(node);
        this.properties.options = [];
        this.properties.sideMargin = 15;
    }

    public setOptions(options: string[]) {
        this.properties.options = options;
        // Needs a small delay since options can be set from nodes constructors (before draw)
        setTimeout(() => {
            this.node.graph.dirtyCanvas = true;
        }, 50);
    }

    public onMouseDown(event: IMouseEvent) {
        if (this.properties.options.length == 0) return;
        if (event.button != MouseButton.LEFT) return;
        
        const leftArrowPosition: IPosition = {x: this.properties.position.x, y: this.properties.position.y};
        const leftArrowSize: ISize = {w: this.properties.sideMargin, h: this.properties.size.h};
        const rightArrowPosition: IPosition = {x: this.properties.position.x + this.properties.size.w - this.properties.sideMargin, y: this.properties.position.y};
        const rightArrowSize: ISize = {w: this.properties.sideMargin, h: this.properties.size.h};

        let clickedArrow: "none"|"left"|"right" = "none";
        if (Utils.isPointInsideRect(leftArrowPosition, leftArrowSize, event.position)) {
            if (this.currentSelectedIndex == 0) this.currentSelectedIndex = this.properties.options.length - 1;
            else this.currentSelectedIndex--;
            clickedArrow = "left";
        }
        else if (Utils.isPointInsideRect(rightArrowPosition, rightArrowSize, event.position)) {
            if (this.currentSelectedIndex == this.properties.options.length - 1) this.currentSelectedIndex = 0;
            else this.currentSelectedIndex++;
            clickedArrow = "right";
        }

        if (clickedArrow != "none") {
            this.onChanged(this.currentSelectedIndex);
            this.node.graph.panAndZoomEnabled = false;
            this.node.graph.nodeSelectionEnabled = false;

            if (clickedArrow == "left") this.leftArrowColor = "#4d4d4d";
            else if (clickedArrow == "right") this.rightArrowColor = "#4d4d4d";

            setTimeout(() => {
                this.node.graph.panAndZoomEnabled = true;
                this.node.graph.nodeSelectionEnabled = true;

                this.leftArrowColor = "white";
                this.rightArrowColor = "white";

                this.node.graph.dirtyCanvas = true;
            }, 100);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        super.draw(ctx);
        ctx.save();

        ctx.fillStyle = this.leftArrowColor;
        ctx.fillText("ᐊ", this.properties.position.x + 3, this.properties.position.y+5 + this.properties.size.h / 2);
        if (this.properties.options.length != 0) {
            this.properties.value = this.properties.options[this.currentSelectedIndex];
        }
        ctx.fillStyle = this.rightArrowColor;
        ctx.fillText("ᐅ", this.properties.position.x - 11 + this.properties.size.w, this.properties.position.y+5 + this.properties.size.h / 2);

        ctx.restore();
    }
}