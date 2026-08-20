const { chromium } = require('playwright');

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        let errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push({ type: 'CONSOLE', text: msg.text() });
            }
        });
        page.on('pageerror', error => {
            errors.push({ type: 'PAGE_ERROR', text: error.message });
        });

        await page.goto('http://localhost:3000');
        await page.waitForTimeout(1000);

        // Click "Explore Technology"
        const exploreBtn = page.locator('text=/Explore Technology/i');
        if (await exploreBtn.count() > 0) {
            await exploreBtn.first().click();
            await page.waitForTimeout(1500);
        }
        
        // Fill out login inputs
        await page.fill('input[placeholder="Full Name"]', 'Test User');
        await page.fill('input[placeholder="Email Address"]', 'test@example.com');
        await page.fill('input[placeholder="Age"]', '30');
        await page.fill('input[placeholder="Height (cm)"]', '180');
        await page.fill('input[placeholder="Weight (kg)"]', '75');

        // Login
        const loginBtn = page.locator('text=/Begin Journey/i');
        if (await loginBtn.count() > 0) {
            await loginBtn.first().click();
            await page.waitForTimeout(4000);
        }

        // We are now on the dashboard. Let's find all the grid items or buttons that navigate to features.
        // Let's get their names.
        const featureCards = page.locator('h3');
        const count = await featureCards.count();
        console.log(`Found ${count} features on Dashboard:`);
        
        let featureNames = [];
        for (let i = 0; i < count; i++) {
            const name = await featureCards.nth(i).innerText();
            featureNames.push(name);
        }
        console.log(featureNames);

        for (const featureName of featureNames) {
            // Skip dashboard itself
            if (featureName.toLowerCase().includes('dashboard') || featureName.toLowerCase().includes('health')) continue;
            
            console.log(`\nTesting feature: "${featureName}"`);
            errors = []; // Clear errors before navigating
            
            // Locate feature card and click
            const card = page.locator(`text="${featureName}"`).first();
            await card.click();
            await page.waitForTimeout(3000); // Wait for loading
            
            // Check if page is blank (very little text or root element empty)
            const textContent = await page.evaluate(() => document.body.innerText.trim());
            const htmlContent = await page.evaluate(() => document.body.innerHTML.trim());
            
            const isBlank = textContent.length < 10 || htmlContent === '';
            
            if (isBlank) {
                console.log(`❌ BLANK SCREEN detected on entering "${featureName}"!`);
            } else if (errors.length > 0) {
                console.log(`⚠️ Errors detected in "${featureName}":`);
                errors.forEach(e => console.log(`  [${e.type}] ${e.text}`));
            } else {
                console.log(`✅ Feature "${featureName}" rendered successfully.`);
            }

            // Take a screenshot of the feature for verification
            const safeName = featureName.replace(/[^a-zA-Z0-9]/g, '_');
            await page.screenshot({ path: `scripts/screenshot_${safeName}.png` });

            // Navigate back to dashboard. We can click a back button, or if not found, just reload page / dashboard url
            const backBtn = page.locator('text=/Dashboard/i').first();
            if (await backBtn.count() > 0 && await backBtn.isVisible()) {
                await backBtn.click();
                await page.waitForTimeout(1500);
            } else {
                // Fallback: click any arrow left icon or reload
                await page.goto('http://localhost:3000');
                await page.waitForTimeout(2000);
                
                // Need to login again if page reload loses state
                const explore = page.locator('text=/Explore Technology/i');
                if (await explore.count() > 0) {
                    await explore.first().click();
                    await page.waitForTimeout(1000);
                    await page.fill('input[placeholder="Full Name"]', 'Test User');
                    await page.fill('input[placeholder="Email Address"]', 'test@example.com');
                    await page.fill('input[placeholder="Age"]', '30');
                    await page.fill('input[placeholder="Height (cm)"]', '180');
                    await page.fill('input[placeholder="Weight (kg)"]', '75');
                    await page.locator('text=/Begin Journey/i').first().click();
                    await page.waitForTimeout(3000);
                }
            }
        }

        await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
