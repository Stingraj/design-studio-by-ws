#!/bin/sh
# Median of 3 mobile Lighthouse runs per route. Usage: sh qa/lh-median.sh http://localhost:4317 / /films ...
base=$1; shift
for r in "$@"; do
  n=$(echo "$r" | sed 's#/#_#g'); [ "$n" = "_" ] && n=_home
  for i in 1 2 3; do ./node_modules/.bin/lighthouse "$base$r" --quiet --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=lh/$n.$i.json >/dev/null 2>&1; done
  python3 - "$r" "$n" <<'PY'
import json, sys, statistics as st
r, n = sys.argv[1], sys.argv[2]
runs = [json.load(open(f'lh/{n}.{i}.json')) for i in (1, 2, 3)]
cat = lambda k: [round(d['categories'][k]['score'] * 100) for d in runs]
num = lambda k: [d['audits'][k]['numericValue'] for d in runs]
print(f"{r:14} perf {st.median(cat('performance')):>3} {cat('performance')}  a11y {st.median(cat('accessibility'))}  bp {st.median(cat('best-practices'))}  seo {st.median(cat('seo'))}"
      f"  | FCP {st.median(num('first-contentful-paint'))/1000:.1f}s  LCP {st.median(num('largest-contentful-paint'))/1000:.1f}s"
      f"  TBT {st.median(num('total-blocking-time')):.0f}ms  CLS {st.median(num('cumulative-layout-shift')):.3f}")
PY
done
