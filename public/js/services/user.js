	app.factory ('UserFactory', function ($http, $q){
		var factory = {
			users : false,		
		getUsers : function(){
		var deferred = $q.defer();
		if(factory.users ==! false){
		deferred.resolve(factory.users);
		}else{
		$http.get('assets/json/users.json')
		.success(function(data, status){
			factory.users = data;
			deferred.resolve(factory.users);
			}).error(function(data, status){
				deferred.reject('erreur');
			});
		}
		return deferred.promise;
		},
		getUser : function (id){
		var deferred = $q.defer();
		var users = {};
		var users = factory.getUsers().then(function(users){
			angular.forEach(factory.users, function(value, key){
			if(value.id == id){
				user = value
				}
				});
				deferred.resolve(user);
			}, function(msg){
			deferred.reject(msg);
	})
		return deferred.promise;
		},
        add : function (tab){
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }
		};
		return factory;
	})
	