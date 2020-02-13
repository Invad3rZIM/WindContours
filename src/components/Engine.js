//flexible engine designed to host any set of points a 2D map, will work with both floats and integers for (XY) coordinates
//modelling off 4-Quadrant graph
// 2 | 1
//-------
// 3 | 4

export default class Engine {
    constructor(rows, cols) {
        this.rows = rows
        this.cols = cols
        this.lines = new Map()
        this.points = new Map()
        this.peaks = new Map()
        this.totalPoints = 0
        this.target = undefined
        this.targetSolution = []
    }

    /*
    deriveBounds = (rows, cols, maxDepth) => {
        let all = new Map

        this.deriveBoundsHelper(all, "", 0, 0, rows, cols, maxDepth)

        return all
    }

    deriveBoundsHelper = (all, str, minRow, maxRow, minHeight, maxHeight, depth) => {
        if (str.length == depth) {
            all.set(str, )
        }
    }*/

    logPoints = () => {
        for(let p of this.points.keys()) {
            console.log(p, this.points.get(p))
        }
    }

    renderPoints = (p5) => {
        for(let p of this.points.values()) {
            p5.ellipse(p.col,p.row,  6, 6)
            p5.text(p.power, p.col, p.row)
          }
    }

    renderTarget = (p5) => {
        if(this.target != undefined) {
            p5.fill("#006992")
            p5.stroke("#006992")
            p5.ellipse(this.target.col,this.target.row,  8, 8)
        }
    }

    outputSimulation = () => {
        let X = []

        for(let P of this.points.values()) {
            X.push(P.row + " " + P.col + " " + P.power + " " + P.pointid + " " + P.lineid)
        }

        console.log(X)
    }

    //simulates predefined line input and returns the new lineid start...
    simulateInput = (arr) => {
        let lineCount = 0

        for(let A of arr) {
            let strs = A.split(" ")

            let lineID = parseInt(strs[4])

            this.addPoint(parseInt(strs[0]), parseInt(strs[1]), parseInt(strs[2]), lineID)
        
            if(lineID > lineCount) {
                lineCount = lineID
            }
        }
        return lineCount + 1
        
    }

    renderLines = (p5) => {
        for(let l of this.lines.values()) {
            let lastP = undefined
            for(let p of l) {
              //  p5.ellipse(p.row, p.col, 6,6 )
                if(lastP != undefined) {
                    p5.line(p.col, p.row, lastP.col, lastP.row)
                }

                p5.text(p.power,  p.col, p.row)

                lastP = p
            }
          }
    }

    rendertargetSolution = (p5) => {
        for(let S of this.targetSolution) {
            if(S.type == "point") {
           //     p5.line(S.col, S.row, this.target.col, this.target.row)

                let D = Math.floor(S.distance * 100 + .5 ) / 100
                p5.text(D, S.col,S.row +20)

                let T = Math.floor((-1 *S.theta/Math.PI * 180+360)%360 * 100 + .5) / 100
                p5.text(T, S.col, S.row + 40)
            }

                p5.stroke("purple")
                p5.strokeWeight(4)
            if(S.type == "segment") {
                p5.fill("#AA0022AA")
                p5.triangle(this.target.col, this.target.row, S.p1.col, S.p1.row, S.p2.col, S.p2.row)
            }

            p5.stroke("black")
            p5.strokeWeight(1)
        }
    }

    computeTargetSolution = () => {
        if(this.target == undefined) {
            return
        }

        let S = []

        for(let p of this.points.values()) {

            let D = theta(this.target.col, this.target.row, p.col, p.row)
            S.push({row:p.row, col:p.col, type: "point", theta: D, distance : distance(this.target.col, this.target.row, p.col, p.row)})
        }

        let vectors = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]
        let closest = new Map()

        for(let l of this.lines.values()) {
            let lastPoint = undefined

            for(let p of l) {
                if(lastPoint != undefined) {
                    for(let v of vectors) {
                        if(collisionIsInbounds(this.target, lastPoint, p,v )) {
                            let B = {p1:lastPoint, p2:p, type:"segment"}
                            S.push(B)
                            let key = v[0] + ":" + v[1]
                            let distance = distance(this.target.col, this.target.row, th)
                      //      if(closest.has(key)) {
                        //        let C = closest.get(key)
                                

                           //     if(C[1] == undefined) {
                         //           if(C[0] > )
                             //   }
                       //     }
                        }
                    }
                }

                lastPoint = p
            }
        }



        this.targetSolution = S

    }

    addTarget = (r, c ) => {
        this.target = {row: r, col: c}
        this.computeTargetSolution()
    }

    addPoint = (r,c, power, lineid = -1) => {
        let pointid = this.totalPoints

        let p = {row:r,col:c,power:power, pointid:pointid, lineid:lineid}
        this.totalPoints += 1

        this.points.set(pointid, p)

        if (lineid == -1) {
            this.peaks.set(pointid, p)
        } else {
            if(this.lines.has(lineid)) {
                this.lines.get(lineid).push(p)
            } else {
                this.lines.set(lineid, [p])
            }
        }
        this.computeTargetSolution()
    }
}

function distance(x1, y1, x2, y2) {
    return Math.pow( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2), .5)
}

function theta(x1, y1, x2, y2) {
    return Math.atan2(y2-y1,x2-x1 )

}

function collisionIsInbounds(p0, p1, p2, v) {
    let x0 = p0.col
    let x1 = p1.col
    let x2 = p2.col
    let y0 = p0.row, y1 = p1.row, y2 = p2.row

    let vmag = Math.pow(v[0] * v[0] + v[1] * v[1] , .5 )
    let vxh = v[0] / vmag
    let vyh = v[1] / vmag
    let t2 = ( vxh * (y0 - y1) + vyh * (x1 - x0) ) / ( (vxh * (y2 - y1) - vyh * (x2 - x1))) 

    let x12t2 = x1 + (x2 - x1) * t2
    let y12t2 = y1 + (y2 - y1) * t2

    let tx = x2 - x1
    let ty = y2 - y1

    let tmag = Math.pow(tx *tx + ty * ty, .5)

    let txh = tx / tmag
    let tyh = ty / tmag

    let dL = x1 * txh + y1 * tyh
    let dR = x2 * txh + y2 * tyh

    let dt = x12t2 * txh + y12t2 * tyh

    return dt >= dL && dt <= dR
}