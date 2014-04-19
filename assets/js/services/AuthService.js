angular.module("TaskBoardServices")
    .factory('Auth',
        [
            "$http", "$cookieStore",
            function($http, $cookieStore) {
                var currentUser = $cookieStore.get('user') || null;

                $cookieStore.remove('user');

                function changeUser(user) {
                    angular.extend(currentUser, user);
                }

                return {
                    authorize: function(accessLevel, role) {
                        if(role === undefined) {
                            role = currentUser.role;
                        }

                        return true;
                    },
                    isLoggedIn: function(user) {
                        if (user === undefined) {
                            user = currentUser;
                        }

                        return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
                    },
                    register: function(user, success, error) {
                        $http.post('/register', user).success(function(res) {
                            changeUser(res);
                            success();
                        }).error(error);
                    },
                    login: function(user, success, error) {
                        $http.post('/login', user).success(function(user){
                            changeUser(user);
                            success(user);
                        }).error(error);
                    },
                    logout: function(success, error) {
                        $http.post('/logout').success(function(){
                            changeUser({
                                username: '',
                            });
                            success();
                        }).error(error);
                    },

                    user: currentUser
                };
            }
        ]
    );
