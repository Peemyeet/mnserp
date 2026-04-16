import { Link } from "react-router-dom";
import {
  APPROVAL_DOC_CATEGORIES,
  type ApprovalDocKind,
} from "../../data/approvalCategories";

/** ช่องว่างระหว่างการ์ดกับวงขาว — โทนสีตามหมวด */
const ACTIVE_RING_OFFSET: Record<ApprovalDocKind, string> = {
  "pr-no-job": "ring-offset-teal-200/90",
  leave: "ring-offset-amber-200/90",
  vehicle: "ring-offset-rose-200/90",
  "audit-payment": "ring-offset-violet-200/90",
  "create-po": "ring-offset-indigo-200/90",
};

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
        const activeCard = `z-[1] scale-[1.02] shadow-[0_14px_44px_-10px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.4)] ring-[3px] ring-white ring-offset-4 ${ACTIVE_RING_OFFSET[c.id]} brightness-[1.03]`;
        const idleCard =
          "shadow-md hover:z-0 hover:shadow-lg hover:brightness-[1.02]";
        const className = `relative block w-full rounded-2xl bg-gradient-to-br p-4 text-left text-white transition duration-200 ease-out ${c.cardClass} ${
          props.variant === "approve" && active ? activeCard : idleCard
        } ${props.variant === "create" ? "hover:opacity-95" : ""}`;

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
