const { 
    CompanyUser, 
    CompanyArea, 
    CompanyRol, 
    CompanyTemplateCarnet, 
    CompanyCarnet,
    Subscription,
    Company
} = require('./src/models');

async function check() {
    try {
        const companies = await Company.findAll();
        console.log(`Found ${companies.length} companies`);
        
        for (const company of companies) {
            const users = await CompanyUser.count({ where: { company_id: company.id } });
            const areas = await CompanyArea.count({ where: { company_id: company.id } });
            const roles = await CompanyRol.count({ where: { company_id: company.id } });
            const templates = await CompanyTemplateCarnet.count({ where: { company_id: company.id } });
            const carnets = await CompanyCarnet.count({ where: { company_id: company.id } });
            const sub = await Subscription.findOne({ where: { company_id: company.id, status: 'ACTIVE' } });
            
            console.log(`Company ID: ${company.id}, Name: ${company.name}`);
            console.log(`  Users: ${users}, Areas: ${areas}, Roles: ${roles}, Templates: ${templates}, Carnets: ${carnets}`);
            console.log(`  Subscription: ${sub ? 'ACTIVE' : 'NONE'}`);
        }
    } catch (error) {
        console.error(error);
    }
}

check();
