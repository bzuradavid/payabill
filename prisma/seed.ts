import {
  BillStatus,
  GLAccountType,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  VendorStatus,
} from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // GL Accounts
  const glAccounts = await Promise.all([
    prisma.gLAccount.upsert({
      where: { code: "6010" },
      update: {},
      create: { code: "6010", name: "Software Subscriptions", type: GLAccountType.EXPENSE },
    }),
    prisma.gLAccount.upsert({
      where: { code: "6020" },
      update: {},
      create: { code: "6020", name: "Cloud Infrastructure", type: GLAccountType.EXPENSE },
    }),
    prisma.gLAccount.upsert({
      where: { code: "6030" },
      update: {},
      create: { code: "6030", name: "Rent & Facilities", type: GLAccountType.EXPENSE },
    }),
    prisma.gLAccount.upsert({
      where: { code: "6040" },
      update: {},
      create: { code: "6040", name: "Payroll Services", type: GLAccountType.EXPENSE },
    }),
    prisma.gLAccount.upsert({
      where: { code: "6050" },
      update: {},
      create: { code: "6050", name: "Marketing & Advertising", type: GLAccountType.EXPENSE },
    }),
    prisma.gLAccount.upsert({
      where: { code: "6060" },
      update: {},
      create: { code: "6060", name: "Professional Services", type: GLAccountType.EXPENSE },
    }),
    prisma.gLAccount.upsert({
      where: { code: "6070" },
      update: {},
      create: { code: "6070", name: "Office Supplies", type: GLAccountType.EXPENSE },
    }),
    prisma.gLAccount.upsert({
      where: { code: "6080" },
      update: {},
      create: { code: "6080", name: "Travel & Entertainment", type: GLAccountType.EXPENSE },
    }),
  ]);

  const [software, cloud, rent, payroll, marketing, professional] = glAccounts;

  // Vendors
  const stripe = await prisma.vendor.upsert({
    where: { id: "vendor_stripe" },
    update: {},
    create: {
      id: "vendor_stripe",
      name: "Stripe, Inc.",
      email: "billing@stripe.com",
      phone: "+1 (888) 963-8099",
      website: "https://stripe.com",
      addressLine1: "354 Oyster Point Blvd",
      city: "South San Francisco",
      state: "CA",
      zip: "94080",
      defaultPaymentMethod: PaymentMethod.ACH,
      bankName: "Silicon Valley Bank",
      bankRoutingNumber: "121140399",
      bankAccountNumber: "****8821",
      taxId: "47-1234567",
      status: VendorStatus.ACTIVE,
    },
  });

  const aws = await prisma.vendor.upsert({
    where: { id: "vendor_aws" },
    update: {},
    create: {
      id: "vendor_aws",
      name: "Amazon Web Services",
      email: "aws-billing@amazon.com",
      phone: "+1 (206) 266-1000",
      website: "https://aws.amazon.com",
      addressLine1: "410 Terry Ave N",
      city: "Seattle",
      state: "WA",
      zip: "98109",
      defaultPaymentMethod: PaymentMethod.ACH,
      bankName: "JPMorgan Chase",
      bankRoutingNumber: "021000021",
      bankAccountNumber: "****4492",
      taxId: "91-1141312",
      status: VendorStatus.ACTIVE,
    },
  });

  const notion = await prisma.vendor.upsert({
    where: { id: "vendor_notion" },
    update: {},
    create: {
      id: "vendor_notion",
      name: "Notion Labs, Inc.",
      email: "billing@notion.so",
      website: "https://notion.so",
      addressLine1: "2300 Harrison St",
      city: "San Francisco",
      state: "CA",
      zip: "94110",
      defaultPaymentMethod: PaymentMethod.ACH,
      bankName: "First Republic Bank",
      bankRoutingNumber: "321081669",
      bankAccountNumber: "****3317",
      taxId: "84-2116861",
      status: VendorStatus.ACTIVE,
    },
  });

  const wework = await prisma.vendor.upsert({
    where: { id: "vendor_wework" },
    update: {},
    create: {
      id: "vendor_wework",
      name: "WeWork Companies LLC",
      email: "ar@wework.com",
      phone: "+1 (646) 389-3922",
      website: "https://wework.com",
      addressLine1: "575 Lexington Ave",
      city: "New York",
      state: "NY",
      zip: "10022",
      defaultPaymentMethod: PaymentMethod.CHECK,
      bankName: "Bank of America",
      bankRoutingNumber: "026009593",
      bankAccountNumber: "****7751",
      taxId: "46-2612595",
      status: VendorStatus.ACTIVE,
    },
  });

  const gusto = await prisma.vendor.upsert({
    where: { id: "vendor_gusto" },
    update: {},
    create: {
      id: "vendor_gusto",
      name: "Gusto, Inc.",
      email: "billing@gusto.com",
      phone: "+1 (800) 936-0383",
      website: "https://gusto.com",
      addressLine1: "525 20th St",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
      defaultPaymentMethod: PaymentMethod.ACH,
      bankName: "Wells Fargo",
      bankRoutingNumber: "121000248",
      bankAccountNumber: "****6604",
      taxId: "45-3987562",
      status: VendorStatus.ACTIVE,
    },
  });

  const hubspot = await prisma.vendor.upsert({
    where: { id: "vendor_hubspot" },
    update: {},
    create: {
      id: "vendor_hubspot",
      name: "HubSpot, Inc.",
      email: "billing@hubspot.com",
      phone: "+1 (888) 482-7768",
      website: "https://hubspot.com",
      addressLine1: "25 First St",
      city: "Cambridge",
      state: "MA",
      zip: "02141",
      defaultPaymentMethod: PaymentMethod.ACH,
      bankName: "Citizens Bank",
      bankRoutingNumber: "011500120",
      bankAccountNumber: "****2293",
      taxId: "22-3978936",
      status: VendorStatus.ACTIVE,
    },
  });

  // Helper to build dates relative to today
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const daysFromNow = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Clear existing bills to allow re-seeding
  await prisma.payment.deleteMany();
  await prisma.billLineItem.deleteMany();
  await prisma.bill.deleteMany();

  // PAID bills (historical)
  const bill1 = await prisma.bill.create({
    data: {
      vendorId: aws.id,
      invoiceNumber: "AWS-2025-03-0041",
      invoiceDate: daysAgo(45),
      dueDate: daysAgo(15),
      status: BillStatus.PAID,
      paymentMethod: PaymentMethod.ACH,
      memo: "March infrastructure usage",
      submittedAt: daysAgo(44),
      approvedAt: daysAgo(43),
      paidAt: daysAgo(14),
      lineItems: {
        create: [
          { description: "EC2 Compute (us-east-1)", quantity: 1, unitPrice: 3840.0, amount: 3840.0, glAccountId: cloud!.id },
          { description: "S3 Storage & Transfers", quantity: 1, unitPrice: 412.5, amount: 412.5, glAccountId: cloud!.id },
          { description: "RDS PostgreSQL (db.r6g.large)", quantity: 1, unitPrice: 892.0, amount: 892.0, glAccountId: cloud!.id },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      billId: bill1.id,
      amount: 5144.5,
      method: PaymentMethod.ACH,
      status: PaymentStatus.COMPLETED,
      reference: "ACH-20250327-8821",
      scheduledDate: daysAgo(16),
      processedDate: daysAgo(14),
    },
  });

  const bill2 = await prisma.bill.create({
    data: {
      vendorId: wework.id,
      invoiceNumber: "WW-2025-APR-0112",
      invoiceDate: daysAgo(35),
      dueDate: daysAgo(5),
      status: BillStatus.PAID,
      paymentMethod: PaymentMethod.CHECK,
      memo: "April office lease — Suite 400",
      submittedAt: daysAgo(34),
      approvedAt: daysAgo(33),
      paidAt: daysAgo(6),
      lineItems: {
        create: [
          { description: "Monthly Lease (Suite 400)", quantity: 1, unitPrice: 18500.0, amount: 18500.0, glAccountId: rent!.id },
          { description: "Parking (10 spots)", quantity: 10, unitPrice: 225.0, amount: 2250.0, glAccountId: rent!.id },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      billId: bill2.id,
      amount: 20750.0,
      method: PaymentMethod.CHECK,
      status: PaymentStatus.COMPLETED,
      reference: "CHK-10042",
      scheduledDate: daysAgo(8),
      processedDate: daysAgo(6),
    },
  });

  const bill3 = await prisma.bill.create({
    data: {
      vendorId: gusto.id,
      invoiceNumber: "GST-2025-APR",
      invoiceDate: daysAgo(32),
      dueDate: daysAgo(2),
      status: BillStatus.PAID,
      paymentMethod: PaymentMethod.ACH,
      memo: "April payroll processing",
      submittedAt: daysAgo(31),
      approvedAt: daysAgo(30),
      paidAt: daysAgo(3),
      lineItems: {
        create: [
          { description: "Payroll Processing Fee", quantity: 1, unitPrice: 620.0, amount: 620.0, glAccountId: payroll!.id },
          { description: "Benefits Administration", quantity: 1, unitPrice: 380.0, amount: 380.0, glAccountId: payroll!.id },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      billId: bill3.id,
      amount: 1000.0,
      method: PaymentMethod.ACH,
      status: PaymentStatus.COMPLETED,
      reference: "ACH-20250508-6604",
      scheduledDate: daysAgo(4),
      processedDate: daysAgo(3),
    },
  });

  const bill4 = await prisma.bill.create({
    data: {
      vendorId: hubspot.id,
      invoiceNumber: "HS-INV-2025-0228",
      invoiceDate: daysAgo(70),
      dueDate: daysAgo(40),
      status: BillStatus.PAID,
      paymentMethod: PaymentMethod.ACH,
      memo: "Q1 Marketing Hub Enterprise",
      submittedAt: daysAgo(69),
      approvedAt: daysAgo(68),
      paidAt: daysAgo(39),
      lineItems: {
        create: [
          { description: "Marketing Hub Enterprise (10 seats)", quantity: 10, unitPrice: 800.0, amount: 8000.0, glAccountId: marketing!.id },
          { description: "CMS Hub Professional", quantity: 1, unitPrice: 360.0, amount: 360.0, glAccountId: software!.id },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      billId: bill4.id,
      amount: 8360.0,
      method: PaymentMethod.ACH,
      status: PaymentStatus.COMPLETED,
      reference: "ACH-20250401-2293",
      scheduledDate: daysAgo(41),
      processedDate: daysAgo(39),
    },
  });

  const bill5 = await prisma.bill.create({
    data: {
      vendorId: stripe.id,
      invoiceNumber: "STR-2025-03-8821",
      invoiceDate: daysAgo(50),
      dueDate: daysAgo(20),
      status: BillStatus.PAID,
      paymentMethod: PaymentMethod.ACH,
      memo: "March payment processing fees",
      submittedAt: daysAgo(49),
      approvedAt: daysAgo(47),
      paidAt: daysAgo(19),
      lineItems: {
        create: [
          { description: "Payment Processing Fees (2.9% + $0.30)", quantity: 1, unitPrice: 2140.0, amount: 2140.0, glAccountId: software!.id },
          { description: "Radar Fraud Protection", quantity: 1, unitPrice: 180.0, amount: 180.0, glAccountId: software!.id },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      billId: bill5.id,
      amount: 2320.0,
      method: PaymentMethod.ACH,
      status: PaymentStatus.COMPLETED,
      reference: "ACH-20250421-8821",
      scheduledDate: daysAgo(21),
      processedDate: daysAgo(19),
    },
  });

  // SCHEDULED bills
  const bill6 = await prisma.bill.create({
    data: {
      vendorId: wework.id,
      invoiceNumber: "WW-2025-MAY-0139",
      invoiceDate: daysAgo(5),
      dueDate: daysFromNow(3),
      status: BillStatus.SCHEDULED,
      paymentMethod: PaymentMethod.CHECK,
      memo: "May office lease — Suite 400",
      submittedAt: daysAgo(4),
      approvedAt: daysAgo(3),
      lineItems: {
        create: [
          { description: "Monthly Lease (Suite 400)", quantity: 1, unitPrice: 18500.0, amount: 18500.0, glAccountId: rent!.id },
          { description: "Parking (10 spots)", quantity: 10, unitPrice: 225.0, amount: 2250.0, glAccountId: rent!.id },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      billId: bill6.id,
      amount: 20750.0,
      method: PaymentMethod.CHECK,
      status: PaymentStatus.PENDING,
      reference: "CHK-10043",
      scheduledDate: daysFromNow(1),
    },
  });

  const bill7 = await prisma.bill.create({
    data: {
      vendorId: gusto.id,
      invoiceNumber: "GST-2025-MAY",
      invoiceDate: daysAgo(3),
      dueDate: daysFromNow(5),
      status: BillStatus.SCHEDULED,
      paymentMethod: PaymentMethod.ACH,
      memo: "May payroll processing",
      submittedAt: daysAgo(2),
      approvedAt: daysAgo(1),
      lineItems: {
        create: [
          { description: "Payroll Processing Fee", quantity: 1, unitPrice: 620.0, amount: 620.0, glAccountId: payroll!.id },
          { description: "Benefits Administration", quantity: 1, unitPrice: 380.0, amount: 380.0, glAccountId: payroll!.id },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      billId: bill7.id,
      amount: 1000.0,
      method: PaymentMethod.ACH,
      status: PaymentStatus.PENDING,
      scheduledDate: daysFromNow(3),
    },
  });

  // APPROVED bills
  await prisma.bill.create({
    data: {
      vendorId: aws.id,
      invoiceNumber: "AWS-2025-04-0052",
      invoiceDate: daysAgo(8),
      dueDate: daysFromNow(7),
      status: BillStatus.APPROVED,
      paymentMethod: PaymentMethod.ACH,
      memo: "April infrastructure usage",
      submittedAt: daysAgo(7),
      approvedAt: daysAgo(5),
      lineItems: {
        create: [
          { description: "EC2 Compute (us-east-1)", quantity: 1, unitPrice: 4120.0, amount: 4120.0, glAccountId: cloud!.id },
          { description: "S3 Storage & Transfers", quantity: 1, unitPrice: 498.0, amount: 498.0, glAccountId: cloud!.id },
          { description: "CloudFront CDN", quantity: 1, unitPrice: 312.0, amount: 312.0, glAccountId: cloud!.id },
        ],
      },
    },
  });

  await prisma.bill.create({
    data: {
      vendorId: hubspot.id,
      invoiceNumber: "HS-INV-2025-0431",
      invoiceDate: daysAgo(6),
      dueDate: daysFromNow(9),
      status: BillStatus.APPROVED,
      paymentMethod: PaymentMethod.ACH,
      memo: "May Marketing Hub subscription",
      submittedAt: daysAgo(5),
      approvedAt: daysAgo(3),
      lineItems: {
        create: [
          { description: "Marketing Hub Enterprise (10 seats)", quantity: 10, unitPrice: 800.0, amount: 8000.0, glAccountId: marketing!.id },
        ],
      },
    },
  });

  await prisma.bill.create({
    data: {
      vendorId: notion.id,
      invoiceNumber: "NOT-2025-0089",
      invoiceDate: daysAgo(4),
      dueDate: daysFromNow(11),
      status: BillStatus.APPROVED,
      paymentMethod: PaymentMethod.ACH,
      memo: "Notion Plus annual renewal",
      submittedAt: daysAgo(3),
      approvedAt: daysAgo(1),
      lineItems: {
        create: [
          { description: "Notion Plus (25 seats × 12 months)", quantity: 25, unitPrice: 96.0, amount: 2400.0, glAccountId: software!.id },
        ],
      },
    },
  });

  // PENDING_APPROVAL bills
  await prisma.bill.create({
    data: {
      vendorId: stripe.id,
      invoiceNumber: "STR-2025-04-8821",
      invoiceDate: daysAgo(3),
      dueDate: daysFromNow(12),
      status: BillStatus.PENDING_APPROVAL,
      paymentMethod: PaymentMethod.ACH,
      memo: "April payment processing fees",
      submittedAt: daysAgo(2),
      lineItems: {
        create: [
          { description: "Payment Processing Fees", quantity: 1, unitPrice: 2380.0, amount: 2380.0, glAccountId: software!.id },
          { description: "Radar Fraud Protection", quantity: 1, unitPrice: 180.0, amount: 180.0, glAccountId: software!.id },
          { description: "Stripe Billing (Subscriptions)", quantity: 1, unitPrice: 250.0, amount: 250.0, glAccountId: software!.id },
        ],
      },
    },
  });

  await prisma.bill.create({
    data: {
      vendorId: aws.id,
      invoiceNumber: "AWS-SUPPORT-0021",
      invoiceDate: daysAgo(2),
      dueDate: daysFromNow(14),
      status: BillStatus.PENDING_APPROVAL,
      paymentMethod: PaymentMethod.ACH,
      memo: "AWS Business Support — May",
      submittedAt: daysAgo(1),
      lineItems: {
        create: [
          { description: "Business Support Plan (10% of usage)", quantity: 1, unitPrice: 930.0, amount: 930.0, glAccountId: cloud!.id },
        ],
      },
    },
  });

  await prisma.bill.create({
    data: {
      vendorId: hubspot.id,
      invoiceNumber: "HS-PS-2025-0112",
      invoiceDate: daysAgo(4),
      dueDate: daysFromNow(10),
      status: BillStatus.PENDING_APPROVAL,
      paymentMethod: PaymentMethod.ACH,
      memo: "HubSpot onboarding services",
      submittedAt: daysAgo(3),
      lineItems: {
        create: [
          { description: "CRM Onboarding & Implementation (40hrs)", quantity: 40, unitPrice: 175.0, amount: 7000.0, glAccountId: professional!.id },
        ],
      },
    },
  });

  await prisma.bill.create({
    data: {
      vendorId: notion.id,
      invoiceNumber: "NOT-2025-0095",
      invoiceDate: daysAgo(1),
      dueDate: daysFromNow(20),
      status: BillStatus.PENDING_APPROVAL,
      paymentMethod: PaymentMethod.ACH,
      memo: "Notion AI add-on",
      submittedAt: daysAgo(0),
      lineItems: {
        create: [
          { description: "Notion AI (25 seats)", quantity: 25, unitPrice: 10.0, amount: 250.0, glAccountId: software!.id },
        ],
      },
    },
  });

  // DRAFT bills
  await prisma.bill.create({
    data: {
      vendorId: wework.id,
      invoiceNumber: "WW-2025-JUN-0158",
      invoiceDate: new Date(),
      dueDate: daysFromNow(30),
      status: BillStatus.DRAFT,
      paymentMethod: PaymentMethod.CHECK,
      memo: "June office lease — Suite 400",
      lineItems: {
        create: [
          { description: "Monthly Lease (Suite 400)", quantity: 1, unitPrice: 18500.0, amount: 18500.0, glAccountId: rent!.id },
          { description: "Parking (10 spots)", quantity: 10, unitPrice: 225.0, amount: 2250.0, glAccountId: rent!.id },
        ],
      },
    },
  });

  await prisma.bill.create({
    data: {
      vendorId: gusto.id,
      invoiceNumber: null,
      invoiceDate: new Date(),
      dueDate: daysFromNow(15),
      status: BillStatus.DRAFT,
      memo: "June payroll — need to confirm final headcount",
      lineItems: {
        create: [
          { description: "Payroll Processing Fee (est.)", quantity: 1, unitPrice: 640.0, amount: 640.0, glAccountId: payroll!.id },
          { description: "Benefits Administration (est.)", quantity: 1, unitPrice: 400.0, amount: 400.0, glAccountId: payroll!.id },
        ],
      },
    },
  });

  await prisma.bill.create({
    data: {
      vendorId: stripe.id,
      invoiceNumber: null,
      invoiceDate: new Date(),
      dueDate: daysFromNow(20),
      status: BillStatus.DRAFT,
      lineItems: {
        create: [
          { description: "Payment Processing Fees", quantity: 1, unitPrice: 2100.0, amount: 2100.0, glAccountId: software!.id },
        ],
      },
    },
  });

  // REJECTED bills
  await prisma.bill.create({
    data: {
      vendorId: hubspot.id,
      invoiceNumber: "HS-PS-2025-0098",
      invoiceDate: daysAgo(15),
      dueDate: daysFromNow(0),
      status: BillStatus.REJECTED,
      paymentMethod: PaymentMethod.ACH,
      memo: "Additional consulting hours — project scope unclear",
      rejectionReason: "Invoice exceeds approved SOW budget. Please resubmit with updated scope approval from Engineering.",
      submittedAt: daysAgo(14),
      lineItems: {
        create: [
          { description: "Consulting Services (80hrs)", quantity: 80, unitPrice: 175.0, amount: 14000.0, glAccountId: professional!.id },
        ],
      },
    },
  });

  await prisma.bill.create({
    data: {
      vendorId: aws.id,
      invoiceNumber: "AWS-2025-RESERVE-007",
      invoiceDate: daysAgo(20),
      dueDate: daysAgo(5),
      status: BillStatus.REJECTED,
      paymentMethod: PaymentMethod.ACH,
      rejectionReason: "Reserved Instance purchase requires CFO approval for commitments over $50k. Resubmit with appropriate sign-off.",
      submittedAt: daysAgo(19),
      lineItems: {
        create: [
          { description: "1-Year Reserved Instances (r6g.2xlarge × 6)", quantity: 6, unitPrice: 9840.0, amount: 59040.0, glAccountId: cloud!.id },
        ],
      },
    },
  });

  // VOID bill
  await prisma.bill.create({
    data: {
      vendorId: notion.id,
      invoiceNumber: "NOT-2025-0071",
      invoiceDate: daysAgo(25),
      dueDate: daysAgo(10),
      status: BillStatus.VOID,
      memo: "Duplicate of NOT-2025-0072 — voided",
      submittedAt: daysAgo(24),
      lineItems: {
        create: [
          { description: "Notion Plus (25 seats)", quantity: 25, unitPrice: 96.0, amount: 2400.0, glAccountId: software!.id },
        ],
      },
    },
  });

  console.log("✅ Seed complete");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
