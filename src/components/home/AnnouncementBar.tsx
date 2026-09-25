import Link from "next/link";

export default function AnnouncementBar() {
  return (
    <div className="bg-base9-red text-base9-white py-2.5 px-6 text-center">
      <p className="text-xs tracking-widest uppercase">
        <span className="opacity-75">Hoodies dropping soon —</span>{" "}
        <Link href="/bulk-orders" className="underline underline-offset-2 hover:opacity-80 transition-opacity font-medium">
          Bulk orders available now
        </Link>
        <span className="opacity-75"> · 5+ pieces get special pricing</span>
      </p>
    </div>
  );
}
