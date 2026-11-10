import { test, expect, snap } from "./fixtures";

test.describe("พนักงาน — แจ้งเคส", () => {
  test("หน้าแรก redirect ไป /report", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/report/);
    await expect(page.getByRole("heading", { name: "แจ้งปัญหา IT" })).toBeVisible();
    await snap(page, "พนักงาน-หน้าแจ้งปัญหา");
  });

  test("แจ้งเคสสำเร็จแล้วได้เลขเคส", async ({ page }) => {
    const reporter = `E2E พนักงาน ${Date.now()}`;
    await page.goto("/report");
    await page.getByLabel("ชื่อ-นามสกุล *").fill(reporter);
    await page.getByLabel("แผนก").fill("ทดสอบ");
    await page.getByLabel("เบอร์ติดต่อ").fill("0800000000");
    await page.getByLabel("หัวข้อปัญหา *").fill("E2E คอมเปิดไม่ติด");
    await page.getByLabel("ประเภทปัญหา").selectOption("Support");
    await page.getByLabel("รายละเอียด").fill("เทสด้วย Playwright");
    await snap(page, "พนักงาน-กรอกฟอร์มครบ");
    await page.getByRole("button", { name: "ส่งแจ้งปัญหา" }).click();

    await expect(page).toHaveURL(/\/report\/success\?id=\d+/);
    await expect(page.getByRole("heading", { name: "ส่งแจ้งปัญหาเรียบร้อย" })).toBeVisible();
    await expect(page.locator(".code-chip")).toContainText("#");
    await snap(page, "พนักงาน-ได้เลขเคส");

    const caseId = new URL(page.url()).searchParams.get("id");
    expect(caseId).toBeTruthy();

    await page.goto(`/report/status?id=${caseId}&reported_by=${encodeURIComponent(reporter)}`);
    await expect(page.getByText("E2E คอมเปิดไม่ติด")).toBeVisible();
    await expect(page.locator(".code-chip", { hasText: `#${caseId}` })).toBeVisible();
    await expect(page.locator(".badge", { hasText: "รอรับ" })).toBeVisible();
    await snap(page, "พนักงาน-ติดตามสถานะเคส");
  });

  test("พนักงานเข้า /admin ไม่ได้ — ถูกส่งไป login", async ({ page }) => {
    await page.goto("/admin/overview");
    await expect(page).toHaveURL(/\/login/);
    await snap(page, "พนักงาน-เข้า-admin-ไม่ได้");
  });
});
