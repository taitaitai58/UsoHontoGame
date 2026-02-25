export const getFavoriteGames = () => {
  const favorite = JSON.parse(localStorage.getItem(`favorites`) ?? "[]");
  return favorite;
};
