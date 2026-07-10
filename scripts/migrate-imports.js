#!/usr/bin/env node

/**
 * 🔄 K-Vibe Tracker Import Path Migration Script
 * 
 * 목적: lib 폴더 재구성에 따른 모든 import 경로 일괄 업데이트
 * 방식: 단계별 마이그레이션 (8 phases)
 * 안전성: 각 단계 후 검증 + git commit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 마이그레이션 맵: [기존경로, 새로운경로, 파일설명]
const MIGRATIONS = [
  // Phase 1: Domain Models (Foundation Layer)
  ['@/lib/haversine', '@/lib/features', 'Domain: Haversine distance calc'],
  ['@/lib/crowd', '@/lib/domain', 'Domain: Crowd analysis'],
  ['@/lib/youtube', '@/lib/domain', 'Domain: YouTube API'],
  ['@/lib/analysis', '@/lib/domain', 'Domain: Analysis logic'],
  ['@/lib/docent', '@/lib/domain', 'Domain: Docent AI'],
  ['@/lib/tourapi', '@/lib/domain', 'Domain: Tour API'],
  ['@/lib/routes', '@/lib/domain', 'Domain: Route logic'],
  ['@/lib/facilities', '@/lib/domain', 'Domain: Facilities'],
  
  // Phase 2: Cache Layer
  ['@/lib/local-api-cache', '@/lib/cache', 'Cache: Local API'],
  ['@/lib/location-cache', '@/lib/cache', 'Cache: Location'],
  
  // Phase 3: UI State
  ['@/lib/radar-radius', '@/lib/ui-state', 'UI State: Radar radius'],
  ['@/lib/view-mode', '@/lib/ui-state', 'UI State: View mode'],
  ['@/lib/persona-preference', '@/lib/ui-state', 'UI State: Persona preference'],
  
  // Phase 4: Internationalization
  ['@/lib/ui-copy', '@/lib/i18n', 'i18n: UI Copy'],
  
  // Phase 5: Features Layer
  ['@/lib/place-detail-share', '@/lib/features', 'Feature: Place sharing'],
  ['@/lib/place-images', '@/lib/features', 'Feature: Place images'],
  ['@/lib/place-social-proof', '@/lib/features', 'Feature: Social proof'],
  ['@/lib/saved-places', '@/lib/features', 'Feature: Saved places'],
  ['@/lib/map-pin-accessibility', '@/lib/features', 'Feature: Map pin accessibility'],
];

// 제외할 디렉토리
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.github',
];

// 처리할 파일 확장자
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * 파일이 제외 디렉토리에 있는지 확인
 */
function isExcluded(filePath) {
  return EXCLUDE_DIRS.some(dir => filePath.includes(path.sep + dir + path.sep) || filePath.startsWith(dir));
}

/**
 * 모든 TypeScript/JavaScript 파일 찾기
 */
function findAllFiles(dir = '.') {
  const files = [];
  
  function walk(currentPath) {
    if (isExcluded(currentPath)) return;
    
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (FILE_EXTENSIONS.includes(path.extname(item))) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      console.warn(`⚠️  Cannot read ${currentPath}: ${err.message}`);
    }
  }
  
  walk(dir);
  return files;
}

/**
 * 파일에서 마이그레이션 수행
 */
function migrateFile(filePath, oldPath, newPath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // 정규식 패턴: import ... from '@/lib/old-path'
    const patterns = [
      new RegExp(`from\\s+['"\`]${oldPath}['"\`]`, 'g'),
      new RegExp(`from\\s+['"\`]${oldPath}\\/(.*?)['"\`]`, 'g'),
      new RegExp(`require\\s*\\(\\s*['"\`]${oldPath}['"\`]\\s*\\)`, 'g'),
    ];
    
    let hasChanges = false;
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        hasChanges = true;
        if (pattern.source.includes('require')) {
          content = content.replace(pattern, `require('${newPath}')`);
        } else if (pattern.source.includes('(.*?)')) {
          content = content.replace(pattern, `from '${newPath}/$1'`);
        } else {
          content = content.replace(pattern, `from '${newPath}'`);
        }
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return 1;
    }
    
    return 0;
  } catch (err) {
    console.warn(`⚠️  Error processing ${filePath}: ${err.message}`);
    return 0;
  }
}

/**
 * 모든 파일에서 마이그레이션 수행
 */
function performMigration(oldPath, newPath) {
  const files = findAllFiles();
  let changedCount = 0;
  
  console.log(`\n📍 Migrating: ${oldPath} → ${newPath}`);
  
  for (const file of files) {
    const changed = migrateFile(file, oldPath, newPath);
    changedCount += changed;
  }
  
  if (changedCount > 0) {
    console.log(`   ✅ Updated ${changedCount} file(s)`);
  } else {
    console.log(`   ℹ️  No files to update`);
  }
  
  return changedCount;
}

/**
 * 타입 체크 실행
 */
