const { query } = require("./query");

const compareDate = (firstDate, secondDate) => {
  return firstDate.substring(0, 7) === secondDate.substring(0, 7);
};

const generateCountInvoice = (invoice_date, countValue) => {
  const startDate = new Date(invoice_date);
  const startYear = startDate.getFullYear();
  const endYear = startYear + 1;
  const startMonth = startDate.getMonth() + 1;

  const formattedString = `${startYear.toString().substring(2)}-${endYear
    .toString()
    .substring(2)}/${startMonth.toString().padStart(2, "0")}/${countValue}`;
  return formattedString;
};

const addInvoiceHelper = async (invoice_date, newCount, mobile) => {
  try {
    const countInvoice = generateCountInvoice(invoice_date, newCount);

    const addInvoiceQuery = `INSERT INTO invoice (invoice_date, mobile,invoice_number)
      VALUES ('${invoice_date}', '${mobile}','${countInvoice}')`;
    const response = await query(addInvoiceQuery);

    // console.log("adding in master");
    const addMasterQuery = `INSERT INTO master_count_table (invoice_date,count)
      VALUES ('${invoice_date}','${newCount}')`;
    const result = await query(addMasterQuery);
  } catch (error) {
    console.log(
      "error while adding in invoice table in invoice helper function",
      error
    );
  }
};

const addInvoice = async (invoice_date, mobile) => {
  try {
    const lastEntryMasterQuery = `SELECT * FROM master_count_table
                            ORDER BY id DESC
                            LIMIT 1`;
    const [lastEntry] = await query(lastEntryMasterQuery);
    const lastEntryDate = lastEntry.invoice_date;
    if (compareDate(lastEntryDate, invoice_date)) {
      await addInvoiceHelper(invoice_date, lastEntry.count + 1, mobile);
    } else {
      console.log("new entry in master table");
      await addInvoiceHelper(invoice_date, 1, mobile);
    }
    console.log("added to invoice table");
  } catch (error) {
    console.log("error while adding in invoice table", error.message);
  }
};
module.exports = { addInvoice };
