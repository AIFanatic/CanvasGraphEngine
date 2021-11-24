import { GraphNode } from "../node/GraphNode";
import { GraphNodeInput } from "../node/slot/GraphNodeInput";
import { ButtonWidget } from "../widgets/ButtonWidget";

export class SubgraphInput extends GraphNode {
    private addBtn: ButtonWidget;
    private removeBtn: ButtonWidget;

    public onInputAdded(output: GraphNodeInput) {};
    public onInputRemoved(output: GraphNodeInput) {};

    constructor(graph, path) {
        super(graph, path, "Subgraph Inputs");
        
        this.addBtn = new ButtonWidget(this, () => {this.onAddBtn()});
        this.addBtn.properties.name = "Add new"
        this.addWidget(this.addBtn);

        this.removeBtn = new ButtonWidget(this, () => {this.onRemoveBtn()});
        this.removeBtn.properties.name = "Remove last"
        this.addWidget(this.removeBtn);   
    }

    private onAddBtn() {
        const name = prompt("Input name");
        const type = prompt("Input type");

        const input = this.addInput(name, type);
        const output = this.addOutput(name, type);
        this.onInputAdded(input);
    }

    private onRemoveBtn() {
        if (this.outputs.length == 0) return;
        if (this.inputs.length == 0) return;

        const input = this.inputs[this.inputs.length-1];
        const output = this.outputs[this.outputs.length-1];
        
        this.removeInput(input);
        this.removeOutput(output);
        this.onInputRemoved(input);
    }
}