# CanvasGraphEngine

A library to create graphs similar to Unreal Blueprints.

Inspired by [litegraph.js](https://github.com/jagenjo/litegraph.js).

![](https://github.com/AIFanatic/CanvasGraphEngine/raw/master/screenshot.png?raw=true)
*Load data, train, predict and layer feature extraction of a ML MNIST classifier using CanvasGraphEngine.*

## Features
- Uses Canvas for optimized performance.
- Custom widgets.
- Custom node input/output types.
- Touch support.
- Serialization/Deserialization.
- Subgraphs support.
- Fully typed.

## Installation
### Node
```shell
yarn add https://github.com/AIFanatic/canvasgraphengine.git
```

### Browser
```html
<script src="https://cdn.jsdelivr.net/gh/AIFAnatic/canvasgraphengine@latest/dist/canvasgraphengine.js"></script>
```


## Usage
### Browser
```html
<html>
    <head>
        <style>
            html, body {
                width: 100%;
                height: 100%;
                margin: 0;
            }

            #graphcanvas {
                background-color: #202020;
            }
        </style>
    </head>

    <body>
        <div style="width: 100%; height: 100%;">
            <canvas id="graphcanvas"></canvas>
        </div>

        <script type="module">
            import {Graph, GraphNode} from '../dist/esm/canvasgraphengine-esm.js'

            const canvas = document.getElementById("graphcanvas");
            const graph = new Graph(canvas);

            graph.registerNode("test", GraphNode);

            const node1 = graph.createNode("test", "Node 1");
            const node2 = graph.createNode("test", "Node 2");
            const node3 = graph.createNode("test", "Node 3");

            node2.properties.position.x = 250;
            node2.properties.position.y = 250;
            node3.properties.position.x = 350;

            const node3Input = node3.addInput("input", "");
            const node3Output = node3.addOutput("output", "");

            const node1Output = node1.addOutput("output", "");
            const node1Output1 = node1.addOutput("output", "type");

            const node2Input = node2.addInput("input", "");
            const node2Input1 = node2.addInput("input1", "type");
            
            const node1Node2connection = node1.connect(node1Output, node2Input);
            const node1Node2connection2 = node1.connect(node1Output, node3Input);

            setInterval(() => {
                node1.triggerOutput(0);
            }, 3000);
        </script>
    </body>
</html>
```
### Module
```typescript
import {Graph, GraphNode} from 'canvasgraphengine';

const canvas = document.getElementById("graphcanvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

const graph = new Graph(canvas);

graph.registerNode("test", GraphNode);
const node = graph.createNode("test");
```

### Custom node
```typescript
import {Graph, GraphNode, GraphNodeOutput, GraphNodeInput} from 'canvasgraphengine';

class SampleNode extends GraphNode {
    constructor(graph, path) {
        super(graph, path, "SampleNode");

        this.addInput("input", "text");
        this.addOutput("output", "text");
    }

    public onTrigger() {
        console.log("Node was triggered");
    }

    public onConnectionsChange(from: GraphNodeOutput, to: GraphNodeInput) {
        this.triggerOutput(0);
    }
}

const canvas = document.getElementById("graphcanvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

const graph = new Graph(canvas);

graph.registerNode("test", SampleNode);
const node = graph.createNode("test");
```

### Custom widget
```typescript
import {GraphNode, INodeWidget} from 'canvasgraphengine';
export class TextWidget implements INodeWidget {
    public properties: INodeWidgetProperties;
    private node: GraphNode;

    constructor(node: GraphNode) {
        this.properties = NodeWidgetProperties.default();
        this.node = node;
    }
    
    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.fillRect(this.properties.position.x, this.properties.position.y, this.properties.size.w, this.properties.size.h);
    }
}
```

### Serialization/Deserialization
```typescript
import {Graph} from 'canvasgraphengine';
const canvas = document.getElementById("graphcanvas");
const graph = new Graph(canvas);
const json = graph.toJSON(); // Serialize
graph.fromJSON(json) // Deserialize
```

### TODO
- [ ] Docs