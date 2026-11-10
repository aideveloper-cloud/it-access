import { test, expect, loginAsAdmin, ADMIN_USER, snap } from "./fixtures";

test.describe("ทีม IT — Login", () => {
  test("login ผิดแสดง error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("ชื่อผู้ใช้").fill(ADMIN_USER);
    await page.getByLabel("รหัสผ่าน").fill("wrong-password");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await expect(page.getByText("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    await snap(page, "login-ผิดพลาด");
  });

  test("login สำเร็จเข้าภาพรวม", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("heading", { name: "ภาพรวมระบบ" })).toBeVisible();
    await expect(page.getByText("อุปกรณ์ทั้งหมด")).toBeVisible();
    await snap(page, "login-สำเร็จ-ภาพรวม");
  });

  test("ออกจากระบบแล้วเข้า admin ไม่ได้", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("button", { name: "ออกจากระบบ" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/admin/assets");
    await expect(page).toHaveURL(/\/login/);
    await snap(page, "logout-แล้วถูกกันจาก-admin");
  });
});
