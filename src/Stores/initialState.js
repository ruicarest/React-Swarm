export const initialState = {
  keys: {
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    space: 0,
    mine: 0
  },
  mouse: {
    active: true,
    position: {
      x: 0,
      y: 0
    }
  },
  joypad: {
    on: false,
    moving: false,
    basePosition: {
      x: -1,
      y: -1
    },
    stickPosition: {
      x: -1,
      y: -1
    },
    stickClickPosition: {
      x: -1,
      y: -1,
      on: false
    },
    angle: -1
  },
  map: {
    width: 10,
    height: 10,
    asteroids: 0,
    energy: 0,
    ezt: 0,
    mission: 0,
    description: "",
    enemies: [],
    bullets: 0,
    minimapScale: 10
  },
  screen: {
    width: 10,
    height: 10,
    ratio: 1
  },
  game: {
    currentScore: 0,
    inGame: false,
    reload: false,
    currentMap: 0,
    context: null,
    ready: false
  },

  ship: {
    position: {
      x: 0,
      y: 0
    },
    velocity: {
      x: 0,
      y: 0
    },
    HP: 0
  },
  nearestEZT: {
    distance: 10000000,
    ang: 0
  }
};
