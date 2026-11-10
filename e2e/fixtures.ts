import { test as base, expect, type Page } from "@playwright/test";

export const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
export const ADMIN_PASS = process.env.ADMIN_PASS ?? "kgarden@it";

/** เก็บภาพตั้งชื่อไว้ในรายงาน HTML (เหมาะส่งลูกค้าดู) */
export async function snap(page: Page, name: string) {
  await test.info().attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
}

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("ชื่อผู้ใช้").fill(ADMIN_USER);
  await page.getByLabel("รหัสผ่าน").fill(ADMIN_PASS);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page).toHaveURL(/\/admin\/overview/);
}

export const test = base;
export { expect };
