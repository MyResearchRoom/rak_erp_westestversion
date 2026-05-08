const { Company,FarmerMembers , sequelize} = require('../models');
const bcrypt = require("bcryptjs");
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');
const XLSX = require("xlsx");
const {
  formatGender,
  formatCategory,
  formatDate,
} = require("../utils/excelHelper");


    const farmerMembersField = [
        "fullName",
        "age",
        "gender",
        "category",

        "qualification",
        "mobileNumber",
        "pan",
        "aadhaar",

        "shareDate",
        "faceValue",
        "noOfShareAlloted",
        "shareConstribution",

        "folioNumber",
        "shareholding",
        "landHolding",
        "landRecordNumber",
        "village",
        "block",
        "tehsil",
        "district",
        "state",
        "pincode",
    ]

const farmerDocumentFields = [
  "aadhaarCard",
  "sevenTwelve",
  "panCard"
];

const farmerDocumentAndContentTypeFields = farmerDocumentFields.flatMap((field) => [
  field,
  `${field}ContentType`,
]);

const getUploadedFile = (files, fieldName) => {
  if (!files) return null;

  if (Array.isArray(files)) {
    return files.find((file) => file?.fieldname === fieldName) || null;
  }

  return files?.[fieldName]?.[0] || null;
};

const mapUploadedDocuments = (files, documentFields) => {
  const documentPayload = {};

  documentFields.forEach((field) => {
    const uploadedFile = getUploadedFile(files, field);

    if (uploadedFile) {
      documentPayload[field] = uploadedFile.buffer;
      documentPayload[`${field}ContentType`] = uploadedFile.mimetype;
    }
  });

  return documentPayload;
};

const convertBufferToDataUrl = (buffer, contentType) => {
  if (!buffer) return null;

  const mimeType = contentType || "application/octet-stream";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const attachFarmerDocumentDataUrls = (farmer) => {
  const data = farmer?.toJSON ? farmer.toJSON() : farmer;

  farmerDocumentFields.forEach((field) => {
    data[field] = convertBufferToDataUrl(data[field], data[`${field}ContentType`]);
  });

  return data;
};

exports.addFarmerMember = async(req,res)=>{
try{
    const { id } = req.params;

    if (!id) {
        return errorResponse(res, "Company id is required", 400);
    }

    const company = await Company.findByPk(id);

    if (!company) {
        return errorResponse(res, "Company not found", 404);
    }

    const existingFarmer = await FarmerMembers.findOne({
        where: {
            aadhaar: req.body.aadhaar,
            companyId: id,
        },
    });

    if (existingFarmer) {
        return errorResponse(res, "Farmer with this aadhar number for this company already exists", 400);
    }

    let data = {
        companyId: id,
    };

    farmerMembersField.forEach((field) => {
        let value = req.body[field];

        if (
            value !== undefined &&
            value !== "" &&
            value !== "Invalid date"
        ) {
            data[field] = value;
        } else {
            data[field] = null; 
        }
    });

    Object.assign(data, mapUploadedDocuments(req.files, farmerDocumentFields));
            
    
    const farmerMember = await FarmerMembers.create(data);

    if (!farmerMember) {
        return errorResponse(res, "Farmer member not added successfully", 400);
    }
    
    return successResponse(res, "Farmer member added successfully", farmerMember);

}catch (error) {
    console.log(error);
    return errorResponse(res, "Failed to add farmer member", 500);
}
};

exports.getFarmerMembers = async (req,res) =>{
   try{
        const {id} =req.params;
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query }); 

        if (!id) {
            return errorResponse(res, "Company id is required", 400);
        }

        let whereClause = {};
        whereClause.companyId=id;   

        if (searchTerm) {
        whereClause[Op.or] = [
            { fullName: { [Op.like]: `%${searchTerm}%` } },
            { gender: { [Op.like]: `%${searchTerm}%` } },
            { mobileNumber: { [Op.like]: `%${searchTerm}%` } },
            { category: { [Op.like]: `%${searchTerm}%` } },
            { pan: { [Op.like]: `%${searchTerm}%` } },
            { aadhaar: { [Op.like]: `%${searchTerm}%` } },
            { village: { [Op.like]: `%${searchTerm}%` } },
        ];
        }

        const company = await Company.findByPk(id);

        if (!company) {
            return errorResponse(res, "Company not found", 404);
        }

        const {count,rows} =await FarmerMembers.findAndCountAll({
            where: whereClause,
            attributes: {
                exclude: farmerDocumentAndContentTypeFields,
            },
            include:[
                {
                    model: Company,
                    as: "companyData",
                    attributes: ["id", "name", "email","gstin","companyType","contactPerson","mobileNumber","connectedDate"],
                },
            ],
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        })

        successResponse(res, "Farmer members fetched successfully", {
        data:rows,
        pagination: {
            totalRecords: count,
            totalPages: limit ? Math.ceil(count / limit) : 1,
            currentPage: page,
            itemsPerPage: limit,
        },
        });
    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch farmer members", 500);
    }
}

exports.getFarmerMemberById = async (req,res) =>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Farmer id is required", 400);
        }

        const farmerMember = await FarmerMembers.findByPk(id, {
            include:[
                {
                    model:Company,
                    as: "companyData",
                    attributes: ["id", "name", "email","gstin","companyType","contactPerson","mobileNumber","connectedDate"],
                },         
            ],
        });

        if(!farmerMember){
            return errorResponse(res, "Farmer not found", 404);
        }

        const formattedFarmer = attachFarmerDocumentDataUrls(farmerMember);

        return successResponse(res, "Farmer member data fetched successfully", formattedFarmer);


    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch farmer mmeber data", 500);
    }
};

