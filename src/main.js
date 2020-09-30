// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */
Colors = {}
Colors.names = {
  aqua: "#00ffff",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  black: "#000000",
  blue: "#0000ff",
  brown: "#a52a2a",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgrey: "#a9a9a9",
  darkgreen: "#006400",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkviolet: "#9400d3",
  fuchsia: "#ff00ff",
  gold: "#ffd700",
  green: "#008000",
  indigo: "#4b0082",
  khaki: "#f0e68c",
  lightblue: "#add8e6",
  lightcyan: "#e0ffff",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  magenta: "#ff00ff",
  maroon: "#800000",
  navy: "#000080",
  olive: "#808000",
  orange: "#ffa500",
  pink: "#ffc0cb",
  purple: "#800080",
  violet: "#800080",
  red: "#ff0000",
  silver: "#c0c0c0",
  white: "#ffffff",
  yellow: "#ffff00"
};

Colors.random = function() {
  var result;
  var count = 0;
  for (var prop in this.names)
    if (Math.random() < 1/++count)
      result = prop;
  return result;
};
class DrumSet {
  constructor (drumOptions = []) {
    this.drumOptions = drumOptions
    this.drums = []
    this.lastPlayed = null
    this.createDrums()

  }
  createDrums () {
    this.drums = this.drumOptions.map((drumOption) => {
      return new Drum(drumOption)
    })
  }
  handleInput (pose) {
    this.drums.forEach((drum) => {
      if (!drum.detectMovement(pose)) {
        drum.canPlay = true
      }
    })
  }
}
class Drum {
  constructor(options) {
    this.color = options.color
    this.soundSrc = options.soundSrc
    this.name = options.name
    this.sound = new Audio()
    this.sound.src = this.soundSrc
    this.sound.pause()
    this.played = false
    this.spaceDelay = options.spaceDelay || 200
    this.canPlay = true
    this.dimensions = options.dimensions
  }
  play () {
    if (this.canPlay) {
      this.sound.play()
      this.canPlay = false
    }
  }
  withinBounderies (feature) {
    return feature.x > this.dimensions[0].x &&
      feature.x < this.dimensions[1].x &&
      feature.y > this.dimensions[0].y &&
      feature.y < this.dimensions[1].y
  }
  detectMovement (features) {
    if (this.withinBounderies(features.rightWrist) || this.withinBounderies(features.leftWrist)) {
      this.play()
      return true
    } else {
      return false
    }
  }
}

let video;
let poseNet;
let poses = [];
let drumKit = new DrumSet([{
  soundSrc: './sounds/Snares/Snare1.wav',
  color: Colors.random(),
  dimensions: [
    {x: 0, y: 500},
    {x: 300, y: 600}
    ]
  },
  {
    soundSrc: './sounds/Hats/Hat 1.wav',
    color: Colors.random(),
    dimensions: [
      {x: 0, y: 200},
      {x: 300, y: 210}
    ]
  },
  ,
  {
    soundSrc: './sounds/Kick/Kick 1.wav',
    color: Colors.random(),
    dimensions: [
      {x: 320, y: 500},
      {x: 450, y: 600}
    ]
  },
  {
    soundSrc: './sounds/Snares/Snare 13.wav',
    color: Colors.random(),
    dimensions: [
      {x: 900, y: 500},
      {x: 1280, y: 600}
    ]
  },
])

function setup() {
  createCanvas(1280, 720);
  video = createCapture(VIDEO, () => {}, {
    video: {
      flipHorizontal: true
    }
  });
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select('#status').html('Model Loaded');
  draw()
}

function draw() {
  image(video, 0, 0, width, height);
  // We can call both functions to draw all keypoints and the skeletons
  drumKit.drums.forEach((drum) => {
    fill(drum.color)
    //select('#status').html(JSON.stringify(drum.dimensions))
    ///rect(drum.dimensions[0].x, 720 - (720 / 3), 1280 / 4, 720)
    rect(drum.dimensions[0].x, drum.dimensions[0].y, drum.dimensions[1].x, drum.dimensions[1].y)
  })
  drawKeypoints();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    if (pose.rightWrist.confidence > 0.2 && pose.leftWrist.confidence > 0.2) {
      fill('red')
      ellipse(pose.rightWrist.x, pose.rightWrist.y, 30, 30);
      ellipse(pose.leftWrist.x, pose.leftWrist.y, 30, 30);
      drumKit.handleInput(pose)
    }

  }
}

