const adddays = require("date-fns/addDays");

const getting_new_date = (days) => {
  const new_date = adddays(new Date(2020, 7, 22), days);
  return `${new_date.getDate()}-${
    new_date.getMonth() + 1
  }-${new_date.getFullYear()}`;
};

module.exports = getting_new_date;