exports.deleteFarmerMember =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Farmer id is required to delete farmer member", 400);
        }

        const farmerMember = await FarmerMembers.findByPk(id);

        if (!farmerMember) {
            return errorResponse(res, "Farmer not found", 404);
        }

        await farmerMember.destroy();

        return successResponse(res, "Farmer deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete farmer", 500);
    }
};

const normalizeAadhaar = (aadhaar) => {
  return aadhaar ? aadhaar.replace(/\D/g, "") : null;
};

exports.editFarmerMember = async (req,res) =>{
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "Farmer id is required to edit", 400);
    }

    const farmer = await FarmerMembers.findByPk(id);

    if (!farmer) {
      return errorResponse(res, "Farmer not found", 404);
    }

    const aadhaar = normalizeAadhaar(req.body.aadhaar);

    const existingFarmer = await FarmerMembers.findOne({
        where: {
            aadhaar: aadhaar,
            companyId: farmer.companyId, 
            id: { [Op.ne]: id },
        },
    });

    if (existingFarmer) {
        return errorResponse(res, "Farmer with this aadhar number for this company already exists", 400);
    }

    let updateData = {};

    farmerMembersField.forEach((field) => {
        let value = req.body[field];

        if (
            value !== undefined &&
            value !== "" &&
            value !== "Invalid date"
        ) {
            updateData[field] = value;
        } else {
            updateData[field] = null; 
        }
    });

    Object.assign(updateData, mapUploadedDocuments(req.files, farmerDocumentFields));

    await farmer.update(updateData);

    return successResponse(res, "Farmer updated successfully", farmer);

  } catch (error) {
    console.log(error);
    return errorResponse(res, "Failed to edit farmer", 500);
  }
};

exports.uploadFarmers = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    if (!req.file) {
        await transaction.rollback();
        return errorResponse(res, "File is required", 400);
    }

    if (!id) {
        await transaction.rollback();
        return errorResponse(res, "Company id is required", 400);
    }

    const company = await Company.findByPk(id);

    if (!company) {
        await transaction.rollback();
        return errorResponse(res, "Company not found", 404);
    }

    const existingFarmers = await FarmerMembers.findAll({
        where: { companyId: id },
        attributes: ["aadhaar"],
        raw: true,
    });

    const existingAadhaarSet = new Set(
        existingFarmers.map((f) => f.aadhaar)
    );

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    const validRows = data.filter(
      (row) =>
        row["Name of Shareholder Farmer"] &&
        row["Mobile number"] && row["Aadhaar no. (DDDD DDDD DDDD)"]
    );

    const excelAadhaarSet = new Set();

    const mappedData = [];
    let duplicateInExcel = 0;
    let duplicateInDB = 0;
    validRows.forEach((row) => {
        const aadhaarFromExcel = row["Aadhaar no. (DDDD DDDD DDDD)"]?.toString().trim();
        const aadhaar=normalizeAadhaar(aadhaarFromExcel);
        // console.log("Addhar from excel",aadhaarFromExcel);
        // console.log("Addhar",aadhaar);
        

        if (excelAadhaarSet.has(aadhaar)) {
            duplicateInExcel++;
            return;
        }

        if (existingAadhaarSet.has(aadhaar)) {
            duplicateInDB++;
            return;
        }
        
        excelAadhaarSet.add(aadhaar);

        mappedData.push({
            companyId: id,

            fullName: row["Name of Shareholder Farmer"]?.trim(),
            age: row["Age (in Years)"] || null,

            gender: formatGender(row["Gender (Male/ Female)"]),
            category: formatCategory(row["Social Category (Gen/ OBC/ SC/ ST)"]),

            qualification: row["Educational Qualification"] || null,

            mobileNumber: row["Mobile number"],
            pan: row["Pan"] || null,
            aadhaar: aadhaar,

            shareDate: formatDate(
                row["Date of Share Capital Contribution / Date of Membership (DD/MM/YYYY)"]
            ),
            faceValue: row["Face value of each share (in Rs.)"] || null,
            noOfShareAlloted: row["No. of Shares Allotted (Nos.)"] || null,
            shareConstribution: row["Contribution to Share Capital (Rs.)"] || null,

            folioNumber: row["Distinctive Folio Number"] || null,
            shareholding: row["% Shareholding in FPC"] || null,
            landHolding: row["Total Landholding (Acres)"] || null,
            landRecordNumber: row[`Land Record No. (Survey No. / Khsara No.) (If doesn't have land, mention "Landless")`] || null,
            village: row["Name of Village where Farmer resides"] || null,
            block: row["Block"] || null,
            tehsil: row["Tehsil/ Taluka"] || null,
            district: row["District"] || null,
            state: row["State"] || null,
            pincode: row["PIN Code"] || null,

        });
    });

    await FarmerMembers.bulkCreate(mappedData, { 
        transaction,
    });

    await transaction.commit();

    return successResponse(res, "Farmers uploaded successfully", {
        totalRows: data.length,
        validRowsInExcelFile: validRows.length,
        insertedRows: mappedData.length,
        skippedRows: data.length - mappedData.length,
        duplicateInExcel,
        duplicateInDB,
    });


  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return errorResponse(res, "Upload failed", 500);
  }
};
