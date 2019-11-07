import { Point, Size } from "./cocoa/index";
import { Color } from "./platform/CCTypes";


export interface CCDrawingPrimitive {
    drawPoint(point: Point, size?: number): void;
    drawPoints(points: Array<Point>, numberOfPoints: number, size?: number):void;
    drawLine(origin: Point, destination: Point): void;
    drawRect(origin: Point, destination: Point):void
    drawSolidRect(origin: Point, destination: Point, color:Color):void
    drawPoly(vertices: Array<Point>, numOfVertices: number, closePolygon: boolean, fill?: boolean): void;
    drawSolidPoly(polygons: Array<Point>, numberOfPoints: number, color: Color): void;
    drawCircle(center: Point, radius: number, angle: number, segments: number, drawLineToCenter: boolean): void;
    drawQuadBezier(origin: Point, control: Point, destination: Point, segments:number): void;
    drawCubicBezier(origin: Point, control1: Point, control2: Point, destination: Point, segments:number): void;
    drawCatmullRom(points: Array<Point>, segments: number): void;
    drawCardinalSpline(config: Array<Point>, tension:number, segments:number): void;
    drawImage(image: HTMLImageElement | HTMLCanvasElement, sourcePoint: Point, sourceSize: Size, destPoint: Point, destSize: Size): void;
    fillText(strText: string, x: number, y: number):void;
    setDrawColor(r: number, g: number, b: number, a: number): void;
    setPointSize(pointSize: number): void;
    setLineWidth(width: number): void;
}