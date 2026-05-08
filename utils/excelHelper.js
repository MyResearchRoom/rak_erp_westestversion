const XLSX = require("xlsx");

const formatRole = (value) => {
  if (!value) return "director";
  value = value.toLowerCase().trim();
  if (value.includes("director")) return "director";
  if (value.includes("chairman")) return "chairman";
  return "director";
};

const formatGender = (value) => {
  if (!value) return null;
  value = value.toLowerCase().trim();
  if (value.includes("male")) return "male";
  if (value.includes("female")) return "female";
  return "other";
};

const formatCategory = (value) => {
  if (!value) return null;
  value = value.toLowerCase().trim();
  if (value.includes("gen")) return "general";
  if (value.includes("obc")) return "obc";
  if (value.includes("sc")) return "sc";
  if (value.includes("st")) return "st";
  return null;
};

const formatDate = (value) => {
  if (!value) return null;

  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    return `${date.y}-${date.m}-${date.d}`;
  }

  const parts = value.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return null;
};

const formatBoolean = (value) => {
  if (value === undefined || value === null) return null;

  value = value.toString().toLowerCase().trim();

  if (
    value === "yes" ||
    value === "y" ||
    value === "true" ||
    value === "1" ||
    value.includes("yes")
  ) {
    return true;
  }

  if (
    value === "no" ||
    value === "n" ||
    value === "false" ||
    value === "0" ||
    value.includes("no")
  ) {
    return false;
  }

  return null;
};

module.exports = {
  formatGender,
  formatCategory,
  formatDate,
  formatRole,
  formatBoolean,
};