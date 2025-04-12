const Membership = require("../models/Membership");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.submit = async (req, res) => {
  try {
    const formData = req.body;

    const identifier = { email: formData.email };
    const existing = await Membership.findOne(identifier);

    if (formData.membershipType === "New") {
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A membership with this email already exists.",
        });
      }
      await new Membership(formData).save();
    } else if (formData.membershipType === "Renew") {
      if (existing) {
        await Membership.updateOne(identifier, formData);
      } else {
        await new Membership(formData).save();
      }
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `${formData.fullName.replace(
      /\s/g,
      "_"
    )}_${Date.now()}.pdf`;

    const dirPath = path.join(__dirname, "../../filled-forms");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const drawField = (label, value) => {
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value}`);
      doc.moveDown(0.5);
    };

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("E.D.G.E. (Elmvale District Garden Enthusiasts)", {
        align: "center",
        underline: true,
      });
    doc.moveDown(1);
    doc
      .fontSize(14)
      .font("Helvetica")
      .text("Membership Application", { align: "center" });
    doc.moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Member’s Information", { underline: true });
    doc.moveDown(0.5);
    drawField("Name (print neatly):", formData.fullName);
    drawField("Address:", formData.address);
    drawField("Postal Code:", formData.postalCode);
    drawField("Phone #:", formData.phone);
    drawField("E-Mail Address (for mailouts of meetings):", formData.email);

    doc.font("Helvetica-Bold").text("Membership Type:");
    doc.font("Helvetica").text(formData.membershipType || "Not selected");
    doc.moveDown(1);

    doc.font("Helvetica-Bold").text("Membership Fee:");
    doc.font("Helvetica").text("• Single $15 per year");
    doc.text(
      "Cheques are made payable to: Elmvale and District Horticultural Society"
    );
    doc.moveDown(1);

    if (formData.agreedToCode === true || formData.agreedToCode === "true") {
      doc
        .font("Helvetica-Bold")
        .text("I have read the Constitution and Code of Conduct:");
      doc.font("Helvetica").text("I agree");
      doc.moveDown(1);
    }

    doc
      .font("Helvetica-Bold")
      .text("Photo Release Permission and Photo Waiver", { underline: true });
    doc.moveDown(0.5);
    doc
      .font("Helvetica")
      .text(
        "Participants involved in any activities offered by E.D.G.E. may be photographed or videotaped\n" +
          "during the event they are attending or participating in. Participants or their floral design or\n" +
          "photographic entries offered by E.D.G.E. may be photographed. The undersigned consents to\n" +
          "the use of these photographs and/or videos without compensation on the E.D.G.E.’S Facebook\n" +
          "or any editorial, promotions or advertising material produced and/or published by E.D.G.E."
      );
    doc.moveDown(1);

    drawField("Signature:", formData.signature);
    drawField("Name printed neatly:", formData.printedName);
    drawField("Date:", formData.date);

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, () => fs.unlinkSync(filePath));
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).send("PDF stream failed.");
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUnregisteredMembers = async (req, res) => {
  try {
    const unregisteredMembers = await Membership.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "email",
          foreignField: "email",
          as: "userMatch",
        },
      },
      {
        $match: {
          userMatch: { $eq: [] },
        },
      },
      {
        $project: {
          userMatch: 0,
        },
      },
    ]);

    res.json(unregisteredMembers);
  } catch (err) {
    console.error("Error fetching unregistered members:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
