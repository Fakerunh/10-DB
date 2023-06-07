class Rectangle {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    square() {
        return this.a * this.b;
    }
}

let rect1 = new Rectangle(2, 4);
let rect2 = new Rectangle(3, 8);

console.log(rect1.square());

class Triangle {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    perimeter() {
        return this.a + this.b + this.c;
    }
}
let tri1 = new Triangle(3, 4, 5);

console.log(tri1.perimeter());