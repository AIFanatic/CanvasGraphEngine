export interface INodeConnectionProperties {
    color: string | "inherit";
    thickness: number;
    readonly from_node?: string;
    readonly from_slot?: string;
    readonly to_node?: string;
    readonly to_slot?: string;
}