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

export default function InputManager(that) {
  const _this = that;
  function init() {
    //load Listeners;
    initResize();

    if (!_this.isMobileBrowser) {
      initDesktop();
    } else {
      initMobile();
    }
  }

  function handleResize() {
    let offset = {
      x: _this.refs.gameWindow.clientWidth / 2 - _this.props.screen.width / 2,
      y: _this.refs.gameWindow.clientHeight / 2 - _this.props.screen.height / 2
    };

    _this.updateObjectsPosition(offset);

    _this.props.updateState({
      screen: {
        width: _this.refs.gameWindow.clientWidth,
        height: _this.refs.gameWindow.clientHeight,
        ratio:
          _this.refs.gameWindow.clientWidth /
            _this.refs.gameWindow.clientHeight || 1
      }
    });
  }

  function handleKeys(value, e) {
    let keys = _this.props.keys;
    if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
    if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
    if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
    if (e.keyCode === KEY.SPACE) keys.space = value;
    if (e.keyCode === KEY.Q) keys.mine = value;

    _this.props.updateState({ keys: keys });
  }

  function handleJoystick(padAngle) {
    _this.props.updateState({
      joypad: {
        ..._this.props.joypad,
        angle: padAngle
      }
    });
  }

  function initResize() {
    //handle window resize
    window.addEventListener(
      "resize",
      _.throttle(handleResize.bind(_this, false), 100)
    );
  }

  function initMobile() {
    //handle touch events
    _this.refs.gameWindow.addEventListener(
      "touchmove",
      function(e) {
        if (_this.props.screen.width > e.touches[0].clientX * 2) {
          _this.props.updateState({
            joypad: {
              ..._this.props.joypad,
              moving: true,
              stickPosition: {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
              }
            }
          });
        }
      }.bind(_this),
      false
    );
    _this.refs.gameWindow.addEventListener(
      "touchstart",
      function(e) {
        const leftClick =
          _this.props.screen.width >
          e.touches[e.changedTouches[0].identifier].clientX * 2;

        if (leftClick) {
          _this.props.updateState({
            joypad: {
              ..._this.props.joypad,
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
          _this.props.updateState({
            joypad: {
              ..._this.props.joypad,
              stickClickPosition: {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                on: true
              }
            }
          });
        }
      }.bind(_this),
      false
    );
    _this.refs.gameWindow.addEventListener(
      "touchend",
      function(e) {
        const leftClick =
          _this.props.screen.width > e.changedTouches[0].clientX * 2;

        /*         const rightClick =
                _this.props.screen.width < e.changedTouches[0].clientX * 2; */

        if (leftClick) {
          _this.props.updateState({
            joypad: {
              ..._this.props.joypad,
              on: false,
              moving: false,
              basePosition: {
                x: 0,
                y: 0
              }
            }
          });
        } else {
          _this.props.updateState({
            joypad: {
              ..._this.props.joypad,
              stickClickPosition: {
                x: 0,
                y: 0,
                on: false
              }
            }
          });
        }
      }.bind(_this),
      false
    );
  }

  function initDesktop() {
    //handle key events
    window.addEventListener("keyup", handleKeys.bind(_this, false));
    window.addEventListener("keydown", handleKeys.bind(_this, true));

    //handle mouse events
    _this.refs.gameWindow.addEventListener(
      "mousemove",
      function(e) {
        _this.props.updateState({
          mouse: {
            active: true,
            position: {
              x: e.clientX,
              y: e.clientY
            }
          }
        });
      }.bind(_this),
      false
    );
  }

  return {
    init: init,
    handleJoystick: handleJoystick
  };
}
