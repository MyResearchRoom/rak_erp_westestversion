const { Company,BoardOfDirectors, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');
const { formatGender, formatCategory, formatDate, formatRole, formatBoolean } = require('../utils/excelHelper');
const XLSX = require("xlsx");

const boardOfDirectorFields = [
  "role",
  "holdingSince",
  "fullName",
  "age",
  "gender",
  "category",
  "qualification",
  "background",
  "mobile",
  "email",
  "skill",
  "dinNumber",
  "farmerCert",
  "folioNumber",
  "pan",
  "aadhaar",
  "shareDate",
  "faceValue",
  "shares",
  "capital",
  "shareholding",
  "land",
  "landRecord",
  "village",
  "block",
  "tehsil",
  "district",
  "state",
  "pincode",
];

const boardOfDirectorDocumentFields = [
  "kycDocument",
  "aadhaarCard",
  "panCard",
  "bankStatement",
  "sevenTwelve",
];

const boardOfDirectorDocumentAndContentTypeFields = boardOfDirectorDocumentFields.flatMap((field) => [
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

const attachDirectorDocumentDataUrls = (director) => {
  const data = director?.toJSON ? director.toJSON() : director;

  boardOfDirectorDocumentFields.forEach((field) => {
    data[field] = convertBufferToDataUrl(data[field], data[`${field}ContentType`]);
  });

  return data;
};

exports.addBoardOfDirector = async(req,res)=>{
    try{
        const { id } = req.params;
        // console.log(req.body);
        
        if (!id) {
            return errorResponse(res, "Company id is required", 400);
        }

        const company = await Company.findByPk(id);

        if (!company) {
            return errorResponse(res, "Company not found", 404);
        }

        let data = {
            companyId: id,
        };

        const existingDirector = await BoardOfDirectors.findOne({
            where: {
                email: req.body.email,
                companyId: id,
            },
        });

        if (existingDirector) {
            return errorResponse(res, "Director with this email for this company already exists", 400);
        }


        boardOfDirectorFields.forEach((field) => {
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

        Object.assign(
          data,
          mapUploadedDocuments(req.files, boardOfDirectorDocumentFields)
        );

        const boardOfDirector = await BoardOfDirectors.create(data);

        if (!boardOfDirector) {
        return errorResponse(res, "Board of director not added successfully", 400);
    }

        return successResponse(res, "Board of director added successfully", boardOfDirector);

    }catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to add board of director", 500);
    }
    
};

exports.getBoardOfDirectors = async (req,res) =>{
   try{
        const {id} =req.params;
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query }); 
        const {role}=req.query;

        if (!id) {
            return errorResponse(res, "Company id is required", 400);
        }

        const company = await Company.findByPk(id);

        if (!company) {
            return errorResponse(res, "Company not found", 404);
        }

        let whereClause = {};
        whereClause.companyId=id;   

        if(role){
            whereClause.role=role;
        }

        if (searchTerm) {
        whereClause[Op.or] = [
            { fullName: { [Op.like]: `%${searchTerm}%` } },
            { gender: { [Op.like]: `%${searchTerm}%` } },
            { mobile: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { pan: { [Op.like]: `%${searchTerm}%` } },
            { aadhaar: { [Op.like]: `%${searchTerm}%` } },
            { village: { [Op.like]: `%${searchTerm}%` } },
        ];
        }


        const {count,rows} =await BoardOfDirectors.findAndCountAll({
            where: whereClause,
            attributes: {
                exclude: boardOfDirectorDocumentAndContentTypeFields,
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

        successResponse(res, "Board of directors fetched successfully", {
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
        return errorResponse(res, "Failed to fetch board of directors", 500);
    }
}

exports.getBoardOfDirectorById = async (req,res) =>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Director id is required", 400);
        }

        const boardOfDirector = await BoardOfDirectors.findByPk(id, {
            include:[
                {
                    model:Company,
                    as: "companyData",
                    attributes: ["id", "name", "email","gstin","companyType","contactPerson","mobileNumber","connectedDate"],
                },         
            ],
        });

        if(!boardOfDirector){
            return errorResponse(res, "Director not found", 404);
        }

        const formattedDirector = attachDirectorDocumentDataUrls(boardOfDirector);

        return successResponse(res, "Director data fetched successfully", formattedDirector);


    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch director", 500);
    }
};

exports.deleteBoardOfDirector =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Director id is required to delete director", 400);
        }

        const director = await BoardOfDirectors.findByPk(id);

        if (!director) {
            return errorResponse(res, "Director not found", 404);
        }

        await director.destroy();

        return successResponse(res, "Director deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete director", 500);
    }
};

exports.editBoardOfDirector = async (req,res) =>{
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "Director id is required to edit", 400);
    }

    const director = await BoardOfDirectors.findByPk(id);

    if (!director) {
      return errorResponse(res, "director not found", 404);
    }

    const existingDirector = await BoardOfDirectors.findOne({
      where: {
        email: req.body.email,
        companyId: director.companyId, 
        id: { [Op.ne]: id },
      },
    });

    if (existingDirector) {
        return errorResponse(res, "Director with this email for this company already exists", 400);
    }

    let updateData = {};

    boardOfDirectorFields.forEach((field) => {
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

    Object.assign(
      updateData,
      mapUploadedDocuments(req.files, boardOfDirectorDocumentFields)
    );

    await director.update(updateData);

    return successResponse(res, "Director updated successfully", director);

  } catch (error) {
    console.log(error);
    return errorResponse(res, "Failed to edit director", 500);
  }
};

exports.uploadBoardOfDirectors = async (req, res) => {
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

    const existingDirector = await BoardOfDirectors.findAll({
        where: { companyId: id },
        attributes: ["email"],
        raw: true,
        transaction
    });

    const existingEmailSet = new Set(
        existingDirector.map((f) => f.email?.toLowerCase())
    );

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    const validRows = data.filter(
      (row) =>
        row["Full Name of BoD"] &&
        row["Mobile Number"] && row["E-mail ID"]
    );

    const excelEmailSet = new Set();

    const mappedData = [];
    let duplicateInExcel = 0;
    let duplicateInDB = 0;

    validRows.forEach((row) => {
        const email = row["E-mail ID"]?.toString().trim().toLowerCase();
        console.log("Email",email);
        

        if (!email) return;

        if (excelEmailSet.has(email)) {
            duplicateInExcel++;
            return;
        }

        excelEmailSet.add(email);

        if (existingEmailSet.has(email)) {
            duplicateInDB++;
            return;
        }


        mappedData.push({
            companyId: id,

            role: formatRole(row["Role (Director/Chairman)"]),
            holdingSince: formatDate(
                row["Holding Position Since (Date - DD/MM/YYYY)"]
            ),

            fullName: row["Full Name of BoD"]?.trim(),
            age: row["Age (in Years)"] || null,

            gender: formatGender(row["Gender (Male/ Female)"]),
            category: formatCategory(row["Social Category (Gen/ OBC/ SC/ ST)"]),

            qualification: row["Educational Qualification"] || null,
            background: formatBoolean(row["Does this BoD have B.Sc. Agri or B.Sc. Chemistry background?"]),

            mobile: row["Mobile Number"],
            email:email,
            skill: row["Key Skill of this BoD"] || null,
            dinNumber: row["If yes, provide DIN no."] || null,
            farmerCert: formatBoolean(row["Farmer/ Producer Certificate collected?"]),
            folioNumber: row["Distinctive Folio Number"] || null,

            pan: row["PAN"] || null,
            aadhaar: row["Aadhaar no. (if available) (DDDD DDDD DDDD)"] || null,

            shareDate: formatDate(
                row["Date of Share Capital Contribution / Date of Membership (DD/MM/YYYY)"]
            ),
            faceValue: row["Face value of each share (in Rs.)"] || null,
            shares: row["No. of Shares Allotted (Nos.)"] || null,
            capital: row["Contribution to Share Capital (Rs.)"] || null,
            shareholding: row["% Shareholding in FPC"] || null,
            land: row["Total Landholding (Acres)"] || null,
            landRecord: row[`Land Record No. (Survey No. / Khsara No.) (If doesn't have land, mention "Landless")`] || null,
            village: row["Name of Village where this BoD Farmer resides"] || null,
            block: row["Block"] || null,
            tehsil: row["Tehsil/ Taluka"] || null,
            district: row["District"] || null,
            state: row["State"] || null,
            pincode: row["PIN Code"] || null,

        });
    });

    await BoardOfDirectors.bulkCreate(mappedData, { 
        transaction,
    });

    await transaction.commit();

    return successResponse(res, "Board of directors uploaded and added successfully", {
        totalRows: data.length,
        validRowsInExcelFile: validRows.length,
        invalidRows : data.length - validRows.length,
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
