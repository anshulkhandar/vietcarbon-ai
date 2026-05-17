require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Check if already seeded
    const existingAdmin = await User.findOne({ username: 'manager' });
    if (existingAdmin) {
      console.log('Already seeded. Skipping.');
      process.exit(0);
    }

    // Create manager
    const manager = await User.create({
      name: 'Vietnam Green Admin',
      email: 'manager@greenagent.vn',
      username: 'manager',
      password: 'manager123',
      role: 'manager',
      department: 'Sustainability Management',
      ecoScore: 95,
    });
    console.log('✓ Admin created: username=manager, password=manager123');

    // Create demo employees
    const employees = [
      { name: 'Nguyen Van An', email: 'an@greenagent.vn', username: 'emp001', password: 'emp123', department: 'Carbon Analysis', skills: ['data-analysis', 'sustainability', 'python'], ecoScore: 82 },
      { name: 'Tran Thi Bich', email: 'bich@greenagent.vn', username: 'emp002', password: 'emp123', department: 'Solar Energy', skills: ['solar-energy', 'project-management'], ecoScore: 78 },
      { name: 'Le Minh Duc', email: 'duc@greenagent.vn', username: 'emp003', password: 'emp123', department: 'Traffic Optimization', skills: ['traffic-analysis', 'gis', 'routing'], ecoScore: 71 },
      { name: 'Pham Thi Lan', email: 'lan@greenagent.vn', username: 'emp004', password: 'emp123', department: 'Climate Research', skills: ['climate-modeling', 'ml', 'data-science'], ecoScore: 88 },
    ];

    for (const emp of employees) {
      await User.create({ ...emp, role: 'employee' });
    }
    console.log('✓ Demo employees created (password: emp123 for all)');

    console.log('\n====================================');
    console.log('GREENAGENT OS — SEED COMPLETE');
    console.log('====================================');
    console.log('Admin Login:');
    console.log('  Username: manager');
    console.log('  Password: manager123');
    console.log('\nEmployee Logins (password: emp123):');
    console.log('  emp001 — Nguyen Van An');
    console.log('  emp002 — Tran Thi Bich');
    console.log('  emp003 — Le Minh Duc');
    console.log('  emp004 — Pham Thi Lan');
    console.log('====================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
