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
    <section id="hero" className="hero-section px-4 pt-0 pb-4 sm:py-16 lg:py-20">
      <div className="flex w-full flex-col items-center justify-center">
        <div className="-mx-4 mb-0 flex w-[calc(100%+2rem)] items-center justify-center sm:mb-5 lg:mx-0 lg:hidden lg:w-full">
          <KoiFish />
        </div>
        <div className="mb-4 text-center leading-[0.95] lg:hidden">
          <h1 className="font-heading text-[32px] sm:text-[clamp(42px,11vw,76px)] font-light tracking-tight">
            <span className="block">LYDIA IS</span>
            <span className="block min-w-[6.5ch] italic sm:not-italic">
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
        <p className="hero-subtext body-text text-center mb-6 text-[14px] font-light sm:text-lg sm:font-normal lg:mb-4 lg:text-base">
          <span className="sm:hidden">
            Currently designing at{' '}
            <a
              href="https://www.shopify.com/ca/editions/winter2026"
              className="body-text text-inherit no-underline hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Shopify
            </a>
          </span>
          <span className="hidden sm:inline">
            Currently designing at{' '}
            <a
              href="https://www.shopify.com/ca/editions/winter2026"
              className="body-text text-inherit no-underline hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Shopify
            </a>
          </span>
        </p>
        <div>
          <Chip
            href="https://djae.vercel.app/"
            icon={<ArrowUpRightIcon />}
            className="hidden sm:inline-flex border-blue-300 px-[10px] py-1 text-[12px]"
          >
            Recently: building a dj app
          </Chip>
        </div>
      </div>
    </section>
  )
}

export default Hero
