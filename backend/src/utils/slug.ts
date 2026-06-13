export const generateSlug = (
  text: string
): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

export const generateUniqueSlug = (
  text: string
): string => {
  const baseSlug = generateSlug(text);

  const random =
    Math.random()
      .toString(36)
      .substring(2, 6);

  return `${baseSlug}-${random}`;
};