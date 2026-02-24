import KoiFish from './KoiFish'
import DynamicTitle from './DynamicTitle'
import Chip from './ui/Chip'

const ArrowUpRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="size-3"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
    />
  </svg>
)

function Hero() {
  return (
    <section id="hero" className="hero-section px-4 py-14 sm:py-16 lg:py-20">
      <div className="flex w-full flex-col items-center justify-center">
        <div className="mb-2 text-center leading-[0.95] lg:hidden">
          <h1 className="font-heading text-[clamp(32px,9vw,44px)] sm:text-[clamp(42px,11vw,76px)] font-light tracking-tight">
            <span className="block">LYDIA IS</span>
            <span className="block min-w-[6.5ch]">
              <DynamicTitle />
            </span>
          </h1>
        </div>
        <div className="mb-3 hidden w-full items-center justify-center gap-6 lg:flex">
          <div className="font-heading text-5xl font-light text-right w-[220px] shrink-0">
            LYDIA IS
          </div>
          <div className="flex items-center justify-center">
            <KoiFish />
          </div>
          <div className="font-heading text-5xl font-light text-left w-[220px] shrink-0 break-words">
            <DynamicTitle />
          </div>
        </div>
        <div className="mb-3 flex w-full items-center justify-center sm:mb-4 lg:hidden">
          <KoiFish />
        </div>
        <p className="hero-subtext body-text text-center mb-4 text-base sm:text-lg lg:text-base">
          Product designer, currently at{' '}
          <a
            href="https://www.shopify.com/ca/editions/winter2026"
            className="body-text text-inherit underline hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Shopify
          </a>
        </p>
        <Chip
          href="https://www.instagram.com/p/DR2ZgRXjlw1/?img_index=1"
          icon={<ArrowUpRightIcon />}
          className="border-blue-300 px-[10px] py-1 text-[12px]"
        >
          Sometimes making music
        </Chip>
      </div>
    </section>
  )
}

export default Hero
