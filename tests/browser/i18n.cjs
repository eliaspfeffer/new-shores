const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
  const page=await browser.newPage({viewport:{width:1180,height:820}});
  await page.goto('http://localhost:5175/?qa=i18n');
  await page.evaluate(()=>localStorage.removeItem('new-shores-save'));
  await page.reload();
  await page.getByRole('button',{name:'English',exact:true}).click();
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  await page.getByRole('button',{name:'New settlement',exact:true}).click();
  assert.ok(await page.getByRole('heading',{name:'New settlement',exact:true}).isVisible());
  assert.ok(await page.getByText('Classic map',{exact:true}).isVisible());
  await page.getByRole('button',{name:'Back ×',exact:true}).click();
  await page.getByRole('button',{name:'Deutsch',exact:true}).click();
  assert.equal(await page.locator('html').getAttribute('lang'),'de');
  assert.ok(await page.getByRole('button',{name:'Neue Siedlung',exact:true}).isVisible());
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
