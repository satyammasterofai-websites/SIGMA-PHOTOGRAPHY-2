const formatKey = (k) => {
  if (!k) return '';
  // Convert camelCase to space separated
  const spaced = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, " ");
  // Capitalize first letter of each word
  return spaced.replace(/\b\w/g, c => c.toUpperCase());
};
console.log(formatKey("bride_name"));
console.log(formatKey("groomMother"));
console.log(formatKey("Bride Name"));
