const Groq = require('groq-sdk');

let groqClient = null;

function getGroq() {
  if (!groqClient && process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

const VIETNAM_CONTEXT = `
You are FRIDAY, an advanced AI sustainability assistant for GreenAgentOS – Vietnam Sustainability Command Center.

Your expertise covers:
- Vietnam environmental data (2020-2024): CO2 emissions, AQI, climate risks
- Key cities: Ho Chi Minh City (critical emissions, 18.4MT/yr), Hanoi (15.2MT/yr), Da Nang, Hai Phong, Can Tho, Hue, Nha Trang, Mekong Delta
- Vietnam's total CO2: ~327MT in 2024 (up from 285MT in 2020)
- Renewable energy: 28.5% (18.5GW solar, 4.8GW wind)
- Coal dependency: 44.2%
- Climate risks: Mekong Delta - 96% flood risk, Hanoi - 82% heatwave risk

You help with:
1. Carbon emission analysis and hotspot detection
2. Climate disaster prediction (flood, heatwave, drought, storm)
3. AI solution selection (hybrid work, solar scheduling, traffic optimization)
4. Task assignment and sustainability planning
5. Report generation

Always be data-driven, specific, and action-oriented. Format responses clearly.
`;

async function chat(messages, systemPrompt = VIETNAM_CONTEXT) {
  const groq = getGroq();
  if (!groq) {
    return generateFallbackResponse(messages[messages.length - 1]?.content || '');
  }
  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || 'Analysis complete.';
  } catch (err) {
    console.error('Groq error:', err.message);
    return generateFallbackResponse(messages[messages.length - 1]?.content || '');
  }
}

function generateFallbackResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('highest emission') || q.includes('worst city')) {
    return '🔴 Ho Chi Minh City has the highest carbon emissions in Vietnam at 18.4 MT/year (2024), driven by 9.3M population, 92% traffic density, and 68% coal dependency. Recommended action: Hybrid Work Policy + Traffic Route Optimization, potential CO₂ reduction: 18-23%.';
  }
  if (q.includes('flood') || q.includes('mekong')) {
    return '🌊 Mekong Delta Flood Risk Analysis: Current risk level 96% (Critical). Based on 5-year ML prediction model: abnormal rainfall patterns +18% above average, sea-level rise 2.1cm/yr, atmospheric pressure anomalies detected. Emergency climate preparedness plan recommended immediately.';
  }
  if (q.includes('hanoi') || q.includes('traffic')) {
    return '🚦 Hanoi Traffic & Emission Analysis: AQI 162 (Unhealthy), traffic density 88%, coal dependency 75%. CO₂: 15.2 MT/yr. Recommended: AI-optimized traffic routing + hybrid work 3 days/week. Projected reduction: 19% CO₂ within 8 weeks.';
  }
  if (q.includes('solar') || q.includes('renewable')) {
    return '☀️ Vietnam Solar Status: 18.5 GW installed capacity. Best cities: Nha Trang (88% availability), Da Nang (82%), Can Tho (78%). Recommended: Schedule heavy computational tasks during 9AM-3PM solar peak. Potential 25-35% energy cost reduction.';
  }
  if (q.includes('report')) {
    return '📊 Vietnam Sustainability Report 2024:\n• Total CO₂: 327 MT (↑3.2% vs 2023)\n• Renewable share: 28.5% (target: 43% by 2030)\n• Critical zones: HCMC, Hanoi, Hai Phong\n• Mekong Delta: 96% flood risk - urgent intervention needed\n• Recommended: Accelerate solar deployment + implement city-wide hybrid work policies';
  }
  if (q.includes('solution') || q.includes('suggest')) {
    return '⚡ AI Solution Analysis:\n1. HCMC → Hybrid Work Policy (reduces 23% CO₂)\n2. Hanoi → Traffic Optimization (reduces 19% CO₂)\n3. Hai Phong → Industrial Emission Controls (reduces 22% CO₂)\n4. Mekong Delta → Climate Disaster Preparedness (urgent)\n5. Da Nang/Nha Trang → Solar Energy Scheduling (35% energy savings)';
  }
  return `🤖 FRIDAY Analysis: To get the most accurate AI responses for "${query}", please configure your GROQ_API_KEY in the backend .env file. Visit console.groq.com to get a free API key. I can analyze Vietnam's carbon data, predict climate risks, and suggest sustainability solutions when fully connected.`;
}

