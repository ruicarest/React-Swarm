import React, { Component } from 'react';
import * as THREE from 'three';

export class Background extends Component {

  state = {};          //component state

  componentDidMount = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //ADD SCENE
    this.scene = new THREE.Scene()

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.z = 10;
    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    //ADD CUBE
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: '#FF0000'});
    this.cube = new THREE.Mesh(geometry, material);

    this.scene.add(this.cube);

    this.start();
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {
    this.cube.rotation.x += 0.01
    this.cube.rotation.y += 0.01
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
    //this.scene.background = new THREE.Color( 0x000000 );
  }
  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  update = () => {

  }

  render = (state) => {
    return (
      <div
        style={{ position: 'absolute', width: '400px', height: '400px' }}
        ref={(mount) => { this.mount = mount }} />
    );
  }

}