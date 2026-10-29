export class SaveSystem {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  readProfile() {
    const raw = this.storage.getItem('ligne-libre-profile');
    if (!raw) {
      return { coins: 0, totalScore: 0, unlocks: [] };
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return { coins: 0, totalScore: 0, unlocks: [] };
    }
  }

  writeProfile(profile) {
    this.storage.setItem('ligne-libre-profile', JSON.stringify(profile));
    return profile;
  }
}
