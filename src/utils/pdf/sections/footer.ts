import PDFDocument from "pdfkit";

// export function addFooter(doc: InstanceType<typeof PDFDocument>) {
//     let x = 20;
//     let yStart = doc.y;

//     doc.moveTo(15, yStart).lineTo(doc.page.width - 15, yStart).stroke(); // Horizontal line

//     doc.fontSize(6.5).text("For Claims, Complaints or Queries: Retail Business Division, Jubilee General Insurance Company Limited, 2nd floor, I. I. Chundrigar Road, Karachi, Pakistan. buyonline@jubileegeneral.com.pk Our Toll Free Number: 0800 03786", x, yStart + 2).moveDown();

//     // Column 1: Claims and Contact Information
//     // 01
//     doc.fontSize(7)
//     doc.font("Helvetica-Bold")

//     doc.text("For assistance World-wide, contact", x, yStart + 25, { width: (doc.page.width) / 2, align: "left" });

//     doc.fontSize(8);
//     doc.font("Helvetica");
//     doc.text("GLOBAL RESPONSE    Tel: +44 (0)2920 474131", x, yStart + 33, { width: (doc.page.width) / 2, align: "left" });

//     doc.text(`Cardiff, UK    Email: operations@global-response.co.uk
//                       CC to: Travel@jubileegeneral.com.pk`, x, yStart + 42, { width: (doc.page.width) / 2, align: "left" });

//     // 02
//     doc.fontSize(7)
//     doc.font("Helvetica-Bold")

//     doc.text("For assistance in Africa, contact", x, yStart + 67, { width: (doc.page.width) / 2, align: "left" });

//     doc.fontSize(8);
//     doc.font("Helvetica");
//     doc.text("GLOBAL RESPONSE    Tel: +27 10 100 3045", x, yStart + 77, { width: (doc.page.width) / 2, align: "left" });

//     doc.text(`Johannesburg, Email: operations@global-response.co.uk
// South Africa`, x, yStart + 86, { width: (doc.page.width) / 2, align: "left" });

//     // 03
//     doc.fontSize(7)
//     doc.font("Helvetica-Bold")

//     doc.text("For assistance in Europe, contact", x, yStart + 108, { width: (doc.page.width) / 2, align: "left" });

//     doc.fontSize(8);
//     doc.font("Helvetica");
//     doc.text("GLOBAL RESPONSE    Tel: +34 919 04 47 15", x, yStart + 117, { width: (doc.page.width) / 2, align: "left" });

//     doc.text(`Madrid, Spain Email: operations@global-response.co.uk`, x, yStart + 126, { width: (doc.page.width) / 2, align: "left" });

//     // Column 2: Exclusions
//     doc.fontSize(7);
//     doc.font("Helvetica-Bold");
//     doc.text("For assistance in the Americas, contact", x + (doc.page.width) / 2 + 20, yStart + 25, { width: (doc.page.width) / 2, align: "left" });

//     doc.fontSize(8);
//     doc.font("Helvetica");
//     doc.text("GLOBAL RESPONSE    Tel: +1 317 927 6895", x + (doc.page.width) / 2 + 20, yStart + 33, { width: (doc.page.width) / 2, align: "left" });

//     doc.text(`Indianapolis, USA Email: operations@global-response.co.uk`, x + (doc.page.width) / 2 + 20, yStart + 42, { width: (doc.page.width) / 2, align: "left" });


//     doc.fontSize(7);
//     doc.font("Helvetica-Bold");
//     doc.text("For assistance in Asia Pacific, contact", x + (doc.page.width) / 2 + 20, yStart + 63, { width: (doc.page.width) / 2, align: "left" });

//     doc.fontSize(8);
//     doc.font("Helvetica");
//     doc.text("GLOBAL RESPONSE    Tel: +852 3008 8234", x + (doc.page.width) / 2 + 20, yStart + 74, { width: (doc.page.width) / 2, align: "left" });

