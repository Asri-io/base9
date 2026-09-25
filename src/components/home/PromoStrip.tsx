import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromoStrip() {
  return (
    <div className="bg-base9-gray-100 border-y border-base9-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-base9-gray-200">

          <Link href="/lookbook"
            className="flex items-center justify-between py-8 px-4 group hover:bg-base9-white transition-colors">
            <div>
              <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1">Gallery</p>
              <p className="text-lg font-bold text-base9-black">See Our Work</p>
              <p className="text-xs text-base9-gray-500 mt-1">Real pieces. Real quality. Browse the lookbook.</p>
            </div>
            <ArrowRight size={20} className="text-base9-gray-400 group-hover:text-base9-red transition-colors flex-shrink-0 ml-4" />
          </Link>

          <Link href="/bulk-orders"
            className="flex items-center justify-between py-8 px-4 group hover:bg-base9-white transition-colors">
            <div>
              <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1">5+ Pieces</p>
              <p className="text-lg font-bold text-base9-black">Bulk Orders</p>
              <p className="text-xs text-base9-gray-500 mt-1">Teams, events, brands. Get a free quote.</p>
            </div>
            <ArrowRight size={20} className="text-base9-gray-400 group-hover:text-base9-red transition-colors flex-shrink-0 ml-4" />
          </Link>

        </div>
      </div>
    </div>
  );
}
