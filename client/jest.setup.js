// Mock localStorage for testing
const localStorageMock = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  clear: function() {
    this.store = {};
  },
  removeItem: function(key) {
    delete this.store[key];
  }
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
