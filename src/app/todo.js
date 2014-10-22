var FPS = 40;

var SAFE_GAP = 20;
var ids = 0;

angular.module('todoApp', []).controller('TodoController', function($scope, $interval) {
    $scope.cars = [
        new Car(100, 100),
        new Car(400, 80),
        new Car(600, 50),
        new Car(700, 57),
        new Car(200, 80),
        new Car(300, 90),
        new Car(350, 90),
        new Car(390, 90),
        new Car(450, 90),
        new Car(770, 50)
    ];

    $scope.safeGap = SAFE_GAP;

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

    $interval(function() {
        $scope.cars.push(new Car(100, 90));
    }, 3300);

    $scope.calculateY = function(car) {
        return car.position.y + Math.floor(car.position.x/1000) * 50;
    }
});

var Car = function(x, maxSpeed) {
    this.maxSpeed = maxSpeed;
    this.width = 20;
    this.height = 12;
    this.selected = false;
    this.maxDecceleration = 5;
    this.debug = {};

    this.id = ++ids;
    this.speed = Math.random() * this.maxSpeed;
    this.position = {
        x: x,
        y: 100
    };

    this.deccelerate = function(carAhead) {
        var gap = carAhead.position.x - this.position.x - this.width;

        if (gap > SAFE_GAP * 2) {
            this.accelerate();
        }
        else if (carAhead.speed >= this.speed && gap >= SAFE_GAP) {
            return;
        }
        else if (gap < 2 * SAFE_GAP) {
            this.speed -= (2 - (gap / SAFE_GAP)) * this.maxDecceleration;
        }
        else if (gap < SAFE_GAP) {
            this.speed -= this.maxDecceleration;
        }
        if (this.speed < 0) {
            this.speed = 0;
        }
    };

    this.accelerate = function() {
        this.speed += Math.round((1 - this.speed / this.maxSpeed) * 100) / 100;
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
    };

    this.updateSpeed = function(cars) {
        var oldSpeed = this.speed;

        var carAhead = getCarAhead(cars, this);

        if (!carAhead) {
            this.accelerate();
        }
        else {
            this.deccelerate(carAhead);
        }

        this.debug.speedChange = Math.floor((this.speed - oldSpeed) * 100) / 100;
        this.debug.pokus = 'pokus';

        this.accelerating = this.speed > oldSpeed;
        this.deccelerating = this.speed < oldSpeed;
    };

    this.updatePosition = function(cars) {
        this.updateSpeed(cars);

        this.position.x += this.speed / FPS;
    }
};

function getCarAhead(cars, checkedCar) {
    var carsAhead = _.filter(cars, function(car) {
        if (car.id === checkedCar.id) {
            return false;
        }
        return car.position.x > checkedCar.position.x;
    });
    if (!carsAhead.length) {
        return null;
    }
    var result = _.min(carsAhead, function(c) {
        return c.position.x;
    });
    return  result;
}