import React, { Component } from "react";
import Sketch from "react-p5";
import { isCompositeComponent } from "react-dom/test-utils";
import Engine from "./Engine";

function distance(p1, p2) {
  let x1 = p1.X
  let x2 = p2.X
  let y1 = p1.Y
  let y2 = p2.Y
  return Math.pow( (x1-x2) * (x1-x2) + (y1-y2) * (y1-y2), .5)
}
 
export default class App extends Component {
  x = 50;
  y = 50;
  id = 0;
  
  lineCount = 0;
  lineWeight = -1


  engine = new Engine()

  


  constructor(props) {
    super(props)
    this.state = { cmd : "point", data : {points:[], lines:[]}, currWeight: 100, sectors:new Map(), weightString: "100", mark:undefined,
     gridMode:false}
  }

  addSector(P) {
    let X = Math.floor(P.X)
    let Y = Math.floor(P.Y)

    let round50 = function (r ) {
        return Math.floor(r/50+.5) * 50
    }

    //console.log(round50(X), round50(Y))

    let s = round50(X)+":"+round50(Y)

    let sec = this.state.sectors

    if(sec.has(s)) {
      sec.get(s).push(P)
    } else {
      sec.set(s, [P])
    }
    //round to the nearest 50...
  }

  clickPoint = m => {
    if(this.state.cmd == "point") {
        this.engine.addPoint( m.mouseY, m.mouseX, parseInt(this.state.weightString))
        this.engine.logPoints()
    }

    if(this.state.cmd=="X") {
      console.log("ADDED TARGET")
      this.engine.addTarget(m.mouseY, m.mouseX)
     // this.setState({mark:[m.mouseX, m.mouseY]})
    }

    if(this.state.cmd=="line") {
      if(m.mouseButton == "right") {
        this.lineCount += 1  //assign new ids upon right-click
        return
      }

      //lineCount acts as the id, 
      if(parseInt(this.state.weightString) != this.lineWeight) {
        this.lineWeight = parseInt(this.state.weightString)
        this.lineCount += 1
      }

      this.engine.addPoint( m.mouseY,m.mouseX, parseInt(this.state.weightString), this.lineCount)
    }
  }

  tryDelete = k => {
    if(this.state.cmd == "weight" && k.key == "Backspace") {
      if(this.state.weightString.length == 0) {
        return
      }
      this.setState({weightString: this.state.weightString.substring(0, this.state.weightString.length - 1)})
    }

    if(this.state.cmd == "X" && k.key == "Backspace") {
      this.setState({mark:undefined})
    }
  }

  typeKey = k => {
    if(this.state.cmd == "line" && k.key != "l") {
      this.lineCount += 1
    }

    if(k.key == "l") {
      this.setState({cmd: "line"})
    } else if(k.key == "p") {
      this.setState({cmd:"point"})
    } else if(k.key == "c") {
      this.setState({cmd:"calculate"})
    } else if(k.key == "w") {
      this.setState({cmd:"weight", weightString:""})
    } else if(k.key == "x") {
      this.setState({cmd:"X"})
    } else if(k.key == "g") {
      this.setState({gridMode:!this.state.gridMode})
    } else if(k.key == "o") {
      this.engine.outputSimulation()
    }

    if(this.state.cmd =="weight") {
      if(isFinite(k.key)) {
      this.setState({weightString: this.state.weightString + k.key}) 
      }
      else {
        console.log(k.key)
      }
    }
    console.log(k.key)
  }
 
  setup = (p5, canvasParentRef) => {
    p5.createCanvas(1500, 1000).parent(canvasParentRef); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)

  ///  let arr = ["146 407 100 0 1", "174 430 100 1 1", "248 440 100 2 1", "285 419 100 3 1", "369 384 100 4 1", "418 402 100 5 1", "470 433 100 6 1", "547 461 100 7 1", "613 447 100 8 1", "675 390 100 9 1", "740 397 100 10 1", "121 720 120 11 3", "152 723 120 12 3", "198 709 120 13 3", "242 704 120 14 3", "365 713 120 15 3", "471 716 120 16 3", "647 706 120 17 3", "728 634 120 18 3", "880 719 120 19 3"]
   // this.lineCount = this.engine.simulateInput(arr)
  };
  draw = p5 => {
    p5.background(255,255,255);
   

    if(this.state.gridMode) {

      p5.drawingContext.setLineDash([5, 15]);
      p5.fill("#00000000")
      for (let r = 0; r < 2200; r += 50) {
        p5.line(0, r, 2000, r)
      }

      for(let c = 0; c < 2100; c+=50 ) {
        p5.line(c, 0, c, 2000)
      }
    }

    
    p5.drawingContext.setLineDash([]);
    p5.fill("black")
    p5.text(this.state.cmd, 10, 10)
    p5.text("weight: " + this.state.weightString, 10, 25)

    let D = this.state.data
    let P = D.points

    for(let i = 0; i < P.length; i++ ) {
      p5.fill("#00000000")
      
      p5.strokeWeight(1)
     // p5.ellipse(P[i].X, P[i].Y, 100, 100)
      p5.ellipse(P[i].X, P[i].Y, 4, 4)
      p5.text(""+P[i].weight, P[i].X, P[i].Y)

    }

    this.engine.renderPoints(p5)
    this.engine.renderLines(p5)
    this.engine.renderTarget(p5)
    this.engine.rendertargetSolution(p5)

    // for(let p of  this.state.lineSegments.values()) {

    // //  console.log(pp +  " hi")
    //   p5.strokeWeight(4)
    // let A = P[p[0]]
    // let B = P[p[1]]

    //   p5.stroke(weightToColor(A.weight))
    // p5.line(A.X, A.Y, B.X, B.Y)
    // }

    // p5.fill("#00000000")
    // p5.strokeWeight(2)


    // p5.stroke("black")
    // if(this.state.mark != undefined) {
    //     p5.strokeWeight(2)
    //     p5.stroke("#F5DD90")
    //     p5.textSize(22)
    //     p5.text("X", this.state.mark[0]-5, this.state.mark[1]+10)
    //   for(let i = 0; i < 30; i++) {
    //     p5.ellipse(this.state.mark[0], this.state.mark[1], i *22, i * 22)
    //   }
    //   p5.textSize(12)
    //   p5.stroke("#000")
    //   p5.strokeWeight(1)
    // }
  
  };
 
  render() {
    return <Sketch setup={this.setup} draw={this.draw} mousePressed={e => this.clickPoint(e) } keyPressed={e => {this.tryDelete(e)}} keyTyped={e => this.typeKey(e)}  />;
  }
}

function weightToColor(weight) {

  if (weight < 80) { 
    return "green"
  } 
  
  if (weight < 90) {
    return "blue"
  } 
  
  if(weight < 100) {
    return "pink"
  } 
  
  if(weight < 110) {
    return "purple"
  } 
  
  if(weight < 120) {
    return "orange"
  } 
  if(weight < 130) {
    return "maroon"
  } 
    return "red"

}