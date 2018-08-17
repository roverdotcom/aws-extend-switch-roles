class AutoAssumeLastRole {
  constructor() {
    this.enabled = false;
  }

  execute(targetIdRole, list) {
    if (!this.enabled || this.hasAssumedRole() || !targetIdRole) return;
    setTimeout(() => {
      for (let form of list.querySelectorAll('form')) {
        const val = `${form.account.value}_${form.roleName.value}`;
        if (targetIdRole === val) {
          this.submitWithCSRF(form);
          break;
        }
      }
    }, 0);
  }

  async submitWithCSRF(form) {
    await new Promise(resolve => {
      const interval = setInterval(() => {
          if (form.csrf.value !== '') {
              clearInterval(interval);
              resolve();
          }
      }, 50 /* ms */);
    });
    form.querySelector('input[type="submit"]').click();
  }

  save(profile) {
    if (!this.enabled) return;
    const lastRoleKey = this.createKey();
    const value = `${profile.aws_account_id}_${profile.role_name}`;
    chrome.storage.sync.set({ [lastRoleKey]: value }, function() {
      console.log(`Saved lastRole to '${lastRoleKey}' as '${value}'`);
    });
  }

  clear() {
    if (!this.enabled) return;
    const lastRoleKey = this.createKey();
    chrome.storage.sync.remove(lastRoleKey, function() {
      console.log(`Cleared lastRole '${lastRoleKey}'`);
    });
  }

  createKey() {
    const accountId = getAccountId('awsc-login-display-name-account');
    const user = elById('awsc-login-display-name-user').textContent.trim().replace(/(.*)\/.*/, '$1');
    return `lastRole_${accountId}_${user}`;
  }

  hasAssumedRole() {
    const usernameMenu = elById('nav-usernameMenu');
    return usernameMenu.classList.contains('awsc-has-switched-role');
  }
}