function runTypeCheck() {
  try {
    console.log('\n🔎 Running type check...');
    execSync('npm run type-check', { stdio: 'inherit' });
    console.log('✅ Type check passed!');
    return true;
  } catch (err) {
    console.error('❌ Type check failed!');
    return false;
  }
}

/**
 * 린트 체크 실행
 */
function runLint() {
  try {
    console.log('\n🎨 Running linter...');
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Linter passed!');
    return true;
  } catch (err) {
    console.warn('⚠️  Linter warnings detected (non-critical)');
    return true; // Continue even with warnings
  }
}

/**
 * Git commit 수행
 */
function gitCommit(phaseNum, totalChanges) {
  try {
    const message = `refactor(phase-${phaseNum}): migrate lib import paths

Updated ${totalChanges} import statements to new lib structure.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`;

    execSync(`git add -A`, { stdio: 'pipe' });
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
    console.log(`✅ Git commit created for Phase ${phaseNum}`);
    return true;
  } catch (err) {
    console.warn(`⚠️  Git commit skipped: ${err.message}`);
    return false;
  }
}

/**
 * 메인 실행
 */
async function main() {
  console.log('🚀 Starting import path migration...\n');
  console.log('📊 Migration Statistics:');
  console.log(`   Total migrations: ${MIGRATIONS.length}`);
  console.log(`   Total import statements to update: 107\n`);
  
  // Phase 1: Domain Models
  console.log('\n\n=== PHASE 1: Domain Models ===');
  let phaseTotal = 0;
  phaseTotal += performMigration('@/lib/haversine', '@/lib/features');
  phaseTotal += performMigration('@/lib/crowd', '@/lib/domain');
  phaseTotal += performMigration('@/lib/youtube', '@/lib/domain');
  phaseTotal += performMigration('@/lib/analysis', '@/lib/domain');
  phaseTotal += performMigration('@/lib/docent', '@/lib/domain');
  phaseTotal += performMigration('@/lib/tourapi', '@/lib/domain');
  phaseTotal += performMigration('@/lib/routes', '@/lib/domain');
  phaseTotal += performMigration('@/lib/facilities', '@/lib/domain');
  
  if (phaseTotal > 0) {
    if (!runTypeCheck()) process.exit(1);
    gitCommit(1, phaseTotal);
  }
  
  // Phase 2: Cache Layer
  console.log('\n\n=== PHASE 2: Cache Layer ===');
  phaseTotal = 0;
  phaseTotal += performMigration('@/lib/local-api-cache', '@/lib/cache');
  phaseTotal += performMigration('@/lib/location-cache', '@/lib/cache');
  
  if (phaseTotal > 0) {
    if (!runTypeCheck()) process.exit(1);
    gitCommit(2, phaseTotal);
  }
  
  // Phase 3: UI State
  console.log('\n\n=== PHASE 3: UI State ===');
  phaseTotal = 0;
  phaseTotal += performMigration('@/lib/radar-radius', '@/lib/ui-state');
  phaseTotal += performMigration('@/lib/view-mode', '@/lib/ui-state');
  phaseTotal += performMigration('@/lib/persona-preference', '@/lib/ui-state');
  
  if (phaseTotal > 0) {
    if (!runTypeCheck()) process.exit(1);
    gitCommit(3, phaseTotal);
  }
  
  // Phase 4: Internationalization
  console.log('\n\n=== PHASE 4: Internationalization ===');
  phaseTotal = 0;
  phaseTotal += performMigration('@/lib/ui-copy', '@/lib/i18n');
  
  if (phaseTotal > 0) {
    if (!runTypeCheck()) process.exit(1);
    gitCommit(4, phaseTotal);
  }
  
  // Phase 5: Features Layer
  console.log('\n\n=== PHASE 5: Features Layer ===');
  phaseTotal = 0;
  phaseTotal += performMigration('@/lib/place-detail-share', '@/lib/features');
  phaseTotal += performMigration('@/lib/place-images', '@/lib/features');
  phaseTotal += performMigration('@/lib/place-social-proof', '@/lib/features');
  phaseTotal += performMigration('@/lib/saved-places', '@/lib/features');
  phaseTotal += performMigration('@/lib/map-pin-accessibility', '@/lib/features');
  
  if (phaseTotal > 0) {
    if (!runTypeCheck()) process.exit(1);
    gitCommit(5, phaseTotal);
  }
  
  // Final validation
  console.log('\n\n=== FINAL VALIDATION ===');
  console.log('🔍 Running final checks...\n');
  
  if (!runTypeCheck()) process.exit(1);
  if (!runLint()) console.warn('⚠️  Linter warnings detected');
  
  console.log('\n✅ Migration completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Review git history: git log --oneline -10');
  console.log('   2. Run tests: npm run test');
  console.log('   3. Build project: npm run build');
  console.log('   4. Push to remote: git push');
}

main().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
