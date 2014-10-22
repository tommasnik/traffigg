var FPS = 55;

angular.module('todoApp', []).controller('TodoController', function($scope, $interval) {
    $scope.cars = [
        new Car(1, 100, 100),
        new Car(2, 400, 80),
        new Car(3, 800, 50)
    ];

    $scope.selectCar = function(car) {
        _.each($scope.cars, function(c) {
            c.selected = false;
        })
        car.selected = true;
        $scope.selectedCar= car;
    }

    $interval(function() {
        _.each($scope.cars, function(car) {
            car.updatePosition($scope.cars);
        });
    }, 1000 / FPS);
});

var SAFE_GAP = 40;

var Car = function(id, x, maxSpeed) {
    this.maxSpeed = maxSpeed;
    this.width = 50;
    this.selected = false;
    this.maxDecceleration = 3;

    this.id = id;
    this.speed = Math.random() * this.maxSpeed;
    this.position ={
        x: x,
        y: 100
    };

    this.deccelerate = function(carAhead) {
        var gap = carAhead.position.x - this.position.x - this.width;

        if (gap < SAFE_GAP) {
            this.speed -= (1 - (gap / SAFE_GAP)) * this.maxDecceleration;
        }

        if (this.speed < 0) {
            this.speed = 0;
        }

        this.deccelerating = true;
    };

    this.accelerate = function() {
        this.speed += (1 - this.speed / this.maxSpeed);
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        this.deccelerating = false;
        this.accelerating = true;
    };

    this.updateSpeed = function(cars) {
        var nextX = this.position.x + this.speed / FPS;


        var carsAhead = carsAt(nextX, cars, this);
        if (carsAhead.length) {
            this.deccelerate(carsAhead[0]);
        } else {
            this.accelerate();
        }

        if (this.speed === this.maxSpeed) {
            this.accelerating = false;
        }
    };

    this.updatePosition = function(cars) {
        this.updateSpeed(cars);

        this.position.x += this.speed / FPS;
    }

    this.getSpeed = function() {
        return Math.floor(this.speed);
    }
};

function carsAt(positionX, cars, carToIgnore) {
    var carFromPositionX = positionX + carToIgnore.width;
    return _.filter(cars, function(car) {
        if (car.id === carToIgnore.id) {
            return false;
        }

        return car.position.x > positionX && car.position.x < carFromPositionX + SAFE_GAP;
    });
}