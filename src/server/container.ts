import { db } from "./db";
import { BillService } from "./services/BillService";
import { GLAccountService } from "./services/GLAccountService";
import { VendorService } from "./services/VendorService";

export const glAccountService = new GLAccountService(db);
export const vendorService = new VendorService(db);
export const billService = new BillService(db);
