/*
 * Sanity steps:
 * Create new project
 * Set an environment
 * Create a web case
 * Run the case
 * Assert the result
 * Delete the project
 */


// set to false if you want to keep the project
const deleteProject = true

const obj = po
const nav = obj.nav
const utils = obj.utils
const func = obj.functions

const projectNumber = String(func.generateNumber())
const project = `* Test Project ~ ${projectNumber}`
const environment = `Environment ~ ${projectNumber}`
const webFolder = `Web Folder ~ ${projectNumber}`
const webCase = `Web Case ~ ${projectNumber}`



var startTime = func.getTime()
obj.login(
    env.url, 'Demo1', 30,
    env.username, env.password
)


web.transaction('04. Create New Project')
web.click(nav.menuList('Projects'))
web.click(nav.menuItem('Projects', '1'))

web.click(utils.addProject)
web.type('id=new-proj-name', project)

web.waitForNotExist('//button[@disabled]')
for (let x = 0; x < 2; x++)
    web.click(utils.next)
web.click(utils.finish)

if (!web.isVisible(`//span[@class="nodeText" and @title="${project}"]`)) 
    assert.fail('There was a problem creating a project')

log.info(`Created ${project}`)

web.transaction('05. Create New Environment')
web.pause(1500)
web.click(nav.menuItem('Environments', '1'))

// choose the current project
web.click('//div[contains(@class, "project-row")]')
web.click(`//li[contains(@class, "project-item") and text()="${project}"]`)

web.click(utils.addEnvironment)

// create env
web.type('id=add_suite_form_str', environment)
web.click(utils.add)

web.pause(1500)

// add details
// url
web.click('//table[@class="table table-bordered"]//tr[1]/td[1]')
web.sendKeys('url')

web.click('//table[@class="table table-bordered"]//tr[1]/td[2]')
web.sendKeys(env.url)

// username
web.click('//table[@class="table table-bordered"]//tr[2]/td[1]')
web.sendKeys('username')

web.click('//table[@class="table table-bordered"]//tr[2]/td[2]')
web.sendKeys(env.username)

// password
web.click('//table[@class="table table-bordered"]//tr[3]/td[1]')
web.sendKeys('password')

web.click('//table[@class="table table-bordered"]//tr[3]/td[2]')
web.sendKeys(env.password)

web.click(utils.saveEnv)
web.waitForVisible('//span[@class="table-save-success-notify" and text()="Saved successfully!"]')

log.info(`Created ${environment}`)

web.transaction('06. Create New Case - Web')
web.pause(1500)
web.click(nav.menuItem('Cases', '1'))

// choose the current project
web.click('//div[contains(@class, "project-row")]')
web.click(`//li[contains(@class, "project-item") and text()="${project}"]`)

// create folder
web.click('//a[contains(text(), "new folder")]')
web.type('id=new_folder_form_str', webFolder)
web.click(utils.add)

// create case
web.click(`//span[text()="${webFolder}"]`)
web.click('//div[@class="info-box"]//a[contains(text(), "Web")]') 

web.type('id=add_suite_form_str', webCase)
web.click(utils.add) 

if (!web.getText('//h2[@class="ant-typography suites-and-cases__title"]').includes(webCase)) 
    assert.fail('There was a problem creating a case')

// choose browser
func.chooseBrowser('Chrome', 'EQA1')

// create script
web.clickHidden('//div[text()="Script"]')
web.click('//span[text()="Edit"]')
web.click('//div[@class="view-lines"]')

web.sendKeys(`
    web.transaction('Open Main Page')
    web.init()
    web.open(env.url)

    web.transaction('Log In')
    // type details
    web.type('id=login_form_email', env.username)
    web.type('id=login_form_password', env.password)

    // submit
    web.execute(() => {
        document.evaluate(
            '//button[@htmltype="submit"]', document,
            null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
        ).singleNodeValue.click()
    })

    web.pause(1500)

    web.transaction('Assert User')
    // assert that you logged in with the right user
    if (!web.getText('//span[@class="ant-typography"]').includes(env.username.slice(0, 7))) {
        assert.fail('Failed to login')
    } else {
        assert.pass('Logged in successfully')
        web.dispose('Passed')
    }
`)

// fix script
for (let x = 5; x > 0; x--) {
    func.pressARROW_DOWN()
}

for (let x = 50; x > 0; x--) {
    func.pressBACKSPACE()
}

// configure environment
web.clickHidden('//div[text()="Settings"]') 

web.click('//span[text()="Environments"]//..//div[@class="ant-select-selection__rendered"]')

web.click(`//li[contains(@class, "dropdown-menu-item") and text()="${environment}"]`)

// details
web.clickHidden('//div[text()="Details"]')
web.type('id=notes', 'Details about the case')

// save
web.click(utils.saveChanges)
web.waitForNotExist(utils.saveChanges)
log.info(`Created ${webCase}`)

web.transaction('07. Run The Web Case')
web.setTimeout(15 * 1000)


web.click(utils.run)
log.info(`Running ${webCase}`)


log.info('*************************')
log.info('* Test Inside CloudBeat *')
log.info('*************************')


if (web.isVisible('//div[@class="value initializing"]')) 
    log.info(`*      ${web.getText('//div[@class="value initializing"]')}     *`)

if (web.isVisible('//div[@class="value running"]'))
    log.info(`*        ${web.getText('//div[@class="value running"]')}        *`)

if (web.isVisible('//div[@class="value pending"]')) {
    log.info(`*        ${web.getText('//div[@class="value pending"]')}        *`)
    assert.fail('The case is stuck at pending')
}
    
if (web.isVisible('//td[text()="No data"]')) {
    log.info(`*        ${web.getText('//td[text()="No data"]')}        *`)
    assert.fail('The case failed to execute')
}

web.waitForVisible('(//span[contains(@class,"ui-label")])[1]')
var status = web.getText('(//span[contains(@class,"ui-label")])[1]')

if (status == 'PASSED')
    log.info('*      Test Passed      *')
else if (status == 'FAILED')
    log.info('*      Test Failed      *')
else
    log.info('* There was a problem running the script *')

log.info('*************************')


/* todo: check defined variables */


if (deleteProject) {
    web.transaction('08. Delete Project')
    func.deleteProject(project)
}


web.dispose('Passed')
var endTime = func.getTime()
log.info(`Sanity test finished in ${(parseFloat(endTime - startTime) / 1000).toFixed(1)} seconds`)