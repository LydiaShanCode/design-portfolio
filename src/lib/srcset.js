// imagetools clamps requested widths to the intrinsic size, so small sources repeat the same width
export const dedupeSrcset = (srcset) =>
  [...new Map(srcset.split(', ').map((entry) => [entry.split(' ').pop(), entry])).values()].join(', ')