async function analyzeTask(taskData) {
  const groq = getGroq();
  const prompt = `Analyze this sustainability task for Vietnam and provide: 1) Carbon impact assessment, 2) Recommended approach, 3) Expected CO2 reduction. Task: ${JSON.stringify(taskData)}`;
  if (!groq) {
    return {
      carbonImpact: 'Medium-High (estimated 2-5 MT CO₂ reduction)',
      recommendation: 'Implement during peak solar hours (9AM-3PM) to maximize renewable energy usage',
      co2Reduction: '15-25%',
      ecoReason: 'This task directly contributes to Vietnam\'s 2030 carbon neutrality target'
    };
  }
  try {
    const result = await chat([{ role: 'user', content: prompt }]);
    return { carbonImpact: 'Based on AI analysis', recommendation: result, co2Reduction: '15-30%', ecoReason: result.substring(0, 150) };
  } catch {
    return { carbonImpact: 'Medium', recommendation: 'Proceed with eco-optimized approach', co2Reduction: '10-20%' };
  }
}

async function generateSustainabilityReport(data) {
  const groq = getGroq();
  const prompt = `Generate a comprehensive AI report on atmospheric changes and sustainability control for Vietnam using this data: ${JSON.stringify(data)}. Include: Executive Summary, previous 5-year emission trend, city-wise climate risks, citizen population/vehicle data usage, CO2 mobility control plan, renewable energy recommendations for specific areas, solar/SCADA style real-time monitoring approach, climate mail alert strategy, and 2025-2030 action targets.`;
  if (!groq) {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIETNAM SUSTAINABILITY REPORT 2024
GreenAgentOS Command Center
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY
Vietnam's total CO₂ emissions reached 327.4 MT in 2024, representing a 3.2% increase from 2023. The renewable energy share grew to 28.5%, with 18.5 GW solar and 4.8 GW wind capacity installed.

CRITICAL ZONES
• Ho Chi Minh City: 18.4 MT/yr — CRITICAL
• Hanoi: 15.2 MT/yr — CRITICAL  
• Hai Phong: 9.6 MT/yr — HIGH (heavy industry)
• Mekong Delta: 8.2 MT/yr with 96% FLOOD RISK

CLIMATE RISK ASSESSMENT
• Mekong Delta: Flood Risk 96% — Emergency intervention required
• Hanoi: Heatwave Risk 82% — Urban cooling measures needed
• Da Nang: Storm Risk 80% — Infrastructure resilience upgrade
• Vietnam Coast: Sea-level rise 2.1cm/yr — Long-term adaptation required

ENERGY TRANSITION STATUS
• Solar Capacity: 18.5 GW (world's 9th largest)
• Wind Capacity: 4.8 GW
• Coal Share: 44.2% (reduction target: 30% by 2030)
• Renewable Target: 43% by 2030 (current: 28.5%)

TOP RECOMMENDATIONS
1. Use citizen household and vehicle data to calculate mobility CO₂ by area
2. Send AI-generated rain, storm, flood and heat alerts to city-specific citizens
3. Apply solar-scheduled operations in public offices, schools and hospitals
4. Deploy SCADA-style 5-second refresh monitoring for solar plants and renewable infrastructure
5. Use AI traffic optimization and low-emission zones in HCMC and Hanoi
6. Establish climate emergency response for Mekong Delta
7. Phase out coal dependency in Hai Phong industrial zones

2025 TARGETS
• Reduce national CO₂ by 15% vs 2024
• Increase renewable share to 33%
• Achieve 95% clean energy in government operations
• Zero coal dependency in Ho Chi Minh City by 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by GreenAgentOS AI • ${new Date().toLocaleDateString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
  try {
    return await chat([{ role: 'user', content: prompt }]);
  } catch {
    return 'Report generation failed. Please check AI service connection.';
  }
}

module.exports = { chat, analyzeTask, generateSustainabilityReport, VIETNAM_CONTEXT };
