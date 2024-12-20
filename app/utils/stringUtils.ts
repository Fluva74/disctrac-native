export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeUsername = (username: string): string => {
  if (!username) return '';
  return username.charAt(0).toUpperCase() + username.slice(1);
}; 