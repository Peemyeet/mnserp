import { ArrowDownUp } from "lucide-react";

export function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="whitespace-nowrap px-3 py-3 text-left">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-indigo-700"
      >
        {label}
        <ArrowDownUp
          className={`h-3.5 w-3.5 ${active ? "text-indigo-600" : "text-slate-300"}`}
        />
        {active ? (
          <span className="sr-only">{dir === "asc" ? "เรียงขึ้น" : "เรียงลง"}</span>
        ) : null}
      </button>
    </th>
  );
}
