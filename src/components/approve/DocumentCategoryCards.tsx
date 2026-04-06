import { Link } from "react-router-dom";
import {
  APPROVAL_DOC_CATEGORIES,
  type ApprovalDocKind,
} from "../../data/approvalCategories";

type Props =
  | {
      variant: "approve";
      activeView: "payment-summary" | ApprovalDocKind;
      onSelect: (id: ApprovalDocKind) => void;
    }
  | {
      variant: "create";
    };

export function DocumentCategoryCards(props: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {APPROVAL_DOC_CATEGORIES.map((c) => {
        const active =
          props.variant === "approve" && props.activeView === c.id;
        const inner = (
          <>
            <span className="absolute right-3 top-3 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-white/25 px-2 text-xs font-bold">
              {c.badge}
            </span>
            <span className="mb-1 block text-2xl font-black text-white/90">
              {c.order}
            </span>
            <span className="block text-sm font-bold leading-tight">
              {c.labelEn}
            </span>
            <span className="mt-1 block text-xs font-medium text-white/90">
              {c.labelTh}
            </span>
          </>
        );
        const className = `relative block w-full rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-md transition ring-offset-2 ring-offset-slate-100 hover:opacity-95 ${c.cardClass} ${active ? "ring-4 ring-white" : ""}`;

        if (props.variant === "create") {
          return (
            <Link
              key={c.id}
              to={`/documents/create/${c.id}`}
              className={`${className} no-underline`}
            >
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => props.onSelect(c.id)}
            className={className}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
