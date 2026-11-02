/** Exact source spans only; render as escaped text, never HTML. */
export function evidenceParts(
  source: string,
  quote: string,
): Array<{ text: string; highlight: boolean }> {
  const at = quote ? source.indexOf(quote) : -1;
  return at < 0
    ? [{ text: source, highlight: false }]
    : [
        { text: source.slice(0, at), highlight: false },
        { text: quote, highlight: true },
        { text: source.slice(at + quote.length), highlight: false },
      ];
}
