import { ButtonWidget, Graph, GraphNodeInput, GraphNodeOutput } from "..";
import { IGraphSerializeNode } from "../GraphSerializer";
import { INodeProperties } from "../interfaces/INodeProperties";
import { GraphNode } from "../node/GraphNode";
import { GraphNodeConnection } from "../node/GraphNodeConnection";
import { SubgraphInput } from "./SubgraphInput";
import { SubgraphOutput } from "./SubgraphOutput";

interface SubgraphProperties extends INodeProperties {
    graphJSON?: IGraphSerializeNode[]
}

export class Subgraph extends GraphNode {
    private openSubgraph: ButtonWidget;
    public properties: SubgraphProperties;
    
    private subgraphCanvas: HTMLCanvasElement;
    private subgraph: Graph;
    private subgraphInputNode: SubgraphInput;
    private subgraphOutputNode: SubgraphOutput;
    private closeSubgraphBtn: HTMLButtonElement;

    private subgraphInputToLocalInput: Map<GraphNodeInput, GraphNodeInput> = new Map();
    private subgraphOutputToLocalOutput: Map<GraphNodeOutput, GraphNodeOutput> = new Map();

    constructor(graph, path) {
        super(graph, path, "Subgraph");

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
        this.closeSubgraphBtn.addEventListener("click", (event) => {this.onCloseSubgraph()})
        
        this.subgraph = new Graph(this.subgraphCanvas);
        this.subgraph.registerNode("SubgraphInput", SubgraphInput);
        this.subgraph.registerNode("SubgraphOutput", SubgraphOutput);

        // @ts-ignore
        for (let nodeTypeMap of this.graph.nodeTypes) {
            this.subgraph.registerNode(nodeTypeMap[0], nodeTypeMap[1]);
        }

        this.subgraphInputNode = this.subgraph.createNode("SubgraphInput") as SubgraphInput;
        this.subgraphOutputNode = this.subgraph.createNode("SubgraphOutput") as SubgraphOutput;

        this.setupSlotEvents();
    }

    private setupSlotEvents() {
        if (this.subgraphInputNode) {
            this.subgraphInputNode.onInputAdded = (input: GraphNodeInput) => {this.onSubgraphInputSlotAdded(input)};
            this.subgraphInputNode.onInputRemoved = (input: GraphNodeInput) => {this.onSubgraphInputSlotRemoved(input)};
        }

        if (this.subgraphOutputNode) {
            this.subgraphOutputNode.onOutputAdded = (output: GraphNodeOutput) => {this.onSubgraphOutputSlotAdded(output)};
            this.subgraphOutputNode.onOutputRemoved = (output: GraphNodeOutput) => {this.onSubgraphOutputSlotRemoved(output)};
            this.subgraphOutputNode.onOutputTrigger = (output: GraphNodeOutput) => {this.onSubgraphOutputTrigger(output)};
        }
    }

    private onOpenSubgraph() {
        this.graph.canvas.style.display = "none";
        this.subgraphCanvas.style.display = "";
        document.body.appendChild(this.closeSubgraphBtn);
    }

    private onCloseSubgraph() {
        this.graph.canvas.style.display = "";
        this.subgraphCanvas.style.display = "none";

        if (document.body.contains(this.closeSubgraphBtn)) {
            document.body.removeChild(this.closeSubgraphBtn);
        }

        this.graph.dirtyCanvas = true;
    }


    private onSubgraphOutputSlotAdded(output: GraphNodeOutput) {
        if (this.subgraphOutputToLocalOutput.has(output)) return;

        const localOutput = this.addOutput(output.properties.name, output.properties.type);
        this.subgraphOutputToLocalOutput.set(output, localOutput);
        this.graph.dirtyCanvas = true;
    }

    private onSubgraphOutputSlotRemoved(output: GraphNodeOutput) {
        if (!this.subgraphOutputToLocalOutput.has(output)) return;

        const localOutput = this.subgraphOutputToLocalOutput.get(output);
        this.removeOutput(localOutput);
        this.subgraphOutputToLocalOutput.delete(output);
        this.graph.dirtyCanvas = true;
    }

    private onSubgraphInputSlotAdded(input: GraphNodeInput) {
        if (this.subgraphInputToLocalInput.has(input)) return;

        const localInput = this.addInput(input.properties.name, input.properties.type);
        this.subgraphInputToLocalInput.set(input, localInput);
        this.graph.dirtyCanvas = true;
    }

    private onSubgraphInputSlotRemoved(input: GraphNodeInput) {
        if (!this.subgraphInputToLocalInput.has(input)) return;

        const localInput = this.subgraphInputToLocalInput.get(input);
        this.removeInput(localInput);
        this.subgraphInputToLocalInput.delete(input);
        this.graph.dirtyCanvas = true;
    }

    // Handles output slots
    public onConnectionsChange(from: GraphNodeOutput, to: GraphNodeInput) {

    }

    // Handles input slots
    public onTrigger(connection: GraphNodeConnection) {
        let inputIndex = 0;
        this.subgraphInputToLocalInput.forEach((localInput, subgraphInput) => { 
            if (connection.input === localInput) {
                subgraphInput.node.setOutputData(inputIndex, localInput.properties.value);
                subgraphInput.node.triggerOutput(inputIndex);
            }
            inputIndex++;
        })
    }

    public onSubgraphOutputTrigger(output: GraphNodeOutput) {
        if (!this.subgraphOutputToLocalOutput.has(output)) return;

        const localOutput = this.subgraphOutputToLocalOutput.get(output);
        const localOutputIndex = this.outputs.indexOf(localOutput);

        if (localOutputIndex != -1) {
            this.setOutputData(localOutputIndex, output.properties.value);
            this.triggerOutput(localOutputIndex);
        }
    }

    public onRemoved() {
        this.onCloseSubgraph();
        if (this.graph.canvas.parentElement.contains(this.subgraphCanvas)) {
            this.graph.canvas.parentElement.removeChild(this.subgraphCanvas);
        }
    }

    public onSerialize() {
        console.log("onSerialize")
        this.properties.graphJSON = this.subgraph.toJSON();
    }

    public onDeserialized() {
        console.log("onDeserialized")

        console.log(this.properties)
        if (this.properties.graphJSON) {
            this.subgraph.fromJSON(this.properties.graphJSON);
        }

        // Assign subgraphInputNode and subgraphOutputNode
        for (let node of this.subgraph.nodes) {
            if (node.properties.path == "SubgraphInput") this.subgraphInputNode = node as SubgraphInput;
            else if (node.properties.path == "SubgraphOutput") this.subgraphOutputNode = node as SubgraphOutput;
        }

        this.setupSlotEvents();

        // Rebuild subgraph inputs and outputs
        if (this.subgraphInputNode.inputs.length == this.inputs.length) {
            for (let i = 0; i < this.subgraphInputNode.inputs.length; i++) {
                this.subgraphInputToLocalInput.set(this.subgraphInputNode.inputs[i], this.inputs[i]);

            }
        }

        if (this.subgraphOutputNode.outputs.length == this.outputs.length) {
            console.log("here")
            for (let i = 0; i < this.subgraphOutputNode.outputs.length; i++) {
                this.subgraphOutputToLocalOutput.set(this.subgraphOutputNode.outputs[i], this.outputs[i]);
            }
        }

        console.log(this)
    }
}