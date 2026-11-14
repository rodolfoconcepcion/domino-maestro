import { test, expect } from 'playwright/test';

test.describe('Dominó Maestro E2E Baseline', () => {
  test('header, navigation tabs, and theme toggle work', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('DOMINÓ MAESTRO');

    // Theme toggle switches light-mode class on <html>
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/light-mode/);
    await page.locator('button[title="Cambiar tema"]').click();
    await expect(html).toHaveClass(/light-mode/);
    await page.locator('button[title="Cambiar tema"]').click();
    await expect(html).not.toHaveClass(/light-mode/);

    // Switch through all 4 tabs
    await page.getByRole('button', { name: 'Academia' }).click();
    await expect(page.getByText('Pregunta del Maestro:')).toBeVisible();

    await page.getByRole('button', { name: 'Matriz 28' }).click();
    await expect(page.getByText('Matriz de Conteo y Probabilidad (Las 28 Fichas)')).toBeVisible();

    await page.getByRole('button', { name: 'Doctrina' }).click();
    await expect(page.getByText('Doctrina Táctica del Dominó Competitivo (10 Leyes Maestras)')).toBeVisible();

    await page.getByRole('button', { name: 'Mesa' }).click();
    await expect(page.getByRole('button', { name: 'Nueva Mano' })).toBeVisible();
  });

  test('Mesa opens, toggles, and closes Reglas configuration panel', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Reglas' }).click();
    await expect(page.getByText('Configuración de Reglas Dominicanas')).toBeVisible();

    // Toggle Paso en la Salida rule
    const disableBtn = page.getByRole('button', { name: 'Desactivar regla' }).first();
    await disableBtn.click();
    await expect(page.getByText('INACTIVO').first()).toBeVisible();

    await page.locator('button[aria-label="Cerrar panel de reglas"]').click();
    await expect(page.getByText('Configuración de Reglas Dominicanas')).toBeHidden();
  });

  test('Academia renders scenario 1/12, evaluates answer, and advances to 2/12', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Academia' }).click();

    await expect(page.getByText('1/12')).toBeVisible();
    await page.getByRole('button', { name: /Jugar \[5:5\]/ }).click();
    await expect(page.getByText('¡Decisión Correcta!')).toBeVisible();

    await page.locator('button[title="Siguiente Escenario"]').first().click();
    await expect(page.getByText('2/12')).toBeVisible();
  });

  test('Matriz 28 demo, reset, and 7-tile hand limit guard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Matriz 28' }).click();

    await page.getByRole('button', { name: 'Cargar Ejemplo Práctico' }).click();
    await expect(page.getByText('Ejemplo Práctico Cargado (Observa el Número 5 a la derecha):')).toBeVisible();

    await page.getByRole('button', { name: 'Limpiar Todo' }).click();
    await expect(page.getByText('Ejemplo Práctico Cargado')).toBeHidden();

    // Click 8 tiles in "Mi Mano" mode to verify strict 7-tile hand cap
    const matrixTiles = page.locator('.domino-tile button');
    for (let i = 0; i < 8; i++) {
      await matrixTiles.nth(i).click();
    }

    await expect(page.getByText('Límite de 7 fichas alcanzado (7/7):')).toBeVisible();
  });

  test('Doctrina switches across Master Law tabs', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Doctrina' }).click();

    await page.getByRole('button', { name: '2. Respeto al Salidor' }).click();
    await expect(page.getByText('El Respeto Sagrado al Salidor')).toBeVisible();

    await page.getByRole('button', { name: '4. Ciencia del Tranque' }).click();
    await expect(page.getByText('La Ciencia del Tranque (Cálculo Aritmético)')).toBeVisible();

    await page.getByRole('button', { name: '10. Rival a Ley de Una' }).click();
    await expect(page.getByText('Protocolo de Emergencia: Rival «A Ley de Una» (1 Ficha)')).toBeVisible();
  });

  test('P1: Spanish HUD titles, independent board shadow layer, and AI play work', async ({ page }) => {
    await page.goto('/');

    // Pure Spanish HUD titles
    await expect(page.getByRole('heading', { name: 'Entrenador Táctico' })).toBeVisible();
    await expect(page.getByText('Señales del Compañero')).toBeVisible();
    await expect(page.getByText('Riesgo de Tranque')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Matriz de Probabilidad (28 Fichas)' })).toBeVisible();

    // Trigger first tile placement on Mesa (human plays if holding [6:6], else AI plays automatically within ~1s)
    const playableBtn = page.locator('.domino-tile button:not([disabled])').first();
    if ((await playableBtn.count()) > 0 && (await playableBtn.isVisible())) {
      await playableBtn.click();
    }
    await expect(page.getByTestId('board-shadows-layer')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('board-tiles-layer')).toBeVisible();
    expect(await page.getByTestId('board-shadows-layer').locator('> div').count()).toBeGreaterThanOrEqual(1);

    // Academia scenario #2 also renders independent shadow layer
    await page.getByRole('button', { name: 'Academia' }).click();
    await page.locator('button[title="Siguiente Escenario"]').first().click();
    await expect(page.getByTestId('board-shadows-layer')).toBeVisible();
  });

  test('P2: header telemetry displays live match score and round timer', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('header-live-score')).toHaveText('0 - 0');
    await expect(page.getByTestId('header-round-timer')).toContainText('#1 • 00:');
  });

  test('P3: language toggle switches UI between Spanish (ES) and English (EN) across all tabs', async ({ page }) => {
    await page.goto('/');

    const langToggle = page.getByTestId('lang-toggle');
    await expect(langToggle).toContainText('ES');
    await expect(page.getByRole('heading', { name: 'Entrenador Táctico' })).toBeVisible();

    // Switch ES -> EN
    await langToggle.click();
    await expect(langToggle).toContainText('EN');
    await expect(page.getByRole('heading', { name: 'Tactical Coach' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Probability Matrix (28 Tiles)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Hand' })).toBeVisible();
    await expect(page.getByText('Us / Them (Target 200)')).toBeVisible();

    // Academy (EN)
    await page.getByRole('button', { name: 'Academy' }).click();
    await expect(page.getByText("Master's Question:")).toBeVisible();
    await expect(page.getByText('1. The Optimal Lead: Supported Double (Open Lead)')).toBeVisible();

    // 28 Matrix (EN)
    await page.getByRole('button', { name: '28 Matrix' }).click();
    await expect(page.getByText('Counting & Probability Matrix (All 28 Tiles)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Load Practical Example' })).toBeVisible();

    // Doctrine (EN)
    await page.getByRole('button', { name: 'Doctrine' }).click();
    await expect(page.getByText('Competitive Dominoes Tactical Doctrine (10 Master Laws)')).toBeVisible();
    await page.getByRole('button', { name: '2. Respect the Leader' }).click();
    await expect(page.getByText('Sacred Respect for the Leader')).toBeVisible();

    // Toggle EN -> ES
    await langToggle.click();
    await expect(langToggle).toContainText('ES');
    await expect(page.getByText('Doctrina Táctica del Dominó Competitivo (10 Leyes Maestras)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mesa' })).toBeVisible();
  });
});
