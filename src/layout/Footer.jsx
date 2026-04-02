import { Link } from "react-router-dom";

const Footer = () => {
  const linkSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Menu", href: "/menu" },
        { label: "FAQs", href: "/faq" },
      ],
    },
    {
      title: "Need Help?",
      links: [
        { label: "Delivery Information", href: "/faq" },
        { label: "Return & Refund Policy", href: "/faq" },
        { label: "Payment Methods", href: "/faq" },
        { label: "Track your Order", href: "/profile" },
        { label: "Contact Us", href: "/about" },
      ],
    },
    {
      title: "Follow Us",
      links: [
        {
          label: "Instagram",
          href: "https://instagram.com/halfmillion_sa",
          external: true,
        },
        {
          label: "Twitter",
          href: "https://x.com/halfmillion_sa",
          external: true,
        },
        {
          label: "Facebook",
          href: "https://facebook.com/HalfMillionSA",
          external: true,
        },
        {
          label: "YouTube",
          href: "https://youtube.com/@HalfMillionKSA",
          external: true,
        },
      ],
    },
  ];

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 bg-black">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
        <div>
          <img
            className="w-34 md:w-32"
            src="/logo2.jpeg"
            alt="dummyLogoColored"
          />
          <p className="max-w-[410px] mt-6 text-white">
            Good coffee. Good people. Half a million reasons to come back.
          </p>
        </div>
        <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
          {linkSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-base md:mb-5 mb-2 text-[#46f2e4]">
                {section.title}
              </h3>
              <ul className="text-sm text-white space-y-1">
                {section.links.map((link, i) => (
                  <li key={i}>
                    {link.href && !link.external && (
                      <Link
                        to={link.href}
                        className="hover:underline transition">
                        {link.label}
                      </Link>
                    )}
                    {link.href && link.external && (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline transition">
                        {link.label}
                      </a>
                    )}
                    {!link.href && (
                      <span className="text-white/70">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="py-4 text-center text-sm md:text-base text-white">
        Copyright 2026 © <Link to="/">HalfMillion</Link> All Right Reserved.
      </p>
    </div>
  );
};
export default Footer;
