p2GoApp.directive('counter', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            function counter(t,n) {
                this.target = n;
                this.max = t;
                this.interval = t / 100;
                this.current = 0;
                var i = this;
                this.increment = function () {
                    i.target.text((i.current += i.interval).toFixed(2));
                    i.current < i.max ? setTimeout(i.increment, 10) : i.target.text(i.max.toFixed(2));
                };
                setTimeout(i.increment, 50);
            }

            scope.$watch(function () {
                return ngModel.$modelValue;
            }, function (v) {
                if (ngModel.$modelValue) {
                    new counter(parseFloat(ngModel.$modelValue), elem);
                }
            });        
        }
    };
}]);