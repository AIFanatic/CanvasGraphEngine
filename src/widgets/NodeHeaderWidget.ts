import { NodeWidgetProperties } from "../defaults/NodeWidgetProperties";
import { INodeWidget } from "../interfaces/INodeWidget";
import { INodeWidgetProperties } from "../interfaces/INodeWidgetProperties";

export interface INodeHeaderProperties extends INodeWidgetProperties {
    statusColor?: string;
}

export class NodeHeaderWidget implements INodeWidget {
    public properties: INodeHeaderProperties;
    
    constructor(title: string) {
        this.properties = NodeWidgetProperties.default();
        this.properties.statusColor = "#999999";
        this.properties.name = title;
        this.properties.size.h = 30;
    }

    public draw(ctx: CanvasRenderingContext2D) {
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
        ctx.textBaseline = "middle"
        ctx.fillText(this.properties.name, this.properties.position.x + 10 * 2, this.properties.position.y + this.properties.size.h / 2 + 1);

        ctx.strokeStyle = "#262626";
        ctx.beginPath();
        ctx.moveTo(this.properties.position.x, this.properties.position.y + this.properties.size.h);
        ctx.lineTo(this.properties.position.x + this.properties.size.w, this.properties.position.y + this.properties.size.h);
        ctx.stroke();

        ctx.restore();
    }
}