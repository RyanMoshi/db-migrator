'use strict';
// Database migration manager — track and run versioned migrations

class DbMigrator {
  constructor(options) {
    options = options || {};
    this._migrations = [];
    this._applied = new Set(options.applied || []);
    this.onRun = options.onRun || null;
  }

  add(version, name, up, down) {
    if (this._migrations.find((m) => m.version === version)) {
      throw new Error('Duplicate migration version: ' + version);
    }
    this._migrations.push({ version, name, up, down });
    this._migrations.sort((a, b) => a.version - b.version);
    return this;
  }

  async migrate(targetVersion) {
    const pending = this._migrations.filter((m) => {
      const shouldRun = targetVersion === undefined ? true : m.version <= targetVersion;
      return shouldRun && !this._applied.has(m.version);
    });
    const log = [];
    for (const m of pending) {
      try {
        await m.up();
        this._applied.add(m.version);
        if (this.onRun) this.onRun('up', m);
        log.push({ version: m.version, name: m.name, direction: 'up', ok: true });
      } catch (err) {
        log.push({ version: m.version, name: m.name, direction: 'up', ok: false, error: err.message });
        break;
      }
    }
    return log;
  }

  async rollback(steps) {
    steps = steps || 1;
    const applied = [...this._applied].sort((a, b) => b - a).slice(0, steps);
    const log = [];
    for (const version of applied) {
      const m = this._migrations.find((x) => x.version === version);
      if (!m || !m.down) continue;
      await m.down();
      this._applied.delete(version);
      if (this.onRun) this.onRun('down', m);
      log.push({ version, name: m.name, direction: 'down', ok: true });
    }
    return log;
  }

  status() {
    return this._migrations.map((m) => ({
      version: m.version, name: m.name, applied: this._applied.has(m.version),
    }));
  }
}

module.exports = DbMigrator;
