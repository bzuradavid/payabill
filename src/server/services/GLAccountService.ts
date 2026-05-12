import { type PrismaClient } from "../../../generated/prisma";

export class GLAccountService {
  constructor(private db: PrismaClient) {}

  list() {
    return this.db.gLAccount.findMany({
      orderBy: [{ type: "asc" }, { code: "asc" }],
    });
  }
}
