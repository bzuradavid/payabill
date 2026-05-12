import "server-only";

import { db } from "./db";
import { requireUserContext, type UserContext } from "./get-user";
import { BillService } from "./services/BillService";
import { GLAccountService } from "./services/GLAccountService";
import { StaffService } from "./services/StaffService";
import { VendorService } from "./services/VendorService";

export interface Services {
  ctx: UserContext;
  billService: BillService;
  vendorService: VendorService;
  glAccountService: GLAccountService;
  staffService: StaffService;
}

/**
 * Resolve the request-scoped service container for the currently authenticated user.
 * Redirects to /login when there is no valid session.
 */
export async function getServices(): Promise<Services> {
  const ctx = await requireUserContext();
  return {
    ctx,
    billService: new BillService(db, ctx),
    vendorService: new VendorService(db, ctx),
    glAccountService: new GLAccountService(db, ctx),
    staffService: new StaffService(db, ctx),
  };
}
