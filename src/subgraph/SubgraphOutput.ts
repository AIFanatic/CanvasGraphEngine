import { GraphNode } from "../node/GraphNode";
import { GraphNodeConnection } from "../node/GraphNodeConnection";
import { GraphNodeOutput } from "../node/slot/GraphNodeOutput";
import { ButtonWidget } from "../widgets/ButtonWidget";

export class SubgraphOutput extends GraphNode {
    private addBtn: ButtonWidget;
    private removeBtn: ButtonWidget;

    public onOutputAdded(output: GraphNodeOutput) {};
    public onOutputRemoved(output: GraphNodeOutput) {};
    public onOutputTrigger(output: GraphNodeOutput) {};

    constructor(graph, path) {
        super(graph, path, "Subgraph Outputs");
        this.addBtn = new ButtonWidget(this, () => {this.onAddBtn()});
        this.addBtn.properties.name = "Add new"
        this.addWidget(this.addBtn);
        
        this.removeBtn = new ButtonWidget(this, () => {this.onRemoveBtn()});
        this.removeBtn.properties.name = "Remove last"
        this.addWidget(this.removeBtn);   
    }

    private onAddBtn() {
        const name = prompt("Output name");
        const type = prompt("Output type");

        const input = this.addInput(name, type);
        const output = this.addOutput(name, type);
        this.onOutputAdded(output);
    }

    private onRemoveBtn() {
        if (this.inputs.length == 0) return;
        if (this.outputs.length == 0) return;

        const input = this.inputs[this.inputs.length-1];
        const output = this.outputs[this.outputs.length-1];
        this.removeInput(input);
        this.removeOutput(output);
        this.onOutputRemoved(output);
    }

    public onTrigger(from: GraphNodeConnection) {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i] === from.input) {
                this.outputs[i].properties.value = this.inputs[i].properties.value;
                this.onOutputTrigger(this.outputs[i]);
                break;
            }
        }
    }
}