//     doc.text(`Hong Kong Email: operations@global-response.co.uk`, x + (doc.page.width) / 2 + 20, yStart + 83, { width: (doc.page.width) / 2, align: "left" });
// }

export function addFooter(doc: InstanceType<typeof PDFDocument>) {
    const margin = doc.options.margin ? +doc.options.margin : 20;
    const pageHeight = doc.page.height;
    const footerHeight = 140; // Approximate height based on content
    let yStart = doc.y;

    // Check if footer fits on current page
    if (yStart + footerHeight > pageHeight - margin) {
        doc.addPage();
        yStart = margin; // Reset yStart for new page
    }

    // Set footer to start after content, ending at page height - margin
    yStart = pageHeight - margin - footerHeight;
    doc.y = yStart;

    doc.moveTo(margin, yStart).lineTo(doc.page.width - margin, yStart).stroke(); // Horizontal line

    doc.fontSize(6.5).text("For Claims, Complaints or Queries: Retail Business Division, Jubilee General Insurance Company Limited, 2nd floor, I. I. Chundrigar Road, Karachi, Pakistan. buyonline@jubileegeneral.com.pk Our Toll Free Number: 0800 03786", margin, yStart + 2).moveDown();

    // Column 1: Claims and Contact Information
    doc.fontSize(7).font("Helvetica-Bold").text("For assistance World-wide, contact", margin, yStart + 25, { width: (doc.page.width) / 2, align: "left" });
    doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +44 (0)2920 474131", margin, yStart + 33, { width: (doc.page.width) / 2, align: "left" });
    doc.text(`Cardiff, UK    Email: operations@global-response.co.uk\nCC to: Travel@jubileegeneral.com.pk`, margin, yStart + 42, { width: (doc.page.width) / 2, align: "left" });

    doc.fontSize(7).font("Helvetica-Bold").text("For assistance in Africa, contact", margin, yStart + 67, { width: (doc.page.width) / 2, align: "left" });
    doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +27 10 100 3045", margin, yStart + 77, { width: (doc.page.width) / 2, align: "left" });
    doc.text(`Johannesburg, Email: operations@global-response.co.uk\nSouth Africa`, margin, yStart + 86, { width: (doc.page.width) / 2, align: "left" });

    doc.fontSize(7).font("Helvetica-Bold").text("For assistance in Europe, contact", margin, yStart + 108, { width: (doc.page.width) / 2, align: "left" });
    doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +34 919 04 47 15", margin, yStart + 117, { width: (doc.page.width) / 2, align: "left" });
    doc.text(`Madrid, Spain Email: operations@global-response.co.uk`, margin, yStart + 126, { width: (doc.page.width) / 2, align: "left" });

    // Column 2: Exclusions
    doc.fontSize(7).font("Helvetica-Bold").text("For assistance in the Americas, contact", margin + (doc.page.width) / 2 + 20, yStart + 25, { width: (doc.page.width) / 2, align: "left" });
    doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +1 317 927 6895", margin + (doc.page.width) / 2 + 20, yStart + 33, { width: (doc.page.width) / 2, align: "left" });
    doc.text(`Indianapolis, USA Email: operations@global-response.co.uk`, margin + (doc.page.width) / 2 + 20, yStart + 42, { width: (doc.page.width) / 2, align: "left" });

    doc.fontSize(7).font("Helvetica-Bold").text("For assistance in Asia Pacific, contact", margin + (doc.page.width) / 2 + 20, yStart + 63, { width: (doc.page.width) / 2, align: "left" });
    doc.fontSize(8).font("Helvetica").text("GLOBAL RESPONSE    Tel: +852 3008 8234", margin + (doc.page.width) / 2 + 20, yStart + 74, { width: (doc.page.width) / 2, align: "left" });
    doc.text(`Hong Kong Email: operations@global-response.co.uk`, margin + (doc.page.width) / 2 + 20, yStart + 83, { width: (doc.page.width) / 2, align: "left" });
}