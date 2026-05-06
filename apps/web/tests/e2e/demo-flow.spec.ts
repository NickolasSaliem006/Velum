import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders hero and role links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('The Trust Layer for')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Patient Portal' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Doctor Interface' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Hospital Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Audit Trail' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'User Manual' })).toBeVisible()
  })

  test('shows prototype disclosure footer', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('PROTOTYPE NOTE')).toBeVisible()
  })

  test('shows how it works section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('How It Works')).toBeVisible()
    await expect(page.getByText('Encrypt & Write')).toBeVisible()
    await expect(page.getByText('Grant Consent')).toBeVisible()
    await expect(page.getByText('Verify & Access')).toBeVisible()
    await expect(page.getByText('Immutable Audit')).toBeVisible()
  })

  test('shows stats bar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('39')).toBeVisible()
    await expect(page.getByText('Foundry tests')).toBeVisible()
    await expect(page.getByText('97.87%')).toBeVisible()
  })
})

test.describe('Patient portal — demo mode', () => {
  test('shows demo banner when not connected', async ({ page }) => {
    await page.goto('/patient')
    await expect(page.getByText('Demo mode')).toBeVisible()
  })

  test('displays 3 demo medical records', async ({ page }) => {
    await page.goto('/patient')
    await expect(page.getByText('Medical Records')).toBeVisible()
    // 3 records with severity badges
    await expect(page.getByText('Low')).toBeVisible()
    await expect(page.getByText('High')).toBeVisible()
    await expect(page.getByText('Medium')).toBeVisible()
  })

  test('crypto demo: encrypt button shows ciphertext', async ({ page }) => {
    await page.goto('/patient')
    const encryptButtons = page.getByRole('button', { name: 'Show encrypted' })
    await encryptButtons.first().click()
    // Wait for crypto to complete
    await expect(page.getByText('Ciphertext (hex)')).toBeVisible({ timeout: 5000 })
  })

  test('crypto demo: decrypt shows plaintext', async ({ page }) => {
    await page.goto('/patient')
    const encryptButtons = page.getByRole('button', { name: 'Show encrypted' })
    await encryptButtons.first().click()
    await expect(page.getByText('Ciphertext (hex)')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Decrypt' }).first().click()
    await expect(page.getByText('Decrypted content')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Nickolas Saliem')).toBeVisible()
  })

  test('switching to grants tab shows grant form', async ({ page }) => {
    await page.goto('/patient')
    await page.getByRole('button', { name: 'Access Grants' }).click()
    await expect(page.getByText('Grant New Access')).toBeVisible()
    await expect(page.getByPlaceholder('0x…').first()).toBeVisible()
  })
})

test.describe('Doctor interface — demo mode', () => {
  test('shows write record form', async ({ page }) => {
    await page.goto('/doctor')
    await expect(page.getByText('Write Medical Record')).toBeVisible()
    await expect(page.getByText('Patient wallet address')).toBeVisible()
    await expect(page.getByText('Content CID')).toBeVisible()
  })

  test('shows pending co-signatures in demo mode', async ({ page }) => {
    await page.goto('/doctor')
    await expect(page.getByText('Pending Co-Signatures')).toBeVisible()
    await expect(page.getByText('Co-sign')).toBeVisible()
  })

  test('high severity shows co-sign warning', async ({ page }) => {
    await page.goto('/doctor')
    await page.getByRole('button', { name: 'High' }).click()
    await expect(page.getByText('High severity requires a second doctor')).toBeVisible()
  })
})

test.describe('Hospital dashboard — demo mode', () => {
  test('shows consented records list', async ({ page }) => {
    await page.goto('/hospital')
    await expect(page.getByText('Consented Records')).toBeVisible()
    await expect(page.getByText('Active Grants')).toBeVisible()
  })

  test('record expands on click to show CID', async ({ page }) => {
    await page.goto('/hospital')
    const records = page.locator('.rounded-lg.border.cursor-pointer')
    await records.first().click()
    await expect(page.getByText('Content CID (SHA-256)')).toBeVisible()
  })
})

test.describe('Audit trail', () => {
  test('shows event feed with all event types', async ({ page }) => {
    await page.goto('/audit')
    await expect(page.getByText('On-Chain Audit Trail')).toBeVisible()
    await expect(page.getByText('Record Written')).toBeVisible()
    await expect(page.getByText('Consent Granted')).toBeVisible()
    await expect(page.getByText('Consent Revoked')).toBeVisible()
    await expect(page.getByText('Record Accessed')).toBeVisible()
  })

  test('filter by event type works', async ({ page }) => {
    await page.goto('/audit')
    // Click the "Consent Granted" stat card to filter
    await page.getByText('Consent Granted').first().click()
    // Should show fewer events — none of the others
    const events = page.locator('.bg-bone\\/5.border.border-bone\\/10.rounded-lg')
    const count = await events.count()
    expect(count).toBeLessThan(6)
  })

  test('search filters by address', async ({ page }) => {
    await page.goto('/audit')
    await page.getByPlaceholder('Search by tx hash, address, or record ID…').fill('0xAbCd')
    const visibleText = await page.getByText('0xAbCd1234').count()
    expect(visibleText).toBeGreaterThan(0)
  })
})

test.describe('User manual (/docs)', () => {
  test('renders title and ToC', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.getByRole('heading', { name: 'Velum — User Manual' })).toBeVisible()
    await expect(page.getByText('Platform Overview')).toBeVisible()
    await expect(page.getByText('Debugging Guide')).toBeVisible()
  })

  test('all major sections are present', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.getByText('Prerequisites')).toBeVisible()
    await expect(page.getByText('Roles & Permissions')).toBeVisible()
    await expect(page.getByText('Cryptography & What to Expect')).toBeVisible()
    await expect(page.getByText('Error Reference')).toBeVisible()
    await expect(page.getByText('FAQ')).toBeVisible()
  })

  test('back to app link works', async ({ page }) => {
    await page.goto('/docs')
    await page.getByRole('link', { name: '← Back to app' }).click()
    await expect(page).toHaveURL('/')
  })

  test('sidebar ToC anchor link scrolls to section', async ({ page }) => {
    await page.goto('/docs')
    await page.getByRole('link', { name: 'Going Live (Polygon Amoy)' }).click()
    await expect(page.getByRole('heading', { name: 'Going Live (Polygon Amoy)' })).toBeVisible()
  })
})
