/**
 * Directive to make 'action menu' to specified item in DOM. Usage example:
 *
 *  <div id="actionMenu_{{project.id}}" data-action-menu>
 *      <ul class="action-menu">
 *          <li><a data-ng-click="openProjectEdit(project.id)"><i class="fa fa-wrench"></i>Edit project</a></li>
 *          <li class="divider"></li>
 *          <li><a class="text-danger" data-ng-click="deleteProject(project.id)"><i class="fa fa-trash-o"></i>Delete project</a></li>
 *      </ul>
 *  </div>
 *
 * Basically this directive will replace above HTML with following one:
 *
 *  <i id="actionMenu_{{project.id}}" class="fa fa-angle-down btn btn-default" data-qtip-options="some options"></i>
 *
 * Directive uses 'qTip' directive to make actual action menu effect.
 */
(function() {
    'use strict';

    angular.module('Taskboard.directives')
        .directive('actionMenu', function() {
            return {
                restrict: 'A',
                transclude: true,
                replace: true,
                templateUrl: '/Taskboard/partials/Directives/ActionMenu.html',
                link: function(scope, element, attributes) {
                    scope.id = attributes.id;
                }
            };
        }
    );
}());
