angular.module('ngMaterialApp', ['ngMaterial'])
.config(['$provide', function($provide){
     $provide.decorator('mdSidenavDirective', ['$delegate', '$controller', '$rootScope',
        function ($delegate, $controller, $rootScope) {
            var directive = $delegate[0];

            var compile = directive.compile;

            directive.compile = function (tElement, tAttrs) {
                var link = compile.apply(this, arguments);
                return function (scope, elem, attrs) {

                    scope.$watch('isOpen', function (val) {
                        if (val) {
                            $rootScope.$broadcast('$mdSideNavOpen_' + scope.$$mdHandle);
                        }
                        else {
                            $rootScope.$broadcast('$mdSideNavClose_' + scope.$$mdHandle);
                        }

                    });

                    link.apply(this, arguments);
                };
            };

            return $delegate;
        }]);
}])

.filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
})
.factory("$mdHeader", ['$rootScope', '$location', function ($rootScope, $location) {

    var controlObj = {
        title: "Application",
        backTitle: 'Back',
        isBack: false,
        ischild: false,
        setTitle: function (title) {
            this.title = title;
            $rootScope.$broadcast('$_titleUpdate', title);
        },
        navTo: function (route, title) {

            this.resetActions([]);
            this.isBack = true;
            this.backTitle = title;
            $location.path(route);
            $rootScope.$broadcast('$_navUpdate', { route: route, title: title });

        },
        startWork: function () {
            $rootScope.$broadcast('$_startWork');
        },
        stopWork: function () {
            $rootScope.$broadcast('$_stopWork');
        },
        isChild: function () {
            $rootScope.$broadcast('$_ischild');
            this.ischild = true;
        },
        resetActions: function (actions) {
            $rootScope.$broadcast('$_resetactions', actions);
        }

    };

    return controlObj;
}])


