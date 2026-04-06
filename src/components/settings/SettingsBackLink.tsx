import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function SettingsBackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
    >
      <ArrowLeft className="h-4 w-4" />
      กลับหน้าหลัก
    </Link>
  );
}
