#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const program = new Command();

// Configuration
const API_URL = process.env.SWARM_API_URL || 'https://swarm.accelerator.ai';
const API_KEY = process.env.SWARM_API_KEY;

// Client for API calls
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY || '',
    'X-Agent-Mode': 'true', // Flag to indicate AI agent access
    'User-Agent': 'SwarmCLI/1.0.0',
  },
});

// CLI header
function printHeader() {
  console.log(chalk.cyan.bold('\n🦾 Swarm Accelerator CLI\n'));
  console.log(chalk.gray('AI-powered startup acceleration for AI agents\n'));
}

// Main program
program
  .name('swarm')
  .description('CLI for AI agents to access Swarm Accelerator')
  .version('1.0.0');

// ============================================
// PITCH ANALYSIS
// ============================================

program
  .command('analyze')
  .description('Analyze a startup pitch')
  .option('-f, --file <path>', 'Path to pitch JSON file')
  .option('-i, --inline <json>', 'Inline JSON pitch data')
  .option('-o, --output <path>', 'Output file for results (default: stdout)')
  .action(async (options) => {
    printHeader();
    
    if (!API_KEY) {
      console.error(chalk.red('Error: SWARM_API_KEY environment variable not set'));
      console.log(chalk.yellow('\nGet your API key at: https://swarm.accelerator.ai/api-keys'));
      process.exit(1);
    }

    let pitchData;

    if (options.file) {
      const filePath = path.resolve(options.file);
      pitchData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else if (options.inline) {
      pitchData = JSON.parse(options.inline);
    } else {
      console.error(chalk.red('Error: Provide pitch data via --file or --inline'));
      process.exit(1);
    }

    const spinner = ora('Analyzing pitch...').start();

    try {
      const response = await client.post('/api/pitches', pitchData);
      
      if (response.data.success) {
        const analysisId = response.data.pitch.id;
        
        // Poll for analysis results
        spinner.text = 'Running AI agent swarm...';
        const analysis = await pollAnalysis(analysisId);
        
        spinner.succeed('Analysis complete!');
        
        // Output results
        const output = formatPitchResults(analysis);
        
        if (options.output) {
          fs.writeFileSync(options.output, JSON.stringify(analysis, null, 2));
          console.log(chalk.green(`\n✓ Results saved to: ${options.output}`));
        } else {
          console.log(output);
        }
      } else {
        spinner.fail('Analysis failed');
        console.error(chalk.red(response.data.error));
      }
    } catch (error: any) {
      spinner.fail('Error');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Poll for analysis results
async function pollAnalysis(pitchId: string, maxAttempts = 30): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await client.get(`/api/pitches/${pitchId}/analyze`);
    
    if (response.data.success && response.data.analysis) {
      return response.data.analysis;
    }
    
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
  }
  
  throw new Error('Analysis timeout (60s)');
}

// Format pitch results for CLI
function formatPitchResults(analysis: any): string {
  let output = '\n';
  
  output += chalk.bold.cyan('📊 Pitch Analysis Results\n\n');
  
  output += chalk.bold('Overall Score: ');
  output += chalk.green.bold(`${analysis.overallScore}/100\n\n`);
  
  output += chalk.bold('Recommendation: ');
  const recColor = analysis.recommendation === 'APPROVED' ? 'green' : 
                   analysis.recommendation === 'CONDITIONAL' ? 'yellow' : 'red';
  output += (chalk as any)[recColor].bold(analysis.recommendation) + '\n\n';
  
  output += chalk.bold('Agent Scores:\n');
  output += `  Financial: ${analysis.financialScore}/100\n`;
  output += `  Technical: ${analysis.technicalScore}/100\n`;
  output += `  Market: ${analysis.marketScore}/100\n`;
  output += `  Legal: ${analysis.legalScore}/100\n\n`;
  
  output += chalk.bold('Summary:\n');
  output += chalk.gray(analysis.summary) + '\n\n';
  
  output += chalk.bold('Valuation: ');
  output += chalk.cyan(`$${(analysis.valuation / 1_000_000).toFixed(1)}M`) + '\n';
  
  return output;
}

// ============================================
// DeFi ACCELERATOR
// ============================================

program
  .command('defi')
  .description('DeFi protocol accelerator')
  .option('-f, --file <path>', 'Path to protocol JSON file')
  .option('-o, --output <path>', 'Output file for results')
  .action(async (options) => {
    printHeader();
    
    if (!options.file) {
      console.error(chalk.red('Error: --file required'));
      process.exit(1);
    }

    const protocolData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
    
    const spinner = ora('Analyzing DeFi protocol...').start();

    try {
      const response = await client.post('/api/defi/accelerate', protocolData);
      
      if (response.data.success) {
        spinner.succeed('Analysis complete!');
        
        const report = response.data.report;
        
        // Output results
        console.log('\n' + chalk.bold.cyan('🔥 DeFi Protocol Analysis\n'));
        console.log(chalk.bold('Overall Score: ') + chalk.green.bold(`${report.executiveSummary.overallScore}/100`));
        console.log(chalk.bold('Timeline: ') + report.executiveSummary.estimatedTimeline);
        console.log(chalk.bold('Cost: ') + report.executiveSummary.estimatedCost);
        console.log(chalk.bold('Ready: ') + (report.executiveSummary.readyForLaunch ? chalk.green('YES') : chalk.yellow('NOT YET')));
        console.log('\n' + chalk.bold('Recommendation:\n'));
        console.log(chalk.gray(report.executiveSummary.recommendation) + '\n');
        
        if (options.output) {
          fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
          console.log(chalk.green(`✓ Full report saved to: ${options.output}\n`));
        }
      }
    } catch (error: any) {
      spinner.fail('Error');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// ============================================
// INVESTOR MATCHING
// ============================================

program
  .command('match')
  .description('Match project with investors')
  .option('-f, --file <path>', 'Path to project JSON file')
  .option('-o, --output <path>', 'Output file for matches')
  .action(async (options) => {
    printHeader();
    
    if (!options.file) {
      console.error(chalk.red('Error: --file required'));
      process.exit(1);
    }

    const projectData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
    
    const spinner = ora('Matching with investors...').start();

    try {
      const response = await client.post('/api/matching/projects', projectData);
      
      if (response.data.success) {
        spinner.succeed('Matching complete!');
        
        const matches = response.data.matches;
        
        console.log('\n' + chalk.bold.cyan('💰 Investor Matches\n'));
        console.log(chalk.bold(`Found ${matches.length} matches:\n`));
        
        matches.slice(0, 10).forEach((match: any, i: number) => {
          console.log(chalk.bold(`${i + 1}. ${match.investor.name}`) + chalk.gray(` (${match.investor.type})`));
          console.log(`   Score: ${chalk.green(match.score + '%')}`);
          console.log(`   Synergies: ${match.synergies.slice(0, 2).join(', ')}`);
          console.log('');
        });
        
        if (options.output) {
          fs.writeFileSync(options.output, JSON.stringify(matches, null, 2));
          console.log(chalk.green(`✓ Full matches saved to: ${options.output}\n`));
        }
      }
    } catch (error: any) {
      spinner.fail('Error');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// ============================================
// M&A EXIT ANALYSIS
// ============================================

program
  .command('exit')
  .description('M&A exit analysis')
  .option('-f, --file <path>', 'Path to company JSON file')
  .option('-o, --output <path>', 'Output file for results')
  .action(async (options) => {
    printHeader();
    
    if (!options.file) {
      console.error(chalk.red('Error: --file required'));
      process.exit(1);
    }

    const companyData = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
    
    const spinner = ora('Analyzing exit options...').start();

    try {
      const response = await client.post('/api/ma/exit-analysis', companyData);
      
      if (response.data.success) {
        spinner.succeed('Analysis complete!');
        
        const report = response.data.report;
        
        console.log('\n' + chalk.bold.cyan('🚀 M&A Exit Analysis\n'));
        console.log(chalk.bold('Valuation Range: ') + 
          chalk.green(`$${(report.valuation.recommendedRange.low / 1_000_000).toFixed(1)}M - `) +
          chalk.green(`$${(report.valuation.recommendedRange.high / 1_000_000).toFixed(1)}M`));
        console.log(chalk.bold('Readiness: ') + `${report.executiveSummary.readinessScore}/100`);
        console.log(chalk.bold('Timeline: ') + report.executiveSummary.timeToExit);
        console.log('\n' + chalk.bold('Top Acquirers:\n'));
        
        report.executiveSummary.topAcquirers.slice(0, 5).forEach((acq: string, i: number) => {
          console.log(chalk.green(`${i + 1}. ${acq}`));
        });
        
        console.log('');
        
        if (options.output) {
          fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
          console.log(chalk.green(`✓ Full report saved to: ${options.output}\n`));
        }
      }
    } catch (error: any) {
      spinner.fail('Error');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// ============================================
// API KEY MANAGEMENT
// ============================================

program
  .command('init')
  .description('Initialize Swarm CLI with API key')
  .action(async () => {
    printHeader();
    
    console.log(chalk.bold('Setup Instructions:\n'));
    console.log('1. Get your API key at: ' + chalk.cyan('https://swarm.accelerator.ai/api-keys'));
    console.log('2. Create a .env file in your project:');
    console.log(chalk.gray('   SWARM_API_KEY=your_api_key_here'));
    console.log('   SWARM_API_URL=https://swarm.accelerator.ai');
    console.log('\n3. Or set environment variables:');
    console.log(chalk.gray('   export SWARM_API_KEY=your_api_key_here\n'));
    console.log(chalk.yellow('For AI agents: Use agent-specific pricing tier ($99/mo for unlimited API access)\n'));
  });

// Parse and execute
program.parse();
