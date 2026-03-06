const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const XLSX = require("xlsx");

const parseCsvFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(filePath)
            .on("error", reject)
            .pipe(csv())
            .on("data", (data) => {
                rows.push(data);
            })
            .on("error", reject)
            .on("end", () => {
                resolve(rows);
            });
    });
};

const parseExcelFile = (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
        return [];
    }

    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
};

const parseLeadFile = async (filePath, mimeType, originalName = "") => {
    const ext = path.extname(originalName).toLowerCase();

    const isExcel =
        mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimeType === "application/vnd.ms-excel" ||
        ext === ".xlsx" ||
        ext === ".xls";

    if (isExcel) {
        return parseExcelFile(filePath);
    }

    return parseCsvFile(filePath);
};

module.exports = {
    parseLeadFile
};