.directive('appHeader', ['$log', '$mdHeader', '$location',
    function ($log, $mdHeader, $location) {
        return {
            //templateUrl: '/app/directives/appHeader.html',
            template:
              (function () {/*          
<div>
    <div class="md-actions-desktop " hide-gt-sm>
        <md-button ng-show="action.ngShow" class="md-fab md-primary" aria-label="{{action.title}}" ng-repeat="action in actions" ng-click="action.ngClick()">
            <i class="fa {{action.icon}}"></i>
        </md-button>

    </div>

    <md-toolbar class="main-menu md-theme-indigo">
        <div layout="row" flex="" class="fill-height">

            <div class="md-toolbar-tools title">
                <div class="main-item md-toolbar-item " layout="row">
                    <a href="#" ng-click="hamburgerClick(); $event.preventDefault();">
                        <div class="material-icon hamburger" ng-if="menuitems.length > 0" ng-class="{ arrow : isback, uparrow: menuopen }">
                            <span class="first"></span>
                            <span class="second"></span>
                            <span class="third"></span>
                        </div>

                        <div class="material-icon noburger" ng-if="menuitems.length == 0" ng-class="{ arrow : isback }">
                            <span class="first"></span>
                            <span class="second"></span>
                            <span class="third"></span>
                        </div>

                    </a>
                    <!--<md-button class=""><i class="fa fa-bars"></i></md-button>-->

                </div>
                <div class="title-slider">
                    <h1 ng-transclude ng-class="{'show-title' : !isback }" class="main-branding"></h1>
                    <h1 class="back-branding" ng-class="{'show-title' : isback }">{{backTitle}}</h1>
                </div>
            </div>
            <span flex></span>
            <div class="md-toolbar-tools md-tools md-actions " ng-class="{'searching' : searchInput }" hide-sm>



                <md-button ng-show="action.ngShow" class="right-item" ng-repeat="action in actions" ng-click="action.ngClick()">
                    <i class="fa {{action.icon}}"></i> {{action.title}}
                </md-button>

                <form ng-submit="search()" class="header-search right-item" ng-class="{'search-input' : searchInput }">
                    <input type="text" name="q" ng-model="$query" autocomplete="off" />
                    <button type="button" ng-click="search()"><i class="fa fa-search"></i></button>
                </form>
            </div>

        </div>

      



    </md-toolbar>

    <md-sidenav class="md-sidenav-left md-whiteframe-z2" md-component-id="left" >
        <md-toolbar class="md-theme-indigo">
            <h1 class="md-toolbar-tools sidenav-back-button">
                <a href="#" ng-click="hamburgerClick(); $event.preventDefault();">
                    <i class="fa fa-arrow-left"></i> Back
                </a>
            </h1>
        </md-toolbar>

        <md-content flex>
            <ul class="sub-menu">
                <li ng-repeat="item in menuitems | reverse" class="menu-item">
                    <a href="#" ng-click="menuItemClick( item.ngClick); $event.preventDefault();">
                        
                            {{item.title}}
                        
                    </a>

              
                </li>
            </ul>
        </md-content>

   

         
       
    </md-sidenav>
    <div class="main-menu-buffer"></div>
    
    <div class="main-shade" ng-if="working">


        <div class="shade" layout="row" layout-align="center center">
            <md-progress-circular md-mode="indeterminate"></md-progress-circular>
        </div>

    </div>
</div>

            */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1],
            restrict: "E",
            scope: {
                //title: '=',
                onSearch: '&',
            },
            transclude: true,
            replace: true,
            controller: ['$rootScope', '$scope', '$element', '$timeout', '$mdSidenav', '$location', '$mdHeader',
                function ($rootScope, $scope, $element, $timeout, $mdSidenav, $location, $mdHeader) {
                    var actions = $scope.actions = [];
                    var menuitems = $scope.menuitems = [];

                    $scope.title = $mdHeader.title;

                   


                    $rootScope.$on('$_titleUpdate', function (e, title) {

                        $scope.backTitle = title;


                    });


                    $rootScope.$on('$_resetactions', function (e, act) {

                        $scope.actions = act;


                    });


                    $rootScope.$on('$_ischild', function () {


                        $scope.setBack('Loading...');

                    });

                    $scope.working = false;

                    $rootScope.$on('$_startWork', function () {
                        $scope.working = true;
                    });


                    $rootScope.$on('$_stopWork', function () {
                        $scope.working = false;
                    });

                    $rootScope.$on('$_navUpdate', function (e, obj) {
                        $scope.actions = [];
                        $scope.searchInput = false;
                        $location.path(obj.route);
                        $scope.isback = true;
                        $scope.menuopen = false;
                        $scope.backTitle = obj.title;


                    });


                    $rootScope.$on('$mdSideNavClose_left', function () {

                        $scope.menuopen = false;
                    });

                    $scope.menuItemClick = function (event) {

                        $scope.menuopen = false;
                        $scope.searchInput = false;

                        $mdSidenav('left').close()
                                       .then(function () {
                                           $log.debug("toggle left is done");
                                       });
                        event();
                    }

                    $scope.openMenu = function () {
                        $scope.menuopen = true;
                        $scope.searchInput = false;
                        $mdSidenav('left').open()
                                         .then(function () {
                                             $log.debug("toggle left is done");
                                         });
                    }

                    $scope.closeMenu = function () {
                        $scope.menuopen = false;
                        $scope.searchInput = false;

                        $mdSidenav('left').close()
                                       .then(function () {
                                           $log.debug("toggle left is done");
                                       });


                    }

                    $scope.menuopen = false;

                    $scope.hamburgerClick = function () {
                        if ($scope.isback) {
                            $scope.back();
                        }
                        else if ($scope.menuopen) {
                            $scope.closeMenu();
                        }
                        else {
                            $scope.openMenu();
                        }
                    }

                    $scope.back = function () {
                        $scope.actions = [];
                        $scope.searchInput = false;
                        $scope.isback = false;
                        $scope.backTitle = '';
                        $location.path('/');
                        $scope.working = false;
                    }


                    $scope.isback = false;
                    $scope.setBack = function (newtitle) {
                        $scope.searchInput = false;
                        $scope.isback = true;
                        $scope.backTitle = newtitle;
                    }

                    this.addAction = function (action) {

                        $scope.actions.push(action);
                    }

                    this.addMenuItem = function (item) {

                        menuitems.push(item);
                    }

                    $scope.$query = '';

                    $scope.searchInput = false;
                    $scope.search = function () {
                        if ($scope.searchInput) {
                            if ($scope.$query.length > 0) {
                                $rootScope.$broadcast('$search', $scope.$query);
                            }

                            $scope.searchInput = false;
                        }
                        else {
                            $scope.$query = '';
                            $scope.searchInput = true;
                            //angular.element('.header-search').find('input').select();
                            $timeout(function () {
                                var input = document.getElementsByClassName('header-search')[0].getElementsByTagName('input')[0];
                                input.focus();
                                input.select();
                            }, 2);
                        }
                    }
                    if ($mdHeader.ischild) {
                        $scope.setBack('Loading...');
                    }

                    $rootScope.$broadcast('$_headerloaded');

                }],

            link: function (scope, element, attrs, controller) {

            }
        };
    }])

.directive('appTitle', function () {
    return {
        require: '^appHeader',
        restrict: 'E',
        transclude: true,
        scope: {},
        link: function (scope, element, attrs, appHeader) {
            //tabsCtrl.addPane(scope);
        },
        template:
          '<div ng-transclude>' +
          '</div>',
        replace: true
    };
})


.directive('appActions', function () {
    return {

        restrict: 'E',

        scope: {},
        controller: ['$rootScope', '$scope', '$element', '$timeout', '$mdSidenav', '$location', '$mdHeader',
           function ($rootScope, $scope, $element, $timeout, $mdSidenav, $location, $mdHeader) {
               var actions = $scope.actions = [];
               this.addAction = function (action) {

                   actions.push(action);

                   

                   $mdHeader.resetActions(actions);

               }

               $rootScope.$on('$_headerloaded', function () {
                   $mdHeader.resetActions(actions);
               });

           }],
        link: function (scope, element, attrs, appHeader) {

            //scope.itemClick = function () {
            //    console.log('Item click');
            //    scope.ngClick();
            //}

            //appHeader.addAction(scope);





            //tabsCtrl.addPane(scope);
        },

        replace: true
    };
})

.directive('appAction', function () {
    return {
        require: '^appActions',
        restrict: 'E',

        scope: { title: '@', icon: '@', ngShow: '=', ngClick: '&' },
        link: function (scope, element, attrs, appActions) {

            //scope.itemClick = function () {
            //    console.log('Item click');
            //    scope.ngClick();
            //}

            appActions.addAction(scope);





            //tabsCtrl.addPane(scope);
        },

        replace: true
    };
})


.directive('appMenu', function () {
    return {
        require: '^appHeader',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {},
        controller: ['$rootScope', '$scope', '$element', '$timeout',
           function ($rootScope, $scope, $element, $timeout) {
               var actions = $scope.actions = [];


               $scope.add = function (item) {
                   actions.push(item);
               }

           }],
        link: function (scope, element, attrs, controller, appHeader) {

            appHeader.menu = scope;
        },

        //replace: true
    };
})

.directive('menuItem', function () {
    return {
        require: '^appHeader',
        restrict: 'E',
        //transclude: true,
        //replace: true,
        scope: { title: '@', ngClick: '&', icon: '@', ngShow: '=' },
        link: function (scope, element, attrs, appMenu) {
            appMenu.addMenuItem(scope);

        },

        //replace: true
    };
});


