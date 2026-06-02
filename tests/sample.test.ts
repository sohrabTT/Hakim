describe('Project Health System', () => {
  it('should have required configuration files', () => {
    const fs = require('fs')
    expect(fs.existsSync('package.json')).toBe(true)
    expect(fs.existsSync('tsconfig.json')).toBe(true)
    expect(fs.existsSync('next.config.mjs')).toBe(true)
    expect(fs.existsSync('.env.example')).toBe(true)
  })

  it('should have correct Prisma schema path', () => {
    const fs = require('fs')
    const schema = fs.readFileSync('src/prisma/schema.prisma', 'utf8')
    expect(schema).toContain('model User')
    expect(schema).toContain('model Patient')
    expect(schema).toContain('model DietPlan')
    expect(schema).toContain('model ChatSession')
    expect(schema).toContain('model Profile')
    expect(schema).toContain('model SurgeryGuide')
  })

  it('should have valid package.json structure', () => {
    const pkg = require('../package.json')
    expect(pkg.name).toBe('health-system')
    expect(pkg.scripts).toHaveProperty('dev')
    expect(pkg.scripts).toHaveProperty('build')
    expect(pkg.dependencies).toHaveProperty('next')
    expect(pkg.dependencies).toHaveProperty('prisma')
  })
})
