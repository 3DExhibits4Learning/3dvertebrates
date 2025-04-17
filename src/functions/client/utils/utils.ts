export const stripTagsExceptIAP = (html: string) => html.replace(/<\/?(?!i\b|a\b|p\b)[a-z][^>]*>/gi, '')
  