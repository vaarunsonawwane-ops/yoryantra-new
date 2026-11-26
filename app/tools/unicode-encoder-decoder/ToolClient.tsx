"use client";
import { useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import UnicodePanel from "./_panels/UnicodePanel";
import EscapePanel from "./_panels/EscapePanel";
import type { Operation, Incoming } from "./workflow-types";
const tasks = [{value:"unicode", label:"Unicode encode / decode"}, {value:"escape", label:"Unicode escape sequences"}] as const;
export default function ToolClient() {
  const [active, setActive] = useState<Operation>("unicode");
  const [visited, setVisited] = useState<Operation[]>(["unicode"]);
  const [incoming, setIncoming] = useState<Partial<Record<Operation, Incoming>>>({});
  const sequence = useRef(0);
  const open = (target: Operation) => { setVisited(previous => previous.includes(target) ? previous : [...previous, target]); setActive(target); };
  const send = (target: Operation, value: string) => { sequence.current += 1; setIncoming(previous => ({...previous, [target]: {value, sequence:sequence.current}})); open(target); };
  return <ToolShell layout="plain" title="Unicode Encoder Decoder" description="Encode and decode Unicode text and escape sequences. Inspect code points, UTF-16 code units and UTF-8 bytes, or convert numeric HTML references.">
    <div className="mb-10">
      <p className="leading-relaxed text-gray-600">Use Unicode encode / decode for UTF-16 escapes, JavaScript escapes and U+ notation. Use Unicode escape sequences to convert mixed Unicode, hexadecimal and numeric HTML escapes.</p>
      <div className="mt-3 max-w-80"><YoryantraSelect variant="task" width="wide" label="What do you want to do?" value={active} onChange={value => open(value as Operation)} options={tasks.map(task => ({...task}))} /></div>
    </div>
    {visited.includes("unicode") && <div hidden={active !== "unicode"} role="region" aria-label="Unicode encode / decode"><UnicodePanel incoming={incoming.unicode} onSend={send}/></div>}
    {visited.includes("escape") && <div hidden={active !== "escape"} role="region" aria-label="Unicode escape sequences"><EscapePanel incoming={incoming.escape} onSend={send}/></div>}
  </ToolShell>;
}
