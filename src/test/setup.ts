import { vi } from "vitest";

// Stub packages/modules that are not available outside of Next.js runtime.
// These are harmless stubs — none of the tested service code calls these at runtime
// (services use constructor-injected dependencies only).

vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Prevent NextAuth + t3-env from running env-var validation at import time.
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
  handlers: {},
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Prevent PrismaClient from being instantiated (services receive db via DI).
vi.mock("~/server/db", () => ({ db: {} }));
