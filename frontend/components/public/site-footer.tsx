import Link from "next/link";
import {
  Mail,
  Phone,
} from "lucide-react";
import type { SVGProps } from "react";

const BRAND_NAME = "Ramailo Pokhara.com";

const infoLinks = [
  { label: "हाम्रो बारेमा", href: "/about-us" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "हाम्रो टिम", href: "/our-team" },
  { label: "सम्पर्क", href: "/contact" },
  { label: "युनिकोड", href: "/unicode" },
] as const;

const masthead = [
  { label: "संयोजक", value: "संजय अधिकारी" },
  { label: "निर्देशक प्रकाशन", value: "रामकृष्ण अधिकारी" },
  { label: "संवाददाता", value: "कुशल अधिकारी, कुसुम अधिकारी" },
] as const;

const contactDetails = [
  {
    label: "ईमेल",
    value: "ramilopokhara66@gmail.com",
    href: "mailto:ramilopokhara66@gmail.com",
    icon: Mail,
  },
  {
    label: "फोन",
    value: "९८०६६७०७०६ / 9806670706",
    href: "tel:9806670706",
    icon: Phone,
  },
  {
    label: "फोन",
    value: "९८४६०३०२०१ / 9846030201",
    href: "tel:9846030201",
    icon: Phone,
  },
] as const;

const socialItems = [
  { label: "Facebook", href: "/", icon: FacebookIcon },
  { label: "YouTube", href: "/", icon: YouTubeIcon },
  { label: "Instagram", href: "/", icon: InstagramIcon },
  { label: "Twitter/X", href: "/", icon: TwitterXIcon },
] as const;

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.6 1.6-1.6H16V4.8c-.2 0-.9-.1-1.8-.1-2.8 0-4.7 1.7-4.7 4.9V11H7v3h2.5v7h4Z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 9 2 12 2 12s0 3 .4 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.9 1.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
    </svg>
  );
}

function TwitterXIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 3H21l-4.6 5.3L21.8 21h-4.2l-3.3-4.8L10 21H7.9l4.9-5.7L2.2 3h4.3l3 4.4L13.6 3h2.1l-5.1 5.9 7.1 10.3h-1.3l-6.4-9.2L18.9 3Z" />
    </svg>
  );
}

function FooterColumnTitle({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="font-devanagari text-base font-bold text-white">
      {children}
    </p>
  );
}
export async function SiteFooter() {

  return (
    <footer className="mt-auto border-t-4 border-[var(--public-accent)] bg-[var(--public-accent)] text-[var(--public-background)]">
      <div className="public-container py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-2 md:gap-10 md:text-left xl:grid-cols-4">
          <section className="col-span-2 flex flex-col items-center gap-5 md:col-span-1 md:items-start xl:pr-6 xl:border-r xl:border-white/10">
            <div>
              <p className="font-devanagari text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                रमाइलो पोखरा<span className="text-white">.com</span>
              </p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
                पोखराबाट विश्वसनीय समाचार, समुदायका आवाज र ताजा अपडेट।
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              {socialItems.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white transition hover:border-[var(--public-accent)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>


          <nav
            aria-label="फुटर जानकारी लिङ्क"
            className="xl:px-6 xl:border-r xl:border-white/10"
          >
            <FooterColumnTitle>लिङ्कहरु</FooterColumnTitle>
            <ul className="mt-5 grid gap-3 text-sm">
              {infoLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/80 no-underline transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section className="xl:px-6 xl:border-r xl:border-white/10">
            <FooterColumnTitle>सम्पादकीय टोली</FooterColumnTitle>
            <dl className="mt-5 space-y-4 text-sm">
              {masthead.map((item) => (
                <div key={item.label}>
                  <dt className="text-[0.72rem] font-semibold tracking-[0.08em] text-white/45 uppercase">
                    {item.label}
                  </dt>
                  <dd className="mt-1 leading-6 text-white/90">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="xl:pl-6">
            <FooterColumnTitle>सम्पर्क</FooterColumnTitle>
            <div className="mt-5 text-sm">
              <p className="text-[0.72rem] font-semibold tracking-[0.08em] text-white/45 uppercase">
                 जिल्ला प्रशासन कार्यालय कास्की
              </p>
              <p className="mt-1 leading-6 text-white/90">
                दर्ता नं. २४४/०६५/०६६
              </p>
            </div>
            <ul className="mt-4 space-y-4 text-sm">
              {contactDetails.map(({ label, value, href, icon: Icon }) => (
                <li key={value}>
                  <a
                    href={href}
                    className="flex items-start justify-center gap-3 text-white/80 no-underline transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:justify-start"
                  >
                    <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block text-[0.72rem] font-semibold tracking-[0.08em] text-white/45 uppercase">
                        {label}
                      </span>
                      <span className="mt-1 block break-all leading-6 text-white/90">
                        {value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/50 sm:flex-row sm:text-left">
          <p>© 2026 {BRAND_NAME} — सर्वाधिकार सुरक्षित</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
            <Link
              href="/privacy-policy"
              className="text-white/70 no-underline transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/70 no-underline transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
