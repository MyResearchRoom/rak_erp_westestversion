const getFinancialYear = (date) => {
  if (!date) return null;

  const inputDate = new Date(date);

  // Invalid date check
  if (isNaN(inputDate.getTime())) {
    return null;
  }

  const year = inputDate.getFullYear();
  const month = inputDate.getMonth() + 1; // January = 0

  // Indian Financial Year: April -> March
  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;

  return `${startYear}-${endYear}`;
};

module.exports = getFinancialYear;