import { test, expect, loginAsAdmin, snap } from "./fixtures";

test.describe("ทีม IT — อุปกรณ์ / เคส / Label", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("เมนูนำทางหลักใช้งานได้", async ({ page }) => {
    await page.locator('aside a[href="/admin/cases"]').click();
    await expect(page).toHaveURL(/\/admin\/cases/);
    await expect(page.getByRole("heading", { name: /รับเคส/ })).toBeVisible();
    await snap(page, "01-รับเคส");

    await page.locator('aside a[href="/admin/assets"]').click();
    await expect(page).toHaveURL(/\/admin\/assets$/);
    await expect(page.getByRole("heading", { name: /ทะเบียนอุปกรณ์/ })).toBeVisible();
    await snap(page, "02-ทะเบียนอุปกรณ์");

    await page.locator('aside a[href="/admin/assets/labels"]').click();
    await expect(page).toHaveURL(/\/admin\/assets\/labels/);
    await snap(page, "03-พิมพ์-Label");

    await page.locator('aside a[href="/admin/licenses"]').click();
    await expect(page).toHaveURL(/\/admin\/licenses/);
    await snap(page, "04-License");

    await page.locator('aside a[href="/admin/history"]').click();
    await expect(page).toHaveURL(/\/admin\/history/);
    await snap(page, "05-ประวัติ");
  });

  test("ทะเบียนอุปกรณ์มีตารางและ pagination", async ({ page }) => {
    await page.goto("/admin/assets");
    await expect(page.locator("table")).toBeVisible();
    await expect(page.getByText(/แสดง \d+–\d+ จาก \d+ รายการ|ไม่พบข้อมูล/)).toBeVisible();
    await snap(page, "ทะเบียนอุปกรณ์-pagination");
  });

  test("ค้นหาอุปกรณ์แล้วกรองผล", async ({ page }) => {
    await page.goto("/admin/assets");
    const firstCode = page.locator("tbody tr td a").first();
    if ((await firstCode.count()) === 0) {
      test.skip();
      return;
    }
    const code = (await firstCode.innerText()).trim();
    await page.getByPlaceholder("ค้นหา รหัส / รุ่น / SN / ผู้ถือครอง...").fill(code);
    await page.getByRole("button", { name: "ค้นหา" }).click();
    await expect(page.getByRole("link", { name: code })).toBeVisible();
    await snap(page, `ค้นหาอุปกรณ์-${code}`);
  });

  test("หน้ารับเคสแสดงรายการและสถิติ", async ({ page }) => {
    await page.goto("/admin/cases");
    await expect(page.getByText("รอรับ").first()).toBeVisible();
    await expect(page.getByText("กำลังดำเนินการ").first()).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
    await snap(page, "รับเคส-รายการและสถิติ");
  });

  test("เคสจากพนักงานโผล่ในรับเคส", async ({ page }) => {
    const title = `E2E Case ${Date.now()}`;
    const reporter = `E2E Reporter ${Date.now()}`;

    await page.goto("/report");
    await page.getByLabel("ชื่อ-นามสกุล *").fill(reporter);
    await page.getByLabel("หัวข้อปัญหา *").fill(title);
    await snap(page, "พนักงาน-ฟอร์มแจ้งปัญหา");
    await page.getByRole("button", { name: "ส่งแจ้งปัญหา" }).click();
    await expect(page).toHaveURL(/\/report\/success/);
    await snap(page, "พนักงาน-ส่งสำเร็จ");

    await page.goto("/admin/cases");
    await page.getByPlaceholder("ค้นหา หัวข้อ / ผู้แจ้ง / แผนก...").fill(title);
    await page.getByRole("button", { name: "ค้นหา" }).click();
    await expect(page.getByRole("link", { name: title })).toBeVisible();
    await snap(page, "IT-พบเคสจากพนักงาน");
  });

  test("เปลี่ยนสถานะเคสได้", async ({ page }) => {
    await page.goto("/admin/cases?status=รอรับ");
    const link = page.locator("tbody tr td a").first();
    if ((await link.count()) === 0) {
      test.skip();
      return;
    }
    await link.click();
    await expect(page).toHaveURL(/\/admin\/cases\/\d+/);
    await snap(page, "รายละเอียดเคส-ก่อนเปลี่ยนสถานะ");

    const statusSelect = page.locator('select[name="status"]');
    await expect(statusSelect).toHaveValue("รอรับ");
    await statusSelect.selectOption("กำลังดำเนินการ");
    await page.getByRole("button", { name: "บันทึกสถานะ" }).click();
    await expect(page.getByText("รอรับ → กำลังดำเนินการ")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("กำลังดำเนินการ").first()).toBeVisible();
    await snap(page, "รายละเอียดเคส-หลังเปลี่ยนสถานะ");
  });

  test("หน้า Label เลือก Barcode / QR และเลือกพิมพ์ได้", async ({ page }) => {
    await page.goto("/admin/assets/labels");
    const sheet = page.getByTestId("label-sheet");
    if ((await sheet.count()) === 0) {
      test.skip();
      return;
    }
    await expect(sheet).toHaveAttribute("data-ready", "1");
    await expect(sheet).toHaveAttribute("data-mode", "barcode");
    await snap(page, "Label-โหมด-Barcode");
    await page.getByRole("button", { name: "QR Code" }).click();
    await expect(sheet).toHaveAttribute("data-mode", "qr");
    await expect(page.getByTestId("label-mode-hint")).toContainText("QR");
    await snap(page, "Label-โหมด-QR");
    await page.getByRole("button", { name: "Barcode" }).click();
    await expect(sheet).toHaveAttribute("data-mode", "barcode");

    const cards = sheet.locator(".label-card");
    const count = await cards.count();
    if (count >= 2) {
      await page.getByRole("button", { name: "ล้าง" }).click();
      await expect(page.getByTestId("label-print-selected")).toBeDisabled();
      await cards.nth(0).getByRole("checkbox").check();
      await expect(page.getByTestId("label-print-selected")).toBeEnabled();
      await expect(cards.nth(0)).toHaveAttribute("data-selected", "1");
      await expect(cards.nth(1)).toHaveAttribute("data-selected", "0");
      await snap(page, "Label-เลือกบางใบ");
    }
  });
});
