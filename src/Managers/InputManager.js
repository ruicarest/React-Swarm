import _ from "lodash";

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
  Q: 81
};

export default function InputManager() {
  function init() {
    //load Listeners;
    initResize.call(this);

    if (!this.isMobileBrowser) {
      initDesktop.call(this);
    } else {
      initMobile.call(this);
    }
  }

  function handleResize() {
    let offset = {
      x: this.refs.gameWindow.clientWidth / 2 - this.props.screen.width / 2,
      y: this.refs.gameWindow.clientHeight / 2 - this.props.screen.height / 2
    };

    this.updateObjectsPosition(offset);

    this.props.updateState({
      screen: {
        width: this.refs.gameWindow.clientWidth,
        height: this.refs.gameWindow.clientHeight,
        ratio:
          this.refs.gameWindow.clientWidth /
            this.refs.gameWindow.clientHeight || 1
      }
    });
  }

  function handleKeys(value, e) {
    let keys = this.props.keys;
    if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
    if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
    if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
    if (e.keyCode === KEY.SPACE) keys.space = value;
    if (e.keyCode === KEY.Q) keys.mine = value;

    this.props.updateState({ keys: keys });
  }

  function handleJoystick(padAngle) {
    this.props.updateState({
      joypad: {
        ...this.props.joypad,
        angle: padAngle
      }
    });
  }

  function initResize() {
    //handle window resize
    window.addEventListener(
      "resize",
      _.throttle(handleResize.bind(this, false), 100)
    );
  }

  function initMobile() {
    //handle touch events
    this.refs.gameWindow.addEventListener(
      "touchmove",
      function(e) {
        if (this.props.screen.width > e.touches[0].clientX * 2) {
          this.props.updateState({
            joypad: {
              ...this.props.joypad,
              moving: true,
              stickPosition: {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
              }
            }
          });
        }
      }.bind(this),
      false
    );
    this.refs.gameWindow.addEventListener(
      "touchstart",
      function(e) {
        const leftClick =
          this.props.screen.width >
          e.touches[e.changedTouches[0].identifier].clientX * 2;

        if (leftClick) {
          this.props.updateState({
            joypad: {
              ...this.props.joypad,
              on: true,
              basePosition: {
                x: e.touches[e.changedTouches[0].identifier].clientX,
                y: e.touches[e.changedTouches[0].identifier].clientY
              },
              stickPosition: {
                x: e.touches[e.changedTouches[0].identifier].clientX,
                y: e.touches[e.changedTouches[0].identifier].clientY
              }
            }
          });
        } else {
          this.props.updateState({
            joypad: {
              ...this.props.joypad,
              stickClickPosition: {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                on: true
              }
            }
          });
        }
      }.bind(this),
      false
    );
    this.refs.gameWindow.addEventListener(
      "touchend",
      function(e) {
        const leftClick =
          this.props.screen.width > e.changedTouches[0].clientX * 2;

        /*         const rightClick =
                this.props.screen.width < e.changedTouches[0].clientX * 2; */

        if (leftClick) {
          this.props.updateState({
            joypad: {
              ...this.props.joypad,
              on: false,
              moving: false,
              basePosition: {
                x: 0,
                y: 0
              }
            }
          });
        } else {
          this.props.updateState({
            joypad: {
              ...this.props.joypad,
              stickClickPosition: {
                x: 0,
                y: 0,
                on: false
              }
            }
          });
        }
      }.bind(this),
      false
    );
  }

  function initDesktop() {
    //handle key events
    window.addEventListener("keyup", handleKeys.bind(this, false));
    window.addEventListener("keydown", handleKeys.bind(this, true));

    //handle mouse events
    this.refs.gameWindow.addEventListener(
      "mousemove",
      function(e) {
        this.props.updateState({
          mouse: {
            active: true,
            position: {
              x: e.clientX,
              y: e.clientY
            }
          }
        });
      }.bind(this),
      false
    );
  }

  return {
    init: init,
    handleResize: handleResize,
    handleKeys: handleKeys,
    handleJoystick: handleJoystick
  };
}
