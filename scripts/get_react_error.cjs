const { chromium } = require('playwright');

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        let errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push('CONSOLE ERROR: ' + msg.text());
            }
        });
        page.on('pageerror', error => {
            errors.push('PAGE ERROR: ' + error.message);
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
            await page.waitForTimeout(4000); // Wait longer for login/Spline animation
        }

        // Navigate to the feature
        const loc = page.locator('text=/Drug Impact Visualizer/i');
        if (await loc.count() > 0) {
            await loc.first().click();
            await page.waitForTimeout(5000); // wait for 3D model loading
            await page.screenshot({ path: 'scripts/screenshot_feature.png' });
            console.log("Navigated to Drug Impact Visualizer and took screenshot.");
        } else {
            console.log("Still could not find the feature button");
            const text = await page.evaluate(() => document.body.innerText);
            console.log("Current page text:", text);
            await page.screenshot({ path: 'scripts/screenshot_failure.png' });
        }

        if (errors.length > 0) {
            console.log("ERRORS FOUND:");
            console.log(errors.join('\n'));
        } else {
            console.log("No React errors found.");
        }
        await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
