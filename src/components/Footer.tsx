import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-base9-black text-base9-white py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold tracking-widest uppercase">BASE</span>
              <span className="text-2xl font-bold text-base9-red">9</span>
            </div>
            <p className="text-sm text-base9-gray-500 leading-relaxed max-w-xs">
              Premium custom clothing. Every piece is made to order — printed and
              customized by hand with care and precision.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-500 mb-4">
              Navigate
            </p>
            <ul className="space-y-2">
              {[
                { label: "Shop", href: "/shop" },
                { label: "Customize", href: "/customize" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-base9-gray-500 hover:text-base9-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-500 mb-4">
              Connect
            </p>
            <ul className="space-y-2">
              {[
                { label: "Instagram", href: "#" },
                { label: "Twitter / X", href: "#" },
                { label: "TikTok", href: "#" },
                { label: "Email Us", href: "mailto:hello@base9.co" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-base9-gray-500 hover:text-base9-white transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-base9-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-base9-gray-600">
            © {new Date().getFullYear()} BASE9. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Returns"].map((l) => (
              <Link
                key={l}
                href="#"
                className="text-xs text-base9-gray-600 hover:text-base9-gray-400 transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
