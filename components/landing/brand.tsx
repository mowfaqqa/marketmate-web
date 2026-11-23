import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Brand() {
  return (
    <Link href="/waitlist" className="mm-brand">
      <span>
        <Leaf size={22} aria-hidden="true" />
      </span>
      MarketMate
    </Link>
  );
}
