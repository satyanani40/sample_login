angular.module('weberApp')
.directive('cancelrequest', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
            console.log("sdfsdf")
            element.click(function(){
               console.log('sdfsd')
               var html ='<addfriend><button ng-click="cancelrequest()" class="btn btn-primary">cancel request</button></addfriend>';
               var e =$compile(html)(scope);
               element.replaceWith(e);
            });

        }
    };
}).directive('addfriend', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {

            element.click(function(){
               alert('in directive')
               var html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
               var e =$compile(html)(scope);
               element.replaceWith(e);
            });

        }
    };
})
.directive('friends', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
            element.click(function(){
               var html ='<b>friends</b>';
               var e =$compile(html)(scope);
               element.replaceWith(e);
            });

        }
    };
})
.directive('unfriend', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
            element.click(function(){
               var html ='<addfriend><button ng-click="unfriend()" class="btn btn-primary">unfriend</button></addfriend>';
               var e =$compile(html)(scope);
               element.replaceWith(e);
            });

        }
    };
});
