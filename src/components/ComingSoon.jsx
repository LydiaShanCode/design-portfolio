function ComingSoon({ title, message }) {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">
          Coming soon
        </p>
        <h1 className="heading-text text-3xl md:text-4xl lg:text-5xl font-light font-heading">
          {title}
        </h1>
        <p className="body-text text-sm md:text-base text-gray-600 mt-4">
          {message}
        </p>
      </div>
    </main>
  )
}

export default ComingSoon
