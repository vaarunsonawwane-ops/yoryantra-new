export type Operation = "unicode" | "escape";
export type Incoming = { value: string; sequence: number };
export type PanelProps = { incoming?: Incoming; onSend: (target: Operation, value: string) => void };
